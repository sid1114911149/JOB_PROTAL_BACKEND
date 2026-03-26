const express=require('express');
const Router=express.Router();
const isAuthenticated=require('../middlewares/isAuthenticated');
const jobController=require('../controllers/jobController');

Router.post('/postJob',isAuthenticated,jobController.postJob);
Router.get('/getAllJobs',jobController.getAllJobs);
Router.get('/getJobById/:id',isAuthenticated,jobController.getJobById);
Router.get('/getJobByIdNotLogged/:id',jobController.getJobByIdNotLogged);
Router.get('/AdminJobs',isAuthenticated,jobController.AdminJobs);

module.exports= Router