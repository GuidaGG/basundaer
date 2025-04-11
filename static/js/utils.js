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


export function shuffle(array){
    //   set the index to the arrays length
      let i = array.length, j, temp;
    //   create a loop that subtracts everytime it iterates through
      while (--i > 0) {
    //  create a random number and store it in a variable
      j = Math.floor(Math.random () * (i+1));
    // create a temporary position from the item of the random number    
      temp = array[j];
    // swap the temp with the position of the last item in the array    
      array[j] = array[i];
    // swap the last item with the position of the random number 
      array[i] = temp;
      }
    // return the shuffled array
      return array;
}
