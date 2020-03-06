import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsConfig } from '../config/pillars-config';
import * as ui from './ui-utils';
import {LocalGame} from './local-game';

/**
 * Pillars game UI. Initialized from index.html.
 */
class PillarsGame {

    // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsGame.BW / PillarsGame.BH;
    static readonly MARKETX = 850;
    static readonly MARKETY = 275;
    static readonly INPLAYX = 10;
    static readonly INPLAYY = PillarsGame.MARKETY;
    static readonly INPLAYW = 450;
    static readonly INPLAYH = 540;
    static readonly BIGCARDX = 480;
    static readonly BIGCARDY = PillarsGame.MARKETY + 15;
    static readonly MARKET_START_KEY = 'market_';
    static readonly MARKET_HOVER_KEY = 'market_hover';
    static readonly HAND_START_KEY = 'hand_';
    static readonly HAND_HOVER_KEY = 'hand_hover_';
    static readonly DISCARD_START_KEY = 'discard_';
    static readonly DISCARD_HOVER_KEY = 'discard_hover_';
    static readonly HAND_X = 280;
    static readonly HAND_Y = PillarsGame.BH - 250;
    static readonly DISCARD_X = 1000;
    static readonly DISCARD_Y = PillarsGame.BH - 250;
    static readonly HAND_WIDTH = 600;
    static readonly PILLARX = 650;
    static readonly PILLARY = 10;
    static readonly PILLARW = 195;

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
    animations: Map<string, ui.PillarsAnimation>;

    /**
     * Interactive regions.
     */
    mouseables: Map<string, ui.Mouseable>;

    /**
     * Sound files. (Using howler)
     */
    sounds: Map<string, Howl>;

    /**
     * All cards in the database keyed by card name.
     */
    cards: Map<string, Card>;

    /**
     * The local person playing.
     */
    localPlayer: Player;

    /**
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

        this.animations = new Map<string, ui.PillarsAnimation>();
        this.mouseables = new Map<string, ui.Mouseable>();
        this.sounds = new Map<string, Howl>();
        this.images = new Map<string, HTMLImageElement>();

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
            ui.PillarsImages.IMG_CREDITS,
            ui.PillarsImages.IMG_CREATIVITY,
            ui.PillarsImages.IMG_TALENT,
            ui.PillarsImages.IMG_LOGO,
            ui.PillarsImages.IMG_BG,
            ui.PillarsImages.IMG_BACK_GREEN,
            ui.PillarsImages.IMG_BACK_ORANGE,
            ui.PillarsImages.IMG_BACK_PINK,
            ui.PillarsImages.IMG_BACK_BLUE
        ];

        // Add dice image names
        for (let i = 0; i < this.playerDiceColors.length; i++) {
            for (let j = 1; j < 7; j++) {
                const dieName = this.getDieName(i, j);
                imageNames.push(dieName);
            }
        }

        for (const [k, v] of this.gameState.cardMasters.entries()) {
            imageNames.push(v.getImageName());
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

        // A button
        this.initTestButton();

        // Hand
        this.initHand();

        // Pillars
        this.initPillars();

        // Market
        this.initMarket();
    }

    /**
     * Initialize a button I use for testing things.
     */
    initTestButton() {
        const self = this;

        const button = new ui.Mouseable();
        button.x = PillarsGame.BW - 105;
        button.y = PillarsGame.BH - 55;
        button.w = 100;
        button.h = 50;
        button.onclick = function () {
            self.promote(0, 0);
            self.roll(2);
            self.gameState.drawOne(self.localPlayer);
            self.initHand();
            self.initDiscard();
        };
        button.draw = function () {
            self.ctx.strokeStyle = 'black';
            self.ctx.fillStyle = 'lightgray';
            if (button.hovering) {
                self.ctx.fillStyle = 'blue';
            }
            CanvasUtil.roundRect(self.ctx, button.x, button.y, button.w, button.h,
                5, true, true);
        };
        this.mouseables.set('testbutton', button);
    }

