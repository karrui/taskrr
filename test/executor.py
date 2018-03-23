def sql(cur, query):
    cur.execute(query)

# Return a list of tuples
# Example: [(1, 'abc'), (2, 'This is 2')]
# Example: [(1,)]
def sql_select(cur, query):
    cur.execute(query)
    return cur.fetchall()

## Helper functions
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

def get_new_offer_id(cursor, task_id, offer_dummy):
    query = r"""
        SELECT offer.id
        FROM offer
        WHERE 1=1
            AND offer.task_id = {}
            AND offer.assignee = '{}'
        ;
    """.format(task_id, offer_dummy.assignee)

    try:
        data = sql_select(cursor, query)
        return data[0][0]
    except Exception as e:
        raise e
