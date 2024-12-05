import TouchDragHandler from "/static/js/TouchDragHandler.js"

export default class Overlay {

    constructor() {

        /**
         * The DOM element that reacts on click and drag events to open and close the overlay.
         * @type {Object}
         */
        this.$openHandle = null

        /**
         * The main DOM element containing the overlay.
         * @type {Object}
         */
        this.$overlay = null

        /**
         * A transparent div that is appended on a z-layer between overlay and main page.
         * Enables clicking beneath the overlay to close it.
         * @type {Object}
         */
        this.closeWidget = null

        this._isOverlayOpen = function () {
            return this.$openHandle.hasClass("open")
        }
    }

    /**
     * Load the overlay page and append it to the given element.
     * @param {string} overlayPage - the name of the html document to load (without the .html ending)
     * @param {string} appendToId - The id of the DOM element where the overlay shall be appended.
     * @param {string} mainContentId - Used to find the "openHandle" element in the source section
     * @param {string} overlayTitle - The title to be shown on the open handle.
     * @param {function} [contentLoadedCallback] - Called after the overlay page is loaded (if given).
     */
    loadOverlay(overlayPage, appendToId, mainContentId, overlayTitle, contentLoadedCallback) {
        $.get(`/${overlayPage}.html`)
            .done(function (data) {
                $(`#${appendToId}`).html($(data).find(".overlayPageContent"))
                if (contentLoadedCallback) {
                    window.setTimeout(contentLoadedCallback, 300)
                }
            })
            .fail(function () {
                console.error("failed to load overlay content", overlayPage)
            })

        let $mainContentElement = $(`#${mainContentId}`);
        this._setupOverlayHandle($mainContentElement, overlayTitle);
        Overlay._setupBuALogo($mainContentElement);

        new TouchDragHandler(
            this.$openHandle[0],
            this.$overlay[0],
            this.openOverlay.bind(this),
            this.closeOverlay.bind(this),
            300,
            this.toggleOverlay.bind(this),
            this.closeOverlay.bind(this),
            this.openOverlay.bind(this))
    }

    /**
     * Open or close the overlay
     */
    toggleOverlay() {
        if (this._isOverlayOpen()) {
            this.closeOverlay()
        } else {
            this.openOverlay()
        }
    }

    openOverlay() {
        this.$overlay.css("left", "-90%")
        this.$openHandle.addClass("open")

        if (!this.closeWidget) {
            this.closeWidget = document.createElement("div")
            $(this.closeWidget).css({
                "height": "100%",
                "position": "absolute",
                "left": "-1000px",
                "right": "100vw",
            })
            this.closeWidget.addEventListener("click", this.closeOverlay.bind(this))
            this.closeWidget.addEventListener("touchend", this.closeOverlay.bind(this))
        }
        $(this.closeWidget).show()
        this.$overlay.append($(this.closeWidget))
    }

    closeOverlay() {
        $(this.closeWidget).hide()
        this.$openHandle.removeClass("open")
        this.$overlay.css("left", "")
    }

    _setupOverlayHandle($mainContentElement, overlayTitle) {
        if (!this.$openHandle) {
            this.$openHandle = $mainContentElement.find(".openHandle")
            if (overlayTitle) {
                //this.$openHandle.children().first().text(overlayTitle.toUpperCase())
            }
        }
        if (!this.$overlay) {
            this.$overlay = $mainContentElement.find(".overlay")
        }
        this.$openHandle.on("click", function (event) {

            this.toggleOverlay()
        }.bind(this))
    }

    static _setupBuALogo($mainContentElement) {
        let $container = $mainContentElement.find(".overlay")
        let baLogo = document.createElement("div")
        baLogo.className = "overlayBaLogo"
        $container.append(baLogo)
    }
}
