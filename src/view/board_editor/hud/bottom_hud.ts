import * as L from 'leaflet';
import { ContentType } from '../../../model/content';
import { Verb } from '../../../model/verb';
import { Arrange } from '../../../util/layout';
import { Board } from '../board';
import { VSCode } from '../vscode';
import { VerbWidget } from '../widget/verb_widget';
import { IWidgetState, Widget } from '../widget/widget';
import html from './bottom_hud.html';

export class BottomHUD extends L.Control {
    private _board: Board;
    private _element: HTMLElement;
    constructor(board: Board) {
        super({
            position: 'bottomright'
        });
        this._board = board;
    }

    private get board(): Board {
        return this._board;
    }

    private get element(): HTMLElement {
        return this._element;
    }

    public hide() {
        if (this._element) {
            this._element.setAttribute('hide', '');
        }
    }

    public show() {
        if (this._element) {
            this._element.removeAttribute('hide');
        }
    }

    onAdd(map: L.Map): HTMLElement {
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._element = this._element.firstElementChild as HTMLElement;
        this.init();
        return this._element;
    }

    init() {
        const sortButton = this.element.querySelector('button[action="Sort"]') as HTMLButtonElement;
        const addButton = this.element.querySelector('button[action="Add"]') as HTMLButtonElement;
        sortButton.onclick = () => this.onSortClick();
        addButton.onclick = () => this.onAddClick();
    }

    onSortClick() {
        this.board.widgets.forEach(widget => widget.close());
        Arrange.Grid(this.board.widgets, this.board.map.getBounds());
    }

    async onAddClick() {
        try {
            const widget = await (async () => {
                switch (this.board.content.type) {
                    case ContentType.Verbs: {
                        const [id, copyImage] = await this.board.pickIDImageOverlay.pick('verbs');
                        if (!id) return null;
                        return new VerbWidget(this.board, this.board.content.add(new Verb({ id: id, slot: { id: id } } as any))).bringToFront();
                    }
                }
                throw new Error("Add not supported yet for this content type");
            })();
            if (!widget) return;
            this.board.widgets.forEach(widget => widget.close());
            this.board.addWidget(widget);
            widget.xy = this.board.map.getBounds().getCenter().xy;
            widget.save();
        } catch (e) {
            if (e == "closed") return;
            console.error(e);
            VSCode.emitError(e);
        }
    }
}