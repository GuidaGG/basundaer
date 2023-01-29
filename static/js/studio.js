import Overlay from "/static/js/overlay.js"

function renderCustomerGallery(gallery) {
    let result = ""
    gallery.images.forEach((image) => {
        console.log(image)
        result += `
            <div class="imageContainer">
                <div class="image" 
                    style="background: url('${gallery.imagePath}/${image.src}') no-repeat center; 
                    background-size: contain" alt="${image.alt}" >
                </div>
            </div>`
    })
    $(".customers .gallery").append(result)
}

export default function studioPageReady() {
    console.log("studio ready!")

    let o = new Overlay()
    o.loadOverlay(
        "studioOverlay",
        "studioOverlayContent",
        "studioContent",
        "Team")

    $.getJSON("/data/studio.json", function (studioData) {
        renderCustomerGallery(studioData.gallery)
    })
}
