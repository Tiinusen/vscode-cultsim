import { Entity } from "./entity";
import { Slot } from "./slot";


interface IElementSerialized {
    id: string
    label: string
    description: string
    isAspect: boolean
    icon: string
    induces: any
    decayTo: any
    verbicon: any

    isHidden: boolean
    xtriggers: any

    // Aspect Properties
    noArtNeeded: boolean

    // Card Properties
    aspects: any
    lifetime: number
    resaturate: boolean
    slots: Array<Slot>
    unique: boolean
    uniquenessgroup: any
}

export class CElement extends Entity<IElementSerialized> implements IElementSerialized {
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

    // description
    public get description(): string {
        return this.get('description');
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // isAspect
    public get isAspect(): boolean {
        return this.get('isAspect');
    }
    public set isAspect(value: boolean) {
        this.set('isAspect', value);
    }

    // icon
    public get icon(): string {
        return this.get('icon');
    }
    public set icon(value: string) {
        this.set('icon', value);
    }

    // induces
    public get induces(): string {
        return this.get('induces');
    }
    public set induces(value: string) {
        this.set('induces', value);
    }

    // decayTo
    public get decayTo(): string {
        return this.get('decayTo');
    }
    public set decayTo(value: string) {
        this.set('decayTo', value);
    }

    // verbicon
    public get verbicon(): string {
        return this.get('verbicon');
    }
    public set verbicon(value: string) {
        this.set('verbicon', value);
    }

    // isHidden
    public get isHidden(): boolean {
        return this.get('isHidden');
    }
    public set isHidden(value: boolean) {
        this.set('isHidden', value);
    }

    // noArtNeeded
    public get noArtNeeded(): boolean {
        return this.get('noArtNeeded');
    }
    public set noArtNeeded(value: boolean) {
        this.set('noArtNeeded', value);
    }

    // xtriggers
    public get xtriggers(): string {
        return this.get('xtriggers');
    }
    public set xtriggers(value: string) {
        this.set('xtriggers', value);
    }

    // aspects
    public get aspects(): string {
        return this.get('aspects');
    }
    public set aspects(value: string) {
        this.set('aspects', value);
    }

    // lifetime
    public get lifetime(): number {
        return this.get('lifetime');
    }
    public set lifetime(value: number) {
        this.set('lifetime', value);
    }

    // resaturate
    public get resaturate(): boolean {
        return this.get('resaturate');
    }
    public set resaturate(value: boolean) {
        this.set('resaturate', value);
    }

    // slots
    public get slots(): Array<Slot> {
        return this.get('slots');
    }
    public set slots(value: Array<Slot>) {
        this.set('slots', value);
    }

    // unique
    public get unique(): boolean {
        return this.get('unique');
    }
    public set unique(value: boolean) {
        this.set('unique', value);
    }

    // uniquenessgroup
    public get uniquenessgroup(): string {
        return this.get('uniquenessgroup');
    }
    public set uniquenessgroup(value: string) {
        this.set('uniquenessgroup', value);
    }

    public toJSON(): IElementSerialized | any {
        if (this.isAspect) {
            return {
                id: this.id,
                label: this.label,
                description: this.description,
                isAspect: this.isAspect,
                icon: this.icon,
                induces: this.induces,
                decayTo: this.decayTo,
                verbicon: this.verbicon,

                // Aspect Properties
                isHidden: this.isHidden,
                noArtNeeded: this.noArtNeeded,
                xtriggers: this.xtriggers,
            };
        }
        return {
            id: this.id,
            label: this.label,
            description: this.description,
            isAspect: this.isAspect,
            icon: this.icon,
            induces: this.induces,
            decayTo: this.decayTo,
            verbicon: this.verbicon,

            // Card Properties
            aspects: this.aspects,
            lifetime: this.lifetime,
            resaturate: this.resaturate,
            // slots: this?.slots?.map(slot => slot?.toJSON() || slot), // TODO: Broken
            unique: this.unique,
            uniquenessgroup: this.uniquenessgroup,
        };
    }

    public fromJSON(obj: IElementSerialized): CElement {
        this.id = obj?.id;
        this.label = obj?.label;
        this.description = obj?.description;
        this.isAspect = obj?.isAspect;
        this.icon = obj?.icon;
        this.induces = obj?.induces;
        this.decayTo = obj?.decayTo;
        this.verbicon = obj?.verbicon;

        this.isHidden = obj?.isHidden;
        this.noArtNeeded = obj?.noArtNeeded;
        this.xtriggers = obj?.xtriggers;

        this.aspects = obj?.aspects;
        this.lifetime = obj?.lifetime;
        this.resaturate = obj?.resaturate;
        this.slots = obj?.slots;
        return this;
    }
}