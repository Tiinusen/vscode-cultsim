import { Entity } from "./entity";
import { InternalDeck } from "./internal_deck";
import { Slot } from "./slot";


interface IRecipeSerialized {
    id: string
    label: string
    maxexecutions: number
    warmup: number
    craftable: boolean
    hintonly: boolean
    signalimportantloop: boolean
    slots: Array<Slot>
    startdescription: string
    description: string
    requirements: Map<string, number>
    tablereqs: Map<string, number>
    extantreqs: Map<string, number>
    effects: Map<string, number>
    purge: Map<string, number>
    aspects: Map<string, number>
    deckeffects: Map<string, number>
    actionId: string
    ending: string
    signalEndingFlavour: string
    burnimage: string
    portaleffect: string
    internaldeck: InternalDeck
    // TODO: Deal with these ...
    mutations: Array<{ filter: string, mutate: string, level: number, additive: boolean }>
    alt: Array<{ id: string, chance: number, additional: boolean, expulsion: { limit: number, filter: Map<string, number> } }>
    linked: Array<{ id: string, chance: number }>
}

/**
 * 
 */
export class Recipe extends Entity<IRecipeSerialized> implements IRecipeSerialized {
    // id
    public get id(): string {
        return this.get('id') || "";
    }
    public set id(value: string) {
        this.set('id', value);
    }

    // label
    public get label(): string {
        return this.get('label') || "";
    }
    public set label(value: string) {
        this.set('label', value);
    }

    // maxexecutions
    public get maxexecutions(): number {
        return this.get('maxexecutions') || 0;
    }
    public set maxexecutions(value: number) {
        this.set('maxexecutions', value);
    }

    // warmup
    public get warmup(): number {
        return this.get('warmup') || 0;
    }
    public set warmup(value: number) {
        this.set('warmup', value);
    }

    // craftable
    public get craftable(): boolean {
        return this.get('craftable') || false;
    }
    public set craftable(value: boolean) {
        this.set('craftable', value);
    }

    // hintonly
    public get hintonly(): boolean {
        return this.get('hintonly') || false;
    }
    public set hintonly(value: boolean) {
        this.set('hintonly', value);
    }

    // signalimportantloop
    public get signalimportantloop(): boolean {
        return this.get('signalimportantloop') || false;
    }
    public set signalimportantloop(value: boolean) {
        this.set('signalimportantloop', value);
    }

    // internaldeck
    public get internaldeck(): InternalDeck {
        return this.get('internaldeck') || this.set('internaldeck', new InternalDeck()).internaldeck;
    }
    public set internaldeck(value: InternalDeck) {
        this.set('internaldeck', value);
    }

    // slots
    public get slots(): Array<Slot> {
        return this.get('slots');
    }
    public set slots(value: Array<Slot>) {
        this.set('slots', value);
    }

    // startdescription
    public get startdescription(): string {
        return this.get('startdescription') || "";
    }
    public set startdescription(value: string) {
        this.set('startdescription', value);
    }

