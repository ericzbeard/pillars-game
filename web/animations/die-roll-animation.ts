import { PillarsAnimation } from "./pillars-animation";
import { IPillarsGame } from "../interfaces/pillars-game";

/**
 * Animate the die roll for a promotion.
 */
export class DieRollAnimation extends PillarsAnimation {

    constructor(private game: IPillarsGame, 
                private roll:number, 
                private x:number, 
                private y:number, 
                private n:number) {

        super();
    }

    static GetKey(playerIndex: number, n:number) {
        return `DieRoll_${playerIndex}_${n}`;
    }

    getKey() {
        return DieRollAnimation.GetKey(this.game.gameState.currentPlayer.index, this.n);
    }

    /**
     * Render the die being rolled on the modal.
     */
    static RenderDie(game: IPillarsGame, playerIndex: number, rank: number, x:number, y:number) {

        const img = game.getImg(game.getDieName(playerIndex, rank));

        const scale = 2;

        if (img) {
            game.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    /**
     * Render the die being rolled on the modal.
     */
    renderDie(playerIndex: number, rank: number) {
        DieRollAnimation.RenderDie(this.game, playerIndex, rank, this.x, this.y);
    }

    animate(ctx: CanvasRenderingContext2D, deleteSelf: Function) {
        const elapsed = this.getElapsedTime();
        const end = 1000;
        if (elapsed >= end) {
            deleteSelf(this.getKey());
        } else {
            this.percentComplete = elapsed / end;
            let rank = (elapsed % 6) + 1;

            if (this.percentComplete > 0.9) {
                // Show the final roll at the end of the animation
                rank = this.roll;
            }

            const p = this.game.gameState.currentPlayer;

            this.renderDie(p.index, rank);
        }
    }
}
