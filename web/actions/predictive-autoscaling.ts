import { IPillarsGame, Mouseable, MouseableCard, PillarsImages } from '../ui-utils';
import { Card } from '../../lambdas/card';
import { PillarsConstants } from '../constants';
import { CardRender } from '../card-render';
import { IGame, ICardContainer } from '../../lambdas/card-actions';

/**
 * Look at the top card of any trial stack. 
 * You may put it on the bottom of that stack face up.
 */
export const predictiveAutoscaling = (
    g:IGame, 
    m: ICardContainer, 
    callback:Function) => {

    const game = <IPillarsGame>g;
    const mcard = <MouseableCard>m;


    const modal = game.showModal(
        "Look at the top card of any trial stack. " +
        "You may put it on the bottom of that stack face up.");

    const cardRender = new CardRender(game);

    const scale = PillarsConstants.MODAL_CARD_ACTION_SCALE;

    const offset = PillarsConstants.CARD_WIDTH * scale + 50 * scale;
    let w = offset * 3;

    let x = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - w / 2;
    let y = PillarsConstants.MODALY + 250;

    game.ctx.font = game.getFont(12);
    game.ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;

    const topOrBottom = (index: number) => {
        game.showModal('Leave the trial on top or put it on the bottom');

        const stack = game.gameState.trialStacks[index];
        game.gameState.checkTrialStack(stack);
        const trialCardName = stack.notused[0].name;

        const topCard = Object.assign(new Card(),
            game.gameState.cardMasters.get('Predictive Autoscaling'));
        topCard.action = undefined;
        topCard.bigtext = 'Top';
        topCard.text = undefined;
        topCard.name = '';
        topCard.category = undefined;
        topCard.cost = undefined;
        topCard.hideType = true;
        const top = new MouseableCard(topCard);
        top.x = PillarsConstants.MODALX + PillarsConstants.MODALW / 2 - w / 2;
        top.y = y;
        top.zindex = PillarsConstants.MODALZ + 1;
        top.render = () => {
            game.renderCard(top, false, scale);
        };
        top.onclick = () => {
            game.closeModal();
            callback();
            game.broadcast(`${game.gameState.currentPlayer.name} ` +
                `looked at trial stack ${index + 1} and left the card on top`);
        };
        game.addMouseable(PillarsConstants.MODAL_KEY + '_top', top);

        // Show the trial
        const trialCard = stack.notused[0];
        const trial = new MouseableCard(trialCard);
        trial.x = top.x + offset;
        trial.y = top.y;
        trial.zindex = top.zindex;
        trial.render = () => {
            game.renderCard(trial, false, scale);
        };
        game.addMouseable(PillarsConstants.MODAL_KEY + '_trial', trial);

        const bottomCard = Object.assign(new Card(),
            game.gameState.cardMasters.get('Predictive Autoscaling'));
        bottomCard.action = undefined;
        bottomCard.bigtext = 'Bottom';
        bottomCard.text = undefined;
        bottomCard.name = '';
        bottomCard.category = undefined;
        bottomCard.cost = undefined;
        bottomCard.hideType = true;
        const bottom = new MouseableCard(bottomCard);
        bottom.x = trial.x + offset;
        bottom.y = trial.y;
        bottom.zindex = trial.zindex;
        bottom.render = () => {
            game.renderCard(bottom, false, scale);
        };
        bottom.onclick = () => {
            game.closeModal();
            const t = stack.notused.shift();
            stack.used.push(<Card>t);
            callback();
            game.broadcast(`${game.gameState.currentPlayer.name} ` +
                `put ${trialCardName} on the bottom of the trial stack`);
        };
        game.addMouseable(PillarsConstants.MODAL_KEY + '_bottom', bottom);

    };

    const textoffset = (PillarsConstants.CARD_WIDTH * scale) / 2;

    // Phase 1
    const p1 = new Mouseable();
    p1.x = x;
    p1.y = y;
    p1.w = PillarsConstants.CARD_WIDTH * scale;
    p1.h = PillarsConstants.CARD_HEIGHT * scale;
    p1.zindex = PillarsConstants.MODALZ + 1;
    p1.render = () => {
        game.ctx.fillText('Phase 1', p1.x + textoffset, p1.y - 10);
        cardRender.renderCardImage(PillarsImages.IMG_BACK_GREEN, p1.x, p1.y, scale);
        cardRender.renderCardImage(PillarsImages.IMG_BACK_GREEN, p1.x + 5, p1.y + 5, scale);
    };
    p1.onclick = () => {
        game.closeModal();
        topOrBottom(0);
    };
    game.addMouseable(PillarsConstants.MODAL_KEY + '_p1', p1);

    x += offset;

    // Phase 2
    const p2 = new Mouseable();
    p2.x = x;
    p2.y = y;
    p2.w = PillarsConstants.CARD_WIDTH * scale;
    p2.h = PillarsConstants.CARD_HEIGHT * scale;
    p2.zindex = PillarsConstants.MODALZ + 1;
    p2.render = () => {
        game.ctx.fillText('Phase 2', p2.x + textoffset, p2.y - 10);
        cardRender.renderCardImage(PillarsImages.IMG_BACK_ORANGE, p2.x, p2.y, scale);
        cardRender.renderCardImage(PillarsImages.IMG_BACK_ORANGE, p2.x + 5, p2.y + 5, scale);
    };
    p2.onclick = () => {
        game.closeModal();
        topOrBottom(1);
    };
    game.addMouseable(PillarsConstants.MODAL_KEY + '_p2', p2);

    // Phase 3
    x += offset;
    const p3 = new Mouseable();
    p3.x = x;
    p3.y = y;
    p3.w = PillarsConstants.CARD_WIDTH * scale;
    p3.h = PillarsConstants.CARD_HEIGHT * scale;
    p3.zindex = PillarsConstants.MODALZ + 1;
    p3.render = () => {
        game.ctx.fillText('Phase 3', p3.x + textoffset, p3.y - 10);
        cardRender.renderCardImage(PillarsImages.IMG_BACK_PINK, p3.x, p3.y, scale);
        cardRender.renderCardImage(PillarsImages.IMG_BACK_PINK, p3.x + 5, p3.y + 5, scale);
    };
    p3.onclick = () => {
        game.closeModal();
        topOrBottom(2);
    };
    game.addMouseable(PillarsConstants.MODAL_KEY + '_p3', p3);
}
