'use strict';

var _ = require('lodash');
var Payment = require('./payment.model');


// Get a list of payments by FIPS
exports.findByFIPS = function(req, res) {
  Payment.find({ recipient_FIPS: req.params.FIPS }).exec(function(err, payments) {
    if(err) {return handleError(res, err); }

    

  //   Payment.find({ recipient_FIPS: req.params.FIPS }).exec(function(err, payments) {
  //   if(err) {return handleError(res, err); }
  //     return res.json(200, payments);
  // });



      return res.json(200, payments);
  });
};

exports.recipientStatsByFIPS = function(req, res) {
  var o = {};
  o.map = function(){ emit(this.recipient_profile_ID, this.amount_USD); };
  o.reduce = function(recipient_profile_ID, amount_USD){return Array.sum(amount_USD);};
  o.query = { recipient_FIPS: req.params.FIPS };

  Payment.mapReduce(o, function (err, results) {
    if(err) {return handleError(res, err); }
    console.log("these are mapreduce results in the back end: ", results)
    return res.json(200, results);
})
};

// Get list of payments
exports.index = function(req, res) {
  Payment.find(function (err, payments) {
    if(err) { return handleError(res, err); }
    return res.json(200, payments);
  });
};

// Get a single payment
exports.show = function(req, res) {
  Payment.findById(req.params.id, function (err, payment) {
    if(err) { return handleError(res, err); }
    if(!payment) { return res.send(404); }
    return res.json(payment);
  });
};

// Creates a new payment in the DB.
exports.create = function(req, res) {
  Payment.create(req.body, function(err, payment) {
    if(err) { return handleError(res, err); }
    return res.json(201, payment);
  });
};

// Updates an existing payment in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Payment.findById(req.params.id, function (err, payment) {
    if (err) { return handleError(res, err); }
    if(!payment) { return res.send(404); }
    var updated = _.merge(payment, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, payment);
    });
  });
};

// Deletes a payment from the DB.
exports.destroy = function(req, res) {
  Payment.findById(req.params.id, function (err, payment) {
    if(err) { return handleError(res, err); }
    if(!payment) { return res.send(404); }
    payment.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}