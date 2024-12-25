import glob
import argparse
import sqlite3
import pandas as pd
from subprocess import Popen, PIPE, STDOUT

def main():

    parser = argparse.ArgumentParser(description='Create sqlite from CSV files')
    parser.add_argument('--out-sqlite-path', type=str, help='Path for output sqlite file', required=True)
    args = parser.parse_args()

    conn = sqlite3.connect(args.out_sqlite_path)

    for csv in glob.glob("*.csv.gz"):
        df = pd.read_csv(csv)
        df.to_sql(csv.replace(".csv", ""), conn)

    conn.close()

if __name__=="__main__":
    main()