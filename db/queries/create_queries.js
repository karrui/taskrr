// Since this file is called create_queries and referenced by create,
// imagine all calls to these methods to be create.[REFERENCE],
// i.e: create.EXAMPLE_TABLE

/* TABLE OF CONTENTS
    1. Table
    2. View
    3. Function
    ├── 3.1. Create
    ├── 3.2. Insert
    ├── 3.3. Update
    ├── 3.4. Delete
    ├── 3.5. Select
    ├── 3.6. Helper
    4. Function calls for Create
    5. Extension
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
	    price			 NUMERIC(6, 2)		NOT NULL,
	    status_task	     VARCHAR(8)	       	DEFAULT 'open' NOT NULL		REFERENCES task_status (status) ON UPDATE CASCADE,
	    assignee		 VARCHAR(25)		DEFAULT NULL 				REFERENCES person (username) ON DELETE SET NULL,
        CHECK (start_dt <= end_dt),
        CHECK (price >= 0 and price < 10000)
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
	    price			 NUMERIC(6, 2)		NOT NULL,
	    assignee		 VARCHAR(25)		NOT NULL					REFERENCES person (username) ON DELETE CASCADE,
	    offered_dt	     TIMESTAMP		    NOT NULL,
	    status_offer	 VARCHAR(8)		    DEFAULT 'pending' NOT NULL  REFERENCES offer_status (status) ON UPDATE CASCADE,
        UNIQUE (task_id, assignee),
        CHECK (price >= 0 and price < 10000)
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
            category.name as category_name,
            task.location,
            task.requester,
            task.start_dt,
            task.end_dt,
            task.price,
            task.status_task,
            task.assignee
	    FROM task
        INNER JOIN category
            ON category.id = task.category_id
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
// 3. Function

// ======================================================
// 3.1. Create

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

// ======================================================
// 3.2. Insert

exports.FUNCTION_INSERT_ONE_TASK = `
    CREATE OR REPLACE FUNCTION insert_one_task (
        _title          TEXT,
        _description    TEXT,
        _category_id    INTEGER,
        _location       TEXT,
        _requester      VARCHAR(25),
        _start_dt       TIMESTAMP,
        _end_dt         TIMESTAMP,
        _price          NUMERIC(6, 2)
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
        _price          NUMERIC(6, 2),
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
            SELECT
                _task_id,
                _price,
                _assignee,
                _offered_dt
            WHERE 1=1
                AND _assignee IS DISTINCT FROM (
                    SELECT task.requester
                    FROM task
                    WHERE 1=1
                        AND task.id = _task_id
                )
            ;
            UPDATE task
            SET
                status_task = 'offered'
            WHERE 1=1
                AND id = _task_id
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

// ======================================================
// 3.3. Update

// Change status_task to 'offered' only status_task is currently 'open'
exports.FUNCTION_UPDATE_OFFER_BY_ASSIGNEE_AND_TASKID = `
    CREATE OR REPLACE FUNCTION update_offer_by_assignee_taskid (
        _assignee       VARCHAR(25),
        _task_id        INTEGER,
        _price          NUMERIC(6, 2),
        _offered_dt     TIMESTAMP
    )
    RETURNS void AS
    $BODY$
        BEGIN
            UPDATE offer
            SET
                price = _price,
                offered_dt = _offered_dt,
                status_offer = 'pending'
            WHERE 1=1
                AND assignee = _assignee
                AND task_id = _task_id
            ;
            UPDATE task
            SET
                status_task = 'offered'
            WHERE 1=1
                AND id = _task_id
                AND status_task IS NOT DISTINCT FROM 'open'
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
        _price          NUMERIC(6, 2)
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

exports.FUNCTION_UPDATE_TASK_UPON_ACCEPTING_OFFER_BY_TASK_ID = `
    CREATE OR REPLACE FUNCTION update_task_upon_accepting_offer_by_task_id (
        _task_id             INTEGER,
        _assignee            VARCHAR(25),
        _offer_price         NUMERIC(6, 2)
    )
    RETURNS void AS
    $BODY$
        BEGIN
            UPDATE task
            SET
                price = _offer_price,
                status_task = 'accepted',
                assignee = _assignee
            WHERE 1=1
                AND id = _task_id
            ;

            UPDATE offer
            SET
                status_offer =
                    CASE
                        WHEN assignee IS NOT DISTINCT FROM _assignee THEN 'accepted'
                        ELSE 'rejected'
                    END
            WHERE 1=1
                AND task_id = _task_id
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_UPDATE_TASK_UPON_REJECTING_OFFER_BY_TASK_ID = `
    CREATE OR REPLACE FUNCTION update_task_upon_rejecting_offer_by_task_id (
        _task_id             INTEGER,
        _offer_id            INTEGER
    )
    RETURNS void AS
    $BODY$
        BEGIN
            UPDATE offer
            SET
                status_offer = 'rejected'
            WHERE 1=1
                AND id = _offer_id
            ;

            UPDATE task
            SET
                status_task = 'open'
            WHERE 1=1
                AND id = _task_id
                AND NOT EXISTS (
                    SELECT 1
                    FROM offer
                    WHERE 1=1
                        AND task_id = _task_id
                        AND status_offer IS DISTINCT FROM 'rejected'
                )
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

// ======================================================
// 3.4. Delete

exports.FUNCTION_DELETE_ONE_TASK_BY_TASK_ID = `
    CREATE OR REPLACE FUNCTION delete_one_task_by_task_id (
        _task_id        INTEGER
    )
    RETURNS void AS
    $BODY$
        BEGIN
            DELETE FROM task
            WHERE id = _task_id
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

// Upon removing an offer, if there are no offers left then change status_task to 'open'
exports.FUNCTION_DELETE_OFFER_BY_ASSIGNEE_AND_TASK_ID = `
    CREATE OR REPLACE FUNCTION delete_offer_by_assignee_and_task_id (
        _assignee       VARCHAR(25),
        _task_id        INTEGER
    )
    RETURNS void AS
    $BODY$
        BEGIN
            DELETE FROM offer
            WHERE 1=1
                AND assignee = _assignee
                AND task_id = _task_id
            ;
            UPDATE task
            SET
                status_task = 'open'
            WHERE 1=1
                AND id = _task_id
                AND NOT EXISTS (
                    SELECT 1
                    FROM offer
                    WHERE 1=1
                        AND task_id = _task_id
                        AND status_offer IS DISTINCT FROM 'rejected'
                )
            ;
        END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

// ======================================================
// 3.5. Select
exports.FUNCTION_TASK_BASIC_SEARCH = `
    CREATE OR REPLACE FUNCTION get_tasks_with_basic_search (
        _search_string    TEXT            DEFAULT NULL
    )
    RETURNS SETOF task AS
    $BODY$
    BEGIN
        if _search_string = '' THEN
            _search_string = NULL;
        END if;

        RETURN QUERY
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
        FROM
            task,
            (
                SELECT unnest(string_to_array(coalesce($1, ' '), ' ')) AS word
            ) AS sub
        WHERE 1=1
            AND task.title ILIKE '%' || sub.word || '%'
            OR task.description ILIKE '%' || sub.word || '%'
        GROUP BY
            task.id
        HAVING
            count(task.id) IS NOT DISTINCT FROM array_length(string_to_array(coalesce($1, ' '), ' '), 1)
        ORDER BY
            task.id DESC
        ;
    END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

exports.FUNCTION_TASK_ADVANCED_SEARCH = `
    CREATE OR REPLACE FUNCTION get_tasks_with_advanced_search (
        _search_string    TEXT            DEFAULT NULL,
        _category_id      TEXT            DEFAULT NULL,
        _location         TEXT            DEFAULT NULL,
        _requester        TEXT            DEFAULT NULL,
        _start_dt         TEXT            DEFAULT NULL,
        _min_price        TEXT            DEFAULT NULL,
        _max_price        TEXT            DEFAULT NULL,
        _status_task      TEXT            DEFAULT NULL,
        _assignee         TEXT            DEFAULT NULL
    )
    RETURNS SETOF task AS
    $BODY$
    BEGIN
        if _search_string = '' THEN
            _search_string = NULL;
        END if;
        if _category_id = '' THEN
            _category_id = NULL;
        END if;
        if _location = '' THEN
            _location = NULL;
        END if;
        if _requester = '' THEN
            _requester = NULL;
        END if;
        if _start_dt = '' THEN
            _start_dt = NULL;
        END if;
        if _min_price = '' THEN
            _min_price = NULL;
        END if;
        if _max_price = '' THEN
            _max_price = NULL;
        END if;
        if _status_task = '' THEN
            _status_task = NULL;
        END if;
        if _assignee = '' THEN
            _assignee = NULL;
        END if;

        RETURN QUERY
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
        FROM
            task,
            (
                SELECT unnest(string_to_array(coalesce(_search_string, ' '), ' ')) AS word
            ) AS sub
        WHERE 1=1
            AND ( -- If the title/description contains all the words
                task.title ILIKE '%' || sub.word || '%'
                OR task.description ILIKE '%' || sub.word || '%'
            )
            AND task.category_id = coalesce(CAST(_category_id AS NUMERIC(6, 2)), task.category_id)

            -- If location matches more than 40%
            AND get_matching_percent(task.location, _location) >= 0.4

            -- If requester matches more than 80%
            AND get_matching_percent(task.requester, _requester) >= 0.8

            -- If start_dt
            AND task.start_dt::DATE = coalesce(_start_dt, to_char(task.start_dt, 'YYYY-MM-DD'))::DATE

            -- If price >= min_price
            AND task.price >= coalesce(CAST(_min_price AS NUMERIC(6, 2)), 0)

            -- If price <= max_price
            AND task.price <= coalesce(CAST(_max_price AS NUMERIC(6, 2)), 9999.99)

            -- Same task status
            AND task.status_task = coalesce(_status_task, task.status_task)

            -- If assignee matches more than 80%
            AND get_matching_percent(task.assignee, _assignee) >= 0.8

        GROUP BY
            task.id
        HAVING
            count(task.id) IS NOT DISTINCT FROM array_length(string_to_array(coalesce(_search_string, ' '), ' '), 1)
        ORDER BY
            task.id DESC

        ;
    END;
    $BODY$
    LANGUAGE 'plpgsql' VOLATILE
    COST 100
    ;
`

// ======================================================
// 3.6. Helper

exports.FUNCTION_DROP_ALL_FUNCTIONS = `
    CREATE OR REPLACE FUNCTION information_schema.f_delfunc(_sch text)
        RETURNS void AS
    $func$
    DECLARE
        _sql text;
    BEGIN
        SELECT INTO _sql
            string_agg(format('DROP FUNCTION %s(%s);'
                          , p.oid::regproc
                          , pg_get_function_identity_arguments(p.oid))
                   , E'\n')
        FROM   pg_proc      p
        JOIN   pg_namespace ns ON ns.oid = p.pronamespace
        WHERE  ns.nspname = _sch;

        IF _sql IS NOT NULL THEN
            --  RAISE NOTICE '%', _sql;  -- for debugging
            EXECUTE _sql;
        END IF;
    END
    $func$
    LANGUAGE plpgsql
    ;
`

exports.FUNCTION_GET_STRING_MATCHING_PERCENT = `
    CREATE OR REPLACE FUNCTION get_matching_percent(
        _string_a    TEXT DEFAULT NULL,
        _string_b    TEXT DEFAULT NULL
    )
    RETURNS NUMERIC(3, 2) AS
    $BODY$
        BEGIN
            if _string_a IS NOT NULL THEN
                _string_a = LOWER(_string_a);
            END if;
            if _string_b IS NOT NULL THEN
                _string_b = LOWER(_string_b);
            END if;

            RETURN
            CASE
                WHEN (_string_a IS NULL OR _string_b IS NULL) THEN 1.00
                WHEN (CHAR_LENGTH(_string_a) >= CHAR_LENGTH(_string_b)) THEN (
                    round(
                        (char_length(_string_a)-levenshtein(_string_a, _string_b)::NUMERIC) / char_length(_string_a), 2)
                )
                WHEN CHAR_LENGTH(_string_b) > CHAR_LENGTH(_string_a) THEN (
                    round(
                        (char_length(_string_b)-levenshtein(_string_a, _string_b)::NUMERIC) / char_length(_string_b), 2)
                )
            END AS _percent
        ;
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
//======================================================================================================================
// 5. Extension

exports.EXTENSION_FUZZYSTRMATCH = `
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
`
