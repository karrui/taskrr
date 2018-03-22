import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select
from psycopg2 import IntegrityError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

def insert_new_person(cursor, new_person):
    # Add the requester
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(new_person.username, new_person.password, new_person.email, new_person.created_dt)

    try:
        sql(cursor, query)
    except Exception as e:
        raise e

def insert_new_task(cursor, task_dummy):
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

def test_update_offer_with_open_task(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer to update later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Update the offer
    query = r"""
        SELECT
            update_offer_by_assignee_taskid('{}', {}, {}, '{}')
        ;
    """.format(offer_dummy.assignee, task_id, 50, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Check that the offer's status is changed to 'pending'
    query = r"""
    SELECT offer.status_offer
    FROM offer
    WHERE 1=1
        AND offer.task_id = {}
        AND offer.assignee = '{}'
    ;
    """.format(task_id, offer_dummy.assignee)

    status_offer = sql_select(cursor, query)

    # Ensure that the status of the edited offer is 'pending'
    assert status_offer[0][0] == 'pending'

    # Ensure that the status of the task is 'offered'
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND task.id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)
    assert status_task[0][0] == 'offered'

def test_update_offer_with_accepted_task(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer to update later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Change the `status_task` to 'accepted'
    query = r"""
        UPDATE task
        SET
            status_task = 'accepted'
        WHERE 1=1
            AND id = {}
        ;
    """.format(task_id)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Update the offer
    query = r"""
        SELECT
            update_offer_by_assignee_taskid('{}', {}, {}, '{}')
        ;
    """.format(offer_dummy.assignee, task_id, 50, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Check that the task's status is still 'accepted'
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND task.id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)
    assert status_task[0][0] == 'accepted'