import { Recipe } from "../../../../model/recipe";
import { Board } from "../../board";
import { VSCode } from "../../vscode";
import { InputComponent } from "./input_component";
import { ListComponent } from "./list_component";

export class InternalDeckComponent<T> {
    private _board: Board;
    private _data?: Recipe;
    private _parentData?: Recipe;
    private _widget: T;
    private _element: HTMLElement;
    private _spec: ListComponent;
    
    public onChange?: () => void;

    constructor(board: Board, widget: T, element: HTMLElement) {
        this._board = board;
        this._widget = widget;
        this._element = element;
        if (!this._element) throw new Error("Element needed");
        this._spec = new ListComponent(this.board, "spec", "elements", this.element.querySelector('*[name="spec"]'));
        this._spec.onChange = () => {
            this?.onChange();
        };
    }

    private _inputs = new Map<string, InputComponent>();
    protected bindInput(input: HTMLInputElement) {
        const propertyName = input.getAttribute('name');
        if (!(propertyName in this.data.internaldeck)) {
            return;
        }
        if (!this._inputs.has(propertyName)) {
            this._inputs.set(propertyName, new InputComponent(this.board, input));
        }
        this._inputs.get(propertyName).onUpdate(this.data.internaldeck, this?.parentData?.internaldeck);
    }

    protected notWhenDragged(fn: (e?: MouseEvent) => void): (e?: MouseEvent) => void {
        return (e?: MouseEvent) => {
            fn = fn.bind(this);
            if ((this.widget as any).isDragging) return;
            e?.stopPropagation();
            return fn(e);
        };
    }

    private get parentData(): Recipe {
        return this._parentData;
    }
    private set parentData(value: Recipe) {
        this._parentData = value;
    }

    private get widget(): T {
        return this._widget;
    }

    private get board(): Board {
        return this._board;
    }
    private get data(): Recipe {
        return this._data;
    }
    private set data(value: Recipe) {
        this._data = value;
    }
    private get element(): HTMLElement {
        return this._element;
    }

    public async onUpdate(data: Recipe, parentData?: Recipe) {
        this.data = data;
        this.parentData = parentData;
        try {
            await this._spec.onUpdate(this.data.internaldeck, this?.parentData?.internaldeck);
            this.element.querySelectorAll('input[name],textarea[name],select[name]').forEach((input: HTMLInputElement) => this.bindInput(input));
        } catch (e) {
            console.error(e);
            VSCode.emitError(e);
        }
    }
}