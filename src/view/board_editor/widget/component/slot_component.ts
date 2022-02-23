import { Slot } from "../../../../model/slot";
import { get, has, set, setDebounce, setRestrictToTarget } from "../../../../util/helpers";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { DictionaryComponent } from "./dictionary_component";
import { VerbWidget } from "../verb_widget";

export class SlotComponent<T> {
    private _board: Board;
    private _data?: Slot;
    private _parentData?: Slot;
    private _widget: T;
    private _element: HTMLElement;
    private _required: DictionaryComponent;
    private _forbidden: DictionaryComponent;

    public onOpen?: () => void;
    public onClose?: () => void;
    public onChange?: () => void;
    public onRemove?: () => void;

    constructor(board: Board, widget: T, element: HTMLElement) {
        this._board = board;
        this._widget = widget;
        this._element = element;
        if (!this._element) throw new Error("Element needed");
        this._required = new DictionaryComponent(this.board, "required", "elements", this.element.querySelector('*[name="required"]'));
        this._required.onChange = () => {
            this.onUpdate(this._data, this._parentData);
            this?.onChange();
        };
        this._forbidden = new DictionaryComponent(this.board, "forbidden", "elements", this.element.querySelector('*[name="forbidden"]'));
        this._forbidden.onChange = () => {
            this.onUpdate(this._data, this._parentData);
            this?.onChange();
        };

        const closeButton = this.element.querySelector('*[close]') as HTMLElement;
        if (closeButton) closeButton.onclick = setRestrictToTarget(closeButton, () => this.close());

        const deleteButton = this.element.querySelector('*[delete]') as HTMLElement;
        if (deleteButton) deleteButton.onclick = setRestrictToTarget(deleteButton, () => this?.onRemove());

        this.element.onclick = setRestrictToTarget(this.element, () => this.open());

        this.onUpdate = setDebounce(this.onUpdate.bind(this), 5);

        this.element.querySelectorAll('*[name="greedy"]').forEach(element => element.toggleAttribute('hide', this.widget instanceof VerbWidget));

        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => {
            input.onclick = (e) => {
                e.stopPropagation();
            };

            const name = input.getAttribute('name');
            const type = input.getAttribute('type');

            if (type == "checkbox") {
                input.onchange = () => {
                    if (!(name in this.data)) {
                        return;
                    }
                    this.data[name] = input.checked;
                    this?.onChange();
                };
                input.checked = get(this.data, name, get(this.parentData || {}, name, false));
                return;
            }

            input.onkeyup = () => {
                if (!(name in this.data)) {
                    return;
                }
                if (get(this.data, name, "") == input.value) {
                    return;
                }
                this.data[name] = input.value;
                this?.onChange();
            };
        });

    }

    public remove() {
        this._element.remove();
    }

    protected notWhenDragged(fn: (e?: MouseEvent) => void): (e?: MouseEvent) => void {
        return (e?: MouseEvent) => {
            fn = fn.bind(this);
            if ((this.widget as any).isDragging) return;
            e?.stopPropagation();
            return fn(e);
        };
    }

    private get parentData(): Slot {
        return this._parentData;
    }
    private set parentData(value: Slot) {
        this._parentData = value;
    }

    private get widget(): T {
        return this._widget;
    }

    private get board(): Board {
        return this._board;
    }
    private get data(): Slot {
        return this._data;
    }
    private set data(value: Slot) {
        this._data = value;
    }
    private get element(): HTMLElement {
        return this._element;
    }

    public async onUpdate(data: Slot, parentData?: Slot) {
        this.data = data;
        this.parentData = parentData;

        if (this.element.hasAttribute('open')) {
            this.element.setAttribute('title', "");
        } else {
            this.element.setAttribute('title', (this.data?.description) + "\n\nClick to open slot");
        }

        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => {
            const name = input.getAttribute('name');
            if (!(name in this.data)) {
                return;
            }
            const type = input.getAttribute('type');
            if (type == "checkbox") {
                input.checked = get(this.data, name, get(this.parentData || {}, name, false));
                return;
            }
            input.value = get(this.data, name, "");
            input.placeholder = get(this.parentData || {}, name, "");
        });

        try {
            // Required
            await this._required.onUpdate(this.data, this?._parentData);

            // Forbidden
            await this._forbidden.onUpdate(this.data, this?._parentData);
        } catch (e) {
            console.error(e);
            VSCode.emitError(e);
        }
    }

    public open() {
        if (this.element.hasAttribute('open')) return;
        this.toggle();
    }

    public close() {
        if (!this.element.hasAttribute('open')) return;
        this.toggle();
    }

    public toggle() {
        if (this.element.toggleAttribute('open')) {
            if (this.onOpen) this.onOpen();
        } else {
            if (this.onClose) this.onClose();
            this.onUpdate(this.data, this.parentData);
        }
    }
}