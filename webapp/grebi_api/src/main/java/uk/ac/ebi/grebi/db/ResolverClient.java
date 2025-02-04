
package uk.ac.ebi.grebi.db;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.gson.JsonElement;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.google.gson.JsonElement;
import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.ContentType;
import com.google.common.base.Stopwatch;

public class ResolverClient {

    static final String RESOLVER_HOST = System.getenv("GREBI_RESOLVER_HOST");


    public static String getResolverHost() {
        if (RESOLVER_HOST != null)
            return RESOLVER_HOST;
        return "http://localhost:8080/";
    }

    public Set<String> getSubgraphs() {
        HttpClient client = HttpClientBuilder.create().build();
        HttpGet request = new HttpGet(getResolverHost() + "/subgraphs");
        HttpResponse response;
        try {
            response = client.execute(request);
            HttpEntity entity = response.getEntity();
            String json = EntityUtils.toString(entity);
            return new Gson().fromJson(json, Set.class);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public Map<String, Map<String,Object>> resolveToMap(String subgraph, Collection<String> ids) {

        Stopwatch timer = Stopwatch.createStarted();

        HttpClient client = HttpClientBuilder.create().build();
        Gson gson = new Gson();

        String resolverHost = getResolverHost();

        HttpPost request = new HttpPost(resolverHost + "/" + subgraph + "/resolve");
        request.setEntity(new StringEntity(gson.toJson(ids), ContentType.APPLICATION_JSON));

//        System.out.println("calling resolver at " + resolverHost + "/resolve" + " with " + gson.toJson(ids));

        try {
            HttpResponse response = client.execute(request);
            HttpEntity entity = response.getEntity();

            if (entity != null) {
                System.out.println("Resolved " + ids.size() + " ids in " + timer.stop().toString());

                String json = EntityUtils.toString(entity);
//                System.out.println("response was " + json);
                return gson.fromJson(json, Map.class);
            } else {
                // Handle empty response
                System.out.println("Empty response received");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public List<Map<String, Object>> resolveToList(String subgraph, Collection<String> ids) {

        var resolved = resolveToMap(subgraph, ids);

        return ids.stream().map(id -> resolved.get(id)).collect(Collectors.toList());
    }
}
