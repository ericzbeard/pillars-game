import { Card } from '../lambdas/card';
import { GameState } from '../lambdas/game-state';
import { Player } from '../lambdas/player';
import { CanvasUtil } from './canvas-util';
import { PillarsConstants } from './constants';

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
    zindex: number;
    onclick: Function;
    onhover: Function;
    onmousedown: Function;
    onmouseup: Function;
    onmouseover: Function;
    onmouseout: Function;
    draw: Function;
    hovering: boolean;

    /**
     * Width for hit testing can be overridden when we overlap cards.
     */
    hitWidth?: number;

    constructor() {
        this.zindex = 0;
    }

    /**
     * Check to see if they coordinates overlap.
     */
    hitTest(x: number, y: number): boolean {
        let hw = this.w;
        if (this.hitWidth) {
            hw = this.hitWidth;
        }
        const hit = x >= this.x && x <= this.x + hw &&
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
    static readonly CARD_RADIUS = 15;

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
    static readonly IMG_BACK_BLUE = 'img/back-blue-800x1060.png';
    static readonly IMG_BACK_GREEN = 'img/back-green-800x1060.png';
    static readonly IMG_BACK_ORANGE = 'img/back-orange-800x1060.png';
    static readonly IMG_BACK_PINK = 'img/back-pink-800x1060.png';
    static readonly IMG_BLANK_HUMAN_RESOURCE = 'img/Blank-Human-Resource-800x1060.png';
    static readonly IMG_BLANK_ClOUD_RESOURCE = 'img/Blank-Cloud-Resource-800x1060.png';
    static readonly IMG_BLANK_BUG = 'img/Blank-Bug-800x1060.png';
    static readonly IMG_BLANK_ACTION = 'img/Blank-Action-800x1060.png';
    static readonly IMG_BLANK_EVENT = 'img/Blank-Event-800x1060.png';
    static readonly IMG_BLANK_TRIAL = 'img/Blank-Trial-800x1060.png';
    static readonly IMG_BLANK_PILLAR_I = 'img/Blank-Pillar-I-800x1060.png';
    static readonly IMG_BLANK_PILLAR_II = 'img/Blank-Pillar-II-800x1060.png';
    static readonly IMG_BLANK_PILLAR_III = 'img/Blank-Pillar-III-800x1060.png';
    static readonly IMG_BLANK_PILLAR_IV = 'img/Blank-Pillar-IV-800x1060.png';
    static readonly IMG_BLANK_PILLAR_V = 'img/Blank-Pillar-V-800x1060.png';
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

/**
 * Function exports got the main class so other classes can make callbacks.
 */
export interface IPillarsGame {

    /**
     * The canvas context.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * The current state of the game according to the back end.
     */
    gameState: GameState;

    /**
     * The local person playing.
     */
    localPlayer: Player;

    /**
     * Get the default font for ctx.
     */
    getFont(size: number, style?: string): string;

    /**
     * Close the modal.
     */
    closeModal(): any;

    /**
     * Add a mouseable UI element.
     */
    addMouseable(m:Mouseable, key:string):any;
}

/**
 * A modal dialog.
 */
export class Modal {
    text: string;

    constructor(text: string) {
        this.text = text;
    }

    /**
     * Show the modal.
     * 
     * Adds mousables to the game.
     */
    show(game: IPillarsGame) {
        const ctx = game.ctx;

        const modalBox = new Mouseable();
        modalBox.x = PillarsConstants.MODALX;
        modalBox.y = PillarsConstants.MODALY;
        modalBox.w = PillarsConstants.MODALW;
        modalBox.h = PillarsConstants.MODALH;
        modalBox.zindex = 9;

        modalBox.draw = () => {

            // Border
            ctx.fillStyle = 'gray';
            ctx.strokeStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.globalAlpha = 0.9;
            CanvasUtil.roundRect(ctx,
                PillarsConstants.MODALX, PillarsConstants.MODALY,
                PillarsConstants.MODALW, PillarsConstants.MODALH,
                PillarsConstants.MODALR, true, true);
            ctx.globalAlpha = 1;

            // Text
            ctx.font = game.getFont(48, 'bold');
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            ctx.fillText(this.text,
                PillarsConstants.MODALX + (PillarsConstants.MODALW / 2),
                PillarsConstants.MODALY + 100);
        };

        game.addMouseable(modalBox, PillarsConstants.MODAL_KEY);

        // Close button
        const closew = 50;

        const modalClose = new Mouseable();
        modalClose.x = PillarsConstants.MODALX + PillarsConstants.MODALW - 100;
        modalClose.y = PillarsConstants.MODALY + 10;
        modalClose.w = closew;
        modalClose.h = closew;
        modalClose.zindex = 10;

        modalClose.draw = () => {
            ctx.font = game.getFont(48, 'bold');
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            if (modalClose.hovering) {
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'yellow';
            }
            ctx.textAlign = 'center';
            ctx.strokeText('X', modalClose.x + closew/2, modalClose.y + closew);
            CanvasUtil.roundRect(ctx, modalClose.x, modalClose.y, closew, closew, 5, false, true);
        };

        modalClose.onclick = () => {
            game.closeModal();
        }

        game.addMouseable(modalClose, PillarsConstants.MODAL_CLOSE_KEY);
    }
}

