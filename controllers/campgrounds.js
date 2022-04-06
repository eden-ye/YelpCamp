const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const camps = await Campground.find({});
    res.render('Campground/index', { camps });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campground/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send()
    const camp = new Campground(req.body.camp);
    camp.geometry = geoData.body.features[0].geometry;
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.author = req.user._id;
    await camp.save();
    console.log(camp);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campground/${camp._id}`)
}

module.exports.showCampground = async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campground');
    }
    res.render('Campground/show', { camp });
}

module.exports.updateCampground = async (req, res, next) => {
    // const { newTitle, newLocation } = req.body;
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    const c = await Campground.findByIdAndUpdate(id, { ...req.body.camp });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campground/${c._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect("/campground");
}

module.exports.editCampground = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campground');
    }
    res.render('Campground/edit', { camp });
}
