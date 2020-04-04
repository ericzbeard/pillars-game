import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsWebConfig } from './pillars-web-config';
import { MouseableCard, Mouseable, IPillarsGame, Xywh } from './ui-utils';
import { PillarsImages, PillarsAnimation, Modal } from './ui-utils';
import { PillarDieAnimation, FrameRate, TextUtil, Button } from './ui-utils';
import { ModalCardClick, PillarsSounds } from './ui-utils';
import { LocalGame } from './local-game';
import { CardActions } from './card-actions';
import { PillarsConstants } from './constants';
import { CardRender } from './card-render';
import { bug } from './actions/bug';
import { AIChatter } from './ai-chatter';
import { PillarsInput } from './input';
import { PillarsMenu } from './menu';
import { uapi } from './comms';
import { Welcome } from './welcome';

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
     * Card rendering functions.
     */
    cardRender: CardRender;

    /**
     * Robot chat.
     */
    aiChatter: AIChatter;

    /**
     * True if this is a non-networked solo game, Human vs AI
     */
    isSoloGame: boolean;

    /**
     * Mouse, touch screen, and keyboard input.
     */
    input: PillarsInput;

    /**
     * Init sound once.
     */
    initializingSound: boolean;

    /**
     * Show diagnostics if true.
     */
    isDiag: boolean;

    /**
     * Menu buttons.
     */
    menu: PillarsMenu;

    /**
     * If true, don't play sounds.
     */
    muted: boolean;

    /**
     * If true, show the welcome screen and hide the rest.
     */
    welcome: boolean;

    /**
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

        this.animations = new Map<string, PillarsAnimation>();
        this.mouseables = new Map<string, Mouseable>();
        this.sounds = new Map<string, Howl>();
        this.images = new Map<string, HTMLImageElement>();
        this.initializingSound = false;
        this.isDiag = false;
        this.welcome = true;

        this.playerDiceColors = [];
        this.playerDiceColors[0] = 'orange';
        this.playerDiceColors[1] = 'blue';
        this.playerDiceColors[2] = 'green';
        this.playerDiceColors[3] = 'yellow';

        this.loadedImages = new Map<string, boolean>();

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

        this.cardRender = new CardRender(this);

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
            PillarsImages.IMG_GEAR
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

        this.input = new PillarsInput(this);

        // Listen to mouse moves
        self.gameCanvas.addEventListener('mousemove', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.input.handleMouseMove.call(self.input, e);
        });

        // Listen to mouse ups
        self.gameCanvas.addEventListener('mouseup', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.input.handleMouseUp.call(self.input, e);
        });

        // Listen to mouse downs
        self.gameCanvas.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.input.handleMouseDown.call(self.input, e);
        });

        // // Listen for clicks
        // self.gameCanvas.addEventListener('click', function (e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        //     self.input.handleClick.call(self.input, e);
        // });

        // // Listen for double clicks
        // self.gameCanvas.addEventListener('dblclick', function (e) {
        //     self.input.handleDoubleClick.call(self.input, e);
        // });

        // Listen for touch start events
        self.gameCanvas.addEventListener('touchstart', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.diag('touchstart');
            self.input.handleTouchStart.call(self.input, e);
        });

        // Listen for touch move events
        self.gameCanvas.addEventListener('touchmove', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.diag('touchmove');
            self.input.handleTouchMove.call(self.input, e);
        });

        // THIS NEVER FIRES!  ARGGH!
        self.gameCanvas.addEventListener('touchend', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.diag('touchend');
            self.input.handleTouchUp.call(self.input, e);
        });

        // Listen for touch cancel events
        self.gameCanvas.addEventListener('touchcancel', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.diag('touchcancel');
            self.input.handleTouchUp.call(self.input, e);
        });

        // Listen for keyboard input
        window.addEventListener('keydown', function (e) {
            self.input.handleKeyDown.call(self.input, e);
        });

    }

    /**
     * Initialize the screen.
     */
    initGameScreen() {
        this.welcome = false;
        this.menu = new PillarsMenu(this);
        this.menu.show();
        this.initPlayerDeck();
        this.initCardAreas();
        this.initPlayerSummaries();
    }

    /**
     * Player summaries.
     */
    initPlayerSummaries() {
        const m = new Mouseable();
        m.render = () => {
            this.renderPlayerSummaries();
        }
        this.addMouseable('player_summaries', m);
    }

   
    /**
     * Put a diagnostic message in the chat.
     */
    diag(msg: string) {
        if (this.isDiag) {
            this.broadcast('[Diag] ' + msg);
        }
    }


    /**
     * Return a reference to the canvas.
     */
    getCanvas() {
        return this.gameCanvas;
    }

    /**
     * Load sound files. This can only be done after user input.
     */
    initSounds() {
        if (this.sounds.size == 0 && !this.initializingSound) {
            this.initializingSound = true;
            this.addSound(PillarsSounds.SWOOSH);
            this.addSound(PillarsSounds.CLICK);
            this.addSound(PillarsSounds.CLOSE);
            this.addSound(PillarsSounds.SUCCESS);
            this.addSound(PillarsSounds.DICE);
            this.addSound(PillarsSounds.FAIL);
            this.addSound(PillarsSounds.PLAY);
            this.addSound(PillarsSounds.SHUFFLE);
            this.addSound(PillarsSounds.DISCARD);
            this.addSound(PillarsSounds.DING);
            this.addSound(PillarsSounds.PROMOTE);
            this.initializingSound = false;
        }
    }

    /**
     * Mute or unmute.
     */
    muteSounds() {
        this.muted = !this.muted;
    }

    /**
     * Initialize areas that hold cards.
     */
    initCardAreas() {
        
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
    }

    /**
     * Render a card.
     */
    renderCard(m: MouseableCard, isPopup?: boolean, scale?: number): any {
        this.cardRender.renderCard(m, isPopup, scale);
    }

    /**
     * Put all cards in play and hand into discard pile. Draw 6.
     */
    endTurn() {
        const player = this.localPlayer;

        // TODO - Move to the next player
        // For now while testing, keep giving the human more turns

        this.initCardAreas();

        this.broadcast(`${player.name} ended their turn.`);
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

        const m = new Mouseable();

        m.render = () => {


            // // Draw the big card placeholder in the center
            // this.renderCardImage(PillarsImages.IMG_BACK_BLUE,
            //     PillarsConstants.BIGCARDX, PillarsConstants.BIGCARDY, PillarsConstants.POPUP_SCALE);

            // Deck Label
            ctx.save();
            ctx.translate(PillarsConstants.DECKX - 5, 
                PillarsConstants.HAND_Y + PillarsConstants.CARD_HEIGHT / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = "center";
            ctx.font = this.getFont(16);
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            ctx.fillText(`DECK (${this.localPlayer.deck.length})`, 0, 0);
            ctx.restore();

            // Draw the deck if it has any cards in it
            if (this.localPlayer.deck.length > 0) {
                this.cardRender.renderCardImage(
                    PillarsImages.IMG_BACK_BLUE,
                    PillarsConstants.DECKX,
                    PillarsConstants.DECKY);
                if (this.localPlayer.deck.length > 1) {
                    this.cardRender.renderCardImage(
                        PillarsImages.IMG_BACK_BLUE,
                        PillarsConstants.DECKX + 5,
                        PillarsConstants.DECKY - 5);
                }
            } else {
                CanvasUtil.roundRect(this.ctx,
                    PillarsConstants.DECKX,
                    PillarsConstants.DECKY,
                    PillarsConstants.CARD_WIDTH,
                    PillarsConstants.CARD_HEIGHT,
                    PillarsConstants.CARD_RADIUS,
                    false, true);
            }

            // Hand label
            ctx.save();
            ctx.translate(PillarsConstants.HAND_X - 5, 
                PillarsConstants.HAND_Y + PillarsConstants.CARD_HEIGHT / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = "center";
            ctx.font = this.getFont(16);
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            ctx.fillText(`HAND (${this.localPlayer.hand.length})`, 0, 0);
            ctx.restore();

            ctx.fillStyle = 'green';
            CanvasUtil.roundRect(this.ctx,
                PillarsConstants.HAND_X,
                PillarsConstants.HAND_Y - 10,
                PillarsConstants.HAND_WIDTH + 10,
                PillarsConstants.CARD_HEIGHT + 20,
                PillarsConstants.FELT_RADIUS, true, true);
        }

        this.addMouseable('deck_static', m);

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
        discard.w = PillarsConstants.HAND_WIDTH;
        discard.h = PillarsConstants.CARD_HEIGHT + 20;
        discard.zindex = 0;
        discard.droppable = true;

        discard.render = () => {

            this.ctx.fillStyle = 'green';
            CanvasUtil.roundRect(this.ctx,
                PillarsConstants.DISCARD_X,
                PillarsConstants.DISCARD_Y - 10,
                PillarsConstants.HAND_WIDTH + 10,
                PillarsConstants.CARD_HEIGHT + 20,
                PillarsConstants.FELT_RADIUS, true, true);

            
            // Discard label
            this.ctx.save();
            this.ctx.translate(discard.x - 5, discard.y + PillarsConstants.CARD_HEIGHT / 2);
            this.ctx.rotate(-Math.PI / 2);
            this.ctx.textAlign = "center";
            this.ctx.font = this.getFont(16);
            this.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            this.ctx.fillText(`DISCARD (${this.localPlayer.discardPile.length})`, 0, 0)
            this.ctx.restore();
        };

        this.addMouseable(PillarsConstants.DISCARD_AREA_KEY, discard);

        this.initHandOrDiscard(false);
    }

    /**
     * Display a modal that shows a magnified copy of the card.
     */
    displayCardModal(mcard: MouseableCard, actionText?: string, action?: Function) {
        const card = mcard.card;

        const w = 600;
        const h = 800;
        const x = PillarsConstants.BW / 2 - w / 2;
        const y = 200;
        this.showModal('', undefined, { x, y, w, h });
        const cw = PillarsConstants.CARD_WIDTH;
        const ch = PillarsConstants.CARD_HEIGHT;

        const mag = new MouseableCard(card);
        const scale = 2.5;
        const sw = cw * scale;
        mag.x = x + w / 2 - sw / 2;
        mag.y = y + 50;
        mag.zindex = PillarsConstants.MODALZ + 1;
        mag.render = () => {
            this.renderCard(mag, false, scale);

            if (actionText && action) {
                // Play/Acquire
                const button = new Button(actionText, this.ctx);
                button.x = mag.x + (cw / 2) * scale - 100;
                button.y = mag.y + ch * scale + 50;
                button.w = 200;
                button.h = 100;
                button.zindex = PillarsConstants.MODALZ + 1;
                button.onclick = () => {
                    this.closeModal();
                    setTimeout(action, 200);
                };
                this.addMouseable(PillarsConstants.MODAL_KEY + '_mag_button', button);
            }
        }
        this.addMouseable(PillarsConstants.MODAL_KEY + '_magnified_card', mag);
    }

    /**
     * Initialize the local player's hand or discard pile.
     */
    initHandOrDiscard(isHand: boolean, isModal?: boolean, modalClick?: ModalCardClick,
        hideCard?: Card): any {

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

            // In modals, we don't want to show the card being played as 
            // a choice for things like retire and discard.
            if (hideCard && hideCard.uniqueIndex == card.uniqueIndex) {
                continue;
            }

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
                this.removeMouseable(hk);
            };

            // Draw a second copy unobstructed when hovering
            const hover = () => {

                // Is the necessary now?

                // const h = new MouseableCard(card);
                // h.x = m.x;
                // h.y = m.y;
                // this.addMouseable(hk, h);
                // h.render = () => {
                //     this.renderCard(h, true);
                // }
            };

            if (isModal === true) {
                // Select the card
                if (modalClick) {
                    m.onclick = () => {
                        modalClick(m);
                    };
                } else {
                    throw Error(`${card.name} missing modal click`);
                }
            } else {
                m.onhover = hover;
                m.onclick = () => {
                    if (isHand && this.gameState.canPlayCard(m.card)) {
                        this.displayCardModal(m, 'Play it!', () => {
                            this.playCard(m, () => {
                                this.finishPlayingCard(m, m.key);
                            });
                        });
                    }
                    else {
                        this.displayCardModal(m, undefined, undefined);
                    }
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
        this.removeMouseableKeys(PillarsConstants.PILLAR_START_KEY);

        for (let i = 0; i < this.gameState.pillars.length; i++) {
            const pillar = this.gameState.pillars[i];
            const m = new MouseableCard(this.gameState.pillars[i]);
            m.x = PillarsConstants.PILLARX;
            const offset = i * (PillarsConstants.CARD_HEIGHT * PillarsConstants.PILLAR_SCALE + 5);
            m.y = PillarsConstants.PILLARY + offset;
            m.render = () => {
                this.renderCard(m);
            }
            this.addMouseable(PillarsConstants.PILLAR_START_KEY + i, m);
        }

    }

    /**
     * Initialize the market after each change.
     */
    initMarket() {

        // Every time we change the market, remove all the mouseables start over
        this.removeMouseableKeys(PillarsConstants.MARKET_START_KEY);

        let marketx = PillarsConstants.MARKETX;
        let curx = marketx + 250;
        let cw = PillarsConstants.CARD_WIDTH + 10;
        let markety = PillarsConstants.MARKETY + 10;

        this.gameState.refillMarket();

        // Marketplace border
        const border = new Mouseable();
        border.x = marketx;
        border.y = markety;
        border.zindex = 0;
        border.render = () => {

            // this.ctx.strokeStyle = 'black';
            // this.ctx.fillStyle = 'purple';

            // CanvasUtil.roundRect(this.ctx,
            //     marketx, markety,
            //     PillarsConstants.MARKETW, 
            //     PillarsConstants.CARD_HEIGHT + 10, 
            //     30,
            //     true, true);

            const stackx = marketx + 25;
            const stacky = markety;

            // Sideways label
            this.ctx.save();
            this.ctx.translate(stackx - 5, stacky + PillarsConstants.CARD_HEIGHT / 2);
            this.ctx.rotate(-Math.PI / 2);
            this.ctx.textAlign = "center";
            this.ctx.font = this.getFont(16);
            this.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            this.ctx.fillText(`MARKET STACK (${this.gameState.marketStack.length})`, 0, 0);
            this.ctx.restore();

            if (this.gameState.marketStack.length > 0) {
                this.cardRender.renderCardImage(PillarsImages.IMG_BACK_BLUE,
                    stackx, stacky);
                this.cardRender.renderCardImage(PillarsImages.IMG_BACK_BLUE,
                    stackx + 5, stacky + 10);
            } else {
                CanvasUtil.roundRect(this.ctx,
                    stackx, stacky,
                    PillarsConstants.CARD_WIDTH, PillarsConstants.CARD_HEIGHT,
                    PillarsConstants.CARD_RADIUS, false, true);
            }
        }
        this.addMouseable(PillarsConstants.MARKET_START_KEY + 'border', border);

        const p = this.localPlayer;

        for (let i = 0; i < this.gameState.currentMarket.length; i++) {
            const card = this.gameState.currentMarket[i];
            if (card) {
                this.initHoverCard(card, curx, markety,
                    PillarsConstants.MARKET_START_KEY,
                    PillarsConstants.MARKET_HOVER_KEY,
                    i,
                    card.canAcquire(p.numCredits, p.numTalents),
                    PillarsConstants.REGION_MARKET);
            }
            curx += cw;
        }

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
        inPlay.x = PillarsConstants.INPLAYX + 20;
        inPlay.y = PillarsConstants.INPLAYY;
        inPlay.w = PillarsConstants.INPLAYW;
        inPlay.h = PillarsConstants.INPLAYH + 20;
        inPlay.zindex = 0;
        inPlay.droppable = true;
        inPlay.render = () => {

            // Sideways label
            this.ctx.save();
            this.ctx.translate(inPlay.x - 5, inPlay.y + PillarsConstants.CARD_HEIGHT / 2);
            this.ctx.rotate(-Math.PI / 2);
            this.ctx.textAlign = "center";
            this.ctx.font = this.getFont(16);
            this.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            this.ctx.fillText(`IN PLAY (${this.localPlayer.inPlay.length})`, 0, 0);
            this.ctx.restore();

            this.ctx.strokeStyle = 'black';
            this.ctx.fillStyle = 'green';
            CanvasUtil.roundRect(this.ctx,
                inPlay.x, inPlay.y,
                inPlay.w, inPlay.h,
                PillarsConstants.FELT_RADIUS, true, true);
        }
        this.addMouseable(PillarsConstants.INPLAY_AREA_KEY, inPlay);

        for (let i = 0; i < this.localPlayer.inPlay.length; i++) {
            const card = this.localPlayer.inPlay[i];

            // The old staggered layout
            // const numPerRow = 6;
            // const row = Math.floor(i / numPerRow);
            // const place = i % numPerRow;

            // const m = this.initHoverCard(card,
            //     PillarsConstants.INPLAYX + 10 + (50 * place),
            //     PillarsConstants.INPLAYY + 10 + (row * 10) + (10 * i),
            //     PillarsConstants.INPLAY_START_KEY,
            //     PillarsConstants.INPLAY_HOVER_KEY, i, false,
            //     PillarsConstants.REGION_INPLAY);

            const m = this.initHoverCard(card,
                PillarsConstants.INPLAYX + 30 + (50 * i),
                PillarsConstants.INPLAYY + 15,
                PillarsConstants.INPLAY_START_KEY,
                PillarsConstants.INPLAY_HOVER_KEY, i, false,
                PillarsConstants.REGION_INPLAY);

        }

    }

    /**
     * Draw a modal dialog that deactivates everything else until it is closed.
     */
    showModal(text: string, href?: string, xywh?: Xywh): Modal {
        this.modal = new Modal(this, text, href);
        if (xywh) {
            this.modal.x = xywh.x;
            this.modal.y = xywh.y;
            this.modal.w = xywh.w;
            this.modal.h = xywh.h;
        }
        this.modal.show();
        this.resizeCanvas();
        return this.modal;
    }

    /**
     * Close the modal.
     */
    closeModal(clickedClose?:boolean) {
        if (this.modal) {
            for (const [k, v] of this.mouseables.entries()) {
                if (k.startsWith(PillarsConstants.MODAL_KEY)) {
                    this.removeMouseable(k);
                }
            }
            this.modal = undefined;
            if (clickedClose) {
                this.playSound(PillarsSounds.CLOSE);
            }
        }
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
        index: number, draggable: boolean, region: string): MouseableCard {
        const m = new MouseableCard(card);
        m.x = x;
        m.y = y;
        m.origx = m.x;
        m.origy = m.y;
        m.draggable = draggable;
        m.zindex = index + 1;

        const tk = hoverKey + index;

        m.onmouseout = () => {
            this.removeMouseable(tk);
        };

        // Draw a second copy unobstructed when hovering
        const hover = () => {
            // const h = new MouseableCard(card);
            // h.x = m.x;
            // h.y = m.y;
            // this.addMouseable(tk, h);
            // h.render = () => {
            //     this.renderCard(h, true);
            // }
        };

        const player = this.gameState.currentPlayer;

        m.onhover = hover;
        m.onclick = () => {
            if (region == PillarsConstants.REGION_MARKET &&
                m.card.canAcquire(player.numCredits, player.numTalents)) {
                this.displayCardModal(m, 'Acquire it!', () => {
                    this.acquireCard(m.card, m.key);
                });
            }
            else {
                this.displayCardModal(m, undefined, undefined);
            }
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
    startLocalGame(callback:Function) {
        this.gameState = new GameState();
        this.isSoloGame = true;
        const localGame = new LocalGame(this.gameState);
        localGame.start();
        this.playSound(PillarsSounds.SHUFFLE);
        this.localPlayer = this.gameState.players[0];

        callback();
    }

    /**
     * Get them robots talking.
     */
    startAiChatter() {
        this.aiChatter = new AIChatter(this);
        this.aiChatter.chat();
    }

    /**
     * Turn diagnostics on or off.
     */
    toggleDiag() {
        this.isDiag = !this.isDiag;
    }


    /**
     * Load game state from the server.
     */
    loadGameState(callback:Function) {

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

        // Remove the mouseable card and any mouseables it contains
        this.removeMouseableKeys(key);

        // Remove from hand
        this.gameState.removeCardFromHand(this.localPlayer, m.card);

        this.initCardAreas();

        this.broadcast(`${this.localPlayer.name} played ${m.card.name}`);
    }

    /**
     * Play a card from the local player's hand.
     */
    playCard(mcard: MouseableCard, callback: Function) {

        console.log(`About to play ${mcard.card.name}. ${mcard.card.uniqueIndex}`);

        this.playSound(PillarsSounds.PLAY);
        const actions = new CardActions(this, mcard, callback);

        // TODO - When we open a dialog, the player can choose to close it
        // without taking an action, but this means we can't let them
        // take the main action before doing the complex secondary action.
        // In the real game, you do the main action first, like drawing a card
        // or gaining resources.

        actions.play();
    }

    /**
     * Retire a card.
     * 
     * This is called from modals where the player is choosing a card to retire.
     */
    retireCard(cardToRetire: MouseableCard, callback?:Function) {
        this.playSound(PillarsSounds.DISCARD);
        cardToRetire.card.retired = true;
        this.gameState.retiredCards.push(cardToRetire.card);
        this.removeMouseable(cardToRetire.key);
        this.removeMouseable(cardToRetire.getInfoKey());
        this.closeModal();
        if (callback) callback();
        this.broadcast(`${this.localPlayer.name} retired ${cardToRetire.card.name}`);
    }

    /**
     * Discard a card.
     * 
     * This is called from modals where the player is choosing a card to retire.
     */
    discard(cardToDiscard: MouseableCard, callback?:Function) {
        this.playSound(PillarsSounds.DISCARD);
        this.gameState.currentPlayer.discardPile.push(cardToDiscard.card);
        this.removeMouseable(cardToDiscard.key);
        this.removeMouseable(cardToDiscard.getInfoKey());
        this.closeModal();
        if (callback) callback();
        this.broadcast(`${this.localPlayer.name} discarded ${cardToDiscard.card.name}`);
    }

    /**
     * Broadcast a change to the game state.
     */
    broadcast(summary: string) {
        
        // TODO - Send game state to the server and deliver it to other players

        this.gameState.broadcastSummaries.push(summary);
        this.resizeCanvas();
    }

    /**
     * Respond to chat messages if ai is running.
     */
    respondToChat(chat: string) {
        if (this.aiChatter) {
            this.aiChatter.respond(chat);
        }
    }

    /**
     * Get the mousables map.
     */
    getMouseables(): Map<string, Mouseable> {
        return this.mouseables;
    }

    /**
     * Actions to take after acquiring a card.
     * 
     * Some cards have different behaviors when they are acquired.
     * All the common stuff that always happens goes here.
     */
    afterAcquireCard(card: Card, key: string, free?:boolean, callback?:Function) {

        this.removeMouseableKeys(key);

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

        if (!free) {
            // Subtract the cost from the player's current resources
            const cost = card.convertCost();
            this.localPlayer.numCredits -= cost.credits;
            this.localPlayer.numTalents -= cost.talents;
        }

        this.initCardAreas();

        callback?.();
    }

    /**
     * Acquire a card from the marketplace.
     */
    acquireCard(card: Card, key: string, free?:boolean, callback?:Function) {

        console.log(`About to acquire ${card.name}. ${card.uniqueIndex}`);

        if (card.subtype == 'Bug') {
            bug(this, card, () => {
                this.afterAcquireCard(card, key, free, callback);
                this.playSound(PillarsSounds.FAIL);
            });
        } else {
            this.localPlayer.discardPile.push(card);
            this.afterAcquireCard(card, key, free);
            this.playSound(PillarsSounds.CLICK);
            this.broadcast(`${this.gameState.currentPlayer.name} acquired ${card.name}`);
        }

    }

    /**
     * Add a sound.
     */
    addSound(name: string) {
        const baseUrl = '/audio/';
        const h = new Howl({ src: [`${baseUrl}${name}`] });
        h.volume(0.5); // ?
        this.sounds.set(name, h);
    }

    /**
     * Play a sound.
     */
    playSound(name: string): any {
        if (this.sounds && !this.muted) {
            const s = this.sounds.get(name);
            if (s) {
                s.volume(0.5); // Doesn't seem to work
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
     * Done loading images.
     */
    getDoneLoading(): boolean {
        return this.isDoneLoading;
    }

    /**
     * Get the die name for the player and rank.
     */
    getDieName(i: number, r: number) {
        return `img/die-${this.playerDiceColors[i]}-${r}-50x50.png`;
    }

    /**
     * Get the default font for ctx.
     */
    getFont(size: number, style?: string): string {
        if (!style) style = 'normal';
        return `normal ${style} ${size}px amazonember`;
    }

    /**
     * Get an animation by key.
     */
    getAnimation(key: string): PillarsAnimation | undefined {
        const a = this.animations.get(key);
        if (a) {
            return <PillarsAnimation>a;
        }
        return undefined;
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
        const d: PillarDieAnimation = new PillarDieAnimation();
        d.playerIndex = playerIndex;
        d.pillarIndex = pillarIndex;
        this.registerAnimation(d);

        this.playSound(PillarsSounds.PROMOTE);

        // TODO - Game end?
    }

    /**
     * Render the player chat area
     */
    renderChat() {

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'green';
        this.ctx.fillStyle = 'black';
        CanvasUtil.roundRect(this.ctx,
            PillarsConstants.CHATX, PillarsConstants.CHATY,
            PillarsConstants.CHATW, PillarsConstants.CHATH, 5, true, true);

        let numLines = 12;
        const chat = this.gameState.broadcastSummaries;
        if (chat.length < numLines) {
            numLines = chat.length;
        }

        const lineh = 17;

        for (let i = 0; i < numLines; i++) {
            const line = chat[chat.length - 1 - i];
            const offset = lineh * 2 + (lineh * i);
            const y = PillarsConstants.CHATY + PillarsConstants.CHATH - offset;

            this.ctx.fillStyle = 'limegreen';
            this.ctx.font = 'normal normal 20px courier';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${line}`,
                PillarsConstants.CHATX + 5, y, PillarsConstants.CHATW);
        }

        this.ctx.fillStyle = 'limegreen';
        this.ctx.font = 'normal bold 16px courier';
        this.ctx.textAlign = 'left';
        let cursor = '|'
        if (new Date().getTime() % 1000 < 500) {
            cursor = '';
        }
        this.ctx.fillText(`> ${this.input.typing}${cursor}`,
            PillarsConstants.CHATX + 5, PillarsConstants.CHATY + PillarsConstants.CHATH - lineh);
    }

    /**
     * Summaries of the other players. Current scores, etc.
     */
    renderPlayerSummaries() {

        for (let i = 0; i < 4; i++) {
            const p = this.gameState.players[i];
            let sx = 0;
            let sy = 0;

            switch (i) {
                case 0:
                    sx = PillarsConstants.SUMMARYX;
                    sy = PillarsConstants.SUMMARYY;
                    break;
                case 1:
                    sx = PillarsConstants.SUMMARYX + PillarsConstants.SUMMARYW + 1;
                    sy = PillarsConstants.SUMMARYY;
                    break;
                case 2:
                    sx = PillarsConstants.SUMMARYX;
                    sy = PillarsConstants.SUMMARYY + PillarsConstants.SUMMARYH + 1;
                    break;
                case 3:
                    sx = PillarsConstants.SUMMARYX + PillarsConstants.SUMMARYW + 1;
                    sy = PillarsConstants.SUMMARYY + PillarsConstants.SUMMARYH + 1;
                    break;
            }

            // Highlight the active player
            if (i == this.gameState.currentPlayer.index) {
                this.ctx.lineWidth = 5;
                this.ctx.strokeStyle = 'yellow';
            } else {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'gray';
            }

            // Player summary area
            this.ctx.strokeRect(sx, sy,
                PillarsConstants.SUMMARYW, PillarsConstants.SUMMARYH);

            // Player name
            this.ctx.font = this.getFont(14, 'bold');
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = 'silver';
            if (p.isHuman) {
                this.ctx.fillStyle = 'yellow';
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
            const sh = 30;
            const ry = sy + 30;
            const numBlanks = 12;
            this.ctx.lineWidth = 1;


            // Draw empty placeholders for the resources, 
            // then draw actual resources over that

            const renderResources = (img: HTMLImageElement, n: number, row: number) => {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'black';
                this.ctx.fillStyle = 'gray';
                CanvasUtil.roundRect(this.ctx, sx + 2, ry + sh * row - 4,
                    sw * numBlanks + 4, sh, 3, true, true);
                this.ctx.globalAlpha = 0.1;
                for (let i = 0; i < numBlanks; i++) {
                    this.ctx.drawImage(img, sx + 5 + (sw * i), ry + sh * row, sw, sw);
                }
                this.ctx.globalAlpha = 1;

                for (let i = 0; i < n; i++) {
                    this.ctx.drawImage(img, sx + 5 + (sw * i), ry + sh * row, sw, sw);
                }
            };

            renderResources(talent, p.numTalents, 0);
            renderResources(credits, p.numCredits, 1);
            renderResources(creativity, p.numCreativity, 2);

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
            const custx = sx + PillarsConstants.SUMMARYW - 105;
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
     * Draw the static parts of the canvas, scaling by width.
     */
    renderCanvas(w: number, h: number) {

        const ctx = this.ctx;
        const mx = this.input.mx;
        const my = this.input.my;

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

        // TODO - Remove this
        // ctx.strokeStyle = 'white';
        // CanvasUtil.roundRect(this.ctx, 0, 0,
        //     PillarsConstants.BW, PillarsConstants.BH, 20, false, true);

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


        // const currentPlayer = this.gameState.currentPlayer;
        // const currentColor = this.playerDiceColors[currentPlayer.index];

        // // Credits, Creativity, and Talent
        // if (this.isDoneLoading) {
        //     const resourcey = PillarsConstants.INPLAYY + PillarsConstants.INPLAYH - 110;
        //     this.drawResource(this.getImg(PillarsImages.IMG_CREDITS),
        //         PillarsConstants.INPLAYX + 50, resourcey, this.localPlayer.numCredits);
        //     this.drawResource(this.getImg(PillarsImages.IMG_CREATIVITY),
        //         PillarsConstants.INPLAYX + 150, resourcey, this.localPlayer.numCreativity);
        //     this.drawResource(this.getImg(PillarsImages.IMG_TALENT),
        //         PillarsConstants.INPLAYX + 250, resourcey, this.localPlayer.numTalents);
        // }



        //this.renderDice();


        // // Loading
        // const numImages = this.images.size;
        // let numLoaded = 0;
        // if (this.loadedImages) {
        //     for (const [key, value] of this.loadedImages.entries()) {
        //         if (value === true) {
        //             numLoaded++;
        //         }
        //     }
        // }
        // if (numLoaded < numImages) {
        //     ctx.font = this.getFont(36, 'bold');
        //     ctx.fillStyle = 'black';
        //     ctx.fillText(`Loaded ${numLoaded} of ${numImages} images`,
        //         (PillarsConstants.BW / 2) - 50, PillarsConstants.BH / 2);
        // }


        // Mouseables, drawn in zindex order
        const marray = this.sortMouseables();

        for (const m of marray) {

            let shouldRender = false;
            
            // Don't render anything but the welcome modal at first.
            if (this.welcome) {   
                if (m.key.startsWith(PillarsConstants.MODAL_KEY)) {
                    shouldRender = true;
                }
            } else {
                shouldRender = true;
            }

            if (m.render && shouldRender) {
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
        if (this.isDiag) {
            ctx.font = this.getFont(12);
            ctx.textAlign = 'left';
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            const dbx = PillarsConstants.CHATX + 5;
            const dby = PillarsConstants.CHATY + 11;
            ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
                `P: ${PillarsConstants.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
                `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
                `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}, ` +
                `as:${this.animations.size}, ` +
                `a:${this.isAnimating()}, d:${this.isDoneLoading}, ` +
                `FRa:${FrameRate.avg.toFixed(1)}, FRc:${FrameRate.cur.toFixed(1)}, ` +
                `msbl: ${this.mouseables.size}`,
                dbx, dby);
        }

    }

    /**
     * Resize the canvas according to the window size.
     */
    resizeCanvas() {

        let self = this;

        // Safari?
        // document.body.getBoundingClientRect().width

        const iw = window.innerWidth;
        const ih = window.innerHeight;

        // These are the same as iw, ih on all browsers except non-mobile Safari
        const dw = document.body.getBoundingClientRect().width;
        const dh = document.body.getBoundingClientRect().height;

        const actualW = (iw != dw) ? dw : iw;
        const actualH = (ih != dh) ? dh : ih;

        const pad = 10;

        let w = iw - pad;

        if (iw != dw) {
            w = dw - pad;
        }

        let h = w / PillarsConstants.PROPORTION;

        // We want the whole game to be visible regardless of window shape
        if (h > actualH) {
            h = actualH - pad;
            w = h * PillarsConstants.PROPORTION;
        }

        // Width and height scale
        const s = 1 / (PillarsConstants.BW / w);

        this.gameCanvas.width = w;
        this.gameCanvas.height = h;
        this.gameCanvas.style.top = "10px";
        this.gameCanvas.style.left = Math.floor((actualW - w) / 2) + "px";

        // Adjust for pixel ratio to reduce blurriness
        const pw = w * window.devicePixelRatio;
        const ph = h * window.devicePixelRatio;
        this.gameCanvas.width = pw;
        this.gameCanvas.height = ph;

        // Style also needs to be adjusted to avoid blurriness
        this.gameCanvas.style.width = w + 'px';
        this.gameCanvas.style.height = h + 'px';

        // Update the context.. (necessary for Safari?)
        this.ctx = <CanvasRenderingContext2D>this.gameCanvas.getContext("2d");

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
    getMousePos(evt: MouseEvent) {
        const canvas = this.gameCanvas;
        var rect = canvas.getBoundingClientRect();
        var scale = PillarsConstants.BW / rect.width;
        return {
            x: (evt.clientX - rect.left) * scale,
            y: (evt.clientY - rect.top) * scale
        };
    }

    /**
     * Get the position of the touch within the canvas.
     * Coordinates are relative to base width and height.
     */
    getTouchPos(evt: TouchEvent) {
        const canvas = this.gameCanvas;
        var rect = canvas.getBoundingClientRect();
        var scale = PillarsConstants.BW / rect.width;
        return {
            x: (evt.targetTouches[0].pageX - rect.left) * scale,
            y: (evt.targetTouches[0].pageY - rect.top) * scale
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

        const welcome = new Welcome(game);
        game.welcome = true;
        welcome.initWelcomePage();

        game.resizeCanvas();

    }
}

// Start the game
PillarsGame.init();
