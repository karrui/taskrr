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
            console.log("FAIL: %s \n %s \n Reason: %s %s", query.substring(0, 40), args, err.name, err.message);
            throw err;
        });
    } finally {
        client.release();
    }
    return promise;
}

/* TABLE OF CONTENTS

    1. Create
    2. Prepare sample data
    3. Insert
    4. Update
    5. Delete
    6. Select
    ├── 6.1. User
    ├── 6.2. Category
    ├── 6.3. Task
    ├── 6.4. Offer
    ├── 6.5. Charts

*/

//==================================================================================================================================================
// 1. Create

exports.createAllTables = async function createAllTables() {
    console.log("Creating tables.");
    execute(queries.create.TABLE_PERSON);
    execute(queries.create.TABLE_CATEGORY);
    execute(queries.create.TABLE_TASK_STATUS);
    execute(queries.create.TABLE_TASK);
    execute(queries.create.TABLE_OFFER_STATUS);
    execute(queries.create.TABLE_OFFER);
}

exports.createAllViews = async function createAllViews() {
    console.log("Creating views.");
    execute(queries.create.VIEW_PERSON_LOGIN);
    execute(queries.create.VIEW_PERSON_ALL_INFO);
    execute(queries.create.VIEW_ALL_TASK);
    execute(queries.create.VIEW_ALL_CATEGORY);
    execute(queries.create.VIEW_ALL_OFFER);
}


exports.createAllFunctions = async function createAllFunctions() {
    console.log("Creating functions.");
    execute(queries.create.FUNCTION_INSERT_ONE_TASK);
    execute(queries.create.FUNCTION_INSERT_ONE_PERSON);
    execute(queries.create.FUNCTION_INSERT_ONE_OFFER);
    execute(queries.create.FUNCTION_UPDATE_OFFER_BY_ASSIGNEE_AND_TASKID);
    execute(queries.create.FUNCTION_UPDATE_TASK_BY_ID);
    execute(queries.create.FUNCTION_UPDATE_TASK_UPON_ACCEPTING_OFFER_BY_TASK_ID);
    execute(queries.create.FUNCTION_UPDATE_TASK_UPON_REJECTING_OFFER_BY_TASK_ID);
    execute(queries.create.FUNCTION_DELETE_ONE_TASK_BY_TASK_ID);
    execute(queries.create.FUNCTION_DELETE_OFFER_BY_ASSIGNEE_AND_TASK_ID);
    execute(queries.create.FUNCTION_CREATE_INDEX_PERSON);
    execute(queries.create.FUNCTION_CREATE_INDEX_TASK);
    execute(queries.create.FUNCTION_CREATE_INDEX_OFFER);
    execute(queries.create.FUNCTION_GET_STRING_MATCHING_PERCENT);
    execute(queries.create.FUNCTION_TASK_BASIC_SEARCH);
    execute(queries.create.FUNCTION_TASK_ADVANCED_SEARCH);
    execute(queries.create.FUNCTION_DROP_ALL_FUNCTIONS);
}

exports.createAllIndexes = async function createAllIndexes() {
    console.log("Creating indexes.");
    execute(queries.create.INDEX_TABLE_PERSON);
    execute(queries.create.INDEX_TABLE_TASK);
    execute(queries.create.INDEX_TABLE_OFFER);
}

exports.createAllExtensions = async function createAllExtensions() {
    console.log("Creating extensions.");
    execute(queries.create.EXTENSION_FUZZYSTRMATCH);
}
//==================================================================================================================================================
// 2. Prepare sample data

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

        // console.log('Attemping to add task: \"%s\" under user \"%s\"', title, requester);
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

