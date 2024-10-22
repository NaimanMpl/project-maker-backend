import { item } from './item';

export class SpeedBoost extends item {
    constructor(type: string, id: string, coords: { x: number, y: number, z: number }) {
        super("SPEEDBOOST", id, "SpeedBoost", "A speed boost that increases the player's speed",coords, 10, 8, 2);
    }
}
