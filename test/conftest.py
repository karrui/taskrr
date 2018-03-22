import pytest
from os import environ
import psycopg2
from sshtunnel import SSHTunnelForwarder
from collections import namedtuple

print()
print("====================================================================")
print("\t\tIMPORTANT", end="\n\n")
print("All queries executed during testing period will be discarded.")
print("There should only be 1 machine running the tests at a time, to avoid overlapping.")
print("====================================================================")
print()

# Create an SSH tunnel
tunnel = SSHTunnelForwarder(
    (environ['IP_ADDR'], 22),
    ssh_username=environ['SSH_USERNAME'],
    ssh_password=environ['SSH_PASSWORD'],
    remote_bind_address=('localhost', 5432)
)
# Start the tunnel
tunnel.start()

# Create a database connection
conn = psycopg2.connect(
    database=environ['DATABASE'],
    user=environ['DB_USERNAME'],
    password=environ['DB_PASSWORD'],
    host=tunnel.local_bind_host,
    port=tunnel.local_bind_port,
)
conn.autocommit = True

# Get a database cursor
cur = conn.cursor()

@pytest.fixture(autouse=True, scope='session')
def populate_data_and_global_cur(request):
    global cur

    def close_conn():
        # Close connection to database
        global conn
        conn.close()

        # Stop the tunnel
        global tunnel
        tunnel.stop()
    request.addfinalizer(close_conn)

## Automatically call any tests in rollbacks
@pytest.fixture(autouse=True, scope='function')
def generate_rollback(request):
    global cur

    # Create a savepoint for testing
    cur.execute(r"""
    BEGIN;
    """)

    def close_rollback():
        # Rollback to discard all changes made
        cur.execute(r"""
        ROLLBACK;
        """)
    request.addfinalizer(close_rollback)

@pytest.fixture
def get_cursor():
    return cur

@pytest.fixture()
def Person():
    fields = ( 'username', 'password', 'email', 'created_dt'
    )
    Person = namedtuple('Person', fields)
    return Person

@pytest.fixture()
def Category():
    fields = ( 'id', 'name'
    )
    Category = namedtuple('Category', fields)
    return Category

@pytest.fixture()
def Task():
    fields = ('title', 'description', 'category_id', 'location', 'requester', 'start_dt', 'end_dt', 'price', 'status_task'
    )
    Task = namedtuple('Task', fields)
    return Task

@pytest.fixture()
def Task_status():
    fields = ( 'status')
    Task_status = namedtuple('Task_status', fields)
    return Task_status

@pytest.fixture()
def Offer():
    fields = ('task_id', 'price', 'assignee', 'offered_dt', 'status_offer'
    )
    Offer = namedtuple('Offer', fields)
    return Offer

@pytest.fixture()
def Offer_status():
    fields = ( 'status')
    Offer_status = namedtuple('Offer_status', fields)
    return Offer_status
