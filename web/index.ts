import { cardDatabase } from '../lambdas/card-database';
import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import {Howl, Howler} from 'howler';
import {PillarsWebConfig} from './web-config';

/**
 * Pillars game UI. Initialized from index.html.
 */
class PillarsGame {

    // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsGame.BW / PillarsGame.BH;

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
     * Clickable regions.
     */
    clickables: Array<Clickable>;

    /**
     * Sound files. (Using howler)
     */
    sounds: Map<string, Howl>;

    /**
     * All cards in the database keyed by card name.
     */
    cards: Map<string, Card>;

    /**
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

        this.animations = new Map<string, PillarsAnimation>();
        this.clickables = [];
        this.sounds = new Map<string, Howl>();
        this.images = new Map<string, HTMLImageElement>();
        this.cards = new Map<string, Card>();

        this.playerDiceColors = [];
        this.playerDiceColors[0] = '#FFD700'; // gold
        this.playerDiceColors[1] = '#9370DB'; // mediumpurple
        this.playerDiceColors[2] = '#00FF00'; // lime
        this.playerDiceColors[3] = '#00BFFF'; // deepskyblue

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

        for (let i = 0; i < imageNames.length; i++) {
            this.loadImg(imageNames[i]);
        }

        // Wait for images to load
        setTimeout(function (e) {
            self.checkImagesLoaded.call(self);
        }, 100);

        // Listen to mouse moves
        self.gameCanvas.addEventListener('mousemove', function (e) {
            const poz = self.getMousePos(self.gameCanvas, e);
            self.mx = poz.x;
            self.my = poz.y;

            self.resizeCanvas();
        });

        // Listen for clicks
        self.gameCanvas.addEventListener('click', function (e) {
            self.handleClick.call(self, e);
        });

        // A button
        const button = new Clickable();
        button.x = PillarsGame.BW / 2;
        button.y = PillarsGame.BH / 2;
        button.w = 100;
        button.h = 50;
        button.onclick = function () {
            self.promote(0, 0);
        };
        button.draw = function () {
            CanvasUtil.roundRect(self.ctx, button.x, button.y, button.w, button.h,
                5, false, true, 'black', 'black');
        };
        this.clickables.push(button);
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

        gs.players.push(human);

        for (let i = 0; i < 3; i++) {
            const ai = new Player();
            ai.isHuman = false;
            ai.name = `AI${i + 1}`;
            gs.players.push(ai);
        }

        // Load the card database
        for (let i = 0; i < cardDatabase.cards.length; i++) {
            const card = <Card>cardDatabase.cards[i];

            this.cards.set(card.name, card);

            switch (card.type) {
                case 'Resource':
                    if (card.starter) {
                        // Put a copy in each player's hand
                        for (let i = 0; i < gs.players.length; i++) {
                            const player = gs.players[i];
                            player.deck.push(<Card>Object.assign({}, card));
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

        //console.log(JSON.stringify(this.gameState));
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

        // Look at clickables
        for (let i = 0; i < this.clickables.length; i++) {
            const c = this.clickables[i];
            if (mx >= c.x && mx <= c.x + c.w &&
                my >= c.y && my <= c.y + c.h) {

                c.onclick();
            }
        }

        // We have to wait for user interaction to load sounds
        if (this.sounds.entries.length == 0) {
            this.addSound('swoosh.wav');
            this.addSound('menuselect.wav');
        }

        this.playSound('menuselect.wav');

        this.resizeCanvas();
    }

    /**
     * Add a sound.
     */
    addSound(name:string) {
        const baseUrl = PillarsWebConfig.AudioUrl;
        const h = new Howl({src: [`${baseUrl}${name}`]});
        this.sounds.set(name, h);
    }

