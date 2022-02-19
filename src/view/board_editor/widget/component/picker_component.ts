import { Entity } from "../../../../model/entity";
import { Board } from "../../board";
import { VSCode } from "../../vscode";

export class PickerComponent {
    private _propertyName: string;
    private _contentType: string;
    private _element: HTMLElement;
    private _data: any;
    private _parentData: any;
    private _board: Board;
    private _selectButton: HTMLElement;
    private _item: HTMLElement;
    private _image?: HTMLImageElement;
    private _label?: HTMLLabelElement;

    public onChange?: () => void;

    constructor(board: Board, propertyName: string, contentType: string, element: HTMLElement) {
        this._propertyName = propertyName;
        this._contentType = contentType;
        this._board = board;
        this._element = element;

        this._selectButton = element.querySelector('*[select]');
        this._selectButton.onclick = () => this.onSelect();

        this._item = element.querySelector('*[template]');
        this._item.toggleAttribute('template', false);
        this._item.toggleAttribute('item', true);
        this._item.toggleAttribute('hide', true);
        if (this.required) {
            this._item.onclick = () => this.onSelect();
            this._item.setAttribute('title', 'Click to replace');
        } else {
            this._item.onclick = () => this.onRemove();
            this._item.setAttribute('title', 'Click to remove');
        }

        this._image = this._item.querySelector('img');
        this._label = this._item.querySelector('label');

        this.element.toggleAttribute('picker', true);
        this.element.onclick = (e) => {
            e.stopPropagation();
        };
    }

    private get required(): boolean {
        return this.element.hasAttribute('required');
    }

    private get propertyName(): string {
        return this._propertyName;
    }

    private get data(): any {
        return this._data;
    }

    private get parentData(): any {
        return this._parentData;
    }

    private get board(): Board {
        return this._board;
    }

    private get element(): HTMLElement {
        return this._element;
    }

    public async onUpdate(data: Entity<any>, parentData?: Entity<any>) {
        this._data = data;
        this._parentData = parentData;
        const id = this._data?.[this.propertyName] || this?._parentData?.[this.propertyName] || void 0;
        if (id) {
            if (this._image) {
                const imageURL: string = await VSCode.request('image', this._contentType, id);
                this.setImage(imageURL);
            }
            if (this._label) {
                this._label.innerText = id;
            }
            this._item.toggleAttribute('hide', false);
            this._selectButton.toggleAttribute('hide', true);
        } else {
            this._item.toggleAttribute('hide', true);
            this._selectButton.toggleAttribute('hide', false);
        }
    }

    private async onSelect() {
        try {
            const [id] = await this.board.pickElementOverlay.pick(this._contentType, true);
            if (id == this?._parentData?.[this.propertyName]) {
                this._data[this.propertyName] = void 0;
            } else {
                this._data[this.propertyName] = id;
            }
            if (this.onChange) this.onChange();
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    private onRemove() {
        this._data[this.propertyName] = this._parentData?.[this.propertyName] ? "" : void 0;
        if (this.onChange) this.onChange();
    }

    private setImage(imageURL: string) {
        this._image.onerror = () => this._image.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
        this._image.setAttribute('src', imageURL);
    }
}