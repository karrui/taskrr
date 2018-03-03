const { Pool, Client } = require('pg');

var bcrypt   = require('bcrypt-nodejs');

// new db client
var client = new Pool({
    user: 'webapp',
    host: 'localhost',
    database: 'cs2102',
    password: 'sonTerK@r',
    port: 63333,
})



function User(){
    this.id = 0;
    this.username ='';
    this.email = "";
    this.password= ""; //need to declare the things that i want to be remembered for each user in the database

    this.save = function(callback) {
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
            //console.log(this.email);
        });
        client.query('SELECT * FROM person ORDER BY id desc limit 1', null, function(err, result){

            if(err){
                return callback(null);
            }
            //if no rows were returned from query, then new user
            if (result.rows.length > 0){
                console.log(result.rows[0] + ' is found!');
                var user = new User();
                user.username = result.rows[0]['username'];
                user.password = result.rows[0]['password'];
                user.id = result.rows[0]['id'];
                user.created_dt = result.rows[0]['created_dt'];
                console.log(user.username);
                client.end();
                return callback(user);
            }
        });



            //whenever we call 'save function' to object USER we call the insert query which will save it into the database.
        //});
    };
        //User.connect

    //this.findById = function(u_id, callback){
    //    console.log("we are in findbyid");
    //    var user = new User();
    //    user.email= 'carol';
    //    user.password='gah';
    //    console.log(user);
    //
    //    return callback(null, user);
    //
    //};

}

User.findOne = function(username, callback) {
    var isNotAvailable = false; //we are assuming the email is taking
    console.log(username + ' is in the findOne function test');
    //check if there is a user available for this username;
    
    client.connect();
    client.query('SELECT * FROM person WHERE username = $1', [username], function(err, result){
        if(err){
            return callback(err, isNotAvailable, this);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            isNotAvailable = true; // update the user for return in callback
            ///email = email;
            // password = result.rows[0].password;
            var user = new User();
            user.username= result.rows[0]['username'];
            user.password = result.rows[0]['password'];
            user.email = result.rows[0]['email'];
            user.id = result.rows[0]['id'];
            console.log(username + ' is not available!');
            return callback(false, isNotAvailable, user);
        }
        else{
            isNotAvailable = false;
            console.log(username + ' is available');
        }
        //the callback has 3 parameters:
        // parameter err: false if there is no error
        //parameter isNotAvailable: whether the email is available or not
        // parameter this: the User object;

        client.end();
        return callback(false, isNotAvailable, this);


    });
//});
};

User.findById = function(id, callback){
    console.log("we are in findbyid");

    client.connect();
    client.query("SELECT * from person where id=$1", [id], function(err, result){

        if(err){
            return callback(err, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            console.log(result.rows[0] + ' is achieved!');
            var user = new User();
            user.username= result.rows[0]['username'];
            user.password = result.rows[0]['password'];
            user.email = result.rows[0]['email'];
            user.id = result.rows[0]['id'];
            console.log(user.username);
            return callback(null, user);
        }
    });
};

//User.connect = function(callback){
//    return callback (false);
//};

//User.save = function(callback){
//    return callback (false);
//};

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