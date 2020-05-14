
/**
 * Progress of loading resources like images.
 */
export class LoadProgress {
    numImages:number;
    numImagesLoaded: number;

    constructor() {
        this.numImages = 0;
        this.numImagesLoaded = 0;
    }
}
