import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select
from read_file import read_csv
from psycopg2 import IntegrityError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

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

def test_delete_task_by_task_id(cursor, person_task_dummy, task_dummy):
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

    # Get the total number of tasks before removing the task
    query = r"""
    SELECT COUNT(*)
    FROM task
    ;
    """
    num_of_tasks_before = sql_select(cursor, query)
    try:
        num_of_tasks_before = int(num_of_tasks_before[0][0])
    except Exception as e:
        raise e

    # Remove the task
    query = r"""
    SELECT
        delete_one_task_by_task_id({})
    ;""".format(task_id)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Get the total number of tasks after removing the task
    query = r"""
    SELECT COUNT(*)
    FROM task
    ;
    """
    num_of_tasks_after = sql_select(cursor, query)
    try:
        num_of_tasks_after = int(num_of_tasks_after[0][0])
    except Exception as e:
        raise e

    # Ensure that only the added task got removed
    assert num_of_tasks_after == num_of_tasks_before - 1
