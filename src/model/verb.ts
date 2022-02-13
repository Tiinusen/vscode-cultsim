import { Entity } from "./entity";
import { Slot } from "./slot";


interface IVerbSerialized {
    id: string
    label: string
    description: string
    slot: Slot
}

/**
 * 
 */
export class Verb extends Entity implements IVerbSerialized {

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

    // slot
    public get slot(): Slot {
        return this.get('slot');
    }
    public set slot(value: Slot) {
        this.set('slot', value);
    }


    public toJSON(): IVerbSerialized | any {
        console.log(this);
        return {
            id: this.id,
            label: this.label,
            description: this.description,
            slot: this.slot,
        };
    }

    public fromJSON(obj: IVerbSerialized) {
        this.id = obj?.id;
        this.label = obj?.label;
        this.description = obj?.description;
        this.slot = obj?.slot;
    }
}