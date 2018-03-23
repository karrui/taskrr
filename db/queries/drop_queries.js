exports.TABLE_PERSON = `
    DROP TABLE IF EXISTS person CASCADE`;

exports.TABLE_OFFER = `
    DROP TABLE IF EXISTS offer CASCADE`;

exports.TABLE_TASK = `
    DROP TABLE IF EXISTS task CASCADE`;


exports.TABLE_CATEGORY = `
    DROP TABLE IF EXISTS category CASCADE`;

exports.TABLE_TASK_STATUS = `
    DROP TABLE IF EXISTS task_status CASCADE`;

exports.TABLE_OFFER_STATUS = `
    DROP TABLE IF EXISTS offer_status CASCADE`;


exports.VIEW_PERSON_ALL_INFO = `
    DROP VIEW IF EXISTS view_person_all_info`;

exports.VIEW_PERSON_LOGIN = `
    DROP VIEW IF EXISTS view_person_login`;

exports.VIEW_ALL_TASK = `
    DROP VIEW IF EXISTS view_all_task`;

exports.VIEW_ALL_CATEGORY = `
    DROP VIEW IF EXISTS view_all_category`;

exports.VIEW_ALL_OFFER = `
    DROP VIEW IF EXISTS view_all_offer`;

exports.FUNCTIONS_ALL = `
    SELECT information_schema.f_delfunc('public');
`
