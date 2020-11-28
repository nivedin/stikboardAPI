const express = require('express');
const router = express.Router();

//controllers
const { requireSignin,adminMiddleware } = require('../controllers/auth');
const { create,list,read,remove } = require('../controllers/category');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidators } = require('../validators/category');


router.post('/category',categoryCreateValidators,runValidation,requireSignin,adminMiddleware, create);
router.get('/categories',list)
router.get('/category/:slug',read)
router.delete('/category/:slug',requireSignin,adminMiddleware,remove)

module.exports = router;