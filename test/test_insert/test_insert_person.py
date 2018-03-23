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
def person_bob(Person):
    bob_info = ['Bob_testing_is_not_real', '123123123', 'bob@doesntexist.com', '2018-03-19 17:43:54.798']
    return Person(*bob_info)

def test_insert_person_full_with_correct_role(cursor, person_bob):
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(person_bob.username, person_bob.password, person_bob.email, person_bob.created_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Ensure that the new person exists in the table
    query = r"""
    SELECT person.id
        FROM person
        WHERE 1=1
            AND person.username = '{}'
            AND person.password = '{}'
            AND person.email = '{}'
            AND person.created_dt = '{}'
            AND person.role = 'member'
    ;""".format(person_bob.username, person_bob.password, person_bob.email, person_bob.created_dt)

    data = sql_select(cursor, query)

    # Ensure that there is only 1 person added
    assert len(data) == 1

def test_insert_person_without_username(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                password,
                email,
                created_dt
            )
        VALUES(
            '{}',
            '{}',
            '{}'
        )
        ;
    """.format(person_bob.password, person_bob.email, person_bob.created_dt)

    # Raise IntegrityError as `username` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_person_without_password(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                username,
                email,
                created_dt
            )
        VALUES(
            '{}',
            '{}',
            '{}'
        )
        ;
    """.format(person_bob.username, person_bob.email, person_bob.created_dt)

    # Raise IntegrityError as `password` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_person_without_email(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                username,
                password,
                created_dt
            )
        VALUES(
            '{}',
            '{}',
            '{}'
        )
        ;
    """.format(person_bob.username, person_bob.password, person_bob.created_dt)

    # Raise IntegrityError as `email` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_person_without_created_dt(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                username,
                password,
                email
            )
        VALUES(
            '{}',
            '{}',
            '{}'
        )
        ;
    """.format(person_bob.username, person_bob.password, person_bob.email)

    # Raise IntegrityError as `created_dt` cannot be NULL
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_person_with_duplicate_username(cursor, person_bob):

    # Add normal person
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(person_bob.username, person_bob.password, person_bob.email, person_bob.created_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Add the same person with different email
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(person_bob.username, person_bob.password, 'notbob@doesntexist.com', person_bob.created_dt)

    # Raise IntegrityError as `username` must be UNIQUE
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_insert_person_with_duplicate_email(cursor, person_bob):

    # Add normal person
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format(person_bob.username, person_bob.password, person_bob.email, person_bob.created_dt)
    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Add the same person with different username
    query = r"""
        SELECT
            insert_one_person('{}', '{}', '{}', '{}')
        ;
    """.format('Not_bob_testing_real',person_bob.password, person_bob.email, person_bob.created_dt)

    # Raise IntegrityError as `email` must be UNIQUE
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)
