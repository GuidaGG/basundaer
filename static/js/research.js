import Overlay from "/static/js/overlay.js"
import TouchDragHandlerSimplified from "/static/js/TouchDragHandlerSimplified.js"

export let researchProjects = []
export let researchOverlay = new Overlay()
let overlayLoaded = false


import getMediaMatch, * as utils from "/static/js/utils.js"

function isElementInViewport(el, left, right) {
    if(el){
        let rect = el.getBoundingClientRect();
        return (rect.left <= left && rect.right > right)
    }
}

/**
 * A project containing dynamic text and images.
 */
class ResearchProject {

    /**
     * Constructor
     * @param {Object} content - A data object from the projects.json file.
     */
    constructor(content) {
        this.title = content.title
        this.projectId = utils.normalizeID("research-" + content.id)
        this.active = ""
        this.galleryPath = "/static/img/research/" + encodeURIComponent(content.galleryFolder)
        /**
         * List of image filenames for the gallery. Will be rendered in order of this list.
         * @type {Array}
         */
        this.dynamic = content.dynamic
        this.isGalleryRendered = false
        this.galleries = []
        this.videos = []
        this.isVideoPlaying = false
    }

    /**
     * Renders the project as html and appends it to the given $element.
     * @param {Object} $element - The DOM element to append the rendered project to.
     */
    appendTo($element) {
    
        this.renderedContent = this._render()
        $element.append(this.renderedContent)
  
        window.setTimeout(function () {
            this._triggerDownloadImagesAndVideoIfResearchIsVisible()
            $(window).on('DOMContentLoaded load resize scroll', this._triggerDownloadImagesAndVideoIfResearchIsVisible.bind(this))
            $("#researchContent .content").on("scroll", this._triggerDownloadImagesAndVideoIfResearchIsVisible.bind(this))
        }.bind(this), 200)
     
    }

    nextResearch(e){
        let $container = $(".researchs");
        let sections = $('.projectContainer')
        sections.removeClass('activeResearch nextResearch')
        let nextActive = $(e.currentTarget);

        if(nextActive.prev().length==0){
            $container.parent().addClass("first")
        }
        else{
            $container.parent().removeClass("first")
        }
        
        nextActive.addClass('activeResearch')
        nextActive.next().addClass('nextResearch')

        $('.researchs').animate({scrollLeft: nextActive[0].offsetLeft}, {queue: false}); 

        let titleContainer = $('#secondTitle')

        if(nextActive.data("title") != "Research"){ 
            titleContainer.html("<span> / </span>" + nextActive.data("title"))
        
        }
        else{
            titleContainer.html("")
        }  

      
    }
    touch(direction){
       
        let nextActive
        let previousR = $(".previousR");
        let nextR = $(".nextR");

        if(direction == "prev"){
        
            let current = $(".activeResearch");
            nextActive = current.prev();  
        }
        else{
            nextActive = $(".nextResearch"); 
        }
        
     
        if(nextActive.length>0){
           
            let prevTitle = nextActive.prev().data("title")
            let nextTitle = nextActive.next().data("title")  

            previousR.html(prevTitle);
            nextR.html(nextTitle)

            if(!nextTitle){
                nextR.html("")
            }
            if(!prevTitle){
                previousR.html(""); 
            }
      

            $('.researchs').animate({scrollLeft: nextActive[0].offsetLeft}, 800); 

            let titleContainer = $('#secondTitle')


            if(nextActive.data("title") != "Research"){ 
                titleContainer.html("<span> / </span>" + nextActive.data("title"))
            
            }
            else{
                titleContainer.html("")
            }  
            let sections = $('.projectContainer')
            sections.removeClass('activeResearch nextResearch')
            nextActive.addClass('activeResearch')
            nextActive.next().addClass('nextResearch')
            

            
        }
        

      
    }

    
   
    _renderText(data){
        let result = ''
        let paragraphs = data.text.split('\n')
        paragraphs.forEach(p => {
            result += `<p class="paragraph ${data.class}">${p}</p>`
        })
        return  result
    }

    _renderQuote(data){
        return `<div class="zone quote-zone">${data.quote}</div>`;
    }

