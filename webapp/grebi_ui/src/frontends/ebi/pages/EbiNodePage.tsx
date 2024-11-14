
import { Fragment, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Helmet } from 'react-helmet'
import React from "react";
import EbiHeader from "../EbiHeader";
import { FormatListBulleted, CallReceived, CallMade, Share } from "@mui/icons-material";
import { Typography, Grid, Tabs, Tab, Box } from "@mui/material";
import { copyToClipboard } from "../../../app/util";
import LoadingOverlay from "../../../components/LoadingOverlay";
import EdgesInList from "../../../components/node_edge_list/EdgesInList";
import GraphView from "../../../components/node_graph_view/GraphView";
import PropTable from "../../../components/node_prop_table/PropTable";
import SearchBox from "../../../components/SearchBox";
import GraphNode from "../../../model/GraphNode";
import { get, getPaginated } from "../../../app/api";
import encodeNodeId from "../../../encodeNodeId";


export default function EbiNodePage() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const subgraph: string = params.subgraph as string;
  const nodeId: string = atob(params.nodeId as string);
  const lang = searchParams.get("lang") || "en";

  let [node, setNode] = useState<GraphNode|null>(null);
  const tab = searchParams.get("tab") || "properties";

  useEffect(() => {
    async function getNode() {
      let graphNode = new GraphNode(await get<any>(`api/v1/subgraphs/${subgraph}/nodes/${encodeNodeId(nodeId)}?lang=${lang}`))
      setNode(graphNode)
    }
    getNode()
  }, [nodeId, lang]);

  if(!node) {
    return <LoadingOverlay message="Loading node..." />
  }

  let pageTitle = node.getName();
  let pageDesc = node.getDescription()
  let props = node.getProps();
  let refs = node.getRefs();

  return (
    <div>
      <EbiHeader section="explore" />
        <Helmet>
          <meta charSet="utf-8" />
          {pageTitle && <title>{pageTitle}</title>}
          {pageDesc && <meta name="description" content={pageDesc}/>}
        </Helmet>
      <main className="container mx-auto px-4 pt-1">
        <SearchBox subgraph={subgraph} />
        <div className="text-center">
        <Typography variant="h5">{pageTitle} {
          node.extractType()?.long && <span style={{textTransform:'uppercase', fontVariant:'small-caps',fontWeight:'bold',fontSize:'small',verticalAlign:'middle',marginLeft:'12px'}}>{node.extractType()?.long}</span>}</Typography>
                      <div>
                {node.getSourceIds().map(id => <span
className="bg-grey-default rounded-sm font-mono py-1 pl-2 ml-1 my-2 text-sm"
>{id.value}
<button
                    onClick={() => {
                      copyToClipboard(id.value);
                    }}
                  >
                    &nbsp;
                    <i className="icon icon-common icon-copy icon-spacer" />
                  </button>
</span>)}
              </div>
          </div>
        <Typography>{pageDesc}</Typography>
        <Grid container spacing={1} direction="row">
            <Grid item xs={2}>
          <Tabs orientation="vertical" variant="scrollable" value={tab} aria-label="basic tabs example" className="border-green" sx={{ borderRight: 1, borderColor: 'divider' }} onChange={(e, tab) => setSearchParams({tab})}>
            <Tab label="Properties" icon={<FormatListBulleted/>} value="properties" />
            <Tab label="Edges In" icon={<CallReceived/>} value="edges_in" />
            <Tab label="Edges Out" icon={<CallMade/>} value="edges_out" />
            <Tab label="Graph" icon={<Share/>} value="graph" />
          </Tabs>
          </Grid>
          <Grid item xs={10}>
        <TabPanel value={tab} index={"properties"}>
          <PropTable lang={lang} subgraph={subgraph} node={node} />
        </TabPanel>
        <TabPanel value={tab} index={"edges_in"}>
          <EdgesInList subgraph={subgraph} node={node} />
        </TabPanel>
        <TabPanel value={tab} index={"edges_out"}>
        </TabPanel>
        <TabPanel value={tab} index={"graph"}>
         <GraphView subgraph={subgraph} node={node} />
        </TabPanel>
        </Grid>
        </Grid>
      </main>

    </div>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


