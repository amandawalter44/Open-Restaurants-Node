import supertest from "supertest";
import app from "./app.js";

describe("GET /restaurants/:openTime", () => {
  describe("when a datetime string is passed", () => {
    //should provide expected restaurants  when day and time is passed
    // returns empty for datetime not included in data
    //  returns expected results for restaurant hours separated by '/'
  });
  describe("when the datetime string is missing or invalid", () => {
    // throws error when only a day of the week is passed
    // throws error when only a time is passed
  });
});
