import { Entity } from "./entity";
import { Expulsion } from "./expulsion";
import { Slot } from "./slot";


interface IAlternativeRecipeSerialized {
    id: string
    chance: number
    additional: boolean
    expulsion: Expulsion
}

/**
 * 
 */
export class AlternativeRecipe extends Entity<IAlternativeRecipeSerialized> implements IAlternativeRecipeSerialized {
    // id
    public get id(): string {
        return this.get('id') || "";
    }
    public set id(value: string) {
        this.set('id', value);
    }

    // chance
    public get chance(): number {
        return this.get('chance') || 0;
    }
    public set chance(value: number) {
        this.set('chance', value);
    }

    // additional
    public get additional(): boolean {
        return this.get('additional') || false;
    }
    public set additional(value: boolean) {
        this.set('additional', value);
    }

    // expulsion
    public get expulsion(): Expulsion {
        return this.get('expulsion') || this.set('expulsion', new Expulsion()).expulsion;
    }
    public set expulsion(value: Expulsion) {
        this.set('expulsion', value);
    }

    public toJSON(): IAlternativeRecipeSerialized | any {
        if (!this.get('id')) {
            return void 0;
        }
        return {
            id: this.get('id'),
            chance: this.get('chance'),
            additional: this.get('additional'),
            expulsion: this.expulsion.toJSON()
        };
    }

    public fromJSON(obj: IAlternativeRecipeSerialized): AlternativeRecipe {
        this.id = obj?.id || this.get('id');
        this.chance = obj?.chance || this.get('chance');
        this.additional = obj?.additional || this.get('additional');
        this.expulsion = obj?.expulsion ? this.expulsion.fromJSON(obj.expulsion) : this.get('expulsion');
        return this;
    }
}