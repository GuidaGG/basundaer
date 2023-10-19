

class RandomQuote {
    constructor() {
        this.quotes = []
        this.index = 0
    }

    addQuote(quote) {
        this.quotes.push(quote)
        this.index = Math.floor(Math.random() * Math.floor(this.quotes.length))
    }

    getQuote() {
        let quote = this.quotes ? this.quotes[this.index] : ""
        this.index = (this.index + 1) % this.quotes.length
        return quote
    }
}

export default class Footer {
    constructor() {
        this.quotes = new RandomQuote();
        this.loadQuotes();
        
    }
    getDefaultLanguage(_lang ) {
        let lang = _lang ? _lang : navigator.languages ? navigator.languages[0] : navigator.language;
        let code = lang.substr(0, 2);
        return code === "de" || code === "en" ? code : "de";

    }
    loadQuotes(_lang) {
        let code = this.getDefaultLanguage(_lang)
        if(code === "en") {   
            this.quotes.addQuote("Our studio is in the basement of a former pastry shop - unfortunately, it doesn't smell like Berliners.");
            this.quotes.addQuote("Creating innovation means relinquishing control for a brief moment.");
            this.quotes.addQuote("We create, challenge, and communicate design.");
            this.quotes.addQuote("We are ready to go - even from home office and in sweatpants if necessary.");
        }
        else{
            this.quotes.addQuote("Unser Studio ist im Keller einer ehemaligen Konditorei - leider riecht es nicht nach Berliner.")
            this.quotes.addQuote("Innovation erschaffen heißt für einen kurzen Moment die Kontrolle abzugeben.")
            this.quotes.addQuote("Wir machen, fordern und vermitteln Design.")
            this.quotes.addQuote("Wir sind am Start – zur Not auch aus dem Homeoffice und in Jogginghose.")  
        }
    }
    loadtranslations(evt) {
        if (evt.target.tagName === "INPUT") {
            let lang = evt.target.value;
            this.quotes = new RandomQuote();
            this.loadQuotes(lang);
            this.open()
        }
    }

    open() {

        document.getElementById("quote").innerHTML = this.quotes.getQuote()
        let i = Math.floor(Math.random() * Math.floor(3))
        document.querySelector("form").removeEventListener("click", this.loadtranslations)
        document.querySelector("form").addEventListener("click", (event) => this.loadtranslations(event, this.quotes)
        )
        $(".content")
            .removeClass("color0")
            .removeClass("color1")
            .removeClass("color2")
            .addClass(`color${i}`)
    }
}

