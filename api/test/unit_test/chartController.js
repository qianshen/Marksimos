var should = require('should');
var chartController = require('../../controllers/chart.js');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/Marksimos');

db.on('error', console.error.bind(console, 'connection error:'));

var req = {};
req.session = {};
req.params = {};

var res = {};

describe('/api/chart/:chart_name', function(){
    it('should return right data', function(done){
        req.session.seminarId = '10000';
        req.session.companyId = 1;

        req.params.chart_name = 'financial_report';

        res.send = function(status, data){
            status.should.be.empty;
            console.log(data);
            done();
        }
        
        chartController.getChart(req, res);
    })
})