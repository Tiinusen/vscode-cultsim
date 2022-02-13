import { Entity } from "./entity";
import { Slot } from "./slot";


interface IRecipeSerialized {
    id: string
    label: string
    maxexecutions: number
    warmup: number
    craftable: boolean
    hintonly: boolean
    signalimportantloop: boolean
    internaldeck: boolean
    slots: Array<Slot>
    startdescription: string
    description: string
    requirements: any
    tablereqs: any
    extantreqs: any
    effects: any
    purge: any
    aspects: any
    deckeffects: any
    actionId: string
    ending: string
    signalEndingFlavour: string
    burnimage: string
    portaleffect: any
    mutations: any
    alt: any
    linked: any
    // Halt Verb?
    // Delete Verb?
}

/**
 * 
 */
export class Recipe extends Entity implements IRecipeSerialized {
    // id
    public get id(): string {
        return this.get('id');
    }
    public set id(value: string) {
        this.set('id', value);
    }

    // label
    public get label(): string {
        return this.get('label');
    }
    public set label(value: string) {
        this.set('label', value);
    }

    // maxexecutions
    public get maxexecutions(): number {
        return this.get('maxexecutions');
    }
    public set maxexecutions(value: number) {
        this.set('maxexecutions', value);
    }

    // warmup
    public get warmup(): number {
        return this.get('warmup');
    }
    public set warmup(value: number) {
        this.set('warmup', value);
    }

    // craftable
    public get craftable(): boolean {
        return this.get('craftable');
    }
    public set craftable(value: boolean) {
        this.set('craftable', value);
    }

    // hintonly
    public get hintonly(): boolean {
        return this.get('hintonly');
    }
    public set hintonly(value: boolean) {
        this.set('hintonly', value);
    }

    // signalimportantloop
    public get signalimportantloop(): boolean {
        return this.get('signalimportantloop');
    }
    public set signalimportantloop(value: boolean) {
        this.set('signalimportantloop', value);
    }

    // internaldeck
    public get internaldeck(): boolean {
        return this.get('internaldeck');
    }
    public set internaldeck(value: boolean) {
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
        return this.get('startdescription');
    }
    public set startdescription(value: string) {
        this.set('startdescription', value);
    }

    // description
    public get description(): string {
        return this.get('description');
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // requirements
    public get requirements(): string {
        return this.get('requirements');
    }
    public set requirements(value: string) {
        this.set('requirements', value);
    }

    // tablereqs
    public get tablereqs(): string {
        return this.get('tablereqs');
    }
    public set tablereqs(value: string) {
        this.set('tablereqs', value);
    }

    // extantreqs
    public get extantreqs(): string {
        return this.get('extantreqs');
    }
    public set extantreqs(value: string) {
        this.set('extantreqs', value);
    }

    // effects
    public get effects(): string {
        return this.get('effects');
    }
    public set effects(value: string) {
        this.set('effects', value);
    }

    // purge
    public get purge(): string {
        return this.get('purge');
    }
    public set purge(value: string) {
        this.set('purge', value);
    }

    // aspects
    public get aspects(): string {
        return this.get('aspects');
    }
    public set aspects(value: string) {
        this.set('aspects', value);
    }

    // deckeffects
    public get deckeffects(): string {
        return this.get('deckeffects');
    }
    public set deckeffects(value: string) {
        this.set('deckeffects', value);
    }

    // actionId
    public get actionId(): string {
        return this.get('actionId');
    }
    public set actionId(value: string) {
        this.set('actionId', value);
    }

    // ending
    public get ending(): string {
        return this.get('ending');
    }
    public set ending(value: string) {
        this.set('ending', value);
    }

    // signalEndingFlavour
    public get signalEndingFlavour(): string {
        return this.get('signalEndingFlavour');
    }
    public set signalEndingFlavour(value: string) {
        this.set('signalEndingFlavour', value);
    }

    // burnimage
    public get burnimage(): string {
        return this.get('burnimage');
    }
    public set burnimage(value: string) {
        this.set('burnimage', value);
    }

    // portaleffect
    public get portaleffect(): string {
        return this.get('portaleffect');
    }
    public set portaleffect(value: string) {
        this.set('portaleffect', value);
    }

    // mutations
    public get mutations(): string {
        return this.get('mutations');
    }
    public set mutations(value: string) {
        this.set('mutations', value);
    }

    // alt
    public get alt(): string {
        return this.get('alt');
    }
    public set alt(value: string) {
        this.set('alt', value);
    }

    // linked
    public get linked(): string {
        return this.get('linked');
    }
    public set linked(value: string) {
        this.set('linked', value);
    }


    public toJSON(): IRecipeSerialized | any {
        return {
            id: this.id,
            label: this.label,
            maxexecutions: this.maxexecutions,
            warmup: this.warmup,
            craftable: this.craftable,
            hintonly: this.hintonly,
            signalimportantloop: this.signalimportantloop,
            internaldeck: this.internaldeck,
            slots: this.slots.map(slot => slot.toJSON()),
            startdescription: this.startdescription,
            description: this.description,
            requirements: this.requirements,
            tablereqs: this.tablereqs,
            extantreqs: this.extantreqs,
            effects: this.effects,
            purge: this.purge,
            aspects: this.aspects,
            deckeffects: this.deckeffects,
            actionId: this.actionId,
            ending: this.ending,
            signalEndingFlavour: this.signalEndingFlavour,
            burnimage: this.burnimage,
            portaleffect: this.portaleffect,
            mutations: this.mutations,
            alt: this.alt,
            linked: this.linked,
        };
    }

    public fromJSON(obj: IRecipeSerialized) {
        this.id = obj?.id;
        this.label = obj?.label;
        this.maxexecutions = obj?.maxexecutions;
        this.warmup = obj?.warmup;
        this.craftable = obj?.craftable;
        this.hintonly = obj?.hintonly;
        this.signalimportantloop = obj?.signalimportantloop;
        this.internaldeck = obj?.internaldeck;
        this.slots = obj?.slots;
        this.startdescription = obj?.startdescription;
        this.description = obj?.description;
        this.requirements = obj?.requirements;
        this.tablereqs = obj?.tablereqs;
        this.extantreqs = obj?.extantreqs;
        this.effects = obj?.effects;
        this.purge = obj?.purge;
        this.aspects = obj?.aspects;
        this.deckeffects = obj?.deckeffects;
        this.actionId = obj?.actionId;
        this.ending = obj?.ending;
        this.signalEndingFlavour = obj?.signalEndingFlavour;
        this.burnimage = obj?.burnimage;
        this.portaleffect = obj?.portaleffect;
        this.mutations = obj?.mutations;
        this.alt = obj?.alt;
        this.linked = obj?.linked;
    }
}