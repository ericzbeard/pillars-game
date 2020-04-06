import { MouseableCard, Mouseable, IPillarsGame } from './ui-utils';
import { ClickAnimation } from './ui-utils';
import { PillarsConstants } from './constants';

/**
 * Handle input like mouse and touch events.
 */
export class PillarsInput {

    /**
     * Current mouse x, relative to base width and height.
     */
    mx: number;

    /**
     * Current mouse x, relative to base width and height.
     */
    my: number;

    /**
     * Chat entered by local player.
     */
    typing: string;

    /**
     * True if a card is being dragged by the mouse.
     */
    dragging: boolean;

    /**
     * The mouseable being dragged.
     */
    draggingKey: string;

    /**
     * The canvas we're drawing on.
     */
    gameCanvas: HTMLCanvasElement;

    /**
     * Create a new instance with a reference to the game.
     */
    constructor(private game: IPillarsGame) {
        this.dragging = false;
        this.typing = '';
        this.mx = 0;
        this.my = 0;
        this.gameCanvas = this.game.getCanvas();
    }

    /*
     * Handle mouse move events.
     */
    handleMouseMove(e: MouseEvent) {
        const poz = this.game.getMousePos(e);
        this.mx = poz.x;
        this.my = poz.y;

        this.game.initSounds();

        this.handleInputMove();
    }

    /*
     * Handle touch move events.
     */
    handleTouchMove(e: TouchEvent) {
        const poz = this.game.getTouchPos(e);
        this.mx = poz.x;
        this.my = poz.y;

        this.game.initSounds();

        this.handleInputMove();
    }

