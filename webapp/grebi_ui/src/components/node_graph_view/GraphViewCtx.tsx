

import cytoscape from "cytoscape"
import fcose from "cytoscape-fcose"
import ReactDOM from "react-dom"
import { get, getPaginated } from "../../app/api";
import GraphEdge from "../../model/GraphEdge";
import GraphNodeRef from "../../model/GraphNodeRef";
import DatasourceSelector from "../DatasourceSelector";
import LoadingOverlay from "../LoadingOverlay";

cytoscape.use(fcose)

let formatter = Intl.NumberFormat('en', { notation: 'compact' });

let MIN_COUNT_NODE_SIZE = 30
let MAX_COUNT_NODE_SIZE = 120
export default class GraphViewCtx {

    public dsSelectorDiv:HTMLDivElement
    public graphDiv:HTMLDivElement
    public cy:any = null
    public subgraph:string
    public loadingOverlay:HTMLDivElement

    public allDatasources:Set<string> = new Set()
    public dsExclude:Set<string> = new Set()

    public incoming_nodeIdToEdgeCountByTypeAndDs:Map<string,any> = new Map()
    public incoming_nodeIdToEdgeIds:Map<string,Set<string>> = new Map()
    public incoming_expandedEdgeIds:Set<string> = new Set()

    public outgoing_nodeIdToEdgeCountByTypeAndDs:Map<string,any> = new Map()
    public outgoing_nodeIdToEdgeIds:Map<string,Set<string>> = new Map()
    public outgoing_expandedEdgeIds:Set<string> = new Set()

    public nodes:Map<string, GraphNodeRef> = new Map()
    public edges:Map<string, GraphEdge> = new Map()

    public root:GraphNodeRef|undefined

    getTotalIncomingEdgeCountByType(nodeId:string) {
        return this.getTotalEdgeCountByType(this.incoming_nodeIdToEdgeCountByTypeAndDs.get(nodeId));
    }
    getTotalOutgoingEdgeCountByType(nodeId:string) {
        return this.getTotalEdgeCountByType(this.outgoing_nodeIdToEdgeCountByTypeAndDs.get(nodeId));
    }
    getTotalEdgeCountByType(edgeCountByTypeAndDs:any) {
        let res = new Map<string, number>()
        for(let type of Object.keys(edgeCountByTypeAndDs)) {
            let edgeCountByDs = edgeCountByTypeAndDs[type]
            let count = 0
            for(let ds of Object.keys(edgeCountByDs)) {
                if(this.dsExclude.has(ds))
                    continue
                count += edgeCountByDs[ds];
            }
            res.set(type, count)
        }
        return res
    }

    constructor(
        container:HTMLDivElement,
        subgraph:string
    ) {
        this.subgraph = subgraph

        container.innerHTML = ''
        this.dsSelectorDiv = document.createElement('div')
        this.graphDiv = document.createElement('div')
        this.graphDiv.style.height = '500px'
        container.appendChild(this.dsSelectorDiv)
        container.appendChild(this.graphDiv)

        this.loadingOverlay = document.createElement('div')
        ReactDOM.render(<LoadingOverlay />, this.loadingOverlay)
    }

