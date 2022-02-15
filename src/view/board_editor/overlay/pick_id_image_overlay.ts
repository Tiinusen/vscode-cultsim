import * as L from 'leaflet';
import { setDebounce } from '../../../util/helpers';
import { Board } from '../board';
import { VSCode } from '../vscode';
import { BoardOverlay } from './board_overlay';
import html from './pick_id_image_overlay.html';

export class PickIDImageOverlay extends BoardOverlay {

    private _type: string;
    private _copyImage: string;
    private _id: string;
    private _ids: string[];
    private _icon: HTMLImageElement;
    private _addButton: HTMLButtonElement;
    private _mergeButton: HTMLButtonElement;
    private _closeButton: HTMLButtonElement;
    private _idInput: HTMLInputElement;
    private _idsDataList: HTMLDataListElement;

    private onPick?(id: string): void

    constructor(board: Board, attachTo?: HTMLElement) {
        super(html, board, attachTo);
    }

    protected async onInit() {
        this._addButton = this.element.querySelector('button[action="add"]');
        this._mergeButton = this.element.querySelector('button[action="merge"]');
        this._closeButton = this.element.querySelector('button[action="close"]');
        this._idInput = this.element.querySelector('input[name="id"]');
        this._idsDataList = this.element.querySelector('datalist[id="ids"]');
        this._icon = this.element.querySelector('img.icon');
        this._idInput.onkeydown = ev => this.onIDKeyDown(ev);
        this._idInput.onkeyup = setDebounce(this.onIDChange.bind(this), 100);
        this._closeButton.onclick = () => this.onCloseClick();
        this._mergeButton.onclick = () => this.onMergeClick();
        this._addButton.onclick = () => this.onAddClick();
        this._icon.onclick = () => this.onIconClick();

        if (this.isRemovedOnHide) {
            this._idInput.setAttribute('placeholder', 'Which image do you wish to clone?');
            this._icon.onclick = () => this.onCloseClick();
            this._closeButton.onclick = () => this.onMergeClick();
            this._addButton.innerText = "Copy";
            this._mergeButton.innerText = "Copy";
            this._closeButton.innerText = "Copy";
        }

        this.onIDChange();
    }

    private async onIconClick() {
        try {
            [this._copyImage] = await new PickIDImageOverlay(this.board, this.wrapper).pick(this._type, { id: this._idInput.value });
            this.setImage(this._copyImage);
            this.onCloseClick = this.onMergeClick;
        } catch (e) {
            if (e == "closed") return;
            VSCode.emitError(e);
        }
    }

    private onAddClick() {
        this?.onPick(this._idInput.value);
    }

    private onMergeClick() {
        this?.onPick(this._idInput.value);
    }

    private onCloseClick() {
        this?.onClickOutside();
    }

    private onIDChange() {
        const id = this._idInput.value.toLowerCase().trim() || "";
        this._idInput.setAttribute('title', '');
        this._idInput.removeAttribute('error');
        if (id.length == 0 || id == this._id) {
            this._closeButton.removeAttribute('hide');
        } else if (!this.isRemovedOnHide && (this.board.content[this._type].some(entity => entity.id == id))) {
            this._idInput.setAttribute('error', '');
            this._idInput.setAttribute('title', 'Already exists within document');
        } else if (this._ids.some(sid => sid == id)) {
            this._mergeButton.removeAttribute('hide');
        } else {
            this._addButton.removeAttribute('hide');
        }
        this.setImage(id);
    }

    private onIDKeyDown(ev: KeyboardEvent) {
        if (ev.code == "Enter") {
            ev.preventDefault();
            if (!this._addButton.hasAttribute('hide')) {
                this.onAddClick();
            } else if (!this._mergeButton.hasAttribute('hide')) {
                this.onMergeClick();
            } else if (!this._closeButton.hasAttribute('hide')) {
                this.onMergeClick();
            } else {
                VSCode.emitWarning(this._idInput.getAttribute('title'));
            }
            return;
        }
        this._addButton.setAttribute('hide', '');
        this._mergeButton.setAttribute('hide', '');
        this._closeButton.setAttribute('hide', '');
        this._idInput.setAttribute('title', '');
        this._idInput.removeAttribute('error');
    }


    /**
     * Opens dialog and resolves once user has performed expected action or closed dialog
     */
    public async pick(type: string, entity?: { id: string }): Promise<[id: string, imageToClone: string]> {
        this._type = type;
        this._id = entity?.id || "";
        this._idInput.value = this._id;
        this._ids = await VSCode.request('IDs', this._type);
        this._idsDataList.innerHTML = "";
        for (const id of this._ids) {
            const option = document.createElement('option');
            option.setAttribute('value', id);
            this._idsDataList.appendChild(option);
        }
        return new Promise((resolve, reject) => {
            this.onPick = (id: string) => {
                this.hide();
                const imageID = this?._copyImage || "";
                this._copyImage = void 0;
                resolve([id, imageID]);
            };
            this.onClickOutside = () => {
                this.hide();
                const imageID = this?._copyImage || "";
                reject("closed");
            };
            this.setImage(this._id);
            this.show();
            this._idInput.focus({ preventScroll: true });
        });
    }

    private async setImage(id?: string): Promise<any> {
        const imageURL: string = await VSCode.request('image', this._type, id);
        this._icon.setAttribute('src', imageURL + "?" + (Math.random() * 100));
    }
}