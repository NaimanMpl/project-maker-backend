import * as mapLoader from "../loaders/map.loader";

jest.spyOn(mapLoader, "loadMap").mockResolvedValue([
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
]);
