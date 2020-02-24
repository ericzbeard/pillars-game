import { cardDatabase } from '../lambdas/card-database';
import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';

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
     * Credit png.
     */
    creditImage: HTMLImageElement;

    /**
     * Creativity png.
     */
    creativityImage: HTMLImageElement;

    /**
     * Talent png.
     */
    talentImage: HTMLImageElement;

    /**
     * Logo png.
     */
    logoImage: HTMLImageElement;

    /**
     * Background png.
     */
    bgImage: HTMLImageElement;

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
    imagesLoaded: Map<string, boolean>;

    /**
     * Dice colors. 
     */
    playerDiceColors: Array<string>;

    /**
     * Currently running animations.
     */
    animations: Map<string, PillarsAnimation>;

    /**
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

        this.animations = new Map<string, PillarsAnimation>();

        this.playerDiceColors = [];
        this.playerDiceColors[0] = '#FFD700'; // gold
        this.playerDiceColors[1] = '#9370DB'; // mediumpurple
        this.playerDiceColors[2] = '#00FF00'; // lime
        this.playerDiceColors[3] = '#00BFFF'; // deepskyblue

        this.imagesLoaded = new Map<string, boolean>();

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

        this.creditImage = this.loadImg('img/credits100x100.png');
        this.creativityImage = this.loadImg('img/creativity100x100.png');
        this.talentImage = this.loadImg('img/talent100x100.png');
        this.logoImage = this.loadImg('img/logo.png');
        this.bgImage = this.loadImg('img/bg.png');

        setTimeout(function (e) {
            self.checkImagesLoaded.call(self);
        }, 100);

        self.gameCanvas.addEventListener('mousemove', function (e) {
            const poz = self.getMousePos(self.gameCanvas, e);
            self.mx = poz.x;
            self.my = poz.y;

            self.resizeCanvas();
        });

        self.gameCanvas.addEventListener('click', function (e) {
            self.handleClick.call(self, e);
        });

    }

    /**
     * Check to see if images are loaded. Calls itself until true.
     */
    checkImagesLoaded() {
        // Iterate images to see if they are loaded

        let allLoaded: boolean = true;
        if (this.imagesLoaded) {
            for (const [key, value] of this.imagesLoaded.entries()) {
                if (!value) allLoaded = false;
            }
        } else {

            console.log(`checkImagesLoaded imagesLoaded null? this: ${JSON.stringify(this)}`);

            allLoaded = false;
        }
        if (!allLoaded) {
            setTimeout(this.checkImagesLoaded, 10);
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
        this.animations.set(`Die`, animation);
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
        console.log('click');
        const poz = this.getMousePos(this.gameCanvas, e);
        const mx = poz.x;
        const my = poz.y;

        // Testing animation of a die
        const d: DieAnimation = new DieAnimation();
        d.playerIndex = 0;
        d.pillarIndex = 0;
        this.registerAnimation(d);

        // Animate each click location
        const click: ClickAnimation = new ClickAnimation();
        click.x = mx;
        click.y = my;
        this.registerAnimation(click);

        this.resizeCanvas();
    }

    /**
     * Delete an animation when it is complete.
     */
    deleteAnimation(key: string) {
        this.animations.delete(key);
    }

    /**
     * Get the image element and add an event listener to redraw 
     * once it is loaded.
     */
    loadImg(name: string): HTMLImageElement {
        //let img = document.getElementById(name);
        const img = new Image();
        img.src = name;
        var self = this;
        if (img) {
            this.imagesLoaded.set(name, false);
            img.addEventListener("load", function (e) {
                self.imagesLoaded.set(name, true);
            }, false);
            return <HTMLImageElement>img;
        } else {
            throw Error(`${name} does not exist`);
        }
    }



    /**
     * Draw a card at the x and y coordinates.
     */
    drawCardAt(card: Card, x: number, y: number) {
        const ctx = this.ctx;

        const cw = 110;
        const ch = 165;

        // Card border
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        CanvasUtil.roundRect(this.ctx, x, y, cw, ch, 5, false, true, '#000000', '#000000');

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

        ctx.drawImage(img, x, y);
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

    // /**
    //  * Practice with animation.
    //  */
    // animate() {

    //     const ctx = this.ctx;

    //     let radius = 100;
    //     if (this.clickAnimation) {
    //         const curTime = new Date().getTime();
    //         const elapsed = curTime - this.clickAnimation.timeStarted;
    //         if (elapsed / 1000 > 3) {
    //             this.clickAnimation = null;
    //         } else {
    //             radius = 100 * (elapsed / 3000);
    //         }
    //     }

    //     // Draw an expanding circle in the middle
    //     ctx.fillStyle = "#336699";
    //     ctx.beginPath();
    //     ctx.arc(PillarsGame.BW / 2, PillarsGame.BH / 2, radius, 0, 2 * Math.PI);
    //     ctx.stroke();

    //     // Highlight a die

    // }

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
            ctx.drawImage(this.bgImage, 0, 0);
            ctx.globalAlpha = 1;
        }

        // Logo
        if (this.isDoneLoading) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(this.logoImage, 0, 0);
            ctx.restore();
        }

        const me: Player = this.gameState.players[0];

        // Credits, Creativity, and Talent
        if (this.isDoneLoading) {
            const bw = PillarsGame.BW;
            const bh = PillarsGame.BH;
            const xo = 400;
            const yo = 150;
            this.drawResource(this.creditImage, bw - xo, bh - yo, me.numCredits);
            this.drawResource(this.creativityImage, bw - xo + 100, bh - yo, me.numCreativity);
            this.drawResource(this.talentImage, bw - xo + 200, bh - yo, me.numTalents);
        }

        // Pillars
        this.drawCardAt(this.pillars[0], 5, 135);
        this.drawCardAt(this.pillars[1], 5, 315);
        this.drawCardAt(this.pillars[2], 5, 495);
        this.drawCardAt(this.pillars[3], 5, 675);
        this.drawCardAt(this.pillars[4], 5, 855);

        // Debugging data
        ctx.font = "10pt Arial";
        ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
            `P: ${PillarsGame.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
            `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
            `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}, ` +
            `a:${this.isAnimating()}`, 500, 50);

        // Run animation logic
        for (const [key, value] of this.animations.entries()) {
            var self = this;
            value.animate(this.ctx, function() {
                self.deleteAnimation.call(self, key);
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
    timeStarted: number;
    percentComplete: number;
    getKey() { return ''; }
    getElapsedTime() {
        return new Date().getTime() - this.timeStarted;
    }
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
        if (elapsed / 1000 > 3) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / 3000;

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

// Start the game
console.log('Starting the game...');
PillarsGame.init();