    // description
    public get description(): string {
        return this.get('description') || "";
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // requirements
    public get requirements(): Map<string, number> {
        return this.get('requirements');
    }
    public set requirements(value: Map<string, number>) {
        this.set('requirements', value);
    }

    // tablereqs
    public get tablereqs(): Map<string, number> {
        return this.get('tablereqs');
    }
    public set tablereqs(value: Map<string, number>) {
        this.set('tablereqs', value);
    }

    // extantreqs
    public get extantreqs(): Map<string, number> {
        return this.get('extantreqs');
    }
    public set extantreqs(value: Map<string, number>) {
        this.set('extantreqs', value);
    }

    // effects
    public get effects(): Map<string, number> {
        return this.get('effects');
    }
    public set effects(value: Map<string, number>) {
        this.set('effects', value);
    }

    // purge
    public get purge(): Map<string, number> {
        return this.get('purge');
    }
    public set purge(value: Map<string, number>) {
        this.set('purge', value);
    }

    // aspects
    public get aspects(): Map<string, number> {
        return this.get('aspects');
    }
    public set aspects(value: Map<string, number>) {
        this.set('aspects', value);
    }

    // deckeffects
    public get deckeffects(): Map<string, number> {
        return this.get('deckeffects');
    }
    public set deckeffects(value: Map<string, number>) {
        this.set('deckeffects', value);
    }

    // actionId
    public get actionId(): string {
        return this.get('actionId') || "";
    }
    public set actionId(value: string) {
        this.set('actionId', value);
    }

    // ending
    public get ending(): string {
        return this.get('ending') || "";
    }
    public set ending(value: string) {
        this.set('ending', value);
    }

    // signalEndingFlavour
    public get signalEndingFlavour(): string {
        return this.get('signalEndingFlavour') || "";
    }
    public set signalEndingFlavour(value: string) {
        this.set('signalEndingFlavour', value);
    }

    // burnimage
    public get burnimage(): string {
        return this.get('burnimage') || "";
    }
    public set burnimage(value: string) {
        this.set('burnimage', value);
    }

    // portaleffect
    public get portaleffect(): string {
        return this.get('portaleffect') || "";
    }
    public set portaleffect(value: string) {
        this.set('portaleffect', value);
    }

    // mutations
    public get mutations(): Array<{ filter: string, mutate: string, level: number, additive: boolean }> {
        return this.get('mutations');
    }
    public set mutations(value: Array<{ filter: string, mutate: string, level: number, additive: boolean }>) {
        this.set('mutations', value);
    }

    // alt
    public get alt(): Array<{ id: string, chance: number, additional: boolean, expulsion: { limit: number, filter: Map<string, number> } }> {
        return this.get('alt');
    }
    public set alt(value: Array<{ id: string, chance: number, additional: boolean, expulsion: { limit: number, filter: Map<string, number> } }>) {
        this.set('alt', value);
    }

    // linked
    public get linked(): Array<{ id: string, chance: number }> {
        return this.get('linked');
    }
    public set linked(value: Array<{ id: string, chance: number }>) {
        this.set('linked', value);
    }


    public toJSON(): IRecipeSerialized | any {
        return {
            id: this.get('id'),
            label: this.get('label'),
            maxexecutions: this.get('maxexecutions'),
            warmup: this.get('warmup'),
            craftable: this.get('craftable'),
            hintonly: this.get('hintonly'),
            signalimportantloop: this.get('signalimportantloop'),
            internaldeck: this.get('internaldeck'),
            slots: this?.slots?.map(slot => JSON.parse(JSON.stringify(slot))),
            startdescription: this.get('startdescription'),
            description: this.get('description'),
            requirements: this.get('requirements'),
            tablereqs: this.get('tablereqs'),
            extantreqs: this.get('extantreqs'),
            effects: this.get('effects'),
            purge: this.get('purge'),
            aspects: this.get('aspects'),
            deckeffects: this.get('deckeffects'),
            actionId: this.get('actionId'),
            ending: this.get('ending'),
            signalEndingFlavour: this.get('signalEndingFlavour'),
            burnimage: this.get('burnimage'),
            portaleffect: this.get('portaleffect'),
            mutations: this.get('mutations'),
            alt: this.get('alt'),
            linked: this.get('linked'),
        };
    }

    public fromJSON(obj: IRecipeSerialized): Recipe {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.maxexecutions = obj?.maxexecutions || this.get('maxexecutions');
        this.warmup = obj?.warmup || this.get('warmup');
        this.craftable = obj?.craftable || this.get('craftable');
        this.hintonly = obj?.hintonly || this.get('hintonly');
        this.signalimportantloop = obj?.signalimportantloop || this.get('signalimportantloop');
        this.internaldeck = obj?.internaldeck ? this.internaldeck.fromJSON(obj.internaldeck) : this.get('internaldeck');
        this.slots = obj?.slots || this.get('slots');
        this.startdescription = obj?.startdescription || this.get('startdescription');
        this.description = obj?.description || this.get('description');
        this.requirements = obj?.requirements || this.get('requirements');
        this.tablereqs = obj?.tablereqs || this.get('tablereqs');
        this.extantreqs = obj?.extantreqs || this.get('extantreqs');
        this.effects = obj?.effects || this.get('effects');
        this.purge = obj?.purge || this.get('purge');
        this.aspects = obj?.aspects || this.get('aspects');
        this.deckeffects = obj?.deckeffects || this.get('deckeffects');
        this.actionId = obj?.actionId || this.get('actionId');
        this.ending = obj?.ending || this.get('ending');
        this.signalEndingFlavour = obj?.signalEndingFlavour || this.get('signalEndingFlavour');
        this.burnimage = obj?.burnimage || this.get('burnimage');
        this.portaleffect = obj?.portaleffect || this.get('portaleffect');
        this.mutations = obj?.mutations || this.get('mutations');
        this.alt = obj?.alt || this.get('alt');
        this.linked = obj?.linked || this.get('linked');
        return this;
    }
}