// Since this file is called get_queries and referenced by "get",
// imagine all calls to these methods to be "get.[REFERENCE]",
// i.e: get.ALL_CATEGORIES

exports.ALL_CATEGORIES = `
    SELECT
        view_all_category.id,
        view_all_category.name
    FROM view_all_category
    ORDER BY
        view_all_category.id
    ;
`

exports.ALL_TASKS = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    ORDER BY
        view_all_task.start_dt
    ;
`

exports.TASK_BY_CATEGORY_ID = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND view_all_task.category_id = $1
    ORDER BY
        view_all_task.start_dt
    ;
`
exports.TASK_BY_ID = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND view_all_task.id = $1
;
`

exports.TASK_WITH_OFFER_BY_OFFER_ASSIGNEE = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price AS task_price,
        view_all_task.status_task,
        view_all_task.assignee AS task_assignee,
        view_all_offer.id AS offer_id,
        view_all_offer.price AS offer_price,
        view_all_offer.assignee AS offer_assignee,
        view_all_offer.offered_dt,
        view_all_offer.status_offer
    FROM view_all_task
    INNER JOIN view_all_offer
        ON view_all_offer.task_id = view_all_task.id
    WHERE 1=1
        AND view_all_offer.assignee = $1
    ;
`

exports.TASK_BY_REQUESTER = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND view_all_task.requester = $1
    ORDER BY
        view_all_task.id DESC
    ;
`

exports.TASK_WITH_OFFERED_STATUS_BY_REQUESTER = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND view_all_task.requester = $1
        AND view_all_task.status_task = 'offered'
    ORDER BY
        view_all_task.id DESC
    ;
`

exports.TASK_WITH_ACCEPTED_STATUS_BY_REQUESTER = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND view_all_task.requester = $1
        AND view_all_task.status_task = 'accepted'
    ORDER BY
        view_all_task.id DESC
    ;
`

exports.TASK_WITH_OPEN_STATUS_BY_REQUESTER = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND view_all_task.requester = $1
        AND view_all_task.status_task = 'open'
    ORDER BY
        id DESC
    ;
`

exports.OFFERS_BY_TASKID = `
    SELECT
        view_all_offer.id,
        view_all_offer.task_id,
        view_all_offer.price,
        view_all_offer.assignee,
        view_all_offer.offered_dt,
        view_all_offer.status_offer
    FROM view_all_offer
    WHERE 1=1
        AND view_all_offer.task_id = $1
    ;
`

exports.OFFER_BY_ASSIGNEE_AND_TASKID = `
    SELECT
        view_all_offer.id,
        view_all_offer.task_id,
        view_all_offer.price,
        view_all_offer.assignee,
        view_all_offer.offered_dt,
        view_all_offer.status_offer
    FROM view_all_offer
    where 1=1
        AND view_all_offer.assignee = $1
        AND view_all_offer.task_id = $2
    ;
`

exports.OFFER_BY_ASSIGNEE = `
    SELECT
        view_all_offer.id,
        view_all_offer.task_id,
        view_all_offer.price,
        view_all_offer.assignee,
        view_all_offer.offered_dt,
        view_all_offer.status_offer
    FROM view_all_offer
    where 1=1
        AND view_all_offer.assignee = $1
    ;
`

exports.USER_BY_ID = `
    SELECT
        view_person_login.id,
        view_person_login.username,
        view_person_login.password,
        view_person_login.role
    FROM view_person_login
    WHERE 1=1
        AND view_person_login.id = $1
    ;
`

exports.USER_BY_NAME = `
    SELECT
        view_person_login.id,
        view_person_login.username,
        view_person_login.password,
        view_person_login.role
    FROM view_person_login
    WHERE 1=1
        AND view_person_login.username = $1
    ;
`

// Note that ILIKE is pretty inefficient
exports.TASK_BY_SEARCH_MATCH_NAME_OR_DESCRIPTION = `
    SELECT
        view_all_task.id,
        view_all_task.title,
        view_all_task.description,
        view_all_task.category_id,
        view_all_task.category_name,
        view_all_task.location,
        view_all_task.requester,
        view_all_task.start_dt,
        view_all_task.end_dt,
        view_all_task.price,
        view_all_task.status_task,
        view_all_task.assignee
    FROM view_all_task
    WHERE 1=1
        AND (view_all_task.title ILIKE '%' || $1 || '%'
        OR view_all_task.description ILIKE '%' || $1 || '%')
    ;
`