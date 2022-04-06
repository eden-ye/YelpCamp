if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const { campgroundSchema, reviewSchema } = require('./Schema.js');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');
const User = require('./models/user');
const { redirect } = require('express/lib/response');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');



const MongoDBStore = require("connect-mongo")(session);

// router
const campgrounds = require('./routers/campgrounds')
const reviews = require('./routers/reviews')
const users = require('./routers/users')

// mongodb
// const dbUrl = 'mongodb://localhost:27017/Yelpcamp'
const dbUrl = process.env.DB_URL;
async function main() {
    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    //27017 is the deault port, test is which database we use
    //For brevity, let's assume that all following code is within the main() function.
}

// To static route
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
// To 'fake' put/patch/delete requests:
app.use(methodOverride('_method'))

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})


// session
const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
// flash
app.use(flash());

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drjlwikft/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ejs-mate
app.engine('ejs', ejsMate)

// ejs
app.set('view engine', 'ejs');

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// mongoose main
main().catch(err => console.log(err));

app.use(mongoSanitize({
    replaceWith: '_'
}))



// flash middleware
app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.previousReturnTo = req.session.returnTo; // store the previous url
        req.session.returnTo = req.originalUrl; // assign a new url
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// use route
app.use('/', users)
app.use('/campground', campgrounds)
app.use('/campground/:id/reviews', reviews)

//home page
app.get("/", (req, res) => {
    res.render("home");
})

app.get("/favicon.ico", (req, res) => {
    res.redirect("/campground");
})

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error", { err });
})



app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})



