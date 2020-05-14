import { PillarsConstants } from './constants';
import { PillarsSounds } from '../lambdas/sounds';
import { CanvasUtil } from './canvas-util';
import { Xywh } from './ui-utils/xywh';
import { IPillarsGame } from './interfaces/pillars-game';
import { Mouseable } from './ui-utils/mouseable';
import { PillarsImages } from './ui-utils/images';
import { TextUtil } from './ui-utils/text-util';
import { Button } from './ui-utils/button';

const BW = PillarsConstants.MENU_BUTTON_W * 4;
const BH = PillarsConstants.MENU_BUTTON_H * 3;

/**
 * Tutorial modals.
 */
export class Tutorial {

    xywh: Xywh;

    /**
     * Construct an instance with a reference to the game.
     */
    constructor(private game: IPillarsGame) {
        this.xywh = new Xywh(PillarsConstants.MODALX, 
            PillarsConstants.MODALY, PillarsConstants.MODALW, PillarsConstants.MODALH);
    }

    /**
     * Start the tutorial.
     */
    start() {

        const game = this.game;
        const ctx = game.ctx;

        const modal = this.showModal('Welcome to AWS Build!');
        
        const text = 'In this game, you are the newly minted owner of a technology company in the early phases of bringing a new product to market. You have made the wise choice to build your product on Amazon Web Services (AWS). You will have to make critical decisions about the resources that you acquire and employ to build out your company and beat the competition.';
        
        this.addText(text);

        this.addNextButton(() => { this.hand(); });
    }

    /**
     * Halfway x on the modal.
     */
    halfx() {
        return this.xywh.x + this.xywh.w / 2;
    }

    /**
     * Button y
     */
    by() {
        return this.xywh.y + this.xywh.h - 220;
    }

    /**
     * Show the modal.
     */
    showModal(title:string) {

        const game = this.game;
        const ctx = game.ctx;

        game.closeModal();

        const rulesUrl = window.location.href.replace('/play.html', '#rules');
        const modal = game.showModal(title, rulesUrl, this.xywh);
        modal.hideCloseButton();
        game.playSound(PillarsSounds.DING);

        // Peccy!
        const peccy = new Mouseable();
        peccy.x = this.xywh.x + 20;
        peccy.y = this.xywh.y + this.xywh.h - 230;
        peccy.render = () => {
            const img = game.getImg(PillarsImages.IMG_PECCY);
            ctx.drawImage(img, peccy.x, peccy.y, img.width, img.height);
        };
        game.addToModal('peccy', peccy);

        this.addDisableButton();

        return modal;
    }

    /**
     * Add the tutorial text to the modal.
     */
    addText(text:string) {

        const game = this.game;
        const ctx = game.ctx;

        const m = new Mouseable();
        m.x = this.xywh.x + 100;
        m.y = this.xywh.y + 100;
        m.w = this.xywh.w - 200;
        m.h = 600;
        m.render = () => {
            ctx.font = game.getFont(36, 'normal');
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            ctx.textAlign = 'center';
            TextUtil.wrapText(ctx, text,
                m.x + (m.w / 2),
                m.y + 100,
                m.w - 200, 50);
        };
        game.addToModal('text', m);
    }

    /**
     * Add the Next button to the modal.
     */
    addNextButton(onclick: () => any) {
        const next = new Button('Next', this.game.ctx);
        next.x = this.halfx() - (BW + 50)
        next.y = this.by();
        next.w = BW;
        next.h = BH;
        next.onclick = () => {
            this.game.playSound(PillarsSounds.CLICK);
            onclick();
        }
        this.game.addToModal('next', next);
    }

    /**
     * Add the Disable button to the modal.
     */
    addDisableButton() {
        const disable = new Button('Hide Tutorial', this.game.ctx);
        disable.x = this.halfx() + 50;
        disable.y = this.by();
        disable.w = BW;
        disable.h = BH;
        disable.onclick = () => {
            this.game.disableTutorial();
            this.game.closeModal();
        };
        this.game.addToModal('disable', disable);
    }

    /**
     * Highlight the indicated area.
     */
    highlight(x:number, y:number, w:number, h:number) {

        const game = this.game;
        const ctx = game.ctx;

        const m = new Mouseable();
        m.render = () => {

            // Gray out the screen
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, PillarsConstants.BW, PillarsConstants.BH);
            ctx.restore();
            
            // Draw a rect around the area and clip it
            ctx.strokeStyle = 'yellow';
            const pad = 15;

            // Clip
            CanvasUtil.roundRect(ctx, 
                x - pad, y - pad, w + pad * 2, h + pad * 2, 
                15, false, false, true);
            CanvasUtil.roundRect(ctx, 
                x - pad, y - pad, w + pad * 2, h + pad * 2, 
                15, false, true);

            // Clip the area

        };

        this.game.addToModal('highlight', m);
    }

    /**
     * Describe the hand.
     */
    hand() {

        const game = this.game;
        const ctx = game.ctx;

        this.xywh = {x: 500, y: 100, w: 1200, h: 700};

        const modal = this.showModal('Your hand has 6 cards');
        
        const text = 'You start by drawing from the starting deck of 12 cards. All players start with the same deck of basic cards. At the end of each turn, you draw a new hand of 6 cards.';
        
        this.addText(text);

        this.highlight(PillarsConstants.HAND_X, PillarsConstants.HAND_Y, 
            PillarsConstants.HAND_WIDTH, PillarsConstants.CARD_HEIGHT);

        this.addNextButton(() => { this.inplay(); });
    }

    /**
     * Describe the in play area.
     */
    inplay() {
        const game = this.game;
        const ctx = game.ctx;

        const modal = this.showModal('You play cards to the In Play area during your turn');
        
        const text = 'When you play a card, you get the resources on the card and take any of the actions described there. You can play cards from your hand in any order.';
        
        this.addText(text);

        this.addNextButton(() => { this.market(); });
    }

    market() {

    }

    pillars() {

    }

    discard() {

    }

    summaries() {

    }
}