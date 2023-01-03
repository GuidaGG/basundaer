import Overlay from "/static/js/overlay.js"
import TouchDragHandler from "/static/js/TouchDragHandler.js"
export let portfolioOverlay = new Overlay()
let overlayLoaded = false

export default function researchPageReady() {
    console.log("research page ready!")

    //TODO: project data from projects.json is loaded in portfolio as well. Consider consolidating/sharing project data

    $.getJSON("/data/research.json", function (researchData) {
        researchData.forEach(p => {
         console.log("research data")
        })

    })

    if (!overlayLoaded) {
        overlayLoaded = true
        portfolioOverlay.loadOverlay("research",
            "researchSideContent",
            "researchContent",
            "Übersicht")
    }
  
}
