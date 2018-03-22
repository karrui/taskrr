import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

@pytest.fixture
def category_meow(Category):
    category_info = [12, 'meow']
    return Category(*category_info)

def test_insert_category(cursor, category_meow):
    query = r"""
        INSERT INTO category (id, name)
        VALUES ({}, '{}')
        ;
    """.format(category_meow.id, category_meow.name)

    try:
        sql(cursor, query)
    except Exception as e:
        raise e

    # Ensure that the new category exists in the table
    query = r"""
    SELECT 1
    FROM category
    WHERE 1=1
        AND category.name = 'meow'
    ;"""

    data = sql_select(cursor, query)
    assert (1,) in data
