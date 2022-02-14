import { Board } from "../board";


export abstract class BoardOverlay {
    private _board: Board;
    private _element: HTMLElement;

    onInit?(): void;

    constructor(html: string, board: Board) {
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._element = this._element.firstElementChild as HTMLElement;
        this?.onInit();
    }

    public get element(): HTMLElement {
        return this._element;
    }

    public get board(): Board {
        return this._board;
    }

    public get visible(): boolean {
        return !this._element.hasAttribute('hide');
    }

    public hide() {
        if (this._element) {
            this._element.setAttribute('hide', '');
        }
    }

    public show() {
        if (this._element) {
            this._element.removeAttribute('hide');
        }
    }
}