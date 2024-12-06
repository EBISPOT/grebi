import { Fragment } from "react/jsx-runtime"
import Refs from "../../model/Refs"

function renderValueBestEffort(value:any, refs?:Refs):JSX.Element {
  if(Array.isArray(value)) {
    let elems:JSX.Element[] = []
    let isFirst = true
    for(let elem of value) {
      if(isFirst) {
        isFirst = false
      } else {
        elems.push(<span>; </span>)
      }
      elems.push(renderValueBestEffort(elem))
    }
    return <Fragment>{elems}</Fragment>
  }
  if(typeof value === 'string') {
    return <Fragment>{value}</Fragment>
  }
  return <Fragment>{JSON.stringify(value)}</Fragment>
}


