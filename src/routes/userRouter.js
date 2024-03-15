const express = require('express');
const userConstroller = require('../controllers/userController');

const { isAuthenticated } = require('../middlewares');

const router = express.Router();

router.post('/signup', userConstroller.signup);
router.get('/confirm/:token', userConstroller.confirmAccount);
router.post('/login', userConstroller.login);
router.post('/current_user', isAuthenticated, userConstroller.current_user);

module.exports = router; 