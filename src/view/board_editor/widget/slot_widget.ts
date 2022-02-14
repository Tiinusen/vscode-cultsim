import { Slot } from "../../../model/slot";
import { get, has, set } from "../../../util/helpers";
import { Board } from "../board";
import { VSCode } from "../vscode";
import { Widget } from "./widget";

export class SlotWidget<T> {
    private _board: Board;
    private _data: Slot;
    private _parent: T;
    private _element: HTMLElement;

    constructor(board: Board, data: Slot, parent: T, element: HTMLElement) {
        this._board = board;
        this._data = data;
        this._parent = parent;
        this._element = element;
    }

    public get parent(): T {
        return this._parent;
    }

    public get board(): Board {
        return this._board;
    }
    public get data(): Slot {
        return this._data;
    }
    public set data(value: Slot) {
        this._data = value;
    }
    public get element(): HTMLElement {
        return this._element;
    }

    public onUpdate() {
        this.element.setAttribute('title', (this.data?.description) + "\n\nClick to open slot");
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => {
            input.onclick = (e) => {
                e.stopPropagation();
            };
            const name = input.getAttribute('name');
            if (!(name in this.data)) {
                return;
            }
            input.value = get(this.data, name, "");
            input.onkeyup = () => {
                if (get(this.data, name, "") == input.value) {
                    return;
                }
                set(this.data, name, input.value);
                this.board.save();
            };
        });
        this.element.onclick = () => {
            let alreadyOpen = false;
            (this.parent as any).element.querySelectorAll('.slot[open]').forEach(element => {
                alreadyOpen = true;
            });
            if (alreadyOpen) {
                return;
            }
            this.element.toggleAttribute('open');
            setTimeout(() => {
                this.element.toggleAttribute('open');
            }, 2000);
        };
    }
}