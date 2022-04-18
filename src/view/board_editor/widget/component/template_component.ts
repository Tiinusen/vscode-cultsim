import { Board } from "../../board";
import { VSCode } from "../../vscode";

export class InternalDeckComponent<T> {
    private _board: Board;
    private _data?: { spec: Array<string>, draws: number, resetonexhaustion: boolean };
    private _parentData?: { spec: Array<string>, draws: number, resetonexhaustion: boolean };
    private _widget: T;
    private _element: HTMLElement;

    public onOpen?: () => void;
    public onClose?: () => void;
    public onChange?: () => void;
    public onRemove?: () => void;

    constructor(board: Board, widget: T, element: HTMLElement) {
        this._board = board;
        this._widget = widget;
        this._element = element;
        if (!this._element) throw new Error("Element needed");
    }

    protected notWhenDragged(fn: (e?: MouseEvent) => void): (e?: MouseEvent) => void {
        return (e?: MouseEvent) => {
            fn = fn.bind(this);
            if ((this.widget as any).isDragging) return;
            e?.stopPropagation();
            return fn(e);
        };
    }

    private get parentData(): { spec: Array<string>, draws: number, resetonexhaustion: boolean } {
        return this._parentData;
    }
    private set parentData(value: { spec: Array<string>, draws: number, resetonexhaustion: boolean }) {
        this._parentData = value;
    }

    private get widget(): T {
        return this._widget;
    }

    private get board(): Board {
        return this._board;
    }
    private get data(): { spec: Array<string>, draws: number, resetonexhaustion: boolean } {
        return this._data;
    }
    private set data(value: { spec: Array<string>, draws: number, resetonexhaustion: boolean }) {
        this._data = value;
    }
    private get element(): HTMLElement {
        return this._element;
    }

    public async onUpdate(data: { spec: Array<string>, draws: number, resetonexhaustion: boolean }, parentData?: { spec: Array<string>, draws: number, resetonexhaustion: boolean }) {
        this.data = data;
        this.parentData = parentData;
        try {
            // await this._required.onUpdate(this.data, this?._parentData);
        } catch (e) {
            console.error(e);
            VSCode.emitError(e);
        }
    }
}