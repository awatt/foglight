'use strict';

angular.module('foglightApp')
.directive('countyMap', ['d3Service', 'counties', 'diabetes', 'payments', 'grants', 'totals', function(d3Service, counties, diabetes, payments, grants, totals) {
	return {
		restrict: 'EA',
		scope: {
			countyinfo: '=',
			onCountyClick: '&',
			dataset: '=',
			bins: '='
		},

		link: function (scope, element, attrs) {

			d3Service.d3().then(function(d3){

				var width = 960,
				height = 600,
				buckets = 9,
				colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
				// colors = ["#fcd6d6","#f5c5c5","#eea9a9","#e48686","#db5e5e","#d13737","#c91919","#a70000"],
				// colors = ["rgb(247,251,255)","rgb(222,235,247)","rgb(198,219,239)","rgb(158,202,225)","rgb(107,174,214)","rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)"],
				dataSets = {'diabetes': diabetes,'payments': payments, 'grants': grants, 'totals': totals};

				var frameWidth = d3.select('#countyMap')[0][0].clientWidth,
				margin = (frameWidth-width/2);

		        //tooltip template
		        var tooltip = d3.select('body').append('div')
		        .style('position', 'absolute')
		        .style('padding', '0 10px')
		        .style('background', 'black')
		        .style('color', 'white')
		        .style('opacity', 0)
		        .style('font-size', '1.25rem')

				var projection = d3.geo.albersUsa()
				.scale(1280)
				.translate([width / 2, height / 2]);

				var path = d3.geo.path()
				.projection(projection);

				var svg = d3.select('[id="countyMap"]').append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("transform", 
						"translate(" + margin + "," + 0 + ")")
				.append("g")
				.attr("class", "counties")

				var us = counties;

				var renderMap =  function(data){

				var rateById = d3.map();
				var nameById = d3.map();

				for (var i = 0, max = data.length; i < max; i++){
					var d = data[i];
					rateById.set(d.id, +d.rate)
					nameById.set(d.id, d.name + ', ' + d.state)
				}

				var colorScale = d3.scale.quantile()
				// .domain([d3.min(data, function (d){ if(d.rate) return d.rate; }), buckets-1, d3.max(data, function (d){ return d.rate; })])
				.domain([0, buckets - 1, d3.max(data, function (d){ return d.rate; })])
				.range(colors)

				var counties = svg.selectAll("path")
				.data(topojson.feature(us, us.objects.counties).features)

				counties.enter().append("path")
			  	.attr("d", path)
			  	.attr("class", "county")
			  	.attr("data-toggle", "modal")
			  	.attr("data-target", "#sankeyModal")
			  	.style("fill", colors[0]);

			  	counties.transition().duration(1000)
			  	.style("fill", function(d) { if (rateById.get(d.id)) {return colorScale(rateById.get(d.id))} else {return 0}; });

			  	// .attr("class", function(d) { var quantized = colorScale(rateById.get(d.id)); return quantized })

			  	counties.exit().remove();

			  	svg.append("path")
				.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
				.attr("class", "states")
				.attr("d", path);

				// County Specific Tooltip
				d3.selectAll('.county')
				.on('mouseover', function(d) {
					var countyState = nameById.get(d.id);
					var state = countyState.split(", ")[1];
					var value = rateById.get(d.id);

					d3.select(this).style('opacity', 0.7)
					tooltip.transition()
					.style('opacity', .9)
					tooltip.html([countyState, value].join(': '))
				})
				.on('mousemove',function(d){
					tooltip
					.style('left', (d3.event.pageX - 40) + 'px')
					.style('top', (d3.event.pageY - 30) + 'px')
				})
				.on('mouseout', function(d) {
					d3.select(this)
					.style('opacity', .8)
					tooltip.transition().duration(500)
					.style('opacity', 0)
				})
				.on('click', function(d) {
					
					//drop previous countySankey charts
					var parent = d3.selectAll(".chartParent");
					parent.each(function(d,i) {            
						d3.selectAll(this.childNodes).remove();
					});

					//update scope for full name of queried county
					var countyState = nameById.get(d.id);
					scope.countyinfo = countyState;
					scope.bins = [];
					scope.onCountyClick({FIPS: d.id, county: countyState});
				})
			}

				renderMap(dataSets['diabetes']);

			      d3.select(self.frameElement).style("height", height + "px");

			      scope.$watch("dataset", function(newVal, oldVal){
			      	if(newVal !== oldVal){
			      		renderMap(dataSets[newVal]);
			      	}
			      })

		//close d3 service CB function
	})

		//close link function
	}

    //close return object    
}

    //close main directive CB function
}]);