exports.populatePersons = async function populatePersons() {
    let csvStream = csv.fromPath('./db/csv/persons.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();

        let username = record.username;
        let password = record.password;
        let email = record.email;
        let created_dt = record.created_dt;

        // console.log('Attemping to add person: \"%s\"', username);
        execute(queries.insert.ONE_PERSON, [username, password, email, created_dt])

        csvStream.resume();
    })
    .on('end', function() {
        console.log('Populating persons done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.populateCategories = async function populateCategories() {
    let csvStream = csv.fromPath('./db/csv/categories.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();

        let id = record.id;
        let name = record.name;

        // console.log('Attemping to add category: \"%s\"', name);
        execute(queries.insert.ONE_CATEGORY, [id, name]);

        csvStream.resume();
    })
    .on('end', function() {
        console.log('Populating categories done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.populateOfferStatuses = async function populateOfferStatuses() {
    let csvStream = csv.fromPath('./db/csv/offer_status.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();

        let status = record.status;

        // console.log('Attemping to add offer status: \"%s\"', status);
        execute(queries.insert.ONE_OFFER_STATUS, [status]);

        csvStream.resume();
    })
    .on('end', function() {
        console.log('Populating offer_status done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.populateOffers = async function populateOffers() {
    let csvStream = csv.fromPath('./db/csv/offers.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();

        let task_id = record.task_id;
        let price = record.price;
        let assignee = record.assignee;
        let offered_dt = record.offered_dt;
        let status_offer = record.status_offer;

        // console.log('Attemping to add offer: \"%s\"', id);
        execute(queries.insert.ONE_POPULATED_OFFER, [task_id, price, assignee, offered_dt, status_offer]);

        csvStream.resume();
    })
    .on('end', function() {
        console.log('Populating offers done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.populateTaskStatuses = async function populateTaskStatuses() {
    let csvStream = csv.fromPath('./db/csv/task_status.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();

        let status = record.status;

        // console.log('Attemping to add task status: \"%s\"', status);
        execute(queries.insert.ONE_TASK_STATUS, [status]);

        csvStream.resume();
    })
    .on('end', function() {
        console.log('Populating task_status done!');
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

        // console.log('Attemping to delete task: \"%s\"', title);
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

exports.deletePopulatedTasks = async function deletePopulatedTasks() {
    let csvStream = csv.fromPath('./db/csv/persons.csv', {headers: true})
    .on('data', function(record) {
        csvStream.pause();

        let username = record.username;

        // console.log('Attemping to delete person: \"%s\"', username);
        execute(queries.delete.ONE_POPULATED_PERSON, [username]);

        csvStream.resume();
    })
    .on('end', function() {
        console.log('Deleting populated persons done!');
    })
    .on('error', function(err) {
        console.log(err);
    })
}

exports.dropTables = async function dropTables() {
    execute(queries.drop.TABLE_PERSON);
    execute(queries.drop.TABLE_OFFER);
    execute(queries.drop.TABLE_TASK);
    execute(queries.drop.TABLE_CATEGORY);
    execute(queries.drop.TABLE_TASK_STATUS);
    execute(queries.drop.TABLE_OFFER_STATUS);
    execute(queries.drop.VIEW_ALL_CATEGORY);
    execute(queries.drop.VIEW_ALL_TASK);
    execute(queries.drop.VIEW_PERSON_ALL_INFO);
    execute(queries.drop.VIEW_PERSON_LOGIN);
    execute(queries.drop.VIEW_ALL_OFFER);
}

exports.dropAllFunctions = async function dropAllFunctions() {
    console.log('Removing all functions.');
    execute(queries.drop.FUNCTIONS_ALL);
}

exports.dropAllExtensions = async function dropAllExtensions() {
    console.log("Removing all extensions.");
    execute(queries.drop.EXTENSION_FUZZYSTRMATCH);
}
//==================================================================================================================================================
// 3. Insert

exports.addTask = async function addTask(title, description, category_id, location, requester, start_dt, end_dt, price) {
    console.log('Attemping to add task: \"%s\" under user \"%s\"', title, requester);
    return execute(queries.insert.ONE_TASK, [title, description, category_id, location, requester, start_dt, end_dt, price]);
}

exports.addUser = async function addUser(username, password, email, created_dt) {
    console.log('Attempting to add user: %s', username);
    return execute(queries.insert.ONE_PERSON, [username, password, email, created_dt]);
}

exports.addOffer = async function addOffer(task_id, price, assignee, offered_dt) {
    console.log('Attempting to add offer of task id: %s', task_id);
    return execute(queries.insert.ONE_OFFER, [task_id, price, assignee, offered_dt]);
}

//==================================================================================================================================================
// 4. Update

exports.updateOfferByAssigneeAndTaskId = async function updateOfferByAssigneeAndTaskId(assignee, task_id, newPrice, newOffered_dt) {
    console.log('Attempting to update offer by assignee: %s and task_id: %s', assignee, task_id);
    return execute(queries.update.OFFER_BY_ASSIGNEE_AND_TASKID, [assignee, task_id, newPrice, newOffered_dt]);
}

exports.updateTaskById = async function updateTaskById(task_id, title, description, category_id, location, start_dt, end_dt, price) {
    console.log('Attempting to update task with task_id: %s', task_id);
    return execute(queries.update.TASK_BY_ID, [task_id, title, description, category_id, location, start_dt, end_dt, price]);
}

exports.updateTaskUponAcceptingOfferByTaskID = async function updateTaskUponAcceptingOfferByTaskID(task_id, assignee, offer_price) {
    console.log('Attempting to update task status to accepted with task_id: %s', task_id);
    return execute(queries.update.TASK_UPON_ACCEPTING_OFFER_BY_TASK_ID, [task_id, assignee, offer_price]);
}

exports.updateTaskUponRejectingOfferByTaskID = async function updateTaskUponRejectingOfferByTaskID(task_id, offer_id) {
    console.log('Attempting to update offer status to rejected with task_id: %s', task_id);
    return execute(queries.update.TASK_UPON_REJECTING_OFFER_BY_TASK_ID, [task_id, offer_id]);
}

//==================================================================================================================================================
// 5. Delete

// **TO DO: Need to change the parameters to delete 1 task
exports.deleteTask = async function deleteTask(title, description) {
    console.log('Attemping to delete task: \"%s\"', title);
    return execute(queries.delete.ONE_POPULATED_TASK, [title, description]);
}

exports.deleteTaskById = async function deleteTaskById(id) {
    console.log('Attemping to delete task by id: \"%s\"', id);
    return execute(queries.delete.ONE_TASK, [id]);
}

exports.deleteOfferByAssigneeAndTaskId = async function deleteOfferByAssigneeAndTaskId(assignee, task_id) {
    console.log('Attempting to delete offer with assignee: \"%s\" and task_id: \"%s\"', assignee, task_id);
    return execute(queries.delete.OFFER_BY_ASSIGNEE_AND_TASKID, [assignee, task_id]);
}

//==================================================================================================================================================
// 6. Select

// ======================================================
// 6.1. User

exports.getUserById = async function getUserById(id) {
    console.log('Attempting to find user by id: ' + id);
    return execute(queries.get.USER_BY_ID, [id]);
}

exports.getUserByName = async function getUserByName(username) {
    console.log('Attempting to find user by name: ' + username);
    return execute(queries.get.USER_BY_NAME, [username]);
}
// ======================================================
// 6.2. Category

exports.getCategories = async function getCategories() {
    console.log('Attempting to get all categories');
    return execute(queries.get.ALL_CATEGORIES);
}

// ======================================================
// 6.3. Task

exports.getAllTasks = async function getAllTasks() {
    console.log('Attempting to get all tasks');
    return execute(queries.get.ALL_TASKS);
}

exports.getTasksWithOffersByOfferAssignee = async function getTasksWithOffersByOfferAssignee(offer_assignee) {
    console.log('Attempting to get tasks with offers by assignee: %s', offer_assignee);
    return execute(queries.get.TASK_WITH_OFFER_BY_OFFER_ASSIGNEE, [offer_assignee]);
}

exports.getTasksWithAcceptedOffersByOfferAssignee = async function getTasksWithAcceptedOffersByOfferAssignee(offer_assignee) {
    console.log('Attempting to get tasks with accepted offers by assignee: %s', offer_assignee);
    return execute(queries.get.TASK_WITH_ACCEPTED_OFFER_BY_OFFER_ASSIGNEE, [offer_assignee]);
}

exports.getTasksWithPendingOffersByOfferAssignee = async function getTasksWithPendingOffersByOfferAssignee(offer_assignee) {
    console.log('Attempting to get tasks with pending offers by assignee: %s', offer_assignee);
    return execute(queries.get.TASK_WITH_PENDING_OFFER_BY_OFFER_ASSIGNEE, [offer_assignee]);
}

exports.getTasksWithRejectedOffersByOfferAssignee = async function getTasksWithRejectedOffersByOfferAssignee(offer_assignee) {
    console.log('Attempting to get tasks with rejected offers by assignee: %s', offer_assignee);
    return execute(queries.get.TASK_WITH_REJECTED_OFFER_BY_OFFER_ASSIGNEE, [offer_assignee]);
}

exports.getTasksByCategoryId = async function getTasksByCategoryId(category_id) {
    console.log('Attempting to get tasks by category_id: %s', category_id);
    return execute(queries.get.TASK_BY_CATEGORY_ID, [category_id]);
}

exports.getTaskById = async function getTaskById(task_id) {
    console.log('Attempting to get task by its id: %s', task_id);
    return execute(queries.get.TASK_BY_ID, [task_id]);
}

exports.getTasksByRequester = async function getTasksByRequester(requester) {
    console.log('Attempting to get task by its requester: %s', requester);
    return execute(queries.get.TASK_BY_REQUESTER, [requester]);
}

exports.getTasksWithOfferedStatusByRequester = async function getTasksWithOfferedStatusByRequester(requester) {
    console.log('Attempting to get offered task by its requester: %s', requester);
    return execute(queries.get.TASK_WITH_OFFERED_STATUS_BY_REQUESTER, [requester]);
}

exports.getTasksWithAcceptedStatusByRequester = async function getTasksWithAcceptedStatusByRequester(requester) {
    console.log('Attempting to get accepted task by its requester: %s', requester);
    return execute(queries.get.TASK_WITH_ACCEPTED_STATUS_BY_REQUESTER, [requester]);
}

exports.getTasksWithOpenStatusByRequester = async function getTasksWithOpenStatusByRequester(requester) {
    console.log('Attempting to get open task by its requester: %s', requester);
    return execute(queries.get.TASK_WITH_OPEN_STATUS_BY_REQUESTER, [requester]);
}

exports.getTasksBySearchMatchNameOrDescription = async function getTasksBySearchMatchNameOrDescription(search_string) {
    console.log('Attempting to get tasks by search string: \"%s\"', search_string);
    return execute(queries.get.TASK_BY_SEARCH_MATCH_NAME_OR_DESCRIPTION, [search_string]);
}

exports.getTasksByAdvancedSearch = async function getTasksByAdvancedSearch(search_string, category_id, location,
                                                        requester, start_dt, min_price, max_price, status_task, assignee) {
    console.log('Attempting to get tasks by advanced search string: \"%s\", category_id: \"%s\", location \"%s\", requester: \"%s\", start_dt: \"%s\", min_price: \"%s\", max_price: \"%s\", status_task: \"%s\", assignee: \"%s\"', search_string, category_id, location, requester, start_dt, min_price, max_price, status_task, assignee);
    return execute(queries.get.TASK_ADVANCED_SEARCH, [search_string, category_id, location,
                                                    requester, start_dt, min_price, max_price,
                                                    status_task, assignee]);
}
// ======================================================
// 6.4. Offer

exports.getOffersByTaskId = async function getOffersByTaskId(task_id) {
    console.log('Attempting to get offers by its task_id: %s', task_id);
    return execute(queries.get.OFFERS_BY_TASKID, [task_id]);
}

exports.getOffersByAssigneeAndTaskId = async function getOffersByAssigneeAndTaskId(assignee, task_id) {
    console.log('Attempting to get offer by assignee: %s and task_id: %s', assignee, task_id);
    return execute(queries.get.OFFER_BY_ASSIGNEE_AND_TASKID, [assignee, task_id]);
}

exports.getOffersByAssignee = async function getOffersByAssignee(assignee) {
    console.log('Attempting to get offer by assignee: %s', assignee);
    return execute(queries.get.OFFER_BY_ASSIGNEE, [assignee]);
}

exports.getAcceptedOfferByTaskId = async function getAcceptedOfferByTaskId(task_id) {
    console.log('Attempting to get accepted offer by task_id: %s', task_id);
    return execute(queries.get.ACCEPTED_OFFER_BY_TASKID, [task_id]);
}

// ======================================================
// 6.5. Charts

exports.getNoOfTasksByCategory = async function getNoOfTasksByCategory() {
    console.log('Attempting to get number of tasks by category ID');
    return execute(queries.get.NUMBER_OF_TASK_BY_CATEGORY);
}

exports.getTotalNoOfTasks = async function getTotalNoOfTasks() {
    // body...
     console.log('Attempting to total number of tasks');
    return execute(queries.get.TOTAL_NUMBER_OF_TASKS);
}

exports.getTotalNoOfUsers = async function getTotalNoOfUsers() {
    // body...
     console.log('Attempting to total number of users');
    return execute(queries.get.TOTAL_NUMBER_OF_USERS);
}