
import json
import os
import sys
import shlex
import time
import glob
import argparse
from subprocess import Popen, PIPE, STDOUT

def main():

    parser = argparse.ArgumentParser(description='Create Neo4j DB')
    parser.add_argument('--solr-config', type=str, help='Solr config dir', required=True)
    parser.add_argument('--core', type=str, help='Core to import', required=True)
    parser.add_argument('--port', type=str, help='Port to use for temp solr instance', required=True)
    parser.add_argument('--in-names-txt', type=str, help='Path to names.txt', required=False)
    parser.add_argument('--in-data', type=str, help='Path to jsonl files to import', required=True)
    parser.add_argument('--out-path', type=str, help='Path to use to store the solr database', required=True)
    parser.add_argument('--mem', type=str, help='Memory to allocate to temp solr instance', required=True)
    args = parser.parse_args()

    has_singularity = os.system('which singularity') == 0

    print(get_time() + " --- Create Solr core")

    os.makedirs(args.out_path, exist_ok=True)
    os.system('chmod 777 ' + args.out_path)

    if has_singularity:
        cmd = ' '.join([
            'singularity run',
            '--env PYTHONUNBUFFERED=TRUE',
            '--env NO_PROXY=localhost',
        ] + list(map(lambda f: "--bind " + os.path.abspath(f) + ":/mnt/" + os.path.basename(f), glob.glob(args.in_data + "/*.jsonl"))) + [
            ('--bind ' + os.path.abspath(args.in_names_txt) + ':/names.txt') if args.in_names_txt != None else '',
            '--bind ' + os.path.abspath(args.solr_config) + ':/config',
            '--bind ' + os.path.abspath(args.out_path) + ':/var/solr',
            '--bind ' + os.path.abspath(os.path.join(os.environ['GREBI_DATALOAD_HOME'], '08_create_other_dbs/solr/solr_import.dockerpy')) + ':/import.py',
            #'--writable-tmpfs',
            '--net --network=none',
            'docker://ghcr.io/ebispot/grebi_solr_with_extras:9.5.0',
            'python3 /import.py', args.core, args.port, args.mem
        ])
    else:
        os.system("chmod 777 " + shlex.quote(args.out_path))
        cmd = ' '.join([
            'docker run',
            '--user="$(id -u):$(id -g)" '
            '-e PYTHONUNBUFFERED=TRUE',
            '-e NO_PROXY=localhost',
        ] + list(map(lambda f: "-v " + os.path.abspath(f) + ":/mnt/" + os.path.basename(f), glob.glob(args.in_data + "/*.jsonl"))) + [
            ('-v ' + os.path.abspath(args.in_names_txt) + ':/names.txt') if args.in_names_txt != None else '',
            '-v ' + os.path.abspath(args.solr_config) + ':/config',
            '-v ' + os.path.abspath(args.out_path) + ':/var/solr',
            '-v ' + os.path.abspath(os.path.join(os.environ['GREBI_DATALOAD_HOME'], '08_create_other_dbs/solr/solr_import.dockerpy')) + ':/import.py',
            'ghcr.io/ebispot/grebi_solr_with_extras:9.5.0',
            'python3 /import.py', args.core, args.port, args.mem
        ])

    print(cmd)

    if os.system(cmd) != 0:
        print("solr import failed")
        exit(1)


def get_time():
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())

if __name__=="__main__":
    main()

    
