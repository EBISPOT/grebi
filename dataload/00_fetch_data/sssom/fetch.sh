#!/bin/bash

rm -f *.sssom.tsv.gz *.sssom.tsv

wget https://data.monarchinitiative.org/mappings/latest/gene_mappings.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/hp_mesh.sssom.tsv
wget https://data.monarchinitiative.org/mappings/latest/mesh_chebi_biomappings.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/mondo.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/umls_hp.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/upheno-cross-species.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/upheno-species-independent.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/nbo-go.sssom.tsv 
wget https://data.monarchinitiative.org/mappings/latest/uberon.sssom.tsv 
wget https://raw.githubusercontent.com/obophenotype/upheno-dev/refs/heads/master/src/mappings/upheno-oba.sssom.tsv
wget https://raw.githubusercontent.com/mapping-commons/disease-mappings/refs/heads/main/mappings/mondo_hp_lexical.sssom.tsv

wget https://raw.githubusercontent.com/mapping-commons/mh_mapping_initiative/master/mappings/mp_hp_mgi_all.sssom.tsv 
wget https://raw.githubusercontent.com/obophenotype/bio-attribute-ontology/master/src/mappings/oba-efo.sssom.tsv
wget https://raw.githubusercontent.com/obophenotype/bio-attribute-ontology/master/src/mappings/oba-vt.sssom.tsv 

sed -i 's/skos:exactMatch/semapv:crossSpeciesExactMatch/g' mp_hp_mgi_all.sssom.tsv

for f in *.sssom.tsv; do
  gzip $f
done

