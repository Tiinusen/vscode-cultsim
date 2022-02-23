import { Slot } from "../../../../model/slot";
import { get, has, set, setDebounce, setRestrictToTarget } from "../../../../util/helpers";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { DictionaryComponent } from "./dictionary_component";
import { VerbWidget } from "../verb_widget";

export class XTriggerComponent<T> {
    private _board: Board;
    private _data?: Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }>;
    private _parentData?: Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }>;
    private _widget: T;
    private _template: HTMLElement;
    private _element: HTMLElement;
    private _labelSource: HTMLLabelElement;
    private _iconSource: HTMLImageElement;
    private _labelTarget: HTMLLabelElement;
    private _iconTarget: HTMLImageElement;
    private _closeButton: HTMLElement;
    private _deleteButton: HTMLElement;
    private _list: HTMLElement;
    private _key: string;

    public onOpen?: () => void;
    public onClose?: () => void;
    public onChange?: () => void;
    public onRemove?: () => void;

    constructor(board: Board, widget: T, element: HTMLElement, key: string) {
        this._board = board;
        this._widget = widget;
        this._element = element;
        this._key = key;
        if (!this._element) throw new Error("Element needed");

        this._list = element.querySelector('*[xtrigger-items]');

        this._template = element.querySelector('*[xtrigger-items] > *[template]');
        this._template.toggleAttribute('template', false);
        this._template.remove();

        this._labelSource = this.element.querySelector('label[source]');

        this._iconSource = this.element.querySelector('img[source]');
        this._iconSource.onerror = () => this._iconSource.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';

        this._labelTarget = this.element.querySelector('label[target]');

        this._iconTarget = this.element.querySelector('img[target]');
        this._iconTarget.onerror = () => this._iconTarget.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';

        this.element.onclick = () => this.open();

        this._closeButton = this.element.querySelector('*[close]');
        this._closeButton.onclick = setRestrictToTarget(this._closeButton, () => this.close());

        this._deleteButton = this.element.querySelector('*[delete]');
        this._deleteButton.onclick = setRestrictToTarget(this._deleteButton, () => this.remove());

        this._deleteButton = this.element.querySelector('*[add]');
        this._deleteButton.onclick = setRestrictToTarget(this._deleteButton, () => this.onAdd());
    }

    private async onAdd() {
        const [id] = await this.board.pickElementOverlay.pick("elements", true);
        if (!Array.isArray(this._data[this._key])) {
            this._data[this._key] = [];
        }
        this._data[this._key].push(
            {
                id: id,
                morpheffect: "transform"
            }
        );
        this?.onChange();
    }

    public remove() {
        this._element.remove();
        this?.onRemove();
    }

    protected notWhenDragged(fn: (e?: MouseEvent) => void): (e?: MouseEvent) => void {
        return (e?: MouseEvent) => {
            fn = fn.bind(this);
            if ((this.widget as any).isDragging) return;
            e?.stopPropagation();
            return fn(e);
        };
    }

    private get parentData(): Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }> {
        return this._parentData;
    }
    private set parentData(value: Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }>) {
        this._parentData = value;
    }

    private get widget(): T {
        return this._widget;
    }

    private get board(): Board {
        return this._board;
    }

    private get data(): Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }> {
        return this._data;
    }
    private set data(value: Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }>) {
        this._data = value;
    }
    private get element(): HTMLElement {
        return this._element;
    }

    public async onUpdate(data: Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }>, parentData?: Map<string, string | { id: string, morpheffect?: "spawn" | "mutate" | "transform", level: number }>) {
        this.data = data;
        this.parentData = parentData;

        this._labelSource.innerText = this._key;
        const imageURL: string = await VSCode.request('image', 'elements', this._key);
        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
        this._iconSource.setAttribute('src', imageURL);

        if (typeof data?.[this._key] === 'string') {
            if (data?.[this._key].length > 0) {
                this.data[this._key] = [
                    {
                        id: data[this._key],
                        morpheffect: "transform"
                    }
                ];
            }
        }

        try {
            if (data?.[this._key]?.length) {
                if (data[this._key].length == 1) {
                    const firstItem = data[this._key][0];
                    this._labelTarget.innerText = firstItem.id;
                    const imageURL: string = await VSCode.request('image', 'elements', firstItem.id);
                    if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
                    this._iconTarget.setAttribute('src', imageURL);
                } else {
                    const firstItem = data[this._key][0];
                    this._labelTarget.innerText = `${data[this._key].length} x Effect(s)`;
                    const imageURL: string = await VSCode.request('image', 'elements', firstItem.id);
                    if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
                    this._iconTarget.setAttribute('src', imageURL);
                }
                if (!this.element.hasAttribute('open')) return;
                this._list.innerHTML = "";
                for (const item of data[this._key]) {
                    const element = this._template.cloneNode(true) as HTMLElement;
                    const img: HTMLImageElement = element.querySelector('img');
                    const label: HTMLElement = element.querySelector('label[name="id"]');
                    element.querySelectorAll('input[name]').forEach((input: HTMLInputElement) => {
                        const name = input.getAttribute('name');
                        const type = input.getAttribute('type') || "text";
                        input.onclick = (e) => {
                            e.stopPropagation();
                        };
                        input.onchange = () => {
                            item[name] = parseInt(input.value) || void 0;
                            this?.onChange();
                        };
                        input.value = item?.[name] || "";
                    });
                    const select: HTMLSelectElement = element.querySelector('select');
                    select.onclick = (e) => {
                        e.stopPropagation();
                    };
                    select.onchange = () => {
                        item["morpheffect"] = select.value;
                        this?.onChange();
                    };
                    select.value = item?.["morpheffect"] || "";
                    label.innerText = item.id;
                    label.setAttribute('title', item.id);

                    const imageURL: string = await VSCode.request('image', 'elements', item.id);
                    if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
                    img.setAttribute('src', imageURL);

                    const deleteButton: HTMLElement = element.querySelector('*[delete]');
                    deleteButton.onclick = () => {
                        element.remove();
                        data[this._key] = data[this._key].filter((itemB) => itemB != item);
                        this?.onChange();
                    };

                    this._list.append(element);
                }
            }
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
        if (!this._data?.[this._key].length) {
            this.onRemove();
        }else{
            this.toggle();
        }
    }

    public toggle() {
        if (this.element.toggleAttribute('open')) {
            if (this.onOpen) this.onOpen();
            this.onUpdate(this.data, this.parentData);
        } else {
            if (this.onClose) this.onClose();
            this.onUpdate(this.data, this.parentData);
        }
    }
}