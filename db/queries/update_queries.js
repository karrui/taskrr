exports.OFFER_BY_ASSIGNEE_AND_TASKID = `
    SELECT
        update_offer_by_assignee_taskid($1, $2, $3, $4)
    ;
`

exports.TASK_BY_ID =`
    SELECT
        update_task_by_id($1, $2, $3, $4, $5, $6, $7, $8)
    ;
`
