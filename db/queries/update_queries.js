/* Input:
_assignee       VARCHAR(25),
_task_id        INTEGER,
_price          MONEY,
_offered_dt     TIMESTAMP
*/
exports.OFFER_BY_ASSIGNEE_AND_TASKID = `
    SELECT
        update_offer_by_assignee_taskid($1, $2, $3, $4)
    ;
`

/* Input:
_id             INTEGER,
_title          TEXT,
_description    TEXT,
_category_id    INTEGER,
_location       TEXT,
_start_dt       TIMESTAMP,
_end_dt         TIMESTAMP,
_price          MONEY
*/
exports.TASK_BY_ID =`
    SELECT
        update_task_by_id($1, $2, $3, $4, $5, $6, $7, $8)
    ;
`

// This function updates the Task_status to 'accepted' and updates all linked offers' statuses to 'rejected'
/* Input:
_task_id             INTEGER,
_assignee            VARCHAR(25),
_offer_price         MONEY
*/
exports.TASK_UPON_ACCEPTING_OFFER_BY_TASK_ID = `
    SELECT
        update_task_upon_accepting_offer_by_task_id($1, $2, $3)
    ;
`

// This function updates the Task_status to 'open' if all offers are rejected and updates the offer to 'rejected'
/* Input:
_task_id             INTEGER,
_offer_id            INTEGER
*/
exports.TASK_UPON_REJECTING_OFFER_BY_TASK_ID = `
    SELECT
        update_task_upon_rejecting_offer_by_task_id($1, $2)
    ;
`
