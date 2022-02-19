

import { Legacy } from "../../../model/legacy";
import { Board } from "../board";
import { IWidgetState, Widget } from "./widget";
import html from "./legacy_widget.html";
import { VSCode } from "../vscode";
import { DictionaryComponent } from "./component/dictionary_component";
import { ListComponent } from "./component/list_component";

export interface ILegacyWidgetState extends IWidgetState {
    slotOpen: boolean
}

export class LegacyWidget extends Widget<Legacy, ILegacyWidgetState> {
    private icon: HTMLImageElement;
    private lastIconFetch?: number;
    private statusbarelements: ListComponent;
    private effects: DictionaryComponent;
    private excludesOnEnding: ListComponent;

    constructor(board: Board, data: Legacy) {
        super(board, data, html, "legacy-widget");
    }

    protected onInit() {
        this.statusbarelements = new ListComponent(this.board, "statusbarelements", "elements", this.element.querySelector('div[name="statusbarelements"]'));
        this.statusbarelements.onChange = () => {
            this.board.save();
            this.onUpdate();
        };
        this.effects = new DictionaryComponent(this.board, "effects", "elements", this.element.querySelector('div[name="effects"]'));
        this.effects.onChange = () => {
            this.board.save();
            this.onUpdate();
        };
        this.excludesOnEnding = new ListComponent(this.board, "excludesOnEnding", "legacies", this.element.querySelector('div[name="excludesOnEnding"]'));
        this.excludesOnEnding.onChange = () => {
            this.board.save();
            this.onUpdate();
        };
    }

    private setImage(imageURL: string) {
        this.icon.onerror = () => this.icon.src = 'https://www.frangiclave.net/static/images/icons40/aspects/_x.png';
        this.icon.setAttribute('src', imageURL + "?" + (Math.random() * 100));
    }

    protected async onUpdate() {
        // Fetch data
        if (this.data?.id && !this.parentData) {
            const dataParent: Legacy = await VSCode.request('entity', 'legacies', this.data.id);
            if (dataParent) this.parentData = new Legacy(dataParent);
        }

        // Icon
        this.icon = this.element.querySelector('.icon');
        if (!this.lastIconFetch || (this.lastIconFetch + 5 * 1000) < new Date().getTime()) {
            this.lastIconFetch = new Date().getTime();
            this.setImage(await VSCode.request('image', 'legacies', this.data?.image || this.parentData?.image || this.data?.id));
        }

        // Buttons
        const closeButton: HTMLElement = this.element.querySelector('.header i[close]');
        closeButton.onclick = this.notWhenDragged((e) => this.onClickClose());

        // Inputs
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => this.bindInput(input));

        try {
            await this.statusbarelements?.onUpdate(this.data, this?.parentData);
            await this.effects?.onUpdate(this.data, this?.parentData);
            await this.excludesOnEnding?.onUpdate(this.data, this?.parentData);
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
                const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('legacies', false, this.data);
                if (imageToCloneID) {
                    await VSCode.request('clone', 'legacies', imageToCloneID, id);
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
        icon.setAttribute('title', this.data.id + "\n\nClick to open legacy");
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