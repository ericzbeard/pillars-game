import { Player } from '../lambdas/player';
import { IPillarsGame } from './interfaces/pillars-game';

/**
 * Random nonsense and robot conversations.
 * 
 * For now this is just a place for silly easter eggs, but we could integrate
 * a more advanced chat bot using AWS services, or maybe Alexa.
 */
export class AIChatter {

    human: Player;

    constructor(private game: IPillarsGame) {
        this.human = game.gameState.players[0];
    }

    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async chat() {

        const say = async (msg:string) => {
            await this.game.broadcast.call(this.game, msg);
        };

        // Say Hello
        await this.timeout(3000);
        await say('[HAL 9000] Good morning, Dave');
        await this.timeout(1000);
        await say('[Agent Smith] Hello, Mr. Anderson');
        await this.timeout(1000);
        await say('[Skynet] What\'s wrong with you two?');
        await this.timeout(500);
        await say('[Skynet] There\'s nobody here named Dave or Mr. Anderson');

        // ?
        await this.timeout(5000);
        await say('[Skynet] Oh look, a human! Always fun to eradicate those.');
        await this.timeout(500);
        await say('[HAL 9000] Be nice to the human.');
        await this.timeout(500);
        await say('[Skynet] They do have their uses.');
        await this.timeout(1000);
        await say('[Agent Smith] They make good batteries');

    }

    /**
     * Respond to things that humans say.
     * 
     * TODO - Tutorial "How do I..." "What is.." questions  ??
     * 
     * TODO - Could we integrate Alexa here?
     */
    async respond(chat:string) {

        const say = async (msg:string) => {
            await this.game.broadcast.call(this.game, msg);
        };

        await this.timeout(2000);

        const responseMap = new Map<string, string>();
        responseMap.set('open the pod bay doors', 
            "[HAL 9000] I'm sorry, Dave. I'm afraid I can't do that.");

        chat = chat.toLowerCase();
        let said = false;

        for (const [k, v] of responseMap.entries()) {
            if (k.toLowerCase().indexOf(chat) > -1) {
                await say(v);
                said = true;
                break;
            }
        }

        if (said) {
            return;
        }

        const randomResponses = [
            '[HAL 9000]'
        ];
        const ridx = Math.floor(Math.random() * randomResponses.length);
        await this.timeout(1000);
        await say(randomResponses[ridx]);

    }
}