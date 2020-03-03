import { cardDatabase } from '../lambdas/card-database';
import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsWebConfig } from './web-config';
import * as ui from './ui-utils';

/**
 * Pillars game UI. Initialized from index.html.
 */
class PillarsGame {

    // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsGame.BW / PillarsGame.BH;
    static readonly MARKETX = 720;
    static readonly MARKETY = 275;

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
     * The 5 pillars of the Well-Architected Framework.
     */
    pillars: Array<Card>;

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

        this.pillars = [];
        this.animations = new Map<string, ui.PillarsAnimation>();
        this.mouseables = new Map<string, ui.Mouseable>();
        this.sounds = new Map<string, Howl>();
        this.images = new Map<string, HTMLImageElement>();
        this.cards = new Map<string, Card>();

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

        for (let i = 0; i < this.playerDiceColors.length; i++) {
            for (let j = 1; j < 7; j++) {
                const dieName = this.getDieName(i, j);
                imageNames.push(dieName);
            }
        }

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

        // A button
        const button = new ui.Mouseable();
        button.x = PillarsGame.BW - 400;
        button.y = PillarsGame.BH - 100;
        button.w = 100;
        button.h = 50;
        button.onclick = function () {
            self.promote(0, 0);
            self.roll(2);
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

        // Hand
        const handx = 280;
        for (let i = 0; i < this.localPlayer.hand.length; i++) {
            const card = this.localPlayer.hand[i];
            const m = new ui.MouseableCard(card);
            m.x = handx + (i * 200);
            m.y = PillarsGame.BH - 250;
            this.mouseables.set('hand_' + i, m);

            const hoverKey = 'hand_hover_' + i;

            m.onmouseout = () => {
                this.mouseables.delete(hoverKey);
            };

            // Draw a second copy unobstructed when hovering
            m.onhover = () => {

                const h = new ui.MouseableCard(card);
                h.x = 500;
                h.y = PillarsGame.BH - 500;

                this.mouseables.set(hoverKey, h);

                h.draw = () => {
                    this.drawCard(h);
                }
            };

            m.draw = () => {
                this.drawCard(m);
            };
        }

        // Pillars
        const pillary = 10;
        const pillarw = 200;
        const px = 600;
        for (let i = 0; i < this.pillars.length; i++) {
            const pillar = this.pillars[i];
            const m = new ui.MouseableCard(this.pillars[i]);
            m.x = px + (i * pillarw);
            m.y = pillary;
            m.draw = () => {
                this.drawCard(m);
            }
            this.mouseables.set('pillar_' + i, m);
        }

        let marketx = PillarsGame.MARKETX;
        let curx = marketx + 228;
        let cw = 205;
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

                // TODO - How do we alter this when cards change?
                const m = new ui.MouseableCard(card);
                m.x = curx;
                m.y = markety;
                m.draw = () => {
                    //console.log(`Drawing card ${m.card.name} at ${m.x}, ${m.y}`);
                    this.drawCard(m);
                };
                this.mouseables.set('market_' + i, m);
            }
            curx += cw;
        }


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

        const gs = this.gameState;
        gs.pillarMax = 6;


        // Create players (1 human and 3 AI)
        const human = new Player();
        human.isHuman = true;
        human.name = "Human";
        human.index = 0;

        gs.players.push(human);
        gs.currentPlayer = human;
        this.localPlayer = human;

        for (let i = 0; i < 3; i++) {
            const ai = new Player();
            ai.isHuman = false;
            ai.name = `AI${i + 1}`;
            ai.index = (i + 1);
            gs.players.push(ai);
        }

        // Load the card database
        for (let i = 0; i < cardDatabase.cards.length; i++) {
            const card = <Card>cardDatabase.cards[i];

            this.cards.set(card.name, card);

            switch (card.type) {
                case 'Resource':
                    if (card.starter) {
                        // Put copies in each player's deck
                        for (let i = 0; i < gs.players.length; i++) {
                            const player = gs.players[i];
                            for (let j = 0; j < card.copies / 4; j++) {
                                const copy = <Card>Object.assign({}, card);
                                player.deck.push(copy);
                            }
                        }
                    } else {
                        gs.marketStack.push(<Card>Object.assign({}, card));
                    }
                    break;
                case 'Trial':
                    const c = <Card>Object.assign({}, card);
                    switch (c.name) {
                        case 'Phase I':
                            gs.trialStacks[0].notused.push(c);
                            break;
                        case 'Phase II':
                            gs.trialStacks[1].notused.push(c);
                            break;
                        case 'Phase III':
                            gs.trialStacks[2].notused.push(c);
                            break;
                    }
                    break;
                case 'Pillar':
                    this.pillars.push(<Card>Object.assign({}, card));
                    break;
            }
        }

        // Shuffle decks
        for (let i = 0; i < this.gameState.players.length; i++) {
            const player = this.gameState.players[i];
            GameState.shuffle(player.deck);
        }

        // Shuffle market deck
        GameState.shuffle(this.gameState.marketStack);

        // Shuffle trial stacks
        for (const t of this.gameState.trialStacks) {
            GameState.shuffle(t.notused);
        }

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

        // Look at mouseables
        for (const [key, m] of this.mouseables.entries()) {
            if (m.onclick && m.hitTest(mx, my)) {
                m.onclick();
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
     * Add a sound.
     */
    addSound(name: string) {
        const baseUrl = PillarsWebConfig.AudioUrl;
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
     * Draw the back of a card.
     */
    drawCardBackAt(name: string, x: number, y: number) {

        if (!this.isDoneLoading) {
            return;
        }

        const ctx = this.ctx;

        ctx.save();

        // Draw a mask
        const radius = 20;

        const width = 172;
        const height = 237;
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
        ctx.drawImage(this.getImg(name), x - 14.5, y - 14.5);

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

    // /**
    //  * Draw a 6-sided die.
    //  */
    // drawDie(x: number, y: number, dieStroke: string, dieFill: string,
    //     rank: number, a?: PillarsAnimation) {


    //     const dw = 50; // Die Width

    //     let cdw = dw;
    //     let cx = x;
    //     let cy = y;

    //     let rankFill = 'black';

    //     if (a) {
    //         const da = <DieAnimation>a;
    //         const pct = da.percentComplete;
    //         const t = da.getElapsedTime();
    //         cdw = cdw + 4;
    //         cx = cx - 2;
    //         cy = cy - 2;
    //         this.ctx.font = '18pt Arial';
    //         this.ctx.fillStyle = 'white';
    //         if (t % 1000 < 250) {
    //             dieStroke = 'white';
    //             rankFill = 'white';
    //         } else if (t % 1000 < 500) {
    //             dieStroke = 'yellow';
    //             rankFill = 'yellow';
    //         }
    //     }

    //     // Draw the player's die
    //     this.ctx.strokeStyle = dieStroke;
    //     this.ctx.fillStyle = dieFill;
    //     CanvasUtil.roundRect(this.ctx, cx, cy, cdw, cdw, 3, true, true);

    //     // Draw their current rank
    //     this.ctx.fillStyle = rankFill;
    //     this.ctx.fillText('' + rank, cx + cdw / 2, cy + cdw / 2 + 5);
    // }

    /**
     * Draw a card.
     */
    drawCard(m: ui.MouseableCard) {
        const card = m.card;
        const ctx = this.ctx;
        const x = m.x;
        const y = m.y;
        const w = m.w;
        const h = m.h;
        const radius = ui.MouseableCard.CARD_RADIUS;

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

        // Card border
        ctx.fillStyle = '#FEF9E7';
        CanvasUtil.roundRect(this.ctx, x, y, w, h, radius, true, true);
        ctx.fillStyle = 'black';

        // Card Name
        ctx.font = '9pt Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        ctx.fillText(card.name, x + w / 2, y + 20);

        switch (card.type) {
            case "Pillar":

                const pidx: number = card.pillarIndex || 0;

                // Draw the roman numeral
                ctx.font = '24pt Arial';
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

                    ctx.font = '16pt Arial';
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

        ctx.font = '18pt Arial Bold';
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
        const summaryx = 115;
        const summaryy = 10;
        const summaryw = 220;
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

            this.ctx.strokeRect(sx, sy, summaryw, summaryh);
            this.ctx.fillText(p.name, sx + 5, sy + 20);
            this.ctx.fillText(`T:${p.numTalents}, $: ${p.numCredits}, ` +
                `Cy:${p.numCreativity}`, sx + 5, sy + 45);
            this.ctx.fillText(`Customers: ${p.numCustomers}`, sx + 5, sy + summaryh - 10);

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

        // Logo
        if (this.isDoneLoading) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(60, 60, 50, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(this.getImg(ui.PillarsImages.IMG_LOGO), 10, 10);
            ctx.restore();
        }

        const currentPlayer = this.gameState.currentPlayer;
        const currentColor = this.playerDiceColors[currentPlayer.index];

        // In Play
        const inplayx = 10;
        const inplayy = PillarsGame.MARKETY;
        const inplayw = 700;
        const inplayh = 540;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'green';
        CanvasUtil.roundRect(this.ctx, inplayx, inplayy, inplayw, inplayh,
            30, true, true);

        // Credits, Creativity, and Talent
        if (this.isDoneLoading) {
            const resourcey = inplayy + inplayh - 110;
            this.drawResource(this.getImg(ui.PillarsImages.IMG_CREDITS),
                inplayx + 160, resourcey, this.localPlayer.numCredits);
            this.drawResource(this.getImg(ui.PillarsImages.IMG_CREATIVITY),
                inplayx + 260, resourcey, this.localPlayer.numCreativity);
            this.drawResource(this.getImg(ui.PillarsImages.IMG_TALENT),
                inplayx + 360, resourcey, this.localPlayer.numTalents);
        }

        // Player deck
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_BLUE, 50, PillarsGame.BH - 250);
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_BLUE, 55, PillarsGame.BH - 255);

        // Marketplace
        let marketx = PillarsGame.MARKETX;
        let markety = inplayy;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'purple';
        CanvasUtil.roundRect(this.ctx, marketx, markety, 845, inplayh, 30,
            true, true);

        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_BLUE, marketx + 20, markety + 15);
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_BLUE, marketx + 25, markety + 10);

        // Trials
        const trialx = PillarsGame.BW - 250;

        // Phase 1
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_GREEN, trialx, 50);
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_GREEN, trialx + 5, 45);

        // Phase 2
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_ORANGE, trialx, 310);
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_ORANGE, trialx + 5, 305);

        // Phase 3
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_PINK, trialx, 570);
        this.drawCardBackAt(ui.PillarsImages.IMG_BACK_PINK, trialx + 5, 565);

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
        ctx.font = "9pt Arial";
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
