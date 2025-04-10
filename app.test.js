import app from "./app.js";
import request from "supertest";
describe("GET /restaurants/:openTime", () => {
  describe("when a datetime string is passed", () => {
    //
    it("should provide expected restaurants  when day and time is passed in long form ", async () => {
      const expected = [
        {
          "Restaurant Name": "Tupelo Honey",
          Hours: "Mon-Thu, Sun 9 am - 10 pm  / Fri-Sat 9 am - 11 pm",
        },
        {
          "Restaurant Name": "Dashi",
          Hours: "Mon-Fri 10 am - 9:30 pm  / Sat-Sun 9:30 am - 9:30 pm",
        },
      ];
      const response = await request(app).get(
        "/restaurants/April 9, 2025 10:00"
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expected);
    });

    it("should provide expected restaurants when day and time is passed in ISO form ", async () => {
      const expected = [
        {
          "Restaurant Name": "Tupelo Honey",
          Hours: "Mon-Thu, Sun 9 am - 10 pm  / Fri-Sat 9 am - 11 pm",
        },
        {
          "Restaurant Name": "Dashi",
          Hours: "Mon-Fri 10 am - 9:30 pm  / Sat-Sun 9:30 am - 9:30 pm",
        },
      ];
      const response = await request(app).get(
        "/restaurants/2025-04-09T10:00:00"
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expected);
    });
    it("returns empty for datetime not included in data", async () => {
      const expected = [];
      const response = await request(app).get(
        "/restaurants/2025-04-09T04:00:00"
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expected);
    });
  });

  describe("when the datetime string is missing or invalid", () => {
    it("sends error when only a time is passed", async () => {
      const expected = "Invalid date format";
      const response = await request(app).get("/restaurants/10:00:00");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(expected);
    });
    it("sends error no value passed in openTime", async () => {
      const expected = "Invalid date format";
      const response = await request(app).get("/restaurants/'");
      expect(response.statusCode).toBe(400);
      expect(response.text).toBe(expected);
    });
  });
});