    _downloadImages() {
        this.isGalleryRendered = true
        let gallerypath = this.galleryPath;
        let increase = 1;
        let increaseCaption = 1;
        let galleryContainers = $(`#${this.projectId} .gallery-zone`);
        let galleryCaptions = $(`#${this.projectId} .caption-zone`);
        
        this.galleries.forEach(function(data, index) {
            let result = '';
                data.gallery.forEach(function(image, index) {

                result += `<div class="${data.classes[index]} image-container">`;
                if(data.captions[index]){
                
                    result += `<div class="image-number">${increase}</div>`;
                    increase++
                }
                result += `
                ${image.link ? `<a href="${image.link}" target="_blank">` : ''}
                    <img src="${gallerypath}/${encodeURIComponent(image.src)}" alt="${image.alt}">
                ${image.link ? `</a>` : ''}</div>
                `;
            


            });

            let resultCaptions = ''
            resultCaptions += `<div class="gallery-captions">`;
            if(data.gallerycaption){
                resultCaptions += `<div class="main-caption">${data.gallerycaption}</div>`;
            }
            data.captions.forEach(function(caption, index) {
                if(caption){
                    resultCaptions += `<div class="caption"><span>${increaseCaption}</span> ${caption}
              
                </div>`;
                increaseCaption++;
                }
            })
            resultCaptions += `</div>`;
            
            galleryContainers[index].innerHTML = result;
            galleryCaptions[index].innerHTML = resultCaptions;
        });
        
    }

    _removeImageBackground(){
  
        $("img").on('load', function(e) {
            $(this).css('background', 'transparent')
         })
         
    }

    _renderGallery(data){

        let result = ''
        result += `<div class="${data.height} ${data.logos ? "gallery-logos" : "gallery-regular"} gallery-zone zone"></div>`;
        result +=  `<div class="caption-zone"></div>`
        return result
    }

    _getSrcForGalleryImage(image) {
        return `${this.galleryPath}/${encodeURIComponent(image)}`
    }

    
    _triggerDownloadImagesAndVideoIfResearchIsVisible() {
        let container = $(`#${this.projectId}`)[0]
        if (isElementInViewport(container, window.innerWidth, 0)) {
            if (!this.isGalleryRendered) { 
                this._downloadImages() 
                this._removeImageBackground()
            }
         
        }
       /* if (getMediaMatch() !== utils.SMALL) {
            if(isElementInViewport(container, 100, 0)){

                container.querySelectorAll("video").forEach(function(video){
                    video.play()
                    video.nextSibling.classList.remove("play")
                    video.nextSibling.classList.add("pause")
        
                })
            }else{
                container.querySelectorAll("video").forEach(function(video){
                    video.pause()
                    video.nextSibling.classList.remove("pause")
                    video.nextSibling.classList.add("play")
                
                })
                
            }
        }*/
    }

    _videoControls() {
        let container = $(`#${this.projectId}`)[0]
        let videoControls = container.querySelectorAll(".videoControls")

        Array.from(videoControls).forEach(control => {

            let video = control.previousSibling
            control.firstChild.addEventListener("click", function() {

                if (getMediaMatch() != utils.SMALL) {
                    if(video.paused || video.ended || video.currentTime === 0){
                        
                        video.play();
                        control.classList.remove("play")
                        control.classList.add("pause")
                    }
                    else{
                        video.pause();
                        control.classList.remove("pause")
                        control.classList.add("play")
                    }
                }
                else{
                    video.play();
                    this.classList.remove("pause")
                    this.classList.add("play")
                }
            })

            control.lastChild.addEventListener("click", function() {
               if(video.muted){
                video.muted = false;
                control.classList.remove("unmute")
                control.classList.add("mute")
               }
               else{
                video.muted = true
                control.classList.remove("mute")
                control.classList.add("unmute")
               }
        });
        });
    }

    _renderImage(data){
      
        let result = ''
        let gallerypath = this.galleryPath;
 
        result += `<div class="image-zone zone">`;
        result += `<figure><img src="${gallerypath }/${encodeURIComponent(data.image.src)}" alt="${data.image.alt}">`;
        if(data.image.credit){
            result +=  `<figcaption class="image-credit">${data.image.credit}</figcaption>`;
        }
        result += `</div></figure>`;
        return result
    }

