exports.OFFER_BY_ASSIGNEE_AND_TASKID = `
    UPDATE offer
    SET price = $3, offered_dt = $4
    WHERE 1=1
        AND assignee = $1
        AND task_id = $2
`
