// Since this file is called insert_queries and referenced by "insert",
// imagine all calls to these methods to be "insert.[REFERENCE]",
// i.e: insert.ONE_TASK

// Calling Functions

exports.ONE_TASK = `
    SELECT
        insert_one_task($1, $2, $3, $4, $5, $6, $7, $8)
    ;
`

exports.ONE_PERSON = `
    SELECT
        insert_one_person($1, $2, $3, $4)
    ;
`
