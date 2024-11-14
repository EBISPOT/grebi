import { Link } from "react-router-dom"
import encodeNodeId from "../../encodeNodeId"
import GraphNodeRef from "../../model/GraphNodeRef"
import NodeTypeChip from "../NodeTypeChip"

export default function NodeRefLink({
    subgraph,
    nodeRef
}:{
    subgraph:string,
    nodeRef:GraphNodeRef
}) {
    let type = nodeRef.extractType()

    return <Link to={`/subgraphs/${subgraph}/nodes/${nodeRef.getEncodedNodeId()}`}>
        {nodeRef.getName()}
        {type && <NodeTypeChip type={type} />}
        {/* <br/>
        <DatasourceTags dss={nodeRef.getDatasources()} /> */}
    </Link>
}