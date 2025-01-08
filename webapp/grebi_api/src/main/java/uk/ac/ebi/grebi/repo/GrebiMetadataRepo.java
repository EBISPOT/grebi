package uk.ac.ebi.grebi.repo;

import java.util.Map;
import java.util.Set;

import com.google.gson.JsonElement;

import uk.ac.ebi.grebi.db.MetadataClient;

public class GrebiMetadataRepo {

    Map<String,JsonElement> subgraph2metadata;
    
    public GrebiMetadataRepo() {

        MetadataClient MetadataClient = new MetadataClient();
        subgraph2metadata = MetadataClient.getMetadatas();

    }

    public Set<String> getSubgraphs() {
        return subgraph2metadata.keySet();
    }

    public Map<String,JsonElement> getMetadata(String subgraph) {
        return subgraph2metadata.get(subgraph).getAsJsonObject().asMap();
    }

    public Set<String> getAllEdgeProps(String subgraph) {
        return getMetadata(subgraph).get("edge_props").getAsJsonObject().keySet();
    }


}
