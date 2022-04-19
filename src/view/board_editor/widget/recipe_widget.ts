

import { Recipe } from "../../../model/recipe";
import { Board } from "../board";
import { IWidgetState, Widget } from "./widget";
import html from "./recipe_widget.html";
import { VSCode } from "../vscode";
import { DictionaryComponent } from "./component/dictionary_component";
import { PickerComponent } from "./component/picker_component";
import { SlotsComponent } from "./component/slots_component";
import { InternalDeckComponent } from "./component/internal_deck_component";
import { CustomListComponent } from "./component/custom_list_component";
import { PercentageListComponent } from "./component/percentage_list_component";

export interface IRecipeWidgetState extends IWidgetState {
    xtriggerOpen: string
}

export class RecipeWidget extends Widget<Recipe, IRecipeWidgetState> {
    private slots: SlotsComponent<RecipeWidget>;
    private requirements: DictionaryComponent;
    private tablereqs: DictionaryComponent;
    private extantreqs: DictionaryComponent;
    private effects: DictionaryComponent;
    private purge: DictionaryComponent;
    private aspects: DictionaryComponent;
    private deckeffects: DictionaryComponent;
    private haltverb: DictionaryComponent;
    private deleteverb: DictionaryComponent;
    private internaldeck: InternalDeckComponent<RecipeWidget>;
    private mutations: CustomListComponent;
    private alt: CustomListComponent;
    private linked: PercentageListComponent;
    private ending: PickerComponent;

    constructor(board: Board, data: Recipe) {
        super(board, data, html, "recipe-widget");
    }

    protected onInit() {
        this.aspects = new DictionaryComponent(this.board, "aspects", "elements", this.element.querySelector('div[name="aspects"]'));
        this.aspects.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.deckeffects = new DictionaryComponent(this.board, "deckeffects", "elements", this.element.querySelector('div[name="deckeffects"]'));
        this.deckeffects.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.haltverb = new DictionaryComponent(this.board, "haltverb", "verbs", this.element.querySelector('div[name="haltverb"]'));
        this.haltverb.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.deleteverb = new DictionaryComponent(this.board, "deleteverb", "verbs", this.element.querySelector('div[name="deleteverb"]'));
        this.deleteverb.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.purge = new DictionaryComponent(this.board, "purge", "elements", this.element.querySelector('div[name="purge"]'));
        this.purge.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.effects = new DictionaryComponent(this.board, "effects", "elements", this.element.querySelector('div[name="effects"]'));
        this.effects.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.extantreqs = new DictionaryComponent(this.board, "extantreqs", "elements", this.element.querySelector('div[name="extantreqs"]'));
        this.extantreqs.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.tablereqs = new DictionaryComponent(this.board, "tablereqs", "elements", this.element.querySelector('div[name="tablereqs"]'));
        this.tablereqs.onChange = () => {
            this.save();
            this.onUpdate();
        };
        this.requirements = new DictionaryComponent(this.board, "requirements", "elements", this.element.querySelector('div[name="requirements"]'));
        this.requirements.onChange = () => {
            this.save();
            this.onUpdate();
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

        this.ending = new PickerComponent(this.board, "ending", "endings", this.element.querySelector('div[name="ending"]'));
        this.ending.onChange = () => {
            this.board.save();
            this.onUpdate();
        };

        this.internaldeck = new InternalDeckComponent(this.board, this, this.element.querySelector('div[name="internaldeck"]'));
        this.internaldeck.onChange = () => {
            this.board.save();
            this.onUpdate();
        };

        this.mutations = new CustomListComponent(this.board, "mutations", this.element.querySelector('div[name="mutations"]'));
        this.mutations.onChange = () => {
            this.board.save();
            this.onUpdate();
        };

        this.alt = new CustomListComponent(this.board, "alt", this.element.querySelector('div[name="alt"]'));
        this.alt.onChange = () => {
            this.board.save();
            this.onUpdate();
        };

        this.linked = new PercentageListComponent(this.board, "linked", this.element.querySelector('div[name="linked"]'), "recipes");
        this.linked.onChange = () => {
            this.save();
            this.onUpdate();
        };
    }

    protected async onUpdate() {
        // Fetch data
        if (this.data?.id && !this.parentData) {
            const dataParent: Recipe = await VSCode.request('entity', 'recipes', this.data.id);
            if (dataParent) this.parentData = new Recipe(dataParent);
        }
        (this.element.querySelector('.box label') as HTMLLabelElement).innerText = this.data?.id || this.parentData?.id || "";

        // Buttons
        const closeButton: HTMLElement = this.element.querySelector('.header i[close]');
        closeButton.onclick = this.notWhenDragged((e) => this.onClickClose());

        // Inputs
        this.element.querySelectorAll('input[name],textarea[name]').forEach((input: HTMLInputElement) => this.bindInput(input));

        try {
            await this.requirements?.onUpdate(this.data, this?.parentData);
            await this.tablereqs?.onUpdate(this.data, this?.parentData);
            await this.extantreqs?.onUpdate(this.data, this?.parentData);
            await this.effects?.onUpdate(this.data, this?.parentData);
            await this.purge?.onUpdate(this.data, this?.parentData);
            await this.aspects?.onUpdate(this.data, this?.parentData);
            await this.deckeffects?.onUpdate(this.data, this?.parentData);
            await this.haltverb?.onUpdate(this.data, this?.parentData);
            await this.deleteverb?.onUpdate(this.data, this?.parentData);
            await this.aspects?.onUpdate(this.data, this?.parentData);
            await this.slots.onUpdate(this.data, this?.parentData);
            await this.internaldeck.onUpdate(this.data, this?.parentData);
            await this.ending.onUpdate(this.data, this?.parentData);
            await this.mutations.onUpdate(this.data, this?.parentData);
            await this.linked.onUpdate(this.data, this?.parentData);
            await this.alt.onUpdate(this.data, this?.parentData);
            this.element.toggleAttribute('large', this.slots.size >= 3);
            this.slots.open(this?.state?.openSlot || 0);
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
                const [id, imageToCloneID] = await this.board.pickIDImageOverlay.pick('recipes', false, this.data);
                if (imageToCloneID) {
                    await VSCode.request('clone', 'recipes', imageToCloneID, id);
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
        (this.element.querySelector('.box label') as HTMLLabelElement).innerText = this.data?.id || this.parentData?.id || "";
        const icon: HTMLElement = this.element.querySelector('.icon');
        icon.setAttribute('title', this.data.id + "\n\nClick to open recipe");
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