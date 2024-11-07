
import pandas as pd
import json

df = pd.read_csv('mappings.tsv', sep='\t', dtype=str)

for row in df.to_dict('records'):
    out = {}
    if ':' in row['source identifier']:
        out['id'] = row['source identifier']
    else:
        out['id'] = row['source prefix'] + ':' + row['source identifier']

    if ':' in row['target identifier']:
        out[row['relation']] = row['target identifier']
    else:
        out[row['relation']] = row['target prefix'] + ':' + row['target identifier']

    print(json.dumps(out))











