const { Pool, Client } = require('pg');

var bcrypt = require('bcrypt-nodejs');

const executer = require('../db/executer');

function User(){
    this.id = 0;
    this.username = "";
    this.email = "";
    this.password = "";
    this.created_dt = "";
    this.role = "";

    this.save = function(callback) {
        var client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
        });
        client.connect();

        console.log(this.username + ' + ' + this.email +' will be saved');

		const text = 'INSERT INTO person(username, password, email, created_dt) VALUES($1, $2, $3, $4)';
    	const values = [this.username, this.password, this.email, this.created_dt];
        client.query(text, values, function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
            console.log(result.rows);
        });

        client.query('SELECT * FROM person ORDER BY id desc limit 1', null, function(err, result){
            if(err){
                return callback(null);
            }
            //if no rows were returned from query, then new user
            if (result.rows.length > 0){
                var user = new User();
                user.id = result.rows[0]['id'];
                user.username = result.rows[0]['username'];
                user.password = result.rows[0]['password'];
                user.created_dt = result.rows[0]['created_dt'];
                user.role = result.rows[0]['role'];
                client.end();
                return callback(user);
            }
        });
    };
}

User.findOne = function(username, callback) {
    var isNotAvailable = false; //we are assuming the username is taken
    console.log('Finding username: ' + username);

    //check if there is a user available for this username;
    executer.findUserByName(username)
    .then(result => {
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){    // means there is already a user with this username
            isNotAvailable = true; // update the user for return in callback
            var user = new User();
            user.username= result.rows[0]['username'];
            user.password = result.rows[0]['password'];
            user.email = result.rows[0]['email'];
            user.id = result.rows[0]['id'];
            user.role = result.rows[0]['role'];
            console.log(username + ' already exists...');
            return callback(false, isNotAvailable, user);
        }
        else{
            isNotAvailable = false;
            console.log(username + ' not found in database');
        }
        //the callback has 3 parameters:
        // parameter err: false if there is no error
        // parameter isNotAvailable: whether the email is available or not
        // parameter this: the User object;
        return callback(false, isNotAvailable, this);
    })
    .catch(err => {
        return callback(err, isNotAvailable, this);
    });
};

User.findById = function(id, callback){
    console.log("Finding user by id...");

    executer.findUserById(id)
    .then(result => {
        // check if user exists
        if (result.rows.length > 0){
            var user = new User();
            user.username= result.rows[0]['username'];
            user.password = result.rows[0]['password'];
            user.email = result.rows[0]['email'];
            user.id = result.rows[0]['id'];
            user.role = result.rows[0]['role'];
            console.log("User found: %s", user.username);
            return callback(null, user);
        }
    })
    .catch(err => {
        return callback(err, null);
    });
};

// generating a hash
User.generateHash = function(password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    return hash;
};

// checking if password is valid
User.validPassword = function(password, hash) {
    return bcrypt.compareSync(password, hash);
};

// create the model for users and expose it to our app
module.exports = User;
