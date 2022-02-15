import { Board } from "../board";


export abstract class BoardOverlay {
    private _board: Board;
    private _wrapper: HTMLElement;
    private _element: HTMLElement;
    private _removeOnHide: boolean;

    protected onInit?(): void;
    protected onClickOutside?(): void;

    constructor(html: string, board: Board, attachTo?: HTMLElement) {
        this._board = board;
        this._removeOnHide = attachTo ? true : false;
        this._wrapper = document.createElement('div');
        this._wrapper.classList.add('board-overlay');
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._wrapper.append(this._element);
        if (!attachTo) {
            attachTo = document.body;
        }
        attachTo.prepend(this._wrapper);
        this._element.parentElement.setAttribute('hide', '');
        this._wrapper.onclick = (ev) => {
            if (ev.target != this._wrapper) return;
            this.onClickOutside();
        };
        this?.onInit();
    }

    protected get isRemovedOnHide(): boolean {
        return this._removeOnHide;
    }

    protected get element(): HTMLElement {
        return this._element;
    }

    protected get wrapper(): HTMLElement {
        return this._wrapper;
    }

    protected get board(): Board {
        return this._board;
    }

    protected get visible(): boolean {
        return !this._wrapper.hasAttribute('hide');
    }

    protected hide() {
        if (this.isRemovedOnHide) return this._wrapper.remove();
        this._wrapper.setAttribute('hide', '');
    }

    protected show() {
        this._wrapper.removeAttribute('hide');
    }
}