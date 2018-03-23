import pytest
from os import environ
import psycopg2
from sshtunnel import SSHTunnelForwarder
from collections import namedtuple

print()
print("=========================================================================================")
print("\t\tIMPORTANT", end="\n\n")
print("The tests only work if all tables and functions have been created.")
print("All queries executed during testing period will be discarded.")
print("There should only be 1 machine running the tests at a time, to avoid overlapping.")
print("=========================================================================================")
print()

try:
    test_env = environ['IP_ADDR']
except:
    print("No 'pytest.ini' file is found.")
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

## Dummy objects
@pytest.fixture
def category_meow(Category):
    category_info = [12, 'meow']
    return Category(*category_info)

@pytest.fixture
def person_task_dummy(Person):
    requester_info = ["task_requester_testing", "123ml12$#_3k", "task_requester@doesntexist.com", "2018-03-10 17:43:54.798"]
    return Person(*requester_info)

@pytest.fixture
def person_offer_dummy(Person):
    assignee_info = ["offer_assignee_testing", "123ml12$#_3k", "offer_assignee@doesntexist.com", "2018-03-10 07:43:54.798"]
    return Person(*assignee_info)

@pytest.fixture
def person_offer_dummy_2(Person):
    assignee_info = ["offer_assignee_test_2", "123ml12$#_3k", "offer_assign2@doesntexist.com", "2018-03-10 01:43:54.798"]
    return Person(*assignee_info)

@pytest.fixture
def task_dummy(Task, person_task_dummy):
    task_info = ['dumb_title_testing', 'dumb_description_testing', 1, 'dumb_location_testing',
                    person_task_dummy.username, '2018-03-19 17:43:54.798', '2018-03-19 19:43:54.798',
                    123.59, 'open']
    return Task(*task_info)

@pytest.fixture
def offer_dummy(Offer, person_offer_dummy):
    offer_info = [0, 12, person_offer_dummy.username, "2018-02-10 20:43:54.798", 'pending']
    return Offer(*offer_info)

@pytest.fixture
def offer_dummy_2(Offer, person_offer_dummy_2):
    offer_info = [0, 20, person_offer_dummy_2.username, "2018-02-11 20:43:54.798", 'pending']
    return Offer(*offer_info)
