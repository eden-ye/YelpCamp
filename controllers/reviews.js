const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.postReview = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    console.log(review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campground/${camp._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campground/${id}`);

}