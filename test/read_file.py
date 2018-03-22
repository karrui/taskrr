from os import getcwd
import csv

# Convert any item in the row, from string to float
def parse_csv_row(row):
    new_arr = []
    for item in row:
        try:
            new_arr.append(float(item))
        except:
            new_arr.append(item)
    return new_arr

## Read a csv file, return the data as list of tuples
def read_csv(filename):
    path_to_csv = "{}/db/csv/".format(getcwd())
    with open("{}{}".format(path_to_csv, filename), 'r') as inp_file:
        target_csv = csv.reader(inp_file, delimiter=',')
        # Ignore the first header row
        next(target_csv)

        data = []
        for row in target_csv:
            data.append(tuple(parse_csv_row(row)))

    return data
