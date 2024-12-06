import { Fragment, useEffect, useState } from "react";
import GraphNode from "../../model/GraphNode";
import { getPaginated, Page } from "../../app/api";
import encodeNodeId from "../../encodeNodeId";
import { CircularProgress, Grid, Typography } from "@mui/material";
import { asArray, copyToClipboard } from "../../app/util";
import LocalDataTable from "../datatable/LocalDataTable";
import NodeRefLink from "../node_edge_list/NodeRefLink";
import GraphEdge from "../../model/GraphEdge";
import GraphNodeRef from "../../model/GraphNodeRef";
import { DatasourceTags } from "../DatasourceTag";
import Refs from "../../model/Refs";
import PropVals from "../node_prop_table/PropVals";
import PropVal from "../../model/PropVal";


export default function ExposureLinks({node}:{node:GraphNode}) {

    let type = node.extractType()
    var links:any = null
    if(type) {
        if(type.short === 'Gene') {
            links = <GeneExposureLinks node={node} />
        }
        if(type.short === 'Chemical') {
            links = <ChemicalExposureLinks node={node} />
        }
    }


    return <div>
        <ExpandableSection title="Source IDs">
                    <Grid container spacing={0.5} direction="row" alignItems={"left"} justifyContent={"left"} className="pb-5">
              {node.getSourceIds().map(id => <Grid item>
                <div className="bg-grey-default rounded-sm font-mono pl-1" style={{fontSize:'small'}}>
                {id.value} <button onClick={() => { copyToClipboard(id.value); }} >
                  <i className="icon icon-common icon-copy icon-spacer" />
                </button>
                </div>
</Grid>
)}
            </Grid>
        </ExpandableSection>
        {links && links}
    </div>
}


let fixedCols = [
    {
        id: "grebi:datasources",
        name: "Datasources",
        selector: (edge:GraphEdge, key:string) => <DatasourceTags dss={edge['grebi:datasources']} />,
    },
    {
        id: "from",
        name: "Chemical",
        selector: (edge:GraphEdge, key:string) => <NodeRefLink subgraph={process.env.REACT_APP_EXPOSOMEKG_SUBGRAPH!} nodeRef={new GraphNodeRef(edge['from'])} showTypeChip={false} />,
    }
];

function DefaultSelector(row:any, key:string) {
    let vals = asArray(row[key]).map(PropVal.from);

    console.dir(vals)

    return <PropVals 
     subgraph={process.env.REACT_APP_EXPOSOMEKG_SUBGRAPH!} 
    refs={new Refs(row['_refs'])}
    values={vals} />
}

function GeneExposureLinks({node}:{node:GraphNode}) {

    let [affectedBy, setAffectedBy] = useState<Page<any>|null>(null)

    useEffect(() => {

        async function getAffectedBy() {
            let res = await getPaginated<any>(`api/v1/subgraphs/${node.getSubgraph()}/nodes/${encodeNodeId(node.getNodeId())}/incoming_edges`, {
                'grebi:type': 'biolink:chemical_gene_interaction_association'
            });
            setAffectedBy(res)
        }
         
        getAffectedBy()

    }, [node.getNodeId()])


    return <div>
        <ExpandableSection title={
            affectedBy ? 
            `Gene-chemical interactions (${affectedBy.totalElements})`
            :
            `Gene-chemical interactions (Loading...)`
            } loading={!affectedBy}>

{affectedBy &&
                <LocalDataTable
                    data={affectedBy?.elements} 
                    addColumnsFromData={true}
                    columns={fixedCols}
                    defaultSelector={DefaultSelector}
                    hideColumns={[
                        "_refs",
                        "grebi:edgeId",
                        "grebi:subgraph",
                        "grebi:type",
                        "grebi:fromNodeId",
                        "grebi:toNodeId",
                        "grebi:fromSourceIds",
                        "grebi:name",
                        "to"
                    ]}
                    />
                }

        </ExpandableSection>
    </div>



}

function ChemicalExposureLinks({node}:{node:GraphNode}) {

    return <div></div>
}



function ExpandableSection({title, loading, children}) {

    let [expanded, setExpanded] = useState<boolean>(false);

    return <div>
        <Typography variant="h6" onClick={() => setExpanded(!expanded)} style={{cursor:'pointer'}}>
            {loading ?
            <Fragment>
                <CircularProgress size="1rem" />
                &nbsp;
            </Fragment>
            :
                <Fragment>{expanded ? '-\t' : '+\t'}</Fragment>
            }
            {title}
        </Typography>
        { expanded && children }
    </div>

}