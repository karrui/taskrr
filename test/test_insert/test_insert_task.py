import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select
from read_file import read_csv
from psycopg2 import IntegrityError, DataError

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

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

def test_insert_task_full(cursor, person_task_dummy, task_dummy):
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

    # Ensure that the new task exists in the table
    query = r"""
        SELECT task.id
        FROM task
        WHERE 1=1
            AND task.title = '{}'
            AND task.description = '{}'
            AND task.category_id = {}
            AND task.location = '{}'
            AND task.requester = '{}'
            AND task.start_dt = '{}'
            AND task.end_dt = '{}'
            AND task.price = {}
            AND task.status_task = 'open'
            AND task.assignee IS NULL
    ;
    """.format(task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    data = sql_select(cursor, query)
    assert len(data) == 1

def test_insert_task_without_title(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                description,
                category_id,
                location,
                requester,
                start_dt,
                end_dt,
                price
            )
        VALUES
            (
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `title` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_description(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                description,
                category_id,
                location,
                requester,
                start_dt,
                end_dt,
                price
            )
        VALUES
            (
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.title, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `description` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_category_id(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                location,
                requester,
                start_dt,
                end_dt,
                price
            )
        VALUES
            (
                '{}',
                '{}',
                '{}',
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `description` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_location(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                requester,
                start_dt,
                end_dt,
                price
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `location` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_requester(cursor, task_dummy):
    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                location,
                start_dt,
                end_dt,
                price
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id,
                task_dummy.location, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `requester` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_start_dt(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                location,
                requester,
                end_dt,
                price
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id,
                task_dummy.location, task_dummy.requester, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `start_dt` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_end_dt(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                location,
                requester,
                start_dt,
                price
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                {}
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id,
                task_dummy.location, task_dummy.requester, task_dummy.start_dt, task_dummy.price
    )

    # Raise IntegrityError as `end_dt` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_without_price(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                location,
                requester,
                start_dt,
                end_dt
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                '{}'
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id,
                task_dummy.location, task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt
    )

    # Raise IntegrityError as `price` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_with_start_dt_bigger_end_dt(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, '2018-03-10 18:43:54.798', '2018-03-10 17:43:54.798', task_dummy.price
    )

    # Raise IntegrityError as `start_dt` cannot be bigger than `end_dt`
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_with_invalid_category_id(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', '{}', '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, "meow", task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise DataError as `category_id` must be an integer
    with pytest.raises(DataError) as e_info:
        sql(cursor, query)

def test_insert_task_with_price_less_than_0(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, -30
    )

    # Raise IntegrityError as `price` must be bigger or equals 0
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_with_price_more_than_10000(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, 10001
    )

    # Raise DataError as `price` cannot be bigger than 9999.99
    with pytest.raises(DataError) as e_info:
        sql(cursor, query)

def test_insert_task_with_price_with_more_than_6_precises(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, 9999.999
    )

    # Raise DataError as `price` can only have less or equals than 6 precises
    with pytest.raises(DataError) as e_info:
        sql(cursor, query)

def test_insert_task_with_invalid_start_dt(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, "12312", task_dummy.end_dt, task_dummy.price
    )

    # Raise DataError as `start_dt` is in invalid format
    with pytest.raises(DataError) as e_info:
        sql(cursor, query)

def test_insert_task_with_invalid_end_dt(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, "123123", task_dummy.price
    )

    # Raise DataError as `start_dt` is in invalid format
    with pytest.raises(DataError) as e_info:
        sql(cursor, query)

def test_insert_task_with_non_exist_category_id(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, 500, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `category_id` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_with_non_exist_requester(cursor, person_task_dummy, task_dummy):
    # Add the task
    query = r"""
        SELECT
            insert_one_task('{}', '{}', {}, '{}', '{}', '{}', '{}', {})
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `requester` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_with_non_exist_task_status(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                location,
                requester,
                start_dt,
                end_dt,
                price,
                status_task
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                '{}',
                {},
                'Nexist'
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `category_id` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_task_with_non_exist_assignee(cursor, person_task_dummy, task_dummy):
    insert_new_requester(cursor, person_task_dummy)

    # Add the task
    query = r"""
        INSERT INTO task
            (
                title,
                description,
                category_id,
                location,
                requester,
                start_dt,
                end_dt,
                price,
                assignee
            )
        VALUES
            (
                '{}',
                '{}',
                {},
                '{}',
                '{}',
                '{}',
                '{}',
                {},
                'null_person_testing'
            )
        ;
    """.format( task_dummy.title, task_dummy.description, task_dummy.category_id, task_dummy.location,
                task_dummy.requester, task_dummy.start_dt, task_dummy.end_dt, task_dummy.price
    )

    # Raise IntegrityError as `category_id` doesnt exist
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)
