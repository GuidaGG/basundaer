import TouchDragHandlerSimplified from "/static/js/TouchDragHandlerSimplified.js"
import Overlay from "/static/js/overlay.js"

import getMediaMatch, * as utils from "/static/js/utils.js"


function renderPartners(partners, imagePath) {
    let result = ""
    let shuffledPartners = utils.shuffle(partners)
    shuffledPartners.forEach((partner) => {
        if(partner.img){
        result += `
           <article class="partner">
            <figure>
                <img src="${imagePath}/${encodeURIComponent(partner.img)}" alt="Photo of ${partner.name}" loading="lazy" />
                <figcaption>
                    <div>${partner.name}</div>
                    <div class="underline">${partner.profession}</div>
                </figcaption>
            </figure>
    
           </article>`
        }
        else{
            result += `<article class="partner">
                     <figure>
                        <div class="team_noImage"></div>
                    <figcaption>
                        <div>${partner.name}</div>
                        <div class="underline">${partner.profession}</div>
                    </figcaption>
            </figure>
            </article>`
        }
          /* <li><a href="${partner.url}" target="_blank">website</a></li>*/
    })
   

    $(".partners_container").html(result)
}

function renderCustomerGallery(gallery) {
    let result = ""
    gallery.images.forEach((image) => {
        let href = image.href ? image.href : "";
        if(href) { 
        result += `
                <a  class="imageContainer" href="${image.href}" target="_blank" aria-label="${image.alt}">
                    <div class="image" 
                        style="background: url('${gallery.imagePath}/${encodeURIComponent(image.src)}') no-repeat center; 
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

function prevImg() {

    let $gallery = $(".partners .partners_container");
    let $active = $gallery.find(".partner.active");

    // If nothing is active yet, activate the last item
    if ($active.length === 0) {
        $gallery.find(".partner").first().addClass("active")
        return
    }

    let $prev = $active.prev(".partner");
    if ($prev.length > 0) {
        $active.removeClass("active")
        $prev.addClass("active")

        // Optional scroll logic (if gallery is horizontally scrollable)
        let scrollLeft = $gallery.scrollLeft() - $prev.outerWidth(true) - 19;
        $gallery.css({
            left: -$active.prev().position().left
        })    
       // $gallery.animate({ scrollLeft: scrollLeft }, 300)
    }
 
}

function nextImg() {
   
    let $gallery = $(".partners .partners_container");
    let $active = $gallery.find(".partner.active");

    // If nothing is active yet, activate the first item
    if ($active.length === 0) {
        $gallery.find(".partner").first().addClass("active")
        return
    }

    let $next = $active.next(".partner")
    
    if ($next.length > 0) {
        $active.removeClass("active")
        $next.addClass("active")

        let scrollLeft = $gallery.scrollLeft() + $next.outerWidth(true) + 19;

        //$gallery.animate({ scrollLeft: scrollLeft }, 300)
        $gallery.css({left: -$next.position().left})
    }
    else{
        let $firstImage = $(".partners .partners_container .partner").first()
        $active.removeClass("active")
        if ($firstImage.length > 0) {
            $firstImage.addClass("active")
        }
        $gallery.animate({ scrollLeft: 0 }, 300)
    }
}

function startGallery() {
    let $firstImage = $(".partners .partners_container .partner").first()
    if ($firstImage.length > 0) {
        $firstImage.addClass("active")
    }

    $(".navigation .prevImg").on("click", function () {
        prevImg()
    })

    $(".navigation .nextImg").on("click", function () {
        nextImg()
    })
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

    if(translations)
        renderCustomerGallery(translations.gallery)
        renderPartners(translations.partners, translations.partners_imagePath)
        startGallery();
        let partnerNavigation = $(".partners")
            new TouchDragHandlerSimplified(
                partnerNavigation[0],
                partnerNavigation[0],
                function () {
                    nextImg()
                }, function () {
                    prevImg()
                },
                200,
                function () {
                    console.log("drag none")
                }.bind(this))
        
}

