import Overlay from "/static/js/overlay.js"
import TouchDragHandler from "/static/js/TouchDragHandler.js"

export let designProjects = []
export let portfolioOverlay = new Overlay()
let overlayLoaded = false

import getMediaMatch, * as utils from "/static/js/utils.js"

function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return rect.top <= (window.innerHeight || document.documentElement.clientHeight)
}

/**
 * A project containing text and images.
 */
class DesignProject {

    /**
     * Constructor
     * @param {Object} content - A data object from the projects.json file.
     */
    constructor(content) {
        this.title = content.title
        this.projectId = utils.normalizeID(this.title)
        this.categories = content.categories
        this.customer = content.customer
        this.year = content.year
        this.link = content.link
        this.linkText = content.linkText
        this.thumbnail = content.thumbnail
        this.galleryPath = "/static/img/projects/" + encodeURIComponent(content.galleryFolder)

        /**
         * The project's description string. If the string contains a "<more>" tag, the paragraphs after this tag
         * will not be displayed, but a "mehr..." link which shows/hides the paragraphs (@media-small only).
         * @type {string}
         */
        this.description = content.description

        /**
         * List of image filenames for the gallery. Will be rendered in order of this list.
         * @type {Array}
         */
        this.gallery = content.gallery

        /**
         * Contains the actual downloaded image as value, with it's path as key.
         * @type {{}}
         */
        this.downloadedImages = {}
        this._imageContainer = null

        /**
         * The DOM element which holds all img elements of the gallery.
         * @returns {null}
         */
        this.imageContainer = () => {
            if (!this._imageContainer) {
                this._imageContainer = $(`#${this.projectId} .imageContainer`)
            }
            return this._imageContainer
        }

        this.isGalleryRendered = false
        this.renderedContent = null
        window.addEventListener("resize", this._resetImageContainerPosition.bind(this))
    }

    /**
     * Renders the project as html and appends it to the given $element.
     * @param {Object} $element - The DOM element to append the rendered project to.
     */
    appendTo($element) {
        this.renderedContent = this._render()
        $element.append(this.renderedContent)
        let $galleryContainer = $(`#${this.projectId} > .gallery`)

        $galleryContainer.find(".navigation .prevImg").on("click", this.prevImg.bind(this))
        $galleryContainer.find(".navigation .nextImg").on("click", this.nextImg.bind(this))
        $(`#${this.projectId}_more`).on("click", this.showFullProject.bind(this))
        $(`#${this.projectId}_less`).on("click", this.showLessProject.bind(this))

        window.setTimeout(function () {
            this.triggerDownloadImagesIfProjectIsVisible()
            $(window).on('DOMContentLoaded load resize scroll', this.triggerDownloadImagesIfProjectIsVisible.bind(this))
            $("#designContent .content").on("scroll", this.triggerDownloadImagesIfProjectIsVisible.bind(this))
        }.bind(this), 200)
    }

    /**
     * Show the complete description text.
     */
    showFullProject() {
        $(`#${this.projectId}_full`).show()
        $(`#${this.projectId}_more`).hide()
        $(`#${this.projectId}_less`).show()
    }

    /**
     * Hide the description text after the <more> tag.
     */
    showLessProject() {
        $(`#${this.projectId}_full`).hide()
        $(`#${this.projectId}_more`).show()
        $(`#${this.projectId}_less`).hide()
    }

    /**
     * Looks for the currently "active" (=> leftmost visible) image and sets it's predecessor img active by
     * setting the css left attribute. Does nothing if there is no predecessor.
     */
    prevImg() {
        let $imageContainer = $(`#${this.projectId} .imageContainer`)
        let $currentActive = $imageContainer.find("img.active")

        if ($currentActive === $imageContainer.children().first()) {
            return
        }

        // todo: append when scrolling further backwards?
        // if ($currentActive[0].src === this.downloadedImages[0].src) {
        //     console.log("prepend")
        //     this.downloadedImages.reverse().forEach(img => {
        //         let clone = img.cloneNode(true);
        //         // let scaledWidth = img.width * $imageContainer.height() / img.height
        //         // console.log("render img at", `${start + offset}px`, img.src)
        //         // $(clone).css("transform", `translateX(${start}px)`)
        //         $imageContainer.prepend(clone)
        //     })
        // }

        if ($currentActive.prev().length > 0) {
            $currentActive.removeClass("active").prev().addClass("active")
            let prevImagesWidth = 0
            Array.from($currentActive.prevAll()).forEach(image => prevImagesWidth += $(image).outerWidth(true))
            $imageContainer.css({
                left: -$currentActive.prev().position().left
            })
        }
        this._updateDots()
    }

