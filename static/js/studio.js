import Overlay from "/static/js/overlay.js"

function renderCustomerGallery(gallery) {
    let result = ""
    gallery.images.forEach((image) => {
        let link = image.href ? image.href : "";
        if(link) { 
        result += `
                <a  class="imageContainer" href="${image.href}" target="_blank" aria-label="${image.alt}">
                    <div class="image" 
                        style="background: url('${gallery.imagePath}/${image.src}') no-repeat center; 
                        background-size: contain" alt="${image.alt}" >
                    </div>
                </a>
           `
        }
        else {
            result += `
            <div class="imageContainer">
                    <div class="image" 
                        style="background: url('${gallery.imagePath}/${image.src}') no-repeat center; 
                        background-size: contain" alt="${image.alt}" >
                    </div>
            </div>`
        }
    })
    $(".customers .gallery").html(result)
}

export default function studioPageReady(translations, overlay = true) {
    console.log("studio ready!")
    if(overlay) {
    let o = new Overlay()
    o.loadOverlay(
        "studioOverlay",
        "studioOverlayContent",
        "studioContent",
        "Team")
    }

    renderCustomerGallery(translations.gallery)
    /*Ü$.getJSON("/data/studio.json", function (studioData) {
        renderCustomerGallery(studioData.gallery)
    })*/
}

