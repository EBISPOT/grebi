import { useState, useEffect } from "react";
import GraphMetadata from "../../model/GraphMetadata"
import MaterialisedQuery from "../../model/MaterialisedQuery";
import LocalDataTable from "../datatable/LocalDataTable"
import { get } from "../../app/api";
import { Box, Button, CircularProgress, Link, Stack } from "@mui/material";
import { Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";


const cols= [
    {
        id:"subgraph",
        name:"Subgraph",
        selector:(row:any,key:string)=><code>{row[key]}</code>,
        sortable:true
    },
    {
        id:"id",
        name:"Query ID",
        selector:(row:any,key:string)=> {
            return <Link className="link-default" target="_blank" href={`https://github.com/EBISPOT/GrEBI/blob/dev/materialised_queries/${row[key]}.yaml`}> <code>{row[key]}</code></Link>
        },
        sortable:true
    },
    {
        id:"description",
        name:"Description",
        selector:(row:any,key:string)=>row[key],
        sortable:true
    },
    {
        id:"updated",
        name:"Updated",
        selector:(row:any,key:string)=>row["end_time"],
        sortable:true
    },
    {
        id:"download",
        name:"",
        selector:(row:any,key:string)=> <Link target="_blank" href="https://ftp.ebi.ac.uk/pub/databases/spot/kg/"><Button><Box
  display="flex"
  alignItems="center"
>
                  <Download /> CSV
                </Box></Button></Link>,
        sortable:false
    }
];


export default function MaterialisedQueryTable({
    subgraph
}:{
    subgraph?:string|undefined
}) {


  let [matQs, setMatQs] = useState<MaterialisedQuery[]|null>(null);
  let [graphMetadata, setGraphMetadata] = useState<any|null>(null);
  const navigate = useNavigate();

    useEffect(() => {
        get<MaterialisedQuery[]>(`api/v1/materialised_queries`).then(r => setMatQs(r));
    }, []);

    useEffect(() => {
        if(subgraph)
            get<GraphMetadata>(`api/v1/subgraphs/${subgraph}`).then(r => setGraphMetadata(r));
    }, [subgraph]);

    if(!matQs) {
        return <CircularProgress />
    }

    if(subgraph && !graphMetadata) {
        return <CircularProgress />
    }

    return <LocalDataTable
                    data={matQs} 
                    addColumnsFromData={false}
                    maxRowHeight={"1.5em"}
                    defaultSelector={(row,key)=>row[key]}
                    columns={cols}
                    onSelectRow={(row) => {
                        navigate(`/subgraphs/${row['subgraph']}/results/${row['id']}`)
                    }}
                    />

}
