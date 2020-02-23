import {cardDatabase} from '../lambdas/card-database';
import {Card} from '../lambdas/card';
import {Player} from '../lambdas/player';
import {GameState, TrialStack} from '../lambdas/game-state';

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

    clickAnimation: PillarsAnimation | null;

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
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

        self.imagesLoaded = new Map<string, boolean>();

        self.loadGameState();

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

        setTimeout(function(e) {
            self.checkImagesLoaded.call(self);
        }, 10);

        self.gameCanvas.addEventListener('mousemove', function (e) {
            const poz = self.getMousePos(self.gameCanvas, e);
            self.mx = poz.x;
            self.my = poz.y;

            self.resizeCanvas();
        });

        self.gameCanvas.addEventListener('click', function (e) {
            self.handleClick(e);
        });

    }

    checkImagesLoaded() {
        // Iterate images to see if they are loaded
        let allLoaded: boolean = true;
        for (const [key, value] of this.imagesLoaded.entries()) {
            if (!value) allLoaded = false;
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

        console.log(JSON.stringify(this.gameState));
    }

    /**
     * Load game state from the server.
     */
    loadGameState() {
        // For now, let's do everything locally
        this.startLocalGame();
    }

    /**
     * Handle mouse clicks.
     */
    handleClick(e: MouseEvent) {
        this.clickAnimation = {
            timeStarted: new Date().getTime()
        }
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
            img.addEventListener("load", function(e) {
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
    drawCardAt(card:Card, x:number, y:number) {
        const ctx = this.ctx;
        
        // Card border
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
        ctx.strokeRect(x, y, 90, 150);

        // Card Name
        ctx.font = '9px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        ctx.strokeText(card.name, x + 50.5, y + 25);

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

    /**
     * Practice with animation.
     */
    drawCircleInTheMiddle() {

        const ctx = this.ctx;

        let radius = 100;
        if (this.clickAnimation) {
            const curTime = new Date().getTime();
            const elapsed = curTime - this.clickAnimation.timeStarted;
            if (elapsed / 1000 > 3) {
                this.clickAnimation = null;
            } else {
                radius = 100 * (elapsed / 3000);
            }
        }
        ctx.fillStyle = "#336699";
        ctx.beginPath();
        ctx.arc(PillarsGame.BW / 2, PillarsGame.BH / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
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

        // Logo
        if (this.isDoneLoading) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(this.logoImage, 0, 0);
            ctx.restore();
        }

        // // Squares in the corners
        // ctx.fillStyle = "#FF3333";
        // ctx.fillRect(0, 0, 100, 100);
        // ctx.fillRect(PillarsGame.BW - 100, 0, 100, 100);
        // ctx.fillRect(0, PillarsGame.BH - 100, 100, 100);
        // ctx.fillRect(PillarsGame.BW - 100, PillarsGame.BH - 100, 100, 100);

        // A circle in the middle
        //this.drawCircleInTheMiddle();

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
        this.drawCardAt(this.pillars[0], 5, 200);
        this.drawCardAt(this.pillars[1], 5, 350);
        this.drawCardAt(this.pillars[2], 5, 500);
        this.drawCardAt(this.pillars[3], 5, 650);
        this.drawCardAt(this.pillars[4], 5, 800);

        // Debugging data
        // ctx.font = "10px Arial";
        // ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
        //     `P: ${PillarsGame.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
        //     `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
        //     `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}`, 30, 50);

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
        if (this.clickAnimation) {
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
        window.addEventListener('resize', function(e) {
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
}

// Start the game
console.log('Starting the game...');
PillarsGame.init();
