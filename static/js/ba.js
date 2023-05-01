import Footer from "./footer.js"

/** All sections by sectionId. */
let sections = {}

/** The currently open section, or null. */
let openSection = null

/** The id of the section to be opened automatically on first load of the main page.
 * Set to null if no section shall be opened automatically. */
let autoOpenSection = null

/**
 * A section on the main site
 */
class Section {

    /**
     * Create a section
     * @param {string} sectionId - The name of the section. Must be unique. The section's html document (and
     * json data file if required) must be named respectively.
     * @param {function} [onOpenCallback] - Executed on open section
     * @param {function} [marginsCallback] - A function returning a rect defining the opened section's margins
     */
    constructor(sectionId, onOpenCallback, marginsCallback) {
        this.sectionId = sectionId

        /** The closed section div from the main page grid. */
        this.sourceSection = document.getElementById(sectionId)

        /** The target div where the content is appended */
        this.fullSection = document.getElementById(`${sectionId}Content`)

        /** The path to the content html file. */
        this.contentUrl = `./${sectionId}.html`

        /** The div showing the border and the section title.
         * In fullscreen sections only visible during the animation
         */
        this.$border = null

        /** The div showing the section title. Becomes visible in open section only. */
        this.$sectionTitleNode = null

        /** The margins of the section relative to the window borders. */
        this.margins = marginsCallback ? marginsCallback : function() {
            return {top: 0, right: 0, bottom: 0, left: 0}
        }

        this.onOpenCallback = onOpenCallback === undefined ? null : onOpenCallback
        this.contentLoaded = false
    }

    /**
     * Loads the section's content if not done yet, and opens the section using the clip-path animation.
     */
    open() {
        openSection = this
        if (!this.contentLoaded) {
            this._loadContent(this._openInternal)
        } else {
            this._openInternal()
        }
    }

    /**
     * Closes the section using the clip-path animation.
     */
    close() {
        if (this._isFullScreen()) {
            $(this.fullSection).css("clip-path", "inset(0)")
            $(this.fullSection).css("-webkit-clip-path", "inset(0)")
        } else {
            $(".transparentBackgroundWidget").remove()
        }
        this.$sectionTitleNode.hide()
        this.fullSection.addEventListener("transitionend", function () {
            this._resetSection()
            $(this.fullSection).hide()
        }.bind(this), {once: true})

        const rect = this._getSourceSectionRect()
        let clipPath = Section._getClipPathForRect(rect)
        $(this.fullSection).css({
            "clip-path": clipPath,
            "-webkit-clip-path": clipPath
        })
        this.$border.show()
        this.$border.css({
            "left": rect.left,
            "top": rect.top,
            "right": rect.right,
            "bottom": rect.bottom
        })
       this._stopAllVideos()
        this.$border.find(".initialSectionTitle").removeClass("openSectionTitle")
        
        openSection = null
    }

    _openInternal() {
        let $fs = $(this.fullSection)
        this._setInitialClipPath()
        this._addBorder()
        $fs.show()
        this._startOpenAnimation()
        if (this.onOpenCallback) {
             this.onOpenCallback()
        }
        if (!this._isFullScreen()) {
            this._addTransparentBackgroundWidget()
        }
    }

    static _setBaseUrl() {
        location.hash = ""
    }

    /**
     * The widget is appended for non-fullscreen sections, in a z-layer between section content and main page.
     * A click on the widget closes the section (by changing the url hash) and removes the widget.
     * @private
     */
    _addTransparentBackgroundWidget() {
        let transparentBackgroundWidget = document.createElement('div')
        $(transparentBackgroundWidget).addClass("transparentBackgroundWidget")
        $("body").append(transparentBackgroundWidget)
        $(".transparentBackgroundWidget").on("click", function () {
            Section._setBaseUrl()
            $(".transparentBackgroundWidget").remove()
        }.bind(this))
    }

    _resetSection() {
        function _scrollSectionToTop() {
            $(this.fullSection).find(".content").scrollTop(0)
            $(this.fullSection).find(".content").scrollLeft(0)
            $(this.fullSection).find(".subcontent").scrollTop(0)
        }

        function _scrollOverlayToTopAndClose() {
            let $openHandle = $(this.fullSection).find(".openHandle")
            if ($openHandle.length > 0) {
                if ($openHandle.hasClass("open")) {
                    $openHandle.click()
                }
                $(this.fullSection).find(".overlayScrollContainer").scrollTop(0)
            }
        }

        _scrollSectionToTop.call(this);
        _scrollOverlayToTopAndClose.call(this);
    }

    _isFullScreen() {
        return Object.values(this.margins()).every(v => {
            return v === 0
        })
    }

    _startOpenAnimation() {
        this.fullSection.addEventListener("transitionend", function () {
            this.$sectionTitleNode.show()
            if (this._isFullScreen()) {
                $(this.fullSection).css("clip-path", "")
                $(this.fullSection).css("-webkit-clip-path", "")
                this.$border.hide()
            }
        }.bind(this), {once: true})

        let clipPath = Section._getClipPathForRect(this.margins(), "")
        $(this.fullSection).css({
            "clip-path": clipPath,
            "-webkit-clip-path": clipPath
        })

        this.$border.css({
            "left": this.margins().left,
            "top": this.margins().top,
            "right": this.margins().right,
            "bottom": this.margins().bottom
        })

        this.$border.find(".initialSectionTitle").addClass("openSectionTitle")
    }

