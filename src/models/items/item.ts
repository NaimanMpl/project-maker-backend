export type itemCategories = "LANDMINE" | "WALL" | "SPEEDBOOST" | "SLOWBOOST" | "COINS";

export class item {
    type: itemCategories;
    id: string;
    name: string;
    description: string;
    coords: { x: number, y: number, z: number };
    cooldown: number;
    castingTime: number;
    duration: number;

    get infinite(): boolean {
        return this.duration === -1;
    }

    place(): void {
        console.log('Item : ' + this.type + ' placed');
    }

    trigger(): void {
        console.log('Item : ' + this.type + ' triggered');
    }

    destroy(): void {
        console.log('Item : ' + this.type + ' destroyed');
    }

    constructor(type: itemCategories, id: string, name:string, description:string, coords: { x: number, y: number, z: number }, cooldown: number, castingTime:number, duration: number) {
        this.type = type;
        this.id = id;
        this.coords = coords;
        this.name = name;
        this.description = description;
        this.castingTime = castingTime;
        this.cooldown = cooldown;
        this.duration = duration;
    }
}
