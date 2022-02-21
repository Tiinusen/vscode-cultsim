import { setDebounce } from '../../../util/helpers';
import { Board } from '../board';
import { VSCode } from '../vscode';
import { BoardOverlay } from './board_overlay';
import html from './pick_element_overlay.html';

export class PickElementOverlay extends BoardOverlay {

    private _type: string;
    private _ids: string[];
    private _icon: HTMLImageElement;
    private _addButton: HTMLButtonElement;
    private _closeButton: HTMLButtonElement;
    private _idInput: HTMLInputElement;
    private _levelInput: HTMLInputElement;
    private _idsDataList: HTMLDataListElement;

    private onPick?(id: string, level: number): void

    constructor(board: Board, attachTo?: HTMLElement) {
        super(html, board, attachTo);
    }

    protected async onInit() {
        this._addButton = this.element.querySelector('button[action="add"]');
        this._closeButton = this.element.querySelector('button[action="close"]');
        this._idInput = this.element.querySelector('input[name="id"]');
        this._levelInput = this.element.querySelector('input[name="level"]');
        this._idsDataList = document.querySelector('datalist[id="ids"]');
        this._icon = this.element.querySelector('img.icon');
        this._idInput.onkeydown = ev => this.onKeyDown(ev);
        this._idInput.onkeyup = setDebounce(this.onChange.bind(this), 100);
        this._levelInput.onkeydown = ev => this.onKeyDown(ev);
        this._levelInput.onkeyup = setDebounce(this.onChange.bind(this), 100);
        this._closeButton.onclick = () => this.onCloseClick();
        this._addButton.onclick = () => this.onAddClick();
        this._icon.onclick = () => this.onIconClick();

        this.onChange();
    }

    private async onIconClick() {
        this?.onClickOutside();
    }

    private onAddClick() {
        this?.onPick(this._idInput.value, parseInt(this._levelInput.value) || 1);
    }

    private onCloseClick() {
        this?.onClickOutside();
    }

    private onChange() {
        this._idInput.value = this._idInput.value
            .toLowerCase()
            .replace(/[^0-9a-zA-Z.]/gm, "");
        const id = this._idInput.value;
        this._idInput.setAttribute('title', '');
        this._idInput.removeAttribute('error');
        if (id.length == 0) {
            this._closeButton.removeAttribute('hide');
        } else {
            this._addButton.removeAttribute('hide');
        }
        this.setImage(id);
    }

    private onKeyDown(ev: KeyboardEvent) {
        switch (ev.code) {
            case "Enter": {
                ev.preventDefault();
                if (!this._addButton.hasAttribute('hide')) {
                    this.onAddClick();
                } else {
                    VSCode.emitWarning(this._idInput.getAttribute('title'));
                }
                return;
            }
            case "Space": {
                setTimeout(() => {
                    this._idInput.value = this._idInput.value.replace(" ", ".");
                });
            }
        }
        this._addButton.toggleAttribute('hide', true);
        this._closeButton.toggleAttribute('hide', true);
        this._idInput.toggleAttribute('title', true);
        this._idInput.removeAttribute('error');
    }


    /**
     * Opens dialog and resolves once user has performed expected action or closed dialog
     */
    public async pick(type: string, noLevel = false, levelLabel = 'Level'): Promise<[id: string, level: number]> {
        this._type = type;
        this._idInput.value = "";
        this._levelInput.value = "";
        this._levelInput.toggleAttribute('hide', noLevel);
        this._levelInput.setAttribute('title', levelLabel);
        this._levelInput.setAttribute('placeholder', levelLabel);
        this._ids = await VSCode.request('IDs', this._type);
        this._idsDataList.innerHTML = "";
        for (const id of this._ids) {
            const option = document.createElement('option');
            option.setAttribute('value', id);
            this._idsDataList.appendChild(option);
        }
        return new Promise((resolve, reject) => {
            this.onPick = (id: string, level: number) => {
                this.hide();
                resolve([id, level]);
            };
            this.onClickOutside = () => {
                this.hide();
                reject("closed");
            };
            this.setImage(this._idInput.value);
            this.show();
            this._idInput.focus({ preventScroll: true });
        });
    }

    private async setImage(id?: string): Promise<any> {
        const imageURL: string = await VSCode.request('image', this._type, id);
        this._icon.onerror = () => this._icon.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
        this._icon.setAttribute('src', imageURL);
    }
}