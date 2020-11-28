const express = require('express');
const router = express.Router();

//controlers
const { requireSignin,adminMiddleware } = require('../controllers/auth');
const { create,list,read,remove } = require('../controllers/tag');

// validators
const { runValidation } = require('../validators');
const { tagCreateValidators } = require('../validators/tag');


router.post('/tag',tagCreateValidators,runValidation,requireSignin,adminMiddleware, create);
router.get('/tags',list)
router.get('/tag/:slug',read)
router.delete('/tag/:slug',requireSignin,adminMiddleware,remove)

module.exports = router;