import { Card } from '../lambdas/card';
import { CanvasUtil } from './canvas-util';
import { PillarsConstants } from './constants';
import { IPillarsGame } from './interfaces/pillars-game';
import { TextUtil } from './ui-utils/text-util';
import { PillarsImages } from './ui-utils/images';
import { PillarsAnimation } from './animations/pillars-animation';
import { MouseableCard } from './ui-utils/mouseable-card';
import { PillarDieAnimation } from './animations/die-animation';

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

        const y = cardy + 135 * scale;
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
                if (card.subtype === 'Augment Human') {
                    augment = ' if you have a human resource in play';
                }
                if (card.subtype === 'Augment Cloud') {
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

            if (card.provides.CreditByPillar !== undefined) {
                const numeral = PillarsConstants.NUMERALS[card.provides.CreditByPillar];
                const text = `(Provides 1 Credit for each rank on your pillar ${numeral})`;
                TextUtil.wrapText(this.ctx, text, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
            } 
            if (card.provides.TalentByPillar !== undefined) {
                const numeral = PillarsConstants.NUMERALS[card.provides.TalentByPillar];
                const text = `(Provides 1 Talent for each rank on your pillar ${numeral})`;
                TextUtil.wrapText(this.ctx, text, x, y,
                    PillarsConstants.CARD_WIDTH * scale, 12 * scale);
            } 
            if (card.provides.CreativityByPillar !== undefined) {
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

        let img;
        let providesLen = card.getProvidesLength();

        if (card.provides) {
            if (card.provides.CreditByPillar !== undefined ||
                card.provides.TalentByPillar !== undefined ||
                card.provides.CreativityByPillar !== undefined) {

                providesLen = 3;
            }
        }

        const y = cardy + 90 * scale;
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
                if (card.action.Promote !== undefined) {
                    // 0-4 means that pillar
                    // 5 means any
                    // 6 means roll a d6
                    if (card.action.Promote < 5) {
                        const numerals = ['I', 'II', 'III', 'IV', 'V'];
                        const numeral = numerals[card.action.Promote];
                        text = `Promote ${numeral}`;
                    } else if (card.action.Promote === 5) {
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
        
        const pillarMax = this.game.gameState.pillarMax;
        const img = this.game.getImg(this.game.getDieName(playerIndex, rank));

        let w = img.width * scale;
        let h = img.height * scale;

        if (a) {
            x -= 2;
            y -= 2;
            w += 4;
            h += 4;
        }
       
        if (img) {
            this.ctx.drawImage(img, x, y, w, h);
        }


        if (a) {
            let pct = a.percentComplete;
            let ax = x - (pct * 5);
            let ay = y - (pct * 5);
            w = w + (pct * 10);
            h = h + (pct * 10);
            this.ctx.strokeStyle = 'white';
            CanvasUtil.roundRect(this.ctx, ax, ay, w, h, 5, false, true);

            // TODO - Lock animation

        } else {
            if (rank == pillarMax) {
                // This die is locked and can't change
                this.ctx.strokeStyle = 'gray';
                this.ctx.lineWidth = 2;
                CanvasUtil.roundRect(this.ctx, x - 1, y - 1, w + 2, h + 2, 5, false, true);
                this.ctx.lineWidth = 1;
            }
        }
    }

    /**
     * Render parts of the card unique to trials.
     * 
     * Success/Fail
     */
    renderTrial(card:Card, x:number, y:number, scale: number) {

        const sx = x + 13 * scale;
        const ty = y + 200 * scale;
        const fx = x + PillarsConstants.CARD_WIDTH / 2 * scale + 2;
        const lh = 15 * scale;
        const maxw = PillarsConstants.CARD_WIDTH / 2 * scale - 10 * scale;

        this.ctx.font = this.game.getFont(9 * scale);
        this.ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
        this.ctx.textAlign = 'left';
        let cury = ty;

        // Success
        if (card.success) {
            if (!card.success.custom) {
                cury += 10;
            }
            if (card.success.customers) {
                const s = card.success.customers > 1 ? 's' : '';
                this.ctx.fillText(`+${card.success.customers} Customer${s}`, sx, cury);
                cury += lh;
            }
            if (card.success.promote) {
                if (card.success.promote < 5) {
                    const numeral = PillarsConstants.NUMERALS[card.success.promote];
                    this.ctx.fillText(`Promote ${numeral}`, sx, cury);
                    cury += lh;
                }
                if (card.success.promote === 5) {
                    this.ctx.fillText('Promote Any', sx, cury);
                    cury += lh;
                }
                if (card.success.promote === 6) {
                    this.ctx.fillText('Promote', sx, cury);
                    cury += lh;
                }
            }
            if (card.success.custom) {
                this.ctx.font = this.game.getFont(7 * scale);
                TextUtil.wrapText(this.ctx, card.success.custom, sx, cury, 
                    maxw, 9 * scale);
            }
        }

        this.ctx.font = this.game.getFont(9 * scale);
        cury = ty;

        // Fail
        if (card.fail) {
            if (!card.fail.custom && !card.success?.custom) {
                cury += 10;
            }
            if (card.fail.customers) {
                const s = card.fail.customers > 1 ? 's' : '';
                this.ctx.fillText(`${card.fail.customers} Customer${s}`, fx, cury);
                cury += lh;
            }
            if (card.fail.demote) {
                if (card.fail.demote < 5) {
                    const numeral = PillarsConstants.NUMERALS[card.fail.demote];
                    this.ctx.fillText(`Demote ${numeral}`, fx, cury);
                    cury += lh;
                }
                if (card.fail.demote === 5) {
                    this.ctx.fillText('Demote Any', fx, cury); // ?
                    cury += lh;
                }
                if (card.fail.demote === 6) {
                    this.ctx.fillText('Demote', fx, cury);
                    cury += lh;
                }
            }
            if (card.fail.custom) {
                this.ctx.font = this.game.getFont(7 * scale);
                TextUtil.wrapText(this.ctx, card.fail.custom, fx, cury, 
                    maxw, 9 * scale);
            }
        }
    }

    /**
     * Render a card using an image file.
     * 
     * The image has to be scaled and masked.
     */
    renderCardImage(name: string, x: number, y: number, scale?: number) {

        if (!this.game.getDoneLoading()) {
            return;
        }

        if (scale === undefined) {
            scale = 1.0;
        }

        const ctx = this.ctx;

        ctx.save();

        // Draw a mask

        let radius = PillarsConstants.CARD_RADIUS;
        let width = PillarsConstants.CARD_WIDTH;
        let height = PillarsConstants.CARD_HEIGHT;

        radius = radius * scale;
        width = width * scale;
        height = height * scale;

        const radii = { tl: radius, tr: radius, br: radius, bl: radius };

        ctx.beginPath();
        ctx.moveTo(x + radii.tl, y);
        ctx.lineTo(x + width - radii.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radii.tr);
        ctx.lineTo(x + width, y + height - radii.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radii.br, y + height);
        ctx.lineTo(x + radii.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radii.bl);
        ctx.lineTo(x, y + radii.tl);
        ctx.quadraticCurveTo(x, y, x + radii.tl, y);
        ctx.closePath();
        ctx.stroke();

        ctx.clip();

        // Draw the image in the mask
        const img = this.game.getImg(name);
        const imgScale = PillarsConstants.CARD_IMAGE_SCALE * scale;
        const offset = 14 * scale;
        ctx.drawImage(img, x - offset, y - offset, 
            img.width * imgScale, img.height * imgScale);

        ctx.restore();
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
        const player = this.game.localPlayer;
        if (scale === undefined) {
            scale = 1;
        }

        if (card.type === 'Pillar') {
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
            if (c.uniqueIndex === m.card.uniqueIndex) {
                isInMarket = true;
                break;
            }
        }

        let isInHand = false;
        for (const c of this.game.localPlayer.hand) {
            if (c.uniqueIndex === m.card.uniqueIndex) {
                isInHand = true;
            }
        }

        let highlight = false;

        if (isInMarket && m.card.canAcquire(player.numCredits, player.numTalents)) {
            highlight = true;
        }
        
        if (isInHand && this.game.gameState.canPlayCard(m.card, this.game.localPlayer)) {
            highlight = true;
        }

        if (m.key.startsWith(PillarsConstants.MODAL_KEY)) {
            highlight = false;
        }

        if (highlight) {
            ctx.save()
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            CanvasUtil.roundRect(this.ctx, x - 2, y - 2, w + 4, h + 4, 
                radius, false, true);
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
            this.renderCardImage(imgFileName, x, y, scale);
        } else {
            console.log(`[Log] Unable to get img ${imgFileName}`);
        }

        let fontSize = 14 * scale;

        ctx.font = this.game.getFont(fontSize);
        ctx.fillStyle = PillarsConstants.COLOR_WHITE;

        // Card Name
        if (card.type === 'Pillar') {
            ctx.textAlign = 'center';
            ctx.fillText(card.name, x + w / 2, y + 18);
        } else {
            ctx.textAlign = 'left';
            const namex = x + 5 * scale;
            const namey = y + 18 * scale;
            ctx.fillText(card.name, namex, namey, PillarsConstants.CARD_WIDTH * scale - 5);
        }

        fontSize = 9 * scale;

        // Marketing
        if (card.marketing) {
            ctx.textAlign = 'left';
            const mkx = x + 5 * scale;
            const mky = y + 30 * scale;

            ctx.font = this.game.getFont(fontSize, 'italic');
            const maxw: any = PillarsConstants.CARD_WIDTH * scale - 10;
            ctx.fillText(card.marketing as string, mkx, mky, maxw);
        }

        // Flavor
        if (card.flavor) {
            fontSize = 9 * scale;
            ctx.font = this.game.getFont(fontSize, 'italic');
            ctx.textAlign = 'center';
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            const fx = x + ((PillarsConstants.CARD_WIDTH * scale) / 2);
            const fy = y + (25 * scale) + ((PillarsConstants.CARD_HEIGHT * scale) / 2);
            const maxw: any = PillarsConstants.CARD_WIDTH * scale - 10;
            ctx.fillText(card.flavor as string, fx, fy, maxw);
        }

        // Card Type and Subtype
        if (card.type !== 'Pillar' && !card.hideType) {
            ctx.font = this.game.getFont(10);
            let t = card.type.toLocaleUpperCase();
            if (card.subtype) {
                t += ' - ' + card.subtype.toLocaleUpperCase();
            }
            ctx.textAlign = 'center';
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            const ty = y + 70 * scale;
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
            const costoffx = 65 * scale;
            const costoffy = 45 * scale;
            let cw = PillarsConstants.CARD_WIDTH;
            let ch = PillarsConstants.CARD_HEIGHT;
            costw *= scale;
            costh *= scale;
            cw *= scale;
            ch *= scale;

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
                const rimg = this.game.getImg(imgName);
                ctx.drawImage(rimg, costx + (i * costw), costy, costw, costh);
            }
        }

        // Cloud Category
        if (card.category) {
            ctx.font = this.game.getFont(8 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_WHITEISH;
            ctx.fillText(card.category.toUpperCase(), x + (32 * scale), y + (237 * scale));
        }

        // Big Text
        if (card.type !== 'Pillar') {
            ctx.font = this.game.getFont(12 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            this.renderBigText(card, x, y, scale);
        }

        // Small text
        if (card.type !== 'Pillar') {
            ctx.font = this.game.getFont(10 * scale);
            ctx.fillStyle = PillarsConstants.COLOR_BLACKISH;
            ctx.textAlign = 'center';
            this.renderSmallText(card, x, y, scale);
        }

        if (card.type === 'Pillar') {

            const pidx: number = card.pillarIndex || 0;

            // Draw player rank dice

            const p: any[] = [];
            p[0] = { x: 5 * scale, y: 45 * scale };
            p[1] = { x: w - 55 * scale, y: 45 * scale };
            p[2] = { x: 5 * scale, y: h - 55 * scale };
            p[3] = { x: w - 55 * scale, y: h - 55 * scale };

            for (let i = 0; i < this.game.gameState.players.length; i++) {

                ctx.font = this.game.getFont(16, 'bold');
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'black';

                const animKey = PillarDieAnimation.GetKey(i, pidx);
                const a = this.game.getAnimation(animKey) as PillarsAnimation;

                this.renderDie(x + p[i].x, y + p[i].y, 
                    i, player.pillarRanks[pidx], scale, a);
            }
        }

        if (card.trial !== undefined) {
            this.renderTrial(card, x, y, scale);
        }

        // Reset alignment
        ctx.textAlign = "left";
    }

}