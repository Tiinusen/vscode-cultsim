import { Entity } from "./entity";
import { Slot } from "./slot";


interface IInternalDeckSerialized {
    spec: Array<string>
    draws: number
    resetonexhaustion: boolean
}

/**
 * 
 */
export class InternalDeck extends Entity<IInternalDeckSerialized> implements IInternalDeckSerialized {
    // spec
    public get spec(): Array<string> {
        return this.get('spec');
    }
    public set spec(value: Array<string>) {
        this.set('spec', value);
    }

    // draws
    public get draws(): number {
        return this.get('draws') || 0;
    }
    public set draws(value: number) {
        this.set('draws', value);
    }

    // resetonexhaustion
    public get resetonexhaustion(): boolean {
        return this.get('resetonexhaustion') || false;
    }
    public set resetonexhaustion(value: boolean) {
        this.set('resetonexhaustion', value);
    }


    public toJSON(): IInternalDeckSerialized | any {
        if (!this.get('spec') && !this.get('draws') && !this.get('resetonexhaustion')) {
            return void 0;
        }
        return {
            spec: this.get('spec'),
            draws: this.get('draws'),
            resetonexhaustion: this.get('resetonexhaustion')
        };
    }

    public fromJSON(obj: IInternalDeckSerialized): InternalDeck {
        this.spec = obj?.spec || this.get('spec');
        this.draws = obj?.draws || this.get('draws');
        this.resetonexhaustion = obj?.resetonexhaustion || this.get('resetonexhaustion');
        return this;
    }
}