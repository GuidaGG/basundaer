import {normalizeID} from "/static/js/utils.js"
import getMediaMatch, * as utils from "/static/js/utils.js"

let _projects = []
let _activeFilter = null
let _originalProjects = null
let _portfolioOverlay = null

const NO_FILTER_STRING = "Gesamt";


class Index {

    /**
     * Constructor
     * @param {Object} content - A data object from the projects.json file.
     */
    constructor(content) {
        this.heading= content.heading
        this.category = content.category
        this.image = content.imageURL
        this.description = content.description
        this.galleryPath = "/static/img/workshops"
       
    }
    _renderContent(){
        let result = ''
        let content = this.description

        for ( var k in content ) {
            let zone = content[k]
            result +=  `<p class="workshopDescription paragraph"><span class="light">${zone.light}</span><span class="medium">${zone.bold}</span></p>`
        }
        return result;
    }

    renderTitle($appendTo) {
        let content = `<div class="workshopSection">
            <div class="workshopTitle">${this.heading}</div>
            <div class="workshopCategory paragraph">${this.category}</div>
            <img src="${this.galleryPath }/${encodeURIComponent(this.image)}">
            ${this._renderContent()}
        </div>
        `
        $appendTo.append(content)
   
    }

  

}







export default function workshopIndexReady(workshopOverlay, workshopProjects) {
    console.log("workshop ready")

    $.getJSON("/data/workshops.json", function (workshopData) {
    
        workshopData.workshops.forEach(p => {
            let project = new Index(p)
            _projects.push(project)
            project.renderTitle($(".workshopSections"))
        })

  
    })
}
