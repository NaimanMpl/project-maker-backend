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
  position: {
    x: number;
    y: number;
  };
}
