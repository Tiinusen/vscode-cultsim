import { SerializationHelper } from "../util/serialization";
import { Entity } from "./entity";

/**
 * A flat empty space which contains the chaos for those in need for the unknown
 * 
 * [Created to add helper methods on inner structures due to components rely on them (due to bad design on my part)]
 */
export class FlatEntity<T> extends Entity<T>{
    [Symbol.toStringTag] = "FlatEntity";

    constructor(data?: T) {
        super(data, false);
        delete this._data;
        if ('_data' in data) {
            data = (data as any)._data;
        }
        for (const key in data) {
            this[key as any] = data[key];
        }
    }

    public toJSON(): any {
        const jsonObj = {};
        for (const key in this) {
            if (key.substring(0, 1) === "_") continue;
            jsonObj[key as any] = this[key];
        }
        return jsonObj;
    }

    public fromJSON(obj: any): any {
        for (const key in obj) {
            this[key] = obj[key];
        }
        return this;
    }

    public replace(data: T, clone = true) {
        this._data = {} as T;
        if (clone) {
            SerializationHelper.toInstance<Entity<T>, T>(this, data);
        } else {
            this._data = data;
        }
    }

    public has(key: string): boolean {
        return key in this;
    }

    public get(key: string): any | undefined {
        if (!this.has(key)) return void 0;
        return this[key];
    }

    public set(key: string, value: any): this {
        this[key] = value;
        return this;
    }

    *[Symbol.iterator](): IterableIterator<[string, any]> {
        for (const key in this as any) {
            if (key.substring(0, 1) == "_") continue;
            yield [key, this._data[key]];
        }
    }

    [Symbol.toStringTag] = "Entity";


    public clone(): Entity<T> {
        const dataAsJSON = JSON.stringify(this);
        if (dataAsJSON === void 0) return new (<any>this.constructor)();
        return new (<any>this.constructor)(JSON.parse(dataAsJSON));
    }

    public merge(propertyName: string, from: T): Entity<T> {
        // TODO: Implemented merge (prehaps)
        return this;
    }
}