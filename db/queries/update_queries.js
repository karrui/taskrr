exports.OFFER_BY_ASSIGNEE_AND_TASKID = `
    UPDATE offer
    SET price = $3, offered_dt = $4
    WHERE 1=1
        AND assignee = $1
        AND task_id = $2
`

exports.TASK_BY_ID =`
    UPDATE task
    SET title = $2, description = $3, category_id = $4, location = $5, start_dt = $6, end_dt = $7, price = $8
    WHERE 1=1
        AND id = $1
`