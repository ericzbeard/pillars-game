/**
 * A Pillars Card.
 */
export class Card {

    static readonly TALENTS = "Talents";
    static readonly CREDITS = "Credits";

    name: string;
    type: string;
    subtype: string;
    bigtext: string;
    text: string;
    starter: boolean;
    copies: number;
    category?: string;
    flavor?: string;
    marketing?: string;
    success?: string;
    fail?: string;
    cost?: string;
    auction?: string;
    pillarIndex?: number;
    pillarNumeral?: string;
    provides?: any;
    action?: any;
    info?: string;
    href?: string;

    /**
     * Each copy of a card used in the game is given a unique index.
     * 
     * E.g. each Junior Developer will have its own index.
     */
    uniqueIndex?: number;

    constructor() {
    }

    /**
     * Convert the shorthand cost to a map.
     */
    convertCost(): Map<string, number> {
        const m = new Map<string, number>();
        m.set(Card.TALENTS, 0);
        m.set(Card.CREDITS, 0);

        if (!this.cost) return m;

        for (let i = 0; i < this.cost.length; i++) {
            const c = this.cost.charAt(i);
            switch (c) {
                case "T":
                    const curTalents = <number>m.get(Card.TALENTS);
                    m.set(Card.TALENTS, curTalents + 1);
                    break;
                case "$":
                    const curCredits = <number>m.get(Card.CREDITS);
                    m.set(Card.CREDITS, curCredits + 1);
                    break;
            }
        }
        return m;
    }

    /**
     * Returns true if the supplied resources are enough to buy the card.
     */
    canAcquire(credits: number, talents: number): boolean {
        const conv = this.convertCost();

        const t = conv.get(Card.TALENTS);
        const c = conv.get(Card.CREDITS);

        if (t !== undefined && c !== undefined) {
            if (t <= talents &&
                c <= credits) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the image file name for this card.
     */
    getImageName() {
        // let imgName = this.name.replace(/ /g, '').replace(/:/g, '');
        // return `img/${imgName}-800x1060.png`;

        let imgName = '';
        switch (this.type) {
            case 'Resource':
                switch (this.subtype) {
                    case 'Human':
                    case 'Augment Human':
                        imgName = 'Blank-Human-Resource';
                        break;
                    case 'Cloud':
                    case 'Augment Cloud':
                        imgName = 'Blank-Cloud-Resource';
                        break;
                    case 'Bug':
                        imgName = 'Blank-Bug';
                        break;
                    case 'Event':
                        imgName = 'Blank-Event';
                        break;
                    case 'Action':
                        imgName = 'Blank-Action';
                        break;
                }
                break;
            case "Pillar":
                imgName = 'Blank-Pillar-' + this.pillarNumeral;
                break;
            case 'Trial':
                imgName = 'Blank-Trial';
                break;
        }

        return `img/${imgName}-800x1060.png`;
    }
}