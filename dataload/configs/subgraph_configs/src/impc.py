

from shared import config

config['id'] = 'IMPC'
config['name'] = 'International Mouse Phenotyping Consortium (IMPC)'
config['datasource_configs'] = [
    "./configs/datasource_configs/impc.yaml",
    "./configs/datasource_configs/impc_observations.yaml",
    "./configs/datasource_configs/ols.yaml",
    "./configs/datasource_configs/mondo_efo.yaml"
]

if __name__ == '__main__':
    import json
    print(json.dumps(config, indent=2))
