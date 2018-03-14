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
