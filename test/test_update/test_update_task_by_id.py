import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select
from read_file import read_csv
from psycopg2 import IntegrityError, DataError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

@pytest.fixture
def new_edited_task_dummy(Task, person_task_dummy):
    task_info = ['dumb_title_test', 'dumb_description_test', 2, 'dumb_location_test',
                    person_task_dummy.username, '2018-03-20 17:43:54.798', '2018-03-21 19:43:54.798',
                    50.1, 'open']
    return Task(*task_info)

def get_new_task_id(cursor, task_dummy):
    query = r"""
        SELECT id
        FROM task
        WHERE 1=1
            AND task.title = '{}'
            AND task.description = '{}'
            AND task.category_id = '{}'
            AND task.location = '{}'
            AND task.requester = '{}'
            AND task.start_dt = '{}'
            AND task.end_dt = '{}'
            AND task.price = '{}'
            AND task.status_task = 'open'
            AND task.assignee IS NULL
        ;
    """.format(task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price)

    try:
        data = sql_select(cursor, query)
        return data[0][0]
    except Exception as e:
        raise e

def insert_new_requester(cursor, person_task_dummy):
    # Add the requester
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(person_task_dummy.username, person_task_dummy.password, person_task_dummy.email, person_task_dummy.created_dt)

    try:
        sql(cursor, query)
    except Exception as e:
        raise e

def test_update_task_by_id(cursor, person_task_dummy, task_dummy, new_edited_task_dummy):
    # Add the requester
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Get the task_id of the created task
    task_id = get_new_task_id(cursor, task_dummy)

    # Update the task's details
    query = r"""
        WITH test_query AS (
            SELECT
                update_task_by_id({}, '{}', '{}', {}, '{}', '{}', '{}', {})
        )
        SELECT COUNT(*) FROM test_query
    ;
    """.format(task_id, new_edited_task_dummy.title, new_edited_task_dummy.description, new_edited_task_dummy.category_id,
                new_edited_task_dummy.location, new_edited_task_dummy.start_dt, new_edited_task_dummy.end_dt,
                new_edited_task_dummy.price)
    try:
        row_count = sql_select(cursor, query)
    except Exception as e:
        raise e

    # Ensure that only 1 row got edited
    assert len(row_count) == 1

    # Check that the task has been edited
    query = r"""
    SELECT COUNT(*)
    FROM task
    WHERE 1=1
        AND task.id = {}
        AND task.title = '{}'
        AND task.description = '{}'
        AND task.category_id = {}
        AND task.location = '{}'
        AND task.start_dt = '{}'
        AND task.end_dt = '{}'
        AND task.price = {}
    ;
    """.format(task_id, new_edited_task_dummy.title, new_edited_task_dummy.description, new_edited_task_dummy.category_id,
            new_edited_task_dummy.location, new_edited_task_dummy.start_dt, new_edited_task_dummy.end_dt, new_edited_task_dummy.price
    )

    data = sql_select(cursor, query)

    # Ensure that there are only 1 task with the unique details
    assert (1,) in data
