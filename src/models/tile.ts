export type TileType =
  | "Tree"
  | "House"
  | "Lake"
  | "Sidewalk"
  | "Road"
  | "Crosswalk"
  | "Start"
  | "End";

export interface Tile {
  type: TileType;
  properties: {
    position: {
      x: number;
      y: number;
      z: number;
    };
  };
}
