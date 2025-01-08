#!/bin/bash
export GREBI_DATALOAD_HOME=/home/james/grebi/dataload
export GREBI_QUERY_YAMLS_PATH=/home/james/grebi/materialised_queries
export GREBI_OUT_DIR=/data/grebi_tmp
export GREBI_CONFIG=gwas_efo_only
export GREBI_IS_EBI=false
export GREBI_TIMESTAMP=$(date +%Y_%m_%d__%H_%M)
export RUST_BACKTRACE=full
export GREBI_NEXTFLOW_CONFIG=$GREBI_DATALOAD_HOME/nextflow/saturos_nextflow.config
export GREBI_SUBGRAPH=gwas_and_efo
cd $GREBI_OUT_DIR
export PYTHONUNBUFFERED=true
source ~/grebi/.venv/bin/activate

nextflow $GREBI_DATALOAD_HOME/nextflow/load_subgraph.nf -c $GREBI_NEXTFLOW_CONFIG -resume



