import { GameState } from "../../lambdas/game-state";
import { Player } from "../../lambdas/player";
import { Xywh } from "../ui-utils/xywh";
import { Modal } from "../ui-utils/modal";
import { Mouseable } from "../ui-utils/mouseable";
import { MouseableCard } from "../ui-utils/mouseable-card";
import { Card } from "../../lambdas/card";
import { PillarsAnimation } from "../animations/pillars-animation";
import { LoadProgress } from "../ui-utils/load-progress";
import { IGame } from "../../lambdas/interfaces/game";

/**
 * Function exports got the main class so other classes can make callbacks.
 */
export interface IPillarsGame extends IGame {

    /**
     * The canvas context.
     */
    ctx: CanvasRenderingContext2D;

    /**
     * The current state of the game according to the back end.
     */
    gameState: GameState;

    /**
     * The local person playing.
     */
    localPlayer: Player;

    /**
     * Get the default font for ctx.
     */
    getFont(size: number, style?: string): string;

    /**
     * Render a modal dialog that deactivates everything else until it is closed.
     */
    showModal(text: string, href?: string, xywh?: Xywh): Modal;

    /**
     * Close the modal.
     */
    closeModal(clickedClose?: boolean): any;

    /**
     * Add a mouseable UI element.
     */
    addMouseable(key: string, m: Mouseable): any;

    /**
     * Add a mouseable to the modal.
     */
    addToModal(key: string, m: Mouseable): any;

    /**
     * Remove a mouseable UI element.
     */
    removeMouseable(key: string): any;

    /**
     * Render a card.
     */
    renderCard(m: MouseableCard, isPopup?: boolean, scale?: number): any;

    /**
     * Initialize the local player's hand or discard pile.
     */
    initHandOrDiscard(isHand: boolean, isModal?: boolean,
        // tslint:disable-next-line: ban-types
        modalClick?: Function, hideCard?: Card): any

    /**
     * Play a sound.
     */
    playSound(name: string): any;

    /**
     * Broadcast a change to the game state.
     */
    broadcast(summary: string): Promise<any>;

    /**
     * Register a running animation.
     */
    registerAnimation(animation: PillarsAnimation): any;

    /**
     * Get the die name for the player and rank.
     */
    getDieName(i: number, r: number): any;

    /**
     * Get a loaded image. (Does not load the image)
     */
    getImg(name: string): HTMLImageElement;

    /**
     * Resize the canvas according to the window size.
     */
    resizeCanvas(): any;

    /**
     * Get an animation by key.
     */
    getAnimation(key: string): PillarsAnimation | undefined;

    /**
     * Put all cards in play and hand into discard pile. Draw 6.
     */
    endTurn(): Promise<any>;

    /**
     * Get the position of the mouse within the canvas.
     * Coordinates are relative to base width and height.
     */
    getMousePos(evt: MouseEvent): any;

    /**
     * Get the position of the touch within the canvas.
     * Coordinates are relative to base width and height.
     */
    getTouchPos(evt: TouchEvent): any;

    /**
     * Load sound files. This can only be done after user input.
     */
    initSounds(): any;

    /**
     * Return a z-index sorted array of mouseables.
     */
    sortMouseables(reverse?: boolean): Mouseable[];

    /**
     * Returns true if the mouseable key doesn't belong to the modal dialong
     * and we are currently showing a modal.
     */
    checkModal(key: string): boolean;

    /**
     * After the players finishes choosing custom actions, finish playing the card.
     */
    finishPlayingCard(m: MouseableCard, key: string): any;

    /**
     * Remove all mouesables that start with the specified string.
     */
    removeMouseableKeys(startsWith: string): any;

    /**
     * Return a reference to the canvas.
     */
    getCanvas(): HTMLCanvasElement;

    /**
     * Play a card from the local player's hand.
     */
    playCard(mcard: MouseableCard, callback: () => any): any;

    /**
     * Retire a card.
     */
    retireCard(cardToRetire: MouseableCard, callback?: () => any): any;

    /**
     * Discard a card.
     * 
     * This is called from modals where the player is choosing a card to retire.
     */
    discard(cardToDiscard: MouseableCard, callback?: () => any): any;

    /**
     * Acquire a card from the marketplace.
     */
    acquireCard(card: Card, key: string, free?: boolean, callback?: () => any): any;

    /**
     * Get the mousables map.
     */
    getMouseables(): Map<string, Mouseable>;

    /**
     * Respond to chat messages if ai is running.
     */
    respondToChat(chat: string): any;

    /**
     * Done loading images.
     */
    getDoneLoading(): boolean;

    /**
     * Put a diagnostic message in the chat.
     */
    diag(msg: string): any;

    /**
     * Promote a pillar rank die.
     */
    promote(playerIndex: number, pillarIndex: number): any;

    /**
     * Get them robots talking.
     */
    startAiChatter(): any;

    /**
     * Turn diagnostics on or off.
     */
    toggleDiag(): any;

    /**
     * Initialize areas that hold cards.
     */
    initCardAreas(): any;

    /**
     * Mute or unmute.
     */
    muteSounds(): any;

    /**
     * Initialize the screen.
     */
    initGameScreen(): any;

    /**
     * Play a local game against the AI with no connection to the back end.
     */
    startLocalGame(callback: () => any): any;

    /**
     * Get load progress.
     */
    getLoadProgress(): LoadProgress;

    /**
     * Returns true if it's the local player's turn.
     */
    itsMyTurn(): boolean;

    /**
     * Send a chat message.
     */
    chat(message: string): any;

    /**
     * Animate talent addition.
     */
    animateTalent(mcard: MouseableCard, n: number): Promise<any>;

    /**
     * Animate creativity addition.
     */
    animateCreativity(mcard: MouseableCard, n: number): Promise<any>;

    /**
     * Animate credit addition.
     */
    animateCredits(mcard: MouseableCard, n: number): Promise<any>;

    /**
     * Animate customer addition.
     */
    animateCustomer(mcard: MouseableCard, n: number): Promise<any>;

    /**
     * Returns true if the image load event has fired.
     */
    isImageLoaded(name: string): boolean;

    /**
     * Start polling for changes from the server.
     * 
     * TODO - websockets
     */
    startComms(): any;

    /**
     * Turn off the tutorial.
     */
    disableTutorial(): any;
}
