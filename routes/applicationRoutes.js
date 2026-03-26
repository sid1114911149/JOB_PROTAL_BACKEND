const express=require('express');
const Router=express.Router();
const isAuthenticated=require('../middlewares/isAuthenticated');
const applicationController=require('../controllers/applicationController');

Router.post('/apply/:id',isAuthenticated,applicationController.applyJob);
Router.get('/getAppliedJobs',isAuthenticated,applicationController.getAppliedJobs);
Router.get('/getApplicants/:id',isAuthenticated,applicationController.getApplicants);
Router.put('/update/:id',isAuthenticated,applicationController.updateStatus);

module.exports= Router