import { Socket } from "socket.io";
import { logger } from "../logger";
import { Player } from "../models/player";
import { game, io } from "../server";
import { MessageHandler } from "./handler";

//  the objectif of this class is to handle the item message (coords, id of the player, type of the item) and check the cooldown of the player

export class ItemHandler extends MessageHandler {
    constructor(socket: Socket) {
        super(socket);
    }

    handleMessage(message: string): void {
        const payload: { id: string, coords: { x: number, y: number, z:number}, itemType: string } = JSON.parse(message);
        const { id, coords, itemType } = payload;
        const player = game.players[id];

        if (!player) {
            logger.warn(`L'Id du joueur ${id} n'existe pas.`);
            return;
        }

        const response: { player: Player, coords: { x: number, y: number }, type: string } = {
            player: player,
            coords: coords,
            type: itemType
        };
        
    }

}