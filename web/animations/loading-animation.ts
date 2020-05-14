import { PillarsAnimation } from "./pillars-animation";
import { IPillarsGame } from "../interfaces/pillars-game";
import { CardRender } from "../card-render";
import { PillarsImages } from "../ui-utils/images";
import { PillarsConstants } from '../constants';

/**
 * Animate the loading screen.
 */
export class LoadingAnimation extends PillarsAnimation {
    static readonly LOAD_MS = 3000;

    constructor(private game: IPillarsGame) {

        super();
    }

    static GetKey() {
        return `WelcomeLoading_Animation`;
    }

    getKey() {
        return LoadingAnimation.GetKey();
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: (key:string) => any) {
        const elapsed = this.getElapsedTime();
        const end = LoadingAnimation.LOAD_MS;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            const minScale = 0.1;
            const maxScale = 3;
            ctx.globalAlpha = this.percentComplete;
            const scale = maxScale * this.percentComplete;
            const x = PillarsConstants.MODAL_HALFX - (PillarsConstants.CARD_WIDTH * scale) / 2;
            const y = PillarsConstants.MODAL_HALFY - (PillarsConstants.CARD_HEIGHT * scale) / 2;
            const cr = new CardRender(this.game);
            cr.renderCardImage(PillarsImages.IMG_BACK_BLUE, x, y, scale);
        }
    }
}