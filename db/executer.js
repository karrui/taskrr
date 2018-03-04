const queries = require('./queries');
var fs = require('fs');
var csv = require('fast-csv');
var async = require('async');

const pg = require('pg');
// new db client
var config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    max: 1, // ensure queries work in order (may not be feasible)
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
}


const pool = new pg.Pool(config)

// example way to call queries
async function execute(query, args) {
    const client = await pool.connect()
    let promise;
    try {
        // console.log("EXECUTING: %s", query.substring(0, 40));
        promise = await client.query(query, args).then(result => {
            // console.log("DONE: %s \n Returned %d rows.", query.substring(0, 40), result.rowCount);
            return result;
        }).catch(err => {
            console.log("FAIL: %s \n Reason: %s %s", query.substring(0, 40), err.name, err.message);
        });
    } finally {
        client.release();
    }
    return promise;
}

exports.createAllTables = async function createAllTables() {
    console.log("Creating tables.");
    execute(queries.create.TABLE_PERSON);
    execute(queries.create.TABLE_CATEGORY);
    execute(queries.create.TABLE_TASK_STATUS);
    execute(queries.create.TABLE_TASK);
    execute(queries.create.TABLE_OFFER);
}

exports.createAllViews = async function createAllViews() {
    console.log("Creating views.");
    execute(queries.create.VIEW_PERSON_LOGIN);
    execute(queries.create.VIEW_PERSON_ALL_INFO);
    execute(queries.create.VIEW_ALL_TASK);
    execute(queries.create.VIEW_ALL_CATEGORY);
}


exports.createAllFunctions = async function createAllFunctions() {
    console.log("Creating functions.");
    execute(queries.create.FUNCTION_INSERT_ONE_TASK);
    execute(queries.create.FUNCTION_INSERT_ONE_PERSON);
}

exports.populateTasks = async function populateTasks() {
    let csvStream = csv.fromPath('./db/csv/tasks.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();
        
        let title = record.title;
        let description = record.description;
        let category_id = record.category_id;
        let location = record.location;
        let requester = record.requester;
        let start_dt = record.start_dt;
        let end_dt = record.end_dt;
        let price = record.price;
        
        console.log('Attemping to add task: \"%s\" under user \"%s\"', title, requester);
        execute(queries.insert.ONE_TASK, [title, description, category_id, location, requester, start_dt, end_dt, price]);
        
        csvStream.resume();
    })
    .on('end', function() {
        console.log('Populating tasks done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.deletePopulatedTasks = async function deletePopulatedTasks() {
    let csvStream = csv.fromPath('./db/csv/tasks.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();
        
        let title = record.title;
        let description = record.description;
        
        console.log('Attemping to delete task: \"%s\"', title);
        execute(queries.delete.ONE_POPULATED_TASK, [title, description]);
        
        csvStream.resume();
    })
    .on('end', function() {
        console.log('Deleting populated tasks done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.dropTables = async function dropTables() {
    execute(queries.drop.TABLE_PERSON);
    execute(queries.drop.TABLE_OFFER);
    execute(queries.drop.TABLE_TASK);
    execute(queries.drop.TABLE_TASK_STATUS);
    execute(queries.drop.VIEW_ALL_CATEGORY);
    execute(queries.drop.VIEW_ALL_TASK);
    execute(queries.drop.VIEW_PERSON_ALL_INFO);
    execute(queries.drop.VIEW_PERSON_LOGIN);
}


exports.addTask = async function addTask(title, description, category_id, location, requester, start_dt, end_dt, price) {
    console.log('Attemping to add task: \"%s\" under user \"%s\"', title, requester);
    return execute(queries.insert.ONE_TASK, [title, description, category_id, location, requester, start_dt, end_dt, price]);
}

exports.deleteTask = async function deleteTask(title, description) {
    console.log('Attemping to delete task: \"%s\"', title);
    return execute(queries.delete.ONE_TASK, [title, description]);
}

exports.getCategories = async function getCategories() {
    console.log('Attempting to get all categories');
    return execute(queries.get.ALL_CATEGORIES);
}

exports.getAllTasks = async function getAllTasks() {
    console.log('Attempting to get all tasks');
    return execute(queries.get.ALL_TASKS);
}

exports.addUser = async function addUser(username, password, email, created_dt) {
    console.log('Attempting to add user: ' + '');
    return execute(queries.insert.ONE_PERSON, [username, password, email, created_dt]);
}

exports.findUserById = async function findUserById(id) {
    console.log('Attempting to find user by id: ' + id);
    return execute(queries.get.USER_BY_ID, [id]);
}

exports.findUserByName = async function findUserByName(username) {
    console.log('Attempting to find user by name: ' + username);
    return execute(queries.get.USER_BY_NAME, [username]);
}
