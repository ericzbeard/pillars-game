
/**
 * Used to track the progress of animations.
 */
export class PillarsAnimation {

    /**
     * Time in ms that the animation started.
     */
    timeStarted: number;

    /**
     * Animation percent complete.
     */
    percentComplete: number;

    /**
     * Get the key used to look up the animation.
     */
    getKey() { return ''; }

    /**
     * How much time in ms has elapsed since the animation started.
     */
    getElapsedTime() {
        return new Date().getTime() - this.timeStarted;
    }

    /**
     * Called each time the canvas is drawn. 
     * 
     * This function can actually do the drawing or set variables that 
     * are used in PillarsConstants.draw.
     */
    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) { }
}
