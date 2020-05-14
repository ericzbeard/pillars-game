/**
 * Utility functions for handling text.
 */
export class TextUtil {

    /**
     * Wrap text.
     */
    static wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
        maxWidth: number, lineHeight: number) {

        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }
}
