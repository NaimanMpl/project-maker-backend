import { MapData } from "../loaders/map.loader";

export const MAP_DATA_MOCK: MapData = {
  end: {
    type: "End",
    properties: {
      position: {
        x: 10,
        y: 10,
        z: 0,
      },
    },
  },
  start: {
    type: "Start",
    properties: {
      position: {
        x: 2,
        y: 2,
        z: 0,
      },
    },
  },
  map: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};
