// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
const { Pool, Client } = require('pg');

var client = new Client({
    user: 'webapp',
    host: 'localhost',
    database: 'cs2102',
    password: 'sonTerK@r',
    port: 63333,
})

// load up the user model
var User = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(user.id +" was seralized");
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log(id + "is deserialized");
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function(callback) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne(username, function(err, isNotAvailable, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                    
                // check to see if theres already a user with that username
                if (isNotAvailable == true) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    console.log('new local user');
                    // if there is no user with that username
                    // create the user
                    user = new User();
                    
                    // set the user's local credentials
                    user.username    = req.body.username;
                    user.password = User.generateHash(req.body.password);
                    user.email = req.body.email;
                    user.created_dt = new Date().toISOString();
    
                    user.save(function(newUser) {
                        console.log("the object user is: ", newUser);
                        passport.authenticate();
                        return done(null, newUser);
                        //newUser.password = newUser.generateHash(password);
                    });
                }
    
            });
        });
    }));
    
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with username and password from our form
            // find a user whose username is the same as the forms username
            // we are checking to see if the user trying to login already exists
            User.findOne(username, function(err, is_found, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!is_found)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                console.log(user.password + ' ' + password);
                if (!User.validPassword(password, user.password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

        }
    ));
};
