import { Entity } from "./entity";


interface ISlotSerialized {
    id: string
    label: string
    description: string
    required?: Map<string, number>
    required$add?: Map<string, number>
    required$remove?: Array<string>
    forbidden?: Map<string, number>
    forbidden$add?: Map<string, number>
    forbidden$remove?: Array<string>
    consumes: boolean
    actionId: string
    greedy: boolean
}

/**
 * 
 */
export class Slot extends Entity<ISlotSerialized> implements ISlotSerialized {
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

    // required
    public get required(): Map<string, number> {
        return this.get('required');
    }
    public set required(value: Map<string, number>) {
        this.set('required', value);
    }

    // required$add
    public get required$add(): Map<string, number> {
        return this.get('required$add');
    }
    public set required$add(value: Map<string, number>) {
        this.set('required$add', value);
    }

    // required$remove
    public get required$remove(): Array<string> {
        return this.get('required$remove');
    }
    public set required$remove(value: Array<string>) {
        this.set('required$remove', value);
    }

    // forbidden
    public get forbidden(): Map<string, number> {
        return this.get('forbidden');
    }
    public set forbidden(value: Map<string, number>) {
        this.set('forbidden', value);
    }

    // forbidden$add
    public get forbidden$add(): Map<string, number> {
        return this.get('forbidden$add');
    }
    public set forbidden$add(value: Map<string, number>) {
        this.set('forbidden$add', value);
    }

    // forbidden$remove
    public get forbidden$remove(): Array<string> {
        return this.get('forbidden$remove');
    }
    public set forbidden$remove(value: Array<string>) {
        this.set('forbidden$remove', value);
    }

    // consumes
    public get consumes(): boolean {
        return this.get('consumes') || false;
    }
    public set consumes(value: boolean) {
        this.set('consumes', value);
    }

    // actionId
    public get actionId(): string {
        return this.get('actionId') || "";
    }
    public set actionId(value: string) {
        this.set('actionId', value);
    }

    // greedy
    public get greedy(): boolean {
        return this.get('greedy') || false;
    }
    public set greedy(value: boolean) {
        this.set('greedy', value);
    }

    public toJSON(): ISlotSerialized {
        return {
            id: this.get('id'),
            label: this.get('label'),
            description: this.get('description'),
            required: this.get('required'),
            required$add: this.get('required') ? void 0 : this.get('required$add'),
            required$remove: this.get('required') ? void 0 : this.get('required$remove'),
            forbidden: this.get('forbidden'),
            forbidden$add: this.get('forbidden') ? void 0 : this.get('forbidden$add'),
            forbidden$remove: this.get('forbidden') ? void 0 : this.get('forbidden$remove'),
            consumes: this.get('consumes'),
            actionId: this.get('actionId'),
            greedy: this.get('greedy'),
        };
    }

    public fromJSON(obj: ISlotSerialized): Slot {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.description = obj?.description || this.get('description');
        this.required = obj?.required || this.get('required');
        this.required$add = obj?.required$add || this.get('required$add');
        this.required$remove = obj?.required$remove || this.get('required$remove');
        this.forbidden = obj?.forbidden || this.get('forbidden');
        this.forbidden$add = obj?.forbidden$add || this.get('forbidden$add');
        this.forbidden$remove = obj?.forbidden$remove || this.get('forbidden$remove');
        this.consumes = obj?.consumes || this.get('consumes');
        this.actionId = obj?.actionId || this.get('actionId');
        this.greedy = obj?.greedy || this.get('greedy');
        return this;
    }
}