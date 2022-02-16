import { SerializationHelper } from "../util/serialization";

/**
 * I see an abstract entity in the sky, I wish I knew what it was
 * [A base]
 */
export abstract class Entity<T>{
    private _data: T = {} as T;
    constructor(data?: T) {
        if (!data) data = {} as T;
        SerializationHelper.toInstance<Entity<T>, T>(this, data);
    }

    public has(key: string): boolean {
        return key in this._data;
    }

    public get(key: string): any | undefined {
        if (!this.has(key)) return void 0;
        return this._data[key];
    }

    public set(key: string, value: any): this {
        this._data[key] = value;
        return this;
    }

    *[Symbol.iterator](): IterableIterator<[string, any]> {
        for (const key in this._data as any) {
            yield [key, this._data[key]];
        }
    }

    [Symbol.toStringTag] = "Entity";



    protected merge(propertyName: string, from: T): Entity<T> {
        if (!this.has(`${propertyName}`)) {
            if (`${propertyName}` in from) {
                this._data[`${propertyName}`] = from[`${propertyName}`];
            } else {
                if (`${propertyName}$add` in from) {
                    this._data[`${propertyName}$add`] = from[`${propertyName}$add`];
                }
                if (`${propertyName}$remove` in from) {
                    this._data[`${propertyName}$remove`] = from[`${propertyName}$remove`];
                }
            }
            return this;
        } else {
            if (`${propertyName}` in from) {
                this._data[`${propertyName}`] = from[`${propertyName}`];
            } else {
                const map = this[`${propertyName}`] as Map<string, number>;
                if (`${propertyName}$add` in from) {
                    for (const key in from[`${propertyName}$add`]) {
                        if (map.has(key)) throw new Error(`Dictionary already contains "${propertyName}" item "${key}", content merge failed`);
                        map.set(key, from[`${propertyName}$add`][key]);
                    }
                }
                if (`${propertyName}$remove` in from) {
                    for (const key of from[`${propertyName}$remove`]) {
                        if (!map.has(key)) throw new Error(`Dictionary does not have "${propertyName}" item "${key}", content merge failed`);
                        map.delete(key);
                    }
                }
            }
        }

        return this;
    }
}