    /**
     * Remove all mouesables that start with the specified string.
     */
    removeMouseableKeys(startsWith:string) {
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
    drawPlayerDeck() {
        
        const ctx = this.ctx;

        // Draw the big card placeholder in the center
        this.drawCardImage(ui.PillarsImages.IMG_BACK_BLUE, 
            PillarsGame.BIGCARDX, PillarsGame.BIGCARDY, true);

        // Deck Label
        ctx.save();
        ctx.translate(30, PillarsGame.HAND_Y + 100);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = "center";
        ctx.font = 'normal bold 24px arial';
        ctx.fillText("Deck", 0, 0);
        ctx.restore();

        // Draw the deck if it has any cards in it
        if (this.localPlayer.deck.length > 0) {
            this.drawCardImage(ui.PillarsImages.IMG_BACK_BLUE, 50, PillarsGame.BH - 250);
            if (this.localPlayer.deck.length > 1) {
                this.drawCardImage(ui.PillarsImages.IMG_BACK_BLUE, 55, PillarsGame.BH - 255);
            }
        } else {
            CanvasUtil.roundRect(this.ctx, 50, PillarsGame.BH - 250, 
                ui.MouseableCard.CARD_WIDTH, ui.MouseableCard.CARD_HEIGHT, 
                ui.MouseableCard.CARD_RADIUS, false, true);
        }

        // Hand label
        ctx.save();
        ctx.translate(PillarsGame.HAND_X - 5, PillarsGame.HAND_Y + 100);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = "center";
        ctx.font = 'normal bold 24px arial';
        ctx.fillText("Hand", 0, 0);
        ctx.restore();

        CanvasUtil.roundRect(this.ctx, PillarsGame.HAND_X, PillarsGame.HAND_Y - 5, 
            PillarsGame.HAND_WIDTH + 10, 250, 10, false, true);

        // Discard label
        ctx.save();
        ctx.translate(PillarsGame.DISCARD_X - 5, PillarsGame.DISCARD_Y + 100);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = "center";
        ctx.font = 'normal bold 24px arial';
        ctx.fillText("Discard", 0, 0);
        ctx.restore();
        
        CanvasUtil.roundRect(this.ctx, PillarsGame.DISCARD_X, PillarsGame.DISCARD_Y - 5, 
            PillarsGame.HAND_WIDTH + 10, 250, 10, false, true);

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
        this.initHandOrDiscard(false);
    }

    /**
     * Initialize the local player's hand or discard pile.
     */
    initHandOrDiscard(isHand: boolean) {

        let startKey = PillarsGame.HAND_START_KEY;
        let hoverKey = PillarsGame.HAND_HOVER_KEY;
        let x = PillarsGame.HAND_X;
        let y = PillarsGame.HAND_Y;
        let a = this.localPlayer.hand;

        if (!isHand) {
            startKey = PillarsGame.DISCARD_START_KEY;
            hoverKey = PillarsGame.DISCARD_HOVER_KEY;
            x = PillarsGame.DISCARD_X;
            y = PillarsGame.DISCARD_Y;
            a = this.localPlayer.discardPile;
        }

        // Every time we change the source, remove all the mouseables
        this.removeMouseableKeys(startKey);
        this.removeMouseableKeys(hoverKey);

        // Space the cards out evenly
        let len = a.length;
        if (len == 0) {
            len = 1;
        }
        const cardOffset = (PillarsGame.HAND_WIDTH - ui.MouseableCard.CARD_WIDTH) / len;

        for (let i = 0; i < a.length; i++) {
            const card = a[i];
            const m = new ui.MouseableCard(card);
            m.x = x + 10 + (i * cardOffset);
            m.y = y;
            this.mouseables.set(startKey + i, m);

            // Well... now our mouseover areas are all wrong...
            // Figure out the overlaps and change the mouseable areas
            for (const [k, v] of this.mouseables.entries()) {
                if (k.startsWith(startKey) && k != (startKey + i)) {
                    v.hitWidth = cardOffset;
                }
            }

            const hk = hoverKey + i;

            m.onmouseout = () => {
                this.mouseables.delete(hk);
            };

            // Draw a second copy unobstructed when hovering
            const hoverOrClick = () => {
                const h = new ui.MouseableCard(card);
                h.x = m.x;
                h.y = m.y;
                this.mouseables.set(hk, h);
                h.draw = () => {
                    this.drawCard(h, true);
                }
            };

            m.onhover = hoverOrClick;
            m.onclick = hoverOrClick;

            m.draw = () => {
                this.drawCard(m);
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
            const m = new ui.MouseableCard(this.gameState.pillars[i]);
            m.x = PillarsGame.PILLARX + (i * PillarsGame.PILLARW);
            m.y = PillarsGame.PILLARY;
            m.draw = () => {
                this.drawCard(m);
            }
            this.mouseables.set('pillar_' + i, m);
        }

    }

    /**
     * Initialize the market after each change.
     */
    initMarket() {

        // Every time we change the market, remove all the mouseables start over
        this.removeMouseableKeys(PillarsGame.MARKET_START_KEY);

        let marketx = PillarsGame.MARKETX;
        let curx = marketx + 228;
        let cw = 200;
        let markety = PillarsGame.MARKETY + 10;

        this.gameState.refillMarket();

        for (let i = 0; i < this.gameState.currentMarket.length; i++) {
            const card = this.gameState.currentMarket[i];
            if (i == 3) {
                // 2nd row
                markety += 260;
                curx = marketx + 25;
            }
            if (card) {
                const m = new ui.MouseableCard(card);
                m.x = curx;
                m.y = markety;

                const hk = PillarsGame.MARKET_HOVER_KEY + i;

                m.onmouseout = () => {
                    this.mouseables.delete(hk);
                };
    
                // Draw a second copy unobstructed when hovering
                const hoverOrClick = () => {
                    const h = new ui.MouseableCard(card);
                    h.x = m.x;
                    h.y = m.y;
                    this.mouseables.set(hk, h);
                    h.draw = () => {
                        this.drawCard(h, true);
                    }
                };
    
                m.onhover = hoverOrClick;
                m.onclick = hoverOrClick;

                m.draw = () => {
                    this.drawCard(m);
                };

                this.mouseables.set(PillarsGame.MARKET_START_KEY + i, m);
            }
            curx += cw;
        }

        this.resizeCanvas();
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
    registerAnimation(animation: ui.PillarsAnimation) {
        animation.timeStarted = new Date().getTime();
        this.animations.set(animation.getKey(), animation);
    }

    /**
     * Returns true if there are any animations running.
     */
    isAnimating(): boolean {
        return (this.animations && this.animations.size > 0);
    }

    /*
     * Handle mouse move events.
     */
    handleMouseMove(e: MouseEvent) {
        const poz = this.getMousePos(this.gameCanvas, e);
        this.mx = poz.x;
        this.my = poz.y;

        for (const [key, m] of this.mouseables.entries()) {
            if (m.hitTest(this.mx, this.my)) {
                if (m.onmouseover) {
                    m.onmouseover();
                }
                m.hovering = true;
                if (m.onhover) {
                    m.onhover();
                }
            } else {
                if (m.hovering) {
                    if (m.onmouseout) {
                        m.onmouseout();
                    }
                    m.hovering = false;
                }
            }
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

        // Animate each click location
        const click: ui.ClickAnimation = new ui.ClickAnimation();
        click.x = mx;
        click.y = my;
        this.registerAnimation(click);

        let clickedSomething = false;

        // Look at mouseables
        for (const [key, m] of this.mouseables.entries()) {
            if (m.onclick && m.hitTest(mx, my)) {
                m.onclick();
                clickedSomething = true;
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

        // We have to wait for user interaction to load sounds
        if (this.sounds.size == 0) {
            this.addSound('swoosh.wav');
            this.addSound('menuselect.wav');
        }

        this.playSound('menuselect.wav');

        this.resizeCanvas();
    }

    /**
     * Check to see if a card in hand was double clicked.
     * 
     * If so, play it.
     */
    checkHandDoubleClick(mx:number, my:number) {

        let key = null;
        for (const k of this.mouseables.keys()) {
            if (k.startsWith(PillarsGame.HAND_START_KEY)) {
                const m = <ui.MouseableCard>this.mouseables.get(k);
                if (m.hitTest(mx, my)) {
                    key = k;
                    break;
                }
            }
        }

        if (key) {
            const m = <ui.MouseableCard>this.mouseables.get(key);

            // TODO - Make sure the card can legally be played.

            // Play the card
            this.localPlayer.inPlay.push(m.card);
            this.mouseables.delete(key);
            let indexToRemove = -1;
            for (let i = 0; i < this.localPlayer.hand.length; i++) {
                if (this.localPlayer.hand[i].uniqueIndex == m.card.uniqueIndex) {
                    indexToRemove = i;
                }
            }
            if (indexToRemove > -1) {
                this.localPlayer.hand.splice(indexToRemove, 1);
            } else {
                throw Error('Unable to remove card from hand');
            }

            // Play the card's effects!
            this.playCard(m.card);

            this.initHand();
        }
    }

    /**
     * Play a card from the local player's hand.
     */
    playCard(card:Card) {

        const player = this.localPlayer;

        if (card.provides) {
            if (card.provides.Talent) {
                player.numTalents += card.provides.Talent;
            }
            if (card.provides.Credit) {
                player.numCredits += card.provides.Credit;
            }
            if (card.provides.Creativity) {
                player.numCreativity += card.provides.Creativity;
            }
            if (card.provides.Customer) {
                player.numCustomers += card.provides.Customer;
            }
            if (card.provides.CreditByPillar) {
                player.numCredits += player.pillarRanks[card.provides.CreditByPillar];
            }
            if (card.provides.TalentByPillar) {
                player.numTalents += player.pillarRanks[card.provides.TalentByPillar];
            }
            if (card.provides.CreativityByPillar) {
                player.numCreativity += player.pillarRanks[card.provides.CreativityByPillar];
            }
        }

        if (card.action) {
            if (card.action.Retire) {

            }
            if (card.action.Promote) {
                // 0-4 means that pillar
                // 5 means any
                // 6 means roll a d6
            }
            if (card.action.Draw) {
                for (let i = 0; i < card.action.Draw; i++) {
                    this.gameState.drawOne(player);
                }
            }
        }

        // Some cards need special handling for custom conditions
        // Ops Workshop
        // Security Workshop
        // Reliability Workshop
        // Performance Workshop
        // Predictive Autoscaling
        // Competitive Research
        // CloudFormation
        // Poach
        // Guard Duty
        // Chaos Testing
        // Think Tank
        // Talented Jerk
        // Promoted to VP
        // Cloud 9
        // Outsourcing
        // Senior Developer
        // AWS Lambda
        // SQS
        // EBS Volume
        // Stack Overflow
        // S3 Bucket
        // First to Market
        // WAF
        // Job Fair
        // Forecast
        // Sagemaker
        // Database Migration
        // Collaboration
        // Patent Awarded

        this.broadcast(`${player.name} played ${card.name}`);
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
     * 
     * TODO - Highlight cards the player can buy.
     */
    checkMarketDoubleClick(mx:number, my:number) {

        let key = null;
        for (const k of this.mouseables.keys()) {
            if (k.startsWith(PillarsGame.MARKET_START_KEY)) {
                const m = <ui.MouseableCard>this.mouseables.get(k);
                if (m.hitTest(mx, my)) {
                    key = k;
                    break;
                }
            }
        }

        const p = this.localPlayer;

        if (key) {
            const m = <ui.MouseableCard>this.mouseables.get(key);

            if (m.card.canAcquire(p.numCredits, p.numTalents)) {
                this.acquireCard(m.card, key);
            }
        }
    }

    /**
     * Acquire a card from the marketplace.
     */
    acquireCard(card:Card, key:string) {
        
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

        this.initHand();
        this.initDiscard();
        this.initMarket();
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
    playSound(name: string) {
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
     * Draw a card using an image file.
     * 
     * The image has to be scaled and masked.
     */
    drawCardImage(name: string, x: number, y: number, isPopup?:boolean) {

        if (!this.isDoneLoading) {
            return;
        }

        const ctx = this.ctx;

        ctx.save();

        // Draw a mask

        let radius = ui.MouseableCard.CARD_RADIUS;
        let width = ui.MouseableCard.CARD_WIDTH;
        let height = ui.MouseableCard.CARD_HEIGHT;

        if (isPopup === true) {
            radius = radius * 2;
            width = width * 2;
            height = height * 2;
        }

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
        let scale = 0.25;
        let offset = 14.5;
        if (isPopup === true) {
            scale = 0.50;
            offset = 29;
        }
        ctx.drawImage(img, x - offset, y - offset, img.width * scale, img.height * scale);

        ctx.restore();
    }

    /**
     * Get the die name for the player and rank.
     */
    getDieName(i: number, r: number) {
        return `img/die-${this.playerDiceColors[i]}-${r}-50x50.png`;
    }

    /**
     * Draw a 6-sided die.
     */
    drawDie(x: number, y: number, playerIndex: number, rank: number,
        a?: ui.PillarsAnimation) {
        const img = this.getImg(this.getDieName(playerIndex, rank));
        if (a) {
            x += 2;
            y += 2;
        }
        if (img) {
            this.ctx.drawImage(img, x, y);
        }
    }

    /**
     * Draw a card.
     */
    drawCard(m: ui.MouseableCard, isPopup?: boolean) {
        const card = m.card;
        const ctx = this.ctx;
        let x = m.x;
        let y = m.y;
        let w = m.w;
        let h = m.h;
        let radius = ui.MouseableCard.CARD_RADIUS;
        let p = this.localPlayer;

        if (isPopup) {
            radius *= 2;
            x = PillarsGame.BIGCARDX;
            y = PillarsGame.BIGCARDY;
            w *= 2;
            h *= 2;
        }

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

        // Card Name
        ctx.font = 'normal normal 9px arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        const imgFileName = m.card.getImageName();

        const img = this.images.get(imgFileName);
        if (img) {
            this.drawCardImage(imgFileName, x, y, isPopup);
        } 

        ctx.fillText(card.name, x + w / 2, y + 20);

        switch (card.type) {
            case "Pillar":

                const pidx: number = card.pillarIndex || 0;

                // Draw the roman numeral
                ctx.font = 'normal bold 24px arial';
                ctx.fillStyle = 'blue';
                ctx.fillText(card.pillarNumeral || '', x + w / 2, y + h / 2 + 20);
                ctx.strokeStyle = 'black';
                ctx.strokeText(card.pillarNumeral || '', x + w / 2, y + h / 2 + 20);

                // Draw player rank dice

                const p: Array<any> = [];
                p[0] = { x: 5, y: 30 };
                p[1] = { x: w - 55, y: 30 };
                p[2] = { x: 5, y: h - 55 };
                p[3] = { x: w - 55, y: h - 55 };

                for (let i = 0; i < this.gameState.players.length; i++) {

                    ctx.font = 'normal bold 16px arial';
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black';

                    const player = this.gameState.players[i];

                    const animKey = ui.DieAnimation.GetKey(i, pidx);
                    const a = <ui.PillarsAnimation>this.animations.get(animKey);

                    this.drawDie(x + p[i].x, y + p[i].y, i, player.pillarRanks[pidx], a);
                }

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

        ctx.font = 'normal bold 18px arial';
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
        const d: ui.DieAnimation = new ui.DieAnimation();
        d.playerIndex = playerIndex;
        d.pillarIndex = pillarIndex;
        this.registerAnimation(d);

        this.playSound('swoosh.wav');

        // TODO - Game end?
    }

    /**
     * Summaries of the other players. Current scores, etc.
     */
    drawPlayerSummaries() {
        const summaryx = 10;
        const summaryy = 10;
        const summaryw = 300;
        const summaryh = 110;

        for (let i = 0; i < 4; i++) {
            const p = this.gameState.players[i];
            let sx = 0;
            let sy = 0;
            this.ctx.fillStyle = 'silver';
            if (p.isHuman) {
                this.ctx.fillStyle = 'black';
            }
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

            this.ctx.strokeRect(sx, sy, summaryw, summaryh);
            this.ctx.fillText(p.name, sx + 5, sy + 20);
            this.ctx.fillText(`T:${p.numTalents}, $: ${p.numCredits}, ` +
                `Cy:${p.numCreativity}`, sx + 5, sy + 45);
            this.ctx.fillText(`Customers: ${p.numCustomers}`, sx + 5, sy + summaryh - 10);

            this.ctx.lineWidth = 1;
            this.ctx.font = 'normal normal 12px arial';
            this.ctx.fillText(`> ${this.gameState.getLastBroadcastSummary()}`, 
                summaryx, summaryy + (summaryh * 2) + 15);
        }
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
     * Draw the canvas, scaling by width.
     */
    draw(w: number, h: number) {

        const ctx = this.ctx;
        const mx = this.mx;
        const my = this.my;

        ctx.clearRect(0, 0, w, h);

        // Width and height scale
        const s = 1 / (PillarsGame.BW / w);

        // Outer Border
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, w, h);
        ctx.lineWidth = 1;

        // Scale the context to match the window size
        ctx.scale(s * window.devicePixelRatio, s * window.devicePixelRatio);

        // Background
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(0, 0, PillarsGame.BW, PillarsGame.BH);

        if (this.isDoneLoading) {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(this.getImg(ui.PillarsImages.IMG_BG), 0, 0);
            ctx.globalAlpha = 1;
        }

        // // Logo
        // if (this.isDoneLoading) {
        //     ctx.save();
        //     ctx.beginPath();
        //     ctx.arc(60, 60, 50, 0, Math.PI * 2, false);
        //     ctx.clip();
        //     ctx.drawImage(this.getImg(ui.PillarsImages.IMG_LOGO), 10, 10);
        //     ctx.restore();
        // }

        const currentPlayer = this.gameState.currentPlayer;
        const currentColor = this.playerDiceColors[currentPlayer.index];

        // In Play
        
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'green';
        CanvasUtil.roundRect(this.ctx, PillarsGame.INPLAYX, PillarsGame.INPLAYY, 
            PillarsGame.INPLAYW, PillarsGame.INPLAYH,
            30, true, true);

        for (let i = 0; i < this.localPlayer.inPlay.length; i++) {
            const c = this.localPlayer.inPlay[i];
            const m = new ui.MouseableCard(c);
            m.x = PillarsGame.INPLAYX + (50 * i);
            m.y = PillarsGame.INPLAYY + 100;
            this.drawCard(m);
        }

        // Credits, Creativity, and Talent
        if (this.isDoneLoading) {
            const resourcey = PillarsGame.INPLAYY + PillarsGame.INPLAYH - 110;
            this.drawResource(this.getImg(ui.PillarsImages.IMG_CREDITS),
                PillarsGame.INPLAYX + 50, resourcey, this.localPlayer.numCredits);
            this.drawResource(this.getImg(ui.PillarsImages.IMG_CREATIVITY),
                PillarsGame.INPLAYX + 150, resourcey, this.localPlayer.numCreativity);
            this.drawResource(this.getImg(ui.PillarsImages.IMG_TALENT),
                PillarsGame.INPLAYX + 250, resourcey, this.localPlayer.numTalents);
        }

        // Player deck
        this.drawPlayerDeck();
        
        // Marketplace
        let marketx = PillarsGame.MARKETX;
        let markety = PillarsGame.INPLAYY;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'purple';
        CanvasUtil.roundRect(this.ctx, marketx, markety, 845, PillarsGame.INPLAYH, 30,
            true, true);

        if (this.gameState.marketStack.length > 0) {
            this.drawCardImage(ui.PillarsImages.IMG_BACK_BLUE, marketx + 20, markety + 15);
            this.drawCardImage(ui.PillarsImages.IMG_BACK_BLUE, marketx + 25, markety + 10);
        } else {
            CanvasUtil.roundRect(this.ctx, marketx + 20, markety + 15, 
                ui.MouseableCard.CARD_WIDTH, ui.MouseableCard.CARD_HEIGHT, 
                ui.MouseableCard.CARD_RADIUS, false, true);
        }
        // Trials
        const trialx = PillarsGame.BW - 210;

        // Phase 1
        this.drawCardImage(ui.PillarsImages.IMG_BACK_GREEN, trialx, 50);
        this.drawCardImage(ui.PillarsImages.IMG_BACK_GREEN, trialx + 5, 45);

        // Phase 2
        this.drawCardImage(ui.PillarsImages.IMG_BACK_ORANGE, trialx, 310);
        this.drawCardImage(ui.PillarsImages.IMG_BACK_ORANGE, trialx + 5, 305);

        // Phase 3
        this.drawCardImage(ui.PillarsImages.IMG_BACK_PINK, trialx, 570);
        this.drawCardImage(ui.PillarsImages.IMG_BACK_PINK, trialx + 5, 565);

        // Dice rolling area
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(trialx + 80, 925, 100, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;

        // Draw rolled dice
        if (currentPlayer.lastDiceRoll.length > 1) {
            this.drawDie(trialx + 30, 870,
                currentPlayer.index, currentPlayer.lastDiceRoll[0]);
            if (currentPlayer.lastDiceRoll.length == 2) {
                this.drawDie(trialx + 90, 920,
                    currentPlayer.index, currentPlayer.lastDiceRoll[1]);
            }
        }

        // Player summaries
        this.drawPlayerSummaries();

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
            ctx.font = 'normal bold 36px arial';
            ctx.fillStyle = 'black';
            ctx.fillText(`Loaded ${numLoaded} of ${numImages} images`, 
                (PillarsGame.BW / 2) - 50, PillarsGame.BH / 2);
        }

        // Mouseables
        for (const [key, m] of this.mouseables.entries()) {

            // TODO zindex?

            if (m.draw) {
                m.draw();
            }
        }

        // Run animation logic
        for (const [key, value] of this.animations.entries()) {
            value.animate(this.ctx, () => {
                this.deleteAnimation(key);
            });
        }

        // Debugging data
        ctx.font = "normal normal 9px arial";
        ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
            `P: ${PillarsGame.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
            `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
            `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}, ` +
            `as:${this.animations.size}, ` +
            `a:${this.isAnimating()}, d:${this.isDoneLoading}, ` +
            `FRa:${ui.FrameRate.avg.toFixed(1)}, FRc:${ui.FrameRate.cur.toFixed(1)}`,
            1200, PillarsGame.BH - 5);
    }

    /**
     * Resize the canvas according to the window size.
     */
    resizeCanvas() {

        let self = this;

        let w = window.innerWidth - 40;
        let h = w / PillarsGame.PROPORTION;

        // We want the whole game to be visible regardless of window shape
        if (h > window.innerHeight) {
            h = window.innerHeight - 40;
            w = h * PillarsGame.PROPORTION;
        }

        this.gameCanvas.width = w;
        this.gameCanvas.height = h;

        // Try to adjust for pixel ration to reduce blurriness.. ?
        this.gameCanvas.width = w * window.devicePixelRatio;
        this.gameCanvas.height = h * window.devicePixelRatio;
        this.gameCanvas.style.width = w + 'px';
        this.gameCanvas.style.height = h + 'px';

        this.draw(w, h);

        // Call this every time the browser decides to redraw the screen, 
        // while we are animating something.
        if (this.isAnimating()) {
            window.requestAnimationFrame(function (e) {
                self.resizeCanvas.call(self);
            });
        }

        ui.FrameRate.update();
    }

    /**
     * Get the position of the mouse within the canvas.
     * Coordinates are relative to base width and height.
     */
    getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
        var rect = canvas.getBoundingClientRect();
        var scale = PillarsGame.BW / rect.width;
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
