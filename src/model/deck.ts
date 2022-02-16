import { Entity } from "./entity";


interface IDeckSerialized {
    id: string
    label: string
    description: string
    resetonexhaustion: any
    spec: any
    defaultcard: any
    drawmessages: any
}

export class Deck extends Entity<IDeckSerialized> implements IDeckSerialized {
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

    // resetonexhaustion
    public get resetonexhaustion(): string {
        return this.get('resetonexhaustion');
    }
    public set resetonexhaustion(value: string) {
        this.set('resetonexhaustion', value);
    }

    // spec
    public get spec(): string {
        return this.get('spec');
    }
    public set spec(value: string) {
        this.set('spec', value);
    }

    // defaultcard
    public get defaultcard(): string {
        return this.get('defaultcard');
    }
    public set defaultcard(value: string) {
        this.set('defaultcard', value);
    }

    // drawmessages
    public get drawmessages(): string {
        return this.get('drawmessages');
    }
    public set drawmessages(value: string) {
        this.set('drawmessages', value);
    }

    public toJSON(): IDeckSerialized {
        return {
            id: this.get('id'),
            label: this.get('label'),
            description: this.get('description'),
            resetonexhaustion: this.get('resetonexhaustion'),
            spec: this.get('spec'),
            defaultcard: this.get('defaultcard'),
            drawmessages: this.get('drawmessages'),
        };
    }

    public fromJSON(obj: IDeckSerialized): Deck {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.description = obj?.description || this.get('description');
        this.resetonexhaustion = obj?.resetonexhaustion || this.get('resetonexhaustion');
        this.spec = obj?.spec || this.get('spec');
        this.defaultcard = obj?.defaultcard || this.get('defaultcard');
        this.drawmessages = obj?.drawmessages || this.get('drawmessages');
        return this;
    }
}