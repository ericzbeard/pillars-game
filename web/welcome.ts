import { GameState, SerializedGameState } from '../lambdas/game-state';
import { IPillarsGame } from './ui-utils';
import { Button } from './ui-utils';
import { PillarsConstants } from './constants';
import { uapi } from './comms';
import * as Cookies from 'js-cookie';

/**
 * Welcome screen.
 */
export class Welcome {

    constructor(private game:IPillarsGame) {}

    /**
     * Before showing the main game screen, show a welcome modal.
     */
    initWelcomePage() {

        const modal = this.game.showModal("Welcome");
        modal.hideCloseButton();

        const button = new Button('Start Game', this.game.ctx);
        button.x = PillarsConstants.MODALX + 200;
        button.y = PillarsConstants.MODALY + 300;
        button.w = PillarsConstants.MENU_BUTTON_W * 2;
        button.h = PillarsConstants.MENU_BUTTON_H * 2;
        button.zindex = PillarsConstants.MODALZ + 1;
        button.onclick = () => {

            let id = window.location.hash;
            if (id) {

                if (id.startsWith('#')) {
                    id = id.substring(1);
                }
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

                            console.log('New player');

                            // Ask the player to provide their name

                            const name = prompt("Your name: ");

                            for (const player of this.game.gameState.players) {
                                if (!player.name) {
                                    player.name = name || 'Anonymous';
                                    this.game.localPlayer = player;
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

}