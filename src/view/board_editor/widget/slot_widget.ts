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
        this.onUpdate = setDebounce(this.onUpdate.bind(this), 5);
    }

    private async onRequiredAdd() {
        try {
            const [id, level] = await this.board.pickElementOverlay.pick("elements");

            if (this._parentData?.required && !this.data?.required) {
                if (this.data?.required$remove && this.data.required$remove.indexOf(id) !== -1) {
                    this.data.required$remove = this.data.required$remove.filter((sid) => sid != id);
                    if (this.data.required$remove.length == 0) this.data.required$remove = void 0;
                } else {
                    if (!this.data?.required$add) this.data.required$add = new Map();
                    this.data.required$add[id] = level || 0;
                }
            } else {
                if (!this.data?.required) this.data.required = new Map();
                this.data.required[id] = level || 0;
            }
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

            if (this._parentData?.forbidden && !this.data?.forbidden) {
                if (this.data?.forbidden$remove && this.data.forbidden$remove.indexOf(id) !== -1) {
                    this.data.forbidden$remove = this.data.forbidden$remove.filter((sid) => sid != id);
                    if (this.data.forbidden$remove.length == 0) this.data.forbidden$remove = void 0;
                } else {
                    if (!this.data?.forbidden$add) this.data.forbidden$add = new Map();
                    this.data.forbidden$add[id] = level || 0;
                }
            } else {
                if (!this.data?.forbidden) this.data.forbidden = new Map();
                this.data.forbidden[id] = level || 0;
            }
            this.board.save();
            this.onUpdate();
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    protected onRemoveElement(propertyName: string, id: string) {
        if (!this._data[propertyName] && this._parentData[propertyName]) {
            if (this._data.get(`${propertyName}$add`) && id in this._data.get(`${propertyName}$add`)) {
                delete this._data.get(`${propertyName}$add`)[id];
                if (Object.keys(this._data.get(`${propertyName}$add`) || {}).length == 0) {
                    this._data.set(`${propertyName}$add`, void 0);
                }
            } else {
                if (!this._data.get(`${propertyName}$remove`)) {
                    this._data.set(`${propertyName}$remove`, new Array<string>());
                }
                this._data.get(`${propertyName}$remove`).push(id);
            }
        } else {
            delete this._data.get(propertyName)[id];
        }
        this.onUpdate();
        this.board.save();
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
            merged.merge("required", this._parentData?.clone()).merge("required", this._data?.clone());
            merged.merge("forbidden", this._parentData?.clone()).merge("forbidden", this._data?.clone());
        } catch (e) {
            console.error(e);
            VSCode.emitError(e);
        }

        // Required
        this._requiredTD.querySelectorAll('div').forEach(element => element.remove());
        for (const key in merged?.required || {}) {
            const level: number = merged.required[key];
            const element: HTMLElement = this._requiredTemplate.cloneNode(true) as any;
            element.toggleAttribute('item', true);
            const imageURL = await VSCode.request('image', 'elements', key);
            const img = element.querySelector('img');
            img.onerror = () => img.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
            img.setAttribute('src', imageURL + "?" + (Math.random() * 100));
            const label = element.querySelector('label');
            label.innerText = `${key} (${level})`;
            label.title = label.innerText + "\n\nClick to remove";
            this._requiredTD.append(element);
            element.onclick = () => this.onRemoveElement("required", key);
        }
        this._requiredTD.append(this._requiredAdd);

        // Forbidden
        this._forbiddenTD.querySelectorAll('div').forEach(element => element.remove());
        for (const key in merged?.forbidden || {}) {
            const level: number = merged.forbidden[key];
            const element: HTMLElement = this._requiredTemplate.cloneNode(true) as any;
            element.toggleAttribute('item', true);
            const imageURL = await VSCode.request('image', 'elements', key);
            const img = element.querySelector('img');
            img.onerror = () => img.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
            img.setAttribute('src', imageURL + "?" + (Math.random() * 100));
            const label = element.querySelector('label');
            label.innerText = `${key} (${level})`;
            label.title = label.innerText + "\n\nClick to remove";
            this._forbiddenTD.append(element);
            element.onclick = () => this.onRemoveElement("forbidden", key);
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