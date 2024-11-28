import { useEffect, useState } from "react";
import GraphNode from "../../model/GraphNode";
import { getPaginated, Page } from "../../app/api";
import encodeNodeId from "../../encodeNodeId";
import { Grid, Typography } from "@mui/material";
import { copyToClipboard } from "../../app/util";


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

function GeneExposureLinks({node}:{node:GraphNode}) {

    let [affectedBy, setAffectedBy] = useState<Page<any>|null>(null)

    useEffect(() => {

        async function getAffectedBy() {
            let res = await getPaginated(`api/v1/subgraphs/${node.getSubgraph()}/nodes/${encodeNodeId(node.getNodeId())}/incoming_edges`, {
                'grebi:type': 'biolink:chemical_gene_interaction_association'
            })
            setAffectedBy(res)
        }
         
        getAffectedBy()

    }, [node.getNodeId()])

    return <div>

        { affectedBy && 
        <ExpandableSection title={`Gene affected by chemicals (${affectedBy.totalElements})`}>
            <div/>
        </ExpandableSection>
    }

    </div>



}

function ChemicalExposureLinks({node}:{node:GraphNode}) {

    return <div></div>
}



function ExpandableSection({title, children}) {

    let [expanded, setExpanded] = useState<boolean>(false);

    return <div>
        <Typography variant="h6" onClick={() => setExpanded(!expanded)} style={{cursor:'pointer'}}>
            {expanded ? '-\t' : '+\t'}
            {title}
        </Typography>
        { expanded && children }
    </div>

}