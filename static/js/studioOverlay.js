function renderPartners(partners) {
    let result = ""
   partners.forEach((partner) => {

        result += `
           <ul class="partner">
            <li>${partner.name}</li>
            <li>${partner.profession}</li>
            <li><a href="${partner.url}" target="_blank">website</a></li>
           </ul>`
    })
    $(".partners-list").html(result)
}

export default function studioOverlayReady(translations, overlay = true) {
    renderPartners(translations.partners)
}
