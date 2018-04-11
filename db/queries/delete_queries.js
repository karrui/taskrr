// keeping in mind populated task doesn't have an id to be deleted,
// while a task that is deleted by a user themselves can easily be deleted with id

// Populate
exports.ONE_POPULATED_TASK = `
    DELETE FROM task
    WHERE title = $1 and description = $2`

exports.ONE_POPULATED_PERSON = `
    DELETE FROM person
    WHERE username = $1`

// App calls

/* Input:
_task_id    INTEGER
*/
exports.ONE_TASK = `
    SELECT
        delete_one_task_by_task_id($1)
    ;
`

/* Input:
_assignee   VARCHAR(25),
_task_id    INTEGER
*/
exports.OFFER_BY_ASSIGNEE_AND_TASKID = `
    SELECT
        delete_offer_by_assignee_and_task_id($1, $2)
    ;
`

exports.USER_BY_USER_ID = `
    SELECT
        delete_user_by_user_id($1)
    ;
`
