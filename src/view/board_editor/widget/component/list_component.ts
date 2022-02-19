import { Entity } from "../../../../model/entity";
import { Board } from "../../board";
import { VSCode } from "../../vscode";

export class ListComponent {
    private _contentType: string;
    private _propertyName: string;
    private _list: HTMLElement;
    private _items: Map<string, HTMLElement> = new Map();
    private _template: HTMLElement;
    private _data: any;
    private _parentData: any;
    private _board: Board;
    private _addButton: HTMLElement;

    public onChange?: () => void;

    constructor(board: Board, propertyName: string, contentType: string, element: HTMLElement) {
        this._contentType = contentType;
        this._propertyName = propertyName;
        this._board = board;
        element.toggleAttribute('list', true);
        this._list = element.querySelector('*[items]');
        this._template = element.querySelector('*[items] > *[template]');
        this._template.remove();
        this._addButton = element.querySelector('*[add]');
    }

    public async onUpdate(data: Entity<any>, parentData?: Entity<any>) {
        this._data = data;
        this._parentData = parentData;
        let merged: Entity<any> = null;
        if (!parentData) {
            merged = data.clone();
        } else {
            merged = parentData.clone().merge(this._propertyName, data.clone());
        }

        const list: Array<string> = merged?.[this._propertyName] || [];

        // Remove unremoved items
        for (const [key, element] of this._items) {
            if (list.some(item => item == key)) continue;
            this._items.delete(key);
            element.remove();
        }

        // Add / Update items
        for (const key of list) {
            if (!this._items.has(key)) {
                const element: HTMLElement = this._template.cloneNode(true) as any;
                const imageURL = await VSCode.request('image', this._contentType, key);
                const img = element.querySelector('img');
                img.onerror = () => img.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
                img.setAttribute('src', imageURL + "?" + (Math.random() * 100));
                this._list.append(element);
                this._items.set(key, element);
            }
            const element = this._items.get(key);
            const label = element.querySelector('label');
            label.innerText = `${key}`;
            label.title = label.innerText + "\n\nClick to remove";
            element.onclick = () => this.onRemove(key, element);
        }

        // Add button
        this._addButton.onclick = () => this.onAdd();
    }

    private async onAdd() {
        try {
            const [id] = await this._board.pickElementOverlay.pick(this._contentType, true);
            if (this._parentData?.[`${this._propertyName}`] && !this._data?.[`${this._propertyName}`]) {
                if (this._data?.[`${this._propertyName}$remove`] && this._data[`${this._propertyName}$remove`].indexOf(id) !== -1) {
                    this._data[`${this._propertyName}$remove`] = this._data[`${this._propertyName}$remove`].filter((sid) => sid != id);
                    if (this._data[`${this._propertyName}$remove`].length == 0) this._data[`${this._propertyName}$remove`] = void 0;
                } else {
                    if (!this._data?.[`${this._propertyName}$append`]) this._data[`${this._propertyName}$append`] = new Array<string>();
                    this._data[`${this._propertyName}$append`].push(id);
                }
            } else {
                if (!this._data?.[`${this._propertyName}`]) this._data[`${this._propertyName}`] = new Array<string>();
                this._data[`${this._propertyName}`].push(id);
            }
            if (this.onChange) this.onChange();
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    protected onRemove(id: string, element: HTMLElement) {
        element.remove();
        if (!this._data[this._propertyName] && this._parentData[this._propertyName]) {
            if (this._data.get(`${this._propertyName}$append`) && this._data.get(`${this._propertyName}$append`).some(item => item == id)) {
                let list: Array<string> = this._data.get(`${this._propertyName}$append`);
                list = list.filter(item => item != id);
                this._data.set(`${this._propertyName}$append`, list);
                if (list.length == 0) {
                    this._data.set(`${this._propertyName}$append`, void 0);
                }
            } else if (this._data.get(`${this._propertyName}$prepend`) && this._data.get(`${this._propertyName}$prepend`).some(item => item == id)) {
                let list: Array<string> = this._data.get(`${this._propertyName}$prepend`);
                list = list.filter(item => item != id);
                this._data.set(`${this._propertyName}$prepend`, list);
                if (list.length == 0) {
                    this._data.set(`${this._propertyName}$prepend`, void 0);
                }
            } else {
                if (!this._data.get(`${this._propertyName}$remove`)) {
                    this._data.set(`${this._propertyName}$remove`, new Array<string>());
                }
                this._data.get(`${this._propertyName}$remove`).push(id);
            }
        } else {
            let list: Array<string> = this._data.get(this._propertyName);
            list = list.filter(item => item != id);
            this._data.set(this._propertyName, list.length == 0 ? void 0 : list);
        }
        if (this.onChange) this.onChange();
    }
}