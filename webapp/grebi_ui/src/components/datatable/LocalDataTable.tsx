import { useEffect, useState } from "react";
import DataTable, { Column } from "./DataTable";

export default function LocalDataTable({
    data,
    columns,
    hideColumns,
    addColumnsFromData,
    defaultSelector,
    onSelectRow,
    maxRowHeight
}:{
    data: any[],
    columns?: readonly Column[]|undefined,
    hideColumns?: string[]|undefined,
    addColumnsFromData?:boolean,
    defaultSelector:undefined|((row:any, key:string)=>any);
    onSelectRow?: (row: any) => void,
    maxRowHeight?:string|undefined
}) {

    let [page, setPage] = useState(1)
    let [rowsPerPage, setRowsPerPage] = useState(10)
    let [sortColumn, setSortColumn] = useState<string|undefined>("")
    let [sortDir, setSortDir] = useState<'asc'|'desc'>("asc")
    let [filter, setFilter] = useState<string>("")

    data = data.filter(row => {
        return Object.values(row).some(v => {
            return (v+'').toLowerCase().includes(filter.toLowerCase())
        })
    });

    data = data.slice((page-1)*rowsPerPage, page*rowsPerPage)

    return <DataTable
        data={data}
        columns={columns}
        addColumnsFromData={addColumnsFromData}
        hideColumns={hideColumns}
        dataCount={data.length}
        defaultSelector={defaultSelector}
        onFilter={setFilter}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        page={page}
        onPageChange={setPage}
        sortColumn={sortColumn}
        setSortColumn={setSortColumn}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onSelectRow={onSelectRow}
        maxRowHeight={maxRowHeight}
    />
}
