const CampgroundModel = require('../models/campground.js');
const mongoose = require('mongoose');
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/Yelpcamp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await CampgroundModel.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const c = new CampgroundModel({
            author: "6248eb935d9b064e4b405262",
            location: `${cities[random1000].city}.${cities[random1000].state}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/drjlwikft/image/upload/v1648944516/yelp-camp/pub20lfinnk0fxa0mwsi.jpg',
                    filename: 'yelp-camp/pub20lfinnk0fxa0mwsi'
                },
                {
                    url: 'https://res.cloudinary.com/drjlwikft/image/upload/v1648944516/yelp-camp/dqrpqaklhl5gvhtxfbmv.jpg',
                    filename: 'yelp-camp/dqrpqaklhl5gvhtxfbmv'
                }]
        })
        await c.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})