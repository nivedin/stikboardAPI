const Blog = require('../models/blog');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const {errorHandler} = require('../helpers/dbErrorHandlers')
const fs = require('fs');
const {smartTrim} = require('../helpers/blog')

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        const { title, body, categories, tags } = fields;

        if(!title || !title.length){
            return res.status(400).json({
                error:'title is required'
            })
        }
        if(!body || body.length < 200){
            return res.status(400).json({
                error:'Content is too short'
            })
        }
        if(!categories || categories.length === 0){
            return res.status(400).json({
                error:'Atleast one category is required'
            })
        }
        if(!tags || tags.length === 0){
            return res.status(400).json({
                error:'Atleast one tag is required'
            })
        }

        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body,320,'',' ...');
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(body.substring(0, 160)).result;
        blog.postedBy = req.user._id;
        //Categories and Tags
        let arrayOfCategories = categories && categories.split(',')
        let arrayOfTags = tags && tags.split(',')

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        blog.save((err, result) => {
            if (err) {
                console.log(err)
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
            Blog.findByIdAndUpdate(result._id,{$push:{categories:arrayOfCategories }},{new:true}).exec((err,result) => {
                if(err){
                    return res.status(400).json({
                        error:errorHandler(err)
                    })
                }else{
                    Blog.findByIdAndUpdate(result._id,{$push:{tags:arrayOfTags }},{new:true}).exec((err,result) => {
                        if(err){
                            return res.status(400).json({
                            error:errorHandler(err)
                        })
                        }else{
                            res.json(result)
                        }
                    })
                }
            })
        });
    });
};

//list,listAllBlogsCatogoriesTags,read,remove,update

exports.list = (req,res) => {
    Blog.find({})
    .populate('categories','_id name slug')
    .populate('tags','_id name slug')
    .populate('postedBy','_id name username profile')
    .populate('likes','_id name username')
    .populate('comments','text createdOn')
    .populate('comments.postedBy','_id name username')
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt likes comments')
    .exec((error,data) => {
        if(error){
            return res.json({
                error:errorHandler(err)
            })
        }
        res.json(data)
    })

};


exports.listAllBlogsCatogoriesTags = (req,res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10
    let skip = req.body.skip ? parseInt(req.body.skip) : 0

    let blogs
    let categories
    let tags

    Blog.find({})
    .populate('categories','_id name slug')
    .populate('tags','_id name slug')
    .populate('postedBy','_id name username profile')
    .populate('likes','_id name username')
    .populate('comments','text createdOn')
    .populate('comments.postedBy','_id name username')
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt likes comments')
    .exec((error,data) => {
        if(error){
            return res.json({
                error:errorHandler(error)
            })
        }
       blogs= data
       //get all categories
       Category.find({}).exec((err,c) => {
        if(error){
            return res.json({
                error:errorHandler(err)
            });
        }
        categories = c

        //get all tags
        Tag.find({}).exec((err,t) => {
        if(error){
            return res.json({
                error:errorHandler(err)
            });
        }
        tags = t
        //return all data's

        res.json({blogs,categories,tags,size:blogs.length})

       })
    })
})
},


exports.read = (req,res) => {
    const slug = req.params.slug.toLowerCase()

    Blog.findOne({slug})
    .populate('categories','_id name slug')
    .populate('tags','_id name slug')
    .populate('postedBy','_id name username profile')
    .populate('likes','_id name username')
    .populate('comments','text createdOn')
    .populate('comments.postedBy','_id name username')
    .populate('ratings.ratedBy','_id name username')
    .populate('ratedBy','_id name username')
    .select('_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt likes comments ratings')
    .exec((err,data) => {
        if(err){
            return res.json({
                error:errorHandler(err)
            });
        }
        res.json(data)
    });
};


exports.remove = (req,res) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOneAndRemove({slug}).exec((err,data) => {
        if(err){
            return res.json({
                error:errorHandler(err)
            });
        }
        res.json({
            message:'Blog has been successfully deleted'
        });
    });

};


exports.update = (req, res) => {

    const slug = req.params.slug.toLowerCase()

    Blog.findOne({slug}).exec((err,oldBlog) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        let slugBeforeMerge = oldBlog.slug
        oldBlog = _.merge(oldBlog,fields)
        oldBlog.slug = slugBeforeMerge

        const {body,desc,categories,tags} = fields

        if(body){
            oldBlog.excerpt = smartTrim(body,320,'','...')
            oldBlog.desc = stripHtml(body.substring(0,160))
        }
        if(categories){
            oldBlog.categories = categories.split(',')
        }
        if(tags){
            oldBlog.tags = tags.split(',')
        }
       
       
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            oldBlog.photo.data = fs.readFileSync(files.photo.path);
            oldBlog.photo.contentType = files.photo.type;
        }

        oldBlog.save((err, result) => {
            if (err) {
                console.log(err)
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
        
            res.json(result)
           
        });
    });

    })
   
};


