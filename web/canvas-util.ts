/**
 * HTML Canvas Utility Functions.
 */
export class CanvasUtil {

    /**
     * Draw a rounded rectangle
     */
    static roundRect(ctx:CanvasRenderingContext2D, x: number, y: number, width: number,
        height: number, radius: number, fill: boolean, stroke: boolean, clip?:boolean) {

        ctx.save();
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        const radii = { tl: radius, tr: radius, br: radius, bl: radius };
        ctx.beginPath();
        ctx.moveTo(x + radii.tl, y);
        ctx.lineTo(x + width - radii.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
        ctx.lineTo(x + width, y + height - radii.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
        ctx.lineTo(x + radii.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
        ctx.lineTo(x, y + radii.tl);
        ctx.quadraticCurveTo(x, y, x + radii.tl, y);
        if (clip) {
            ctx.clip();
        } else {
            ctx.closePath();
            if (fill) {
                ctx.fill();
            }
            if (stroke) {
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}