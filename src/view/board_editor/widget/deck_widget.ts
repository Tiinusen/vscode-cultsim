

import { Deck } from "../../../model/deck";
import { Board } from "../board";
import { IWidgetState, Widget } from "./widget";
import html from "./deck_widget.html";
import { VSCode } from "../vscode";
import { ListComponent } from "./component/list_component";
import { PickerComponent } from "./component/picker_component";

export interface IDeckWidgetState extends IWidgetState {
    slotOpen: boolean
}

export class DeckWidget extends Widget<Deck, IDeckWidgetState> {
    private icon: HTMLImageElement;
    private lastIconFetch?: number;
    private spec: ListComponent;
    private defaultcard: PickerComponent;

    constructor(board: Board, data: Deck) {
        super(board, data, html, "deck-widget");
    }

    private setImage(imageURL: string) {
        this.icon.onerror = () => this.icon.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
        this.icon.setAttribute('src', imageURL);
    }

    protected onInit() {
        this.icon = this.element.querySelector('.icon');

        this.spec = new ListComponent(this.board, "spec", "elements", this.element.querySelector('div[name="spec"]'));
        this.spec.onChange = () => {
            this.save();
            this.onUpdate();
        };

        this.defaultcard = new PickerComponent(this.board, "defaultcard", "elements", this.element.querySelector('div[name="defaultcard"]'));
        this.defaultcard.onChange = () => {
            this.save();
            this.onUpdate();
        };
    }

    protected async onUpdate() {
        // Fetch data
        if (this.data?.id && !this.parentData) {
            const dataParent: Deck = await VSCode.request('entity', 'decks', this.data.id);
            if (dataParent) this.parentData = new Deck(dataParent);
        }
        (this.element.querySelector('.box label') as HTMLLabelElement).innerText = this.data?.id || this.parentData?.id || "";

        // Icon
        if (!this.lastIconFetch || (this.lastIconFetch + 5 * 1000) < new Date().getTime()) {
            this.lastIconFetch = new Date().getTime();
            this.setImage(await VSCode.request('image', 'decks', this.data?.id));
        }

        // Buttons
        const closeButton: HTMLElement = this.element.querySelector('.header i[close]');
        closeButton.onclick = this.notWhenDragged((e) => this.onClickClose());

        // Inputs
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => this.bindInput(input));

        try{
            await this.spec?.onUpdate(this.data, this?.parentData);
            await this.defaultcard?.onUpdate(this.data, this?.parentData);
        }catch(e){
            console.error(e);
            VSCode.emitError(e);
        }
    }

    protected onClickClose() {
        this.close();
    }

    protected onOpen() {
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to edit ID or image");
        icon.onclick = this.notWhenDragged(async (e) => {
            try {
                const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('decks', false, this.data);
                if (imageToCloneID) {
                    await VSCode.request('clone', 'decks', imageToCloneID, id);
                    VSCode.emitInfo(`Image has successfully been added to your workspace`);
                }
                this.data.id = id;
                this.parentData = null;
                this.save();
                await this.onUpdate();
            } catch (e) {
                if (e == "closed") return;
                VSCode.emitError(e);
            }
        });
    }

    protected onClose() {
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to open deck");
        icon.onclick = null;
        this.removeEventListener('click');
        this.once('click', () => this.onClick());
    }

    protected onClick() {
        if (!this.board.hud.inDeleteMode) return this.open();
        this.board.removeWidget(this, true);
        this.board.hud.inDeleteMode = false;
    }
}