exports.photo = (req,res) => {
    const slug = req.params.slug.toLowerCase()

    Blog.findOne({slug})
    .select('photo')
    .exec((err,blog) => {
        if(err || !blog){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        res.set('Content-Type',blog.photo.contentType)
        return res.send(blog.photo.data)
    })
};


exports.listRelated = (req,res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 3

    const {_id,categories} = req.body.blog

    Blog.find({_id:{$ne:_id},categories:{$in:categories}})
    .limit(limit)
    .populate('postedBy','_id name username profile')
    .populate('likes','_id name username')
    .populate('comments','text createdOn')
    .populate('comments.postedBy','_id name username')
    .select('title slug excerpt postedBy createdAt updatedAt likes comments')
    .exec((err,blogs) => {
        if(err){
            return res.status(400).json({
                error:'Blogs not found'
            });
        }
        res.json(blogs)

    });
};

exports.listSearch = (req,res) => {
    const {search} = req.query
    if(search){
        Blog.find({
            $or:[{title:{$regex:search,$options:'i'}},{body:{$regex:search,$options:'i'}}]
        },(err,blogs) => {
            if(err){
                return res.status(400).json({
                    error:errorHandler(err)
                })
            }
            res.json(blogs)
            
        }
        ).select('-body');
    }
};



exports.listByUser = (req,res) => {
    User.findOne({username:req.params.username}).exec((err,user) => {
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        let userId = user._id
        Blog.find({postedBy:userId})
        .populate('categories','_id name slug')
        .populate('tags','_id name slug')
        .populate('postedBy','_id name username')
        .populate('likes','_id name username')
        .populate('comments','text createdOn')
        .populate('comments.postedBy','_id name username')
        .select('_id title slug excerpt postedBy createdAt updatedAt likes comments')
        .exec((err,data) => {
            if(err){
                return res.status(400).json({
                    error:errorHandler(err)
                })
            }
            res.json(data)
        })
    })

}

exports.likeBlog = (req,res) => {
    //console.log(req.body);
    const slug = req.body.slug
    Blog.findOneAndUpdate({slug},{$push:{likes:req.body.userId}},{new:true})
    .exec((err,data) => {
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        //console.log("response",data);
        res.json(data)
    })
}

exports.unlikeBlog = (req,res) => {
    const slug = req.body.slug
    Blog.findOneAndUpdate({slug},{$pull:{likes:req.body.userId}},{new:true})
    .exec((err,data) => {
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        res.json(data)
    })
}

exports.commentBlog = (req,res) => {
    //console.log(req.body);
    let comment = req.body.comment
    comment.postedBy = req.body.userId
    const slug = req.body.slug
    Blog.findOneAndUpdate({slug},{$push:{comments:comment}},{new:true})
    .populate('comments.postedBy','_id name username')
    .populate('postedBy','_id name username')
    .exec((err,data) => {
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        //console.log("response",data);
        res.json(data)
    })
}

exports.uncommentBlog = (req,res) => {
    //console.log(req.body);
    let comment = req.body.comment
    const slug = req.body.slug
    Blog.findOneAndUpdate({slug},{$pull:{comments:{_id:comment._id}}},{new:true})
    .populate('comments.postedBy','_id name username')
    .populate('postedBy','_id name username')
    .exec((err,data) => {
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        // console.log("response",data);
        res.json(data)
    })
}

exports.rateBlog = (req,res) => {
    //console.log(req.body);
    let slug = req.body.slug
    let ratingBlog = req.body.rating
    ratingBlog.ratedBy = req.body.userId
    Blog.findOneAndUpdate({slug},{$push:{ratings:ratingBlog}},{new:true})
    .populate('ratings.ratedBy','_id name username')
    .populate('ratedBy','_id name username')
    .select("-photo -body")
    .exec((err,data) => {
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        console.log("response",data);
        res.json(data)
    })
    // Blog.find({slug}).exec((err,data) => {
    //     if(err){
    //         return res.status(400).json({
    //             error:errorHandler(err)
    //         })
    //     }
    //   if(data){
    //      // console.log(data[0].ratings);
    //       //console.log("user",req.body.userId);
    //       let ratings = data[0].ratings
    //       ratings.forEach(rating => {
    //           if(rating.ratedBy = req.body.userId){
    //             rating = ratingBlog
    //             console.log("user found");
    //             //res.json(data)
    //             // data.save((err, result) => {
    //             //     if (err) {
    //             //         console.log(err)
    //             //         return res.status(400).json({
    //             //             error: errorHandler(err)
    //             //         });
    //             //     }
                
    //             //     res.json(result)
                   
    //             // });

    //         }
    //         else{
    //             console.log("user not found");
    //         }
    //       })
    //   }else{
    //     console.log("user not found");
    //   }
    // })

}

// exports.ratingBlog = (req,res) => {
//     //console.log(req.body);
//     const slug = req.body.slug
//     Blog.findOneAndUpdate({slug},{$push:{likes:req.body.userId}},function(err,data){
//         Blog.aggregate([
//             {$match:{}},
//             {$group:{slug:"$slug",rating:{$avg:'$likes'}}},
//             {$project:{rating:1,photo:0}}
//         ])
//     })
//     .exec((err,data) => {
//         if(err){
//             return res.status(400).json({
//                 error:errorHandler(err)
//             })
//         }
//         console.log("response",data);
//         res.json(data)
//     })
// }