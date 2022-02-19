import * as L from 'leaflet';
import { ContentType } from '../../../model/content';
import { Legacy } from '../../../model/legacy';
import { Verb } from '../../../model/verb';
import { setDebounce } from '../../../util/helpers';
import { Arrange } from '../../../util/layout';
import { Board } from '../board';
import { VSCode } from '../vscode';
import { LegacyWidget } from '../widget/legacy_widget';
import { VerbWidget } from '../widget/verb_widget';
import html from './bottom_hud.html';

export class BottomHUD extends L.Control {
    private _board: Board;
    private _element: HTMLElement;
    private _inDeleteMode = false;
    constructor(board: Board) {
        super({
            position: 'bottomright'
        });
        this._board = board;
    }

    public get inDeleteMode(): boolean {
        return this._inDeleteMode;
    }
    public set inDeleteMode(value: boolean) {
        this._inDeleteMode = value;
        if (this._inDeleteMode) {
            this.hide();
        } else {
            this.show();
        }
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

    public onAdd(map: L.Map): HTMLElement {
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._element = this._element.firstElementChild as HTMLElement;
        this.init();
        return this._element;
    }

    protected init() {
        const sortButton = this.element.querySelector('button[action="Sort"]') as HTMLButtonElement;
        const addButton = this.element.querySelector('button[action="Add"]') as HTMLButtonElement;
        const deleteButton = this.element.querySelector('button[action="Delete"]') as HTMLButtonElement;
        sortButton.onclick = () => this.onSortClick();
        addButton.onclick = () => this.onAddClick();
        deleteButton.onclick = () => this.onDeleteClick();
    }

    protected onSortClick() {
        this.board.widgets.forEach(widget => widget.close());
        Arrange.Grid(this.board.widgets, this.board.map.getBounds());
    }

    protected async onAddClick() {
        try {
            const widget = await (async () => {
                switch (this.board.content.type) {
                    case ContentType.Verbs: {
                        const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('verbs');
                        if (!id) return null;
                        if (imageToCloneID) {
                            await VSCode.request('clone', 'verbs', imageToCloneID, id);
                            VSCode.emitInfo(`Image has successfully been added to your workspace`);
                        }
                        return new VerbWidget(this.board, this.board.content.add(new Verb({ id: id, slot: { id: id } } as any))).bringToFront();
                    }
                    case ContentType.Legacies: {
                        const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('legacies');
                        if (!id) return null;
                        if (imageToCloneID) {
                            await VSCode.request('clone', 'legacies', imageToCloneID, id);
                            VSCode.emitInfo(`Image has successfully been added to your workspace`);
                        }
                        return new LegacyWidget(this.board, this.board.content.add(new Legacy({ id: id, slot: { id: id } } as any))).bringToFront();
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

    private onDeleteClick() {
        setTimeout(() => {
            this.board.map.once('click', (e: { originalEvent: MouseEvent }) => {
                if (e.originalEvent.target === this.board.map as any) return;
                if (!this.board.hud.inDeleteMode) return;
                e.originalEvent.preventDefault();
                this.board.hud.inDeleteMode = false;
            }, 100);
            this.inDeleteMode = true;
        }, 100);
        this.board.widgets.forEach(widget => widget.close());
    }
}