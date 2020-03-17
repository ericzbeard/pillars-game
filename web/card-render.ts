import { Card } from '../lambdas/card';
import { Player } from '../lambdas/player';
import { GameState, TrialStack } from '../lambdas/game-state';
import { CanvasUtil } from './canvas-util';
import { Howl, Howler } from 'howler';
import { PillarsWebConfig } from '../config/pillars-web-config';
import { MouseableCard, Mouseable, IPillarsGame } from './ui-utils';
import { PillarsImages, PillarsAnimation, Modal, ClickAnimation } from './ui-utils';
import { PillarDieAnimation, FrameRate, TextUtil, Button } from './ui-utils';
import { LocalGame } from './local-game';
import { CardActions } from './card-actions';
import { PillarsConstants } from './constants';
import { Trial } from './trial';

/**
 * Handles everything to do with rendering a card on screen.
 */
export class CardRender {

    ctx: CanvasRenderingContext2D;

    constructor(private game: IPillarsGame) {
        this.ctx = game.ctx;
    }

    /**
     * Render a big text image on the card n number of times.
     */
    renderImgOnCard(img: HTMLImageElement, x: number, y: number,
        n: number, scale: number): number {

        for (let i = 0; i < n; i++) {
            this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            x += img.width * scale
        }

        return x;
    }

    /**
     * Render a roman numeral on the card e.g. "*V".
     */
    renderTimesNumeralOnCard(numeral: string, x: number, y: number, scale: number) {
        x += 5 * scale;
        y += 25 * scale;
        this.ctx.font = this.game.getFont(30 * scale, 'bold');
        this.ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
        this.ctx.fillText(` * ${numeral}`, x + 10 * scale, y);
    }

