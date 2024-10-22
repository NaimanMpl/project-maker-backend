import { item } from './item';

export class Coin extends item {
    constructor(type: string, id: string, coords: { x: number, y: number, z: number }) {
        super("COINS", id, "Coin", "A coin that gives points to the player",coords, 1, 0, -1);
    }
}
