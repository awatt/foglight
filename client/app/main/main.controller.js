'use strict';

angular.module('foglightApp')
.controller('MainCtrl', function ($scope, $http, paymentStats, locator, recipientNames, $mdDialog) {

  $scope.countyfocus = 0;
  $scope.countyInfo = '';
  $scope.bins = [];
  $scope.isBins = {
    value: false
  };

  $scope.$watch("bins", function(newVal, oldVal){
    if(newVal.length){
      $scope.isBins.value = true;
    }
  })

  $('#sankeyModal').on('hidden.bs.modal', function (e) {
    $scope.isBins.value = false;
    $scope.bins = [];
  })

  //Angular Material Design Tabs
  $scope.data = {
    selectedIndex: 0,
    bottom: true
  };
  $scope.next = function() {
    $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
  };
  $scope.previous = function() {
    $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
  };


  //Angular Material Design - Input Dash - Test
  $scope.user = {
    state: 'AL',
    FIPS: '',
    physician: ''
  };

  $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
    'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
    'WY').split(' ').map(function(state) {
      return {abbrev: state};
    })

    $scope.counties;
    $scope.physicians;

    $scope.$watch("user.state", function(newVal, oldVal){
      if(newVal !== oldVal){
        $scope.counties = locator[newVal].map(function(county) {
          return {name: county.county, FIPS: county.FIPS};
        }).sort(function (a, b) {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        });
      }
    })

    $scope.$watch("user.FIPS", function(newVal, oldVal){
      if(newVal !== oldVal){

        recipientNames.query({FIPS: newVal}).$promise.then(function(physicians){

        // console.log("this is physicians returned from back end: ", physicians)

        $scope.physicians = physicians.map( function (physician) {
          return {
            value: physician.value.toLowerCase(),
            display: physician.value,
            profile_ID: physician._id
          };
        }).sort(function (a, b) {
          if (a.value > b.value) {
            return 1;
          }
          if (a.value < b.value) {
            return -1;
          }
          return 0;
        });
      })
      }
    })

  $scope.isDisabled = false;
  
  $scope.querySearch = function (query) {
    var results = query ? $scope.physicians.filter( createFilterFor(query) ) : $scope.physicians;
    return results;
  }

  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);
    return function filterFn(state) {
      return (state.value.indexOf(lowercaseQuery) === 0);
    };
  }
  
    $scope.showTabDialog = function(ev) {
      $mdDialog.show({
        controller: TabDialogController,
        templateUrl: 'app/main/tabDialog.tmpl.html',
        scope: $scope,        
        preserveScope: true,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });
    };

//md-dialog controller
})

function TabDialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}





