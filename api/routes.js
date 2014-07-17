var decisionController = require('./controllers/decision.js');
var chartController = require('./controllers/chart.js');
var reportController = require('./controllers/report.js');
var initController = require('./controllers/init.js');
var decisionPageController = require('./controllers/decisionPage.js');
var userController = require('./controllers/user.js');
var distributorController = require('./controllers/distributor.js');
var facilitatorController = require('./controllers/facilitator.js');
var studentController = require('./controllers/student.js');
var seminarController = require('./controllers/seminar.js');

var util = require('util');
var express = require('express');
var sessionOperation = require('../common/sessionOperation.js');


var config = require('../common/config.js');

var apiRouter = express.Router();



/**********  API For Student  **********/

apiRouter.post('/api/register', userController.register);
apiRouter.get('/api/login', userController.login);


apiRouter.get('/api/create_admin', function(req, res, next){
    var userModel = require('./models/user.js');

    userModel.remove({role: config.role.admin})
        .then(function(){
            return userModel.register({
                name: 'hcdadmin',
                password: require('../common/utility.js').hashPassword('123456'),
                email: 'admin@hcdglobal.com',
                role: config.role.admin,
                isActivated: true
            });
        })
        .then(function(result){
            if(!result){
                return res.send(400, {message: "add admin failed."});
            }
            return res.send(result);
        })
        .fail(function(err){
            res.send(500, err);
        })
        .done();
});



//all the API below need req.session.loginStatus to be true

apiRouter.all("/api/*", function(req, res, next){
    if(sessionOperation.getLoginStatus(req)){
        next();
    }else{
        res.send(400, {message: 'Login required.'});
    }
});



//report
apiRouter.get('/api/report/:report_name', reportController.getReport);
apiRouter.get('/api/adminreport/:report_name', reportController.getReport);


apiRouter.get('/api/init', initController.init);
apiRouter.get('/api/runsimulation',  authorize('runSimulation'), initController.runSimulation);
apiRouter.get('/api/choose_seminar', authorize('chooseSeminar'), seminarController.chooseSeminar);
apiRouter.post('/api/assign_student_to_seminar', authorize('assignStudentToSeminar'), seminarController.assignStudentToSeminar);
apiRouter.post('/api/remove_student_from_seminar', authorize('removeStudentFromSeminar'), seminarController.removeStudentFromSeminar);


apiRouter.get('/api/submitdecision', decisionController.submitDecision);

//chart
apiRouter.get('/api/chart/:chart_name', chartController.getChart);



//make decision page
apiRouter.put('/api/sku/decision', decisionController.updateSKUDecision);
apiRouter.post('/api/sku/decision', decisionController.addSKU);
apiRouter.delete('/api/sku/decision', decisionController.deleteSKU);

apiRouter.put('/api/brand/decision', decisionController.updateBrandDecision);
apiRouter.post('/api/brand/decision', decisionController.addBrand);
apiRouter.delete('/api/brand/decision', decisionController.deleteBrand);

apiRouter.put('/api/company/decision', decisionController.updateCompanyDecision);


apiRouter.get('/api/company', decisionPageController.getDecision);
apiRouter.get('/api/product_portfolio', decisionPageController.getProductPortfolio);
apiRouter.get('/api/spending_details', decisionPageController.getSpendingDetails);
apiRouter.get('/api/future_projection_calculator/:sku_id', decisionPageController.getSKUInfo);
apiRouter.get('/api/company/otherinfo', decisionPageController.getOtherinfo);





/**********  API For Admin  **********/






apiRouter.post('/api/admin/distributors', authorize('addDistributor'), distributorController.addDistributor);
apiRouter.put('/api/admin/distributors/:distributor_id', authorize('updateDistributor'), distributorController.updateDistributor);
apiRouter.get('/api/admin/distributors', authorize('searchDistributor'), distributorController.searchDistributor);


apiRouter.post('/api/admin/facilitators', authorize('addFacilitator'), facilitatorController.addFacilitator);
apiRouter.put('/api/admin/facilitators/:facilitator_id', authorize('updateFacilitator'), facilitatorController.updateFacilitator);
apiRouter.get('/api/admin/facilitators', authorize('searchFacilitator'), facilitatorController.searchFacilitator);

apiRouter.get('/api/admin/facilitator/seminar', authorize('getSeminarOfFacilitator'), facilitatorController.getSeminarOfFacilitator);

apiRouter.post('/api/admin/students', authorize('addStudent'), studentController.addStudent);
apiRouter.put('/api/admin/students/:student_id', authorize('updateStudent'), studentController.updateStudent);
apiRouter.get('/api/admin/students', authorize('searchStudent'), studentController.searchStudent);





//get all seminars of the current student
apiRouter.get('/api/admin/student/seminar', authorize('getSeminarOfStudent'), studentController.getSeminarOfStudent);

apiRouter.post('/api/admin/seminar', authorize('addSeminar'), seminarController.addSeminar);



/**
* @param {String} resource identifier of url
*/
function authorize(resource){
    var authDefinition = {};
    authDefinition[config.role.admin] = [
        'addDistributor',
        'updateDistributor',
        'searchDistributor',

        'updateFacilitator',
        'searchFacilitator',

        'updateStudent',
        'searchStudent'
    ];
    authDefinition[config.role.distributor] = [
        'updateDistributor',

        'addFacilitator',
        'updateFacilitator',
        'searchFacilitator'
    ];
    authDefinition[config.role.facilitator] = [
        'updateFacilitator',

        'addStudent',
        'updateStudent',
        'searchStudent',

        'addSeminar',
        'chooseSeminar',

        'assignStudentToSeminar',
        'removeStudentFromSeminar',

        'getSeminarOfFacilitator',

        'runSimulation'
    ];
    authDefinition[config.role.student] = [
        'updateStudent',
        'chooseSeminar',
        'getSeminarOfStudent'
    ];
    
    return function authorize(req, res, next){
        var role = sessionOperation.getUserRole(req);

        //admin can do anything
        // if(role === config.role.admin){
        //     return next();
        // }

        if(authDefinition[role].indexOf(resource) > -1){
            next();
        }else{
            res.send(403, {message: 'You are not authorized.'});
        }
    }
}


module.exports = apiRouter;
   
