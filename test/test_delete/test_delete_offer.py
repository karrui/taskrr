import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select, insert_new_person, insert_new_task, get_new_task_id
from psycopg2 import IntegrityError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

def test_delete_offer_by_assignee_task_id(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer to delete later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Get the total number of offers before removing the offer
    query = r"""
    SELECT COUNT(*)
    FROM offer
    ;
    """
    num_of_offers_before = sql_select(cursor, query)
    try:
        num_of_offers_before = int(num_of_offers_before[0][0])
    except Exception as e:
        raise e

    # Delete the added offer
    query = r"""
    SELECT
        delete_offer_by_assignee_and_task_id('{}', {})
    ;""".format(offer_dummy.assignee, task_id)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Get the total number of offers after removing the offer
    query = r"""
    SELECT COUNT(*)
    FROM offer
    ;
    """
    num_of_offers_after = sql_select(cursor, query)
    try:
        num_of_offers_after = int(num_of_offers_after[0][0])
    except Exception as e:
        raise e

    # Ensure that only the added offer got removed
    assert num_of_offers_after == num_of_offers_before - 1

    # Check that the task_status is changed to 'open' if all offers are removed
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)

    # Ensure that the status of task with no offers is 'open'
    assert status_task[0][0] == 'open'
