import { Entity } from "./entity";


interface ISlotSerialized {
    id: string
    label: string
    description: string
    required: Map<string, number>
    forbidden: Map<string, number>
    consumes: boolean
    actionId: string
    greedy: boolean
}

/**
 * 
 */
export class Slot extends Entity implements ISlotSerialized {
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

    // required
    public get required(): Map<string, number> {
        return this.get('required');
    }
    public set required(value: Map<string, number>) {
        this.set('required', value);
    }

    // forbidden
    public get forbidden(): Map<string, number> {
        return this.get('forbidden');
    }
    public set forbidden(value: Map<string, number>) {
        this.set('forbidden', value);
    }

    // consumes
    public get consumes(): boolean {
        return this.get('consumes');
    }
    public set consumes(value: boolean) {
        this.set('consumes', value);
    }

    // actionId
    public get actionId(): string {
        return this.get('actionId');
    }
    public set actionId(value: string) {
        this.set('actionId', value);
    }

    // greedy
    public get greedy(): boolean {
        return this.get('greedy');
    }
    public set greedy(value: boolean) {
        this.set('greedy', value);
    }

    public toJSON(): ISlotSerialized {
        return {
            id: this.id,
            label: this.label,
            description: this.description,
            required: this.required,
            forbidden: this.forbidden,
            consumes: this.consumes,
            actionId: this.actionId,
            greedy: this.greedy,
        };
    }

    public fromJSON(obj: ISlotSerialized) {
        this.id = obj?.id;
        this.label = obj?.label;
        this.description = obj?.description;
        this.required = obj?.required;
        this.forbidden = obj?.forbidden;
        this.consumes = obj?.consumes;
        this.actionId = obj?.actionId;
        this.greedy = obj?.greedy;
    }
}