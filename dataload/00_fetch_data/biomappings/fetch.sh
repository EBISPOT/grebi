#!/bin/bash

wget https://raw.githubusercontent.com/biopragmatics/biomappings/refs/heads/master/src/biomappings/resources/mappings.tsv

for f in *.tsv; do
  gzip -9 $f
done

