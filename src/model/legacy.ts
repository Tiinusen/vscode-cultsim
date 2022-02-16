import { Entity } from "./entity";
import { Slot } from "./slot";


interface ILegacySerialized {
    id: string
    label: string
    image: string
    startingVerbId: string
    description: string
    startdescription: string
    statusbarelements: Array<string>
    effects: Map<string, number>
    excludesOnEnding: any
    newstart: boolean
    fromEnding: string
    availableWithoutEndingMatch: boolean
}

/**
 * 
 */
export class Legacy extends Entity<ILegacySerialized> implements ILegacySerialized {
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

    // image
    public get image(): string {
        return this.get('image');
    }
    public set image(value: string) {
        this.set('image', value);
    }

    // startingVerbId
    public get startingVerbId(): string {
        return this.get('startingVerbId');
    }
    public set startingVerbId(value: string) {
        this.set('startingVerbId', value);
    }

    // description
    public get description(): string {
        return this.get('description');
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // startdescription
    public get startdescription(): string {
        return this.get('startdescription');
    }
    public set startdescription(value: string) {
        this.set('startdescription', value);
    }

    // statusbarelements
    public get statusbarelements(): string[] {
        return this.get('statusbarelements');
    }
    public set statusbarelements(value: string[]) {
        this.set('statusbarelements', value);
    }

    // effects
    public get effects(): Map<string, number> {
        return this.get('effects');
    }
    public set effects(value: Map<string, number>) {
        this.set('effects', value);
    }

    // excludesOnEnding
    public get excludesOnEnding(): string {
        return this.get('excludesOnEnding');
    }
    public set excludesOnEnding(value: string) {
        this.set('excludesOnEnding', value);
    }

    // newstart
    public get newstart(): boolean {
        return this.get('newstart');
    }
    public set newstart(value: boolean) {
        this.set('newstart', value);
    }

    // fromEnding
    public get fromEnding(): string {
        return this.get('fromEnding');
    }
    public set fromEnding(value: string) {
        this.set('fromEnding', value);
    }

    // availableWithoutEndingMatch
    public get availableWithoutEndingMatch(): boolean {
        return this.get('availableWithoutEndingMatch');
    }
    public set availableWithoutEndingMatch(value: boolean) {
        this.set('availableWithoutEndingMatch', value);
    }


    public toJSON(): ILegacySerialized | any {
        return {
            id: this.get('id'),
            label: this.get('label'),
            image: this.get('image'),
            startingVerbId: this.get('startingVerbId'),
            description: this.get('description'),
            startdescription: this.get('startdescription'),
            statusbarelements: this.get('statusbarelements'),
            effects: this.get('effects'),
            excludesOnEnding: this.get('excludesOnEnding'),
            newstart: this.get('newstart'),
            fromEnding: this.get('fromEnding'),
            availableWithoutEndingMatch: this.get('availableWithoutEndingMatch')
        };
    }

    public fromJSON(obj: ILegacySerialized): Legacy {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.image = obj?.image || this.get('image');
        this.startingVerbId = obj?.startingVerbId || this.get('startingVerbId');
        this.description = obj?.description || this.get('description');
        this.startdescription = obj?.startdescription || this.get('startdescription');
        this.statusbarelements = obj?.statusbarelements || this.get('statusbarelements');
        this.effects = obj?.effects || this.get('effects');
        this.excludesOnEnding = obj?.excludesOnEnding || this.get('excludesOnEnding');
        this.newstart = obj?.newstart || this.get('newstart');
        this.fromEnding = obj?.fromEnding || this.get('fromEnding');
        this.availableWithoutEndingMatch = obj?.availableWithoutEndingMatch || this.get('availableWithoutEndingMatch');
        return this;
    }
}