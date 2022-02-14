

/* eslint-disable semi */

import { Board, BOARD_SIZE_HEIGHT, BOARD_SIZE_WIDTH } from "../board";
import * as L from 'leaflet';
import { VSCode } from "../vscode";
import { newNonce, setDebounce } from "../../../util/helpers";

export interface IWidgetState {
    x: number
    y: number
    xyBeforeOpen: [number, number]
    open: boolean
}

export abstract class Widget<EntityState, WidgetState> extends L.Marker {
    private _board: Board
    private _data: EntityState
    private _state: WidgetState | IWidgetState
    private _icon: L.DivIcon
    private _className: string
    private _element: HTMLElement
    private _initialized = false
    private _isDragging = false
    private static xIndexCounter = 1;
    private static focused: Widget<any, IWidgetState>;

    // Events
    onRedraw?(): any;
    onOpen?(): any;
    onClose?(): any;

    constructor(board: Board, data: EntityState, html?: string, className?: string) {
        super(L.latLng(0, 0));
        this._board = board;
        this._data = data;
        if (!className) className = "board-widget";
        this._className = className;
        this.setOpacity(0);
        this.setZIndexOffset(0);
        this._icon = L.divIcon({
            html: html
        });
        this.setIcon(this._icon);
        this.on('add', (e) => this.init());
        this.xy = [BOARD_SIZE_WIDTH / 2, BOARD_SIZE_HEIGHT / 2];
    }

    public get size(): [number, number] {
        return [140, 140];
    }

    public get initialized(): boolean {
        return this._initialized;
    }

    public get element(): HTMLElement {
        return this._element;
    }

    protected get board(): Board {
        return this._board;
    }

    public get data(): EntityState {
        return this._data;
    }

    public set data(value: EntityState) {
        this._data = value;
        this.redraw();
    }

    public get state(): WidgetState | IWidgetState {
        return this._state as WidgetState;
    }

    public get x(): number {
        return this.xy[0];
    }

    public set x(x: number) {
        this.xy = [x, this.y];
    }

    public get y(): number {
        return this.xy[1];
    }

    public set y(y: number) {
        this.xy = [this.x, y];
    }

    public get xy(): [number, number] {
        const latlng = this.getLatLng();
        return [
            latlng.lng,
            latlng.lat
        ];
    }

    public set xy(value: [number, number]) {
        if (!value) {
            return;
        }
        this.setLatLng(L.latLng(value[1], value[0]));
    }

    public get isDragging(): boolean {
        return this._isDragging;
    }

    public save(local = false) {
        const state = this.state as IWidgetState;
        state.x = this.x;
        state.y = this.y;
        VSCode.setWidgetState(this._className + "|" + ((this.data as any)?.id), this._state as IWidgetState);
        if (!local) {
            this.board.save();
        }
    }

    public async redraw() {
        this.dragging.enable();
        if (this._element && this.onRedraw) {
            await this.onRedraw();
        }
    }

    public open(init = false) {
        if (this.element.hasAttribute('open')) {
            if (init && this.onOpen) this.onOpen();
            return;
        }
        Widget.focused = null;
        if (!init || !(this.state as IWidgetState)?.xyBeforeOpen) {
            (this.state as IWidgetState).xyBeforeOpen = this.xy;
        }
        (this.state as IWidgetState).open = true;
        this.element.setAttribute('open', '');
        this.bringToFront();
        this.save(true);
        if (this.onOpen) this.onOpen();
    }

    public close(init = false) {
        if (Widget.focused as any === this) {
            Widget.focused = null;
        }
        if (!this.element.hasAttribute('open')) {
            if (init && this.onClose) this.onClose();
            return;
        }
        this.setZIndexOffset(0);
        this.xy = (this.state as IWidgetState)?.xyBeforeOpen;
        (this.state as IWidgetState).open = false;
        this.element.removeAttribute('open');
        this.save(true);
        if (this.onClose) this.onClose();
    }

    public bringToFront() {
        if (Widget.focused as any === this) return;
        Widget.xIndexCounter++;
        Widget.focused = this as any;
        this.setZIndexOffset(Widget.xIndexCounter * ((this.state as IWidgetState)?.open ? 1000000 : 1000));
    }

    protected bindInput(input: HTMLInputElement) {
        input.onclick = (e) => {
            e.stopPropagation();
        };
        const fieldName = input.getAttribute('name');
        if (!(fieldName in this.data)) {
            return;
        }
        input.value = this.data[fieldName];
        input.onkeyup = () => {
            if (this.data[fieldName] == input.value) {
                return;
            }
            this.data[fieldName] = input.value;
            this.board.save();
        };
    }

    protected notWhenDragged(fn: (e?: MouseEvent) => void): (e?: MouseEvent) => void {
        return (e?: MouseEvent) => {
            if (this.isDragging) return;
            e?.stopPropagation();
            return fn(e);
        };
    }

    private async init(force = false) {
        this._state = VSCode.getWidgetState(this._className + "|" + ((this.data as any)?.id));
        this.xy = [
            this._state?.x ? this._state.x : BOARD_SIZE_WIDTH / 2,
            this._state?.y ? this._state.y : BOARD_SIZE_HEIGHT / 2
        ];
        this._element = this.getElement();
        if (!this._element) {
            throw new Error("Element not found");
        }
        this._element.setAttribute('class', "board-widget " + this._className);
        await this.redraw();
        this.setOpacity(100);
        this._initialized = true;
        this.on('mousedown', () => this.bringToFront());

        // Dragging
        this.on('dragstart', () => this._isDragging = true);
        this.on('dragend', setDebounce(() => this._isDragging = false, 10));
        this.on('dragend', (e) => {
            this.save(true);
        });

        if (this.state) {
            if ((this.state as IWidgetState)?.open) {
                this.open(true);
            } else {
                this.close(true);
            }
        }
    }
}