const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review')
const Campground = require('../models/campground')
const { campgroundSchema, reviewSchema } = require('../Schema.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, validatingReview, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


router.post('/', isLoggedIn, validatingReview, catchAsync(reviews.postReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;