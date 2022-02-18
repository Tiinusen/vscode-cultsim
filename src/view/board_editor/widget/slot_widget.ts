import { Slot } from "../../../model/slot";
import { get, has, set, setDebounce } from "../../../util/helpers";
import { Board } from "../board";
import { VSCode } from "../vscode";
import { VerbWidget } from "./verb_widget";
import { Widget } from "./widget";

export class SlotWidget<T> {
    private _board: Board;
    private _data: Slot;
    private _parentData: Slot;
    private _parentWidget: T;
    private _element: HTMLElement;
    private _requiredTemplate: HTMLElement;
    private _forbiddenTemplate: HTMLElement;
    private _requiredTD: HTMLElement;
    private _forbiddenTD: HTMLElement;
    private _requiredAdd: HTMLElement;
    private _forbiddenAdd: HTMLElement;

    public onOpen?: () => void;
    public onClose?: () => void;

    constructor(board: Board, data: Slot, parentWidget: T, element: HTMLElement) {
        this._board = board;
        this._data = data;
        this._parentWidget = parentWidget;
        this._element = element;
        this._requiredTD = this._element.querySelector('td[name="required"]');
        this._forbiddenTD = this._element.querySelector('td[name="forbidden"]');
        this._requiredTemplate = this._requiredTD.querySelector('div[template]');
        this._forbiddenTemplate = this._forbiddenTD.querySelector('div[template]');
        this._requiredTemplate.removeAttribute('template');
        this._forbiddenTemplate.removeAttribute('template');
        this._requiredTemplate.toggleAttribute('item', true);
        this._forbiddenTemplate.toggleAttribute('item', true);
        this._requiredTemplate.remove();
        this._forbiddenTemplate.remove();
        this._requiredAdd = this._requiredTD.querySelector('div[add]');
        this._requiredAdd.onclick = this.notWhenDragged(this.onRequiredAdd);
        this._forbiddenAdd = this._forbiddenTD.querySelector('div[add]');
        this._forbiddenAdd.onclick = this.notWhenDragged(this.onForbiddenAdd);
        this.onUpdate = setDebounce(this.onUpdate.bind(this), 50);
    }

    private async onRequiredAdd() {
        try {
            const [id, level] = await this.board.pickElementOverlay.pick("elements");
            if (!this.data.required) this.data.required = new Map();
            this.data.required[id] = level || 0;
            this.board.save();
            this.onUpdate();
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    private async onForbiddenAdd() {
        try {
            const [id, level] = await this.board.pickElementOverlay.pick("elements");
            if (!this.data.forbidden) this.data.forbidden = new Map();
            this.data.forbidden[id] = level || 0;
            this.board.save();
            this.onUpdate();
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
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

        // Required
        this._requiredTD.querySelectorAll('div').forEach(element => element.remove());
        for (const key in this.data?.required || {}) {
            const level: number = this.data.required[key];
            const element: HTMLElement = this._requiredTemplate.cloneNode(true) as any;
            element.toggleAttribute('item', true);
            const imageURL = await VSCode.request('image', 'elements', key);
            const img = element.querySelector('img');
            img.onerror = () => img.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
            img.setAttribute('src', imageURL + "?" + (Math.random() * 100));
            element.querySelector('label').innerText = `${key} (${level})`;
            this._requiredTD.append(element);
            this._requiredTD.onclick = () => {
                delete this.data.required[key];
                this.onUpdate();
                this.board.save();
            };
        }
        this._requiredTD.append(this._requiredAdd);

        // Forbidden
        this._forbiddenTD.querySelectorAll('div').forEach(element => element.remove());
        for (const key in this.data?.forbidden || {}) {
            const level: number = this.data.forbidden[key];
            const element: HTMLElement = this._requiredTemplate.cloneNode(true) as any;
            element.toggleAttribute('item', true);
            const imageURL = await VSCode.request('image', 'elements', key);
            const img = element.querySelector('img');
            img.onerror = () => img.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
            img.setAttribute('src', imageURL + "?" + (Math.random() * 100));
            element.querySelector('label').innerText = `${key} (${level})`;
            this._forbiddenTD.append(element);
            this._forbiddenTD.onclick = () => {
                delete this.data.forbidden[key];
                this.onUpdate();
                this.board.save();
            };
        }
        this._forbiddenTD.append(this._forbiddenAdd);
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