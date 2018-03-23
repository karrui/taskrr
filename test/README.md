#### Notes:
```
* These tests are only for SQL functions.
* The tests only work if all tables and functions have been created.
* All queries executed during testing period will be discarded.
* There should only be 1 machine running the tests at a time, to avoid overlapping.
```

___

#### 1. Install the Python's dependencies:
```
pip install -r requirements.txt
```

#### 2. Create a `pytest.ini` file in `test/` in the format:

```
[pytest]
env =
    IP_ADDR=____
    SSH_USERNAME=____
    SSH_PASSWORD=____
    DATABASE=____
    DB_USERNAME=____
    DB_PASSWORD=____
```

#### 3. Run the test with `pytest`:

```
pytest -c test/pytest.ini -v -s
```
Option parameters:
- `-c`: use a `pytest.ini` file.
- `-v`: show all test functions, not just filenames.
- `-s`: show all stdout by in the tests.
