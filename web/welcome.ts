import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, SerializedGameState } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsWebConfig } from './pillars-web-config';
import { MouseableCard, Mouseable, IPillarsGame, Xywh } from './ui-utils';
import { PillarsImages, PillarsAnimation, Modal } from './ui-utils';
import { PillarDieAnimation, FrameRate, TextUtil, Button } from './ui-utils';
import { ModalCardClick, PillarsSounds } from './ui-utils';
import { LocalGame } from './local-game';
import { CardActions } from './card-actions';
import { PillarsConstants } from './constants';
import { CardRender } from './card-render';
import { bug } from './actions/bug';
import { AIChatter } from './ai-chatter';
import { PillarsInput } from './input';
import { PillarsMenu } from './menu';
import { uapi } from './comms';

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

            let hash = window.location.hash;
            if (hash) {

                if (hash.startsWith('#')) {
                    hash = hash.substring(1);
                }
                const path = 'game?id=' + hash;

                console.log(`welcome about to get path ${path}`);

                uapi(path, 'get', '', (data:SerializedGameState) => {
                    this.game.gameState = GameState.RehydrateGameState(data);
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