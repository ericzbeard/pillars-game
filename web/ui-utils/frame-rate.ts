/**
 * Calculate the frame rate for the canvas.
 */
export class FrameRate {
    static delta = 0;
    static lastTime = (new Date()).getTime();
    static frames = 0;
    static totalTime = 0;
    static updateTime = 0;
    static updateFrames = 0;
    static avg = 0;
    static cur = 0;

    static update() {
        const now = (new Date()).getTime();
        FrameRate.delta = now - FrameRate.lastTime;
        FrameRate.lastTime = now;
        FrameRate.totalTime += FrameRate.delta;
        FrameRate.frames++;
        FrameRate.updateTime += FrameRate.delta;
        FrameRate.updateFrames++;
        if (FrameRate.updateTime > 1000) {
            FrameRate.avg = (1000 * FrameRate.frames / FrameRate.totalTime);
            FrameRate.cur = (1000 * FrameRate.updateFrames / FrameRate.updateTime);
            FrameRate.updateTime = 0;
            FrameRate.updateFrames = 0;
        }
    }
}