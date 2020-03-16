import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsConfig } from '../config/pillars-config';
import { MouseableCard, Mouseable, IPillarsGame } from './ui-utils';
import { PillarsImages, PillarsAnimation, Modal, ClickAnimation } from './ui-utils';
import { DieAnimation, FrameRate, TextUtil } from './ui-utils';
import { LocalGame } from './local-game';
import { CardActions } from './card-actions';
import { PillarsConstants } from './constants';

/**
 * Pillars game  Initialized from index.html.
 */
class PillarsGame implements IPillarsGame {

    /**
     * The canvas we're drawing on.
     */
    gameCanvas: HTMLCanvasElement;

    /**
     * The canvas context.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * Current mouse x, relative to base width and height.
     */
    mx: number;

    /**
     * Current mouse x, relative to base width and height.
     */
    my: number;

    /**
     * Image files.
     */
    images: Map<string, HTMLImageElement>;

    /**
     * The current state of the game according to the back end.
     */
    gameState: GameState;

    /**
     * True when we are ready to draw after loading images.
     */
    isDoneLoading: boolean = false;

    /**
     * Keeps track of loaded images.
     */
    loadedImages: Map<string, boolean>;

    /**
     * Dice colors. 
     */
    playerDiceColors: Array<string>;

    /**
     * Currently running animations.
     */
    animations: Map<string, PillarsAnimation>;

    /**
     * Interactive regions.
     */
    mouseables: Map<string, Mouseable>;

    /**
     * Sound files. (Using howler)
     */
    sounds: Map<string, Howl>;

    /**
     * The local person playing.
     */
    localPlayer: Player;

    /**
     * If non-null, we are showing a modal dialog.
     */
    modal?: Modal;

    /**
     * Chat entered by local player.
     */
    typing: string;

    /**
     * True if a card is being dragged by the mouse.
     */
    dragging:boolean;

    /**
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

        this.animations = new Map<string, PillarsAnimation>();
        this.mouseables = new Map<string, Mouseable>();
        this.sounds = new Map<string, Howl>();
        this.images = new Map<string, HTMLImageElement>();
        this.dragging = false;

        this.typing = '';

        this.playerDiceColors = [];
        this.playerDiceColors[0] = 'orange';
        this.playerDiceColors[1] = 'blue';
        this.playerDiceColors[2] = 'green';
        this.playerDiceColors[3] = 'yellow';

        this.loadedImages = new Map<string, boolean>();

        this.loadGameState();

        const cel = document.getElementById('gameCanvas');
        if (cel) {
            this.gameCanvas = <HTMLCanvasElement>cel;
        } else {
            throw new Error('No canvas');
        }

        const el = this.gameCanvas.getContext('2d');
        if (el) {
            this.ctx = el;
        } else {
            throw new Error('No context');
        }

        this.mx = 0;
        this.my = 0;

        const imageNames = [
            PillarsImages.IMG_CREDITS,
            PillarsImages.IMG_CREATIVITY,
            PillarsImages.IMG_TALENT,
            PillarsImages.IMG_CREDITS_SMALL,
            PillarsImages.IMG_CREATIVITY_SMALL,
            PillarsImages.IMG_TALENT_SMALL,
            PillarsImages.IMG_LOGO,
            PillarsImages.IMG_BG,
            PillarsImages.IMG_BACK_GREEN,
            PillarsImages.IMG_BACK_ORANGE,
            PillarsImages.IMG_BACK_PINK,
            PillarsImages.IMG_BACK_BLUE,
            PillarsImages.IMG_BLANK_ClOUD_RESOURCE,
            PillarsImages.IMG_BLANK_HUMAN_RESOURCE,
            PillarsImages.IMG_BLANK_BUG,
            PillarsImages.IMG_BLANK_ACTION,
            PillarsImages.IMG_BLANK_EVENT,
            PillarsImages.IMG_BLANK_TRIAL,
            PillarsImages.IMG_BLANK_PILLAR_I,
            PillarsImages.IMG_BLANK_PILLAR_II,
            PillarsImages.IMG_BLANK_PILLAR_III,
            PillarsImages.IMG_BLANK_PILLAR_IV,
            PillarsImages.IMG_BLANK_PILLAR_V,
            PillarsImages.IMG_INFO,
            PillarsImages.IMG_CUSTOMER_GREEN,
            PillarsImages.IMG_CUSTOMER_BLUE,
            PillarsImages.IMG_CUSTOMER_YELLOW,
            PillarsImages.IMG_CUSTOMER_ORANGE,
        ];

        // Add dice image names
        for (let i = 0; i < this.playerDiceColors.length; i++) {
            for (let j = 1; j < 7; j++) {
                const dieName = this.getDieName(i, j);
                imageNames.push(dieName);
            }
        }

        // Load images
        for (let i = 0; i < imageNames.length; i++) {
            this.loadImg(imageNames[i]);
        }

        // Wait for images to load
        setTimeout(function (e) {
            self.checkImagesLoaded.call(self);
        }, 100);

        // Listen to mouse moves
        self.gameCanvas.addEventListener('mousemove', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.handleMouseMove.call(self, e);
        });

        // Listen to mouse ups
        self.gameCanvas.addEventListener('mouseup', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.handleMouseUp.call(self, e);
        });

        // Listen to mouse downs
        self.gameCanvas.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.handleMouseDown.call(self, e);
        });

        // Listen for clicks
        self.gameCanvas.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.handleClick.call(self, e);
        });

        // Listen for double clicks
        self.gameCanvas.addEventListener('dblclick', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.handleDoubleClick.call(self, e);
        });

        // Listen for keyboard input
        window.addEventListener('keydown', function (e) {
            self.handleKeyDown.call(self, e);
        });

        // A button
        this.initTestButton();

        // Hand
        this.initHand();

        // Discard
        this.initDiscard();

        // Pillars
        this.initPillars();

        // Market
        this.initMarket();

        // In Play
        this.initInPlay();

        // Re-draw everthing at least a few times per second
        setInterval(() => {
            this.resizeCanvas();
        }, 250);
    }

    /**
     * Initialize buttons I use for testing things.
     */
    initTestButton() {
        const self = this;

        const button = new Mouseable();
        button.x = PillarsConstants.DICEX - 80;
        button.y = PillarsConstants.DICEY + 120;
        button.w = 50;
        button.h = 30;
        button.onclick = function () {
            self.playSound('menuselect.wav');
            self.promote(0, 0);
            self.roll(2);
            if (!self.gameState.drawOne(self.localPlayer)) {
                self.gameState.endTurn();
            }
            self.initHand();
            self.initDiscard();
            //self.showModal('This is a test');
            self.localPlayer.numCustomers++;
        };
        button.render = function () {
            self.ctx.strokeStyle = 'black';
            self.ctx.fillStyle = 'lightgray';
            if (button.hovering) {
                self.ctx.fillStyle = 'blue';
            }
            CanvasUtil.roundRect(self.ctx, button.x, button.y, button.w, button.h,
                5, true, true);
        };
        this.addMouseable('testbutton', button);


        const trialButton = new Mouseable();
        trialButton.x = PillarsConstants.DICEX + 20;
        trialButton.y = PillarsConstants.DICEY + 120;
        trialButton.w = 50;
        trialButton.h = 30;
        trialButton.onclick = () => {
            this.initTrials();
        };
        trialButton.render = function () {
            self.ctx.strokeStyle = 'black';
            self.ctx.fillStyle = 'orange';
            if (trialButton.hovering) {
                self.ctx.fillStyle = 'blue';
            }
            CanvasUtil.roundRect(self.ctx, trialButton.x, trialButton.y,
                trialButton.w, trialButton.h,
                5, true, true);
        };
        this.addMouseable('trialbutton', trialButton);
    }

    /**
     * Remove all mouesables that start with the specified string.
     */
    removeMouseableKeys(startsWith: string) {
        const remove = [];
        for (const k of this.mouseables.keys()) {
            if (k.startsWith(startsWith)) {
                remove.push(k);
            }
        }
        for (const k of remove) {
            this.mouseables.delete(k);
        }
    }

