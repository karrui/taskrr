import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select
from psycopg2 import IntegrityError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

@pytest.fixture
def person_offer_dummy_2(Person):
    assignee_info = ["offer_assignee_test_2", "123123123", "offer_assign2@doesntexist.com", "2018-03-10 01:43:54.798"]
    return Person(*assignee_info)

@pytest.fixture
def offer_dummy_2(Offer, person_offer_dummy_2):
    offer_info = [0, 20, person_offer_dummy_2.username, "2018-02-11 20:43:54.798", 'pending']
    return Offer(*offer_info)

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
