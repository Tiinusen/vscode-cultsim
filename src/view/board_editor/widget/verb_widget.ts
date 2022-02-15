

import { Verb } from "../../../model/verb";
import { Board } from "../board";
import { IWidgetState, Widget } from "./widget";
import html from "./verb_widget.html";
import { VSCode } from "../vscode";
import { get, has, set, setDebounce } from "../../../util/helpers";
import { SlotWidget } from "./slot_widget";

export interface IVerbWidgetState extends IWidgetState {
    slotOpen: boolean
}

export class VerbWidget extends Widget<Verb, IVerbWidgetState> {
    private slot?: SlotWidget<VerbWidget>;
    private slotsElement?: Element;
    private slotTemplateElement?: Element;
    private icon: HTMLImageElement;

    constructor(board: Board, data: Verb) {
        super(board, data, html, "verb-widget");
    }

    private setImage(imageURL: string) {
        this.icon.setAttribute('src', imageURL + "?" + (Math.random() * 100));
    }

    async onUpdate() {
        this.icon = this.element.querySelector('.icon');
        this.setImage(await VSCode.request('image', 'verbs', this.data?.id));

        // Remove slot template
        if (!this.slotsElement) {
            this.slotsElement = this.element.querySelector('.slots');
            this.slotTemplateElement = this.slotsElement.querySelector('.slot');
            this.slotsElement.removeChild(this.slotTemplateElement);
        }

        // Buttons
        const closeButton: HTMLElement = this.element.querySelector('.header i[close]');
        closeButton.onclick = this.notWhenDragged((e) => this.onClickClose());

        // Inputs
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => this.bindInput(input));

        // Slot
        if (!this.slot) {
            const slotElement = this.slotTemplateElement.cloneNode(true) as HTMLElement;
            this.slotsElement.appendChild(slotElement);
            this.slot = new SlotWidget<VerbWidget>(this.board, this.data.slot, this, slotElement);
        }
        this.slot.data = this.data.slot;
        this.slot.onUpdate();
    }

    onClickClose() {
        this.close();
    }

    onOpen() {
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to edit ID or image");
        icon.onclick = this.notWhenDragged(async (e) => {
            try {
                const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('verbs', this.data);
                if (imageToCloneID) {
                    await VSCode.request('clone', 'verbs', imageToCloneID, id);
                    VSCode.emitInfo(`Image has successfully been added to your workspace`);
                }
                this.data.id = id;
                this.save();
                this.onUpdate();
            } catch (e) {
                if (e == "closed") return;
                VSCode.emitError(e);
            }
        });
    }

    onClose() {
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to open verb");
        icon.onclick = null;
        this.removeEventListener('click');
        this.once('click', () => {
            this.open();
        });
    }
}