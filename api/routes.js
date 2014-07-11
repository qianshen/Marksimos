var decisionController = require('./controllers/decision.js');
var chartController = require('./controllers/chart.js');
var reportController = require('./controllers/report.js');
var initController = require('./controllers/init.js');
var decisionPageController = require('./controllers/decisionPage.js');
var userController = require('./controllers/user.js');
var adimnController = require('./controllers/admin.js');

var util = require('util');
var express = require('express');
var sessionOperation = require('../common/sessionOperation.js');
var authMiddleware = require('../middleware/auth.js');

var config = require('./config.js');

var apiRouter = express.Router();

apiRouter.post('/api/register', userController.register);
apiRouter.post('/api/login', userController.login);

//all the API below need req.session.loginStatus to be true
apiRouter.use(function(req, res, next){
    if(sessionOperation.getLoginStatus(req)){
        next();
    }else{
        res.send(400, {message: 'Login required.'});
    }
})

//report
apiRouter.get('/api/report/:report_name', reportController.getReport);
apiRouter.get('/api/adminreport/:report_name', reportController.getReport);


apiRouter.get('/api/init', initController.init);

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


apiRouter.post('/api/distributor', authorize('addDistributor'), adimnController.addDistributor);
apiRouter.put('/api/distributor/:user_id', authorize('updateDistributor'), adimnController.updateDistributor);

/**
* @param {String} resource identifier of url
*/
function authorize(resource){
    var authDefinition = {};
    authDefinition[config.role.admin] = [
        'addDistributor', 
        'updateDistributor', 
        'addFacilitator',
        'updateFacilitator'
    ];
    authDefinition[config.role.distributor] = [];
    authDefinition[config.role.facilitator] = [];
    authDefinition[config.role.student] = [];
    
    return function authorize(req, res, next){
        var role = sessionOperation.getUserRole(req);
        if(authDefinition[role].indexOf(resource) > -1){
            next();
        }else{
            res.send(403, {message: 'You are not authorized.'});
        }
    }
}


module.exports = apiRouter;
   
