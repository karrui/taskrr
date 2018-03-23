import pytest
from os import getcwd
import sys
sys.path.append("{}/test".format(getcwd()))
from executor import sql_select
from read_file import read_csv

@pytest.fixture
def cursor(get_cursor):
    return get_cursor

def test_no_extra_added_offer_status(cursor):
    query = r"""
        SELECT
            status
        FROM offer_status
    """
    db_data = sql_select(cursor, query)
    csv_data = read_csv("offer_status.csv")

    # Ensure that the categories in the CSV file and the Postgres DB are the same
    assert set(db_data) == set(csv_data)
