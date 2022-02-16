import { Entity } from "./entity";


interface ISynopsisSerialized {
    name: string
    author: string
    version: string
    description: string
    description_long: string
}

/**
 * 
 */
export class Synopsis extends Entity<ISynopsisSerialized> implements ISynopsisSerialized {

    public get name(): string {
        return this.get('name') || "";
    }
    public set name(value: string) {
        this.set('name', value);
    }

    public get author(): string {
        return this.get('author') || "";
    }
    public set author(value: string) {
        this.set('author', value);
    }

    public get version(): string {
        return this.get('version') || "";
    }
    public set version(value: string) {
        this.set('version', value);
    }

    public get description(): string {
        return this.get('description') || "";
    }
    public set description(value: string) {
        this.set('description', value);
    }

    public get description_long(): string {
        return this.get('description_long') || "";
    }
    public set description_long(value: string) {
        this.set('description_long', value);
    }

    public toJSON(): ISynopsisSerialized {
        return {
            name: this.get('name'),
            author: this.get('author'),
            version: this.get('version'),
            description: this.get('description'),
            description_long: this.get('description_long'),
        };
    }

    public fromJSON(obj: ISynopsisSerialized): Synopsis {
        this.name = obj?.name || this.get('name');
        this.author = obj?.author || this.get('author');
        this.version = obj?.version || this.get('version');
        this.description = obj?.description || this.get('description');
        this.description_long = obj?.description_long || this.get('description_long');
        return this;
    }
}