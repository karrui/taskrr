// Since this file is called insert_queries and referenced by "insert",
// imagine all calls to these methods to be "insert.[REFERENCE]",
// i.e: insert.ONE_TASK

// Calling Functions

/* Input:
_title TEXT,
_description TEXT,
_category_id INTEGER,
_location TEXT,
_requester VARCHAR(25),
_start_dt TIMESTAMP,
_end_dt TIMESTAMP,
_price NUMERIC(6, 2)
*/
exports.ONE_TASK = `
    SELECT
        insert_one_task($1, $2, $3, $4, $5, $6, $7, $8)
    ;
`

/* Input:
_username VARCHAR(25),
_password CHAR(100),
_email TEXT,
_created_dt TIMESTAMP
*/
exports.ONE_PERSON = `
    SELECT
        insert_one_person($1, $2, $3, $4)
    ;
`

/* Input:
_task_id INTEGER,
_price NUMERIC(6, 2),
_assignee VARCHAR(25),
_offered_dt TIMESTAMP
*/
exports.ONE_OFFER = `
    SELECT
        insert_one_offer($1, $2, $3, $4)
    ;
`

/* Input:
_id SERIAL,
_name TEXT
*/
exports.ONE_CATEGORY = `
    INSERT INTO category
    VALUES ($1, $2)
    ;
`

exports.ONE_POPULATED_OFFER = `
    INSERT INTO offer (task_id, price, assignee, offered_dt, status_offer)
    VALUES ($1, $2, $3, $4, $5)
    ;
`
exports.ONE_OFFER_STATUS = `
    INSERT INTO offer_status
    VALUES ($1)
    ;
`
exports.ONE_TASK_STATUS = `
    INSERT INTO task_status
    VALUES ($1)
    ;
`
