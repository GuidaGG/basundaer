"use strict"
class Translator {
  constructor(location, file) {
    this._location = location
    this._file = file ? file : location
    this._lang = this.getDefaultLanguage();
    this.translations;
    this._container = document.getElementById(`${location}-translations`);
    
  }

  getDefaultLanguage() {
    let lang = navigator.languages ? navigator.languages[0] : navigator.language;
    let code = lang.substr(0, 2);
    return code === "de" || code === "en" ? code : "de";
  }

  getLanguage() {
    var lang = document.documentElement.lang;
    return lang.substr(0, 2);
  }

  async load(lang = null) {
   
    if (lang) {
      this._lang = lang;  
    }
    else{
      this._lang = this.getLanguage();
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
    if(this._location != "index"){
      this._elements = this._container.querySelectorAll(`[data-i18n]`);
    }
    else{
      this._elements = document.querySelectorAll(`[data-i18n]`);
    }
   
    this._elements.forEach((element) => {
        var keys = element.dataset.i18n.split(".");
        var text = keys.reduce((obj, i) => obj[i], translation);

        if (text) {
          element.innerHTML = text;
        }

    });
  }

  toggleLangTag(newlang) {
    if (document.documentElement.lang !== newlang) {
      document.documentElement.lang = newlang;
    }
  }

}
export default Translator;