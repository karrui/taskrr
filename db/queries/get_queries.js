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

//Returns 3 out put - id, name, count
exports.NUMBER_OF_TASK_BY_CATEGORY = `
    SELECT
        view_all_category.id,
        view_all_category.name,
        xTmp.no_task
    FROM view_all_category
    INNER JOIN (
        SELECT
            view_all_task.category_id,
            count(*) AS no_task
        FROM view_all_task
        GROUP BY
            view_all_task.category_id
        ) xTmp
    ON xTmp.category_id = view_all_category.id
    ;
`
exports.TOTAL_NUMBER_OF_TASKS = `
    SELECT
        COUNT(*)
    FROM view_all_task
    ;
`

exports.TOTAL_NUMBER_OF_USERS =`
    SELECT
        COUNT(*)
    FROM view_person_all_info
    ;
`

exports.TOTAL_NUMBER_OF_USERS_BY_MONTH = `
    SELECT
        to_char(date_trunc('month', view_person_all_info.created_dt), 'MM/YY') AS month,
        count(*) AS usercount
    FROM view_person_all_info
    WHERE
        view_person_all_info.created_dt::DATE > (CURRENT_DATE - INTERVAL '6 months')
    GROUP BY
        date_trunc('month', view_person_all_info.created_dt)
    ORDER BY
        date_trunc('month',view_person_all_info.created_dt)
    ;
`

exports.TOTAL_NUMBER_OF_USERS_BY_DATE_IN_1_MONTH = `
    SELECT
        to_char(date_trunc('day', view_person_all_info.created_dt), 'DD/MM/YY') AS date,
        count(*) AS usercount
    FROM
        view_person_all_info
    WHERE
        view_person_all_info.created_dt::DATE > (CURRENT_DATE - INTERVAL '1 month')
    GROUP BY
        date_trunc('day', view_person_all_info.created_dt)
    ORDER BY
        date_trunc('day', view_person_all_info.created_dt)
    ;
`

exports.TOTAL_NUMBER_OF_TASKS_CREATED_BY_MONTH = `
    SELECT
        to_char(date_trunc('month',view_all_task.start_dt), 'MM/YY') AS month,
        count(*) AS taskcount
	FROM
        view_all_task
    WHERE
        view_all_task.start_dt::DATE > (CURRENT_DATE - INTERVAL '6 months')
    GROUP BY
        date_trunc('month', view_all_task.start_dt)
    ORDER BY
        date_trunc('month', view_all_task.start_dt)
    ;
`

exports.TOTAL_NUMBER_OF_TASKS_CREATED_BY_DATE_IN_1_MONTH = `
    SELECT
        to_char(date_trunc('day',view_all_task.start_dt), 'DD/MM/YY') AS date,
        count(*) AS taskcount
    FROM
        view_all_task
    WHERE
        view_all_task.start_dt::DATE > (CURRENT_DATE - INTERVAL '1 month')
    GROUP BY
        date_trunc('day', view_all_task.start_dt)
    ORDER BY
        date_trunc('day', view_all_task.start_dt)
    ;
`

exports.TOTAL_NUMBER_OF_OFFERS_CREATED_BY_MONTH = `
    SELECT
        to_char(date_trunc('month', view_all_offer.offered_dt), 'MM/YY') AS month,
        count(*) AS offerCount
  	FROM
  	    view_all_offer
  	WHERE
        view_all_offer.offered_dt::DATE > (CURRENT_DATE - INTERVAL '6 months')
    GROUP BY
        date_trunc('month', view_all_offer.offered_dt)
    ORDER BY
        date_trunc('month', view_all_offer.offered_dt)
    ;
`

exports.TOTAL_NUMBER_OF_OFFERS_CREATED_BY_DATE_IN_1_MONTH = `
    SELECT
        to_char(date_trunc('day', view_all_offer.offered_dt), 'DD/MM/YY') AS date,
        count(*) AS offerCount
    FROM
        view_all_offer
    WHERE
        view_all_offer.offered_dt::DATE > (CURRENT_DATE - INTERVAL '1 month')
    GROUP BY
        date_trunc('day', view_all_offer.offered_dt)
    ORDER BY
        date_trunc('day', view_all_offer.offered_dt)
    ;
`

