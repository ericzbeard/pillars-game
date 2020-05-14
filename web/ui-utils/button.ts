import { Mouseable } from '../ui-utils/mouseable';
import { PillarsConstants } from '../constants';
import { CanvasUtil } from '../canvas-util';

/**
 * A clickable button.
 */
export class Button extends Mouseable {
    constructor(public text:string, private ctx:CanvasRenderingContext2D) {
        super();

        this.render = () => {
            const standardh = 50;
            const scale = this.h / standardh;
            const fontSize = 24 * scale;
            this.ctx.font = `normal normal ${fontSize}px amazonember`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = PillarsConstants.COLOR_WHITEISH;
            this.ctx.fillStyle = '#084B8A';
            if (this.hovering) {
                this.ctx.fillStyle = '#045FB4';
            }
            CanvasUtil.roundRect(this.ctx, this.x, this.y, this.w, this.h, 5, true, true);
            this.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            this.ctx.fillText(this.text, this.x + this.w / 2, this.y + 30 * scale, this.w);
        };

        this.onhover = () => { 
            
        };
    }
}
