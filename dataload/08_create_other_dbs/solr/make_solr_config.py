
import json
import os
import sys
import shlex
import time
import glob
import argparse
from pathlib import Path
from subprocess import Popen, PIPE, STDOUT


def main():
    parser = argparse.ArgumentParser(description='Create Solr config')
    parser.add_argument('--subgraph-name', type=str, help='subgraph name', required=True)
    parser.add_argument('--in-graph-metadata-json', type=str, help='summary.json', required=True)
    parser.add_argument('--in-template-config-dir', type=str, help='Path of config template', required=True)
    parser.add_argument('--out-config-dir', type=str, help='Path to write config', required=True)
    args = parser.parse_args()
   
    os.makedirs(args.out_config_dir)

    nodes_core_path = os.path.join(args.out_config_dir, f'grebi_nodes_{args.subgraph_name}')
    edges_core_path = os.path.join(args.out_config_dir, f'grebi_edges_{args.subgraph_name}')
    os.system('cp -r ' + shlex.quote(os.path.join(args.in_template_config_dir, "grebi_nodes")) + ' ' + shlex.quote(nodes_core_path))
    os.system('cp -r ' + shlex.quote(os.path.join(args.in_template_config_dir, "grebi_edges")) + ' ' + shlex.quote(edges_core_path))

    os.system('cp ' + shlex.quote(os.path.join(args.in_template_config_dir, "solr.xml")) + ' ' + shlex.quote(args.out_config_dir))
    os.system('cp ' + shlex.quote(os.path.join(args.in_template_config_dir, "solrconfig.xml")) + ' ' + shlex.quote(args.out_config_dir))
    os.system('cp ' + shlex.quote(os.path.join(args.in_template_config_dir, "zoo.cfg")) + ' ' + shlex.quote(args.out_config_dir))

    summary = json.load(open(args.in_graph_metadata_json))
    node_props = map(lambda f: f.replace(':', '__').replace('&', '_'), summary['entity_props'].keys())
    edge_props = map(lambda f: f.replace(':', '__').replace('&', '_'), summary['edge_props'].keys())

    Path(f'{nodes_core_path}/core.properties').write_text(f"name=grebi_nodes_{args.subgraph_name}\n")
    Path(f'{edges_core_path}/core.properties').write_text(f"name=grebi_edges_{args.subgraph_name}\n")

    nodes_schema = Path(f'{nodes_core_path}/conf/schema.xml')
    nodes_schema.write_text(nodes_schema.read_text().replace('[[GREBI_FIELDS]]', '\n'.join(list(map(
        lambda f: '\n'.join([
            f'<field name="{f}" type="string" indexed="true" stored="false" required="false" multiValued="true" />',
            f'<copyField source="{f}" dest="str_{f}"/>',
            f'<copyField source="{f}" dest="lowercase_{f}"/>'
        ]), node_props)))))

    edges_schema = Path(f'{edges_core_path}/conf/schema.xml')
    edges_schema.write_text(edges_schema.read_text().replace('[[GREBI_FIELDS]]', '\n'.join(list(map(
        lambda f: '\n'.join([
            f'<field name="{f}" type="string" indexed="true" stored="false" required="false" multiValued="true" />',
            f'<copyField source="{f}" dest="str_{f}"/>',
            f'<copyField source="{f}" dest="lowercase_{f}"/>'
        ]), edge_props)))))

if __name__=="__main__":
    main()


