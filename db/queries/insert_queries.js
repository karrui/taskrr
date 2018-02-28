// Since this file is called insert_queries and referenced by "insert",
// imagine all calls to these methods to be "insert.[REFERENCE]",
// i.e: insert.ONE_TASK

exports.ONE_TASK =
    'INSERT INTO task' +
    ' (id, title, description, category_id, location, requester, start_dt, end_dt, price, status_task, assignee)' +
    ' VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, DEFAULT, DEFAULT);';
    