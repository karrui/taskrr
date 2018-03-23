import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select, insert_new_person, insert_new_task, get_new_task_id
from psycopg2 import IntegrityError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

def test_update_task_upon_accept_offer(cursor, task_dummy, offer_dummy, offer_dummy_2, person_task_dummy, person_offer_dummy, person_offer_dummy_2):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_person(cursor, person_offer_dummy_2)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer to accept later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Add an offer to reject later
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy_2.price, offer_dummy_2.assignee, offer_dummy_2.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Accept the first offer
    query = r"""
        WITH test_query AS (
            SELECT
                update_task_upon_accepting_offer_by_task_id({}, '{}', {})
        )
        SELECT COUNT(*) FROM test_query
    ;
    """.format(task_id, offer_dummy.assignee, offer_dummy.price)
    try:
        row_count = sql_select(cursor, query)
    except Exception as e:
        raise e

    # Ensure that there is only 1 task got updated
    assert len(row_count) == 1

    # Check that the task's status is changed to 'accepted'
    query = r"""
    SELECT task.status_task
    FROM task
    WHERE 1=1
        AND task.id = {}
    ;
    """.format(task_id)

    status_task = sql_select(cursor, query)

    # Ensure that the status of the task is 'accepted'
    assert status_task[0][0] == 'accepted'

    # Check that the first offer's status is changed to 'accepted'
    query = r"""
    SELECT offer.status_offer
    FROM offer
    WHERE 1=1
        AND offer.task_id = {}
        AND offer.assignee = '{}'
    ;
    """.format(task_id, offer_dummy.assignee)

    status_offer = sql_select(cursor, query)

    # Ensure that the status of the edited offer is 'accepted'
    assert status_offer[0][0] == 'accepted'

    # Check that the second offer's status is changed to 'rejected'
    query = r"""
    SELECT offer.status_offer
    FROM offer
    WHERE 1=1
        AND offer.task_id = {}
        AND offer.assignee = '{}'
    ;
    """.format(task_id, offer_dummy_2.assignee)

    status_offer = sql_select(cursor, query)

    # Ensure that the status of the edited offer is 'rejected'
    assert status_offer[0][0] == 'rejected'
