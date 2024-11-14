
import PropVal from "./PropVal";
import { pickBestDisplayName, pickWorstDisplayName, readabilityScore } from "../app/util";
import encodeNodeId from "../encodeNodeId";

export default class GraphNodeRef {

    props:any

    constructor(props:any) {
        this.props = props
    }

    getNodeId():string {
        return this.props['grebi:nodeId']
    }

    getEncodedNodeId():string {
        return encodeNodeId(this.props['grebi:nodeId'])
    }

    getDatasources():string[] {
        var ds = this.props['grebi:datasources'] || []
        ds.sort((a, b) => a.localeCompare(b) + (a.startsWith("OLS.") ? 10000 : 0) + (b.startsWith("OLS.") ? -10000 : 0))
        return ds
    }

    getId():PropVal {
        if(this.props['ols:curie']){
            return PropVal.arrFrom(this.props['ols:curie'])[0]
        }
        return PropVal.from(this.props['grebi:nodeId'])
    }

    getNames():PropVal[] {
        return PropVal.arrFrom(this.props['grebi:name'] || []);
    }

    getName():string {
        return pickBestDisplayName(this.getNames().map(n => n.value)) || this.getId().value
    }

    getTypes():string[] {
        return this.props['grebi:type']
    }

    getSourceIds():PropVal[] {
        let sids:PropVal[] = PropVal.arrFrom(this.props['grebi:sourceIds'])

        // this sort order will ultimately be used in display
        // ideally we will see one ID from each datasource at the beginning
        // to give an idea of how many sources; and also we prefer numeric
        // identifiers since this is explicitly supposed to be identifiers and
        // will probably be displayed next to the readable name.

        let res:PropVal[] = []

        for(let ds of this.getDatasources()) {
            let matches = sids.filter(sid => sid.datasources.indexOf(ds) !== -1)
            if(matches.length > 0) {
                res.push(matches.sort((a, b) => { return numericScore(b.value) - numericScore(a.value) })[0])
            }
        }

        let remainder = sids.filter(sid => res.indexOf(sid) === -1)
        remainder.sort((a, b) => { return numericScore(b.value) - numericScore(a.value) })

        return [...res, ...remainder]

        function numericScore(s:string):number {
            return [...s].filter(c => c.match(/[0-9]/)).length
        }
    }


    extractType():{long:string,short:string}|undefined {

        let types:string[] = PropVal.arrFrom(this.props['grebi:type']).map(t => t.value)

        if(types.indexOf('impc:MouseGene') !== -1) {
            return {long:'Gene',short:'Gene'}
        }
        if(types.indexOf('biolink:Gene') !== -1) {
            return {long:'Gene',short:'Gene'}
        }
        if(types.indexOf('gwas:SNP') !== -1) {
            return {long:'SNP',short:'SNP'}
        }
        if(types.indexOf('reactome:ReferenceDNASequence') !== -1) {
            return {long:'DNA',short:'DNA'}
        }
        if(types.indexOf('reactome:Person') !== -1) {
            return {long:'Person',short:'Person'}
        }
        if(types.indexOf('ols:Class') !== -1) {
            let ancestors:any[] = PropVal.arrFrom(this.props['ols:directAncestor']).map(a => a.value)
            if(ancestors.indexOf("chebi:36080") !== -1) {
                return {long:'Protein',short:'Protein'}
            }
            if(ancestors.indexOf("chebi:24431") !== -1) {
                return {long:'Chemical',short:'Chemical'}
            }
            if(ancestors.indexOf("mondo:0000001") !== -1 || ancestors.indexOf("efo:0000408") !== -1) {
                return {long:'Disease',short:'Disease'}
            }
            return {long:'Ontology Class',short:'Class'}
        }
        if(types.indexOf('ols:Property') !== -1) {
            return {long:'Ontology Property',short:'Property'}
        }
        if(types.indexOf('ols:Individual') !== -1) {
            return {long:'Ontology Individual',short:'Individual'}
        }

    }

}
