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

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.loggedIn = loggedIn;
    next();
})

// =====================================
// ** ROUTES BEGIN HERE ** =============
// =====================================
const executer = require('./db/executer');

// Creates Tables + Views + Functions when server starts
executer.createAllTables();
executer.createAllViews();
executer.createAllFunctions();
executer.createAllIndexes();

// executer.dropTables();

// Toggle methods to populate or delete populated tasks
// executer.populateTasks();
// executer.deletePopulatedTasks();

app.get("/", function(req, res) {
    res.render("landing");
});

// =====================================
// LOGIN ===============================
// =====================================
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        loggedIn = true;
        return next();
    }

    // if they aren't redirect them to the login page
    res.redirect('/login');
}

// show the login form
app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login', { message: req.flash('loginMessage') });
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
    res.render('signup', { message: req.flash('signupMessage') });
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

app.get('/profile/tasks', isLoggedIn, function(req, res) {
    var promise = executer.getTasksByRequester(req.user.username);
    promise.then(results => {
        var tasks = results.rows;
        res.render("user_projects", {
            loggedIn: loggedIn, 
            tasks: tasks
        });
    });
});

app.get('/profile/tasks/:id', isLoggedIn, function(req, res) {
    let redirectUrl = '/tasks/' + req.params.id;
    res.redirect(301, redirectUrl);
})

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
app.get("/tasks/", function(req, res) {
    var promise = executer.getAllTasks();
    promise.then(results => {
        var tasks = results.rows;
        res.render("tasks", { tasks: tasks });
    });
});

app.get("/tasks/new", function(req, res) {
    var promise = executer.getCategories();
    promise.then(results => {
        var categories = results.rows;
        res.render("new", { categories: categories });
    });
});

app.get("/categories/tasks/:id", function(req, res) {
    let redirectUrl = '/tasks/' + req.params.id;
    res.redirect(301, redirectUrl);
})

app.get("/tasks/:id", function(req, res) {
    var promise = executer.getTaskById(req.params['id']);
    promise.then(results => {
        var task = results.rows[0];
        res.render("task_page", { task: task });
    });
})

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
        res.redirect('/profile/tasks'); // to user's projects page
    });
});

app.get("/categories", function(req, res) {
    var promise = executer.getCategories();
    promise.then(results => {
        var categories = results.rows;
        res.render("categories", { categories: categories });
    });
});

app.get("/categories/:id", function(req, res) {
    var promise = executer.getTasksByCategoryId(req.params['id']);
    promise.then(results => {
        var tasks = results.rows;
        res.render("tasks", { tasks: tasks });
    });
});

//404
app.use(function(req, res, next){
    res.status(404).render('404', { title: "Sorry, page not found" });
});

// BEFORE YOU START THIS SERVER RUN IN NEW TERMINAL TAB TO ESTABLISH LINK
// ssh -L 63333:localhost:5432 webapp@128.199.75.94
app.listen(5000, 'localhost', function() {
    console.log("Taskrr server has started!");
});
