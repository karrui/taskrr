import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql_select
from read_file import read_csv

def test_no_extra_added_category(cursor):
    query = r"""
        SELECT
            id,
            name
        FROM category
    """
    db_data = sql_select(cursor, query)
    csv_data = read_csv("categories.csv")

    # Ensure that the categories in the CSV file and the Postgres DB are the same
    assert set(db_data) == set(csv_data)
