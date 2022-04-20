

import { CElement } from "../../../model/element";
import { Board } from "../board";
import { IWidgetState, Widget } from "./widget";
import html from "../../../../media/view/board_editor/widget/element_widget.html";
import { VSCode } from "../vscode";
import { DictionaryComponent } from "./component/dictionary_component";
import { PickerComponent } from "./component/picker_component";
import { PercentageListComponent } from "./component/percentage_list_component";
import { SlotsComponent } from "./component/slots_component";
import { XTriggersComponent } from "./component/xtriggers_component";

export interface ICElementWidgetState extends IWidgetState {
    xtriggerOpen: string
}

export class CElementWidget extends Widget<CElement, ICElementWidgetState> {
    private icon: HTMLImageElement;
    private lastIconFetch?: number;
    private induces: PercentageListComponent;
    private aspects: DictionaryComponent;
    private decayTo: PickerComponent;
    private slots: SlotsComponent<CElementWidget>;
    private xtriggers: XTriggersComponent<CElementWidget>;

    constructor(board: Board, data: CElement) {
        super(board, data, html, "element-widget");
    }

    protected onInit() {
        this.element.toggleAttribute('aspect', this?.data.isAspect || this?.parentData?.isAspect || false);
        this.induces = new PercentageListComponent(this.board, "induces", this.element.querySelector('div[name="induces"]'));
        this.induces.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.aspects = new DictionaryComponent(this.board, "aspects", "elements", this.element.querySelector('div[name="aspects"]'));
        this.aspects.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.decayTo = new PickerComponent(this.board, "decayTo", "elements", this.element.querySelector('div[name="decayTo"]'));
        this.decayTo.onChange = () => {
            this.save();
            this.onUpdate();
        };

        this.xtriggers = new XTriggersComponent(this.board, "xtriggers", this, this.element.querySelector('div[name="xtriggers"]'));
        this.xtriggers.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.xtriggers.onOpen = (key: string) => {
            (this.state as ICElementWidgetState).xtriggerOpen = key;
            this.save(true);
        };
        this.xtriggers.onClose = () => {
            (this.state as ICElementWidgetState).xtriggerOpen = void 0;
            this.save(true);
        };

        this.slots = new SlotsComponent(this.board, "slots", this, this.element.querySelector('*[name="slots"]'), 0, 6);
        this.slots.onOpen = (slotNumber: number) => {
            this.state.openSlot = slotNumber;
            this.save(true);
        };
        this.slots.onClose = () => {
            this.state.openSlot = 0;
            this.save(true);
        };
        this.slots.onChange = () => {
            this.element.toggleAttribute('large', this.slots.size >= 3);
            this.save();
        };
    }

    private setImage(imageURL: string) {
        this.icon.onerror = () => this.icon.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
        this.icon.setAttribute('src', imageURL);
    }

    protected async onUpdate() {
        // Fetch data
        if (this.data?.id && !this.parentData) {
            const dataParent: CElement = await VSCode.request('entity', 'elements', this.data.id);
            if (dataParent) this.parentData = new CElement(dataParent);
        }

        (this.element.querySelector('.box label') as HTMLLabelElement).innerText = this.data?.label || this.parentData?.label || "";

        // Icon
        if ((this.data?.noArtNeeded === void 0 && !this?.parentData?.noArtNeeded) || !this.data?.noArtNeeded) {
            this.icon = this.element.querySelector('.icon');
            if (!this.lastIconFetch || (this.lastIconFetch + 5 * 1000) < new Date().getTime()) {
                this.lastIconFetch = new Date().getTime();
                this.setImage(await VSCode.request('image', 'elements', this.data?.id));
            }
        }

        // Buttons
        const closeButton: HTMLElement = this.element.querySelector('.header i[close]');
        closeButton.onclick = this.notWhenDragged((e) => this.onClickClose());

        // Inputs
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => this.bindInput(input));

        try {
            await this.induces?.onUpdate(this.data, this?.parentData);
            await this.aspects?.onUpdate(this.data, this?.parentData);
            await this.decayTo?.onUpdate(this.data, this?.parentData);
            await this.slots.onUpdate(this.data, this?.parentData);
            await this.xtriggers?.onUpdate(this.data, this?.parentData);
            this.element.toggleAttribute('large', this.slots.size >= 3);
            this.slots.open(this?.state?.openSlot || 0);
            this.xtriggers.open((this.state as ICElementWidgetState)?.xtriggerOpen || "");
        } catch (e) {
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
                const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('elements', false, this.data);
                if (imageToCloneID) {
                    await VSCode.request('clone', 'elements', imageToCloneID, id);
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
        (this.element.querySelector('.box label') as HTMLLabelElement).innerText = this.data?.label || this.parentData?.label || "";
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to open element");
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