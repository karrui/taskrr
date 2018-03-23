import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select, insert_new_person, insert_new_task, get_new_offer_id, get_new_task_id
from psycopg2 import IntegrityError

def test_update_task_upon_reject_all_offer(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer to reject later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Reject the  offer
    offer_id = get_new_offer_id(cursor, task_id, offer_dummy)
    query = r"""
        WITH test_query AS (
            SELECT
                update_task_upon_rejecting_offer_by_task_id({}, {})
        )
        SELECT COUNT(*) FROM test_query
    ;
    """.format(task_id, offer_id)
    try:
        row_count = sql_select(cursor, query)
    except Exception as e:
        raise e

    # Ensure that there is only 1 offer got updated
    assert len(row_count) == 1

    # Check that the offer's status is changed to 'rejected'
    query = r"""
    SELECT offer.status_offer
    FROM offer
    WHERE 1=1
        AND offer.task_id = {}
        AND offer.assignee = '{}'
    ;
    """.format(task_id, offer_dummy.assignee)

    status_offer = sql_select(cursor, query)

    # Ensure that the status of the edited offer is 'rejected'
    assert status_offer[0][0] == 'rejected'

    # Check that the task's status is changed to 'open'
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND task.id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)

    # Ensure that the status of the task is 'open', because all offers are rejected
    assert status_task[0][0] == 'open'

def test_update_task_upon_reject_one_offer(cursor, task_dummy, offer_dummy, offer_dummy_2, person_task_dummy, person_offer_dummy, person_offer_dummy_2):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_person(cursor, person_offer_dummy_2)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer to reject later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Add another offer
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy_2.price, offer_dummy_2.assignee, offer_dummy_2.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Reject the first offer
    offer_id = get_new_offer_id(cursor, task_id, offer_dummy)
    query = r"""
        WITH test_query AS (
            SELECT
                update_task_upon_rejecting_offer_by_task_id({}, {})
        )
        SELECT COUNT(*) FROM test_query
    ;
    """.format(task_id, offer_id)
    try:
        row_count = sql_select(cursor, query)
    except Exception as e:
        raise e

    # Ensure that there is only 1 offer got updated
    assert len(row_count) == 1

    # Check that the first offer's status is changed to 'rejected'
    query = r"""
    SELECT offer.status_offer
    FROM offer
    WHERE 1=1
        AND offer.task_id = {}
        AND offer.assignee = '{}'
    ;
    """.format(task_id, offer_dummy.assignee)

    status_offer = sql_select(cursor, query)

    # Ensure that the status of the edited offer is 'rejected'
    assert status_offer[0][0] == 'rejected'

    # Check that the second offer's status is still 'pending'
    query = r"""
    SELECT offer.status_offer
    FROM offer
    WHERE 1=1
        AND offer.task_id = {}
        AND offer.assignee = '{}'
    ;
    """.format(task_id, offer_dummy_2.assignee)

    status_offer = sql_select(cursor, query)

    # Ensure that the status of the edited offer is 'pending'
    assert status_offer[0][0] == 'pending'

    # Check that the task's status is still 'offered'
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND task.id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)

    # Ensure that the status of the task is 'offered'
    assert status_task[0][0] == 'offered'
