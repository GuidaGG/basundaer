
import Overlay from "/static/js/overlay.js"
export let workshopOverlay = new Overlay()
export let workshopProjects = []
let overlayLoaded = false

class WorkshopContent {
    constructor(content) {
        this.intro = content.intro
        this.overlay = content.workshops
        this.dynamic = content.dynamic
        this.galleryPath = "/static/img/workshops"
    }

    renderIntro() {
      
        return `${this.intro}`
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

    _renderCaptions(data){
        let result = ''
        let increase = 1;
        result += `<div class="gallery-captions">`;
        if(data.gallerycaption){
        result += `<div class="main-caption">${data.gallerycaption}</div>`;
        }
        data.captions.forEach(function(caption, index) {
            if(caption){
            result += `<div class="caption"><span>${increase}</span> ${caption}
          
            </div>`;
            increase++;
            }
        })
        result += `</div>`;
        return result
    }
    _renderGallery(data){
        let result = ''
        let gallerypath = this.galleryPath;
        let increase = 1;
        result += `<div class="${data.height} gallery-zone zone">`;
        data.gallery.forEach(function(image, index) {
            result += `<div class="${data.classes[index]} image-container">`;
            if(data.captions[index]){
               
                result += `<div class="image-number">${increase}</div>`;
                increase++
            }
            
            result += `<img src="${gallerypath }/${encodeURIComponent(image.src)}" alt="${image.alt}">
            </div>`;
           
        })
        result +=  this._renderCaptions(data)
        result += `</div>`;
        return result
    }

    _renderImage(data){
        let result = ''
        let gallerypath = this.galleryPath;

        result += `<div class="image-zone zone">`;
        result += `<img src="${gallerypath }/${encodeURIComponent(data.image.src)}" alt="${data.image.alt}>`;
        result += `</div>`;
        return result
    }

    _renderVideo(data){
        let result = ''
        let gallerypath = this.galleryPath;

        result += `<div class="video-zone zone">`;
        result += `<video width="1280" controls autoplay muted><source src="${gallerypath }/${encodeURIComponent(data.videoURL)}"  type="video/mp4"></video>`;
        result += `</div>`;
        return result
    }
    renderoverlay(){
    
        
        let result = ""
        this.overlay.forEach(text => {
            result += `${text}`
        })
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
                case "gallery":
                    result += this._renderGallery(zone)
                break;
                case "image":
                    result += this._renderImage(zone)
                break;
                case "video":
                    result += this._renderVideo(zone)
                break;
                default:
                    result += this._renderText(zone)       
            }
        
        
        }
        return result

    }
    renderoverlay(){
    
        /*
        let result = ""
        this.overlay.forEach(text => {
            result += `${text}`
        })
        return result
        */
       return "overlay content"
    }
    render() {
        return `
            <div class="">
                <h2 class="heading1 pageContent">${this.renderIntro()}</h2
                <div class="dynamicContent">
                ${this._renderContent()}
               </div>  
            </div>
        `
    }
}

class Workshops {
    constructor(content) {
        this.heading = content.heading
    }

    renderIntro() {
      
        return `${this.heading}`
    }

    render() {
        return `
            <div class="">
                <h2 class="heading1 pageContent">${this.renderIntro()}</h2>
            </div>
        `
    }
}


export default function workshopPageReady(translations) {
    console.log("workshop page ready!")
   
    let workshopData = translations
    if(workshopData) {
        let workshopContent = new WorkshopContent(workshopData)
        let workshops = workshopData.workshops
        workshops.forEach(p => {
            let workshopProject = new Workshops(p)
            workshopProjects.push(workshopProject)
        })    
        $(".workshop .workshopContent").html(workshopContent.render())
        $(".workshop .workshopContent #workshopSideContent").append(workshopContent.renderoverlay())
        
   
    }
    
    /*if (!overlayLoaded) {
        overlayLoaded = true
        workshopOverlay.loadOverlay("workshopOverlay",
            "workshopSideContent",
            "workshopContent",
            "THEMEN & FORMATE")
    }*/
    
}