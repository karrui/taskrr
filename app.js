require('dotenv').config()
var express          = require('express');
var app              = express();
var passport         = require('passport');
var morgan           = require('morgan');
var bodyParser       = require('body-parser');
var session          = require('express-session');
var flash            = require('connect-flash');
var expressValidator = require('express-validator');

// =====================================
// APP SETUP ===========================
// =====================================
app.use(morgan('dev')); // log every request to the console

// get information from html forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// validate forms
app.use(expressValidator());

// display messages
app.use(flash());

// set default view engine
app.set("view engine", "ejs");

// set default css
app.use(express.static(__dirname + '/public'));

// =====================================
// PASSPORT (AUTH) FUNCTIONS ===========
// =====================================
var loggedIn = false;
require('./config/passport')(passport); // pass passport for configuration

// required for passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        loggedIn = true;
        return next();
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// =====================================
// ** ROUTES BEGIN HERE ** =============
// =====================================
const executer = require('./db/executer');

// Creates Tables + Views + Functions when server starts
executer.createAllTables();
executer.createAllViews();
executer.createAllFunctions();


app.get("/", function(req, res) {
    res.render("landing", {loggedIn: loggedIn});
});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
app.get('/login', function(req, res) {
    if (loggedIn) {
        res.redirect('/');
    }
    // render the page and pass in any flash data if it exists
    res.render('login', { message: req.flash('loginMessage'), loggedIn: loggedIn });
});

// process the login form
// app.post('/login', do all our passport stuff here);
// process the login form
app.post('/login', login_validation, passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

function login_validation(req, res, next){
    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    //validate
    var errors = req.validationErrors();

    if (errors) {
        res.render('login', { message: errors[0].msg });
    } else {
        next();
    }
}


app.get("/signup", function(req, res) {
    if (loggedIn) {
        res.redirect('/');
    }
    res.render('signup', { loggedIn: loggedIn, message: req.flash('signupMessage') });
})

// process the signup form
app.post('/signup', signup_validation, passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

function signup_validation(req, res, next){
    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    //validate
    var errors = req.validationErrors();
    if (errors) {
        res.render('signup', { message: errors[0].msg });
    } else {
        next();
    }
}


// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile', {
        user : req.user, // get the user out of session and pass to template
        loggedIn: loggedIn
    });
});

// =====================================
// LOGOUT ==============================
// =====================================
app.get('/logout', function(req, res) {
    req.logout();
    loggedIn = false;
    res.redirect('/');
});


// =====================================
// MAIN APIs ===========================
// =====================================

// placeholder tasks
app.get("/tasks", function(req, res) {
    var promise = executer.getAllTasks();
    promise.then(results => {
        var tasks = results.rows;
        res.render("tasks", {loggedIn: loggedIn, tasks: tasks});
    });
});

app.post("/tasks", function(req, res) {
    // get data from form and add to tasks array
    var title = req.body.title;
    var description = req.body.description;
    var category_id = req.body.category_id;
    var location = req.body.location;
    var requester = req.user.username;
    var start_dt = req.body.start_dt;
    var end_dt = req.body.end_dt;
    var price = req.body.price;

    var promise = executer.addTask(title, description, category_id, location, requester, start_dt, end_dt, price);
    promise.then(function() {
        res.redirect('/tasks'); // to project page
    });
});

app.get("/tasks/new", function(req, res) {
    var promise = executer.getCategories();
    promise.then(results => {
        var categories = results.rows;
        res.render("new", {categories: categories, loggedIn: loggedIn});
    });
});


// placeholder categories
app.get("/categories", function(req, res) {
    var promise = executer.getCategories();
    promise.then(results => {
        var categories = results.rows;
        res.render("categories", {categories: categories, loggedIn: loggedIn});
    });
});

// BEFORE YOU START THIS SERVER RUN IN NEW TERMINAL TAB TO ESTABLISH LINK
// ssh -L 63333:localhost:5432 webapp@128.199.75.94
app.listen(5000, 'localhost', function() {
    console.log("Taskrr server has started!");
});
