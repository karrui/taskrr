#### Notes:
```
* The tests only work if all tables and functions have been created.
* All queries executed during testing period will be discarded.
* There should only be 1 machine running the tests at a time, to avoid overlapping.
```

1. Create a `pytest.ini` in `test/` in the format:

```
[pytest]
env =
    IP_ADDR=...
    SSH_USERNAME=...
    SSH_PASSWORD=...
    DATABASE=...
    DB_USERNAME=...
    DB_PASSWORD=...

```

2. Run the following command in the main repo directory to run all tests, with output printed to stdout:

```
pytest -c test/pytest.ini -v -s
```