    /**
     * Looks for the currently "active" (=> leftmost visible) image and sets it's successor img active by
     * setting the css left attribute. Does nothing if there is no successor.
     */
    nextImg() {
        let $imageContainer = $(`#${this.projectId} .imageContainer`)
        let $currentActive = $imageContainer.find("img.active")

        if ($currentActive.next().length > 0) {
            $currentActive.removeClass("active").next().addClass("active")
            let $nextActive = $currentActive.next()
            let prevImagesWidth = 0
            Array.from($currentActive.prevAll()).forEach(image => prevImagesWidth += $(image).outerWidth(true))
            $imageContainer.css({left: -$nextActive.position().left})
        }
        this._updateDots()
    }

    triggerDownloadImagesIfProjectIsVisible() {
        if (isElementInViewport($(`#${this.projectId}`)[0])) {
            if (!this.isGalleryRendered) {
                this._downloadImages()
            }
        }
    }

    _downloadImages() {
        this.isGalleryRendered = true
        this.gallery.forEach(image => {
            let img = new Image();
            let source = this._getSrcForGalleryImage(image.src)

            img.onload = function (event) {
                let loadedImage = event.target
                let key = new URL(loadedImage.src).pathname
                this.downloadedImages[key] = loadedImage
                this._appendImagesInOrder()

                if (Object.keys(this.downloadedImages).length === this.gallery.length) {
                    this._renderDotIndicator()
                    this._renderGallery()

                    // this makes sure that the thumbnails for the portfolio overlay
                    // are already loaded, so the first galleries are loaded faster.
                    if (!overlayLoaded) {
                        overlayLoaded = true
                        portfolioOverlay.loadOverlay("portfolio",
                            "portfolioContent",
                            "designContent",
                            "Übersicht")
                    }
                }
            }.bind(this)
            img.src = source
            img.alt = image.alt
        })
    }

    _appendImagesInOrder() {
        for (let i = 0; i < this.gallery.length; ++i) {
            let img = this.gallery[i]
            let imageKey = this._getSrcForGalleryImage(img)
            let downloadedImage = this.downloadedImages[imageKey]

            if (downloadedImage === undefined) {
                return
            }

            if (this.imageContainer().find(`img[src="${imageKey}"]`).length === 0) {
                this.imageContainer().append(downloadedImage)
            }
        }
    }

    _getSrcForGalleryImage(image) {
        return `${this.galleryPath}/${encodeURIComponent(image)}`
    }

    /**
     * Ensure that the active image stays on the left edge on window resize.
     * @private
     */
    _resetImageContainerPosition() {
        let $imageContainer = $(`#${this.projectId} .imageContainer`)
        let $currentActive = $imageContainer.find("img.active")
        if (!$currentActive.length) {
            return
        }

        $imageContainer.css({transition: "left 0ms ease-in-out"})
        $imageContainer.css({
            left: -$currentActive.position().left
        })
        $imageContainer.children("img").css({width: "auto", height: "100%"})
        window.setTimeout(function () {
            $imageContainer.css({transition: "left 200ms ease-in-out"})
        }, 100)
    }

    /**
     * Updates the dot indicators to represent the currently active image.
     * @private
     */
    _updateDots() {
        let currentImage = this.imageContainer().find("img.active")[0]
        let $dotIndicator = this.imageContainer().siblings(".dotIndicator")
        $dotIndicator.find(".dot.active").removeClass("active")
        if(currentImage.src){
            $dotIndicator.find(`.dot[data-src="${currentImage.src}"]`).addClass("active")
        }
    
    }

