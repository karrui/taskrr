import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql, sql_select

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
    SELECT COUNT(*)
    FROM category
    WHERE 1=1
        AND category.name = 'meow'
    ;"""

    data = sql_select(cursor, query)

    # Ensure that there is only 1 category added
    assert (1,) in data
