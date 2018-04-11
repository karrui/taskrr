require('dotenv').config()


// Comment out these config and tunnel if not
// connecting to remote database like we are
// If you are, add the .env variables to your .env
// =========================================
var config = {
    host: process.env.REMOTE_HOST,
    username: process.env.DB_USER,
    dstHost: process.env.REMOTE_HOST,
    dstPort: process.env.REMOTE_DEST_PORT,
    localPort: process.env.DB_PORT,
    password: process.env.DB_PASS,
    keepAlive: true,
};

var tunnel = require('tunnel-ssh');
    tunnel(config, function (error, server) {
        if (error) {
            console.log(error);
        }
});
// Comment out until here
// =========================================

var express          = require('express');
var app              = express();
var passport         = require('passport');
var morgan           = require('morgan');
var bodyParser       = require('body-parser');
var session          = require('express-session');
var flash            = require('connect-flash');
var expressValidator = require('express-validator');
var moment           = require('moment');

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
    res.locals.prevUrl = req.session.returnTo;
    res.locals.moment = moment;
    next();
})

// =====================================
// ** ROUTES BEGIN HERE ** =============
// =====================================
const executer = require('./db/executer');

// executer.dropTables();

// // Creates Tables + Views + Functions when server starts
executer.createAllTables();
executer.createAllViews();
executer.dropAllExtensions();
executer.dropAllFunctions();
executer.createAllExtensions();
executer.createAllFunctions();
executer.createAllIndexes();

// Toggle methods to populate or delete populated tasks
// must be in this order
// executer.populateCategories();
// executer.populatePersons();
// executer.populateTaskStatuses();
// executer.populateOfferStatuses();
// executer.populateTasks();
// executer.populateOffers();

// executer.deletePopulatedTasks();

app.get("/", function(req, res) {
    res.render("landing");
});

// =====================================
// LOGIN APIS ==========================
// =====================================
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the login page
    res.redirect('/login');
}

