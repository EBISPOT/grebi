MATCH (ancestor:`ols:Class`)<-[:`biolink:broad_match`*1..]-(subclass:`ols:Class`)
WITH ancestor, count(DISTINCT subclass) AS num_desc
SET ancestor.num_desc = num_desc
;