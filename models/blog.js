const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        body: {
            type: {},
            required: true,
            min: 25,
            max: 2000000
        },
        excerpt: {
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        categories: [{ type: ObjectId, ref: 'Category', required: true }],
        tags: [{ type: ObjectId, ref: 'Tag', required: true }],
        ratings:[
            {
                rate:Number,
                createdOn:{type:Date,default:Date.now},
                ratedBy:{type:ObjectId,ref:"User"}
            }
        ],
        likes:[{type:ObjectId,unique:true,ref:"User"}],
        comments:[
            {
                text:String,
                createdOn:{type:Date,default:Date.now},
                postedBy:{type:ObjectId,ref:"User"}
            }
        ],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);