
import cytoscape from "cytoscape"
import fcose from "cytoscape-fcose"

cytoscape.use(fcose)

export default class CyWrapper {

    cy:any

    elementSnapshots:Map<string, string> = new Map()

    locked:boolean = false

    onClickElement:((element:any)=>void) = () => {}

    constructor(container:HTMLDivElement, elements:any[], style:any, layout:any) {

        layout.animate = false
        this.cy = cytoscape({ container, elements, style, layout });

        this.cy.on('click', 'any', (event:any) => {
            this.onClickElement(event.target)
        });

        for(let elem of elements) {
            this.elementSnapshots.set(elem.data.id, JSON.stringify(elem))
        }
    }

    exclusiveBatch(op:()=>void) {

        if(this.locked) {
            throw new Error('graph is already updating')
        }
        this.locked = true

        this.cy.startBatch()
        op()
        this.cy.endBatch()

        this.locked = false

    }

    updateElements(elems:any[]) {

        this.exclusiveBatch(() => {


            let curElemIdSet = new Set()
            for(let elem of elems) {
                curElemIdSet.add(elem.data.id)
            }

            // remove elems that are gone now
            //
            for(let elemId of this.elementSnapshots.keys()) {
                if(!curElemIdSet.has(elemId)) {
                    let elem = this.cy.getElementById(elemId)
                    elem.remove()
                    this.elementSnapshots.delete(elemId)
                }
            }

            let adds:any[] = []

            for(let elem of elems) {
                curElemIdSet.add(elem.data.id)

                let oldSnapshot = this.elementSnapshots.get(elem.data.id)
                let curSnapshot = JSON.stringify(elem)
                this.elementSnapshots.set(elem.data.id, curSnapshot)

                if(oldSnapshot) {
                    if(oldSnapshot === curSnapshot) {
                        // element has not changed, nothing to do
                        continue
                    }
                    // element was in the graph but has changed
                    let exist = this.cy.getElementById(elem.data.id)
                    exist.data(elem.data)
                } else {
                    // element is new
                    adds.push(elem)
                }
            }

            this.cy.add(adds)
        })

    }

    async applyLayout(layout:any):Promise<void> {

        return new Promise((resolve, reject) => {

            layout.animationDuration = 500
            layout.stop = () => {
                resolve()
            }

            this.cy.layout(layout).run();
        });
    }

    destroy() {
        this.cy.destroy()
    }

    getElements():any[] {
        return this.cy.elements()
    }


}

