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
export class Verb extends Entity<IVerbSerialized> implements IVerbSerialized {
    // id
    public get id(): string {
        return this.get('id') || "";
    }
    public set id(value: string) {
        this.set('id', value);
        this.slot.id = value;
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

    // slot
    public get slot(): Slot {
        return this.get('slot') || this.set('slot', new Slot());
    }
    public set slot(value: Slot) {
        this.set('slot', value);
    }


    public toJSON(): IVerbSerialized | any {
        return {
            id: this.get('id'),
            label: this.get('label'),
            description: this.get('description'),
            slot: this.get('slot'),
        };
    }

    public fromJSON(obj: IVerbSerialized): Verb {
        this.id = obj?.id || this.id;
        this.label = obj?.label || this.label;
        this.description = obj?.description || this.description;
        this.slot = obj?.slot ? this.slot.fromJSON(obj.slot) : this.slot;
        return this;
    }
}