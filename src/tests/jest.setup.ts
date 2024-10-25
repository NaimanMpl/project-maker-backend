import { interval } from "../server";

process.env.NODE_ENV = "test";

afterAll(() => {
  clearInterval(interval);
});
