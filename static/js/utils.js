export const LARGE = "large"
export const MEDIUM = "medium"
export const SMALL = "small"

export function normalizeID(id) {
    return id.split(" ").join("_").split('.').join('_').split('&').join('u')
}

export default function getMediaMatch() {
    if (window.matchMedia('(min-width: 1201px)').matches) {
        return LARGE
    }
    if (window.matchMedia('(max-width: 1200px) and (min-width: 601px) and (orientation: portrait)').matches) {
        return MEDIUM
    }
    if (window.matchMedia('(max-width: 1200px) and (min-width: 601px) and (orientation: landscape)').matches) {
        return MEDIUM
    }
    if (window.matchMedia('(max-width: 600px)').matches) {
        return SMALL
    }
}

