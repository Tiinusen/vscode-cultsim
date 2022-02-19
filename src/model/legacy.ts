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
    statusbarelements$append: Array<string>
    statusbarelements$prepend: Array<string>
    statusbarelements$remove: Array<string>
    effects: Map<string, number>
    effects$add: Map<string, number>
    effects$remove: Array<string>
    excludesOnEnding: Array<string>
    excludesOnEnding$append: Array<string>
    excludesOnEnding$prepend: Array<string>
    excludesOnEnding$remove: Array<string>
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

    // image
    public get image(): string {
        return this.get('image') || "";
    }
    public set image(value: string) {
        this.set('image', value);
    }

    // startingVerbId
    public get startingVerbId(): string {
        return this.get('startingVerbId') || "";
    }
    public set startingVerbId(value: string) {
        this.set('startingVerbId', value);
    }

    // description
    public get description(): string {
        return this.get('description') || "";
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // startdescription
    public get startdescription(): string {
        return this.get('startdescription') || "";
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

    // statusbarelements$append
    public get statusbarelements$append(): string[] {
        return this.get('statusbarelements$append');
    }
    public set statusbarelements$append(value: string[]) {
        this.set('statusbarelements$append', value);
    }

    // statusbarelements$prepend
    public get statusbarelements$prepend(): string[] {
        return this.get('statusbarelements$prepend');
    }
    public set statusbarelements$prepend(value: string[]) {
        this.set('statusbarelements$prepend', value);
    }

    // statusbarelements$remove
    public get statusbarelements$remove(): string[] {
        return this.get('statusbarelements$remove');
    }
    public set statusbarelements$remove(value: string[]) {
        this.set('statusbarelements$remove', value);
    }

    // effects
    public get effects(): Map<string, number> {
        return this.get('effects');
    }
    public set effects(value: Map<string, number>) {
        this.set('effects', value);
    }

    // effects$add
    public get effects$add(): Map<string, number> {
        return this.get('effects$add');
    }
    public set effects$add(value: Map<string, number>) {
        this.set('effects$add', value);
    }

    // effects$remove
    public get effects$remove(): Array<string> {
        return this.get('effects$remove');
    }
    public set effects$remove(value: Array<string>) {
        this.set('effects$remove', value);
    }

    // excludesOnEnding
    public get excludesOnEnding(): Array<string> {
        return this.get('excludesOnEnding');
    }
    public set excludesOnEnding(value: Array<string>) {
        this.set('excludesOnEnding', value);
    }

    // excludesOnEnding$append
    public get excludesOnEnding$append(): string[] {
        return this.get('excludesOnEnding$append');
    }
    public set excludesOnEnding$append(value: string[]) {
        this.set('excludesOnEnding$append', value);
    }

    // excludesOnEnding$prepend
    public get excludesOnEnding$prepend(): string[] {
        return this.get('excludesOnEnding$prepend');
    }
    public set excludesOnEnding$prepend(value: string[]) {
        this.set('excludesOnEnding$prepend', value);
    }

    // excludesOnEnding$remove
    public get excludesOnEnding$remove(): string[] {
        return this.get('excludesOnEnding$remove');
    }
    public set excludesOnEnding$remove(value: string[]) {
        this.set('excludesOnEnding$remove', value);
    }

    // newstart
    public get newstart(): boolean {
        return this.get('newstart') || false;
    }
    public set newstart(value: boolean) {
        this.set('newstart', value);
    }

    // fromEnding
    public get fromEnding(): string {
        return this.get('fromEnding') || "";
    }
    public set fromEnding(value: string) {
        this.set('fromEnding', value);
    }

    // availableWithoutEndingMatch
    public get availableWithoutEndingMatch(): boolean {
        return this.get('availableWithoutEndingMatch') || false;
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
            statusbarelements: !this.get('statusbarelements') ? void 0 : this.get('statusbarelements'),
            statusbarelements$append: this.get('statusbarelements') ? void 0 : this.get('statusbarelements$append'),
            statusbarelements$prepend: this.get('statusbarelements') ? void 0 : this.get('statusbarelements$prepend'),
            statusbarelements$remove: this.get('statusbarelements') ? void 0 : this.get('statusbarelements$remove'),
            effects: !this.get('effects') ? void 0 : this.get('effects'),
            effects$add: this.get('effects') ? void 0 : this.get('effects$add'),
            effects$remove: this.get('effects') ? void 0 : this.get('effects$remove'),
            excludesOnEnding: !this.get('excludesOnEnding') ? void 0 : this.get('excludesOnEnding'),
            excludesOnEnding$append: this.get('excludesOnEnding') ? void 0 : this.get('excludesOnEnding$append'),
            excludesOnEnding$prepend: this.get('excludesOnEnding') ? void 0 : this.get('excludesOnEnding$prepend'),
            excludesOnEnding$remove: this.get('excludesOnEnding') ? void 0 : this.get('excludesOnEnding$remove'),
            newstart: this.get('newstart'),
            fromEnding: !this.get('fromEnding') ? void 0 : this.get('fromEnding'),
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
        this.statusbarelements$append = obj?.statusbarelements$append || this.get('statusbarelements$append');
        this.statusbarelements$prepend = obj?.statusbarelements$prepend || this.get('statusbarelements$prepend');
        this.statusbarelements$remove = obj?.statusbarelements$remove || this.get('statusbarelements$remove');
        this.effects = obj?.effects || this.get('effects');
        this.effects$add = obj?.effects$add || this.get('effects$add');
        this.effects$remove = obj?.effects$remove || this.get('effects$remove');
        this.excludesOnEnding = obj?.excludesOnEnding || this.get('excludesOnEnding');
        this.excludesOnEnding$append = obj?.excludesOnEnding$append || this.get('excludesOnEnding$append');
        this.excludesOnEnding$prepend = obj?.excludesOnEnding$prepend || this.get('excludesOnEnding$prepend');
        this.excludesOnEnding$remove = obj?.excludesOnEnding$remove || this.get('excludesOnEnding$remove');
        this.newstart = obj?.newstart || this.get('newstart');
        this.fromEnding = obj?.fromEnding || this.get('fromEnding');
        this.availableWithoutEndingMatch = obj?.availableWithoutEndingMatch || this.get('availableWithoutEndingMatch');
        return this;
    }
}