import { GameState, SerializedGameState } from '../lambdas/game-state';
import { PillarsConstants } from './constants';
import { uapi } from './comms';
import * as Cookies from 'js-cookie';
import { CardRender } from './card-render';
import { Modal } from './ui-utils/modal';
import { IPillarsGame } from './interfaces/pillars-game';
import { LoadingAnimation } from './animations/loading-animation';
import { Mouseable } from './ui-utils/mouseable';
import { Button } from './ui-utils/button';

/**
 * Welcome screen.
 */
export class Welcome {

    modal: Modal;
    state: string;

    constructor(private game:IPillarsGame) {
        this.state = 'start';
    }

    /**
     * Before showing the main game screen, show a welcome modal.
     */
    initWelcomePage() {

        // Load progress
        this.initLoadProgress();

    }

    /**
     * Show the loading animation after the card back image loads.
     * 
     * (Called from play.loadImg)
     */
    showLoadingAnimation() {

        // Animate the card back for a short delay to let fonts load
        const a = new LoadingAnimation(this.game);
        this.game.registerAnimation(a);
        
        // Delay for
        setTimeout(() => {
            this.afterDelay();
        }, 3000);
    }

    /**
     * Show a string with resource loading progress.
     */
    initLoadProgress() {

        const game = this.game;
        const ctx = game.ctx;

        const progress = new Mouseable();
        progress.x = PillarsConstants.MODAL_HALFX;
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

            this.modal = this.game.showModal(msg);
            this.modal.hideCloseButton();

            const button = new Button('Start Game', this.game.ctx);
            button.x = PillarsConstants.MODAL_HALFX - PillarsConstants.MENU_BUTTON_W * 2;
            button.y = PillarsConstants.MODALY + 400;
            button.w = PillarsConstants.MENU_BUTTON_W * 4;
            button.h = PillarsConstants.MENU_BUTTON_H * 4;
            button.zindex = PillarsConstants.MODALZ + 1;

            const click = async () => {
                await this.loadGame(id);
            };

            button.onclick = click;
            button.onanykey = click;
            this.game.addMouseable(PillarsConstants.MODAL_KEY + '_welcome_start_button', button);

        } else {
            msg = "You are about to start a local solo game";

            this.modal = this.game.showModal(msg);
            this.modal.hideCloseButton();
            
            this.game.startLocalGame(() => {
                setTimeout(() => {
                    this.game.closeModal();                
                    this.game.initGameScreen();
                }, 2000);
            });

        }

    }

    /**
     * Load a game when an id is provided.
     */
    async loadGame(id:string) {

        this.state = 'loading';

        const path = 'game?id=' + id;

        try {
            const data = await uapi(path, 'get', '');
            this.game.gameState = GameState.RehydrateGameState(data as SerializedGameState);
            
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
                        if (player.name === cookie) {
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
                        if (!player.name || player.name.length === 0) {
                            player.name = name || 'Anonymous';
                            this.game.localPlayer = player;
                            Cookies.set(id + '-name', player.name);
                            console.log(`Set player ${player.index} to ${player.name}`);
                            await this.game.broadcast(`${player.name} just joined the game!`);
                            break;
                        }
                    }

                    // TODO - What if there were no open slots?

                    // TODO - replace that with a real input dialog
                }
            }

            
            this.game.startComms();
            this.game.closeModal();                
            this.game.initGameScreen();
        } catch (ex) {
            console.error(ex);
        }
    
    }
}
