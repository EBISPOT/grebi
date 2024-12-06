
import encodeNodeId from "../encodeNodeId";
import GraphNodeRef from "./GraphNodeRef";
import PropVal from "./PropVal";
import Refs from "./Refs";

export default class GraphEdge extends GraphNodeRef {

    props:any

    constructor(props:any) {
        super(props)
    }

    getEdgeId():string {
        return this.props['grebi:edgeId']
    }

    getSubgraph():GraphNodeRef {
        return this.props['grebi:subgraph']
    }

    getFrom():GraphNodeRef {
        return new GraphNodeRef( this.props['from'] )
    }

    getType():string {
        return this.props['grebi:type']
    }

    getTo():GraphNodeRef {
        return new GraphNodeRef( this.props['to'] )
    }

    getDatasources(): string[] {
        return this.props['grebi:datasources']
    }

}

