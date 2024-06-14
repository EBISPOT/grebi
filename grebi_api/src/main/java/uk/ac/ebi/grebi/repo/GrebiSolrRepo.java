package uk.ac.ebi.grebi.repo;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.solr.common.SolrDocument;
import org.springframework.data.domain.Pageable;

import com.google.gson.JsonElement;

import uk.ac.ebi.grebi.GrebiFacetedResultsPage;
import uk.ac.ebi.grebi.db.GrebiSolrClient;
import uk.ac.ebi.grebi.db.GrebiSolrQuery;
import uk.ac.ebi.grebi.db.ResolverClient;

public class GrebiSolrRepo {

    GrebiSolrClient solrClient = new GrebiSolrClient();
    ResolverClient resolver = new ResolverClient();

    public GrebiSolrRepo() {}

    public List<String> autocomplete(String q) {
        return solrClient.autocomplete(q);
    }

    public GrebiFacetedResultsPage<Map<String,JsonElement>> searchNodesPaginated(GrebiSolrQuery query, Pageable pageable) {
        return resolveNodeIds(solrClient.searchSolrPaginated(query, pageable));
    }

    public Map<String,JsonElement> getFirstNode(GrebiSolrQuery query) {
        return resolveNodeId(solrClient.getFirst(query));
    }

    private GrebiFacetedResultsPage<Map<String,JsonElement>> resolveNodeIds(GrebiFacetedResultsPage<SolrDocument> solrDocs) {

        List<String> ids = solrDocs.map(doc -> doc.getFieldValue("grebi__nodeId").toString()).toList();

        List<Map<String,JsonElement>> vals = resolver.resolveToList(ids);
        assert(vals.size() == solrDocs.getSize());

        return new GrebiFacetedResultsPage<>(vals, solrDocs.facetFieldToCounts, solrDocs.getPageable(), solrDocs.getTotalElements());
    }

    private Map<String,JsonElement> resolveNodeId(SolrDocument solrDoc)  {
        return resolver.resolveToList(List.of(solrDoc.getFieldValue("grebi__nodeId").toString())).iterator().next();
    }

    private GrebiFacetedResultsPage<Map<String,JsonElement>> resolveEdgeIds(GrebiFacetedResultsPage<SolrDocument> solrDocs) {

        List<String> ids = solrDocs.map(doc -> doc.getFieldValue("grebi__edgeId").toString()).toList();

        List<Map<String,JsonElement>> vals = resolver.resolveToList(ids);
        assert(vals.size() == solrDocs.getSize());

        return new GrebiFacetedResultsPage<>(vals, solrDocs.facetFieldToCounts, solrDocs.getPageable(), solrDocs.getTotalElements());
    }

    private Map<String,JsonElement> resolveEdgeId(SolrDocument solrDoc)  {

        return resolver.resolveToList(List.of(solrDoc.getFieldValue("grebi__edgeId").toString())).iterator().next();
    }

}
