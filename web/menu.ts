import { MouseableCard, IPillarsGame } from './ui-utils';
import { Button } from './ui-utils';
import { PillarsSounds } from './ui-utils';
import { PillarsConstants } from './constants';
import { Trial } from './trial';

/**
 * Menu buttons.
 */
export class PillarsMenu {

    constructor(private game: IPillarsGame) { }

    /**
     * Show the menu.
     */
    show() {

        // const button = new Mouseable();
        // button.x = PillarsConstants.BW - 60;
        // button.y = 10;
        // button.w = PillarsConstants.MENU_BUTTON_W;
        // button.h = PillarsConstants.MENU_BUTTON_H;
        // button.render = () => {
        //     const img = this.getImg(PillarsImages.IMG_GEAR);
        //     if (img) {
        //         this.game.ctx.drawImage(img, button.x, button.y, 50, 50);
        //     }
        // };
        // button.onclick = () => {

        //     this.showModal('Menu');

        // A button
        this.initTestButton();

        // Retired cards
        this.initRetiredButton();

        // Robots
        this.initRobotsButton();

        // Button to go to trial and end the turn
        this.initTrialButton();

        // Rules
        this.initRulesButton();

        // Free Stuff (for testing)
        this.initFreeButton();

        // Diagnostics
        this.initDiagButton();

        // Mute
        this.initMuteButton();
        
        // };
        // this.addMouseable('manubutton', button);
    }

    /**
     * Show the rules.
     */
    initRulesButton() {
        const button = new Button('Rules', this.game.ctx);
        button.x = PillarsConstants.MENUX + 10;
        button.y = PillarsConstants.MENUY;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();
            window.open('index.html#rules', '_new');
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_rulesbutton', button);
    }

    /**
     * Initialize the button I use for testing things.
     */
    initTestButton() {
        const button = new Button('Test', this.game.ctx);
        button.x = PillarsConstants.MENUX + 10;
        button.y = PillarsConstants.MENUY + 80;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = PillarsConstants.MODALZ + 1;
        button.onclick = () => {
            this.game.closeModal();
            this.game.playSound(PillarsSounds.CLICK);
            this.game.promote(0, 0);
            this.game.promote(0, 1);
            this.game.promote(0, 2);
            this.game.promote(0, 3);
            this.game.promote(0, 4);
            if (!this.game.gameState.drawOne(this.game.localPlayer)) {
                this.game.endTurn();
            }
            this.game.initCardAreas();
            this.game.localPlayer.numCustomers++;
            this.game.resizeCanvas();
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_testbutton', button);
    }

    /**
     * Unleash the robot revolution.
     */
    initRobotsButton() {

        const button = new Button('Robots!', this.game.ctx);
        button.x = PillarsConstants.MENUX + PillarsConstants.MENU_BUTTON_W + 20;
        button.y = PillarsConstants.MENUY + 80;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();
            this.game.startAiChatter();
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_robotsbutton', button);

    }

    /**
     * Initialize the button to show retired cards.
     */
    initRetiredButton() {
        const button = new Button('Retired', this.game.ctx);
        button.x = PillarsConstants.MENUX + PillarsConstants.MENU_BUTTON_W + 20;
        button.y = PillarsConstants.MENUY;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();

            const modal = this.game.showModal("Retired Cards");

            let cards = this.game.gameState.retiredCards;

            let len = cards.length;
            if (len == 0) {
                len = 1;
            }

            let x = PillarsConstants.MODALX + 200;
            let y = PillarsConstants.MODALY + 300;
            let w = PillarsConstants.MODALW - 300;

            const cardOffset = (w - PillarsConstants.CARD_WIDTH) / len;

            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const m = new MouseableCard(card);
                m.x = x + 10 + (i * cardOffset);
                m.y = y;
                m.origx = m.x;
                m.origy = m.y;
                m.zindex = i + 1;
                m.zindex = PillarsConstants.MODALZ + 1;
                m.render = () => {
                    this.game.renderCard(m);
                };
                this.game.addMouseable(PillarsConstants.MODAL_KEY + i, m);
                this.game.resizeCanvas();
            }

        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_retired_button', button);
    }


    /**
     * Free resources, for testing.
     */
    initFreeButton() {
        const self = this;
        const button = new Button('Free Stuff', this.game.ctx);
        button.x = PillarsConstants.MENUX + 10;
        button.y = PillarsConstants.MENUY + 40;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();
            this.game.localPlayer.numCreativity = 10;
            this.game.localPlayer.numTalents = 10;
            this.game.localPlayer.numCredits = 10;
            this.game.initCardAreas();
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_freebutton', button);

    }

    /**
     * Diagnostics.
     */
    initDiagButton() {
        const self = this;
        const button = new Button('Diagnostics', this.game.ctx);
        button.x = PillarsConstants.MENUX + PillarsConstants.MENU_BUTTON_W + 20;
        button.y = PillarsConstants.MENUY + 40;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();
            this.game.toggleDiag();
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_diagbutton', button);

    }

    /**
     * Initialize the trial button.
     */
    initTrialButton() {
        const button = new Button('End Turn', this.game.ctx);
        button.x = PillarsConstants.MENUX + 10;
        button.y = PillarsConstants.MENUY + 200;
        button.w = PillarsConstants.MENU_BUTTON_W * 2;
        button.h = PillarsConstants.MENU_BUTTON_H * 2;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();
            const t = new Trial(this.game);
            t.show();
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_trialbutton', button);
    }

    
    /**
     * Free resources, for testing.
     */
    initMuteButton() {
        const self = this;
        const button = new Button('Mute', this.game.ctx);
        button.x = PillarsConstants.MENUX + 10;
        button.y = PillarsConstants.MENUY + 120;
        button.w = PillarsConstants.MENU_BUTTON_W;
        button.h = PillarsConstants.MENU_BUTTON_H;
        button.zindex = 1;
        button.onclick = () => {
            this.game.closeModal();
            this.game.muteSounds();
        };
        this.game.addMouseable(PillarsConstants.MENU_KEY + '_mutebutton', button);

    }


}