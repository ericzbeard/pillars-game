
/**
 * An area that can be interacted with by the mouse.
 */
export class Mouseable {
    x: number;
    y: number;
    w: number;
    h: number;
    zindex: number;
    onclick: Function;
    onanykey: Function;
    onhover: Function;
    onmousedown: Function;
    onmouseup: Function;
    onmouseover: Function;
    onmouseout: Function;
    ondragenter: Function;
    ondragexit: Function;
    render: Function;
    hovering: boolean;
    key: string;
    draggable: boolean;
    droppable: boolean;
    dragging: boolean;
    dragoffx: number;
    draggoffy: number;
    origx: number;
    origy: number;
    data: any;

    hitx?: number;
    hity?: number;
    hitw?: number;
    hith?: number;

    down: boolean;
    downx: number;
    downy: number;

    constructor() {
        this.zindex = 0;
        this.down = false;
        this.downx = -1;
        this.downy = -1;
    }

    /**
     * Check to see if they coordinates overlap.
     */
    hitTest(mx: number, my: number): boolean {
        let hx = this.hitx ?? this.x;
        let hy = this.hity ?? this.y;
        let hw = this.hitw ?? this.w;
        let hh = this.hith ?? this.h;

        const hit =
            mx >= hx &&
            mx <= hx + hw &&
            my >= hy &&
            my <= hy + hh;

        return hit;
    }
}
