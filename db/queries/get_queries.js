// Since this file is called get_queries and referenced by "get",
// imagine all calls to these methods to be "get.[REFERENCE]",
// i.e: get.ALL_CATEGORIES


exports.ALL_CATEGORIES =
    'SELECT * FROM category ' +
    'ORDER BY id';
    
exports.ALL_TASKS =
    'SELECT * FROM task ' +
    'ORDER BY start_dt';

exports.USER_BY_ID =
    'SELECT * ' +
    'FROM person ' +
    'WHERE id = $1';

exports.USER_BY_NAME = 
    'SELECT * ' +
    'FROM person ' +
    'WHERE username = $1';