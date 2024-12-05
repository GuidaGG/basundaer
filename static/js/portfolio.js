import {normalizeID} from "/static/js/utils.js"
import getMediaMatch, * as utils from "/static/js/utils.js"

let _projects = []
let _activeFilter = null
let _activeSector = null
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
        this.sectors = content.sectors
        this.customer = content.customer
        this.year = content.year
        this.thumbnail = content.thumbnail
        this.description = content.description
        this.thumbnailPath = "/static/img/projects/" + content.galleryFolder
    }

    renderThumbnail($appendTo) {

        let sectors = this.sectors ? this.sectors.join(",") : ""
        let renderedThumbnail = `<a class="thumbnail" 
                                    data-projectid="${this._getProjectAnchor()}"
                                    onmouseover=""
                                    data-categories="${this.categories.join(',')}"
                                    data-sectors="${sectors}"
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
 * @param {string} sector - The sector to filter the projects by.
 */
function filterDesignPage(category, sector) {
    let $categoryProjectFilter = $("#designContent .sectionTitle .projectFilter");
    let $clickableSectionTitle = $("#designContent .sectionTitle .clickableSectionTitle");
    let $projectContainer = $(".projectContainer");

    // Update the filter display and clickable title based on category or sector
    if (category || sector) {
        let filterText = '';

        if (category) {
            filterText = `&nbsp;/ ${category}`;
        }

        if (sector) {
            filterText += filterText ? ` & ${sector}` : `&nbsp;/ ${sector}`;
        }
        $categoryProjectFilter.html(filterText);

        $clickableSectionTitle
            .on("click", function () {
                filterProjects(NO_FILTER_STRING);
            })
            .addClass("islink");
    } else {
        $categoryProjectFilter.text("");
        $clickableSectionTitle.removeClass("islink");
        $projectContainer.show();
        return;
    }

    // Filter projects based on category, sector, or both
    Array.from($projectContainer).forEach(pc => {
        const categories = $(pc).data("categories") ? $(pc).data("categories").split(",") : [];
        const sectors = $(pc).data("sectors") ? $(pc).data("sectors").split(",") : [];

        // Case 1: Both category and sector are specified
        if (category && sector) {
            if (categories.includes(category) && sectors.includes(sector)) {
                $(pc).removeClass("hiddenProject").show();
            } else {
                $(pc).addClass("hiddenProject").hide();
            }
        }
        // Case 2: Only category is specified
        else if (category && !sector) {
            if (categories.includes(category)) {
                $(pc).removeClass("hiddenProject").show();
            } else {
                $(pc).addClass("hiddenProject").hide();
            }
        }
        // Case 3: Only sector is specified
        else if (!category && sector) {
            if (sectors.includes(sector)) {
                $(pc).removeClass("hiddenProject").show();
            } else {
                $(pc).addClass("hiddenProject").hide();
            }
        }
    });

    // Scroll to the first visible project after filtering
    window.setTimeout(function () {
        const firstVisibleProject = $(".projectContainer:not(.hiddenProject)").first();
        if (firstVisibleProject.length) {
            scrollToProject(firstVisibleProject.attr("id"));
        }
    }, 100);
}

/**
 * Filter projects by the given category. Only one filter can be active at the time.
 * Projects not belonging to this category are hidden. This affects the portfolio thumbnails
 * as well as the projects on the design page.
 * @param {string} category - The category to filter the projects by.
 */
function filterProjects(category, sector) {
    if (category === NO_FILTER_STRING) {
        _activeFilter = null
    } else {
        _activeFilter = category
    }

    if (sector === NO_FILTER_STRING) {
        _activeSector = null
    } else {
        _activeSector = sector
    }


    filterDesignPage(_activeFilter, _activeSector )

    Array.from($(".projectCategory")).forEach(c => {
        if (_activeFilter === $(c).data("category")) {
            $(c).addClass("active")
        } else {
            $(c).removeClass("active")
        }
    })

    Array.from($(".sectorCategory")).forEach(c => {
        if (_activeSector === $(c).data("sector")) {
            $(c).addClass("active")
        } else {
            $(c).removeClass("active")
        }
    })

    let $allThumbnails = $(".thumbnail");
    
    // Check if both _activeFilter and _activeSector are null to show all thumbnails
    if (!_activeFilter && !_activeSector) {

        showThumbnails($allThumbnails);
        $(`.projectCategory[data-category=Gesamt]`).addClass("active");
        $(`.sectorCategory[data-sector=Gesamt]`).addClass("active");
    } else {
        $(`.projectCategory[data-category=Gesamt]`).toggleClass("active", !_activeFilter);
        $(`.sectorCategory[data-sector=Gesamt]`).toggleClass("active", !_activeSector);
    
        // Iterate through each thumbnail to apply the filtering logic
        Array.from($allThumbnails).forEach(t => {
            const categories = $(t).data("categories").split(",");
            const sectors = $(t).data("sectors").split(",");
    
            // Case 1: Both _activeFilter and _activeSector are set
            if (_activeFilter && _activeSector) {
                if (categories.includes(_activeFilter) && sectors.includes(_activeSector)) {
                    showThumbnails($(t));
                } else {
                    hideThumbnails($(t));
                }
            }
            // Case 2: Only _activeFilter is set
            else if (_activeFilter && !_activeSector) {
                if (categories.includes(_activeFilter)) {
                    showThumbnails($(t));
                } else {
                    hideThumbnails($(t));
                }
            }
            // Case 3: Only _activeSector is set
            else if (!_activeFilter && _activeSector) {
                if (sectors.includes(_activeSector)) {
                    showThumbnails($(t));
                } else {
                    hideThumbnails($(t));
                }
            }
        });
    }
}


/**
 * Triggered by body.ready of the portfolio page.
 * @param portfolioOverlay - The overlay object containing the portfolio
 * @param designProjects - The projects of the design page, used to trigger scrolling to a specific project.
 */
export default function portfolioReady(translations, portfolioOverlay, designProjects) {
    console.log("portfolio ready")

    // todo: consolidate DesignProject and Project classes and just use the original designProjects data here.
    //  loading the projects.json here would then be obsolete.
    _originalProjects = designProjects
    _portfolioOverlay = portfolioOverlay

    
        let categories = new Set()
        let sectors = new Set()

        let $thumbnails = $(".thumbnails");
        $thumbnails.html("")

        let $categories = $(".more-categories")
        $categories.html("")

        let $sectors = $(".more-sectors")
        $sectors.html("")

        translations.projects.forEach(p => {
            let project = new Project(p)
            _projects.push(project)

            project.categories.forEach(c => categories.add(c))
            if (project.sectors){
                project.sectors.forEach(t => sectors.add(t))
            }
            project.renderThumbnail($thumbnails);
            //project.setupEventListeners()
        })

      
        categories.forEach(c => {
            $categories.append(`<a class="projectCategory paragraph" data-category="${c}">${c}</a>`)
        })

        sectors.forEach(t => {
            $sectors.append(`<a class="sectorCategory paragraph" data-sector="${t}">${t}</a>`)
        })

        $(".categories").find(".projectCategory").on("click", function (event) {
            _activeFilter = $(event.target).data("category");
            filterProjects(_activeFilter , _activeSector)
            if(getMediaMatch() === utils.SMALL) {
                $(this).parents(".overlay").find(".openHandle").click()
            }
        })

        $(".sectors").find(".sectorCategory").on("click", function (event) {
            _activeSector = $(event.target).data("sector");
            filterProjects(_activeFilter, _activeSector)
            if(getMediaMatch() === utils.SMALL) {
                $(this).parents(".overlay").find(".openHandle").click()
            }
        })

        filterProjects(NO_FILTER_STRING)

}
