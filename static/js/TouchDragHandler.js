/**
 * A handler for detecting drag/swipe gestures on a target
 */
export default class TouchDragHandler {

    /**
     * Constructor
     * @param {Object} touchTarget - The element the touch events are recognized on.
     * @param {Object} draggable - The element that shall be dragged.
     * @param {function} dragLeftCallback - Executed when a drag left gesture is recognized.
     * @param {function} dragRightCallback - Executed when a drag right gesture is recognized.
     * @param {number} [transition] - The duration of the draggable to move into the target position after the
     * @param {function} dragNoneCallback - Executed when a touchend event is received before the minimal distance was dragged.
     * @param {function} [dragLeftCancelledCallback] - Executed when a drag left gesture is cancelled before the minimum drag distance was reached.
     * @param {function} [dragRightCancelledCallback] - Executed when a drag right gesture is cancelled before the minimum drag distance was reached.
     */
    constructor(touchTarget,
                draggable,
                dragLeftCallback,
                dragRightCallback,
                transition = 300,
                dragNoneCallback = null,
                dragLeftCancelledCallback = null,
                dragRightCancelledCallback = null) {
        this._touchTarget = touchTarget
        this.$draggable = $(draggable)
        this._isDragging = false
        this._firstTouch = null
        this._firstPosition = null
        this._currentDragDistance = 0
        this._recognizeDragGestureThreshold = 5
        this._minimalDragDistance = 40;
        this._dragLeftCB = dragLeftCallback
        this._dragLeftCancelledCB = dragLeftCancelledCallback
        this._dragRightCB = dragRightCallback
        this._dragRightCancelledCB = dragRightCancelledCallback
        this._dragNoneCB = dragNoneCallback
        this._transition = transition
        this._touchCount = 0

        this._touchTarget.addEventListener("touchstart", this.handleTouchStart.bind(this))
        this._touchTarget.addEventListener("touchmove", this.handleTouchMove.bind(this))
        this._touchTarget.addEventListener("touchend", this.handleTouchEnd.bind(this))
        this._touchTarget.addEventListener("touchcancel", this.handleTouchCancelled.bind(this))
    }

    /**
     * Moves the draggable back to it's initial position
     */
    dragCancelled() {
        this.$draggable.animate({left: this._firstPosition.left}, this._transition)
    }

    handleTouchStart(event) {
        this.$draggable.css("transition", "none")
        this._firstTouch = event.touches[0]
        this._firstPosition = this.$draggable.offset()
        this._touchCount++
    }

    handleTouchMove(event) {
        this._touchCount++

            if(!this._firstTouch) {
                return
            }
            let currentTouch = event.touches[0]
            let distance = currentTouch.clientX - this._firstTouch.clientX


            if(!this._isDragging && Math.abs(distance) > this._recognizeDragGestureThreshold) {
                this._isDragging = true
                event.preventDefault()
            }

            this._currentDragDistance = distance

            if(this._isDragging) {
                let newPos = {top: this.$draggable.top, left: this._firstPosition.left + distance}
                this.$draggable.offset(newPos)
            }
        
    }

    handleTouchEnd(event) {
        event.preventDefault()

            this.$draggable.css("transition", `left ${this._transition}ms ease-out`)
            if(!this._isDragging) {
                if (this._dragNoneCB) {
                    this._dragNoneCB()
                }
                this.resetTouch()
                return
            }


            this._minimalDragDistance = 40;
            if(this._currentDragDistance < 0) {
                if(Math.abs(this._currentDragDistance) > this._minimalDragDistance) {
                    this._dragLeftCB()
                }
                else {
                    this._dragLeftCancelledCB ? this._dragLeftCancelledCB() : this.dragCancelled()
                }
            }
            else {
                if(Math.abs(this._currentDragDistance) > this._minimalDragDistance) {
                    this._dragRightCB()
                }
                else {
                    this._dragRightCancelledCB ? this._dragRightCancelledCB() : this.dragCancelled()
                }
            }

       
        this.resetTouch()
    }

    handleTouchCancelled(event) {
        event.preventDefault()
        this.resetTouch()
    }

    resetTouch() {
        this._firstTouch = null
        this._isDragging = false
        this._touchCount = 0
    }
}