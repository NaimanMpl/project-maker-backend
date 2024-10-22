
import { item } from './item';

export class Landmine extends item {
    constructor(type: string, id: string, coords: { x: number, y: number, z: number }) {
        super("LANDMINE", id, "Landmine", "A landmine that explodes when a player steps on it",coords, 10, 8, 2);
    }
}
