

import { Ending } from "../../../model/ending";
import { Board } from "../board";
import { IWidgetState, Widget } from "./widget";
import html from "./ending_widget.html";
import { VSCode } from "../vscode";
import { DictionaryComponent } from "./component/dictionary_component";
import { ListComponent } from "./component/list_component";
import { PickerComponent } from "./component/picker_component";

export interface IEndingWidgetState extends IWidgetState {
    slotOpen: boolean
}

export class EndingWidget extends Widget<Ending, IEndingWidgetState> {
    private icon: HTMLImageElement;
    private lastIconFetch?: number;

    constructor(board: Board, data: Ending) {
        super(board, data, html, "ending-widget");
    }

    protected onInit() {
        //
    }

    private setImage(imageURL: string) {
        this.icon.onerror = () => this.icon.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        if (imageURL.indexOf('frangiclave') === -1) imageURL + "?" + (Math.random() * 100);
        this.icon.setAttribute('src', imageURL);
    }

    protected async onUpdate() {
        // Fetch data
        if (this.data?.id && !this.parentData) {
            const dataParent: Ending = await VSCode.request('entity', 'endings', this.data.id);
            if (dataParent) this.parentData = new Ending(dataParent);
        }

        // Icon
        this.icon = this.element.querySelector('.icon');
        if (!this.lastIconFetch || (this.lastIconFetch + 5 * 1000) < new Date().getTime()) {
            this.lastIconFetch = new Date().getTime();
            this.setImage(await VSCode.request('image', 'endings', this.data?.image || this.parentData?.image || this.data?.id));
        }

        // Buttons
        const closeButton: HTMLElement = this.element.querySelector('.header i[close]');
        closeButton.onclick = this.notWhenDragged((e) => this.onClickClose());

        // Inputs
        this.element.querySelectorAll('input[name],textarea[name],select[name]').forEach((input: HTMLInputElement) => this.bindInput(input));
    }

    protected onClickClose() {
        this.close();
    }

    protected onOpen() {
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to edit ID or image");
        icon.onclick = this.notWhenDragged(async (e) => {
            try {
                const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('endings', false, this.data);
                if (imageToCloneID) {
                    await VSCode.request('clone', 'endings', imageToCloneID, id);
                    VSCode.emitInfo(`Image has successfully been added to your workspace`);
                    this.data.image = id;
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
        icon.setAttribute('title', this.data.id + "\n\nClick to open ending");
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