    /*
     * Handle mouse and touch move events.
     */
    handleInputMove() {

        let marray = this.game.sortMouseables(true);

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
                continue;
            }

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.game.checkModal(key)) {
                ignore = true;
            }

            if (!ignore) {
                if (m.hitTest(this.mx, this.my)) {

                    //console.log(`move hit ${m.key}, zindex ${m.zindex}, already: ${alreadyHit}`);

                    // TODO - ? Remove hover mouseables?

                    if (!alreadyHit) {
                        alreadyHit = true;

                        if (!m.dragging) {

                            if (m.draggable && 
                                m.down && 
                                (this.mx != m.downx || this.my != m.downy)) {

                                if (m.ondragenter) {
                                    m.ondragenter();
                                }

                                this.game.diag(`dragging ${m.key}`);

                                m.dragging = true;
                                this.dragging = true;
                                this.draggingKey = m.key;
                                this.gameCanvas.style.cursor = 'grabbing';
                                m.dragoffx = this.mx - m.x;
                                m.draggoffy = this.my - m.y;

                            } 

                            if (m.onmouseover) {
                                m.onmouseover();
                            }

                            m.hovering = true;
                            if (m.onhover) {

                                // Remove all other hover mouseables first
                                this.game.removeMouseableKeys(PillarsConstants.HOVER_START);

                                m.onhover();
                            }

                            if (this.gameCanvas.style.cursor != 'grabbing') {
                                this.gameCanvas.style.cursor = 'pointer';
                            }
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

        this.game.resizeCanvas();
    }

    /**
     * Handle mouse down events.
     */
    handleMouseDown(e: MouseEvent) {
        const poz = this.game.getMousePos(e);
        this.mx = poz.x;
        this.my = poz.y;

        this.game.initSounds();

        this.handleInputDown();
    }

    /**
     * Handle touch start events.
     */
    handleTouchStart(e: TouchEvent) {
        const poz = this.game.getTouchPos(e);
        this.mx = poz.x;
        this.my = poz.y;

        this.game.initSounds();

        this.game.diag(`touch start ${this.mx}, ${this.my}`);

        this.handleInputDown();
    }

     /**
     * Handle mouse and touch down events.
     */
    handleInputDown() {

        let marray = this.game.sortMouseables(true);

        let alreadyHit = false; // Only hover the top element by zindex

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            const key = m.key;

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.game.checkModal(key)) {
                ignore = true;
            }

            if (!ignore) {
                if (m.hitTest(this.mx, this.my)) {

                    this.game.diag(`down hit ${m.key}, zindex ${m.zindex}, already: ${alreadyHit}`);

                    if (!alreadyHit) {
                        alreadyHit = true;

                        if (m.draggable) {

                            m.down = true;
                            m.downx = this.mx;
                            m.downy = this.my;
                        }
                    }
                } else {
                    m.dragging = false;
                    m.down = false;
                    m.downx = -1;
                    m.downy = -1;
                    this.gameCanvas.style.cursor = 'default';
                }
            }
        }

        if (!alreadyHit) {
            // We hit nothing
            this.gameCanvas.style.cursor = 'default';
        }

        this.game.resizeCanvas();
    }

    /**
     * Handle mouse up events.
     */
    handleMouseUp(e: MouseEvent) {
        const poz = this.game.getMousePos(e);
        this.mx = poz.x;
        this.my = poz.y;

        this.game.diag(`handleMouseup ${this.mx}, ${this.my}`);

        if (!this.dragging) {
            this.handleClick();
        }

        this.handleInputUp();
    }

    /**
     * Handle touch up events.
     */
    handleTouchUp(e: TouchEvent) {
        const poz = this.game.getTouchPos(e);
        this.mx = poz.x;
        this.my = poz.y;

        this.game.diag(`handleTouchup ${this.mx}, ${this.my}`);

        if (!this.dragging) {
            this.handleClick();
        }
        this.handleInputUp();
    }

    /**
     * Handle mouse and touch up events.
     */
    handleInputUp() {

        let marray = this.game.sortMouseables(true);
        let dropped = false;

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];

            const key = m.key;

            if (m.hitTest(this.mx, this.my)) {

                this.game.diag(`up hit ${m.key}, zindex ${m.zindex}`);

                // Find the mouseable being dragged, and if this m in droppable, drop it
                for (let j = 0; j < marray.length; j++) {
                    const d = marray[j];

                    if (d.dragging && m.droppable) {

                        // Dropping a card from hand into play
                        if (m.key == PillarsConstants.INPLAY_AREA_KEY &&
                            d instanceof MouseableCard &&
                            this.game.gameState.isInHand(d.card)) {

                            d.zindex = 2;

                            // Play the card
                            const game = this.game;
                            game.playCard.call(game, d, () => {
                                game.finishPlayingCard.call(game, d, key);
                            });

                            dropped = true;
                        }

                        // Dropping a card from the market to discard
                        if (m.key == PillarsConstants.DISCARD_AREA_KEY &&
                            d instanceof MouseableCard &&
                            this.game.gameState.isInMarket(d.card)) {

                            d.zindex = 2;

                            // Acquire the card
                            this.game.acquireCard(d.card, d.key);

                            dropped = true;
                        }

                    }

                    // If we dropped it in an invalid region, put it back in its original location
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

        console.log(`up clearing all dragging flags`);

        this.dragging = false;
        this.draggingKey = '';
        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            m.dragging = false;
            m.downx = -1;
            m.downy = -1;
        }

        this.game.resizeCanvas();
    }


    /**
     * Handle mouse clicks.
     */
    handleClick(e?: MouseEvent) {
        
        if (e !== undefined) {
            const poz = this.game.getMousePos(e);
            this.mx = poz.x;
            this.my = poz.y;
        }

        this.game.diag(`handleClick ${this.mx}, ${this.my}`);

        // We have to wait for user interaction to load sounds
        this.game.initSounds();

        // Animate each click location
        const click: ClickAnimation = new ClickAnimation();
        click.x = this.mx;
        click.y = this.my;
        this.game.registerAnimation(click);

        let clickedSomething = false;

        // Look at mouseables
        let marray = this.game.sortMouseables(true);

        for (let i = 0; i < marray.length; i++) {
            const m = marray[i];
            const key = m.key;

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.game.checkModal(key)) {
                ignore = true;
            }

            if (!ignore && !clickedSomething && m.onclick && m.hitTest(this.mx, this.my)) {
                m.onclick();
                clickedSomething = true;
                break;
            }
        }

        // Un hover on a click outside of any card
        if (!clickedSomething) {
            for (const [key, m] of this.game.getMouseables().entries()) {
                if (m.hovering && m.onmouseout) {
                    m.onmouseout();
                }
            }
        }

        this.game.resizeCanvas();
    }

    /**
     * Handle keyboard events.
     */
    handleKeyDown(e: KeyboardEvent) {

        this.game.initSounds();

        if (e.isComposing || e.keyCode === 229) {
            return;
        }

        if (e.key && e.key.length == 1) {
            this.typing += e.key;
        } else {
            if (e.key == 'Enter') {
                const chat = this.typing;
                this.game.putChat(`[${this.game.localPlayer.name}] ${this.typing}`);
                this.typing = '';
                this.game.respondToChat(chat);
            }
            if (e.key == 'Backspace') {
                e.preventDefault();
                e.stopPropagation();
                this.typing = this.typing.substr(0, this.typing.length - 1);
            }
        }
        this.game.resizeCanvas();
    }


    /**
     * Handle mouse double clicks.
     */
    handleDoubleClick(e: MouseEvent) {
        const poz = this.game.getMousePos(e);
        const mx = poz.x;
        const my = poz.y;

        this.game.diag(`handleDoubleClick ${this.mx}, ${this.my}`);

        // Check to see if a card in hand was clicked
        if (this.game.localPlayer.index == this.game.gameState.currentPlayer.index) {
            this.checkHandDoubleClick(mx, my);
            this.checkMarketDoubleClick(mx, my);
        }
    }

    /**
     * Check to see if a card in hand was double clicked.
     * 
     * If so, play it.
     */
    checkHandDoubleClick(mx: number, my: number) {

        let key: string = '';
        for (const k of this.game.getMouseables().keys()) {

            let ignore = false;

            // Ignore everything but the modal close if we're showing a modal
            if (this.game.checkModal(k)) {
                ignore = true;
            }

            if (!ignore) {
                if (k.startsWith(PillarsConstants.HAND_START_KEY)) {
                    const m = <MouseableCard>this.game.getMouseables().get(k);
                    if (m.hitTest(mx, my)) {
                        key = k;
                        break;
                    }
                }
            }
        }

        if (key && key.length > 0) {
            const m = <MouseableCard>this.game.getMouseables().get(key);

            // TODO - Make sure the card can legally be played.

            // Play the card

            // Play the card's effects!
            const game = this.game;
            game.playCard.call(game, m, () => {
                game.finishPlayingCard.call(game, m, key);
            });
        }
    }

    /**
     * Check to see if a card in the market was double clicked.
     * 
     * If the player has enough resources, acquire it.
     */
    checkMarketDoubleClick(mx: number, my: number) {

        let key = null;
        for (const k of this.game.getMouseables().keys()) {
            if (k.startsWith(PillarsConstants.MARKET_START_KEY)) {
                const m = <MouseableCard>this.game.getMouseables().get(k);
                if (m.hitTest(mx, my)) {
                    key = k;
                    break;
                }
            }
        }

        const p = this.game.gameState.currentPlayer;

        if (key) {
            const m = <MouseableCard>this.game.getMouseables().get(key);

            if (m.card.canAcquire(p.numCredits, p.numTalents)) {
                const game = this.game;
                game.acquireCard.call(game, m.card, key);
            }
        }
    }

}