import { Entity } from "../../../../model/entity";
import { Board } from "../../board";
import { VSCode } from "../../vscode";

export class InputComponent {
    private _propertyName: string;
    private _element: HTMLInputElement;
    private _data: any;
    private _parentData: any;
    private _board: Board;

    public onChange?: () => void;

    constructor(board: Board, element: HTMLInputElement) {
        this._board = board;
        this._element = element;
        this._propertyName = this.element.getAttribute('name');

        this.element.onclick = (e) => {
            e.stopPropagation();
        };

        const type = this.element.getAttribute('type');
        if (type == "checkbox") {
            this.element.onchange = () => {
                this.data[this._propertyName] = this.element.checked;
                this.board.save();
            };
            return;
        }

        this.element.onkeyup = () => {
            if (this.data[this._propertyName] == this.element.value) {
                return;
            }
            this.data[this._propertyName] = this.element.value;
            this.board.save();
        };
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

    private get element(): HTMLInputElement {
        return this._element;
    }

    public async onUpdate(data: Entity<any>, parentData?: Entity<any>) {
        this._data = data;
        this._parentData = parentData;

        const type = this.element.getAttribute('type');
        if (type == "checkbox") {
            this.element.checked = this?.data?.[this.propertyName] || this?.parentData?.[this.propertyName] || false;
            return;
        }

        this.element.value = this.data[this.propertyName];
        this.element.placeholder = this?.parentData?.[this.propertyName] || "";
    }
}