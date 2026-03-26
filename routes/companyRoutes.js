const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middlewares/isAuthenticated');
const companyController = require('../controllers/companyController');
const upload = require('../middlewares/multer'); 
router.post(
  '/register',
  isAuthenticated,
  upload.single("file"),   
  companyController.register
);


router.get('/get', isAuthenticated, companyController.getCompany);
router.get('/getAll', isAuthenticated, companyController.getAllCompany);
router.get('/getById/:id', isAuthenticated, companyController.getCompanybyId);

router.put(
  '/update/:id',
  isAuthenticated,
  upload.single("file"),   
  companyController.update
);

module.exports = router;