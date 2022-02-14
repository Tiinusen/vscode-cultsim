

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

    constructor(board: Board, data: Verb) {
        super(board, data, html, "verb-widget");
    }

    async onUpdate() {
        const icon: HTMLElement = this.element.querySelector('.icon');
        const imageURL: string = await VSCode.request('image', 'verb', this.data?.id);
        icon.setAttribute('src', imageURL);


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
        icon.onclick = this.notWhenDragged((e) => {
            VSCode.emitInfo("Edit ID and Picture");
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