import { GameState } from '../lambdas/game-state';
import {Player} from '../lambdas/player';

/**
 * Initializes a local game.
 */
export class LocalGame {

    static readonly AI_NAMES = ['Skynet', 'HAL 9000', 'Agent Smith'];

    gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    /**
     * Start a local game.
     */
    start() {

        const gs = this.gameState;
        gs.pillarMax = 6;

        // Create players (1 human and 3 AI)
        const human = new Player();
        human.isHuman = true;
        human.name = "Human";
        human.index = 0;

        gs.players.push(human);
        gs.currentPlayer = human;

        for (let i = 0; i < 3; i++) {
            const ai = new Player();
            ai.isHuman = false;
            ai.name = LocalGame.AI_NAMES[i];
            ai.index = (i + 1);
            gs.players.push(ai);
        }

        this.gameState.initializeCards();
    }
}