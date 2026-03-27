const express = require('express');
const router = express.Router();
const path = require('path');

const isAuthenticated = require('../middlewares/isAuthenticated');
const userController = require('../controllers/userController');
const upload = require("../middlewares/multer");


router.post(
  '/register',
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  userController.register
);

router.put(
  '/update',
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  isAuthenticated,
  userController.updateProfile
);


router.post('/login', userController.login);


router.post(
  '/logout',
  isAuthenticated,
  userController.logout
);


router.put(
  '/edit',
  isAuthenticated,
  userController.edit
);


router.get('/uploads/:imageName', (req, res) => {
  const imagePath = path.join(__dirname, '..', 'uploads', req.params.imageName);

  res.sendFile(imagePath, err => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});

module.exports = router;