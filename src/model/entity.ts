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

    public replace(data: T) {
        this._data = {} as T;
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


    public clone(): Entity<T> {
        return new (<any>this.constructor)(JSON.parse(JSON.stringify(this)));
    }

    public merge(propertyName: string, from: T): Entity<T> {
        if (!from) return this;
        if ('_data' in from) from = (from as any)._data;
        if (this._data[`${propertyName}`]) {
            if (Array.isArray(this._data[`${propertyName}`])) {
                if (from[`${propertyName}`]) {
                    this._data[`${propertyName}`] = from[`${propertyName}`];
                } else {
                    let list = this._data[`${propertyName}`] as Array<string>;
                    if (from[`${propertyName}$remove`]) {
                        for (const key of from[`${propertyName}$remove`]) {
                            if (!list.some(item => item == key)) throw new Error(`List does not have "${propertyName}" item "${key}", content merge failed`);
                            list = list.filter(item => item != key);
                        }
                    }
                    if (from[`${propertyName}$append`]) {
                        for (const key of from[`${propertyName}$append`]) {
                            if (list.some(item => item == key)) throw new Error(`List already contains "${propertyName}" item "${key}", content merge failed`);
                            list.push(key);
                        }
                    }
                    if (from[`${propertyName}$prepend`]) {
                        for (const key of from[`${propertyName}$prepend`]) {
                            if (list.some(item => item == key)) throw new Error(`List already contains "${propertyName}" item "${key}", content merge failed`);
                            list.unshift(key);
                        }
                    }
                    this._data[`${propertyName}`] = list;
                }
            } else {
                if (from[`${propertyName}`]) {
                    this._data[`${propertyName}`] = from[`${propertyName}`];
                } else {
                    const map = this._data[`${propertyName}`] as Map<string, number>;
                    if (from[`${propertyName}$remove`]) {
                        for (const key of from[`${propertyName}$remove`]) {
                            if (!map[key]) throw new Error(`Dictionary does not have "${propertyName}" item "${key}", content merge failed`);
                            delete map[key];
                        }
                    }
                    if (from[`${propertyName}$add`]) {
                        for (const key in from[`${propertyName}$add`]) {
                            if (map[key]) throw new Error(`Dictionary already contains "${propertyName}" item "${key}", content merge failed`);
                            map[key] = from[`${propertyName}$add`][key];
                        }
                    }
                }
            }
        } else {
            if (from[`${propertyName}`]) {
                this._data[`${propertyName}`] = from[`${propertyName}`];
                if (`${propertyName}$add` in this._data) {
                    delete this._data[`${propertyName}$add`];
                }
                if (`${propertyName}$remove` in this._data) {
                    delete this._data[`${propertyName}$remove`];
                }
            } else {
                if (`${propertyName}$add` in from) {
                    this._data[`${propertyName}$add`] = from[`${propertyName}$add`];
                }
                if (`${propertyName}$remove` in from) {
                    this._data[`${propertyName}$remove`] = from[`${propertyName}$remove`];
                }
            }
        }
        return this;
    }
}