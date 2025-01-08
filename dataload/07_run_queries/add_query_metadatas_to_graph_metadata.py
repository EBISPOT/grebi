
import json
import sys

def main():
    graph_metadata_filename = sys.argv[1]
    query_metadata_filenames = sys.argv[2:]
    
    with open(graph_metadata_filename, 'r') as file:
        graph_metadata = json.load(file)
        graph_metadata['materialised_queries'] = []
        for query_metadata_filename in query_metadata_filenames:
            with open(query_metadata_filename, 'r') as file:
                query_metadata = json.load(file)
            graph_metadata['materialised_queries'].append(query_metadata)
     
    print(json.dumps(graph_metadata, indent=2))

if __name__=="__main__":
    main()

