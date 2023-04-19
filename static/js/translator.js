"use strict"
class Translator {
  constructor(location, file) {
    this._location = location
    this._file = file ? file : location
    this._lang = this.getLanguage();
    this.translations;
    this._container = document.getElementById(`${location}-translations`);
    this._elements = this._container.querySelectorAll(`[data-i18n]`);
  }


  getLanguage() {
    var lang = navigator.languages ? navigator.languages[0] : navigator.language;
    
    return lang.substr(0, 2);
  }

  async load(lang = null) {

    if (lang) {
      this._lang = lang;   
    }
    await fetch(`./data/${this._lang}/${this._file}.json`)
        .then((res) => res.json())
        .then((translation) => {
            this.translations = translation
            this.translate(translation);
        })
        .catch(() => {
            console.error(`./data/${this._lang}/${this._file}.json not found`);
        });
}
returnTranslations(){
    return this._translations
}
translate(translation) {
    this._elements.forEach((element) => {
      console.log(element, this._location)
        var keys = element.dataset.i18n.split(".");
        var text = keys.reduce((obj, i) => obj[i], translation);

        if (text) {
          element.innerHTML = text;
        }

    });
  }

  toggleLangTag() {
    if (document.documentElement.lang !== this._lang) {
      document.documentElement.lang = this._lang;
    }
  }

}
export default Translator;