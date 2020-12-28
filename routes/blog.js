const express = require('express');
const router = express.Router();
const { create,list,listAllBlogsCatogoriesTags,read,remove,update,photo,listRelated,listSearch,listByUser,likeBlog,unlikeBlog,commentBlog,uncommentBlog } = require('../controllers/blog');

const { requireSignin, adminMiddleware,authMiddleware,canUpdateDeleteBlog } = require('../controllers/auth');

//like-unlike
router.put('/blog/like',requireSignin,likeBlog);
router.put('/blog/unlike',requireSignin,unlikeBlog);

//comment
router.put('/blog/comment',requireSignin,commentBlog);
router.put('/blog/uncomment',requireSignin,uncommentBlog);

router.post('/blog', requireSignin, adminMiddleware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCatogoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug',requireSignin, adminMiddleware, remove);
router.put('/blog/:slug',requireSignin, adminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related',listRelated)
router.get('/blogs/search', listSearch);



// user blog
router.post('/user/blog', requireSignin, authMiddleware, create);
router.get('/:username/blogs', listByUser);
router.delete('/user/blog/:slug',requireSignin, authMiddleware,canUpdateDeleteBlog, remove);
router.put('/user/blog/:slug',requireSignin, authMiddleware,canUpdateDeleteBlog, update);



module.exports = router;