import { Entity } from "./entity";
import { Slot } from "./slot";


interface IExpulsionSerialized {
    limit: number
    filter: Map<string, number>
}

/**
 * 
 */
export class Expulsion extends Entity<IExpulsionSerialized> implements IExpulsionSerialized {
    // limit
    public get limit(): number {
        return this.get('limit') || 0;
    }
    public set limit(value: number) {
        this.set('limit', value);
    }

    // filter
    public get filter(): Map<string, number> {
        return this.get('filter');
    }
    public set filter(value: Map<string, number>) {
        this.set('filter', value);
    }

    public toJSON(): IExpulsionSerialized | any {
        if (!this.get('limit') && (!this.get('filter') || Object.keys(this.get('filter')).length === 0)) {
            return void 0;
        }
        return {
            limit: this.get('limit') || void 0,
            filter: (!this.get('filter') || Object.keys(this.get('filter')).length === 0) ? void 0 : this.get('filter')
        };
    }

    public fromJSON(obj: IExpulsionSerialized): Expulsion {
        this.limit = obj?.limit || this.get('limit');
        this.filter = obj?.filter || this.get('filter');
        return this;
    }
}