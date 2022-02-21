import { Entity } from "../../../../model/entity";
import { Slot } from "../../../../model/slot";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { SlotComponent } from "./slot_component";

export class SlotsComponent<T> {
    private _propertyName: string;
    private _list: HTMLElement;
    private _items: Map<string, SlotComponent<T>> = new Map();
    private _template: HTMLElement;
    private _data: any;
    private _parentData: any;
    private _board: Board;
    private _addButton: HTMLElement;
    private _widget: T;
    private _min: number;
    private _max: number;

    public onChange?: () => void;
    public onOpen?(slotNumber: number);
    public onClose?();

    constructor(board: Board, propertyName: string, widget: T, element: HTMLElement, min = 1, max = 1) {
        this._propertyName = propertyName;
        this._board = board;
        this._widget = widget;
        this._min = min;
        this._max = max;
        this._list = element.querySelector('*[slots]') || element;
        this._list.toggleAttribute('slots', true);
        this._template = this._list.querySelector('*[slot]');
        this._template.remove();
        this._addButton = element.querySelector('*[add]');
        if (min != max && !this._addButton) {
            this._addButton = document.createElement('div');
            this._addButton.toggleAttribute('slot', true);
            this._addButton.toggleAttribute('add', true);
            this._list.append(this._addButton);
        }
        if (this._addButton) this._addButton.onclick = () => this.onAdd();
    }

    public get size(): number {
        return this._items.size;
    }

    public open(slotNumber: number) {
        let i = 1;
        for (const [key, comp] of this._items) {
            if (i == slotNumber) {
                comp.open();
            } else {
                comp.close();
            }
            i++;
        }
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

        // const list: Array<Slot> = merged?.[this._propertyName] || [];
        const list: Array<Slot> = this._data?.[this._propertyName] || [];

        if (this._min == this._max && !Array.isArray(list)) {
            const slot: Slot = list;
            if (this._items.size == 0) {
                const element: HTMLElement = this._template.cloneNode(true) as any;
                const slotComp = new SlotComponent<T>(this._board, this._widget, element);
                slotComp.onOpen = () => this?.onOpen(1);
                slotComp.onClose = () => this?.onClose();
                slotComp.onChange = () => this?.onChange();
                this._list.append(element);
                this._items.set(slot.id, slotComp);
            }
            await this._items.get(slot.id).onUpdate(slot, parentData as any);
            return;
        }

        // Remove unremoved items
        for (const [key, slot] of this._items) {
            if (list.some(item => item.id == key)) continue;
            this._items.delete(key);
            slot.remove();
        }

        // Add / Update items
        for (const slot of list) {
            if (!this._items.has(slot.id)) {
                const slotNumber = 1 + this._items.size;
                const element: HTMLElement = this._template.cloneNode(true) as any;
                // Add item
                const slotComp = new SlotComponent<T>(this._board, this._widget, element);
                slotComp.onOpen = () => this?.onOpen(slotNumber);
                slotComp.onClose = () => this?.onClose();
                slotComp.onChange = () => this?.onChange();
                this._addButton.remove();
                this._list.append(element);
                this._list.append(this._addButton);
                this._items.set(slot.id, slotComp);

            }
            await this._items.get(slot.id).onUpdate(slot);
        }

        // Add button
        this._addButton?.toggleAttribute('hide', list.length >= this._max);
    }

    private async onAdd() {
        try {
            const [id] = await this._board.pickElementOverlay.pick("", true);
            if (this._parentData?.[`${this._propertyName}`] && !this._data?.[`${this._propertyName}`]) {
                if (this._data?.[`${this._propertyName}$remove`] && this._data[`${this._propertyName}$remove`].indexOf(id) !== -1) {
                    this._data[`${this._propertyName}$remove`] = this._data[`${this._propertyName}$remove`].filter((sid: string) => sid != id);
                    if (this._data[`${this._propertyName}$remove`].length == 0) this._data[`${this._propertyName}$remove`] = void 0;
                } else {
                    if (!this._data?.[`${this._propertyName}$append`]) this._data[`${this._propertyName}$append`] = new Array<Slot>();
                    this._data[`${this._propertyName}$append`].push(new Slot({ id: id, label: id } as any));
                }
            } else {
                if (!this._data?.[`${this._propertyName}`]) this._data[`${this._propertyName}`] = new Array<Slot>();
                this._data[`${this._propertyName}`].push(new Slot({ id: id, label: id } as any));
            }
            await this.onUpdate(this._data, this._parentData);
            if (this.onChange) this.onChange();
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    protected async onRemove(id: string, element: HTMLElement) {
        element.remove();
        if (!this._data[this._propertyName] && this._parentData[this._propertyName]) {
            if (this._data.get(`${this._propertyName}$append`) && this._data.get(`${this._propertyName}$append`).some((item: Slot) => item.id == id)) {
                let list: Array<Slot> = this._data.get(`${this._propertyName}$append`);
                list = list.filter(item => item.id != id);
                this._data.set(`${this._propertyName}$append`, list);
                if (list.length == 0) {
                    this._data.set(`${this._propertyName}$append`, void 0);
                }
            } else if (this._data.get(`${this._propertyName}$prepend`) && this._data.get(`${this._propertyName}$prepend`).some((item: Slot) => item.id == id)) {
                let list: Array<Slot> = this._data.get(`${this._propertyName}$prepend`);
                list = list.filter(item => item.id != id);
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
            let list: Array<Slot> = this._data.get(this._propertyName);
            list = list.filter(item => item.id != id);
            this._data.set(this._propertyName, list.length == 0 ? void 0 : list);
        }
        await this.onUpdate(this._data, this._parentData);
        if (this.onChange) this.onChange();
    }
}