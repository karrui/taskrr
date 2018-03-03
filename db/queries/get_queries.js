// Since this file is called get_queries and referenced by "get",
// imagine all calls to these methods to be "get.[REFERENCE]",
// i.e: get.ALL_CATEGORIES

exports.ALL_CATEGORIES = `
SELECT
    category.id,
    category.name
FROM category
ORDER BY
    category.id
;
`
exports.ALL_TASKS = `
SELECT
    task.id,
    task.title,
    task.description,
    task.category_id,
    task.location,
    task.requester,
    task.start_dt,
    task.end_dt,
    task.price,
    task.status_task,
    task.assignee
FROM task
ORDER BY
    task.start_dt
;
`
exports.USER_BY_ID = `
SELECT *
FROM person
WHERE 1=1
    AND id = $1
;
`
exports.USER_BY_NAME = `
SELECT *
FROM person
WHERE 1=1
    AND username = $1
;
`
