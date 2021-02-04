const User = require('../models/user')
const Blog = require('../models/blog')
const {errorHandler} = require('../helpers/dbErrorHandlers')
const _ = require('lodash')
const formidable = require('formidable')
const fs = require('fs')

const mongoose = require('mongoose')
const ObjectId = mongoose.Schema

exports.read = (req,res) => {
    req.profile.hashed_password = undefined
    req.profile.photo = undefined
    req.profile.salt = undefined
    return res.json(req.profile)
}


exports.publicProfile = (req,res) => {
    let username = req.params.username
    let user
    let blogs

    User.findOne({username})
    .populate('following','_id username name')
    .populate('followers','_id username name')
    .exec((err,userFromDB) => {
        if(err || !userFromDB){
            return res.status(400).json({
                error:'User not found'
            })
        }
        user = userFromDB
        let userId = user._id
        Blog.find({postedBy:userId})
        .populate('categories','_id name slug')
        .populate('tags','_id name slug')
        .populate('postedBy','_id name username')
        .populate('likes','_id name username')
        .populate('comments','text createdOn')
        .populate('comments.postedBy','_id name username')
        .populate('ratings','rate createdOn')
        .populate('ratings.ratedBy','_id name username')
        .limit(10)
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt likes comments')
        .exec((err,data) => {
            if(err) {
                    return res.status(400).json({
                    error:errorHandler(err)
                })
            }
            user.photo = undefined
            user.hashed_password = undefined
            res.json({
                user,
                blogs:data
            })
        })
    })

};


exports.publicratingProfile = (req,res) => {
    let username = req.params.username
    let user
    let blogs

    User.findOne({username})
    .exec((err,userFromDB) => {
        if(err || !userFromDB){
            return res.status(400).json({
                error:'User not found'
            })
        }
        user = userFromDB
        let userId = user._id
        Blog.find({postedBy:userId})
        .populate('ratings','rate createdOn')
        .populate('ratings.ratedBy','_id name username')
        .limit(10)
        .select('ratings')
        .exec((err,data) => {
            if(err) {
                    return res.status(400).json({
                    error:errorHandler(err)
                })
            }
            user.photo = undefined
            user.hashed_password = undefined
            user.salt = undefined
            res.json({
                user,
                blogs:data
            })
        })
    })
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtension = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        let user = req.profile;
        user = _.extend(user, fields);

        if(fields.password && fields.password.length < 6){
            return res.status(400).json({
                error:'Password should be minimum of 6 charecters long'
            })
        }

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1mb'
                });
            }
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);
        });
    });
};

exports.photo = (req,res) => {
    const username = req.params.username
    User.findOne({username}).exec((err,user) => {
        if(!user){
            return res.status(400).json({
                error:'User not found'
            })
        }
        if(err || !user.photo.data ){
            return res.status(400).json({
                error:'Photo not found'
            })
        }
        if(user.photo.data){
            res.set('Content-Type',user.photo.contentType)
            return res.send(user.photo.data)
        }
    })
}


exports.allUser = (req,res) => {
    User.find((err,users) =>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json({users})
    })
    .select("name email username profile photo createdAt updatedAt")
    .populate('following','_id name username')
    .populate('followers','_id name username')
}

//add_Follow_unfollow

exports.addFollowing = (req,res,next) => {
    //console.log(req.body.userId,req.body.followId);

    const userId = req.body.userId
    //console.log(userId,req.body.followId);

    User.findByIdAndUpdate(userId,{$push:{following:req.body.followId}},(err,result) => {
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        next()
    })
}

exports.addFollower = (req,res) => {
    const followerId = req.body.followId
    User.findByIdAndUpdate(followerId,{$push:{followers:req.body.userId}},{new:true}
    )
    .populate('following','_id username name')
    .populate('followers','_id username name')
    .exec((err,results) => {
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        results.hashed_password = undefined;
        results.salt = undefined;
        res.json(results);

    })
};

//remove_Follow_unfollow

exports.removeFollowing = (req,res,next) => {
    const userId = req.body.userId
    User.findByIdAndUpdate(userId,{$pull:{following:req.body.unfollowId}},(err,result) => {
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        next()
    })
}

exports.removeFollower = (req,res) => {
    const unfollowerId = req.body.unfollowId
    User.findByIdAndUpdate(unfollowerId,{$pull:{followers:req.body.userId}},{new:true}
    )
    .populate('following','_id username name')
    .populate('followers','_id username name')
    .exec((err,results) => {
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        results.hashed_password = undefined;
        results.salt = undefined;
        res.json(results);

    })
};

