package uk.ac.ebi.grebi.repo;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import org.neo4j.driver.EagerResult;
import org.neo4j.driver.QueryConfig;
import org.neo4j.driver.Value;
import org.springframework.data.domain.Pageable;
import uk.ac.ebi.grebi.GrebiApi;
import uk.ac.ebi.grebi.db.Neo4jClient;
import uk.ac.ebi.grebi.db.ResolverClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class GrebiNeoRepo {

    static final String[] NEO4J_HOSTS =
            System.getenv("GREBI_NEO4J_HOSTS").split(";");

    public static String[] getNeo4jHosts() {
        if(NEO4J_HOSTS != null)
            return NEO4J_HOSTS;
        return List.of("bolt://localhost:7687/").toArray(new String[0]);
    }

    Map<String, Neo4jClient> subgraphToClient = new HashMap<>();

    ResolverClient resolver = new ResolverClient();
    Gson gson = new Gson();

    public GrebiNeoRepo() throws IOException {

        for(String host : getNeo4jHosts()) {
            Neo4jClient client = new Neo4jClient(host);

            String subgraph = (String)
                    client.rawQuery("MATCH (n:GraphNode) RETURN n.`grebi:subgraph` AS subgraph LIMIT 1")
                        .get(0).get("subgraph");

            subgraphToClient.put(subgraph, client);
        }
    }

    private Neo4jClient getClient(String subgraph) {
        var client = subgraphToClient.get(subgraph);
        if(client != null)
            return client;
        throw new IllegalArgumentException("subgraph " + subgraph + " not found");
    }

    public Set<String> getSubgraphs() {
        return subgraphToClient.keySet();
    }

    final String STATS_QUERY = new String(GrebiApi.class.getResourceAsStream("/cypher/stats.cypher").readAllBytes(), StandardCharsets.UTF_8);
    final String INCOMING_EDGES_QUERY = new String(GrebiApi.class.getResourceAsStream("/cypher/incoming_edges.cypher").readAllBytes(), StandardCharsets.UTF_8);

    public Map<String, Map<String,Object>> getStats() {
        Map<String, Map<String,Object>> subgraphToStats = new HashMap<>();
        for(var subgraph : subgraphToClient.keySet()) {
            EagerResult props_res = getClient(subgraph).getDriver().executableQuery(STATS_QUERY).withConfig(QueryConfig.builder().withDatabase("neo4j").build()).execute();
            subgraphToStats.put(subgraph, props_res.records().get(0).values().get(0).asMap());
        }
        return subgraphToStats;
    }

    public class EdgeAndNode {
        public Map<String,Object> edge, node;
        public EdgeAndNode(Map<String,Object> edge, Map<String,Object> node) {
            this.edge = edge;
            this.node = node;
        }
    }

    public List<EdgeAndNode> getIncomingEdges(String subgraph, String nodeId, Pageable pageable) {
        EagerResult res = getClient(subgraph).getDriver().executableQuery(INCOMING_EDGES_QUERY)
            .withParameters(Map.of(
                    "nodeId", subgraph + ":" + nodeId,
                    "offset", pageable.getOffset(),
                    "limit", pageable.getPageSize()
            ))
            .withConfig(QueryConfig.builder().withDatabase("neo4j").build()).execute();

        var resolved = resolver.resolveToMap(
                subgraph,
                res.records().stream().flatMap(record -> {
                    var props = record.asMap();
                    return List.of(
                            removeSubgraphPrefix((String) props.get("otherId"), subgraph),
                            removeSubgraphPrefix((String) props.get("edgeId"), subgraph)
                    ).stream();
                }).collect(Collectors.toSet()));

        return res.records().stream().map(record -> {
            var props = record.asMap();
            var otherId = removeSubgraphPrefix((String)props.get("otherId"), subgraph);
            var edgeId = removeSubgraphPrefix((String)props.get("edgeId"), subgraph);
            return new EdgeAndNode(resolved.get(edgeId), resolved.get(otherId));
        }).collect(Collectors.toList());
    }

    private String removeSubgraphPrefix(String id, String subgraph) {
        if(!id.startsWith(subgraph + ":")) {
            throw new RuntimeException();
        }
        return id.substring(subgraph.length() + 1);
    }

    static Map<String, Object> mapValue(Value value) {
        Map<String, Object> res = new TreeMap<>(value.asMap());
        res.put("grebi:type", StreamSupport.stream(value.asNode().labels().spliterator(), false).collect(Collectors.toList()));
        return res;
    }


}
