import { Box, Button, Divider } from "@mui/material";
import DatasourceSelector from "../DatasourceSelector";
import { FilterAlt, FilterList } from "@mui/icons-material";

export default function GraphViewControls({
    datasources,
    dsEnabled, setDsEnabled,
    onMouseoverDs, onMouseoutDs
}:{
    datasources:string[], 
    dsEnabled:string[], setDsEnabled:(ds:string[])=>void,
    onMouseoverDs?:undefined|((ds:string)=>void), onMouseoutDs?:undefined|((ds:string)=>void)
}) {
    return <div>
        <Box sx={{p:1}}>
        <DatasourceSelector datasources={datasources} dsEnabled={dsEnabled} setDsEnabled={setDsEnabled} onMouseoverDs={onMouseoverDs} onMouseoutDs={onMouseoutDs} />
        </Box>
        <Box sx={{p:1}}>
        <button className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <FilterAlt />
            Filter Edges
        </button>
        </Box>
    </div>
}
