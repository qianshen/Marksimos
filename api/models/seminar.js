var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

var seminarSchema = new Schema({
    seminarId: String,
    simulationSpan: Number,  //seminar有多少个round
    simulationVariant: String,
    targetMarket: String,
    teams: [],
    facilitatorId: String,
    isFinished: Boolean, //if this seminar is finished

    allResults: [],
    charts: [],
    reports: []
});

var teamSchema = new Schema({
    teamName: String,
    userIds: [String]
});

var Seminar = mongoose.model("Seminar", seminarSchema);


exports.getSeminarSetting = function(seminarId){
    var deferred = Q.defer();
    process.nextTick(function(){
        deferred.resolve({
            simulationSpan: 3,
            simulationVariant: 'FMCG',
            targetMarket: 'GENERIC'
        });
    });
    return deferred.promise;
}

exports.update = function(seminarId, seminar){
    var deferred = Q.defer();
    Seminar.update({seminarId: seminarId}, seminar)
    .exec(function(err, numAffected){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(numAffected);
        }
    });
    return deferred.promise;
}

exports.insert = function(seminarId, seminar){
    var deferred = Q.defer();
    Seminar.create(seminar, function(err){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(null);
        }
    });
    return deferred.promise;
}

exports.remove = function(seminarId){
    var deferred = Q.defer();
    Seminar.remove({seminarId: seminarId}, function(err){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve();
        }
    })
    return deferred.promise;
}

exports.clearExistedData = function(seminarId){
    var deferred = Q.defer();
    Seminar.update({
        seminarId: seminarId
    }, 
    {
        allResults: [],
        productPortfolio: [],
        charts: [],
        reports: []
    },
    function(err, numAffected){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(numAffected);
        }
    });
    return deferred.promise;
}

exports.getChartData = function(seminarId){
    var deferred = Q.defer();
    Seminar.findOne({seminarId: seminarId}, function(err, result){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(result.charts);
        }
    });
    return deferred.promise;
}

exports.findOne = function(seminarId){
    var deferred = Q.defer();
    Seminar.findOne({seminarId: seminarId}, function(err, result){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}





















