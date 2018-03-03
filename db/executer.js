const { Pool, Client } = require('pg');
const queries = require('./queries');
var fs = require('fs');
var csv = require('fast-csv');

// new db client
var client = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// example way to call queries
function execute(query, args) {
    //console.log("EXECUTING: %s", query);
    let promise = client.query(query, args).then(result => {
        //console.log("DONE: %s \n Returned %d rows.", query, result.rowCount);
        return result;
    }).catch(err => {
        console.log("FAIL: %s \n Reason: %s %s", query, err.name, err.message);
        throw err;
    });
    return promise;
}

exports.createAllTables = function createAllTables() {
    console.log("Creating tables.");
    execute(queries.create.TABLE_PERSON);
    execute(queries.create.TABLE_CATEGORY);
    execute(queries.create.TABLE_TASK_STATUS);
    execute(queries.create.TABLE_TASK);
    execute(queries.create.TABLE_OFFER);
}

exports.createAllViews = function createAllViews() {
    console.log("Creating views.");
    execute(queries.create.VIEW_PERSON_LOGIN);
    execute(queries.create.VIEW_PERSON_ALL_INFO);
    execute(queries.create.VIEW_ALL_TASK);
    execute(queries.create.VIEW_ALL_CATEGORY);
}


exports.createAllFunctions = function createAllFunctions() {
    console.log("Creating functions.");
    execute(queries.create.FUNCTION_INSERT_ONE_TASK);
    execute(queries.create.FUNCTION_INSERT_ONE_PERSON);
}

exports.populateTasks = function populateTasks() {
    let csvStream = csv.fromPath('./csv/tasks.csv')
    .on('data', function(record) {
        csvPause();
        
        let title = record.title;
        let description = record.description;
        let category_id = record.category_id;
        let location = record.location;
        let requester = record.requester;
        let start_dt = record.start_dt;
        let end_dt = record.end_dt;
        let price = record.price;
        
        addTask(title, description, category_id, location, requester, start_dt, end_dt, price);
        
        csvResume();
    })
    .on('end', function() {
        console.log('Populating tasks done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.addTask = function addTask(title, description, category_id, location, requester, start_dt, end_dt, price) {
    console.log('Attemping to add task: \"%s\" under user \"%s\"', title, requester);
    return execute(queries.insert.ONE_TASK, [title, description, category_id, location, requester, start_dt, end_dt, price]);
}

exports.getCategories = function getCategories() {
    console.log('Attempting to get all categories');
    return execute(queries.get.ALL_CATEGORIES);
}

exports.getAllTasks = function getAllTasks() {
    console.log('Attempting to get all tasks');
    return execute(queries.get.ALL_TASKS);
}

exports.addUser = function addUser(username, password, email, created_dt) {
    console.log('Attempting to add user: ' + '');
    return execute(queries.insert.ONE_PERSON, [username, password, email, created_dt]);
}

exports.findUserById = function findUserById(id) {
    console.log('Attempting to find user by id: ' + id);
    return execute(queries.get.USER_BY_ID, [id]);
}

exports.findUserByName = function findUserByName(username) {
    console.log('Attempting to find user by name: ' + username);
    return execute(queries.get.USER_BY_NAME, [username]);
}
