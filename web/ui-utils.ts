import { Card } from '../lambdas/card';
import { GameState } from '../lambdas/game-state';
import { Player } from '../lambdas/player';
import { CanvasUtil } from './canvas-util';
import { PillarsConstants } from './constants';

export class TextUtil {

    /**
     * Wrap text.
     */
    static wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
        maxWidth: number, lineHeight: number) {

        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
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
    render: Function;
    hovering: boolean;
    key: string;

    hitx?: number;
    hity?: number;
    hitw?: number;
    hith?: number;

    constructor() {
        this.zindex = 0;
    }

    /**
     * Check to see if they coordinates overlap.
     */
    hitTest(mx: number, my: number): boolean {
        let hx = this.hitx ?? this.x;
        let hy = this.hity ?? this.y;
        let hw = this.hitw ?? this.w;
        let hh = this.hith ?? this.h;

        const hit =
            mx >= hx &&
            mx <= hx + hw &&
            my >= hy &&
            my <= hy + hh;

        return hit;
    }
}

/**
 * A card.
 */
export class MouseableCard extends Mouseable {

    card: Card;

    constructor(card: Card) {
        super();
        this.card = card;
        this.w = PillarsConstants.CARD_WIDTH;
        this.h = PillarsConstants.CARD_HEIGHT;
    }

    /**
     * Get the key for the info clickable.
     */
    getInfoKey(): string {
        return PillarsConstants.INFO_KEY + '_' + this.card.name;
    }
}

export class PillarsImages {
    static readonly IMG_CREDITS = 'img/credits-100x100.png';
    static readonly IMG_CREATIVITY = 'img/creativity-100x100.png';
    static readonly IMG_TALENT = 'img/talent-100x100.png';
    static readonly IMG_CREDITS_SMALL = 'img/credits-40x50.png';
    static readonly IMG_CREATIVITY_SMALL = 'img/creativity-40x50.png';
    static readonly IMG_TALENT_SMALL = 'img/talent-40x50.png';
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
    static readonly IMG_INFO = 'img/info-80x80.png';
    static readonly IMG_CUSTOMER_GREEN = 'img/customer-green-400x400.png';
    static readonly IMG_CUSTOMER_BLUE = 'img/customer-blue-400x400.png';
    static readonly IMG_CUSTOMER_ORANGE = 'img/customer-orange-400x400.png';
    static readonly IMG_CUSTOMER_YELLOW = 'img/customer-yellow-400x400.png';
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
     * Render a modal dialog that deactivates everything else until it is closed.
     */
    showModal(text: string, href?: string): Modal;

    /**
     * Close the modal.
     */
    closeModal(): any;

    /**
     * Add a mouseable UI element.
     */
    addMouseable(key: string, m: Mouseable): any;

    /**
     * Remove a mouseable UI element.
     */
    removeMouseable(key: string): any;

    /**
     * Render a card.
     */
    renderCard(m: MouseableCard, isPopup?: boolean): any

    /**
     * Initialize the local player's hand or discard pile.
     */
    initHandOrDiscard(isHand: boolean, isModal?: boolean, modalClick?: Function): any

    /**
     * Play a sound.
     */
    playSound(name: string): any;
}

/**
 * A modal dialog.
 */
export class Modal {
    text: string;
    href?: string;
    game: IPillarsGame;

    constructor(game: IPillarsGame, text: string, href?: string) {
        this.game = game;
        this.text = text;
        this.href = href;
    }

    /**
     * Render the button to close the modal at upper right.
     */
    renderCloseButton() {
        const game = this.game;
        const ctx = game.ctx;

        const closew = 50;

        const modalClose = new Mouseable();
        modalClose.x = PillarsConstants.MODALX + PillarsConstants.MODALW - 100;
        modalClose.y = PillarsConstants.MODALY + 10;
        modalClose.w = closew;
        modalClose.h = closew;
        modalClose.zindex = 1000;

        modalClose.render = () => {
            ctx.font = game.getFont(48, 'normal');
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'red';
            if (modalClose.hovering) {
                ctx.font = game.getFont(48, 'bold');
                ctx.strokeStyle = 'red';
            }
            ctx.textAlign = 'center';
            ctx.strokeText('X', modalClose.x + closew / 2, modalClose.y + 40);
            CanvasUtil.roundRect(ctx, modalClose.x, modalClose.y, closew, closew, 5, false, true);
        };

        modalClose.onclick = () => {
            console.log('modalClose.onclick');
            game.closeModal();
        }

        game.addMouseable(PillarsConstants.MODAL_CLOSE_KEY, modalClose);
    }

    /**
     * Render the border and background.
     */
    renderBorder() {
        const game = this.game;
        const ctx = game.ctx;

        ctx.fillStyle = '#0B243B';
        ctx.strokeStyle = PillarsConstants.COLOR_WHITEISH;
        ctx.globalAlpha = 0.98;
        CanvasUtil.roundRect(ctx,
            PillarsConstants.MODALX, PillarsConstants.MODALY,
            PillarsConstants.MODALW, PillarsConstants.MODALH,
            PillarsConstants.MODALR, true, true);
        ctx.globalAlpha = 1;

    }

    /**
     * Render the large title text at the top of the modal.
     */
    renderTitleText() {
        const game = this.game;
        const ctx = game.ctx;

        ctx.font = game.getFont(48, 'normal');
        ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
        ctx.textAlign = 'center';
        TextUtil.wrapText(ctx, this.text,
            PillarsConstants.MODALX + (PillarsConstants.MODALW / 2),
            PillarsConstants.MODALY + 100,
            PillarsConstants.MODALW - 200, 50);

    }

    /**
     * Render the Href at the bottom, if it is defined.
     */
    renderHref() {
        const game = this.game;
        const ctx = game.ctx;

        if (this.href) {
            const hm = new Mouseable();
            const hx = PillarsConstants.MODALX + (PillarsConstants.MODALW / 2);
            const hy = PillarsConstants.MODALY + PillarsConstants.MODALH - 50;
            const tm = ctx.measureText(this.href);
            const hw = tm.width;
            const hh = 40;
            hm.x = hx - hw / 2;
            hm.y = hy - hh;
            hm.w = hw;
            hm.h = hh;
            hm.zindex = PillarsConstants.MODALZ + 1;
            hm.render = () => {
                ctx.font = game.getFont(42, 'normal');
                ctx.fillStyle = 'lightblue';
                ctx.textAlign = 'center';
                ctx.fillText(<string>this.href, hx, hy);
            };
            hm.onclick = () => {
                window.open(this.href);
            };
            game.addMouseable(PillarsConstants.MODAL_HREF_KEY, hm);
        }
    }

    /**
     * Show the modal.
     * 
     * Adds mousables to the game.
     */
    show() {
        const game = this.game;
        const ctx = game.ctx;

        const modalBox = new Mouseable();
        modalBox.x = PillarsConstants.MODALX;
        modalBox.y = PillarsConstants.MODALY;
        modalBox.w = PillarsConstants.MODALW;
        modalBox.h = PillarsConstants.MODALH;
        modalBox.zindex = PillarsConstants.MODALZ;

        modalBox.render = () => {

            // Border
            this.renderBorder();

            // Text
            this.renderTitleText();

            // Href
            this.renderHref();
        };

        game.addMouseable(PillarsConstants.MODAL_KEY, modalBox);

        // Close button
        this.renderCloseButton();
    }

    /**
     * Close the modal.
     */
    close(game: IPillarsGame) {

    }


}

