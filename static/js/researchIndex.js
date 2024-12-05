
import  * as utils from "/static/js/utils.js"

let _projects = []
let _originalProjects = null
let _portfolioOverlay = null


function beginResearch(e){
    let sections = $('.projectContainer')
    sections.removeClass('activeResearch nextResearch')
    
    $('.projectContainer:nth-child(2)').addClass("activeResearch")
    previousResearch()
}

function activateVisibleProject() {
    // Check if there's already an .activeResearch
 
    // Select all .projectContainer elements
    const projectContainers = document.querySelectorAll('.projectContainer');

    // Set up an IntersectionObserver to detect elements in view
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the .activeResearch class to the currently visible .projectContainer
                entry.target.classList.add('activeResearch');
                observer.disconnect(); // Stop observing once we find the target
            }
        });
    }, { threshold: 0.5 }); // Adjust threshold as needed (0.5 = 50% visibility)

    // Observe each .projectContainer
    projectContainers.forEach(container => observer.observe(container));
}

// Call the function



function previousResearch(e){
  

    let nextActive = $(".activeResearch").prev();
    let $container = $(".researchs")
    
    if(nextActive.prev().length==0){

        $container.parent().addClass("first")
    }
    else{
        $container.parent().removeClass("first")
    }
    let sections = $('.projectContainer')
    sections.removeClass('activeResearch nextResearch')

    nextActive.addClass('activeResearch')
    nextActive.next().addClass('nextResearch')

    if(nextActive[0]){
    $('.researchs').animate({scrollLeft: nextActive[0].offsetLeft}, {queue: true}); 
    }   
    let titleContainer = $('#secondTitle')
    let previousR = $(".previousR");
    let nextR = $(".nextR");
    if( nextActive.next().data("title")){
        nextR.html( nextActive.next().data("title"))
        $("#nextR").show()
    }
    else{
        nextR.html("")
        $("#nextR").hide()
    }

    if(nextActive.prev().data("title")){
        previousR.html( nextActive.prev().data("title"))
        $("#previousR").show()
    }
    else{
        previousR.html("")
        $("#previousR").hide()
    }
    

    if(nextActive.data("title") != "Research"){ 
        titleContainer.html("<span> / </span>" + nextActive.data("title"))
    
    }
    else{
        titleContainer.html("")
    }  
   
}

function nextResearch(){

    let nextActive = $(".activeResearch").next();

    let sections = $('.projectContainer')
    sections.removeClass('activeResearch nextResearch')

    nextActive.addClass('activeResearch')
    nextActive.next().addClass('nextResearch')

    if(nextActive[0]){
        $('.researchs').animate({scrollLeft: nextActive[0].offsetLeft}, {queue: true}); 
    }
    let titleContainer = $('#secondTitle')

    let previousR = $(".previousR");
    let nextR = $(".nextR");
    if( nextActive.next().data("title")){
        nextR.html( nextActive.next().data("title"))
        $("#nextR").show()
    }
    else{
        nextR.html("")
        $("#nextR").hide()
    }

    if(nextActive.prev().data("title")){
        previousR.html( nextActive.prev().data("title"))
        $("#previousR").show()
    }
    else{
        previousR.html("")
        $("#previousR").hide()
    }
    
    if(nextActive.data("title") != "Research"){ 
        titleContainer.html("<span> / </span>" + nextActive.data("title"))
    
    }
    else{
        titleContainer.html("")
    }  
   
}


function scrollToProject(projectId, projectname) {

    let $container = $(".researchs")
    let sections = $('.projectContainer')
    sections.removeClass('activeResearch nextResearch')
    let scrollTo = $("#" + projectId)

    if(scrollTo.prev().length==0){
        $container.parent().addClass("first")
    }
    else{
        $container.parent().removeClass("first")
    }


    scrollTo.addClass('activeResearch')
    scrollTo.next().addClass('nextResearch')
   

    $(".researchs").animate({scrollLeft: scrollTo[0].offsetLeft}, {queue: false}, 800);
 
    let titleContainer = $('#secondTitle')
    let previousR = $(".previousR");
    let nextR = $(".nextR");
    let nextResearch = $(".nextResearch");

    if(nextResearch.length >0 ){
        nextR.html(scrollTo.next().data("title"));
        $("#nextR").show()
     }
     else{
         nextR.html("");
         $("#nextR").hide()
     }

    if(scrollTo.prev().length >0 ){
        previousR.html(scrollTo.prev().data("title"));
        $("#previousR").show()
     }
     else{
         previousR.html("");
         $("#previousR").hide()
     }
    if(projectname != "Research"){
        titleContainer.html("<span> / </span>" + projectname)    
    }  
    else{
        titleContainer.html("")
 
    } 


}


class Index {

    /**
     * Constructor
     * @param {Object} content - A data object from the projects.json file.
     */
    constructor(content) {
        this.title = content.title
        this.subtitle = content.subtitle
        this.projectId = utils.normalizeID("research-" + content.id)
        this.active = ""
       
    }

    renderTitle($appendTo) {
        let renderedThumbnail = `<a class="listResearch" 
                                    data-projectid="${this.projectId}"
                                    data-projectname="${this.title}"
                                    onmouseover="">
                                        <div class="researchTitleContainer">
                                            <div class="researchTitle heading1">${this.title}</div> 
                                            <div class="researchSubTitle">${this.subtitle}</div> 
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
        $(`.listResearch[data-projectid=${this.projectId}]`).on("click", function (event) {
            let data = $(event.target).parents(".listResearch");
            scrollToProject(data.data("projectid"), data.data("projectname"))
            _portfolioOverlay.closeOverlay()
        })
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
 * Triggered by body.ready of the portfolio page.
 * @param portfolioOverlay - The overlay object containing the portfolio
 * @param designProjects - The projects of the design page, used to trigger scrolling to a specific project.
 */
export default function ResearchIndexReady(translations, portfolioOverlay, designProjects) {
    console.log("research index ready")
    // todo: consolidate DesignProject and Project classes and just use the original designProjects data here.
    //  loading the projects.json here would then be obsolete.
    _originalProjects = designProjects
    _portfolioOverlay = portfolioOverlay
    $(".list").html("");
        translations.projects.forEach(p => {
            let project = new Index(p)
            _projects.push(project)
            project.renderTitle($(".list"))
        })

  

    // Remove existing event listeners to avoid duplicates
    $(".back").off("click");
    $("#previousR").off("click");
    $("#nextR").off("click");
    $("#firstTitle").off("click");
  
       
    $(".back").on("click", previousResearch.bind(this))
    $("#previousR").on("click", previousResearch.bind(this))    
    $("#nextR").on("click", nextResearch.bind(this))    
    $("#firstTitle").on("click", beginResearch.bind(this))    
}
