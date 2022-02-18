import { Slot } from "../../../../model/slot";
import { get, has, set, setDebounce } from "../../../../util/helpers";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { DictionaryComponent } from "./dictionary_component";
import { VerbWidget } from "../verb_widget";

export class SlotComponent<T> {
    private _board: Board;
    private _data: Slot;
    private _parentData: Slot;
    private _parentWidget: T;
    private _element: HTMLElement;
    private _required: DictionaryComponent;
    private _forbidden: DictionaryComponent;

    public onOpen?: () => void;
    public onClose?: () => void;

    constructor(board: Board, data: Slot, parentWidget: T, element: HTMLElement) {
        this._board = board;
        this._data = data;
        this._parentWidget = parentWidget;
        this._element = element;
        this._required = new DictionaryComponent(this.board, "required", "elements", this.element.querySelector('td[name="required"]'));
        this._required.onChange = () => {
            this.board.save();
            this.onUpdate();
        };
        this._forbidden = new DictionaryComponent(this.board, "forbidden", "elements", this.element.querySelector('td[name="forbidden"]'));
        this._forbidden.onChange = () => {
            this.board.save();
            this.onUpdate();
        };
        this.onUpdate = setDebounce(this.onUpdate.bind(this), 5);
    }

    protected notWhenDragged(fn: (e?: MouseEvent) => void): (e?: MouseEvent) => void {
        return (e?: MouseEvent) => {
            fn = fn.bind(this);
            if ((this.parentWidget as any).isDragging) return;
            e?.stopPropagation();
            return fn(e);
        };
    }

    public get parentData(): Slot {
        return this._parentData;
    }
    public set parentData(value: Slot) {
        this._parentData = value;
    }

    public get parentWidget(): T {
        return this._parentWidget;
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

    public async onUpdate() {
        const closeButton = this.element.querySelector('i[close]') as HTMLElement;
        closeButton.onclick = setDebounce(() => this.close(), 10);
        if (this.element.hasAttribute('open')) {
            this.element.setAttribute('title', "");
        } else {
            this.element.setAttribute('title', (this.data?.description) + "\n\nClick to open slot");
        }
        this._element.querySelectorAll('input[name="greedy"],label[name="greedy"]').forEach(element => element.toggleAttribute('hide', this.parentWidget instanceof VerbWidget));
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => {
            input.onclick = (e) => {
                e.stopPropagation();
            };
            const name = input.getAttribute('name');
            if (!(name in this.data)) {
                return;
            }
            const type = input.getAttribute('type');
            if (type == "checkbox") {
                input.onchange = () => {
                    set(this.data, name, input.checked);
                    this.board.save();
                };
                input.checked = get(this.data, name, get(this.parentData || {}, name, false));
                return;
            }

            input.value = get(this.data, name, "");
            input.placeholder = get(this.parentData || {}, name, "");
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
            (this.parentWidget as any).element.querySelectorAll('.slot[open]').forEach(element => {
                alreadyOpen = true;
            });
            if (alreadyOpen) {
                return;
            }
            this.toggle();
        };

        // Merged
        const merged = new Slot();
        try {
            // Required
            await this._required.onUpdate(this._data, this?._parentData);

            // Forbidden
            await this._forbidden.onUpdate(this._data, this?._parentData);
            // merged.merge("required", this._parentData?.clone()).merge("required", this._data?.clone());
            // merged.merge("forbidden", this._parentData?.clone()).merge("forbidden", this._data?.clone());
        } catch (e) {
            console.error(e);
            VSCode.emitError(e);
        }
    }

    public open() {
        if (this.element.hasAttribute('open')) return;
        this.toggle();
        this.onUpdate();
    }

    public close() {
        if (!this.element.hasAttribute('open')) return;
        this.toggle();
        this.onUpdate();
    }

    public toggle() {
        if (this.element.toggleAttribute('open')) {
            if (this.onOpen) this.onOpen();
        } else {
            if (this.onClose) this.onClose();
        }
        this.onUpdate();
    }
}