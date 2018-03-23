import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select, insert_new_person, insert_new_task, get_new_task_id
from psycopg2 import IntegrityError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

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
        WITH test_query AS (
            SELECT
                update_offer_by_assignee_taskid('{}', {}, {}, '{}')
        )
        SELECT COUNT(*) FROM test_query
        ;
    """.format(offer_dummy.assignee, task_id, 50, offer_dummy.offered_dt)
    try:
        row_count = sql_select(cursor, query)
    except Exception as e:
        raise e

    # Ensure that only 1 row got updated
    assert len(row_count) == 1

    # Check that the task's status is still 'accepted'
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND task.id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)

    # Ensure that the task's status is still 'accepted'
    
    assert status_task[0][0] == 'accepted'
