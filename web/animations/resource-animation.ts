import { PillarsAnimation } from "./pillars-animation";
import { PillarsConstants } from "../constants";

/**
 * Animate resource additions.
 */
export class ResourceAnimation extends PillarsAnimation {
    
    constructor(private x:number, private y:number, private img:HTMLImageElement) {
        super();
    }

    static GetKey(x: number, y: number) {
        return `Resource_${x}_${y}_${Math.random()}`;
    }

    getKey() {
        return ResourceAnimation.GetKey(this.x, this.y);
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {

        const elapsed = this.getElapsedTime();
        const end = 1000;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            
            const scale = 1;

            // Move x and y towards the end point
            const endx = PillarsConstants.SUMMARYX;
            const endy = PillarsConstants.SUMMARYY;
            const diffx = this.x - endx;
            const diffy = this.y - endy;
            const curx = this.x - diffx * this.percentComplete;
            const cury = this.y - diffy * this.percentComplete;

            ctx.drawImage(this.img, curx, cury, 
                this.img.width * scale, this.img.height * scale);
        }
    }
}