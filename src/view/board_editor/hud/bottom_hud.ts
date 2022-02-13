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
        this._element = this._element.querySelector('.hud');
        this.init();
        return this._element;
    }

    init() {
        const sortButton = this.element.querySelector('button[action="Sort"]') as HTMLButtonElement;
        const addButton = this.element.querySelector('button[action="Add"]') as HTMLButtonElement;

        sortButton.onclick = () => {
            this.board.widgets.forEach(widget => widget.close());
            Arrange.Grid(this.board.widgets, this.board.map.getBounds());
        };

        addButton.onclick = () => {
            try {
                const widget = (() => {
                    switch (this.board.content.type) {
                        case ContentType.Verbs:
                            return new VerbWidget(this.board, this.board.content.add(new Verb()));
                    }
                    return null;
                })();
                if (!widget) throw new Error("content type does not support add");
                this.board.addWidget(widget);
                widget.xy = this.board.map.getBounds().getCenter().xy;
                widget.save();
            } catch (e) {
                VSCode.emitError(e);
            }
        };
    }
}