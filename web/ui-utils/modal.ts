import { IPillarsGame } from "../interfaces/pillars-game";
import { PillarsConstants } from "../constants";
import { Mouseable } from "./mouseable";
import { CanvasUtil } from "../canvas-util";
import { TextUtil } from "./text-util";

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