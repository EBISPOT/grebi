
CREATE INDEX node_id FOR (n:GraphNode) ON n.`grebi:nodeId`
;
CREATE INDEX subgraph FOR (n:GraphNode) ON n.`grebi:subgraph`
;
CREATE INDEX id_id FOR (n:Id) ON n.`id`
;
CALL db.awaitIndexes(10800)
;
MATCH (ancestor:`ols:Class`)<-[:`biolink:broad_match`*1..]-(subclass:`ols:Class`)
WITH ancestor, count(DISTINCT subclass) AS num_desc
SET ancestor.num_desc = num_desc
;
WITH COLLECT { MATCH (cl:`ols:Class`) RETURN max(cl.num_desc) }[0] AS max_num_desc
MATCH (cl2:`ols:Class`)
SET cl2.ic = 1.0 - (cl2.num_desc/max_num_desc)
;
CREATE INDEX ic FOR (n:GraphNode) ON (n.ic)
;
CALL db.awaitIndexes(10800)
;