    /**
     * Render each image 10 times and set the first image of the 6th group active.
     * Todo: This is a workaround to create a "fake" carousel. Find a way to dynamically append/prepend images on the fly.
     * Todo: OR: Move the image container back to the first image when the last image is reached, but invisibly (omit the animation)
     * Todo: OR OR: Find a nice plugin which does that :)
     * @private
     */
    /*_renderGallery() {
        this.isGalleryRendered = true

        let $imageContainer = $(`#${this.projectId} .imageContainer`)
        let offset = 0;
        let firstActiveImg = null

        let galleryMultiplier = 1;

        for (let i = 0; i < galleryMultiplier; ++i) {
            this.gallery.forEach(image => {
                let src = `${this.galleryPath}/${encodeURIComponent(image.src)}`
                let img = this.downloadedImages[src]
                console.log(img)
                let clone = img.cloneNode(true);
                $imageContainer.append(clone)
                offset += $(clone).outerWidth(true)
                if (i === 6 && firstActiveImg === null) {
                    firstActiveImg = clone
                }
            })
        }
        $(firstActiveImg).addClass("active")
        $imageContainer.css({left: -$(firstActiveImg).position().left})
        window.setTimeout(function () {
            $imageContainer.css({transition: "left 200ms ease-in-out"})
        }, 100)
        $imageContainer.css("filter", "")
        this._updateDots()
    }*/

    

    _renderDotIndicator() {
        let $dotIndicator = this.imageContainer().siblings(".dotIndicator")
        this.imageContainer().children("img").toArray().forEach(img => {
            $dotIndicator.append(`<div class="dot" data-src="${img.src}"></div>`)
        })
    }

    _renderCategories() {
        return this.categories.join(', ')
    }

    _renderDescription() {
        let result = ''
        let paragraphs = this.description.split('\n')
        paragraphs.forEach(p => {
            result += `<p class="paragraph">${p}</p>`
        })

        // todo: implement using css? show/hide more button and paragraph depending on media query
        if (result.includes('<more>')) {
            if (getMediaMatch() === utils.SMALL) {
                let parts = result.split('<more>')
                result = parts[0]
                result += `<span style="display: none" id="${this.projectId}_full">${parts[1]}</span>`
                result += `<a id="${this.projectId}_more">mehr...</a>`
                result += `<a id="${this.projectId}_less" style="display: none;">weniger...</a>`
            } else {
                result.replace("<more>", "")
            }
        }
        return result
    }

    _renderLink() {
        return this.link
            ? `<div class="headingSection">
                    <div class="headingTitle heading2">Link:</div>
                    <div class="headingContent heading2">
                        <a href="${this.link}" target="_blank">${this.linkText ? this.linkText : this.link}</a>
                    </div>
               </div>
                `
            : ""
    }

    _render() {
        return `
            <div class="projectContainer" 
                id="${this.projectId}"  
                name="${this.projectId}"
                data-categories="${this.categories.join(',')}">
                <div class="text">
                    <div class="header">
                        <h2 class="title paragraph">${this.title}</h2>
                        <div class="headings">
                            <div class="headingSection">
                                <div class="headingTitle heading2">Kategorie:</div>
                                <div class="headingContent heading2">
                                                                  
                                        ${this._renderCategories()}
                                    
                                </div>
                            </div>
                            <div class="headingSection">
                                <div class="headingTitle heading2">Kunde:</div>
                                <div class="headingContent heading2">${this.customer}</div>
                            </div>
                            <div class="headingSection">
                                <div class="headingTitle heading2">Jahr:</div>
                                <div class="headingContent heading2">${this.year}</div>                            
                            </div>
                            ${this._renderLink()}
                        </div>
                    </div>
        
                    <div class="description paragraph">
                        ${this._renderDescription()}
                    </div>
                </div>
                <div class="gallery">
                    <div class="imageContainer">
                    </div>                
                    <div class='navigation'>
                        <div class='prevImg'></div>
                        <div class='nextImg'></div>
                    </div>         
                    <div class="dotIndicator">
                    </div>
                </div>
            </div>
        `
    }
}

export default function designPageReady() {
    console.log("design page ready!")

    //TODO: project data from projects.json is loaded in portfolio as well. Consider consolidating/sharing project data

    $.getJSON("/data/projects.json", function (projectData) {
        projectData.forEach(p => {
            let project = new DesignProject(p)
            designProjects.push(project)
            project.appendTo($(".projects"))
            window.setTimeout(function () {
                let galleryNavigation = $(`.projectContainer#${project.projectId} .navigation`)

                new TouchDragHandler(
                    galleryNavigation[0],
                    galleryNavigation.siblings()[0],
                    function () {
                       project.nextImg()
                    }, function () {
                       project.prevImg()
                    },
                    200,
                    function () {
                        console.log("drag none")
                    }.bind(this))

                    console.log( galleryNavigation[0],galleryNavigation.siblings()[0])
            }, 100)
        })

    })
}
