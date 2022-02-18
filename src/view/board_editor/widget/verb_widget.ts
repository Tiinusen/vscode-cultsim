

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
    private lastIconFetch?: number;

    constructor(board: Board, data: Verb) {
        super(board, data, html, "verb-widget");
    }

    private setImage(imageURL: string) {
        this.icon.onerror = () => this.icon.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        this.icon.setAttribute('src', imageURL + "?" + (Math.random() * 100));
    }

    protected async onUpdate() {
        // Fetch data
        if (this.data?.id && !this.parentData) {
            const dataParent: Verb = await VSCode.request('entity', 'verbs', this.data.id);
            if (dataParent) this.parentData = new Verb(dataParent);
        }

        // Icon
        this.icon = this.element.querySelector('.icon');
        if (!this.lastIconFetch || (this.lastIconFetch + 5 * 1000) < new Date().getTime()) {
            this.lastIconFetch = new Date().getTime();
            this.setImage(await VSCode.request('image', 'verbs', this.data?.id));
        }

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
        if (this.parentData) this.slot.parentData = this.parentData.slot;
        await this.slot.onUpdate();
        this.slot.onOpen = null;
        if (this.state.openSlot == 1) {
            this.slot.open();
        }
        this.slot.onOpen = () => {
            this.state.openSlot = 1;
            this.save(true);
        };
        this.slot.onClose = () => {
            this.state.openSlot = 0;
            this.save(true);
        };
    }

    protected onClickClose() {
        this.close();
    }

    protected onOpen() {
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
        icon.setAttribute('title', this.data.id + "\n\nClick to open verb");
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