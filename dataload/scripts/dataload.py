
import json
import sys
import os
import subprocess
from pathlib import Path

GREBI_DATALOAD_HOME = os.environ['GREBI_DATALOAD_HOME']
GREBI_CONFIG = os.environ['GREBI_CONFIG']
GREBI_NEXTFLOW_CONFIG = os.environ['GREBI_NEXTFLOW_CONFIG']

config = json.load(open(f'{GREBI_DATALOAD_HOME}/configs/pipeline_configs/{GREBI_CONFIG}.json'))

for subgraph in config['subgraphs']:
    print(f"===== LOADING SUBGRAPH: {subgraph} =====")
    os.environ['GREBI_SUBGRAPH'] = subgraph
    nextflow_dir_path = "nextflow_" + subgraph
    Path(nextflow_dir_path).mkdir(parents=True, exist_ok=True)
    res = os.system(f'cd {nextflow_dir_path} && nextflow {GREBI_DATALOAD_HOME}/nextflow/load_subgraph.nf -c {GREBI_NEXTFLOW_CONFIG} -resume')
    if res != 0:
        exit(res)
    print(f"===== FINISHED LOADING SUBGRAPH: {subgraph} =====")

