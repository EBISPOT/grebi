
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

public class MetadataClient {

    static final String METADATA_HOST = System.getenv("GREBI_METADATA_HOST");


    public static String getMetadataHost() {
        if (METADATA_HOST != null)
            return METADATA_HOST;
        return "http://localhost:8081/";
    }

    public Map<String,JsonElement> getMetadatas() {
        HttpClient client = HttpClientBuilder.create().build();
        HttpGet request = new HttpGet(getMetadataHost());
        HttpResponse response;
        try {
            response = client.execute(request);
            HttpEntity entity = response.getEntity();
            String json = EntityUtils.toString(entity);
            return new Gson().fromJson(json, JsonElement.class).getAsJsonObject().asMap();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }



}
