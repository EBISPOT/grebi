#!/bin/bash
export GREBI_DATALOAD_HOME=/nfs/production/parkinso/spot/grebi/dataload
export GREBI_TMP=/hps/nobackup/parkinso/spot/grebi/tmp
export GREBI_FAST_TMP=/dev/shm
export GREBI_CONFIG=ebi
export GREBI_IS_EBI=true
export GREBI_TIMESTAMP=$(date +%Y_%m_%d__%H_%M)
export GREBI_MAX_ENTITIES=1000000000
export GREBI_NEXTFLOW_CONFIG=$GREBI_DATALOAD_HOME/nextflow/codon_nextflow.config
module load nextflow-22.10.1-gcc-11.2.0-ju5saqw
module load python
source /nfs/production/parkinso/spot/grebi/.venv/bin/activate
cd /hps/nobackup/parkinso/spot/grebi/
export PYTHONUNBUFFERED=true
srun -p datamover --time 1:0:0 --mem 8g bash -c "rm -rf /nfs/public/rw/ontoapps/grebi/staging && mkdir /nfs/public/rw/ontoapps/grebi/staging"
srun --time 3-0:0:0 --mem 8g bash -c "rm -rf nextflow* work* tmp"
srun --time 3-0:0:0 --mem 8g bash -c "python3 ${GREBI_DATALOAD_HOME}/scripts/dataload.py"