    _renderVideo(data){
        let result = ''
        let gallerypath = this.galleryPath;

        result += `<div class="video-zone zone" >`;
        result += `<video width="1280" loop><source src="${gallerypath }/${encodeURIComponent(data.videoURL)}"  type="video/mp4">Your browser does not support the video tag.</video>`;
        result += `<div class="videoControls play"><div class="pause_play"></div><div class="mute_unmute"></div></div>`;
        result += `</div>`;
        return result
    }

    _renderContent(){
        let result = ''
        let content = this.dynamic
        for ( var k in content ) {
            let zone = content[k]
           
            switch(zone.type) {
                case "text":
                   result += `<div class="zone text-zone ${zone.class}">${this._renderText(zone)}</div>`
               
                break;
                case "image":
                    result += this._renderImage(zone)
            
                
                break;
                case "gallery":
                    this.galleries.push(zone)
                    
                    result += this._renderGallery(zone)
                   
                break;
                case "video":
                    this.videos.push(zone)

                    result += this._renderVideo(zone)
               
                break;
                default:
                    result += this._renderText(zone)
                  
            }
        
        
        }
        return result

    }

    _render() {
      
        return `
            <div class="projectContainer subcontent ${this.active} content-padding-top" 
                id="${this.projectId}"  
                name="${this.projectId}" data-title="${this.title}">
            
                <div class="dynamicContent">
                 ${this._renderContent()}
                    
                </div>       
            </div>
        `
    }
}



export default function researchPageReady(translations) {
    $(".researchs").html("");

    let counter = 0;
    translations.projects.forEach(p => {
            
            let researchProject = new ResearchProject(p)
            researchProjects.push(researchProject)
            if(counter == 0){
                researchProjects[counter].active = "activeResearch";
                let previousR = $(".previousR");
                previousR.html("")
                $("#previousR").hide()
            }

            if(counter == 1){
                researchProjects[counter].active = "nextResearch";
                 
                 let nextR = $(".nextR");
                 nextR.html(researchProjects[counter].title)
                   
            }
            researchProject.appendTo($(".researchs"))
            researchProject._videoControls();
            counter++;
            window.setTimeout(function () {
    
            $("#"+researchProject.projectId).on("click", researchProject.nextResearch.bind(this))
           
            let researchNavigation =  $("#"+researchProject.projectId)
            if (getMediaMatch() !== utils.SMALL) {
                new TouchDragHandlerSimplified(
                    researchNavigation[0],
                    $(".researchs"),
                    function () {
                        researchProject.touch("next")
                    }, function () {
                        researchProject.touch("prev")
                    },
                    200,
                    function () {
                    }.bind(this))
                }       
            }, 1000)
    
        
       const config = {
            root: null, // setting root to null sets it to viewport
            rootMargin: '0px',
            threshold: 0.8
          };
          let observer = new IntersectionObserver(function(entries) {
            entries.forEach(function (entry) {
              const {isIntersecting, intersectionRatio} = entry;

          if (isIntersecting === true || intersectionRatio > 0.0) {
                let target = entry.target;
     
                let sections = $('.projectContainer')
                sections.removeClass('activeResearch nextResearch')
                let current = $(target)
                current.addClass('activeResearch')
                current.next().addClass('nextResearch')
                
                let title = target.dataset.title
                let titleContainer = $('#secondTitle')
                
                if(title != "Research"){ 
                    titleContainer.html("<span> / </span>" + title)
                
                }
                else{
                    titleContainer.html("")
                }  
               
              }
            });
          }, config);

            const domElements = document.querySelectorAll('.projectContainer');
            domElements.forEach(domElem => {
               // observer.observe(domElem);
          
    });
         
    })
  
    //mobile, finish
    /* window.setTimeout(function () {

      
        
        let galleryNavigation = $(`#researchContent .navigation`)
        
        new TouchDragHandler(
            galleryNavigation[0],
            galleryNavigation.siblings()[0],
            function () {
                alert("hex")
            }, function () {
                alert("olll")
            },
            200,
            function () {
                console.log("drag none")
            }.bind(this))
    }, 100)
    
    */
    
    if (!overlayLoaded) {
        overlayLoaded = true
        researchOverlay.loadOverlay("researchIndex",
            "researchSideContent",
            "researchContent",
            "Übersicht")
    }
}