    /**
     * Play a sound.
     */
    playSound(name:string) {
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
                self.resizeCanvas();
            }, false);
        } else {
            throw Error(`${name} does not exist`);
        }
    }

    /**
     * Get a loaded image. (Does not load the image)
     */
    getImg(name:string):HTMLImageElement {
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
    drawCardBackAt(name:string, x:number, y:number) {

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
     * Draw a card at the x and y coordinates.
     */
    drawCardAt(card: Card, x: number, y: number) {
        const ctx = this.ctx;

        let cw = 110;
        let ch = 165;
        let radius = 5;

        if (card.type != 'Pillar') {
            radius = 20;
            cw = 172;
            ch = 237;
        }

        // Card border
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        CanvasUtil.roundRect(this.ctx, x, y, cw, ch, radius, false, true, '#000000', '#000000');

        // Card Name
        ctx.font = '9pt Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        ctx.fillText(card.name, x + cw / 2, y + 20);

        switch (card.type) {
            case "Pillar":

                const pidx: number = card.pillarIndex || 0;

                // Draw the roman numeral
                ctx.font = '24pt Arial';
                ctx.fillStyle = 'blue';
                ctx.fillText(card.pillarNumeral || '', x + cw / 2, y + ch / 2 + 20);
                ctx.strokeStyle = 'black';
                ctx.strokeText(card.pillarNumeral || '', x + cw / 2, y + ch / 2 + 20);

                // Draw player rank dice

                const dw = 40; // Die Width

                const p: Array<any> = [];
                p[0] = { x: 5, y: 30 };
                p[1] = { x: cw - 50, y: 30 };
                p[2] = { x: 5, y: ch - 50 };
                p[3] = { x: cw - 50, y: ch - 50 };

                for (let i = 0; i < this.gameState.players.length; i++) {

                    ctx.font = '16pt Arial';
                    ctx.fillStyle = 'black';

                    const player = this.gameState.players[i];

                    let cdw = dw;
                    let cx = p[i].x;
                    let cy = p[i].y;
                    let dieBorder: string = '#000000';

                    const animKey = DieAnimation.GetKey(i, pidx);
                    const a = this.animations.get(animKey);

                    if (a) {
                        const da = <DieAnimation>a;
                        const pct = da.percentComplete;
                        const t = da.getElapsedTime();
                        cdw = cdw + 4;
                        cx = cx - 2;
                        cy = cy - 2;
                        ctx.font = '18pt Arial';
                        ctx.fillStyle = 'white';
                        if (t % 1000 < 250) {
                            dieBorder = '#FFFFFF';
                        } else if (t % 1000 < 500) {
                            dieBorder = 'yellow';
                        }
                    }

                    // Draw the player's die
                    CanvasUtil.roundRect(this.ctx, x + cx, y + cy, cdw, cdw, 3, true, true,
                        dieBorder, this.playerDiceColors[i]);

                    // Draw their current rank
                    const rank = player.pillarRanks[pidx];
                    ctx.fillText('' + rank, x + cx + cdw / 2, y + cy + cdw / 2 + 5);
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

        const me: Player = this.gameState.players[0];

        // Credits, Creativity, and Talent
        if (this.isDoneLoading) {
            const bw = PillarsGame.BW;
            const bh = PillarsGame.BH;
            const xo = 400;
            const yo = 150;
            this.drawResource(this.getImg(PillarsImages.IMG_CREDITS), 
                bw - xo, bh - yo, me.numCredits);
            this.drawResource(this.getImg(PillarsImages.IMG_CREATIVITY), 
                bw - xo + 100, bh - yo, me.numCreativity);
            this.drawResource(this.getImg(PillarsImages.IMG_TALENT), 
                bw - xo + 200, bh - yo, me.numTalents);
        }

        // Pillars
        this.drawCardAt(this.pillars[0], 5, 135);
        this.drawCardAt(this.pillars[1], 5, 315);
        this.drawCardAt(this.pillars[2], 5, 495);
        this.drawCardAt(this.pillars[3], 5, 675);
        this.drawCardAt(this.pillars[4], 5, 855);

        // Clickables
        for (let i = 0; i < this.clickables.length; i++) {
            this.clickables[i].draw();
        }

        // Player deck
        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, 250, PillarsGame.BH - 250);
        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, 255, PillarsGame.BH - 255);

        // Marketplace
        let markety = 100;
        CanvasUtil.roundRect(this.ctx, 200, 50, 1000, 700, 30, 
            false, true, 'black', 'black');

        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, 220, markety);
        this.drawCardBackAt(PillarsImages.IMG_BACK_BLUE, 225, markety - 5);

        // Test the marketplace
        const market = [
            'Reliability Bootcamp', 
            'Crappy Coders', 
            'Talented Jerk', 
            'AWS Lambda', 
            'Stack Overflow', 
            'Sagemaker', 
            'EBS Snapshots'
        ];

        let curx = 415;
        let cw = 205;
        for (let i = 0; i < market.length; i++) {
            const card = this.cards.get(market[i]);
            if (i == 3) {
                // 2nd row
                markety = 350;
                curx = 210;
            }
            if (card) {
                this.drawCardAt(card, curx, markety);
            }
            curx += cw;
        }

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

        // Debugging data
        ctx.font = "10pt Arial";
        ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
            `P: ${PillarsGame.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
            `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
            `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}, ` +
            `a:${this.isAnimating()}, d:${this.isDoneLoading}`, 500, 50);

        // Run animation logic
        for (const [key, value] of this.animations.entries()) {
            value.animate(this.ctx, () => {
                this.deleteAnimation(key);
            });
        }
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
 * A clickable area and the function to call when it is clicked.
 */
class Clickable {
    x: number;
    y: number;
    w: number;
    h: number;
    onclick: Function;
    draw: Function;
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

// Start the game
console.log('Starting the game...');
PillarsGame.init();
