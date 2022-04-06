const express = require('express');
const router = express.Router();
const Campground = require('../models/campground')
const { campgroundSchema, reviewSchema } = require('../Schema.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const { storage } = require('../cloudinary');

const multer = require('multer');
const upload = multer({ storage });


//index.ejs
router.get("/", catchAsync(campgrounds.index));

//new.ejs
router.route("/new")
    .get(isLoggedIn, campgrounds.renderNewForm)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('It worked!');
// })

//show, edit and delete
router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

//edit.ejs
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground))





module.exports = router;