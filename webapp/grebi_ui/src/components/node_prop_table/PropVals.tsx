import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { pickBestDisplayName } from "../../app/util";
import encodeNodeId from "../../encodeNodeId";
import GraphNode from "../../model/GraphNode";
import PropVal from "../../model/PropVal";
import ClassExpression from "../ClassExpression";
import isSingleLineProp from "./isSingleLineProp";
import Refs from "../../model/Refs";

export default function PropVals(params:{ subgraph:string,refs:Refs,values:PropVal[] }) {

    let { subgraph,refs, values } = params;

    // if all values are <= 32 characters use one line and possibly monospace (if not links)
    let oneLine = values.filter(v => !isSingleLineProp(v)).length === 0;

    if(oneLine) {
        return (
        <span>
            {
                values.map( (value,i) => <Fragment>
                    <PropValue subgraph={subgraph} refs={refs} value={value} monospace={false} separator={i > 0 ? ";" : ""} />
                    </Fragment>
                )
            }
            </span>
        )
    } else {
        return (
            <div>
                {
                    values.map( (value,i) => 
                        <div className={i>0?"pt-1":""}>
                        <PropValue subgraph={subgraph} refs={refs} value={value} monospace={false} separator="" />
                        </div>
                    )
                }
                </div>
            )
    }

}

function PropValue(params:{subgraph:string,refs:Refs,value:PropVal,monospace:boolean,separator:string}) {

    let { subgraph, refs, value, monospace, separator } = params;

    if(typeof value.value === 'object') {
        if(value.value["rdf:type"] !== undefined) {
            return <ClassExpression subgraph={subgraph} refs={refs} expr={value.value} />
        } else {
            return <span>{JSON.stringify(value.value)}</span>
        }
    }

    let mapped_value = refs.get(value.value);
  
    // todo mapped value datasources
    if(mapped_value) {
      return (
        <span className="mr-0">
          {separator} <Link className="link-default" to={"/subgraphs/" + subgraph + "/nodes/" + encodeNodeId(value.value)}>{
            (mapped_value.name && pickBestDisplayName(mapped_value.name)) || value.value
          }</Link>
        </span>
      )
    } else {
      let val_to_display = typeof value.value === 'string' ? value.value : JSON.stringify(value.value)
      if(!monospace) {
          return <span className="mr-0">{separator} {val_to_display}</span>
      } else {
          return (
          <span className="mr-0">
                      {separator} <span
      className="rounded-sm font-mono py-0 pl-1 ml-1 my-1 text-sm" style={{backgroundColor:'rgb(240,240,240)'}}
      >
              {value.value}
              </span>
          </span>
          )
      }
    }

}
