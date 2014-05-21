var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var consts = require('../consts.js');
var Q = require('q');

var tOneBrandDecisionSchema = new Schema({
    seminarId: String,
    period: Number,
    d_BrandID       : Number,
    d_BrandName     : String,
    d_SalesForce    : Number,
    d_SKUsDecisions : [Number]  //Array of d_SKUID
});

var BrandDecision = mongoose.model('BrandDecision', tOneBrandDecisionSchema);

exports.remove =  function(seminarId){
    var deferred = Q.defer();
    BrandDecision.remove({seminarId: seminarId}, function(err){
        if(err){
            return deferred.reject(err);
        }else{
            return deferred.resolve(null);
        }
    });
    return deferred;
}

exports.save = function(decision){
    var deferred = Q.defer();
    var decision = new BrandDecision(decision);
    decision.save(function(err){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(null);
        }
    });
    return deferred.promise;
};

exports.findAll = function(seminarId){
    var deferred = Q.defer();
    BrandDecision.find({seminarId: seminarId}, function(err, result){
        if(err){
            return deferred.reject(err);
        }else{
            return deferred.resolve(result);
        }
    })
    return deferred.promise;
}
