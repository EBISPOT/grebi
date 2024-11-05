

all: ebi_monarch_xspecies.json ebi_monarch.json hett.json hra_kg.json impc.json monarch.json

%.json: src/%.py
	python3 $< > $@

.PHONY: all
