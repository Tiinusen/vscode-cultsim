import { Entity } from "./entity";
import { Slot } from "./slot";

interface IElementSerialized {
    id: string
    label: string
    description: string
    isAspect: boolean
    icon: string
    induces: Array<{ id: string, chance: number }>
    decayTo: string
    verbicon: string

    // Shared
    isHidden: boolean
    xtriggers: Map<string, string | Array<{ id: string, morpheffect: 'spawn' | 'mutate' | 'transform', chance: number, level: number }>>

    // Aspect Properties
    noArtNeeded: boolean

    // Card Properties
    aspects: Map<string, number>
    lifetime: number
    resaturate: boolean
    slots: Array<Slot>
    unique: boolean
    uniquenessgroup: string
}

export class CElement extends Entity<IElementSerialized> implements IElementSerialized {
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

    // description
    public get description(): string {
        return this.get('description') || "";
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // isAspect
    public get isAspect(): boolean {
        return this.get('isAspect') || false;
    }
    public set isAspect(value: boolean) {
        this.set('isAspect', value);
    }

    // icon
    public get icon(): string {
        return this.get('icon') || "";
    }
    public set icon(value: string) {
        this.set('icon', value);
    }

    // induces
    public get induces(): Array<{ id: string, chance: number }> {
        return this.get('induces');
    }
    public set induces(value: Array<{ id: string, chance: number }>) {
        this.set('induces', value);
    }

    // decayTo
    public get decayTo(): string {
        return this.get('decayTo') || "";
    }
    public set decayTo(value: string) {
        this.set('decayTo', value);
    }

    // verbicon
    public get verbicon(): string {
        return this.get('verbicon') || "";
    }
    public set verbicon(value: string) {
        this.set('verbicon', value);
    }

    // isHidden
    public get isHidden(): boolean {
        return this.get('isHidden') || false;
    }
    public set isHidden(value: boolean) {
        this.set('isHidden', value);
    }

    // noArtNeeded
    public get noArtNeeded(): boolean {
        return this.get('noArtNeeded') || false;
    }
    public set noArtNeeded(value: boolean) {
        this.set('noArtNeeded', value);
    }

    // xtriggers
    public get xtriggers(): Map<string, string | Array<{ id: string, morpheffect: 'spawn' | 'mutate' | 'transform', chance: number, level: number }>> {
        return this.get('xtriggers');
    }
    public set xtriggers(value: Map<string, string | Array<{ id: string, morpheffect: 'spawn' | 'mutate' | 'transform', chance: number, level: number }>>) {
        this.set('xtriggers', value);
    }

    // aspects
    public get aspects(): Map<string, number> {
        return this.get('aspects');
    }
    public set aspects(value: Map<string, number>) {
        this.set('aspects', value);
    }

    // lifetime
    public get lifetime(): number {
        return this.get('lifetime') || 0;
    }
    public set lifetime(value: number) {
        this.set('lifetime', value);
    }

    // resaturate
    public get resaturate(): boolean {
        return this.get('resaturate') || false;
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
        return this.get('unique') || false;
    }
    public set unique(value: boolean) {
        this.set('unique', value);
    }

    // uniquenessgroup
    public get uniquenessgroup(): string {
        return this.get('uniquenessgroup') || "";
    }
    public set uniquenessgroup(value: string) {
        this.set('uniquenessgroup', value);
    }

    public toJSON(): IElementSerialized | any {
        const xtriggers = this?.xtriggers || this.get('xtriggers') || void 0;
        if (xtriggers !== void 0) {
            for (const key in xtriggers) {
                if (Array.isArray(xtriggers[key]) && xtriggers[key].length == 1) {
                    if (!xtriggers[key][0].chance && !xtriggers[key][0].level && xtriggers[key][0].morpheffect == 'transform') {
                        xtriggers[key] = xtriggers[key][0].id;
                    }
                }
            }
        }
        if (this.isAspect) {
            return {
                id: this?.id || this.get('id'),
                label: this?.label || this.get('label'),
                description: this?.description || this.get('description'),
                isAspect: this?.isAspect || this.get('isAspect'),
                icon: this?.icon || this.get('icon'),
                induces: this?.induces || this.get('induces'),
                decayTo: this?.decayTo || this.get('decayTo'),
                verbicon: this?.verbicon || this.get('verbicon'),

                // Aspect Properties
                isHidden: this?.isHidden || this.get('isHidden'),
                noArtNeeded: this?.noArtNeeded || this.get('noArtNeeded'),
                xtriggers: xtriggers,
            };
        }
        return {
            id: this?.id || this.get('id'),
            label: this?.label || this.get('label'),
            description: this?.description || this.get('description'),
            isAspect: this?.isAspect || this.get('isAspect'),
            icon: this?.icon || this.get('icon'),
            induces: this?.induces || this.get('induces'),
            decayTo: this?.decayTo || this.get('decayTo'),
            verbicon: this?.verbicon || this.get('verbicon'),

            slots: this?.slots?.map(slot => JSON.parse(JSON.stringify(slot))),

            // Card Properties
            aspects: this?.aspects || this.get('aspects'),
            lifetime: this?.lifetime || this.get('lifetime'),
            resaturate: this?.resaturate || this.get('resaturate'),
            unique: this?.unique || this.get('unique'),
            uniquenessgroup: this?.uniquenessgroup || this.get('uniquenessgroup'),
            xtriggers: xtriggers,
        };
    }

    public fromJSON(obj: IElementSerialized): CElement {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.description = obj?.description || this.get('description');
        this.isAspect = obj?.isAspect || this.get('isAspect');
        this.icon = obj?.icon || this.get('icon');
        this.induces = obj?.induces || this.get('induces');
        this.decayTo = obj?.decayTo || this.get('decayTo');
        this.verbicon = obj?.verbicon || this.get('verbicon');

        this.isHidden = obj?.isHidden || this.get('isHidden');
        this.noArtNeeded = obj?.noArtNeeded || this.get('noArtNeeded');
        this.xtriggers = obj?.xtriggers || this.get('xtriggers');

        this.aspects = obj?.aspects || this.get('aspects');
        this.lifetime = obj?.lifetime || this.get('lifetime');
        this.resaturate = obj?.resaturate || this.get('resaturate');
        this.slots = obj?.slots || this.get('slots');
        const slots = [];
        for (const slot of (obj?.slots || this.get('slots') || [])) {
            slots.push(new Slot().fromJSON(slot));
        }
        this.slots = slots;
        return this;
    }
}