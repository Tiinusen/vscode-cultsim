import { Entity } from "../../../../model/entity";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { XTriggerComponent } from "./xtrigger_component";

export class XTriggersComponent<T> {
    private _propertyName: string;
    private _list: HTMLElement;
    private _items: Map<string, XTriggerComponent<T>> = new Map();
    private _template: HTMLElement;
    private _data: any;
    private _parentData: any;
    private _board: Board;
    private _addButton: HTMLElement;
    private _widget: T;

    public onChange?: () => void;
    public onOpen?(xtriggerKey: string);
    public onClose?();

    constructor(board: Board, propertyName: string, widget: T, element: HTMLElement) {
        this._propertyName = propertyName;
        this._board = board;
        this._widget = widget;
        element.toggleAttribute('xtriggers', true);
        this._list = element.querySelector('*[items]');
        this._template = element.querySelector('*[items] > *[template]');
        this._template.remove();
        this._addButton = element.querySelector('*[add]');
    }

    public async onUpdate(data: Entity<any>, parentData?: Entity<any>) {
        this._data = data;
        this._parentData = parentData;
        // let merged: Entity<any> = null;
        // if (!parentData) {
        //     merged = data.clone();
        // } else {
        //     merged = parentData.clone().merge(this._propertyName, data.clone());
        // }

        const map = this._data?.[this._propertyName] || {};

        // Remove unremoved items
        for (const [key, element] of this._items) {
            if (key in map) continue;
            this._items.delete(key);
            element.remove();
        }

        // Add / Update items
        for (const key in map) {
            if (!this._items.has(key)) {
                const element: HTMLElement = this._template.cloneNode(true) as any;
                const xtriggerComp = new XTriggerComponent<T>(this._board, this._widget, element, key);
                xtriggerComp.onOpen = () => this?.onOpen(key);
                xtriggerComp.onClose = () => this?.onClose();
                xtriggerComp.onChange = () => this?.onChange();
                xtriggerComp.onRemove = () => this.onRemove(key, element);
                this._list.append(element);
                this._items.set(key, xtriggerComp);
            }
            await this._items.get(key).onUpdate(map, parentData as any);
        }

        // Add button
        this._addButton.onclick = () => this.onAdd();
    }

    private async onAdd() {
        try {
            const [id] = await this._board.pickElementOverlay.pick('elements', true);

            if (!this._data?.[`${this._propertyName}`]) this._data[`${this._propertyName}`] = new Map();
            this._data[`${this._propertyName}`][id] = "";
            this.onOpen(id);
            if (this.onChange) this.onChange();

        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    protected onRemove(id: string, element: HTMLElement) {
        if(this._data.get(this._propertyName) == void 0) return;
        delete this._data.get(this._propertyName)[id];
        if (Object.keys(this._data.get(this._propertyName)).length == 0) {
            this._data.set(this._propertyName, void 0);
        }

        if (this.onChange) this.onChange();
    }

    public get size(): number {
        return this._items.size;
    }

    public open(xtriggerKey: string) {
        for (const [key, comp] of this._items) {
            if (key == xtriggerKey) {
                comp.open();
            } else {
                comp.close();
            }
        }
    }
}