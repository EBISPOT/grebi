# GrEBI (Graphs@EBI)

HPC pipeline to aggregate knowledge graphs from [EMBL-EBI resources](https://www.ebi.ac.uk/services/data-resources-and-tools), the [MONARCH Initiative KG](https://monarch-initiative.github.io/monarch-ingest/Sources/), [ROBOKOP](https://robokop.renci.org/), [Ubergraph](https://github.com/INCATools/ubergraph), and other sources into giant (multi-terabyte) transient Neo4j+Solr+RocksDB databases for querying.

## Outputs

The resulting transient databases can be downloaded from https://ftp.ebi.ac.uk/pub/databases/spot/kg/ebi/

| Name | Description | # Nodes | # Edges | Neo4j DB size
| ---------- | ------ | --- | --- | --- |
| `ebi_monarch_xspecies` | All datasources with cross-species phenotype matches merged | ~130m | ~850m | ~900 GB |
| `ebi_monarch` | All datasources with cross-species phenotype matches separated | | | |
| `impc_x_gwas` | Limited to data from IMPC, GWAS Catalog, and related ontologies and mappings | |  |  |

Note that the purpose of this pipeline is not to supply another knowledge graph, but to facilitate querying and analysis across existing ones. Consequently the above databases should be considered temporary and are subject to be removed and/or replaced with new ones without warning.

## Mapping sets used
 
The following mapping tables are loaded:

* https://data.monarchinitiative.org/mappings/latest/gene_mappings.sssom.tsv
* https://data.monarchinitiative.org/mappings/latest/hp_mesh.sssom.tsv
* https://data.monarchinitiative.org/mappings/latest/mesh_chebi_biomappings.sssom.tsv
* https://data.monarchinitiative.org/mappings/latest/mondo.sssom.tsv
* https://data.monarchinitiative.org/mappings/latest/umls_hp.sssom.tsv
* https://data.monarchinitiative.org/mappings/latest/upheno_custom.sssom.tsv
* https://raw.githubusercontent.com/mapping-commons/mh_mapping_initiative/master/mappings/mp_hp_mgi_all.sssom.tsv
* https://raw.githubusercontent.com/obophenotype/bio-attribute-ontology/master/src/mappings/oba-efo.sssom.tsv
* https://raw.githubusercontent.com/obophenotype/bio-attribute-ontology/master/src/mappings/oba-vt.sssom.tsv
* https://github.com/biopragmatics/biomappings/raw/refs/heads/master/src/biomappings/resources/mappings.tsv

In all of the currently configured outputs, `skos:exactMatch` mappings cause clique merging. In `ebi_monarch_xspecies`, `semapv:crossSpeciesExactMatch` also causes clique merging (so e.g. corresponding HP and MP terms will share a graph node). As this is not always desirable, a separate graph `ebi_monarch` is also provided where `semapv:crossSpeciesExactMatch` mappings are represented as edges.

## Full list of datasources

| Datasource | Loaded from |
| ---------- | ------ |
| [IMPC](https://www.mousephenotype.org/) | EBI
| [GWAS Catalog](https://www.ebi.ac.uk/gwas) | EBI
| [OLS](https://www.ebi.ac.uk/ols4) | EBI
| [OpenTargets](https://www.opentargets.org/) | EBI
| [Metabolights](https://www.ebi.ac.uk/metabolights) | EBI
| [ChEMBL](https://www.ebi.ac.uk/chembl/) | EBI
| [Reactome](https://reactome.org/) | EBI, MONARCH
| [BGee](https://www.bgee.org/about/) | MONARCH
| [BioGrid](https://thebiogrid.org/) | MONARCH
| [Gene Ontology (GO) Annotation Database](https://monarch-initiative.github.io/monarch-ingest/Sources/go/) | MONARCH
| [HGNC (HUGO Gene Nomenclature Committee)](https://www.genenames.org/) | MONARCH
| [Human Phenotype Ontology Annotations (HPOA)](https://hpo.jax.org/data/annotations) | MONARCH
| [NCBI Gene](https://monarch-initiative.github.io/monarch-ingest/Sources/ncbi/) | MONARCH
| [PHENIO](https://monarch-initiative.github.io/monarch-ingest/Sources/phenio/) | MONARCH
| [PomBase](https://www.pombase.org) | MONARCH
| [ZFIN](https://monarch-initiative.github.io/monarch-ingest/Sources/zfin/) | MONARCH
| [MedGen](https://www.ncbi.nlm.nih.gov/mesh/) | [MONARCH](https://github.com/monarch-initiative/medgen)
| [Protein ANalysis THrough Evolutionary Relationships (PANTHER)](http://pantherdb.org/) | MONARCH, ROBOKOP
| [STRING](https://string-db.org/) | MONARCH, ROBOKOP
| [Comparative Toxicogenomics Database (CTD)](http://ctdbase.org/about/) | MONARCH, ROBOKOP
| [Alliance of Genome Resources](https://www.alliancegenome.org/) | MONARCH, ROBOKOP
| [BINDING](https://www.bindingdb.org/) | ROBOKOP
| [CAM KG](https://robokop.renci.org/api-docs/docs/automat/cam-kg) | ROBOKOP
| [The Comparative Toxicogenomics Database (CTD)](http://ctdbase.org/about/) | ROBOKOP
| [Drug Central](https://drugcentral.org/) | ROBOKOP
| [The Alliance of Genome Resources](https://www.alliancegenome.org/) | ROBOKOP
| [The Genotype-Tissue Expression (GTEx) portal](https://gtexportal.org/home) | ROBOKOP
| [Guide to Pharmacology database (GtoPdb)](http://www.guidetopharmacology.org) | ROBOKOP
| [Hetionet](https://het.io/) | ROBOKOP
| [HMDB](https://hmdb.ca/) | ROBOKOP
| [Human GOA](https://www.ebi.ac.uk/GOA/index) | ROBOKOP
| [Integrated Clinical and Environmental Exposures Service (ICEES) KG](https://github.com/NCATSTranslator/Translator-All/wiki/Exposures-Provider-ICEES) | ROBOKOP
| [IntAct](https://www.ebi.ac.uk/intact/home) | ROBOKOP
| [Protein ANalysis THrough Evolutionary Relationships (PANTHER)](http://pantherdb.org/) | ROBOKOP
| [Pharos](https://pharos.nih.gov/) | ROBOKOP
| [STRING](https://string-db.org/) | ROBOKOP
| [Text Mining Provider KG](https://github.com/NCATSTranslator/Translator-All/wiki/Text-Mining-Provider) | ROBOKOP
| [Viral Proteome](https://www.ebi.ac.uk/GOA/proteomes) | ROBOKOP
| [AOPWiki](https://aopwiki.org/) | [AOPWikiRDF](https://github.com/marvinm2/AOPWikiRDF)
| [Ubergraph](https://github.com/INCATools/ubergraph)
| [MeSH](https://www.ncbi.nlm.nih.gov/mesh/)
| [Human Reference Atlas KG](https://humanatlas.io/)


## Implementation

The pipeline is implemented as [Rust](https://www.rust-lang.org/) programs with simple CLIs, orchestrated with [Nextflow](https://www.nextflow.io/). Input KGs are represented in a variety of formats including [KGX](https://github.com/biolink/kgx), [RDF](https://www.w3.org/RDF/), and [JSONL](https://jsonlines.org/) files. After loading, a simple "bruteforce" integration strategy is applied:

* All strings that begin with any IRI or CURIE prefix from the [Bioregistry](https://bioregistry.io/) are canonicalised to the standard CURIE form
* All property values that are the identifier of another node in the graph become edges
* Cliques of equivalent nodes are merged into single nodes
* Cliques of equivalent properties are merged into single properties (and for ontology-defined properties, the [qualified safe labels](https://github.com/VirtualFlyBrain/neo4j2owl/blob/master/README.md) are used)

The primary output of the pipeline is a [property graph](https://docs.oracle.com/en/database/oracle/property-graph/22.2/spgdg/what-are-property-graphs.html) for [Neo4j](https://github.com/neo4j/neo4j). The nodes and edges are also loaded into [Solr](https://solr.apache.org/) for full-text search and [RocksDB](https://rocksdb.org/) for id->object resolution.



