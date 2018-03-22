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

def test_add_person_full_with_correct_role(cursor, person_bob):
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
    SELECT 1
    FROM person
    WHERE 1=1
        AND person.username = '{}'
        AND person.password = '{}'
        AND person.email = '{}'
        AND person.created_dt = '{}'
        AND person.role = 'member'
    ;""".format(person_bob.username, person_bob.password, person_bob.email, person_bob.created_dt)

    data = sql_select(cursor, query)
    assert (1,) in data

def test_add_person_with_only_username(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                username
            )
        VALUES(
            '{}'
        )
        ;
    """.format(person_bob.username)

    # Catch IntegrityError when trying to execute the Insert query
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_add_person_with_only_email(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                email
            )
        VALUES(
            '{}'
        )
        ;
    """.format(person_bob.email)

    # Catch IntegrityError when trying to execute the Insert query
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_add_person_with_only_username_password(cursor, person_bob):
    query = r"""
        INSERT INTO person
            (
                username,
                password
            )
        VALUES(
            '{}',
            '{}'
        )
        ;
    """.format(person_bob.username, person_bob.password)

    # Catch IntegrityError when trying to execute the Insert query
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_add_person_with_duplicate_username(cursor, person_bob):

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

    # Catch IntegrityError when trying to execute the Insert query
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)

def test_add_person_with_duplicate_email(cursor, person_bob):

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

    # Catch IntegrityError when trying to execute the Insert query
    with pytest.raises(IntegrityError) as e_info:
        sql(cursor, query)
