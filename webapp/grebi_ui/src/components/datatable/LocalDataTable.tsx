import { useEffect, useState } from "react";
import DataTable, { Column } from "./DataTable";

export default function LocalDataTable({
    data,
    columns,
    hideColumns,
    addColumnsFromData,
    defaultSelector,
    onSelectRow
}:{
    data: any[],
    columns?: readonly Column[]|undefined,
    hideColumns?: string[]|undefined,
    addColumnsFromData?:boolean,
    defaultSelector:undefined|((row:any, key:string)=>any);
    onSelectRow?: (row: any) => void
}) {

    let [page, setPage] = useState(0)
    let [rowsPerPage, setRowsPerPage] = useState(10)
    let [sortColumn, setSortColumn] = useState<string|undefined>("")
    let [sortDir, setSortDir] = useState<'asc'|'desc'>("asc")
    let [filter, setFilter] = useState<string>("")

    let filteredData = data.filter(row => {
        return Object.values(row).some(v => {
            return (v+'').toLowerCase().includes(filter.toLowerCase())
        })
    });

    return <DataTable
        data={filteredData}
        columns={columns}
        addColumnsFromData={addColumnsFromData}
        hideColumns={hideColumns}
        dataCount={filteredData.length}
        defaultSelector={defaultSelector}
    />

}