// save previous returnTo so user can seamlessly join back
function redirection(req, res, next) {
    req.session.returnTo = req.originalUrl;
    return next();
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

// app.get('/hidden', isLoggedIn, function(req, res) {
//     res.redirect(req.session.returnTo);
// });

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
// PROFILE APIS ========================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
app.get('/profile', isLoggedIn, function(req, res) {
    var numTasks;
    var promise = executer.getNumTasksByUsername(req.user.username)
    .then(results => {
        numTasks = results.rows[0].count;
    });
    promise = executer.getNumOffersByUsername(req.user.username)
    .then(results => {
        var numOffers = results.rows[0];
        res.render('profile', {
            user : req.user, // get the user out of session and pass to template
            numOffers: numOffers,
            numTasks: numTasks
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    })
});

app.get('/profile/:username', function(req, res) {
    var numTasks;
    var promise = executer.getNumTasksByUsername(req.params['username'])
    .then(results => {
        numTasks = results.rows[0].count;
    });
    promise = executer.getUserByName(req.params['username'])
    .then(results => {
        var user = results.rows[0];
        promise = executer.getNumOffersByUsername(req.params['username'])
        .then(results => {
            var numOffers = results.rows[0];
            res.render('view_profile', {
                user : user,
                targetUser: req.params['username'],
                numOffers: numOffers,
                numTasks: numTasks
            });
        })
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    })
})

// Task related starts here
app.get('/profile/:username/tasks', function(req, res) {
    var promise = executer.getTasksByRequester(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_tasks", {
            targetUser: req.params['username'],
            tasks: tasks
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get('/profile/:username/tasks/open', function(req, res) {
    var promise = executer.getTasksWithOpenStatusByRequester(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_tasks_open", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get('/profile/:username/tasks/offered', function(req, res) {
    var promise = executer.getTasksWithOfferedStatusByRequester(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_tasks_offered", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get('/profile/:username/tasks/accepted', function(req, res) {
    var promise = executer.getTasksWithAcceptedStatusByRequester(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_tasks_accepted", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

// Offers related starts here
app.get('/profile/:username/offers', function(req, res) {
    var promise = executer.getTasksWithOffersByOfferAssignee(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_offers", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get('/profile/:username/offers/pending', function(req, res) {
    var promise = executer.getTasksWithPendingOffersByOfferAssignee(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_offers_pending", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get('/profile/:username/offers/accepted', function(req, res) {
    var promise = executer.getTasksWithAcceptedOffersByOfferAssignee(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_offers_accepted", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get('/profile/:username/offers/rejected', function(req, res) {
    var promise = executer.getTasksWithRejectedOffersByOfferAssignee(req.params['username'])
    .then(results => {
        var tasks = results.rows;
        res.render("user_offers_rejected", {
            tasks: tasks,
            targetUser: req.params['username'],
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

// =====================================
// LOGOUT ==============================
// =====================================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// =====================================
// TASKS APIs ==========================
// =====================================
app.get("/tasks/", redirection, function(req, res) {
    var promise = executer.getAllTasks()
    .then(results => {
        var tasks = results.rows;
        res.render("tasks", {   tasks: tasks,
                                message: req.flash('message'),
                                success: req.flash('success'),
                                });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get("/tasks/new", isLoggedIn, function(req, res) {
    var promise = executer.getCategories()
    .then(results => {
        var categories = results.rows;
        res.render("new_task", { categories: categories, message: req.flash('message') });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get("/tasks/:id", redirection, function(req, res) {
    var promise = executer.getTaskById(req.params['id'])
    .then(results => {
        var task = results.rows[0];
        promise = executer.getOffersByTaskId(task.id)
        .then(results => {
            var offers = results.rows;
            promise = executer.getAcceptedOfferByTaskId(task.id)
            .then(results => {
                var acceptedOffer = results.rows[0];
                if (res.locals.currentUser != null) {
                    promise = executer.getOffersByAssigneeAndTaskId(req.user.username, task.id)
                    .then(results => {
                        var offerByUser = results.rows[0];
                        res.render("task_page", {   task: task,
                            offers: offers,
                            offerByUser: offerByUser,
                            acceptedOffer: acceptedOffer,
                            message: req.flash('message'),
                            offer_success: req.flash('offer_success')});
                    })
                } else {
                    res.render("task_page", { task: task, offers: offers, acceptedOffer: acceptedOffer});
                }
            })
        })
    })
    .catch(err => {
        res.render("deleted_task_page", { title: "Sorry, task not found"});
    })

})

app.post("/tasks", isLoggedIn, function(req, res) {
    // get data from form and add to tasks array
    var title = req.body.title;
    var description = req.body.description;
    var category_id = req.body.category_id;
    var location = req.body.location;
    var requester = req.user.username;
    var start_dt = moment(req.body.start_dt, 'DD/MM/YYYY, h:mm A').format();
    var end_dt = moment(req.body.end_dt, 'DD/MM/YYYY, h:mm A').format();
    var price = req.body.price;

    var promise = executer.addTask(title, description, category_id, location, requester, start_dt, end_dt, price)
    .then(function() {
        var redirectUrl = "/profile/" + req.user.username + "/tasks";
        res.redirect(redirectUrl); // to user's projects page
    })
    .catch(err => {
        req.flash('message', err.message);
        var redirectUrl = "/tasks/new";
        res.redirect(redirectUrl); // to updated task page
    });
});

app.get("/edit/task/:id", isLoggedIn, redirection, function(req, res) {
    var promise = executer.getTaskById(req.params['id'])
    .then(results => {
        var task = results.rows[0];
        promise = executer.getCategories()
        .then(results => {
            var categories = results.rows;
            res.render("edit_task", { task: task, categories: categories, message: req.flash('message') });
        });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
})

app.post("/edit/task/:id", isLoggedIn, function(req, res) {
    var task_id = req.body.id;
    var title = req.body.title;
    var description = req.body.description;
    var category_id = req.body.category_id;
    var location = req.body.location;
    var start_dt = moment(req.body.start_dt, 'DD/MM/YYYY, h:mm A').format();
    var end_dt = moment(req.body.end_dt, 'DD/MM/YYYY, h:mm A').format();
    var price = req.body.price;

    var promise = executer.updateTaskById(task_id, title, description, category_id, location, start_dt, end_dt, price)
    .then(function() {
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // to updated task page
    })
    .catch(err => {
        req.flash('message', err.message)
        var redirectUrl = "/edit/task/" + task_id;
        res.redirect(redirectUrl); // to updated task page
    });
})

app.post("/delete/task/:id", isLoggedIn, function(req, res) {
    var task_id = req.body.id;
    var promise = executer.deleteTaskById(task_id)
    .then(function() {
        console.log("Task successfully deleted!")
        req.flash('success', "Task successfully deleted!")
        res.redirect("/tasks");
    })
    .catch(err => {
        req.flash('message', err.message)
        res.redirect("/tasks"); // to updated task page
    })
})

// =====================================
// OFFER APIs ==========================
// =====================================
app.post("/new/offer/:id", isLoggedIn, function(req, res) {
    var task_id = req.params['id'];
    var price = req.body.price;
    var assignee = res.locals.currentUser.username;
    var offered_dt = new Date().toISOString();

    var promise = executer.addOffer(task_id, price, assignee, offered_dt)
    .then(function() {
        req.flash('offer_success', "Offer successfully added!");
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to task page
    })
    .catch(err => {
        req.flash('message', err.message)
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // to updated task page
    });
});

app.post("/edit/offer/:id", isLoggedIn, function(req, res) {
    var task_id = req.params['id'];
    var assignee = req.body.assignee;
    var newPrice = req.body.price;
    var newOffered_dt = new Date().toISOString();

    var promise = executer.updateOfferByAssigneeAndTaskId(assignee, task_id, newPrice, newOffered_dt)
    .then(function() {
        req.flash('offer_success', "Offer successfully updated!");
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to task page
    })
    .catch(err => {
        req.flash('message', err.message)
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to page to display errors
    });
});

app.post("/delete/offer/:id", isLoggedIn, function(req, res) {
    var task_id = req.body.task_id;
    var assignee = req.body.assignee;

    // extra check
    if (assignee != res.locals.currentUser.username && res.locals.currentUser.role != 'admin') {
        req.flash('message', "Oops, you tried to do something you shouldn't have!")
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to page to display errors
    }

    var promise = executer.deleteOfferByAssigneeAndTaskId(assignee, task_id)
    .then(function() {
        req.flash('offer_success', "Offer successfully deleted!");
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl);  // back to task page
    })
    .catch(err => {
        req.flash('message', err.message)
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to page to display errors
    })
});

app.post("/accept/offer/:id", isLoggedIn, function(req, res) {
    var task_id = req.body.task_id;
    var requester = req.body.requester;
    var assignee = req.body.assignee;
    var offer_price = req.body.offer_price;
    if (!(requester == res.locals.currentUser.username)) {
        var redirectUrl = "/tasks/" + task_id;
        req.flash('message', "You are not the user who requested for this task!")
        res.redirect(403, redirectUrl);
    }
    var promise = executer.updateTaskUponAcceptingOfferByTaskID(task_id, assignee, offer_price)
    .then(function() {
        req.flash('offer_success', "Offer accepted!");
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl);  // back to task page
    })
    .catch(err => {
        req.flash('message', err.message)
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to page to display errors
    })
});

app.post("/reject/offer/:id", isLoggedIn, function(req, res) {
    var task_id = req.body.task_id;
    var requester = req.body.requester;
    var offer_id = req.body.offer_id;
    if (!(requester == res.locals.currentUser.username)) {
        var redirectUrl = "/tasks/" + task_id;
        req.flash('message', "You are not the user who requested for this task!")
        res.redirect(403, redirectUrl);
    }
    var promise = executer.updateTaskUponRejectingOfferByTaskID(task_id, offer_id)
    .then(function() {
        req.flash('offer_success', "Offer rejected!");
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl);  // back to task page
    })
    .catch(err => {
        req.flash('message', err.message)
        var redirectUrl = "/tasks/" + task_id;
        res.redirect(redirectUrl); // back to page to display errors
    })
});

// =====================================
// CATEGORIES APIs =====================
// =====================================
app.get("/categories", redirection, function(req, res) {
    var promise = executer.getCategories()
    .then(results => {
        var categories = results.rows;
        res.render("categories", { categories: categories });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get("/categories/:id", redirection, function(req, res) {
    var promise = executer.getCategories()
    .then(results => {
        var categories = results.rows;
        promise = executer.getTasksByCategoryId(req.params['id'])
        .then(results => {
            var tasks = results.rows;
            var categoryName = categories[req.params['id'] - 1].name;
            res.render("tasks", { tasks: tasks, categoryName: categoryName });
        })
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

// =====================================
// SEARCH APIs =========================
// =====================================

app.get("/search/advanced/", function(req, res) {
    var promise = executer.getCategories()
    .then(results => {
        var categories = results.rows;
        res.render("adv_search", {categories: categories});
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});

app.get("/search/", function(req, res) {
    var search_string = req.query.search;
    var category_id = req.query.category_id;
    var location = req.query.location;
    var requester = req.query.requester;
    var start_dt = req.query.start_dt;
    if (typeof start_dt != 'undefined' && start_dt != '') {
        start_dt = moment(req.query.start_dt, 'DD/MM/YYYY').format();
    }
    var min_price = req.query.min_price;
    var max_price = req.query.max_price;
    var status_task = req.query.status_task;
    var assignee = req.query.assignee;

    var categories;

    var promise = executer.getCategories()
    .then(results => {
        categories = results.rows;
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });

    promise = executer.getTasksByAdvancedSearch(search_string, category_id, location, requester, start_dt, min_price, max_price, status_task, assignee)
    .then(results => {
        var tasks = results.rows;
        res.render("tasks", { tasks: tasks, categories: categories });
    })
    .catch(err => {
        res.status(500).render('500', { title: "Sorry, internal server error", message: err });
    });
});


// =====================================
// MISC APIs ===========================
// =====================================
//404
app.use(function(req, res, next){
    res.status(404).render('404', { title: "Sorry, page not found" });
});

app.listen(5000, 'localhost', function() {
    console.log("Taskrr server has started!");
});
