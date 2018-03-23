import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select, get_new_task_id, insert_new_person
from read_file import read_csv
from psycopg2 import IntegrityError

def test_delete_task_by_task_id(cursor, person_task_dummy, task_dummy):
    # Add the requester
    insert_new_person(cursor, person_task_dummy)

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
