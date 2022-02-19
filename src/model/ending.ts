import { Entity } from "./entity";
import { Slot } from "./slot";


interface IEndingSerialized {
    id: string
    label: string
    description: string
    image: string
    flavour: string
    anim: string
    achievementid: string
}

/**
 * 
 */
export class Ending extends Entity<IEndingSerialized> implements IEndingSerialized {
    // id
    public get id(): string {
        return this.get('id') || "";
    }
    public set id(value: string) {
        this.set('id', value);
    }

    // label
    public get label(): string {
        return this.get('label') || "";
    }
    public set label(value: string) {
        this.set('label', value);
    }

    // description
    public get description(): string {
        return this.get('description') || "";
    }
    public set description(value: string) {
        this.set('description', value);
    }

    // image
    public get image(): string {
        return this.get('image') || "";
    }
    public set image(value: string) {
        this.set('image', value);
    }

    // flavour
    public get flavour(): string {
        return this.get('flavour') || "";
    }
    public set flavour(value: string) {
        this.set('flavour', value);
    }

    // anim
    public get anim(): string {
        return this.get('anim') || "";
    }
    public set anim(value: string) {
        this.set('anim', value);
    }

    // achievementid
    public get achievementid(): string {
        return this.get('achievementid') || "";
    }
    public set achievementid(value: string) {
        this.set('achievementid', value);
    }


    public toJSON(): IEndingSerialized | any {
        return {
            id: this.get('id'),
            label: this.get('label'),
            description: this.get('description'),
            image: this.get('image'),
            flavour: this.get('flavour') || "Grand",
            anim: this.get('anim')  || "DramaticLight",
            achievementid: this.get('achievementid') || "XXX",
        };
    }

    public fromJSON(obj: IEndingSerialized): Ending {
        this.id = obj?.id || this.get('id');
        this.label = obj?.label || this.get('label');
        this.description = obj?.description || this.get('description');
        this.image = obj?.image || this.get('image');
        this.flavour = obj?.flavour || this.get('flavour') || "Grand";
        this.anim = obj?.anim || this.get('anim') || "DramaticLight";
        this.achievementid = obj?.achievementid || this.get('achievementid') || "XXX";
        return this;
    }
}