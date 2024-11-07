WITH COLLECT { MATCH (cl:`ols:Class`) RETURN max(cl.num_desc) }[0] AS max_num_desc
MATCH (cl2:`ols:Class`)
SET cl2.ic = 1.0 - (cl2.num_desc/max_num_desc)
;
