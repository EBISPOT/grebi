

from shared import config

config['id'] = 'HETT'
config['name'] = 'EMBL Human Ecosystems'
config['datasource_configs'] = [
    "./configs/datasource_configs/hett_pesticides_appril.yaml",
    "./configs/datasource_configs/hett_pesticides_eu.yaml",
    "./configs/datasource_configs/hett_pesticides_gb.yaml",
    "./configs/datasource_configs/aopwiki.yaml",
    "./configs/datasource_configs/chembl.yaml",
    "./configs/datasource_configs/ols_hett.yaml"
]

if __name__ == '__main__':
    import json
    print(json.dumps(config, indent=2))