    /**
     * Draw the static parts of the player's deck, hand, and discard pile.
     */
    initPlayerDeck() {

        const ctx = this.ctx;

        // Draw the big card placeholder in the center
        this.renderCardImage(PillarsImages.IMG_BACK_BLUE,
            PillarsConstants.BIGCARDX, PillarsConstants.BIGCARDY, PillarsConstants.POPUP_SCALE);

        // Deck Label
        ctx.save();
        ctx.translate(30, PillarsConstants.HAND_Y + 100);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = this.getFont(24, 'bold');
        ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
        ctx.fillText(`Deck (${this.localPlayer.deck.length})`, 0, 0);
        ctx.restore();

        // Draw the deck if it has any cards in it
        if (this.localPlayer.deck.length > 0) {
            this.renderCardImage(PillarsImages.IMG_BACK_BLUE, 45, PillarsConstants.BH - 250);
            if (this.localPlayer.deck.length > 1) {
                this.renderCardImage(PillarsImages.IMG_BACK_BLUE, 50, PillarsConstants.BH - 255);
            }
        } else {
            CanvasUtil.roundRect(this.ctx, 45, PillarsConstants.BH - 250,
                PillarsConstants.CARD_WIDTH, PillarsConstants.CARD_HEIGHT,
                PillarsConstants.CARD_RADIUS, false, true);
        }

        // Hand label
        ctx.save();
        ctx.translate(PillarsConstants.HAND_X - 5, PillarsConstants.HAND_Y + 100);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = this.getFont(24, 'bold');
        ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
        ctx.fillText(`Hand (${this.localPlayer.hand.length})`, 0, 0);
        ctx.restore();

        ctx.fillStyle = 'green';
        CanvasUtil.roundRect(this.ctx, PillarsConstants.HAND_X, PillarsConstants.HAND_Y - 5,
            PillarsConstants.HAND_WIDTH + 10, 250, 10, true, true);

        // Discard label
        ctx.save();
        ctx.translate(PillarsConstants.DISCARD_X - 5, PillarsConstants.DISCARD_Y + 100);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = this.getFont(24, 'bold');
        ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
        ctx.fillText(`Discard (${this.localPlayer.discardPile.length})`, 0, 0);
        ctx.restore();

    }

    /**
     * Initialize the local player's hand.
     */
    initHand() {
        this.initHandOrDiscard(true);
    }

    /**
     * Initialize the local player's discard pile.
     */
    initDiscard() {

        // Discard area needs to be mouseable
        const discard = new Mouseable();
        discard.x = PillarsConstants.DISCARD_X;
        discard.y = PillarsConstants.DISCARD_Y - 5;
        discard.w = PillarsConstants.HAND_WIDTH + 10;
        discard.h = 250;
        discard.zindex = 0;
        discard.droppable = true;

        discard.render = () => {
            this.ctx.fillStyle = 'green';
            CanvasUtil.roundRect(this.ctx, PillarsConstants.DISCARD_X, PillarsConstants.DISCARD_Y - 5, PillarsConstants.HAND_WIDTH + 10, 250, 10, true, true);
        };

        this.addMouseable(PillarsConstants.DISCARD_AREA_KEY, discard);

        this.initHandOrDiscard(false);
    }

