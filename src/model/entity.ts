import { SerializationHelper } from "../util/serialization";

/**
 * I see an abstract entity in the sky, I wish I knew what it was
 * [A base]
 */
export abstract class Entity {
    private _data: object = {};
    constructor(data?: object) {
        SerializationHelper.toInstance(this, data);
    }

    protected get(key: string): any {
        if (!(key in this._data)) {
            return null;
        }
        return this._data[key];
    }

    protected set(key: string, value: any): any {
        this._data[key] = value;
    }
}