// Since this file is called create_queries and referenced by create,
// imagine all calls to these methods to be create.[REFERENCE],
// i.e: create.EXAMPLE_TABLE

/*
    List of contents:
    1. Table
    2. View

*/

//======================================================================================================================
// 1. Table

exports.TABLE_PERSON = `
CREATE TABLE IF NOT EXISTS person (
    id               SERIAL             PRIMARY KEY,
	username         VARCHAR(25)        UNIQUE NOT NULL,
	password         CHAR(100) 		    NOT NULL,
	email            TEXT 		    	UNIQUE NOT NULL,
	created_dt 	     TIMESTAMP 		    NOT NULL,
	role 			 VARCHAR(10) 	    DEFAULT 'member' NOT NULL
);
`

exports.TABLE_CATEGORY = `
CREATE TABLE IF NOT EXISTS category (
	id			     SERIAL	       		PRIMARY KEY,
	name			 TEXT		      	UNIQUE NOT NULL
);
`

exports.TABLE_TASK_STATUS = `
CREATE TABLE IF NOT EXISTS task_status (
	status	    	 VARCHAR(8)		    PRIMARY KEY
);
`

exports.TABLE_TASK = `
CREATE TABLE IF NOT EXISTS task (
	id 			     CHAR(6)			PRIMARY KEY,
	title 		     TEXT 			    NOT NULL,
	description	     TEXT		       	NOT NULL,
	category_id	     INTEGER			NOT NULL 					REFERENCES category (id) ON UPDATE CASCADE,
	location		 TEXT			    NOT NULL,
	requester		 VARCHAR(25)		NOT NULL					REFERENCES person (username) ON DELETE CASCADE,
	start_dt		 TIMESTAMP		    NOT NULL,
	end_dt		     TIMESTAMP		    NOT NULL,
	price			 MONEY		       	NOT NULL,
	status_task	     VARCHAR(8)	       	DEFAULT 'open' NOT NULL		REFERENCES task_status (status) ON UPDATE CASCADE,
	assignee		 VARCHAR(25)		DEFAULT NULL 				REFERENCES person (username) ON DELETE SET NULL
);
`

exports.TABLE_OFFER = `
CREATE TABLE IF NOT EXISTS offer (
	id		         CHAR(6)			PRIMARY KEY,
	task_id		     CHAR(6)			NOT NULL					REFERENCES task (id) ON DELETE CASCADE,
	price			 MONEY			    NOT NULL,
	assignee		 VARCHAR(25)		NOT NULL					REFERENCES person (username) ON DELETE CASCADE,
	offered_dt	     TIMESTAMP		    NOT NULL,
	status_offer	 VARCHAR(8)		    DEFAULT 'pending' NOT NULL
);
`

//======================================================================================================================
// 2. View

// This view is for user login check
exports.VIEW_PERSON_LOGIN = `
CREATE OR REPLACE VIEW view_person_login AS (
	SELECT
        person.id,
        person.username,
        person.password,
        person.role
	FROM person
);
`
// This view is for Admin management, not showing person.password
exports.VIEW_PERSON_ALL_INFO = `
CREATE OR REPLACE VIEW view_person_all_info AS (
	SELECT
        person.id,
        person.username,
        person.email,
        person.created_dt,
        person.role
	FROM person
);
`

exports.VIEW_ALL_TASK = `
CREATE OR REPLACE VIEW view_all_task AS (
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
);
`

exports.VIEW_ALL_CATEGORY = `
CREATE OR REPLACE VIEW view_all_category AS (
    SELECT
        category.id,
        category.name
    FROM category
);`
