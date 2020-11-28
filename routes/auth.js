const express = require('express');
const router = express.Router();
const {preSignup, signup, signin, signout, requireSignin,forgetPassword,resetPassword,googleLogin } = require('../controllers/auth');

// validators
const { runValidation } = require('../validators');
const { userSignupValidator, userSigninValidator,forgetPasswordValidator,resetPasswordValidator } = require('../validators/auth');

router.post('/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/signup', signup);
router.post('/signin', userSigninValidator, runValidation, signin);
router.get('/signout', signout);
router.put('/forgot-password',forgetPasswordValidator,runValidation,forgetPassword);
router.put('/reset-password',resetPasswordValidator,runValidation,resetPassword);

//GOOGLE-LOGIN
router.post('/google-login',googleLogin)

module.exports = router;