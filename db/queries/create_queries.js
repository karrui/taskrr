// Since this file is called create_queries and referenced by create,
// imagine all calls to these methods to be create.[REFERENCE],
// i.e: create.EXAMPLE_TABLE

/*
    List of contents:
    1. Table
    2. View
    3. Functions
    4. Function calls for Create
*/

//======================================================================================================================
// 1. Table

exports.TABLE_PERSON = `
    CREATE TABLE IF NOT EXISTS person (
        id               SERIAL             PRIMARY KEY,
        username         VARCHAR(25)        UNIQUE NOT NULL,
	    password         CHAR(60)  		    NOT NULL,
	    email            TEXT 		    	UNIQUE NOT NULL,
	    created_dt 	     TIMESTAMP 		    NOT NULL,
	    role 			 VARCHAR(10) 	    DEFAULT 'member' NOT NULL
    )
    ;
`

exports.TABLE_CATEGORY = `
    CREATE TABLE IF NOT EXISTS category (
	    id			     SERIAL	       		PRIMARY KEY,
	    name			 TEXT		      	UNIQUE NOT NULL
    )
    ;
`

exports.TABLE_TASK_STATUS = `
    CREATE TABLE IF NOT EXISTS task_status (
	    status	    	 VARCHAR(8)		    PRIMARY KEY
    )
    ;
`

exports.TABLE_TASK = `
    CREATE TABLE IF NOT EXISTS task (
	    id 			     SERIAL			    PRIMARY KEY,
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
    )
    ;
`

exports.TABLE_OFFER_STATUS = `
    CREATE TABLE IF NOT EXISTS offer_status (
        status           VARCHAR(8)         PRIMARY KEY
    )
    ;
`

exports.TABLE_OFFER = `
    CREATE TABLE IF NOT EXISTS offer (
	    id		         SERIAL		      	PRIMARY KEY,
	    task_id		     INTEGER			NOT NULL					REFERENCES task (id) ON DELETE CASCADE,
	    price			 MONEY			    NOT NULL,
	    assignee		 VARCHAR(25)		NOT NULL					REFERENCES person (username) ON DELETE CASCADE,
	    offered_dt	     TIMESTAMP		    NOT NULL,
	    status_offer	 VARCHAR(8)		    DEFAULT 'pending' NOT NULL  REFERENCES offer_status (status) ON UPDATE CASCADE
    )
    ;
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
    )
    ;
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
    )
    ;
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
    )
    ;
`

exports.VIEW_ALL_CATEGORY = `
    CREATE OR REPLACE VIEW view_all_category AS (
        SELECT
            category.id,
            category.name
        FROM category
    )
    ;
`

exports.VIEW_ALL_OFFER = `
    CREATE OR REPLACE VIEW view_all_offer AS (
        SELECT
            offer.id,
            offer.task_id,
            offer.price,
            offer.assignee,
            offer.offered_dt,
            offer.status_offer
        FROM offer
    )
    ;
`

//======================================================================================================================
// 3. Functions

