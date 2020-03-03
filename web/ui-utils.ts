import { Card } from '../lambdas/card';

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
     * are used in PillarsGame.draw.
     */
    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) { }
}

/**
 * A die animation. Highlight the die when it changes.
 */
export class DieAnimation extends PillarsAnimation {
    playerIndex: number;
    pillarIndex: number;

    constructor() {
        super();
    }

    static GetKey(playerIndex: number, pillarIndex: number) {
        return `Die_${playerIndex}_${pillarIndex}`;
    }

    getKey() {
        return DieAnimation.GetKey(this.playerIndex, this.pillarIndex);
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {
        const elapsed = this.getElapsedTime();
        const end = 1000;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;

            // Animation happens in draw()
        }
    }
}

/**
 * Animate mouse clicks.
 */
export class ClickAnimation extends PillarsAnimation {
    x: number;
    y: number;

    static GetKey(x: number, y: number) {
        return `Click_${x}_${y}`;
    }

    getKey() {
        return ClickAnimation.GetKey(this.x, this.y);
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {
        const elapsed = this.getElapsedTime();
        const end = 200;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            const radius = 15 * this.percentComplete;
            ctx.fillStyle = "#336699";
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

/**
 * An area that can be interacted with by the mouse.
 */
export class Mouseable {
    x: number;
    y: number;
    w: number;
    h: number;
    onclick: Function;
    onhover: Function;
    onmousedown: Function;
    onmouseup: Function;
    onmouseover: Function;
    onmouseout: Function;
    draw: Function;
    hovering: boolean;

    constructor() {

    }

    /**
     * Check to see if they coordinates overlap.
     */
    hitTest(x: number, y: number): boolean {
        const hit = x >= this.x && x <= this.x + this.w &&
            y >= this.y && y <= this.y + this.h;
        return hit;
    }
}

/**
 * A card.
 */
export class MouseableCard extends Mouseable {

    static readonly CARD_WIDTH = 172;
    static readonly CARD_HEIGHT = 237;
    static readonly CARD_RADIUS = 20;

    card: Card;

    constructor(card: Card) {
        super();
        this.card = card;
        this.w = MouseableCard.CARD_WIDTH;
        this.h = MouseableCard.CARD_HEIGHT;
    }
}

export class PillarsImages {
    static readonly IMG_CREDITS = 'img/credits-100x100.png';
    static readonly IMG_CREATIVITY = 'img/creativity-100x100.png';
    static readonly IMG_TALENT = 'img/talent-100x100.png';
    static readonly IMG_LOGO = 'img/logo.png';
    static readonly IMG_BG = 'img/bg.png';
    static readonly IMG_BACK_BLUE = 'img/back-blue-200x265.png';
    static readonly IMG_BACK_GREEN = 'img/back-green-200x265.png';
    static readonly IMG_BACK_ORANGE = 'img/back-orange-200x265.png';
    static readonly IMG_BACK_PINK = 'img/back-pink-200x265.png';
}

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
        var now = (new Date()).getTime();
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