/*exports.TOTAL_NUMBER_OF_TASKS_AND_OFFERS_BY_MONTH=`
WITH tasksByMonth AS (
	SELECT
   	count(*) AS taskCount,
   	to_char(view_all_task.start_dt, 'MM/YY') AS MONTH
   	FROM
    view_all_task
    WHERE
    view_all_task.created_dt::DATE > (CURRENT_DATE - INTERVAL '6 months')
    GROUP BY
    view_all_task.created_dt
    ORDER BY
    view_all_task.created_dt),
    offersByMonth AS (
    SELECT
  	count(*) AS offerCount,
  	to_char(view_all_offer.start_dt, 'MM/YY') AS MONTH
  	FROM
    view_all_offer
    WHERE
    view_all_offer.created_dt::DATE > (CURRENT_DATE - INTERVAL '6 months')
    GROUP BY
    view_all_offer.created_dt
    ORDER BY
    view_all_offer.created_dt)
SELECT tasksByMonth.taskCount as taskCount,
offersByMonth.offerCount as offerCount,
tasksByMonth.MONTH as MONTHS,
FROM tasksByMonth, offersByMonth
WHERE tasksByMonth.MONTH = offersByMonth.MONTH
ORDER BY
MONTHS;
`
*/

exports.ALL_USER_INFO = `
    SELECT
    view_person_all_info.id,
    view_person_all_info.username,
    view_person_all_info.email,
    view_person_all_info.created_dt,
    view_person_all_info.role
    FROM view_person_all_info
    ORDER BY
    view_person_all_info.id;
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
        view_all_task.id DESC
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
        view_all_task.id DESC
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

exports.TASK_WITH_ACCEPTED_OFFER_BY_OFFER_ASSIGNEE = `
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
        AND view_all_offer.status_offer = 'accepted'
    ;
`

exports.TASK_WITH_PENDING_OFFER_BY_OFFER_ASSIGNEE = `
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
        AND view_all_offer.status_offer = 'pending'
    ;
`

exports.TASK_WITH_REJECTED_OFFER_BY_OFFER_ASSIGNEE = `
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
        AND view_all_offer.status_offer = 'rejected'
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
        view_all_task.id DESC
    ;
`

// Search all tasks, having title and/or description contains all the words in the search sentence
/* Input:
_search_string    TEXT            DEFAULT NULL
*/
exports.TASK_BY_SEARCH_MATCH_NAME_OR_DESCRIPTION = `
    SELECT * FROM get_tasks_with_basic_search($1);
`

/* Input:
_search_string    TEXT            DEFAULT NULL,
_category_id      TEXT            DEFAULT NULL,
_location         TEXT            DEFAULT NULL,
_requester        TEXT            DEFAULT NULL,
_start_dt         TEXT            DEFAULT NULL,
_min_price        TEXT            DEFAULT NULL,
_max_price        TEXT            DEFAULT NULL,
_status_task      TEXT            DEFAULT NULL,
_assignee         TEXT            DEFAULT NULL
*/
exports.TASK_ADVANCED_SEARCH = `
    SELECT * FROM get_tasks_with_advanced_search($1, $2, $3, $4, $5, $6, $7, $8, $9);
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
    ORDER BY
        view_all_offer.offered_dt DESC
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
    ORDER BY
        view_all_offer.offered_dt DESC
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
    WHERE 1=1
        AND view_all_offer.assignee = $1
    ORDER BY
        view_all_offer.offered_dt DESC
    ;
`

exports.ACCEPTED_OFFER_BY_TASKID = `
    SELECT
        view_all_offer.id,
        view_all_offer.task_id,
        view_all_offer.price,
        view_all_offer.assignee,
        view_all_offer.offered_dt,
        view_all_offer.status_offer
    FROM view_all_offer
    where 1=1
        AND view_all_offer.task_id = $1
        AND view_all_offer.status_offer = 'accepted'
    ORDER BY
        view_all_offer.offered_dt DESC
    ;
`

exports.USER_BY_ID = `
    SELECT
        view_person_login.id,
        view_person_login.username,
        view_person_login.password,
        view_person_login.role,
        view_person_login.email
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
        view_person_login.role,
        view_person_login.email
    FROM view_person_login
    WHERE 1=1
        AND view_person_login.username = $1
    ;
`
