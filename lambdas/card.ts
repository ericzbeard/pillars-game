/**
 * A Pillars Card.
 */
export class Card {

    static readonly TALENTS = "Talents";
    static readonly CREDITS = "Credits";

    name: string;
    type: string;
    subtype: string;
    bigtext?: string;
    text?: string;
    starter: boolean;
    copies: number;
    category?: string;
    flavor?: string;
    marketing?: string;
    success?: Array<string>;
    fail?: Array<string>;
    cost?: string;
    auction?: string;
    pillarIndex?: number;
    pillarNumeral?: string;
    provides?: any;
    action?: any;
    info?: string;
    href?: string;
    retired: boolean;
    conditionalAction?: any;
    hideType?: boolean;
    trial: number;

    /**
     * Each copy of a card used in the game is given a unique index.
     * 
     * E.g. each Junior Developer will have its own index.
     */
    uniqueIndex?: number;

    constructor() {
        this.retired = false;
    }

    /**
     * Convert the shorthand cost to a map.
     */
    convertCost(): CardCost {
        const cc = new CardCost();

        if (!this.cost) return cc;

        for (let i = 0; i < this.cost.length; i++) {
            const c = this.cost.charAt(i);
            switch (c) {
                case "T":
                    cc.talents++;
                    break;
                case "$":
                    cc.credits++;
                    break;
            }
        }

        return cc;
    }

    /**
     * Returns true if the supplied resources are enough to buy the card.
     */
    canAcquire(credits: number, talents: number): boolean {
        const conv = this.convertCost();

        if (conv.talents <= talents &&
            conv.credits <= credits) {
            return true;
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

    /**
     * Get the total length of the resources this card provides.
     */
    getProvidesLength():number {
        if (!this.provides) {
            return 0;
        }

        let n = 0;
        if (this.provides.Talent) {
            n += this.provides.Talent;
        }
        if (this.provides.Credit) {
            n += this.provides.Credit;
        }
        if (this.provides.Creativity) {
            n += this.provides.Creativity;
        }
        if (this.provides.Customer) {
            n += this.provides.Customer;
        }

        return n;
    }
}

/**
 * The cost of a card.
 */
export class CardCost {
    talents: number;
    credits: number;

    constructor() {
        this.talents = 0;
        this.credits = 0;
    }
}