    /**
     * Initialize the local player's hand or discard pile.
     */
    initHandOrDiscard(isHand: boolean, isModal?: boolean, modalClick?: Function): any {

        let startKey = PillarsConstants.HAND_START_KEY;
        let hoverKey = PillarsConstants.HAND_HOVER_KEY;
        let x = PillarsConstants.HAND_X;
        let y = PillarsConstants.HAND_Y;
        let cards = this.localPlayer.hand;

        if (!isHand) {
            startKey = PillarsConstants.DISCARD_START_KEY;
            hoverKey = PillarsConstants.DISCARD_HOVER_KEY;
            x = PillarsConstants.DISCARD_X;
            y = PillarsConstants.DISCARD_Y;
            cards = this.localPlayer.discardPile;
        }

        if (isModal === true) {
            // We are drawing a copy of the hand/discard on a modal popup
            startKey = PillarsConstants.MODAL_KEY + '_' + startKey;
            hoverKey = PillarsConstants.MODAL_KEY + '_' + hoverKey;
            x = PillarsConstants.MODALX + 200;
            y = PillarsConstants.MODALY + 300;
        }

        // Every time we change the source, remove all the mouseables
        this.removeMouseableKeys(startKey);
        this.removeMouseableKeys(hoverKey);

        // Space the cards out evenly
        let len = cards.length;
        if (len == 0) {
            len = 1;
        }

        let w = PillarsConstants.HAND_WIDTH
        if (isModal === true) {
            w = PillarsConstants.MODALW - 300;
        }

        const cardOffset = (w - PillarsConstants.CARD_WIDTH) / len;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const m = new MouseableCard(card);
            m.x = x + 10 + (i * cardOffset);
            m.y = y;
            m.origx = m.x;
            m.origy = m.y;
            m.zindex = i + 1;
            if (isHand && this.gameState.canPlayCard(m.card)) {
                m.draggable = true;
            }
            if (isModal === true) {
                m.zindex += PillarsConstants.MODALZ;
            }
            this.addMouseable(startKey + i, m);

            // Well... now our mouseover areas are all wrong...
            // Figure out the overlaps and change the mouseable areas.
            // TODO - This shouldn;t be necessary with zindex ordering.
            for (const [k, v] of this.mouseables.entries()) {
                if (k.startsWith(startKey) && k != (startKey + i)) {
                    v.hitw = cardOffset;
                }
            }

            const hk = hoverKey + i;

            m.onmouseout = () => {
                this.mouseables.delete(hk);
            };

            // Draw a second copy unobstructed when hovering
            const hoverOrClick = () => {
                const h = new MouseableCard(card);
                h.x = m.x;
                h.y = m.y;
                this.addMouseable(hk, h);
                h.render = () => {
                    this.renderCard(h, true);
                }
            };

            if (isModal === true) {
                // Select the card
                if (modalClick) {
                    m.onclick = modalClick;
                } else {
                    throw Error(`${card.name} missing modal click`);
                }
            } else {
                m.onhover = hoverOrClick;
                m.onclick = () => {
                    hoverOrClick();
                }
            }

            m.render = () => {
                this.renderCard(m);
            };

            this.resizeCanvas();
        }
    }

    /**
     * Initialize the pillars.
     */
    initPillars() {
        for (let i = 0; i < this.gameState.pillars.length; i++) {
            const pillar = this.gameState.pillars[i];
            const m = new MouseableCard(this.gameState.pillars[i]);
            m.x = PillarsConstants.PILLARX;
            const offset = i * (PillarsConstants.CARD_HEIGHT * PillarsConstants.PILLAR_SCALE + 5);
            m.y = PillarsConstants.PILLARY + offset;
            m.render = () => {
                this.renderCard(m);
            }
            this.addMouseable('pillar_' + i, m);
        }

    }

    /**
     * Initialize the market after each change.
     */
    initMarket() {

        // Every time we change the market, remove all the mouseables start over
        this.removeMouseableKeys(PillarsConstants.MARKET_START_KEY);

        let marketx = PillarsConstants.MARKETX;
        let curx = marketx + 210;
        let cw = 185;
        let markety = PillarsConstants.MARKETY + 10;

        this.gameState.refillMarket();

        const p = this.localPlayer;

        for (let i = 0; i < this.gameState.currentMarket.length; i++) {
            const card = this.gameState.currentMarket[i];
            if (i == 3) {
                // 2nd row
                markety += 260;
                curx = marketx + 25;
            }
            if (card) {
                this.initHoverCard(card, curx, markety,
                    PillarsConstants.MARKET_START_KEY,
                    PillarsConstants.MARKET_HOVER_KEY,
                    i, 
                    card.canAcquire(p.numCredits, p.numTalents));
            }
            curx += cw;
        }

        this.resizeCanvas();
    }

    /**
     * Draw the visible trial.
     */
    initTrials() {

        this.showModal("Time to face a trial!");

        // We only need to show a single card, the trial being faced
        const phase = this.localPlayer.getCurrentTrialPhase();
        const stack = this.gameState.trialStacks[phase - 1];
        this.gameState.checkTrialStack(stack);
        const card = stack.notused[0];

        const m = new MouseableCard(card);
        m.x = PillarsConstants.TRIALX;
        m.y = PillarsConstants.TRIALY;
        m.zindex = PillarsConstants.MODALZ + 1;


        m.onclick = () => {

        }

        m.render = () => {
            this.renderCard(m);
        };

        this.addMouseable(PillarsConstants.MODAL_KEY + '_trialcard', m);

        this.resizeCanvas();

    }

    /**
     * Initialize in play cards each time there is a change.
     */
    initInPlay() {

        // Every time we change the in play cards, remove all the mouseables start over
        this.removeMouseableKeys(PillarsConstants.INPLAY_START_KEY);

        // In Play Border
        const inPlay = new Mouseable();
        inPlay.x = PillarsConstants.INPLAYX;
        inPlay.y = PillarsConstants.INPLAYY;
        inPlay.w = PillarsConstants.INPLAYW;
        inPlay.h = PillarsConstants.INPLAYH;
        inPlay.zindex = 0;
        inPlay.droppable = true;
        inPlay.render = () => {
            this.ctx.strokeStyle = 'black';
            this.ctx.fillStyle = 'green';
            CanvasUtil.roundRect(this.ctx, PillarsConstants.INPLAYX, PillarsConstants.INPLAYY,
                PillarsConstants.INPLAYW, PillarsConstants.INPLAYH,
                30, true, true);
        }
        this.addMouseable(PillarsConstants.INPLAY_AREA_KEY, inPlay);

        for (let i = 0; i < this.localPlayer.inPlay.length; i++) {
            const card = this.localPlayer.inPlay[i];

            const numPerRow = 6;
            const row = Math.floor(i / numPerRow);
            const place = i % numPerRow;

            const m = this.initHoverCard(card,
                PillarsConstants.INPLAYX + 10 + (50 * place),
                PillarsConstants.INPLAYY + 10 + (row * 10) + (10 * i),
                PillarsConstants.INPLAY_START_KEY,
                PillarsConstants.INPLAY_HOVER_KEY, i, false);
        }

    }

    /**
     * Draw a modal dialog that deactivates everything else until it is closed.
     */
    showModal(text: string, href?: string): Modal {
        this.modal = new Modal(this, text, href);
        this.modal.show();
        return this.modal;
    }

    /**
     * Close the modal.
     */
    closeModal() {
        this.modal?.close(this);
        for (const [k, v] of this.mouseables.entries()) {
            if (k.startsWith(PillarsConstants.MODAL_KEY)) {
                this.mouseables.delete(k);
            }
        }
        this.modal = undefined;
        this.playSound('hint.wav');
    }

    /**
     * Add a mouseable UI element.
     */
    addMouseable(key: string, m: Mouseable) {
        m.key = key;
        this.mouseables.set(key, m);
    }

    /**
     * Remove a mouseable UI element.
     */
    removeMouseable(key: string) {
        this.mouseables.delete(key);
    }

    /**
     * Initialize a hoverable card.
     */
    initHoverCard(card: Card, x: number, y: number,
        startKey: string, hoverKey: string,
        index: number, draggable: boolean): MouseableCard {
        const m = new MouseableCard(card);
        m.x = x;
        m.y = y;
        m.origx = m.x;
        m.origy = m.y;
        m.draggable = draggable;
        m.zindex = index + 1;

        const tk = hoverKey + index;

        m.onmouseout = () => {
            this.mouseables.delete(tk);
        };

        // Draw a second copy unobstructed when hovering
        const hoverOrClick = () => {
            const h = new MouseableCard(card);
            h.x = m.x;
            h.y = m.y;
            this.addMouseable(tk, h);
            h.render = () => {
                this.renderCard(h, true);
            }
        };

        m.onhover = hoverOrClick;
        m.onclick = () => {
            hoverOrClick();
        }

        m.render = () => {
            this.renderCard(m);
        };

        this.addMouseable(startKey + index, m);

        this.resizeCanvas();

        return m;
    }

    /**
     * Check to see if images are loaded. Calls itself until true.
     */
    checkImagesLoaded() {
        // Iterate images to see if they are loaded

        let allLoaded: boolean = true;

        if (this.loadedImages) {
            for (const [key, value] of this.loadedImages.entries()) {
                if (!value === true) allLoaded = false;
            }
        } else {
            allLoaded = false;
        }

        if (!allLoaded) {
            var self = this;
            setTimeout(() => { self.checkImagesLoaded.call(self); }, 100);
        } else {
            this.isDoneLoading = true;
            this.resizeCanvas();
        }
    }

    /**
     * Play a local game against the AI with no connection to the back end.
     */
    startLocalGame() {
        this.gameState = new GameState();
        const localGame = new LocalGame(this.gameState);
        localGame.start();
        this.localPlayer = this.gameState.players[0];

        //console.log(JSON.stringify(this.gameState, null, 1));
    }

    /**
     * Load game state from the server.
     */
    loadGameState() {
        // For now, let's do everything locally
        this.startLocalGame();
    }

    /**
     * Register a running animation.
     */
    registerAnimation(animation: PillarsAnimation) {
        animation.timeStarted = new Date().getTime();
        this.animations.set(animation.getKey(), animation);
    }

    /**
     * Returns true if there are any animations running.
     */
    isAnimating(): boolean {
        return (this.animations && this.animations.size > 0);
    }

    /**
     * Return a z-index sorted array of mouseables.
     */
    sortMouseables(reverse?: boolean): Array<Mouseable> {
        const marray = new Array<Mouseable>();
        for (const [key, m] of this.mouseables.entries()) {
            marray.push(m);
        }
        if (reverse === true) {
            marray.sort((a, b) => a.zindex < b.zindex ? 1 : -1)
        } else {
            marray.sort((a, b) => a.zindex > b.zindex ? 1 : -1)
        }
        return marray;
    }

    /**
     * Returns true if the mouseable key doesn't belong to the modal dialong
     * and we are currently showing a modal.
     */
    checkModal(key: string): boolean {
        return (this.modal !== undefined) &&
            !key.startsWith(PillarsConstants.MODAL_KEY);
    }

    /*
     * Handle mouse move events.
     */
    handleMouseMove(e: MouseEvent) {
        const poz = this.getMousePos(this.gameCanvas, e);
        this.mx = poz.x;
        this.my = poz.y;

        let marray = this.sortMouseables(true);

        let alreadyHit = false; // Only hover the top element by zindex

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            const key = m.key;

            if (m.dragging) {
                // Move the mouseable
                m.x = this.mx - m.dragoffx;
                m.y = this.my - m.draggoffy;
                m.zindex = 1000;
            } else if (this.dragging) {

                // If we're dragging something, we don't want to handle any 
                // other actions associated with mouse moves.
                // TODO - What about highlighting the droppable area?
                break;
            }

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.checkModal(key)) {
                ignore = true;
            }

            if (!ignore) {
                if (m.hitTest(this.mx, this.my)) {

                    //console.log(`move hit ${m.key}, zindex ${m.zindex}, already: ${alreadyHit}`);

                    if (!alreadyHit) {
                        alreadyHit = true;

                        if (m.onmouseover) {
                            m.onmouseover();
                        }

                        m.hovering = true;
                        if (m.onhover) {
                            m.onhover();
                        }

                        if (this.gameCanvas.style.cursor != 'grabbing') {
                            this.gameCanvas.style.cursor = 'pointer';
                        }
                        
                    }
                } else {
                    if (m.hovering) {
                        if (m.onmouseout) {
                            m.onmouseout();
                        }
                        m.hovering = false;
                        this.gameCanvas.style.cursor = 'default';
                    }
                }
            }
        }

        if (!alreadyHit && !this.dragging) {
            // We hit nothing and we're not dragging
            this.gameCanvas.style.cursor = 'default';
        }

        this.resizeCanvas();
    }

    /**
     * Handle mouse down events.
     */
    handleMouseDown(e: MouseEvent) {
        const poz = this.getMousePos(this.gameCanvas, e);
        this.mx = poz.x;
        this.my = poz.y;

        let marray = this.sortMouseables(true);

        let alreadyHit = false; // Only hover the top element by zindex

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            const key = m.key;

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.checkModal(key)) {
                ignore = true;
            }

            if (!ignore) {
                if (m.hitTest(this.mx, this.my)) {

                    this.broadcast(`down hit ${m.key}, zindex ${m.zindex}, already: ${alreadyHit}`);

                    if (!alreadyHit) {
                        alreadyHit = true;

                        if (m.draggable) {
                            if (m.ondragenter) {
                                m.ondragenter();
                            }
                            m.dragging = true;
                            this.gameCanvas.style.cursor = 'grabbing'; 
                            m.dragoffx = this.mx - m.x;
                            m.draggoffy = this.my - m.y;
                        }
                    }
                } else {
                    m.dragging = false;
                    this.gameCanvas.style.cursor = 'default';
                }
            }
        }

        if (!alreadyHit) {
            // We hit nothing
            this.gameCanvas.style.cursor = 'default';
        }

        this.resizeCanvas();
    }


    /**
     * Handle mouse up events.
     */
    handleMouseUp(e: MouseEvent) {
        const poz = this.getMousePos(this.gameCanvas, e);
        this.mx = poz.x;
        this.my = poz.y;

        let marray = this.sortMouseables(true);
        let dropped = false;

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            
            const key = m.key;

            if (m.hitTest(this.mx, this.my)) {

                this.broadcast(`up hit ${m.key}, zindex ${m.zindex}`);

                // Find the mouseable being dragged, and if this m in droppable, drop it
                for (let j = 0; j < marray.length; j++) {
                    const d = marray[j];

                    if (d.dragging && m.droppable) {

                        // Dropping a card from hand into play
                        if (m.key == PillarsConstants.INPLAY_AREA_KEY && 
                            d instanceof MouseableCard && 
                            this.gameState.isInHand(d.card)) {
                            // Play the card
                            var self = this;
                            this.playCard(d.card, () => {
                                self.finishPlayingCard.call(self, d, key);
                            });

                            dropped = true;
                        }

                        // Dropping a card from the market to discard
                        if (m.key == PillarsConstants.DISCARD_AREA_KEY && 
                            d instanceof MouseableCard && 
                            this.gameState.isInMarket(d.card)) {
                            
                            // Acquire the card
                            this.acquireCard(d.card, d.key);

                            dropped = true;
                        }

                    }

                    if (d.dragging && !dropped) {
                        d.x = d.origx;
                        d.y = d.origy;
                    }

                }

            } else {
            }

        }

        //this.gameCanvas.style.cursor = 'default';

        // Clear dragging flags
        this.dragging = false;
        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            m.dragging = false;
        }

        this.resizeCanvas();
    }


    /**
     * Handle mouse clicks.
     */
    handleClick(e: MouseEvent) {
        const poz = this.getMousePos(this.gameCanvas, e);
        const mx = poz.x;
        const my = poz.y;

        // We have to wait for user interaction to load sounds
        if (this.sounds.size == 0) {
            this.addSound('swoosh.wav');
            this.addSound('menuselect.wav');
            this.addSound('hint.wav');
        }

        // Animate each click location
        const click: ClickAnimation = new ClickAnimation();
        click.x = mx;
        click.y = my;
        this.registerAnimation(click);

        let clickedSomething = false;

        // Look at mouseables
        let marray = this.sortMouseables(true);

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            const key = m.key;

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.checkModal(key)) {
                ignore = true;
            }

            if (!ignore && !clickedSomething && m.onclick && m.hitTest(mx, my)) {
                m.onclick();
                clickedSomething = true;
                this.broadcast(`Clicked ${m.key}`);
                break;
            }
        }

        // Un hover on a click outside of any card
        if (!clickedSomething) {
            for (const [key, m] of this.mouseables.entries()) {
                if (m.hovering && m.onmouseout) {
                    m.onmouseout();
                }
            }
        }

        this.resizeCanvas();
    }

    /**
     * After the players finishes choosing custom actions, finish playing the card.
     */
    finishPlayingCard(m: MouseableCard, key: string) {

        // Move the card from hand to where it goes
        if (m.card.retired) {
            this.gameState.retiredCards.push(m.card);
        } else {
            this.localPlayer.inPlay.push(m.card);
        }

        // Remove the mouseable
        this.mouseables.delete(key);

        // Remove it from hand
        let indexToRemove = -1;
        for (let i = 0; i < this.localPlayer.hand.length; i++) {
            if (this.localPlayer.hand[i].uniqueIndex == m.card.uniqueIndex) {
                indexToRemove = i;
            }
        }
        if (indexToRemove > -1) {
            this.removeMouseable(m.getInfoKey());
            this.localPlayer.hand.splice(indexToRemove, 1);
        } else {
            throw Error('Unable to remove card from hand');
        }


        this.initHand();
        this.initInPlay();

        this.broadcast(`${this.localPlayer.name} played ${m.card.name}`);
    }

    /**
     * Check to see if a card in hand was double clicked.
     * 
     * If so, play it.
     */
    checkHandDoubleClick(mx: number, my: number) {

        let key: string = '';
        for (const k of this.mouseables.keys()) {

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.checkModal(k)) {
                ignore = true;
            }

            if (!ignore) {
                if (k.startsWith(PillarsConstants.HAND_START_KEY)) {
                    const m = <MouseableCard>this.mouseables.get(k);
                    if (m.hitTest(mx, my)) {
                        key = k;
                        break;
                    }
                }
            }
        }

        if (key && key.length > 0) {
            const m = <MouseableCard>this.mouseables.get(key);

            // TODO - Make sure the card can legally be played.

            // Play the card

            // Play the card's effects!
            var self = this;
            this.playCard(m.card, () => {
                self.finishPlayingCard.call(self, m, key);
            });
        }
    }

    /**
     * Handle keyboard events.
     */
    handleKeyDown(e: KeyboardEvent) {

        if (e.isComposing || e.keyCode === 229) {
            return;
        }

        if (e.key && e.key.length == 1) {
            this.typing += e.key;
        } else {
            if (e.key == 'Enter') {
                this.broadcast(`[${this.localPlayer.name}] ${this.typing}`);
                this.typing = '';
            }
            if (e.key == 'Backspace') {
                this.typing = this.typing.substr(0, this.typing.length - 1);
            }
        }
        this.resizeCanvas();
    }

    /**
     * Play a card from the local player's hand.
     */
    playCard(card: Card, callback: Function) {
        this.playSound('menuselect.wav');
        const actions = new CardActions(this, card, callback);
        actions.play();
    }

    /**
     * Broadcast a change to the game state.
     */
    broadcast(summary: string) {
        // TODO

        this.gameState.broadcastSummaries.push(summary);
    }

    /**
     * Check to see if a card in the market was double clicked.
     * 
     * If the player has enough resources, acquire it.
     */
    checkMarketDoubleClick(mx: number, my: number) {

        let key = null;
        for (const k of this.mouseables.keys()) {
            if (k.startsWith(PillarsConstants.MARKET_START_KEY)) {
                const m = <MouseableCard>this.mouseables.get(k);
                if (m.hitTest(mx, my)) {
                    key = k;
                    break;
                }
            }
        }

        const p = this.localPlayer;

        if (key) {
            const m = <MouseableCard>this.mouseables.get(key);

            if (m.card.canAcquire(p.numCredits, p.numTalents)) {
                this.acquireCard(m.card, key);
            }
        }
    }

    /**
     * Acquire a card from the marketplace.
     */
    acquireCard(card: Card, key: string) {
        
        this.playSound('menuselect.wav');
        this.localPlayer.discardPile.push(card);
        this.mouseables.delete(key);
        let indexToRemove = -1;
        for (let i = 0; i < this.gameState.currentMarket.length; i++) {
            if (this.gameState.currentMarket[i].uniqueIndex == card.uniqueIndex) {
                indexToRemove = i;
            }
        }
        if (indexToRemove > -1) {
            this.gameState.currentMarket.splice(indexToRemove, 1);
        } else {
            throw Error('Unable to remove card from current market');
        }

        // Subtract the cost from the player's current resources
        const cost = card.convertCost();
        this.localPlayer.numCredits -= cost.credits;
        this.localPlayer.numTalents -= cost.talents;

        this.initHand();
        this.initDiscard();
        this.initMarket();

        this.broadcast(`${this.gameState.currentPlayer.name} acquired ${card.name}`);
    }

    /**
     * Handle mouse double clicks.
     */
    handleDoubleClick(e: MouseEvent) {
        const poz = this.getMousePos(this.gameCanvas, e);
        const mx = poz.x;
        const my = poz.y;

        // Check to see if a card in hand was clicked
        if (this.localPlayer.index == this.gameState.currentPlayer.index) {
            this.checkHandDoubleClick(mx, my);
            this.checkMarketDoubleClick(mx, my);
        }

    }

    /**
     * Add a sound.
     */
    addSound(name: string) {
        const baseUrl = PillarsConfig.AudioUrl;
        const h = new Howl({ src: [`${baseUrl}${name}`] });
        this.sounds.set(name, h);
    }

    /**
     * Play a sound.
     */
    playSound(name: string): any {
        if (this.sounds) {
            const s = this.sounds.get(name);
            if (s) {
                s.play();
            }
        }
    }

    /**
     * Delete an animation when it is complete.
     */
    deleteAnimation(key: string) {
        this.animations.delete(key);
        var self = this;
        setTimeout(function (e) {
            self.resizeCanvas();
        }, 5);
    }

    /**
     * Get the image element and add an event listener to redraw 
     * once it is loaded.
     */
    loadImg(name: string) {
        const img = new Image();
        img.src = name;
        var self = this;
        if (img) {
            this.images.set(name, <HTMLImageElement>img);
            this.loadedImages.set(name, false);
            img.addEventListener("load", function (e) {
                self.loadedImages.set(name, true);
            }, false);
        } else {
            throw Error(`${name} does not exist`);
        }
    }

    /**
     * Get a loaded image. (Does not load the image)
     */
    getImg(name: string): HTMLImageElement {
        const img = this.images.get(name);
        if (img) {
            return img;
        } else {
            throw Error(`No such image: ${name}`);
        }
    }

    /**
     * Render a card using an image file.
     * 
     * The image has to be scaled and masked.
     */
    renderCardImage(name: string, x: number, y: number, scale?: number) {

        if (!this.isDoneLoading) {
            return;
        }

        if (scale === undefined) {
            scale = 1.0;
        }

        const ctx = this.ctx;

        ctx.save();

        // Draw a mask

        let radius = PillarsConstants.CARD_RADIUS;
        let width = PillarsConstants.CARD_WIDTH;
        let height = PillarsConstants.CARD_HEIGHT;

        radius = radius * scale;
        width = width * scale;
        height = height * scale;

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
        ctx.closePath();
        ctx.stroke();

        ctx.clip();

        // Draw the image in the mask
        const img = this.getImg(name);
        let imgScale = PillarsConstants.CARD_IMAGE_SCALE * scale;
        let offset = 15 * scale;
        ctx.drawImage(img, x - offset, y - offset, img.width * imgScale, img.height * imgScale);

        ctx.restore();
    }

    /**
     * Get the die name for the player and rank.
     */
    getDieName(i: number, r: number) {
        return `img/die-${this.playerDiceColors[i]}-${r}-50x50.png`;
    }

    /**
     * Render a 6-sided die.
     */
    renderDie(x: number, y: number, playerIndex: number, rank: number,
        scale: number, a?: PillarsAnimation) {
        const img = this.getImg(this.getDieName(playerIndex, rank));
        if (a) {
            x += 2;
            y += 2;
        }
        if (img) {
            this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    /**
     * Get the default font for ctx.
     */
    getFont(size: number, style?: string): string {
        if (!style) style = 'normal';
        return `normal ${style} ${size}px amazonember`;
    }

    /**
     * Render a big text image on the card n number of times.
     */
    renderImgOnCard(img: HTMLImageElement, x: number, y: number,
        n: number, scale: number): number {

        for (let i = 0; i < n; i++) {
            this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            x += img.width * scale
        }

        return x;
    }

    /**
     * Render a roman numeral on the card e.g. "*V".
     */
    renderTimesNumeralOnCard(numeral: string, x: number, y: number, scale: number) {
        x += 5 * scale;
        y += 25 * scale;
        this.ctx.font = this.getFont(30 * scale, 'bold');
        this.ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
        this.ctx.fillText(` * ${numeral}`, x + 10 * scale, y);
    }

    /**
     * Render the small text under the big text area.
     */
    renderSmallText(card: Card, cardx: number, cardy: number, scale: number) {
        const ctx = this.ctx;

        const y = cardy + 120 * scale;
        let x = cardx + ((PillarsConstants.CARD_WIDTH * scale) / 2);

        this.ctx.font = this.getFont(10 * scale);
        this.ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
        this.ctx.textAlign = 'center';

        if (card.text) {
            if (card.text.length > 50) {
                this.ctx.font = this.getFont(8 * scale);
            }
            TextUtil.wrapText(this.ctx, card.text, x, y,
                PillarsConstants.CARD_WIDTH * scale, 12 * scale);
        }

    }

    /**
     * Render the main, big, bold text or graphics on the card.
     */
    renderBigText(card: Card, cardx: number, cardy: number, scale: number) {
        const ctx = this.ctx;

        let img = undefined;
        let numImg = 0;
        let imgScale = 1;
        let providesLen = card.getProvidesLength();

        if (card.provides) {
            if (card.provides.CreditByPillar !== undefined ||
                card.provides.TalentByPillar != undefined ||
                card.provides.CreativityByPillar != undefined) {

                providesLen = 3;
            }
        }

        const y = cardy + 75 * scale;
        const resourceScale = 0.3 * scale;
        const custScale = 0.075 * scale;
        let w = providesLen * 100 * resourceScale;
        let x = cardx + ((PillarsConstants.CARD_WIDTH * scale) / 2) - (w / 2);

        // The bigtext field is only populated for things we don't specify
        // in a data-driven, programmatic way
        if (card.bigtext) {
            ctx.font = this.getFont(24 * scale, 'bold');
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            ctx.fillText(card.bigtext, x, y + 30 * scale,
                PillarsConstants.CARD_WIDTH * scale);
        }

        if (card.provides) {

            // T, $, Cr, and Cust can happen more than once

            if (card.provides.Talent) {
                img = this.getImg(PillarsImages.IMG_TALENT);
                x = this.renderImgOnCard(img, x, y, card.provides.Talent, resourceScale);
            }
            if (card.provides.Credit) {
                img = this.getImg(PillarsImages.IMG_CREDITS);
                x = this.renderImgOnCard(img, x, y, card.provides.Credit, resourceScale);
            }
            if (card.provides.Creativity) {
                img = this.getImg(PillarsImages.IMG_CREATIVITY);
                x = this.renderImgOnCard(img, x, y, card.provides.Creativity, resourceScale);
            }
            if (card.provides.Customer) {
                img = this.getImg(PillarsImages.IMG_CUSTOMER_BLUE);
                x = this.renderImgOnCard(img, x, y, card.provides.Customer, custScale);
            }

            // Resource * Pillar is always by itself

            if (card.provides.CreditByPillar !== undefined) {
                img = this.getImg(PillarsImages.IMG_CREDITS);
                x = this.renderImgOnCard(img, x, y, 1, resourceScale);
                this.renderTimesNumeralOnCard(<string>card.pillarNumeral,
                    x, y, scale);
            }
            if (card.provides.TalentByPillar !== undefined) {
                img = this.getImg(PillarsImages.IMG_TALENT);
                x = this.renderImgOnCard(img, x, y, 1, resourceScale);
                this.renderTimesNumeralOnCard(<string>card.pillarNumeral,
                    x, y, scale);
            }
            if (card.provides.CreativityByPillar !== undefined) {
                img = this.getImg(PillarsImages.IMG_CREATIVITY);
                x = this.renderImgOnCard(img, x, y, 1, resourceScale);
                this.renderTimesNumeralOnCard(<string>card.pillarNumeral,
                    x, y, scale);
            }
        }


        if (card.action) {

            if (!card.provides) {

                // Big text
                ctx.font = this.getFont(24 * scale, 'bold');
                ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
                ctx.textAlign = 'center';

                let text = '';

                if (card.action.Retire) {
                    text = `Retire ${card.action.Retire}`;
                }
                if (card.action.Promote) {
                    // 0-4 means that pillar
                    // 5 means any
                    // 6 means roll a d6
                    if (card.action.Promote < 5) {
                        const numerals = ['I', 'II', 'III', 'IV', 'V'];
                        const numeral = numerals[card.action.Promote];
                        text = `Promote ${numeral}`;
                    } else if (card.action.Promote == 5) {
                        text = 'Promote Any';
                    } else {
                        text = 'Promote';
                    }
                }
                if (card.action.Draw) {
                    text = `Draw ${card.action.Draw}`;
                }

                ctx.fillText(text, x, y + 30 * scale);

            } else {

                // Small text for an action on a card that also provides

                // TODO

            }
        }

    }

    /**
     * Render a card.
     */
    renderCard(m: MouseableCard, isPopup?: boolean, scale?: number): any {
        const card = m.card;
        const ctx = this.ctx;
        let x = m.x;
        let y = m.y;
        let w = m.w;
        let h = m.h;
        let radius = PillarsConstants.CARD_RADIUS;
        let p = this.localPlayer;
        if (scale === undefined) {
            scale = 1;
        }

        if (card.type == 'Pillar') {
            scale = PillarsConstants.PILLAR_SCALE;
        }

        if (isPopup) {
            scale = PillarsConstants.POPUP_SCALE;
            x = PillarsConstants.BIGCARDX;
            y = PillarsConstants.BIGCARDY;
            m.x = x;
            m.y = y;
        }

        radius *= scale;
        w *= scale;
        h *= scale;
        //m.w = w;
        //m.h = h;

        // Card border
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';

        // Highlight the card if hovering
        if (m.hovering) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'gray';
        }

        // Highlight market cards if the local player can purchase it
        let isInMarket = false;
        for (const c of this.gameState.currentMarket) {
            if (c.uniqueIndex == m.card.uniqueIndex) {
                isInMarket = true;
                break;
            }
        }

        let isInHand = false;
        for (const c of this.localPlayer.hand) {
            if (c.uniqueIndex == m.card.uniqueIndex) {
                isInHand = true;
            }
        }

        let highlight = false;

        if (isInMarket && m.card.canAcquire(p.numCredits, p.numTalents)) {
            highlight = true;
        }
        if (isInHand && this.gameState.canPlayCard(m.card)) {
            highlight = true;
        }

        if (highlight) {
            ctx.save()
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            CanvasUtil.roundRect(this.ctx, x - 2, y - 2, w + 4, h + 4, radius, false, true);
            ctx.restore();
        }

        // Card border
        ctx.fillStyle = '#FEF9E7';
        CanvasUtil.roundRect(this.ctx, x, y, w, h, radius, true, true);
        ctx.fillStyle = 'black';

        // Card Image
        const imgFileName = m.card.getImageName();
        const img = this.images.get(imgFileName);
        if (img) {
            this.renderCardImage(imgFileName, x, y, scale);
        } else {
            console.log(`[Log] Unable to get img ${imgFileName}`);
        }

        let fontSize = 14 * scale;

        ctx.font = this.getFont(fontSize);
        ctx.fillStyle = PillarsConstants.COLOR_WHITE;

        // Card Name
        if (card.type == 'Pillar') {
            ctx.textAlign = 'center';
            ctx.fillText(card.name, x + w / 2, y + 18);
        } else {
            ctx.textAlign = 'left';
            let namex = x + 5 * scale;
            let namey = y + 18 * scale;
            ctx.fillText(card.name, namex, namey, PillarsConstants.CARD_WIDTH * scale - 5);
        }

        // Info hyperlink
        if (card.info) {
            const infoLink = new Mouseable();
            const infox = x + w - 25;
            const infoy = y + 5;
            const infow = 20;
            const infoh = 20;
            infoLink.x = infox;
            infoLink.y = infoy;
            infoLink.w = infow;
            infoLink.h = infoh;
            infoLink.zindex = m.zindex + 0.1;
            infoLink.render = () => {
                const infoimg = this.images.get(PillarsImages.IMG_INFO);
                if (infoimg) {
                    ctx.drawImage(infoimg, infox, infoy, 20, 20);
                } else {
                    console.log(`Unable to get img ${PillarsImages.IMG_INFO}`);
                }
            };
            infoLink.onclick = () => {
                this.showModal(<string>card.info, card.href);
                this.playSound('menuselect.wav');
            };
            this.addMouseable(m.getInfoKey(), infoLink);
        }

        fontSize = 9 * scale;

        // Marketing
        if (card.marketing) {
            ctx.textAlign = 'left';
            let mkx = x + 5 * scale;
            let mky = y + 30 * scale;

            ctx.font = this.getFont(fontSize, 'italic');
            let maxw: any = PillarsConstants.CARD_WIDTH * scale - 10;
            ctx.fillText(<string>card.marketing, mkx, mky, maxw);
        }

        // Flavor
        if (card.flavor) {
            fontSize = 9 * scale;
            ctx.font = this.getFont(fontSize, 'italic');
            ctx.textAlign = 'center';
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            let fx = x + ((PillarsConstants.CARD_WIDTH * scale) / 2);
            let fy = y + (25 * scale) + ((PillarsConstants.CARD_HEIGHT * scale) / 2);
            let maxw: any = PillarsConstants.CARD_WIDTH * scale - 10;
            ctx.fillText(<string>card.flavor, fx, fy, maxw);
        }

        if (card.type != 'Pillar' && !card.hideType) {
            // Card Type and Subtype
            ctx.font = this.getFont(10);
            let t = card.type.toLocaleUpperCase();
            if (card.subtype) {
                t += ' - ' + card.subtype.toLocaleUpperCase();
            }
            ctx.textAlign = 'center';
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            let ty = y + 60 * scale;
            ctx.font = this.getFont(9 * scale, 'bold');
            ctx.fillText(t, x + w / 2, ty);
        }

        // Cost
        if (card.cost) {
            let costw = 10;
            let costh = 10;
            if (card.cost.length >= 5) {
                costw = 8;
                costh = 8;
            }
            let costoffx = 60 * scale;
            let costoffy = 35 * scale;
            let cw = PillarsConstants.CARD_WIDTH;
            let ch = PillarsConstants.CARD_HEIGHT;
            costw *= scale;
            costh *= scale;
            cw *= scale;
            ch *= scale;

            //ctx.strokeRect(x + cw - costoffx, y + ch - costoffy, 6 * costw, costh);

            // What a mess

            // len=6 off=0, len=4 off=1, len=2 off=2
            const centeroff = ((6 - card.cost.length) / 2) * costw;

            // Center the images, assuming a max cost of 6
            const costx = x + cw - costoffx + centeroff;
            const costy = y + ch - costoffy;

            for (let i = 0; i < card.cost.length; i++) {
                const cc = card.cost.charAt(i);
                let imgName = '';
                switch (cc) {
                    case 'T':
                        imgName = PillarsImages.IMG_TALENT;
                        break;
                    case '$':
                        imgName = PillarsImages.IMG_CREDITS;
                        break;
                    default:
                        throw Error('Unexpected cost: ' + cc);
                }
                const img = this.getImg(imgName);
                ctx.drawImage(img, costx + (i * costw), costy, costw, costh);
            }
        }

        // Cloud Category
        if (card.category) {
            ctx.font = this.getFont(6 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            ctx.fillText(card.category.toUpperCase(), x + (32 * scale), y + (207 * scale));
        }

        // Big Text
        if (card.type != 'Pillar') {
            ctx.font = this.getFont(12 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            this.renderBigText(card, x, y, scale);
        }

        // Small text
        if (card.text && card.type != 'Pillar') {
            ctx.font = this.getFont(10 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            this.renderSmallText(card, x, y, scale);
        }

        // Type-specific
        switch (card.type) {
            case "Pillar":

                const pidx: number = card.pillarIndex || 0;

                // Draw player rank dice

                const p: Array<any> = [];
                p[0] = { x: 5 * scale, y: 40 * scale };
                p[1] = { x: w - 55 * scale, y: 40 * scale };
                p[2] = { x: 5 * scale, y: h - 55 * scale };
                p[3] = { x: w - 55 * scale, y: h - 55 * scale };

                for (let i = 0; i < this.gameState.players.length; i++) {

                    ctx.font = this.getFont(16, 'bold');
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black';

                    const player = this.gameState.players[i];

                    const animKey = DieAnimation.GetKey(i, pidx);
                    const a = <PillarsAnimation>this.animations.get(animKey);

                    this.renderDie(x + p[i].x, y + p[i].y, i, player.pillarRanks[pidx], scale, a);
                }

                break;

            case "Resource":

                switch (card.subtype) {

                    case "Human":
                    case "Augment Human":

                        break;

                }

                break;

            case "Trial":

                break;
        }

        // Reset alignment
        ctx.textAlign = "left";
    }


    /**
     * Draw one of the 3 resource types with the total currently available.
     */
    drawResource(img: HTMLImageElement, x: number, y: number, total: number) {

        const ctx = this.ctx;

        if (this.isDoneLoading) {
            ctx.drawImage(img, x, y);
        }

        ctx.fillStyle = '#222222';
        ctx.strokeStyle = '#000000';

        ctx.beginPath();
        ctx.arc(x + 85, y + 80, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.font = this.getFont(18, 'bold');
        ctx.fillStyle = '#FFFFFF';

        ctx.fillText(total.toString(), x + 78, y + 86);
    }

    /**
     * Promote a pillar rank die.
     */
    promote(playerIndex: number, pillarIndex: number) {

        // Modify game state
        const r = this.gameState.players[playerIndex].pillarRanks[pillarIndex];
        if (r < this.gameState.pillarMax) {
            this.gameState.players[playerIndex].pillarRanks[pillarIndex]++;
        }

        // Animate
        const d: DieAnimation = new DieAnimation();
        d.playerIndex = playerIndex;
        d.pillarIndex = pillarIndex;
        this.registerAnimation(d);

        this.playSound('swoosh.wav');

        // TODO - Game end?
    }

    /**
     * Render the player chat area
     */
    renderChat() {

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'green';
        this.ctx.fillStyle = 'black';
        CanvasUtil.roundRect(this.ctx, PillarsConstants.CHATX, PillarsConstants.CHATY,
            PillarsConstants.CHATW, PillarsConstants.CHATH, 5, true, true);

        let numLines = 10;
        const chat = this.gameState.broadcastSummaries;
        if (chat.length < numLines) {
            numLines = chat.length;
        }

        const lineh = 15;

        for (let i = 0; i < numLines; i++) {
            const line = chat[chat.length - 1 - i];
            const offset = lineh * 2 + (lineh * i);
            const y = PillarsConstants.CHATY + PillarsConstants.CHATH - offset;

            this.ctx.fillStyle = 'limegreen';
            this.ctx.font = 'normal normal 16px courier';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`> ${line}`,
                PillarsConstants.CHATX + 5, y, PillarsConstants.CHATW);
        }

        this.ctx.fillStyle = 'limegreen';
        this.ctx.font = 'normal bold 16px courier';
        this.ctx.textAlign = 'left';
        let cursor = '|'
        if (new Date().getTime() % 1000 < 500) {
            cursor = '';
        }
        this.ctx.fillText(`> ${this.typing}${cursor}`,
            PillarsConstants.CHATX + 5, PillarsConstants.CHATY + PillarsConstants.CHATH - lineh);
    }

    /**
     * Summaries of the other players. Current scores, etc.
     */
    renderPlayerSummaries() {
        const summaryx = 10;
        const summaryy = 10;
        const summaryw = 300;
        const summaryh = 120;

        for (let i = 0; i < 4; i++) {
            const p = this.gameState.players[i];
            let sx = 0;
            let sy = 0;

            switch (i) {
                case 0:
                    sx = summaryx;
                    sy = summaryy;
                    break;
                case 1:
                    sx = summaryx + summaryw + 1;
                    sy = summaryy;
                    break;
                case 2:
                    sx = summaryx;
                    sy = summaryy + summaryh + 1;
                    break;
                case 3:
                    sx = summaryx + summaryw + 1;
                    sy = summaryy + summaryh + 1;
                    break;
            }

            // Highlight the active player
            if (i == this.gameState.currentPlayer.index) {
                this.ctx.lineWidth = 5;
                this.ctx.strokeStyle = 'yellow';
            } else {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
            }

            // Player summary area
            this.ctx.fillStyle = '#D8D8D8';
            this.ctx.fillRect(sx, sy, summaryw, summaryh);
            this.ctx.strokeRect(sx, sy, summaryw, summaryh);

            // Player name
            this.ctx.font = this.getFont(14, 'bold');
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = 'silver';
            if (p.isHuman) {
                this.ctx.fillStyle = 'black';
            }
            this.ctx.fillText(p.name, sx + 5, sy + 20);

            // XP
            this.ctx.fillText(`XP:${p.xp()}`, sx + 100, sy + 20);

            // Resources

            const talent = this.getImg(PillarsImages.IMG_TALENT);
            const credits = this.getImg(PillarsImages.IMG_CREDITS);
            const creativity = this.getImg(PillarsImages.IMG_CREATIVITY);
            const green = this.getImg(PillarsImages.IMG_CUSTOMER_GREEN);
            const blue = this.getImg(PillarsImages.IMG_CUSTOMER_BLUE);
            const orange = this.getImg(PillarsImages.IMG_CUSTOMER_ORANGE);
            const yellow = this.getImg(PillarsImages.IMG_CUSTOMER_YELLOW);

            const sw = 20;

            for (let i = 0; i < p.numTalents; i++) {
                this.ctx.drawImage(talent, sx + 5 + (sw * i), sy + 30, sw, sw);
            }

            for (let i = 0; i < p.numCredits; i++) {
                this.ctx.drawImage(credits, sx + 5 + (sw * i), sy + 55, sw, sw);
            }

            for (let i = 0; i < p.numCreativity; i++) {
                this.ctx.drawImage(creativity, sx + 5 + (sw * i), sy + 80, sw, sw);
            }

            // Num Customers
            let img: HTMLImageElement = green;
            switch (this.playerDiceColors[p.index]) {
                case 'orange':
                    img = orange;
                    break;
                case 'green':
                    img = green;
                    break;
                case 'blue':
                    img = blue;
                    break;
                case 'yellow':
                    img = yellow;
                    break;
            }
            const custx = sx + summaryw - 105;
            const custy = sy + 5;
            this.ctx.drawImage(img, custx, custy, 100, 100);
            this.ctx.textAlign = 'center';
            this.ctx.font = this.getFont(36, 'bold');
            this.ctx.fillText(`${p.numCustomers}`, custx + 50, custy + 87);

        }

        this.renderChat();
    }

    /**
     * Roll dice for the current player.
     */
    roll(numDice: number) {
        if (numDice < 1 || numDice > 2) {
            throw Error('Invalid number of dice');
        }

        this.gameState.currentPlayer.lastDiceRoll = [];

        // TODO - Animate

        for (let i = 0; i < numDice; i++) {
            const r = Math.floor(Math.random() * 6) + 1;
            this.gameState.currentPlayer.lastDiceRoll.push(r);
        }

        this.resizeCanvas();
    }

    /**
     * Render the dice rolling area.
     */
    renderDice() {

        const ctx = this.ctx;
        const currentPlayer = this.gameState.currentPlayer;

        // Dice rolling area
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(PillarsConstants.DICEX, PillarsConstants.DICEY, 100, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;

        // Draw rolled dice
        if (currentPlayer.lastDiceRoll.length > 1) {
            this.renderDie(PillarsConstants.DICEX - 50, PillarsConstants.DICEY - 50,
                currentPlayer.index, currentPlayer.lastDiceRoll[0], 1);
            if (currentPlayer.lastDiceRoll.length == 2) {
                this.renderDie(PillarsConstants.DICEX + 15, PillarsConstants.DICEY + 15,
                    currentPlayer.index, currentPlayer.lastDiceRoll[1], 1);
            }
        }
    }

    /**
     * Draw the canvas, scaling by width.
     */
    renderCanvas(w: number, h: number) {

        const ctx = this.ctx;
        const mx = this.mx;
        const my = this.my;

        ctx.clearRect(0, 0, w, h);

        // Width and height scale
        const s = 1 / (PillarsConstants.BW / w);

        // Outer Border
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, w, h);
        ctx.lineWidth = 1;

        // Scale the context to match the window size
        ctx.scale(s * window.devicePixelRatio, s * window.devicePixelRatio);

        // Background
        ctx.fillStyle = '#0B243B';
        ctx.fillRect(0, 0, PillarsConstants.BW, PillarsConstants.BH);

        // if (this.isDoneLoading) {
        //     ctx.globalAlpha = 0.3;
        //     ctx.drawImage(this.getImg(PillarsImages.IMG_BG), 0, 0);
        //     ctx.globalAlpha = 1;
        // }

        // // Logo
        // if (this.isDoneLoading) {
        //     ctx.save();
        //     ctx.beginPath();
        //     ctx.arc(60, 60, 50, 0, Math.PI * 2, false);
        //     ctx.clip();
        //     ctx.drawImage(this.getImg(PillarsImages.IMG_LOGO), 10, 10);
        //     ctx.restore();
        // }

        // Deck
        this.initPlayerDeck();

        const currentPlayer = this.gameState.currentPlayer;
        const currentColor = this.playerDiceColors[currentPlayer.index];

        // Credits, Creativity, and Talent
        if (this.isDoneLoading) {
            const resourcey = PillarsConstants.INPLAYY + PillarsConstants.INPLAYH - 110;
            this.drawResource(this.getImg(PillarsImages.IMG_CREDITS),
                PillarsConstants.INPLAYX + 50, resourcey, this.localPlayer.numCredits);
            this.drawResource(this.getImg(PillarsImages.IMG_CREATIVITY),
                PillarsConstants.INPLAYX + 150, resourcey, this.localPlayer.numCreativity);
            this.drawResource(this.getImg(PillarsImages.IMG_TALENT),
                PillarsConstants.INPLAYX + 250, resourcey, this.localPlayer.numTalents);
        }

        // Marketplace
        let marketx = PillarsConstants.MARKETX;
        let markety = PillarsConstants.INPLAYY;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'purple';
        CanvasUtil.roundRect(this.ctx, marketx, markety, 800, PillarsConstants.INPLAYH, 30,
            true, true);

        if (this.gameState.marketStack.length > 0) {
            this.renderCardImage(PillarsImages.IMG_BACK_BLUE, marketx + 20, markety + 15);
            this.renderCardImage(PillarsImages.IMG_BACK_BLUE, marketx + 25, markety + 10);
        } else {
            CanvasUtil.roundRect(this.ctx, marketx + 20, markety + 15,
                PillarsConstants.CARD_WIDTH, PillarsConstants.CARD_HEIGHT,
                PillarsConstants.CARD_RADIUS, false, true);
        }

        this.renderDice();

        // Player summaries
        this.renderPlayerSummaries();

        // Loading
        const numImages = this.images.size;
        let numLoaded = 0;
        if (this.loadedImages) {
            for (const [key, value] of this.loadedImages.entries()) {
                if (value === true) {
                    numLoaded++;
                }
            }
        }
        if (numLoaded < numImages) {
            ctx.font = this.getFont(36, 'bold');
            ctx.fillStyle = 'black';
            ctx.fillText(`Loaded ${numLoaded} of ${numImages} images`,
                (PillarsConstants.BW / 2) - 50, PillarsConstants.BH / 2);
        }

        // Mouseables, drawn in zindex order
        const marray = this.sortMouseables();

        for (const m of marray) {
            if (m.render) {
                m.render();
            }
        }

        // Run animation logic
        for (const [key, value] of this.animations.entries()) {
            value.animate(this.ctx, () => {
                this.deleteAnimation(key);
            });
        }

        // Debugging data
        ctx.font = this.getFont(9);
        ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
        const dbx = 10;
        const dby = PillarsConstants.BH - 3;
        ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
            `P: ${PillarsConstants.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
            `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
            `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}, ` +
            `as:${this.animations.size}, ` +
            `a:${this.isAnimating()}, d:${this.isDoneLoading}, ` +
            `FRa:${FrameRate.avg.toFixed(1)}, FRc:${FrameRate.cur.toFixed(1)}`,
            dbx, dby);
    }

    /**
     * Resize the canvas according to the window size.
     */
    resizeCanvas() {

        let self = this;

        let w = window.innerWidth - 40;
        let h = w / PillarsConstants.PROPORTION;

        // We want the whole game to be visible regardless of window shape
        if (h > window.innerHeight) {
            h = window.innerHeight - 40;
            w = h * PillarsConstants.PROPORTION;
        }

        this.gameCanvas.width = w;
        this.gameCanvas.height = h;
        this.gameCanvas.style.top = "10px";
        this.gameCanvas.style.left = Math.floor((window.innerWidth - w) / 2) + "px";

        // Adjust for pixel ratio to reduce blurriness
        this.gameCanvas.width = w * window.devicePixelRatio;
        this.gameCanvas.height = h * window.devicePixelRatio;
        this.gameCanvas.style.width = w + 'px';
        this.gameCanvas.style.height = h + 'px';

        this.renderCanvas(w, h);

        // Call this every time the browser decides to redraw the screen, 
        // while we are animating something.
        if (this.isAnimating()) {
            window.requestAnimationFrame(function (e) {
                self.resizeCanvas.call(self);
            });
        }

        FrameRate.update();
    }

    /**
     * Get the position of the mouse within the canvas.
     * Coordinates are relative to base width and height.
     */
    getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
        var rect = canvas.getBoundingClientRect();
        var scale = PillarsConstants.BW / rect.width;
        return {
            x: (evt.clientX - rect.left) * scale,
            y: (evt.clientY - rect.top) * scale
        };
    }

    /**
     * Entry point from the web page.
     */
    static init() {
        const game = new PillarsGame();
        window.addEventListener('resize', function (e) {
            game.resizeCanvas.call(game);
        }, false);
        game.resizeCanvas();

    }
}

// Start the game
PillarsGame.init();
