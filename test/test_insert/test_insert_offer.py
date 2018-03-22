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

def test_insert_offer_full(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Ensure that the new person exists in the table
    query = r"""
    SELECT 1
    FROM offer
    WHERE EXISTS (
        SELECT offer.id
        FROM offer
        WHERE 1=1
            AND offer.task_id = {}
            AND offer.price = {}
            AND offer.assignee = '{}'
            AND offer.offered_dt = '{}'
            AND offer.status_offer = 'pending'
    )
    ;""".format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)

    data = sql_select(cursor, query)
    assert (1,) in data

def test_insert_offer_with_same_requester_assignee(cursor, task_dummy, offer_dummy, person_task_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, person_task_dummy.username, offer_dummy.offered_dt)

    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Check that the offer didnt get inserted
    query = r"""
    SELECT 1
    FROM offer
    WHERE EXISTS (
        SELECT id
        FROM offer
        WHERE 1=1
            AND offer.task_id = {}
            AND offer.price = {}
            AND offer.assignee = '{}'
            AND offer.offered_dt = '{}'
            AND offer.status_offer = 'pending'
    )
    ;""".format(task_id, offer_dummy.price, person_task_dummy.username, offer_dummy.offered_dt)

    data = sql_select(cursor, query)
    assert (1,) not in data

def test_insert_offer_without_task_id(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_offer_dummy)

    query = r"""
        INSERT INTO offer
            (
                price,
                assignee,
                offered_dt
            )
        VALUES(
            {},
            '{}',
            '{}'
        )
        ;
    """.format(offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)

    # Raise IntegrityError as `task_id` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_without_price(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        INSERT INTO offer
            (
                task_id,
                assignee,
                offered_dt
            )
        VALUES(
            {},
            '{}',
            '{}'
        )
        ;
    """.format(task_id, offer_dummy.assignee, offer_dummy.offered_dt)

    # Raise IntegrityError as `price` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_without_assignee(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        INSERT INTO offer
            (
                task_id,
                price,
                offered_dt
            )
        VALUES(
            {},
            {},
            '{}'
        )
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.offered_dt)

    # Raise IntegrityError as `assignee` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_without_offered_dt(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        INSERT INTO offer
            (
                task_id,
                assignee,
                price
            )
        VALUES(
            {},
            '{}',
            {}
        )
        ;
    """.format(task_id, offer_dummy.assignee, offer_dummy.price)

    # Raise IntegrityError as `offered_dt` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_with_duplicate_task_id_assignee(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    # Add an offer
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Add another offer with same task_id and assignee
    query = r"""
        SELECT
            insert_one_offer({}, {}, '{}', '{}')
        ;
    """.format(task_id, 120.23, offer_dummy.assignee, "2018-01-10 07:43:54.798")

    # Raise IntegrityError as pair `task_id` and `assignee` must be UNIQUE
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_with_task_id_non_exist(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)

    query = r"""
        INSERT INTO offer
            (
                task_id,
                price,
                assignee,
                offered_dt
            )
        VALUES(
            {},
            {},
            '{}',
            '{}'
        )
        ;
    """.format(0, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)

    # Raise IntegrityError as `task_id` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_with_assignee_non_exist(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        INSERT INTO offer
            (
                task_id,
                price,
                assignee,
                offered_dt
            )
        VALUES(
            {},
            {},
            '{}',
            '{}'
        )
        ;
    """.format(task_id, offer_dummy.price, "dummy_testing_assignee", offer_dummy.offered_dt)

    # Raise IntegrityError as `assignee` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_offer_with_status_offer_non_exis(cursor, task_dummy, offer_dummy, person_task_dummy, person_offer_dummy):
    insert_new_person(cursor, person_task_dummy)
    insert_new_person(cursor, person_offer_dummy)
    insert_new_task(cursor, task_dummy)
    task_id = get_new_task_id(cursor, task_dummy)

    query = r"""
        INSERT INTO offer
            (
                task_id,
                price,
                assignee,
                offered_dt,
                status_offer
            )
        VALUES(
            {},
            {},
            '{}',
            '{}',
            'Nexist'
        )
        ;
    """.format(task_id, offer_dummy.price, offer_dummy.assignee, offer_dummy.offered_dt)

    # Raise IntegrityError as `status_offer` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)
