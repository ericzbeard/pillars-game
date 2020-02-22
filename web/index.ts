/**
 * Pillars game UI. Initialized from index.html.
 */
class PillarsGame {

    // Base width and height. Position everything as if it's this
    // size and then scale it to the actual size.
    static readonly BW = 1920;
    static readonly BH = 1080;
    static readonly PROPORTION = PillarsGame.BW / PillarsGame.BH;

    gameCanvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    mx: number;
    my: number;

    creditImage: HTMLImageElement;
    creativityImage: HTMLImageElement;
    talentImage: HTMLImageElement;

    clickAnimation: PillarsAnimation | null;

    /**
     * PillarsGame constructor.
     */
    constructor() {

        var self = this;

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

        this.creditImage = this.loadImg('credits');
        this.creativityImage = this.loadImg('creativity');
        this.talentImage = this.loadImg('talent');

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
        let img = document.getElementById(name);
        if (img) {
            img.addEventListener("load", this.resizeCanvas, false);
            return <HTMLImageElement>img;
        } else {
            throw Error(`${name} does not exist`);
        }
    }

    /**
     * Draw one of the 3 resource types with the total currently available.
     */
    drawResourceWithTotal(img: HTMLImageElement,
        x: number, y: number, total: number) {

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
        ctx.scale(s, s);

        // Background
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(0, 0, PillarsGame.BW, PillarsGame.BH);

        ctx.fillStyle = "#FF0000";
        ctx.fillRect(200, 200, 150, 75);

        // Squares in the corners
        ctx.fillStyle = "#FF3333";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillRect(1820, 0, 100, 100);
        ctx.fillRect(0, 980, 100, 100);
        ctx.fillRect(1820, 980, 100, 100);

        // A circle in the middle
        this.drawCircleInTheMiddle();

        // Credits image
        this.drawResourceWithTotal(this.creditImage, 1400, 900, 2);
        this.drawResourceWithTotal(this.creativityImage, 1550, 900, 4);
        this.drawResourceWithTotal(this.talentImage, 1700, 900, 1);


        // Debugging data
        ctx.font = "20px Arial";
        ctx.fillText(`w: ${w.toFixed(1)}, h: ${h.toFixed(1)}, ` +
            `P: ${PillarsGame.PROPORTION.toFixed(1)}, s: ${s.toFixed(1)}, ` +
            `ih: ${window.innerHeight}, ga: ${ctx.globalAlpha}, ` +
            `mx: ${mx.toFixed(1)}, my: ${my.toFixed(1)}`, 30, 50);

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
        window.addEventListener('resize', game.resizeCanvas, false);
        game.resizeCanvas();
    }
}

/**
 * Used to track the progress of animations.
 */
class PillarsAnimation {
    timeStarted: number;
}


