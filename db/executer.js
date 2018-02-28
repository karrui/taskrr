const { Pool, Client } = require('pg');
const queries = require('./queries');

// new db client
var client = new Pool({
  user: 'webapp',
  host: '128.199.75.94',
  database: 'cs2102',
  password: 'sonTerK@r',
  port: 5432,
});

// example way to call queries
function execute(query, args) {
    console.log("EXECUTING: %s", query);
    let promise = client.query(query, args).then(result => {
        console.log("DONE: %s \n Returned %d rows.", query, result.rowCount);
        return result;
    }).catch(e => {
        console.log("FAIL: %s \n Reason: %s %s", query, e.name, e.message);
    });
    return promise;
}

exports.addTask = function addTask(title, description, category_id, location, requester, start_dt, end_dt, price) {
    console.log('Attemping to add task: ' + title + ' under ' + requester);
    return execute(queries.ADD_TASK, [title, description, category_id, location, requester, start_dt, end_dt, price]);
}

exports.getCategories = function getCategories() {
    console.log('Attempting to get all categories');
    return execute(queries.GET_CATEGORIES);
}

exports.getAllTasks = function getAllTasks() {
    console.log('Attempting to get all tasks');
    return execute(queries.GET_ALL_TASKS);
}