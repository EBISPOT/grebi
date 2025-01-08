

import { Fragment } from "react";
import DataTable, { Column } from "../../../components/datatable/DataTable";
import EbiHeader from "../EbiHeader";
import React from "react";

export default function EbiDownloadsPage() {
  document.title = "Ontology Lookup Service (OLS)";
  return (
    <Fragment>
      <EbiHeader section="downloads" />
      <main className="container mx-auto px-4 my-8">
        <div className="text-2xl font-bold my-6">
          Downloading Knowledge Graph Exports
        </div>
        <div>
          <p className="px-1 mb-2 text-justify">
            Neo4j and Solr databases exports of the KG can be downloaded from&thinsp;
            <a
              className="link-default"
              href="https://ftp.ebi.ac.uk/pub/databases/spot/kg/"
              rel="noopener noreferrer"
              target="_blank"
            >
            https://ftp.ebi.ac.uk/pub/databases/spot/kg/
            </a>.
          </p>
          {/* <DataTable columns={columns} data={data} /> */}
        </div>
      </main>
    </Fragment>
  );
}

const columns: readonly Column[] = [
  {
    id: "Description",
    name: "Description",
    sortable: false,
    selector: (data) => <span>{data.description}</span>,
  },
  {
    id: "File",
    name: "File",
    sortable: false,
    selector: (data) => (
      <a
        className="link-default"
        target="_blank"
        rel="noopener noreferrer"
        href={data.downloadLink}
      >
        {data.downloadLabel}
      </a>
    ),
  },
  {
    id: "Format",
    name: "Format",
    sortable: false,
    selector: (data) => <span>{data.format}</span>,
  },
];

const data: any[] = [
  {
    description:
      "Neo4j database with all datasources (~700 GB uncompressed)",
    downloadLabel: "neo4j.tgz",
    downloadLink:
      "https://ftp.ebi.ac.uk/pub/databases/spot/kg/ebi/latest/ebi_full_monarch_neo4j.tgz",
    format: "Neo4j database",
  },
  {
    description:
      "Solr database indexing all properties of all nodes and edges (~300 GB uncompressed)",
    downloadLabel: "solr.tgz",
    downloadLink:
      "https://ftp.ebi.ac.uk/pub/databases/spot/kg/ebi_full_monarch/latest/solr.tgz",
    format: "Solr database",
  },
  {
    description:
      "Metadata file with names, types, identifiers, datasources of all nodes (~20 GB uncompressed)",
    downloadLabel: "metadata.jsonl.gz",
    downloadLink:
      "https://ftp.ebi.ac.uk/pub/databases/spot/kg/ebi_full_monarch/latest/metadata.jsonl.gz",
    format: "Gzipped JSON Lines",
  },
  {
    description:
      "JSON metadata of the KG contents (< 1 MB)",
    downloadLabel: "metadata.json",
    downloadLink:
      "https://ftp.ebi.ac.uk/pub/databases/spot/kg/ebi_full_monarch/latest/metadata.json",
    format: "JSON",
  },
];
