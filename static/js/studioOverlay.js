
function renderDesignUnderstandings(understandings) {
    let result = "";
    understandings.forEach((understand, index) => {
        // Split the description by newline and wrap each part in <p> tags
        const paragraphs = understand.description
            .split("\n")
            .map(sentence => `<p>${sentence}</p>`)
            .join("");

        result += `
            <ul class="understanding">
                <li class="heading1">${String(index+1).padStart(2, '0')}</li>
                <li class="heading heading1">${understand.title}</li>
                <li class="description paragraph">${paragraphs}</li>
            </ul>`;
    });
    $(".design-understandings").html(result);
}

export default function studioOverlayReady(translations, overlay = true) {

    renderDesignUnderstandings(translations.design_understand);
}
