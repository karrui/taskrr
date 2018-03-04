// keeping in mind populated task doesn't have an id to be deleted,
// while a task that is deleted by a user themselves can easily be deleted with id

exports.ONE_POPULATED_TASK = `
    DELETE FROM task
    WHERE title = $1 and description = $2`

exports.ONE_TASK = `
    DELETE FROM task
    WHERE id = $1`