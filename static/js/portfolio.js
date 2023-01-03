import {normalizeID} from "/static/js/utils.js"
import getMediaMatch, * as utils from "/static/js/utils.js"

let _projects = []
let _activeFilter = null
let _originalProjects = null
let _portfolioOverlay = null

const NO_FILTER_STRING = "Gesamt";


function scrollToProject(projectId) {
    let project = _originalProjects.find(p => {
        return p.projectId === projectId
    })
    let $container = $("#designContent .content")
    let scrollTo = $("#" + projectId)
    $container.animate({scrollTop: scrollTo[0].offsetTop}, {queue: false});
    project.triggerDownloadImagesIfProjectIsVisible()
}


class Project {

    /**
     * Constructor
     * @param {Object} content - A data object from the projects.json file.
     */
    constructor(content) {
        this.title = content.title
        this.categories = content.categories
        this.customer = content.customer
        this.year = content.year
        this.thumbnail = content.thumbnail
        this.description = content.description
        this.thumbnailPath = "/static/img/projects/" + content.galleryFolder
    }

    renderThumbnail($appendTo) {
        let renderedThumbnail = `<a class="thumbnail" 
                                    data-projectid="${this._getProjectAnchor()}"
                                    onmouseover=""
                                    data-categories="${this.categories.join(',')}"
                                    style="background: url('${this.thumbnailPath}/${this.thumbnail}') no-repeat center;">
                                        <div class="thumbnailProjectTitleContainer">
                                            <div class="thumbnailProjectTitle paragraph">${this.title}</div> 
                                        </div>
                                 </a>`
        $appendTo.append(renderedThumbnail)
        this._setupClickListener()
    }

    /**
     * Add click listener to the thumbnails. Click scrolls design page to the respective project and
     * closes the portfolio overlay.
     * @private
     */
    _setupClickListener() {
        $(`.thumbnail[data-projectid=${this._getProjectAnchor()}]`).on("click", function (event) {
            scrollToProject($(event.target).parents(".thumbnail").data("projectid"))
            _portfolioOverlay.closeOverlay()
        })
    }

    _getProjectAnchor() {
        return normalizeID(this.title)
    }
}

/**
 * Show all given thumbnails.
 * @param $thumbnails - A JQuery array containing the thumbnail elements to be shown.
 */
function showThumbnails($thumbnails) {
    $thumbnails.removeClass("hidden")
    $thumbnails.find(".thumbnailProjectTitleContainer").removeClass("hidden")
}

/**
 * Hide all given thumbnails.
 * @param $thumbnails - A JQuery array containing the thumbnail elements to be hidden.
 */
function hideThumbnails($thumbnails) {
    $thumbnails.addClass("hidden")
    $thumbnails.find(".thumbnailProjectTitleContainer").addClass("hidden")
}

/**
 * Hide/show the filtered projects on the design page.
 * Todo: This actually conflicts with the separation of concerns principle, as the overlay triggers changes on
 *  the main page. Maybe provide a filter callback from the design page?
 * @param {string} category - The category to filter the projects by.
 */
function filterDesignPage(category) {
    let $categoryProjectFilter = $("#designContent .sectionTitle .projectFilter")
    let $clickableSectionTitle = $("#designContent .sectionTitle .clickableSectionTitle")
    let $projectContainer = $(".projectContainer");

    if (category) {
        $categoryProjectFilter.html(`&nbsp;/ ${category}`)
        $clickableSectionTitle.on("click", function () {
            filterProjects(NO_FILTER_STRING)
        }).addClass("islink")
    } else {
        $categoryProjectFilter.text("")
        $clickableSectionTitle.removeClass("islink")
        $projectContainer.show()
        return
    }

    Array.from($projectContainer).forEach(pc => {
        if ($(pc).data("categories").split(",").includes(category)) {
            $(pc).removeClass("hiddenProject").show()
        } else {
            $(pc).addClass("hiddenProject").hide()
        }
        window.setTimeout(function () {
            scrollToProject($(".projectContainer:not(.hiddenProject)").first().attr("id"))
        }, 100)
    })
}

/**
 * Filter projects by the given category. Only one filter can be active at the time.
 * Projects not belonging to this category are hidden. This affects the portfolio thumbnails
 * as well as the projects on the design page.
 * @param {string} category - The category to filter the projects by.
 */
function filterProjects(category) {
    if (category === NO_FILTER_STRING) {
        _activeFilter = null
    } else {
        _activeFilter = category
    }

    filterDesignPage(_activeFilter)

    Array.from($(".projectCategory")).forEach(c => {
        if (_activeFilter === $(c).data("category")) {
            $(c).addClass("active")
        } else {
            $(c).removeClass("active")
        }
    })

    let $allThumbnails = $(".thumbnail");

    if (!_activeFilter) {
        showThumbnails($allThumbnails)
        $(`.projectCategory[data-category=GESAMT]`).addClass("active")
        return
    } else {
        $(`.projectCategory[data-category=GESAMT]`).removeClass("active")
    }

    Array.from($allThumbnails).forEach(t => {
        if ($(t).data("categories").split(",").includes(_activeFilter)) {
            showThumbnails($(t))
        } else {
            hideThumbnails($(t))
        }
    })
}

/**
 * Triggered by body.ready of the portfolio page.
 * @param portfolioOverlay - The overlay object containing the portfolio
 * @param designProjects - The projects of the design page, used to trigger scrolling to a specific project.
 */
export default function portfolioReady(portfolioOverlay, designProjects) {
    console.log("portfolio ready")

    // todo: consolidate DesignProject and Project classes and just use the original designProjects data here.
    //  loading the projects.json here would then be obsolete.
    _originalProjects = designProjects
    _portfolioOverlay = portfolioOverlay

    $.getJSON("/data/projects.json", function (projectData) {
        let categories = new Set()

        projectData.forEach(p => {
            let project = new Project(p)
            _projects.push(project)
            project.categories.forEach(c => categories.add(c))
            project.renderThumbnail($(".thumbnails"))
            // project.setupEventListeners()
        })

        let $categories = $(".categories")
        categories.forEach(c => {
            $categories.append(`<a class="projectCategory paragraph" data-category="${c}">${c}</a>`)
        })

        $categories.find(".projectCategory").on("click", function (event) {
            filterProjects($(event.target).data("category"))
            if(getMediaMatch() === utils.SMALL) {
                $(this).parents(".overlay").find(".openHandle").click()
            }
        })

        filterProjects(NO_FILTER_STRING)
    })
}
