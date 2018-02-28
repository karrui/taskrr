// Add your queries in here in the following format:

exports.ADD_TASK =
    'INSERT INTO task' +
    ' (id, title, description, category_id, location, requester, start_dt, end_dt, price, status_task, assignee)' +
    ' VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, DEFAULT, DEFAULT);';
    
exports.GET_CATEGORIES =
    'SELECT * FROM category ' +
    'ORDER BY id';
    
exports.GET_ALL_TASKS =
    'SELECT * FROM task ' +
    'ORDER BY start_dt';