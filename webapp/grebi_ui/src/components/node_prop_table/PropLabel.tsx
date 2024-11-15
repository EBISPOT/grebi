
import React, { Fragment } from "react";
import { Tooltip } from "@mui/material";
import { pickBestDisplayName } from "../../app/util";
import Refs from "../../model/Refs";

export default function PropLabel(params:{prop:string,refs:Refs}) {

    let { prop, refs } = params

    let ref = refs.get(prop)

    let displayName:string|undefined = ({
        'grebi:name': 'Name',
        'grebi:synonym': 'Synonym',
        'grebi:description': 'Description',
        'grebi:type': 'Type',
    })[prop]

    if(displayName) {
        return <b>{displayName}</b>
    }

    if(ref) {
        displayName = pickBestDisplayName(ref.getNames().map(n=>n.value as string))
        if(displayName) {
                return <b>{displayName}
                        <Tooltip
                        title={ref.getSourceIds().map(sid=>sid.value).join('; ')}
                        placement="top"
                        arrow
                    >
                    <i className="icon icon-common icon-info text-neutral-default text-sm ml-1" style={{cursor:'pointer'}} />
                    </Tooltip>
                </b>
        }
    }

    return <b style={{fontFamily:"'SF Mono', SFMono-Regular, ui-monospace, 'DejaVu Sans Mono', Menlo, Consolas, monospace"}}>
        {prop}
    </b>
}