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
