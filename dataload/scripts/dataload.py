
import json
import sys
import os
import subprocess

GREBI_DATALOAD_HOME = os.environ['GREBI_DATALOAD_HOME']
GREBI_CONFIG = os.environ['GREBI_CONFIG']
GREBI_NEXTFLOW_CONFIG = os.environ['GREBI_NEXTFLOW_CONFIG']

config = json.load(open(f'{GREBI_DATALOAD_HOME}/configs/pipeline_configs/{GREBI_CONFIG}.json'))

for subgraph in config['subgraphs']:
    print(f"===== LOADING SUBGRAPH: {subgraph} =====")
    os.environ['GREBI_SUBGRAPH'] = subgraph
    res = os.system(f'NXF_WORK=work_{subgraph} nextflow {GREBI_DATALOAD_HOME}/nextflow/load_subgraph.nf -c {GREBI_NEXTFLOW_CONFIG} -resume')
    if res != 0:
        exit(res)
    print(f"===== FINISHED LOADING SUBGRAPH: {subgraph} =====")

