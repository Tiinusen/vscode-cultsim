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
export class Legacy extends Entity implements ILegacySerialized {
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
            id: this.id,
            label: this.label,
            image: this.image,
            startingVerbId: this.startingVerbId,
            description: this.description,
            startdescription: this.startdescription,
            statusbarelements: this.statusbarelements,
            effects: this.effects,
            excludesOnEnding: this.excludesOnEnding,
            newstart: this.newstart,
            fromEnding: this.fromEnding,
            availableWithoutEndingMatch: this.availableWithoutEndingMatch
        };
    }

    public fromJSON(obj: ILegacySerialized) {
        this.id = obj?.id;
        this.label = obj?.label;
        this.image = obj?.image;
        this.startingVerbId = obj?.startingVerbId;
        this.description = obj?.description;
        this.startdescription = obj?.startdescription;
        this.statusbarelements = obj?.statusbarelements;
        this.effects = obj?.effects;
        this.excludesOnEnding = obj?.excludesOnEnding;
        this.newstart = obj?.newstart;
        this.fromEnding = obj?.fromEnding;
        this.availableWithoutEndingMatch = obj?.availableWithoutEndingMatch;
    }
}