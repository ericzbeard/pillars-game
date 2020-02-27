import { cardDatabase } from '../lambdas/card-database';
import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsWebConfig } from './web-config';

/**
 * Pillars game UI. Initialized from index.html.
 */
class PillarsGame {

    // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsGame.BW / PillarsGame.BH;
    static readonly MARKETX = 650;
    static readonly MARKETY = 300;

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

        this.animations = new Map<string, PillarsAnimation>();
        this.mouseables = new Map<string, Mouseable>();
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
            PillarsImages.IMG_CREDITS,
            PillarsImages.IMG_CREATIVITY,
            PillarsImages.IMG_TALENT,
            PillarsImages.IMG_LOGO,
            PillarsImages.IMG_BG,
            PillarsImages.IMG_BACK_GREEN,
            PillarsImages.IMG_BACK_ORANGE,
            PillarsImages.IMG_BACK_PINK,
            PillarsImages.IMG_BACK_BLUE
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
        const button = new Mouseable();
        button.x = 100
        button.y = 20
        button.w = 100;
        button.h = 50;
        button.onclick = function () {
            self.promote(0, 0);
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
            const m = new MouseableCard(card);
            m.x = handx + (i * 200);
            m.y = PillarsGame.BH - 250;
            this.mouseables.set('hand_' + i, m);

            const hoverKey = 'hand_hover_' + i;

            m.onmouseout = () => {
                this.mouseables.delete(hoverKey);
            };

            // Draw a second copy unobstructed when hovering
            m.onhover = () => {

                const h = new MouseableCard(card);
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
        const pillarw = 210;
        const px = 500;
        for (let i = 0; i < this.pillars.length; i++) {
            const pillar = this.pillars[i];
            const m = new MouseableCard(this.pillars[i]);
            m.x = px + (i * pillarw);
            m.y = pillary;
            m.draw = () => {
                this.drawCard(m);
            }
            this.mouseables.set('pillar_' + i, m);
        }

        // Test the marketplace
        // TODO - Shuffle and deal
        const market = [
            'Reliability Bootcamp',
            'Crappy Coders',
            'Talented Jerk',
            'AWS Lambda',
            'Stack Overflow',
            'Sagemaker',
            'EBS Snapshots'
        ];

        let marketx = PillarsGame.MARKETX;
        let curx = marketx + 200;
        let cw = 205;
        let markety = PillarsGame.MARKETY + 10;
        for (let i = 0; i < market.length; i++) {
            const card = this.cards.get(market[i]);
            if (i == 3) {
                // 2nd row
                markety += 250;
                curx = marketx + 25;
            }
            if (card) {
                const m = new MouseableCard(card);
                m.x = curx;
                m.x = markety;
                m.draw = () => {
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

        this.pillars = [];

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

                                // Hand or deck
                                // TODO - Shuffle
                                if (player.hand.length < 6) {
                                    player.hand.push(copy);
                                } else {
                                    player.deck.push(copy);
                                }
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
        const click: ClickAnimation = new ClickAnimation();
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
    getDieName(i: number, r:number) {
        return `img/die-${this.playerDiceColors[i]}-${r}-50x50.png`;
    }

    /**
     * Draw a 6-sided die.
     */
    drawDie(x: number, y: number, playerIndex: number, rank: number,
        a?: PillarsAnimation) {
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
    drawCard(m: MouseableCard) {
        const card = m.card;
        const ctx = this.ctx;
        const x = m.x;
        const y = m.y;
        const w = m.w;
        const h = m.h;
        const radius = MouseableCard.CARD_RADIUS;

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
        CanvasUtil.roundRect(this.ctx, x, y, w, h, radius, false, true);

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
                p[1] = { x: w - 50, y: 30 };
                p[2] = { x: 5, y: h - 50 };
                p[3] = { x: w - 50, y: h - 50 };

                for (let i = 0; i < this.gameState.players.length; i++) {

                    ctx.font = '16pt Arial';
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'black';

                    const player = this.gameState.players[i];

                    const animKey = DieAnimation.GetKey(i, pidx);
                    const a = <PillarsAnimation>this.animations.get(animKey);

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
        const d: DieAnimation = new DieAnimation();
        d.playerIndex = playerIndex;
        d.pillarIndex = pillarIndex;
        this.registerAnimation(d);

        this.playSound('swoosh.wav');

        // TODO - Game end?
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
            ctx.drawImage(this.getImg(PillarsImages.IMG_BG), 0, 0);
            ctx.globalAlpha = 1;
        }

        // Logo
        if (this.isDoneLoading) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(60, 60, 50, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(this.getImg(PillarsImages.IMG_LOGO), 10, 10);
            ctx.restore();
        }

        const currentPlayer = this.gameState.currentPlayer;
        const currentColor = this.playerDiceColors[currentPlayer.index];

        // In Play
        const inplayx = 10;
        const inplayy = PillarsGame.MARKETY;
        const inplayw = 600;
        const inplayh = 500;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'green';
        CanvasUtil.roundRect(this.ctx, inplayx, inplayy, inplayw, inplayh,
            30, true, true);

        // Credits, Creativity, and Talent
        if (this.isDoneLoading) {
            const resourcey = inplayy + inplayh - 110;
            this.drawResource(this.getImg(PillarsImages.IMG_CREDITS),
                inplayx + 110, resourcey, this.localPlayer.numCredits);
            this.drawResource(this.getImg(PillarsImages.IMG_CREATIVITY),
                inplayx + 210, resourcey, this.localPlayer.numCreativity);
            this.drawResource(this.getImg(PillarsImages.IMG_TALENT),
                inplayx + 310, resourcey, this.localPlayer.numTalents);
        }

        // Player deck
        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, 50, PillarsGame.BH - 250);
        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, 55, PillarsGame.BH - 255);

        // Marketplace
        let marketx = PillarsGame.MARKETX;
        let markety = inplayy;
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'purple';
        CanvasUtil.roundRect(this.ctx, marketx, markety, 850, inplayh, 30,
            true, true);

        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, marketx + 20, markety + 15);
        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, marketx + 25, markety + 10);

        // Trials
        const trialx = PillarsGame.BW - 250;

        // Phase 1
        this.drawCardBackAt(PillarsImages.IMG_BACK_GREEN, trialx, 50);
        this.drawCardBackAt(PillarsImages.IMG_BACK_GREEN, trialx + 5, 45);

        // Phase 2
        this.drawCardBackAt(PillarsImages.IMG_BACK_ORANGE, trialx, 310);
        this.drawCardBackAt(PillarsImages.IMG_BACK_ORANGE, trialx + 5, 305);

        // Phase 3
        this.drawCardBackAt(PillarsImages.IMG_BACK_PINK, trialx, 570);
        this.drawCardBackAt(PillarsImages.IMG_BACK_PINK, trialx + 5, 565);

        // Dice rolling area
        ctx.strokeRect(trialx, 825, 150, 150);
        this.drawDie(trialx + 10, 840, 
                currentPlayer.index, currentPlayer.lastDiceRoll[0]);
        this.drawDie(trialx + 60, 890, 
                currentPlayer.index, currentPlayer.lastDiceRoll[1]);

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
        ctx.font = "10pt Arial";
        ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
            `P: ${PillarsGame.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
            `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
            `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}, ` +
            `as:${this.animations.size}, ` + 
            `a:${this.isAnimating()}, d:${this.isDoneLoading}, ` +
            `FRa:${FrameRate.avg.toFixed(1)}, FRc:${FrameRate.cur.toFixed(1)}`,
            1200, PillarsGame.BH - 10);
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

        FrameRate.update();
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

/**
 * Used to track the progress of animations.
 */
class PillarsAnimation {

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
     * are used in PillarsGame.draw.
     */
    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) { }
}

/**
 * A die animation. Highlight the die when it changes.
 */
class DieAnimation extends PillarsAnimation {
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
class ClickAnimation extends PillarsAnimation {
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
class Mouseable {
    x: number;
    y: number;
    w: number;
    h: number;
    onclick: Function;
    onhover: Function;
    onmousedown: Function;
    onmouseup: Function;
    onmouseover: Function;
    onmouseout: Function;
    draw: Function;
    hovering: boolean;

    constructor() {

    }

    /**
     * Check to see if they coordinates overlap.
     */
    hitTest(x: number, y: number): boolean {
        const hit = x >= this.x && x <= this.x + this.w &&
            y >= this.y && y <= this.y + this.h;
        return hit;
    }
}

/**
 * A card.
 */
class MouseableCard extends Mouseable {

    static readonly CARD_WIDTH = 172;
    static readonly CARD_HEIGHT = 237;
    static readonly CARD_RADIUS = 20;

    card: Card;

    constructor(card: Card) {
        super();
        this.card = card;
        this.w = MouseableCard.CARD_WIDTH;
        this.h = MouseableCard.CARD_HEIGHT;
    }
}

class PillarsImages {
    static readonly IMG_CREDITS = 'img/credits-100x100.png';
    static readonly IMG_CREATIVITY = 'img/creativity-100x100.png';
    static readonly IMG_TALENT = 'img/talent-100x100.png';
    static readonly IMG_LOGO = 'img/logo.png';
    static readonly IMG_BG = 'img/bg.png';
    static readonly IMG_BACK_BLUE = 'img/back-blue-200x265.png';
    static readonly IMG_BACK_GREEN = 'img/back-green-200x265.png';
    static readonly IMG_BACK_ORANGE = 'img/back-orange-200x265.png';
    static readonly IMG_BACK_PINK = 'img/back-pink-200x265.png';
}

class FrameRate {
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

// Start the game
PillarsGame.init();
