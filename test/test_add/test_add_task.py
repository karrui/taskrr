import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select
from read_file import read_csv

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

@pytest.fixture
def person_task_requester(Person):
    requester_info = ["task_requester_testing", "123123123", "task_requester@doesntexist.com", "2018-03-10 17:43:54.798"]
    return Person(*requester_info)

@pytest.fixture
def task_dummy(Task, person_task_requester):
    task_info = ['dumb_title_testing', 'dumb_description_testing', 1, 'dumb_location_testing',
                    'task_requester_testing', '2018-03-19 17:43:54.798', '2018-03-19 19:43:54.798',
                    123.59, 'open']
    return Task(*task_info)

def test_add_task_full(cursor, person_task_requester, task_dummy):
    # Add the requester
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(person_task_requester.username, person_task_requester.password, person_task_requester.email, person_task_requester.created_dt)

    try:
        sql(cursor, query)
    except Exception as e:
        raise e

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

    # Ensure that the new task exists in the table
    query = r"""
    SELECT 1
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
    ;
    """.format(task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    data = sql_select(cursor, query)
    assert (1,) in data
