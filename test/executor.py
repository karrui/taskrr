def sql(cur, query):
    cur.execute(query)

# Return a list of tuples
# Example: [(1, 'abc'), (2, 'This is 2')]
# Example: [(1,)]
def sql_select(cur, query):
    cur.execute(query)
    return cur.fetchall()
