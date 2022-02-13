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

export class Deck extends Entity implements IDeckSerialized {
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
            id: this.id,
            label: this.label,
            description: this.description,
            resetonexhaustion: this.resetonexhaustion,
            spec: this.spec,
            defaultcard: this.defaultcard,
            drawmessages: this.drawmessages,
        };
    }

    public fromJSON(obj: IDeckSerialized) {
        this.id = obj?.id;
        this.label = obj?.label;
        this.description = obj?.description;
        this.resetonexhaustion = obj?.resetonexhaustion;
        this.spec = obj?.spec;
        this.defaultcard = obj?.defaultcard;
        this.drawmessages = obj?.drawmessages;
    }
}