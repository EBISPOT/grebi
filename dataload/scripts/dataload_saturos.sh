#!/bin/bash
export GREBI_HOME=/home/james/grebi
export GREBI_TMP=/data/grebi_tmp
export GREBI_CONFIG=ebi
export GREBI_IS_EBI=false
export GREBI_TIMESTAMP=$(date +%Y_%m_%d__%H_%M)
export RUST_BACKTRACE=full
export GREBI_NEXTFLOW_CONFIG=$GREBI_HOME/nextflow/saturos_nextflow.config
cd $GREBI_TMP
export PYTHONUNBUFFERED=true
rm -rf work tmp
python3 ${GREBI_HOME}/scripts/dataload.py



