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
        this.quotes = new RandomQuote()
        this.quotes.addQuote("Unser Studio ist im Keller einer ehemaligen Konditorei - leider riecht es nicht nach Berliner.")
        this.quotes.addQuote("Innovation erschaffen heißt für einen kurzen Moment die Kontrolle abzugeben.")
        this.quotes.addQuote("Wir machen, fordern und vermitteln Design.")
        this.quotes.addQuote("Wir sind am Start – zur Not auch aus dem Homeoffice und in Jogginghose.")
    }

    open() {
        document.getElementById("quote").innerHTML = this.quotes.getQuote()
        let i = Math.floor(Math.random() * Math.floor(3))
        $(".content")
            .removeClass("color0")
            .removeClass("color1")
            .removeClass("color2")
            .addClass(`color${i}`)
    }
}
