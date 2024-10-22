import { item } from './item';

export class Wall extends item {
    constructor(type: string, id: string, coords: { x: number, y: number, z: number }) {
        super("WALL", id, "Wall", "A wall that blocks the path of players",coords, 10, 8, 2);
    }

}
