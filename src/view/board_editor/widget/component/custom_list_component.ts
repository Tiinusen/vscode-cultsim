import { Entity } from "../../../../model/entity";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { DictionaryComponent } from "./dictionary_component";
import { PickerComponent } from "./picker_component";

export class CustomListComponent {
    private _propertyName: string;
    private _list: HTMLElement;
    private _items: Map<string, HTMLElement> = new Map();
    private _template: HTMLElement;
    private _data: any;
    private _parentData: any;
    private _board: Board;
    private _addButton: HTMLElement;
    private _closeButton: HTMLElement;
    private _deleteButton: HTMLElement;
    private _panelTemplate: HTMLElement;
    private _element: HTMLElement;
    private _panel: HTMLElement;
    private _key: string;
    private _contentType: string;

    public onChange?: () => void;

    constructor(board: Board, propertyName: string, element: HTMLElement) {
        this._propertyName = propertyName;
        this._board = board;
        this._element = element;
        element.toggleAttribute('custom-list', true);
        this._list = element.querySelector('*[items]');
        this._template = element.querySelector('*[items] > *[template]');
        this._template.remove();
        this._addButton = element.querySelector('*[add]');
        this._panelTemplate = element.querySelector('*[panel]');
        this._key = this._panelTemplate.querySelector('*[key]').getAttribute('name');
        this._contentType = this._panelTemplate.querySelector('*[key]').getAttribute('content-type');
        if (!this._key) throw new Error("Panel does not contain a input with key attribute");
        if (!this._contentType) throw new Error("Panel does not contain a input with key and content-type attribute");
        this._panelTemplate.remove();
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

        const list: Array<any> = merged?.[this._propertyName] || [];

        // Remove unremoved items
        for (const [key, element] of this._items) {
            if (list.some(item => item[this._key] == key)) continue;
            this._items.delete(key);
            element.remove();
        }

        // Add / Update items
        for (const item of list) {
            const key = item[this._key];
            if (!this._items.has(key)) {
                const baseElement = this._template.cloneNode(true) as any;
                this._list.append(baseElement);
                this._items.set(key, baseElement);
            }

            const baseElement: HTMLElement = this._items.get(key);
            const elements: HTMLElement[] = [];
            baseElement.querySelectorAll('*[name]').forEach(element => elements.push(element as any));
            for (const element of elements) {
                const name = element.getAttribute('name');
                if (!(name in item)) {
                    element.toggleAttribute('hide', true);
                    continue;
                }
                const value = item[name];
                if (typeof value === 'boolean') {
                    element.toggleAttribute('hide', !value);
                    continue;
                }
                element.toggleAttribute('hide', false);
                switch (element.tagName.toLowerCase()) {
                    case "img": {
                        const contentType = element.getAttribute('content-type');
                        const imageURL: string = await VSCode.request('image', contentType, key);
                        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
                        element.onerror = () => (element as any).src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
                        element.setAttribute('src', imageURL);
                        continue;
                    }
                    default: {
                        const prefix = element.getAttribute('prefix') || "";
                        const suffix = element.getAttribute('suffix') || "";
                        element.innerText = prefix + value + suffix;
                    }
                }
            }

            // Edit button (per row)
            baseElement.onclick = () => this.onEdit(key);
        }

        // Add button
        this._addButton.onclick = () => this.onAdd();
    }

    private async onClose() {
        this._panel.toggleAttribute('open', false);
        this.onUpdate(this._data, this._parentData);
    }

    private async onAdd() {
        try {
            const [id] = await this._board.pickElementOverlay.pick(this._contentType, true);
            const obj = {};
            obj[this._key] = id;
            if (!this._data?.[`${this._propertyName}`]) this._data[`${this._propertyName}`] = new Array<any>();
            this._data[`${this._propertyName}`].push(obj);
            if (this.onChange) this.onChange();
            this.onEdit(id);
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    protected async onEdit(id: string) {
        const data: Array<any> = this._data?.[`${this._propertyName}`];
        const item = data.find(item => item[this._key] == id);
        if (!item) return;
        if (this._panel) this._panel.remove();
        this._panel = this._panelTemplate.cloneNode(true) as any;
        this._element.prepend(this._panel);
        this._closeButton = this._panel.querySelector('*[close]');
        this._deleteButton = this._panel.querySelector('*[delete]');
        this._panel.toggleAttribute('open', true);
        const elements: HTMLElement[] = [];
        this._panel.querySelectorAll('*[name]').forEach(element => elements.push(element as any));
        for (const element of elements) {
            let name = element.getAttribute('name');
            const nameParts = name.split('.');
            let cursor = item;
            while (nameParts.length > 1) {
                const parent = nameParts.shift();
                name = nameParts[0];
                if (!(parent in cursor)) {
                    cursor[parent] = {};
                }
                cursor = cursor[parent];
            }
            const component = element.getAttribute('component');
            const contentType = element.getAttribute('content-type');
            if (!(name in cursor) && component) {
                switch (component) {
                    case "dictionary":
                        cursor[name] = {};
                        break;
                    case "list":
                        cursor[name] = [];
                        break;
                }
                this._board.save();
            }
            const value = cursor?.[name];
            if (component) {
                switch (component) {
                    case "picker": {
                        const picker = new PickerComponent(this._board, name, contentType, element);
                        picker.onChange = () => {
                            picker.onUpdate(cursor);
                            this._board.save();
                        };
                        picker.onUpdate(cursor);
                        continue;
                    }
                    case "dictionary": {
                        const dictionary = new DictionaryComponent(this._board, name, contentType, element);
                        dictionary.onChange = () => {
                            dictionary.onUpdate(cursor);
                            this._board.save();
                        };
                        dictionary.onUpdate(cursor);
                        continue;
                    }
                }
            } else {
                switch (element.tagName.toLowerCase()) {
                    case "input": {
                        const inputType = element.getAttribute('type');
                        switch (inputType) {
                            case "checkbox": {
                                element.toggleAttribute('checked', value === true);
                                element.onchange = () => {
                                    cursor[name] = (element as HTMLInputElement).checked;
                                    this._board.save();
                                };
                                continue;
                            }
                            case "number": {
                                if (value) {
                                    (element as HTMLInputElement).value = value;
                                }
                                element.onkeyup = () => {
                                    const value = parseInt((element as HTMLInputElement).value);
                                    if (isNaN(value)) {
                                        cursor[name] = void 0;
                                    } else {
                                        cursor[name] = value;
                                    }
                                    this._board.save();
                                };
                                continue;
                            }
                            default:
                                (element as HTMLInputElement).value = value;
                                element.onkeyup = () => {
                                    cursor[name] = (element as HTMLInputElement).value;
                                    this._board.save();
                                };
                                continue;
                        }
                    }
                    default: {
                        const prefix = element.getAttribute('prefix') || "";
                        const suffix = element.getAttribute('suffix') || "";
                        element.innerText = prefix + value + suffix;
                        continue;
                    }
                }
            }
        }

        // Delete button
        this._deleteButton.onclick = () => this.onRemove(id);

        // Close button
        this._closeButton.onclick = () => this.onClose();
    }

    protected async onRemove(id: string) {
        this.onClose();
        let list: Array<any> = this._data.get(this._propertyName);
        list = list.filter(item => item[this._key] != id);
        this._data.set(this._propertyName, list.length == 0 ? void 0 : list);
        await this.onUpdate(this._data, this?._parentData);
        if (this.onChange) this.onChange();
    }
}