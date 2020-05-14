import { IPillarsGame } from "./interfaces/pillars-game";

export const gameOver = (game:IPillarsGame) => {
    game.closeModal();
    const modal = game.showModal('Game Over!');
    modal.hideCloseButton();

    // Calculate score, including bonus customers.

    // Show all scores

    
}