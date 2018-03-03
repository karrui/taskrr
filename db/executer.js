const { Pool, Client } = require('pg');
const queries = require('./queries');

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
    console.log("EXECUTING: %s", query);
    let promise = client.query(query, args).then(result => {
        console.log("DONE: %s \n Returned %d rows.", query, result.rowCount);
        return result;
    }).catch(err => {
        console.log("FAIL: %s \n Reason: %s %s", query, err.name, err.message);
        throw err;
    });
    return promise;
}

exports.createAllTables = function createAllTables() {
    execute(queries.create.TABLE_PERSON);
    execute(queries.create.TABLE_CATEGORY);
    execute(queries.create.TABLE_TASK_STATUS);
    execute(queries.create.TABLE_TASK);
    execute(queries.create.TABLE_OFFER);
}

exports.createAllViews = function createAllViews() {
    execute(queries.create.VIEW_PERSON_LOGIN);
    execute(queries.create.VIEW_PERSON_ALL_INFO);
    execute(queries.create.VIEW_ALL_TASK);
    execute(queries.create.VIEW_ALL_CATEGORY);
}

exports.addTask = function addTask(title, description, category_id, location, requester, start_dt, end_dt, price) {
    console.log('Attemping to add task: ' + title + ' under ' + requester);
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
    return execute(queries.insert.ONE_USER, [username, password, email, created_dt]);
}

exports.findUserById = function findUserById(id) {
    console.log('Attempting to find user by id: ' + id);
    return execute(queries.get.USER_BY_ID, [id]);
}

exports.findUserByName = function findUserByName(username) {
    console.log('Attempting to find user by name: ' + username);
    return execute(queries.get.USER_BY_NAME, [username]);
}