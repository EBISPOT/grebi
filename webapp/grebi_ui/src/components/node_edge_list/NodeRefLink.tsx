import { Link } from "react-router-dom"
import encodeNodeId from "../../encodeNodeId"
import GraphNodeRef from "../../model/GraphNodeRef"
import NodeTypeChip from "../NodeTypeChip"

export default function NodeRefLink({
    subgraph,
    nodeRef,
    showTypeChip
}:{
    subgraph:string,
    nodeRef:GraphNodeRef,
    showTypeChip?:boolean|undefined
}) {
    let type = nodeRef.extractType()

    return <Link to={`/subgraphs/${subgraph}/nodes/${nodeRef.getEncodedNodeId()}`}>
        {nodeRef.getName()}
        {showTypeChip && type && <NodeTypeChip type={type} />}
        {/* <br/>
        <DatasourceTags dss={nodeRef.getDatasources()} /> */}
    </Link>
}