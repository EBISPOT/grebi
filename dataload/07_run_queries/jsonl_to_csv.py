
import sys
import pandas as pd
import json

def main():
    data = []
    for line in sys.stdin:
        line = line.strip()
        if line:
            obj = json.loads(line)
            for key, value in obj.items():
                if isinstance(value, list):
                    obj[key] = ';'.join(map(str, value))
                elif isinstance(value, dict):
                    obj[key] = json.dumps(value)
                else:
                    obj[key] = str(value)
            data.append(obj)

    df = pd.DataFrame(data)
    df.to_csv(sys.stdout, index=False)

if __name__ == "__main__":
    main()

