import { item } from './item';

export class SlowBoost extends item {
    constructor(type: string, id: string, coords: { x: number, y: number, z: number }) {
        super("SLOWBOOST", id, "SlowBoost", "A slow boost that slows down the player",coords, 10, 8, 2);
    }
}