    async reload(root:GraphNodeRef) {

        this.root = root

        this.allDatasources = new Set()
        this.incoming_nodeIdToEdgeCountByTypeAndDs = new Map()
        this.incoming_nodeIdToEdgeIds = new Map()
        this.outgoing_nodeIdToEdgeCountByTypeAndDs = new Map()
        this.outgoing_nodeIdToEdgeIds = new Map()
        this.nodes = new Map()
        this.edges = new Map()
        this.nodes.set(root.getNodeId(), root)

        this.showLoadingOverlay()

        await this.loadAll()

        let elements = [
            ...Array.from(this.nodes.values()).map((node:GraphNodeRef) => ({
                classes: 'node' + (node.getNodeId() === root.getNodeId() ? ' root' : ''),
                data: {
                    id: node.getNodeId(),
                    label: node.getName()
                }
            })),
            ...Array.from(this.edges.values()).map((edge:GraphEdge) => ({
                classes: 'edge',
                data: {
                    id: edge.getEdgeId(),
                    source: edge.getFrom().getNodeId(),
                    target: edge.getTo().getNodeId(),
                }
            }))
        ];

        let constraints:any = []

        let max_count = 0
        for(let node of this.nodes.values()) {
            let nodeId = node.getNodeId()
            let outgoing_edgeCountByType = this.getTotalOutgoingEdgeCountByType(nodeId)
            let incoming_edgeCountByType = this.getTotalIncomingEdgeCountByType(nodeId)
            for(let [edgeType,count] of outgoing_edgeCountByType!.entries()) {
                if(count === 0)
                    continue
                max_count = Math.max(count, max_count)
                let countNodeId = 'count_outgoing_' + nodeId + '_' + edgeType
                elements.push({
                    classes: 'count',
                    data: {
                        id: countNodeId,
                        label: formatter.format(count),
                        count
                    }
                })
                elements.push({
                    classes: 'count_edge',
                    data: {
                        id: 'to_' + countNodeId,
                        source: nodeId,
                        target: countNodeId, 
                        label: edgeType
                    }
                })
                constraints.push({ left: nodeId, right: countNodeId })
            }
            for(let [edgeType,count] of incoming_edgeCountByType!.entries()) {
                if(count === 0)
                    continue
                max_count = Math.max(count, max_count)
                let countNodeId = 'count_incoming_' + nodeId + '_' + edgeType
                elements.push({
                    classes: 'count',
                    data: {
                        id: countNodeId,
                        label: formatter.format(count),
                        count
                    }
                })
                elements.push({
                    classes: 'count_edge',
                    data: {
                        id: 'from_' + countNodeId,
                        source: countNodeId,
                        target: nodeId, 
                        label: edgeType
                    }
                })
                constraints.push({ right: nodeId, left: countNodeId })
            }
        }


        console.dir(elements)

        if(this.cy)
            this.cy.destroy()

        this.cy = cytoscape({
            container: this.graphDiv,
            elements,
            style: [ // the stylesheet for the graph
                {
                    selector: '.root',
                    style: {
                        'background-color': '#DDD',
                        'label': 'data(label)',
                        "text-valign" : "center",
                        "text-halign": "center",
                        padding: '16px'
                    } as any
                },
                {
                    selector: '.node',
                    style: {
                        'background-color': '#EEE',
                        'label': 'data(label)',
                        "text-valign" : "center",
"text-halign" : "center",
padding: '8px'
                    } as any
                },
                {
                    selector: '.count',
                    style: {
                        'background-color': '#EEE',
                        'label': 'data(label)',
                        "text-valign" : "center",
"text-halign" : "center",
padding: '8px',
                    width: (node) => (MIN_COUNT_NODE_SIZE + (node.data('count') / max_count) * (MAX_COUNT_NODE_SIZE-MIN_COUNT_NODE_SIZE)) + 'px',
                    height: (node) => (MIN_COUNT_NODE_SIZE + (node.data('count') / max_count) * (MAX_COUNT_NODE_SIZE-MIN_COUNT_NODE_SIZE)) + 'px'

                    } as any
                },
                {
                    selector: '.count_edge',
                    style: {
                        'width': 3,
                        'label': 'data(label)',
                        'line-color': '#ccc',
                        'line-dash-pattern': [6, 3],
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'arrow-scale': 2,
                        'curve-style': 'bezier',
                         "text-rotation": "autorotate"
                    }
                }
            ],
            layout: {
                name: 'fcose',
                    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true,
    idealEdgeLength: edge => 500,
    numIter: 500,
    amimate: false,
    relativePlacementConstraint: constraints
            } as any
        })

        this.dsSelectorDiv.innerHTML = ''
        ReactDOM.render(
            <DatasourceSelector
                datasources={Array.from(this.allDatasources)}
                dsEnabled={Array.from(this.allDatasources)}
                setDsEnabled={(dss:string[]) => {
                    this.dsExclude = new Set(this.allDatasources)
                    for(let ds of dss) {
                        this.dsExclude.delete(ds)
                    }
                    this.reload(root)
                }}
            />,
            this.dsSelectorDiv
        )

        this.hideLoadingOverlay()
    }

    showLoadingOverlay() {
        this.graphDiv.insertBefore(this.loadingOverlay, this.graphDiv.firstChild)
    }
    hideLoadingOverlay() {
        this.graphDiv.removeChild(this.loadingOverlay)
    }

    async loadAll() {

        let toLoadShallow = Array.from(this.nodes.values()).filter(
                node => this.outgoing_nodeIdToEdgeCountByTypeAndDs.get(node.getNodeId()) === undefined)

        return Promise.all(toLoadShallow.map(node => this.loadShallow(node)))
    }

    async loadShallow(node:GraphNodeRef) {

        let [incomingEdgeCounts,outgoingEdgeCounts] = (await Promise.all([
            get<any>(`api/v1/subgraphs/${this.subgraph}/nodes/${node.getEncodedNodeId()}/incoming_edge_counts`),
            get<any>(`api/v1/subgraphs/${this.subgraph}/nodes/${node.getEncodedNodeId()}/outgoing_edge_counts`)
        ]))

        this.incoming_nodeIdToEdgeCountByTypeAndDs.set(node.getNodeId(), incomingEdgeCounts);
        this.outgoing_nodeIdToEdgeCountByTypeAndDs.set(node.getNodeId(), outgoingEdgeCounts);

        for(let edgeTypeToCountByDs of [incomingEdgeCounts, outgoingEdgeCounts]) {
            for(let edgeType of Object.keys(edgeTypeToCountByDs)) {
                let dsToCount = edgeTypeToCountByDs[edgeType]
                for(let ds of Object.keys(dsToCount)) {
                    //let count = dsToCount[ds]
                    this.allDatasources.add(ds)
                }
            }
        }
    }


}
