const express = require('express');
const router = express.Router();
const { requireSignin,authMiddleware,adminMiddleware } = require('../controllers/auth');
const { read,publicProfile,update,photo,allUser,addFollowing,addFollower,removeFollowing,removeFollower,publicratingProfile } = require('../controllers/user');

router.get('/user/profile',requireSignin,authMiddleware, read);
router.get('/user/:username', publicProfile);
router.get('/users/:username',publicratingProfile);
router.put('/user/update',requireSignin,authMiddleware, update);
router.get('/user/photo/:username',photo);

router.put('/user/follow',requireSignin,addFollowing,addFollower);
router.put('/user/unfollow',requireSignin,removeFollowing,removeFollower);

router.get('/users',allUser);

module.exports = router;
