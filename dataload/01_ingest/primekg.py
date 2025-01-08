
import pandas
import sys
import json

df = pandas.read_csv(sys.stdin, dtype=str)

for row in df.to_dict(orient="records"):

    x_id = row['x_source'] + ':' + row['x_id']
    y_id = row['y_source'] + ':' + row['y_id']

    res = {
        'id': x_id,
        'grebi:name': row['x_name']
    }

    res["primekg:" + row['relation']] = {
        'grebi:value': y_id,
        'grebi:properties': {f"primekg:{key}": value for key, value in row.items()}
    }

    print(json.dumps(res))


    