

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
        this.onRedraw = (element) => {
            const icon: HTMLElement = element.querySelector('.icon');
            icon.setAttribute('src', 'https://www.frangiclave.net/static/images/icons100/verbs/' + (this.data?.id ? this.data.id : "work") + '.png');

            // Dragging
            let isDragging = false;
            this.on('dragstart', () => isDragging = true);
            this.on('dragend', setDebounce(() => isDragging = false, 10));

            // Open / Close
            const closeButton: HTMLElement = element.querySelector('.header i[close]');
            closeButton.onclick = (e) => {
                if (isDragging) return;
                e.stopPropagation();
                this.close();
            };
            this.onClose = (element) => {
                icon.setAttribute('title', this.data.id + "\n\nClick to open verb");
                icon.onclick = null;
                this.removeEventListener('click');
                this.once('click', () => {
                    this.open();
                });
            };
            this.onOpen = (element) => {
                icon.setAttribute('title', this.data.id + "\n\nClick to edit ID or image");
                icon.onclick = (e) => {
                    if (isDragging) return;
                    e.stopPropagation();
                    // Something else
                    VSCode.emitInfo("Edit ID and Picture");
                };
            };

            // Remove slot template
            if (!this.slotsElement) {
                this.slotsElement = element.querySelector('.slots');
                this.slotTemplateElement = this.slotsElement.querySelector('.slot');
                this.slotsElement.removeChild(this.slotTemplateElement);
            }

            // Inputs
            element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => {
                const name = input.getAttribute('name');
                if (!(name in this.data)) {
                    return;
                }
                input.value = get(this.data, name, "");
                input.onkeyup = () => {
                    if (get(this.data, name, "") == input.value) {
                        return;
                    }
                    set(this.data, name, input.value);
                    this.save();
                };
            });

            // Slot
            if (!this.slot) {
                const slotElement = this.slotTemplateElement.cloneNode(true) as HTMLElement;
                this.slotsElement.appendChild(slotElement);
                this.slot = new SlotWidget<VerbWidget>(board, this.data.slot, this, slotElement);
            }
            this.slot.data = this.data.slot;
            this.slot.onRedraw();
        };
    }

}