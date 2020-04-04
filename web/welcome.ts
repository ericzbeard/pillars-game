import { GameState, SerializedGameState } from '../lambdas/game-state';
import { IPillarsGame, Mouseable, Modal, PillarsImages } from './ui-utils';
import { Button } from './ui-utils';
import { PillarsConstants } from './constants';
import { uapi } from './comms';
import * as Cookies from 'js-cookie';
import { CardRender } from './card-render';
import { PillarsAnimation } from './ui-utils';

/**
 * Welcome screen.
 */
export class Welcome {

    modal: Modal;
    state: string;
    static readonly HALFX = PillarsConstants.MODALX + PillarsConstants.MODALW / 2;
    static readonly HALFY = PillarsConstants.MODALY + PillarsConstants.MODALH / 2;
    static readonly LOAD_MS = 3000;

    constructor(private game:IPillarsGame) {
        this.state = 'start';
    }

    /**
     * Before showing the main game screen, show a welcome modal.
     */
    initWelcomePage() {

        const game = this.game;
        const ctx = game.ctx;

        // Animate the card back for a short delay to let fonts load
        const a = new LoadingAnimation(game);
        game.registerAnimation(a);

        // Load progress
        this.initLoadProgress();

        // Delay for
        setTimeout(() => {
            this.afterDelay();
        }, Welcome.LOAD_MS);
    }

    initLoadProgress() {

        const game = this.game;
        const ctx = game.ctx;

        const progress = new Mouseable();
        progress.x = Welcome.HALFX;
        progress.y = PillarsConstants.MODALY + PillarsConstants.MODALH - 50;
        progress.zindex = PillarsConstants.MODALZ + 1;
        progress.render = () => {
            const p = this.game.getLoadProgress();
            ctx.font = game.getFont(24);
            ctx.fillStyle = 'gray';
            ctx.textAlign = 'center';
            let stateMsg = '';

            switch (this.state) {
                case 'start':
                    stateMsg = `Loaded ${p.numImagesLoaded} of ${p.numImages} images`
                    break;
                case 'loading':
                    stateMsg = 'Loading game state...';
                    break;
                case 'ready': 
                    stateMsg = 'Ready';
                    break;
            }
            ctx.fillText(stateMsg, progress.x, progress.y);
        }
        game.addMouseable(PillarsConstants.MODAL_KEY + '_progress', progress);
    }

    /**
     * Render interactive stuff after a short delay.
     */
    afterDelay() {
        const game = this.game;
        const ctx = game.ctx;

        let msg = "Welcome";

        let id = window.location.hash;
        if (id) {
            if (id.startsWith('#')) {
                id = id.substring(1);
            }
            msg = "You are about to join game " + id;
        } else {
            msg = "You are about to start a local solo game";
        }


        this.modal = this.game.showModal(msg);
        this.modal.hideCloseButton();


        const button = new Button('Start Game', this.game.ctx);
        button.x = Welcome.HALFX - PillarsConstants.MENU_BUTTON_W * 2;
        button.y = PillarsConstants.MODALY + 400;
        button.w = PillarsConstants.MENU_BUTTON_W * 4;
        button.h = PillarsConstants.MENU_BUTTON_H * 4;
        button.zindex = PillarsConstants.MODALZ + 1;
        button.onclick = () => {

            if (id) {
                this.loadGame(id);
            } else {
                this.game.startLocalGame(() => {
                    this.game.closeModal();                
                    this.game.initGameScreen();
                });
            }

        };
        this.game.addMouseable(PillarsConstants.MODAL_KEY + '_welcome_start_button', button);

        
        // TODO - Tutorial, multi-player, ??
    }

    /**
     * Load a game when an id is provided.
     */
    loadGame(id:string) {

        this.state = 'loading';

        const path = 'game?id=' + id;

        console.log(`welcome about to get path ${path}`);

        uapi(path, 'get', '', (data:SerializedGameState) => {
            this.game.gameState = GameState.RehydrateGameState(data);
            
            const cookie = Cookies.get(id + '-name');
            console.log(`cookie: ${cookie}`);

            if (this.game.gameState.isSolo) {
                console.log('solo game');
                this.game.localPlayer = this.game.gameState.players[0];
            } else {
                if (cookie) {
                    // This is the player who started the game or a 
                    // returning player reloading the page.

                    // TODO - This is totally hackable but do we care?

                    for (const player of this.game.gameState.players) {
                        if (player.name == cookie) {
                            console.log(`Setting local player: ${player.name}`);
                            this.game.localPlayer = player;
                        }
                    }

                } else {
                    // This is an invited player hitting the page for the first time

                    console.log('New player joining');

                    // Ask the player to provide their name

                    // TODO - Replace this
                    const name = prompt("Your name: ");

                    for (const player of this.game.gameState.players) {
                        console.log(`Checking player ${player.index}: ${player.name}`);
                        if (!player.name || player.name.length == 0) {
                            player.name = name || 'Anonymous';
                            this.game.localPlayer = player;
                            Cookies.set(id + '-name', player.name);
                            console.log(`Set player ${player.index} to ${player.name}`);
                            this.game.broadcast(`${player.name} just joined the game!`);
                            break;
                        }
                    }

                    // TODO - What if there were no open slots?

                    // TODO - replace that with a real input dialog
                }
            }

            this.game.closeModal();                
            this.game.initGameScreen();
        }, 
        (err:any) => {
            console.error(err);
        });
    
    }
}

/**
 * Animate the loading screen.
 */
export class LoadingAnimation extends PillarsAnimation {

    constructor(private game: IPillarsGame) {

        super();
    }

    static GetKey() {
        return `WelcomeLoading_Animation`;
    }

    getKey() {
        return LoadingAnimation.GetKey();
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {
        const elapsed = this.getElapsedTime();
        const end = Welcome.LOAD_MS;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            const minScale = 0.1;
            const maxScale = 3;
            ctx.globalAlpha = this.percentComplete;
            const scale = maxScale * this.percentComplete;
            const x = Welcome.HALFX - (PillarsConstants.CARD_WIDTH * scale) / 2;
            const y = Welcome.HALFY - (PillarsConstants.CARD_HEIGHT * scale) / 2;
            const cr = new CardRender(this.game);
            cr.renderCardImage(PillarsImages.IMG_BACK_BLUE, x, y, scale);
        }
    }
}