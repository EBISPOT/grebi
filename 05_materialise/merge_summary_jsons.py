import numbers
import sys
import json
from collections import defaultdict

def merge(dict1, dict2):
    for key, value in dict2.items():
        if key in dict1:
            if isinstance(dict1[key], dict) and isinstance(value, dict):
                merge(dict1[key], value)
            elif isinstance(dict1[key], list) and isinstance(value, list):
                for val in value:
                    if val not in dict1[key]:
                        dict1[key].append(val)
            elif isinstance(dict1[key], numbers.Number) and isinstance(value, numbers.Number):
                dict1[key] += value
            elif dict1[key] != value:
                dict1[key] = [dict1[key], value]
        else:
            dict1[key] = value
    return dict1

merged_data = defaultdict(dict)
for filename in sys.argv[1:]:
    with open(filename, 'r') as file:
        data = json.load(file)
        merge(merged_data, data)

print(json.dumps(merged_data, indent=2))