    static _getClipPathForRect(rect, unit="px") {
        return `inset(${rect.top}${unit} ${rect.right}${unit} ${rect.bottom}${unit} ${rect.left}${unit})`
    }

    /**
     * Load the section's content (if not yet done)
     * @param {function} successCallback - Executed when the content was successfully loaded.
     * @private
     */
    _loadContent(successCallback) {
        if (this.contentLoaded) {
            return
        }
        $.get(this.contentUrl)
            .done(function (data) {
                console.log(`${this.sectionId} content loaded`)
                this.contentLoaded = true
                $(this.fullSection).append($(data).filter(".content"))

                window.setTimeout(function () {
                    $(this.fullSection).find(".close").on("click", function () {
                        Section._setBaseUrl()
                    }.bind(this))
                    this.$sectionTitleNode = $(this.fullSection).find(".sectionTitle")
                    this.$sectionTitleNode.hide()
                }.bind(this), 100)

                if (successCallback) {
                    window.setTimeout(this._openInternal.bind(this), 100)
                }

            }.bind(this))
            .fail(function () {
                console.error("Failed loading content for ", this.sectionId)
            })
    }

    _addBorder() {
        if (!this.$border) {
            let borderDiv = document.createElement("div")
            this.$border = $(borderDiv)
            this.$border.append(`<div data-i18n="${this.sectionId}" class="initialSectionTitle">${$(this.sourceSection).text()}</div>`)
        }else{
            this.$border[0].childNodes[0].innerHTML = $(this.sourceSection).text()
        }

        let rect = this._getSourceSectionRect()
        for (let side of Object.keys(rect)) {

            if (rect[side] > 1) {
                console.log(`border-${side}`)
                this.$border.addClass(`border-${side} fsBorder`)
                if (!this._isFullScreen()) {
                    $(this.fullSection).find(".content").addClass(`border-${side}`)
                }
            }
        }

        this.$border.css({
            "z-index": 2,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom

        })
        $("body").append(this.$border)

        this.$border.on("transitionend", function () {
            console.log("hide border")
            $(this).hide()
        })

        this.$border.show()
    }

    _setInitialClipPath() {
        let clipPath = Section._getClipPathForRect(this._getSourceSectionRect())
        $(this.fullSection).css({
            "clip-path": clipPath,
            "-webkit-clip-path": clipPath
        })
    }

    _getSourceSectionRect() {
        let $section = $(this.sourceSection)
        let pos = $section.position()
        return {
            top: pos.top,
            right: window.innerWidth - pos.left - $section.outerWidth(),
            bottom: window.innerHeight - pos.top - $section.outerHeight(),
            left: pos.left
        }
    }
    _stopAllVideos() {
       const videos = document.getElementsByTagName('video');
        for (const video of videos) {
            video.pause();
            video.currentTime = 0;
        }
    }
}

function setSectionRandomBackgroundColor() {
    let i = Math.floor(Math.random() * Math.floor(3))
    $(".content")
        .removeClass("color0")
        .removeClass("color1")
        .removeClass("color2")
        .addClass(`color${i}`)
}

/**
 * Call on url changes. Executes all page routing based on hashes in the url.
 * @param {string} urlString - If url contains a hash with a section id, the respective section is opened, if no hash
 * in url and a section is currently open, the section is closed.
 */
function hashChanged(urlString) {
    let url = new URL(urlString)

    if (url.hash) {
        let hash = url.hash
        let sectionName = hash.split("#/")[1]
        sections[sectionName].open()
    }
    else {
        if (openSection) {
            openSection.close()
        }
    }
}

function isPortraitMode() {
    return window.matchMedia("(max-width: 600px)").matches
        || window.matchMedia("(max-width: 1200px) and (min-width: 601px) and (orientation: portrait)").matches
}

/**
 * Called from index.html on body ready.
 */
export default function ready() {

    function _setupSections() {
        sections.studio = new Section("studio")
        sections.design = new Section("design", function () {
            // todo: ugly workaround!
            //  A click on the "design" section title resets all filters.
            //  Provide a way to reset the design section filters after close / before open.
            $(".clickableSectionTitle").click()
        })
        sections.workshop = new Section("workshop")
        sections.impressum = new Section("impressum")
        /*sections.research = new Section(
            "research",
            setSectionRandomBackgroundColor,
            function () {
                return isPortraitMode() ? {
                    top: "16%",
                    right: "16%",
                    bottom: 0,
                    left: 0
                } : {
                    top: "16%",
                    right: 0,
                    bottom: 0,
                    left: "16%"
                }
            }
        )*/
        sections.research = new Section("research")
        sections.kontakt = new Section("kontakt")
        sections.datenschutz = new Section("datenschutz")

        let footer = new Footer()
        sections.footer = new Section(
            "footer",
            footer.open.bind(footer),
            function () {
                return {
                    top: "16%",
                    right: "16%",
                    bottom: 0,
                    left: 0
                }
            })
    }

    function _setupRouting() {
        $(".section").on("click", function () {
            location.hash = `/${this.id}`
        })

        $(window).on("hashchange", function (event) {
            hashChanged(event.originalEvent.newURL)
        })

        hashChanged(location.href)
    }

    _setupSections();
    _setupRouting();

    if (!(new URL(location.href)).hash && autoOpenSection) {
        location.href += "/" + autoOpenSection
    }
}