exports.FUNCTION_INSERT_ONE_TASK = `
    CREATE OR REPLACE FUNCTION insert_one_task (
        _title          TEXT,
        _description    TEXT,
        _category_id    INTEGER,
        _location       TEXT,
        _requester      VARCHAR(25),
        _start_dt       TIMESTAMP,
        _end_dt         TIMESTAMP,
        _price          MONEY
    )
    RETURNS void AS
    $BODY$
        BEGIN
            INSERT INTO task
                (
                    title,
                    description,
                    category_id,
                    location,
                    requester,
                    start_dt,
                    end_dt,
                    price
                )
            VALUES
                (
                    _title,
                    _description,
                    _category_id,
                    _location,
                    _requester,
                    _start_dt,
                    _end_dt,
                    _price
                )
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_INSERT_ONE_PERSON = `
    CREATE OR REPLACE FUNCTION insert_one_person (
        _username       VARCHAR(25),
        _password       CHAR(100),
        _email          TEXT,
        _created_dt     TIMESTAMP
    )
    RETURNS void AS
    $BODY$
        BEGIN
            INSERT INTO person
                (
                    username,
                    password,
                    email,
                    created_dt
                )
            VALUES(
                _username,
                _password,
                _email,
                _created_dt
            )
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_INSERT_ONE_OFFER = `
    CREATE OR REPLACE FUNCTION insert_one_offer (
        _task_id        INTEGER,
        _price          MONEY,
        _assignee       VARCHAR(25),
        _offered_dt     TIMESTAMP
    )
    RETURNS void AS
    $BODY$
        BEGIN
            INSERT INTO offer
                (
                    task_id,
                    price,
                    assignee,
                    offered_dt
                )
            VALUES(
                _task_id,
                _price,
                _assignee,
                _offered_dt
            )
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_UPDATE_OFFER_BY_ASSIGNEE_AND_TASKID = `
    CREATE OR REPLACE FUNCTION update_offer_by_assignee_taskid (
        _assignee       VARCHAR(25),
        _task_id        INTEGER,
        _price          MONEY,
        _offered_dt     TIMESTAMP
    )
    RETURNS void AS
    $BODY$
        BEGIN
            UPDATE offer
            SET
                price = _price,
                offered_dt = _offered_dt
            WHERE 1=1
                AND assignee = _assignee
                AND task_id = _task_id
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_UPDATE_TASK_BY_ID = `
    CREATE OR REPLACE FUNCTION update_task_by_id (
        _id             INTEGER,
        _title          TEXT,
        _description    TEXT,
        _category_id    INTEGER,
        _location       TEXT,
        _start_dt       TIMESTAMP,
        _end_dt         TIMESTAMP,
        _price          MONEY
    )
    RETURNS void AS
    $BODY$
        BEGIN
            UPDATE task
            SET
                title = _title,
                description = _description,
                category_id = _category_id,
                location = _location,
                start_dt = _start_dt,
                end_dt = _end_dt,
                price = _price
            WHERE 1=1
                AND id = _id
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_CREATE_INDEX_PERSON = `
    CREATE OR REPLACE FUNCTION create_index_table_person ()
    RETURNS void AS
    $BODY$
        BEGIN
            CREATE INDEX IF NOT EXISTS idx_person_role          ON person (role             DESC);
            CREATE INDEX IF NOT EXISTS idx_person_created_dt    ON person (created_dt       DESC);
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_CREATE_INDEX_TASK = `
    CREATE OR REPLACE FUNCTION create_index_table_task ()
    RETURNS void AS
    $BODY$
        BEGIN
            CREATE INDEX IF NOT EXISTS idx_task_category_id     ON task (category_id);
            CREATE INDEX IF NOT EXISTS idx_task_requester       ON task (requester          DESC);
            CREATE INDEX IF NOT EXISTS idx_task_status_task     ON task (status_task        DESC);
            CREATE INDEX IF NOT EXISTS idx_task_assignee        ON task (assignee           NULLS LAST);
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_CREATE_INDEX_OFFER = `
    CREATE OR REPLACE FUNCTION create_index_table_offer ()
    RETURNS void AS
    $BODY$
        BEGIN
            CREATE INDEX IF NOT EXISTS idx_offer_task_id        ON offer (task_id);
            CREATE INDEX IF NOT EXISTS idx_offer_assignee       ON offer (assignee);
            CREATE INDEX IF NOT EXISTS idx_offer_status_offer   ON offer (status_offer);
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

//======================================================================================================================
// 4. Function calls for Create

exports.INDEX_TABLE_PERSON = `
    SELECT
        create_index_table_person()
    ;
`

exports.INDEX_TABLE_TASK = `
    SELECT
        create_index_table_task()
    ;
`

exports.INDEX_TABLE_OFFER = `
    SELECT
        create_index_table_offer()
    ;
`
