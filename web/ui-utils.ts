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
export class PillarDieAnimation extends PillarsAnimation {
    playerIndex: number;
    pillarIndex: number;

    constructor() {
        super();
    }

    static GetKey(playerIndex: number, pillarIndex: number) {
        return `Die_${playerIndex}_${pillarIndex}`;
    }

    getKey() {
        return PillarDieAnimation.GetKey(this.playerIndex, this.pillarIndex);
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
 * Animate the die roll for a promotion.
 */
export class DieRollAnimation extends PillarsAnimation {

    constructor(private game: IPillarsGame, 
                private roll:number, 
                private x:number, 
                private y:number, 
                private n:number) {

        super();
    }

    static GetKey(playerIndex: number, n:number) {
        return `DieRoll_${playerIndex}_${n}`;
    }

    getKey() {
        return DieRollAnimation.GetKey(this.game.gameState.currentPlayer.index, this.n);
    }

    /**
     * Render the die being rolled on the modal.
     */
    static RenderDie(game: IPillarsGame, playerIndex: number, rank: number, x:number, y:number) {

        const img = game.getImg(game.getDieName(playerIndex, rank));

        const scale = 2;

        if (img) {
            game.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    /**
     * Render the die being rolled on the modal.
     */
    renderDie(playerIndex: number, rank: number) {
        DieRollAnimation.RenderDie(this.game, playerIndex, rank, this.x, this.y);
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {
        const elapsed = this.getElapsedTime();
        const end = 1000;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            let rank = (elapsed % 6) + 1;

            if (this.percentComplete > 0.9) {
                // Show the final roll at the end of the animation
                rank = this.roll;
            }

            const p = this.game.gameState.currentPlayer;

            this.renderDie(p.index, rank);
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
    ondragenter: Function;
    ondragexit: Function;
    render: Function;
    hovering: boolean;
    key: string;
    draggable: boolean;
    droppable: boolean;
    dragging: boolean;
    dragoffx: number;
    draggoffy: number;
    origx: number;
    origy: number;
    data: any;

    hitx?: number;
    hity?: number;
    hitw?: number;
    hith?: number;

    down: boolean;
    downx: number;
    downy: number;

    constructor() {
        this.zindex = 0;
        this.down = false;
        this.downx = -1;
        this.downy = -1;
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
        return this.key + ' - ' + PillarsConstants.INFO_KEY;
    }
}

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
    static readonly IMG_GEAR = 'img/gear.png';
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
    closeModal(clickedClose?:boolean): any;

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
    renderCard(m: MouseableCard, isPopup?: boolean, scale?:number): any;

    /**
     * Initialize the local player's hand or discard pile.
     */
    initHandOrDiscard(isHand: boolean, isModal?: boolean, 
        modalClick?: Function, hideCard?:Card): any

    /**
     * Play a sound.
     */
    playSound(name: string): any;

    /**
     * Broadcast a change to the game state.
     */
    broadcast(summary: string):any ;

    /**
     * Register a running animation.
     */
    registerAnimation(animation: PillarsAnimation):any;

    /**
     * Get the die name for the player and rank.
     */
    getDieName(i: number, r: number):any;

    /**
     * Get a loaded image. (Does not load the image)
     */
    getImg(name: string): HTMLImageElement;

    /**
     * Resize the canvas according to the window size.
     */
    resizeCanvas():any;

    /**
     * Get an animation by key.
     */
    getAnimation(key:string):PillarsAnimation | undefined;

    /**
     * Put all cards in play and hand into discard pile. Draw 6.
     */
    endTurn():any;

    /**
     * Get the position of the mouse within the canvas.
     * Coordinates are relative to base width and height.
     */
    getMousePos(evt: MouseEvent): any;

    /**
     * Get the position of the touch within the canvas.
     * Coordinates are relative to base width and height.
     */
    getTouchPos(evt: TouchEvent): any;

    /**
     * Load sound files. This can only be done after user input.
     */
    initSounds():any;

    /**
     * Return a z-index sorted array of mouseables.
     */
    sortMouseables(reverse?: boolean): Array<Mouseable>;

    /**
     * Returns true if the mouseable key doesn't belong to the modal dialong
     * and we are currently showing a modal.
     */
    checkModal(key: string): boolean;

    /**
     * After the players finishes choosing custom actions, finish playing the card.
     */
    finishPlayingCard(m: MouseableCard, key: string):any;

    /**
     * Remove all mouesables that start with the specified string.
     */
    removeMouseableKeys(startsWith: string):any;

    /**
     * Return a reference to the canvas.
     */
    getCanvas(): HTMLCanvasElement;

    /**
     * Play a card from the local player's hand.
     */
    playCard(mcard: MouseableCard, callback: Function):any;

    /**
     * Retire a card.
     */
    retireCard(cardToRetire: MouseableCard, callback?:Function):any;

    /**
     * Discard a card.
     * 
     * This is called from modals where the player is choosing a card to retire.
     */
    discard(cardToDiscard: MouseableCard, callback?:Function):any;

    /**
     * Acquire a card from the marketplace.
     */
    acquireCard(card: Card, key: string, free?:boolean, callback?:Function):any;

    /**
     * Get the mousables map.
     */
    getMouseables(): Map<string, Mouseable>;

    /**
     * Respond to chat messages if ai is running.
     */
    respondToChat(chat:string):any;

    /**
     * Returns true if the mouseable key doesn't belong to the modal dialong
     * and we are currently showing a modal.
     */
    checkModal(key: string): boolean;

    /**
     * Done loading images.
     */
    getDoneLoading():boolean;

    /**
     * Put a diagnostic message in the chat.
     */
    diag(msg: string):any;

    /**
     * Promote a pillar rank die.
     */
    promote(playerIndex: number, pillarIndex: number):any;

    /**
     * Get them robots talking.
     */
    startAiChatter():any;

    /**
     * Turn diagnostics on or off.
     */
    toggleDiag():any;

    /**
     * Initialize areas that hold cards.
     */
    initCardAreas():any;

    /**
     * Mute or unmute.
     */
    muteSounds():any;

    /**
     * Load game state from the server.
     */
    loadGameState(callback:Function):any;

    /**
     * Initialize the screen.
     */
    initGameScreen():any;

    /**
     * Play a local game against the AI with no connection to the back end.
     */
    startLocalGame(callback:Function):any;

    /**
     * Get load progress.
     */
    getLoadProgress(): LoadProgress;
}

/**
 * x, y, w, h
 */
export class Xywh {
    constructor(public x:number, 
        public y:number, public w:number, public h:number) {}
}

/**
 * A modal dialog.
 */
export class Modal {

    public x:number;
    public y:number;
    public w:number;
    public h:number;

    constructor(
        private game: IPillarsGame, 
        public text: string, 
        private href?: string) {
        
        this.x = PillarsConstants.MODALX;
        this.y = PillarsConstants.MODALY;
        this.w = PillarsConstants.MODALW;
        this.h = PillarsConstants.MODALH;
    }

    /**
     * Render the button to close the modal at upper right.
     */
    renderCloseButton() {
        const game = this.game;
        const ctx = game.ctx;

        const closew = 50;

        const modalClose = new Mouseable();
        modalClose.x = this.x + this.w - 100;
        modalClose.y = this.y + 10;
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
            game.closeModal(true);
        }

        game.addMouseable(PillarsConstants.MODAL_CLOSE_KEY, modalClose);
    }

    /**
     * Sometimes we don't want the modal to be closed before an action is finished.
     */
    hideCloseButton() {
        this.game.removeMouseable(PillarsConstants.MODAL_CLOSE_KEY);
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
            this.x, this.y,
            this.w, this.h,
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
            this.x + (this.w / 2),
            this.y + 100,
            this.w - 200, 50);

    }

    /**
     * Render the Href at the bottom, if it is defined.
     */
    renderHref() {
        const game = this.game;
        const ctx = game.ctx;

        if (this.href) {
            const hm = new Mouseable();
            const hx = this.x + (this.w / 2);
            const hy = this.y + this.h - 50;
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
        modalBox.x = this.x;
        modalBox.y = this.y;
        modalBox.w = 0; // Don't actually want this to cause mouse events
        modalBox.h = 0;
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



}

/**
 * Signature for the callback function called in initHandOrDiscard.
 */
export type ModalCardClick = (cardToDiscard:MouseableCard) => any;

/**
 * Sound file names.
 */
export class PillarsSounds {
    constructor() {}

    static readonly FAIL = 'gameover.wav';
    static readonly SUCCESS = 'jingle.wav';
    static readonly CLOSE = 'hint.wav';
    static readonly SWOOSH = 'swoosh.wav';
    static readonly CLICK = 'menuselect.wav';
    static readonly PROMOTE = 'promote.wav';
    static readonly DICE = 'dice.wav';
    static readonly DISCARD = 'discard.wav';
    static readonly PLAY = 'play.wav';
    static readonly SHUFFLE = 'shuffle.wav';
    static readonly DING = 'ding.wav';

}

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