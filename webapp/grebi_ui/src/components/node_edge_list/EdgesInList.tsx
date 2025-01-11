
import React, { Fragment, useEffect, useState, useMemo } from "react";
import {useNavigate} from "react-router-dom";
import NodeRefLink from "./NodeRefLink";
import { getPaginated } from "../../app/api";
import { difference } from "../../app/util";
import GraphEdge from "../../model/GraphEdge";
import GraphNode from "../../model/GraphNode";
import DatasourceSelector from "../DatasourceSelector";
import { DatasourceTags } from "../DatasourceTag";
import DataTable from "../datatable/DataTable";
import LoadingOverlay from "../LoadingOverlay";

export interface EdgesState {
    total:number,
    datasources:string[],
    edges:any[],
    facetFieldToCounts:any,
    propertyColumns:string[]
};

export default function EdgesInList(params:{
    subgraph:string,
    node:GraphNode,
    onEdgesLoaded?:((edges:EdgesState) => void)|undefined,
    extraSearchParams?: string[][]|undefined
}) {
    let { subgraph, node, onEdgesLoaded, extraSearchParams } = params

  let [edgesState, setEdgesState] = useState<null|EdgesState>(null)

  let [dsEnabled,setDsEnabled] = useState<null|string[]>(null) 

  let [loading, setLoading] = useState(true)
  let [page, setPage] = useState(0)
  let [rowsPerPage, setRowsPerPage] = useState(10)
  let [filter, setFilter] = useState("")
  let [sortColumn, setSortColumn] = useState("grebi:type")
  let [sortDir, setSortDir] = useState<'asc'|'desc'>("asc")

    useEffect(() => {
        async function getEdges() {
            console.log('refreshing ', node.getNodeId(), JSON.stringify(dsEnabled), JSON.stringify(edgesState?.datasources))
            setLoading(true)
            let res = (await getPaginated<any>(`api/v1/subgraphs/${subgraph}/nodes/${node.getEncodedNodeId()}/incoming_edges?${
                new URLSearchParams([
                    ['page', page],
                    ['size', rowsPerPage],
                    ['sortBy', sortColumn],
                    ['sortDir', sortDir],
                    ['facet', 'grebi:datasources'],
                    ...(extraSearchParams||[]),
                    ...(filter ? [['q', filter]] : []),
                    ...(edgesState && dsEnabled!==null ? 
                            difference(edgesState.datasources, dsEnabled).map(ds => ['-grebi:datasources', ds]) : [])
                ])
            }`)).map(e => new GraphEdge(e))
            let newEdgesState = {
                total: res.totalElements,
                datasources: Object.keys(res.facetFieldsToCounts['grebi:datasources']),
                edges: res.elements,
                facetFieldToCounts: res.facetFieldsToCounts,
                propertyColumns:
                    Object.keys(res.facetFieldsToCounts)
                        .filter(k => k !== 'grebi:datasources')
                        .filter(k => Object.entries(res.facetFieldsToCounts[k]).length > 0)
            };
            if(onEdgesLoaded)
                onEdgesLoaded(newEdgesState);
            setEdgesState(newEdgesState);
            setLoading(false)
        }
        getEdges()

    }, [ node.getNodeId(), JSON.stringify(dsEnabled), page, rowsPerPage, filter, sortColumn, sortDir ]);

    if(edgesState == null) {
        return <LoadingOverlay message="Loading edges..." />
    }

    return <div>
        <div className="pb-5">
        <DatasourceSelector datasources={edgesState.datasources} dsEnabled={dsEnabled!==null?dsEnabled:edgesState.datasources} setDsEnabled={setDsEnabled} />
        </div>
        { loading && <LoadingOverlay message="Loading edges..." /> }
        <DataTable columns={[
                {
                    id: 'grebi:datasources',
                    name: 'Datasources',
                    selector: (row:GraphEdge) => {
                        return <DatasourceTags dss={row.getDatasources()} />
                    },
                    sortable: true,
                },
                {
                    id: 'grebi:from',
                    name: 'From Node',
                    selector: (row:GraphEdge) => {
                        return  <NodeRefLink subgraph={subgraph} nodeRef={row.getFrom()} />
                    },
                    sortable: true,
                },
                {
                    id: 'grebi:type',
                    name: 'Edge Type',
                    selector: (row:GraphEdge) => {
                        return row.getType()
                    },
                    sortable: true,
                },
                ...(edgesState?.propertyColumns || []).map((prop:string) => {
                    return {
                        name: prop,
                        // filterFn: 'includesString',
                        // filterVariant: 'multi-select',
                        // filterSelectOptions: edgesState?.facetFieldToCounts[prop] || [],
                        selector: (row) => {
                            return <div>{row[prop]}</div>
                        },
                    }
                }) as any
            ]}
            defaultSelector={(row:any,key:string)=>row[key]}
            data={edgesState.edges}
            dataCount={edgesState.total}
            page={page}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            onPageChange={setPage}
            onFilter={setFilter}
            sortColumn={sortColumn}
            setSortColumn={setSortColumn}
            sortDir={sortDir}
            setSortDir={setSortDir}
        />
    </div>


}