    /**
     * Render the small text under the big text area.
     */
    renderSmallText(card: Card, cardx: number, cardy: number, scale: number) {
        const ctx = this.ctx;

        const y = cardy + 120 * scale;
        let x = cardx + ((PillarsConstants.CARD_WIDTH * scale) / 2);

        this.ctx.font = this.game.getFont(10 * scale);
        this.ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
        this.ctx.textAlign = 'center';

        if (card.text) {
            if (card.text.length > 50) {
                this.ctx.font = this.game.getFont(8 * scale);
            }
            TextUtil.wrapText(this.ctx, card.text, x, y,
                PillarsConstants.CARD_WIDTH * scale, 12 * scale);
        } else if (card.starter) {
            // Put reminder text on starter cards

            this.ctx.font = this.game.getFont(10 * scale, 'italic');

            if (card.provides) {

                let augment = '';
                if (card.subtype == 'Augment Human') {
                    augment = ' if you have a human resource in play';
                }
                if (card.subtype == 'Augment Cloud') {
                    augment = ' if you have a cloud resource in play';
                }

                if (card.provides.Talent) {
                    TextUtil.wrapText(this.ctx, `(Provides 1 Talent${augment})`, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
                }
                if (card.provides.Creativity) {
                    TextUtil.wrapText(this.ctx, `(Provides 1 Creativity${augment})`, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
                }
                if (card.provides.Credit) {
                    TextUtil.wrapText(this.ctx, `(Provides 1 Credit${augment})`, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
                }
            }

        } else if (card.provides) {

            this.ctx.font = this.game.getFont(10 * scale, 'italic');

            if (card.provides.CreditByPillar) {
                const numeral = PillarsConstants.NUMERALS[card.provides.CreditByPillar];
                const text = `(Provides 1 Credit for each rank on your pillar ${numeral})`;
                TextUtil.wrapText(this.ctx, text, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
            } 
            if (card.provides.TalentByPillar) {
                const numeral = PillarsConstants.NUMERALS[card.provides.TalentByPillar];
                const text = `(Provides 1 Talent for each rank on your pillar ${numeral})`;
                TextUtil.wrapText(this.ctx, text, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
            } 
            if (card.provides.CreativityByPillar) {
                const numeral = PillarsConstants.NUMERALS[card.provides.CreativityByPillar];
                const text = `(Provides 1 Creativity for each rank on your pillar ${numeral})`;
                TextUtil.wrapText(this.ctx, text, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
            } 

        }

    }

    /**
     * Render the main, big, bold text or graphics on the card.
     */
    renderBigText(card: Card, cardx: number, cardy: number, scale: number) {
        const ctx = this.ctx;

        let img = undefined;
        let numImg = 0;
        let imgScale = 1;
        let providesLen = card.getProvidesLength();

        if (card.provides) {
            if (card.provides.CreditByPillar !== undefined ||
                card.provides.TalentByPillar != undefined ||
                card.provides.CreativityByPillar != undefined) {

                providesLen = 3;
            }
        }

        const y = cardy + 75 * scale;
        const resourceScale = 0.3 * scale;
        const custScale = 0.075 * scale;
        let w = providesLen * 100 * resourceScale;
        let x = cardx + ((PillarsConstants.CARD_WIDTH * scale) / 2) - (w / 2);

        // The bigtext field is only populated for things we don't specify
        // in a data-driven, programmatic way
        if (card.bigtext) {
            ctx.font = this.game.getFont(24 * scale, 'bold');
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            ctx.fillText(card.bigtext, x, y + 30 * scale,
                PillarsConstants.CARD_WIDTH * scale);
        }

        if (card.provides) {

            // T, $, Cr, and Cust can happen more than once

            if (card.provides.Talent) {
                img = this.game.getImg(PillarsImages.IMG_TALENT);
                x = this.renderImgOnCard(img, x, y, card.provides.Talent, resourceScale);
            }
            if (card.provides.Credit) {
                img = this.game.getImg(PillarsImages.IMG_CREDITS);
                x = this.renderImgOnCard(img, x, y, card.provides.Credit, resourceScale);
            }
            if (card.provides.Creativity) {
                img = this.game.getImg(PillarsImages.IMG_CREATIVITY);
                x = this.renderImgOnCard(img, x, y, card.provides.Creativity, resourceScale);
            }
            if (card.provides.Customer) {
                img = this.game.getImg(PillarsImages.IMG_CUSTOMER_BLUE);
                x = this.renderImgOnCard(img, x, y, card.provides.Customer, custScale);
            }

            // Resource * Pillar is always by itself

            if (card.provides.CreditByPillar !== undefined) {
                img = this.game.getImg(PillarsImages.IMG_CREDITS);
                x = this.renderImgOnCard(img, x, y, 1, resourceScale);
                this.renderTimesNumeralOnCard(<string>card.pillarNumeral,
                    x, y, scale);
            }
            if (card.provides.TalentByPillar !== undefined) {
                img = this.game.getImg(PillarsImages.IMG_TALENT);
                x = this.renderImgOnCard(img, x, y, 1, resourceScale);
                this.renderTimesNumeralOnCard(<string>card.pillarNumeral,
                    x, y, scale);
            }
            if (card.provides.CreativityByPillar !== undefined) {
                img = this.game.getImg(PillarsImages.IMG_CREATIVITY);
                x = this.renderImgOnCard(img, x, y, 1, resourceScale);
                this.renderTimesNumeralOnCard(<string>card.pillarNumeral,
                    x, y, scale);
            }
        }


        if (card.action) {

            if (!card.provides) {

                // Big text
                ctx.font = this.game.getFont(24 * scale, 'bold');
                ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
                ctx.textAlign = 'center';

                let text = '';

                if (card.action.Retire) {
                    text = `Retire ${card.action.Retire}`;
                }
                if (card.action.Promote) {
                    // 0-4 means that pillar
                    // 5 means any
                    // 6 means roll a d6
                    if (card.action.Promote < 5) {
                        const numerals = ['I', 'II', 'III', 'IV', 'V'];
                        const numeral = numerals[card.action.Promote];
                        text = `Promote ${numeral}`;
                    } else if (card.action.Promote == 5) {
                        text = 'Promote Any';
                    } else {
                        text = 'Promote';
                    }
                }
                if (card.action.Draw) {
                    text = `Draw ${card.action.Draw}`;
                }

                ctx.fillText(text, x, y + 30 * scale);

            } else {

                // The text field is used to describe actions on cards
                // that also provide. (Nothing to do here)

            }
        }

        if (card.trial) {

            ctx.font = this.game.getFont(24 * scale, 'bold');
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            ctx.fillText(card.trial + '', x, y + 30 * scale);

        }

    }

    /**
     * Render a 6-sided die.
     */
    renderDie(x: number, y: number, playerIndex: number, rank: number,
        scale: number, a?: PillarsAnimation) {
        const img = this.game.getImg(this.game.getDieName(playerIndex, rank));
        if (a) {
            x += 2;
            y += 2;
        }
        if (img) {
            this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    }

    /**
     * Render a card.
     */
    renderCard(m: MouseableCard, isPopup?: boolean, scale?: number): any {
        const card = m.card;
        const ctx = this.ctx;
        let x = m.x;
        let y = m.y;
        let w = m.w;
        let h = m.h;
        let radius = PillarsConstants.CARD_RADIUS;
        let p = this.game.localPlayer;
        if (scale === undefined) {
            scale = 1;
        }

        if (card.type == 'Pillar') {
            scale = PillarsConstants.PILLAR_SCALE;
        }

        if (isPopup) {
            scale = PillarsConstants.POPUP_SCALE;
            x = PillarsConstants.BIGCARDX;
            y = PillarsConstants.BIGCARDY;
            m.x = x;
            m.y = y;
        }

        radius *= scale;
        w *= scale;
        h *= scale;

        // Card border
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';

        // Highlight the card if hovering
        if (m.hovering) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'gray';
        }

        // Highlight market cards if the local player can purchase it
        let isInMarket = false;
        for (const c of this.game.gameState.currentMarket) {
            if (c.uniqueIndex == m.card.uniqueIndex) {
                isInMarket = true;
                break;
            }
        }

        let isInHand = false;
        for (const c of this.game.localPlayer.hand) {
            if (c.uniqueIndex == m.card.uniqueIndex) {
                isInHand = true;
            }
        }

        let highlight = false;

        if (isInMarket && m.card.canAcquire(p.numCredits, p.numTalents)) {
            highlight = true;
        }
        if (isInHand && this.game.gameState.canPlayCard(m.card)) {
            highlight = true;
        }

        if (highlight) {
            ctx.save()
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            CanvasUtil.roundRect(this.ctx, x - 2, y - 2, w + 4, h + 4, radius, false, true);
            ctx.restore();
        }

        // Card border
        ctx.fillStyle = '#FEF9E7';
        CanvasUtil.roundRect(this.ctx, x, y, w, h, radius, true, true);
        ctx.fillStyle = 'black';

        // Card Image
        const imgFileName = m.card.getImageName();
        const img = this.game.getImg(imgFileName);
        if (img) {
            this.game.renderCardImage(imgFileName, x, y, scale);
        } else {
            console.log(`[Log] Unable to get img ${imgFileName}`);
        }

        let fontSize = 14 * scale;

        ctx.font = this.game.getFont(fontSize);
        ctx.fillStyle = PillarsConstants.COLOR_WHITE;

        // Card Name
        if (card.type == 'Pillar') {
            ctx.textAlign = 'center';
            ctx.fillText(card.name, x + w / 2, y + 18);
        } else {
            ctx.textAlign = 'left';
            let namex = x + 5 * scale;
            let namey = y + 18 * scale;
            ctx.fillText(card.name, namex, namey, PillarsConstants.CARD_WIDTH * scale - 5);
        }

        // Info hyperlink
        if (card.info) {
            const infoLink = new Mouseable();
            const infox = x + w - 25;
            const infoy = y + 5;
            const infow = 20;
            const infoh = 20;
            infoLink.x = infox;
            infoLink.y = infoy;
            infoLink.w = infow;
            infoLink.h = infoh;
            infoLink.zindex = m.zindex + 0.1;
            infoLink.render = () => {
                const infoimg = this.game.getImg(PillarsImages.IMG_INFO);
                if (infoimg) {
                    ctx.drawImage(infoimg, infox, infoy, 20, 20);
                } else {
                    console.log(`Unable to get img ${PillarsImages.IMG_INFO}`);
                }
            };
            infoLink.onclick = () => {
                this.game.showModal(<string>card.info, card.href);
                this.game.playSound('menuselect.wav');
            };
            this.game.addMouseable(m.getInfoKey(), infoLink);
        }

        fontSize = 9 * scale;

        // Marketing
        if (card.marketing) {
            ctx.textAlign = 'left';
            let mkx = x + 5 * scale;
            let mky = y + 30 * scale;

            ctx.font = this.game.getFont(fontSize, 'italic');
            let maxw: any = PillarsConstants.CARD_WIDTH * scale - 10;
            ctx.fillText(<string>card.marketing, mkx, mky, maxw);
        }

        // Flavor
        if (card.flavor) {
            fontSize = 9 * scale;
            ctx.font = this.game.getFont(fontSize, 'italic');
            ctx.textAlign = 'center';
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            let fx = x + ((PillarsConstants.CARD_WIDTH * scale) / 2);
            let fy = y + (25 * scale) + ((PillarsConstants.CARD_HEIGHT * scale) / 2);
            let maxw: any = PillarsConstants.CARD_WIDTH * scale - 10;
            ctx.fillText(<string>card.flavor, fx, fy, maxw);
        }

        if (card.type != 'Pillar' && !card.hideType) {
            // Card Type and Subtype
            ctx.font = this.game.getFont(10);
            let t = card.type.toLocaleUpperCase();
            if (card.subtype) {
                t += ' - ' + card.subtype.toLocaleUpperCase();
            }
            ctx.textAlign = 'center';
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            let ty = y + 60 * scale;
            ctx.font = this.game.getFont(9 * scale, 'bold');
            ctx.fillText(t, x + w / 2, ty);
        }

        // Cost
        if (card.cost) {
            let costw = 10;
            let costh = 10;
            if (card.cost.length >= 5) {
                costw = 8;
                costh = 8;
            }
            let costoffx = 60 * scale;
            let costoffy = 35 * scale;
            let cw = PillarsConstants.CARD_WIDTH;
            let ch = PillarsConstants.CARD_HEIGHT;
            costw *= scale;
            costh *= scale;
            cw *= scale;
            ch *= scale;

            //ctx.strokeRect(x + cw - costoffx, y + ch - costoffy, 6 * costw, costh);

            // What a mess

            // len=6 off=0, len=4 off=1, len=2 off=2
            const centeroff = ((6 - card.cost.length) / 2) * costw;

            // Center the images, assuming a max cost of 6
            const costx = x + cw - costoffx + centeroff;
            const costy = y + ch - costoffy;

            for (let i = 0; i < card.cost.length; i++) {
                const cc = card.cost.charAt(i);
                let imgName = '';
                switch (cc) {
                    case 'T':
                        imgName = PillarsImages.IMG_TALENT;
                        break;
                    case '$':
                        imgName = PillarsImages.IMG_CREDITS;
                        break;
                    default:
                        throw Error('Unexpected cost: ' + cc);
                }
                const img = this.game.getImg(imgName);
                ctx.drawImage(img, costx + (i * costw), costy, costw, costh);
            }
        }

        // Cloud Category
        if (card.category) {
            ctx.font = this.game.getFont(6 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            ctx.fillText(card.category.toUpperCase(), x + (32 * scale), y + (207 * scale));
        }

        // Big Text
        if (card.type != 'Pillar') {
            ctx.font = this.game.getFont(12 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            this.renderBigText(card, x, y, scale);
        }

        // Small text
        if (card.type != 'Pillar') {
            ctx.font = this.game.getFont(10 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            this.renderSmallText(card, x, y, scale);
        }

        if (card.type == 'Pillar') {

            const pidx: number = card.pillarIndex || 0;

            // Draw player rank dice

            const p: Array<any> = [];
            p[0] = { x: 5 * scale, y: 40 * scale };
            p[1] = { x: w - 55 * scale, y: 40 * scale };
            p[2] = { x: 5 * scale, y: h - 55 * scale };
            p[3] = { x: w - 55 * scale, y: h - 55 * scale };

            for (let i = 0; i < this.game.gameState.players.length; i++) {

                ctx.font = this.game.getFont(16, 'bold');
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'black';

                const player = this.game.gameState.players[i];

                const animKey = PillarDieAnimation.GetKey(i, pidx);
                const a = <PillarsAnimation>this.game.getAnimation(animKey);

                this.renderDie(x + p[i].x, y + p[i].y, i, player.pillarRanks[pidx], scale, a);
            }
        }

        // Reset alignment
        ctx.textAlign = "left";
    }

}