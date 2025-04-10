import express from "express";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Restaurants Open at a given Date and Time
// Time will default to 00:00 if no specific time given
app.get("/restaurants/:openTime", (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, "restaurants.csv");

  const dateStr = req.params.openTime;
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate)) {
    return res.status(400).send("Invalid date format");
  }
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const filteredResults = results.filter((restaurant) => {
        return isWithinHours(parsedDate, restaurant.Hours);
      });
      res.json(filteredResults);
    })
    .on("error", (err) => {
      console.error("Error reading CSV file:", err);
      res.status(500).send("Error reading CSV file");
    });
});

function isWithinHours(datetimeStr, hoursStr) {
  const dt = new Date(datetimeStr);
  if (isNaN(dt)) return false;

  // Extract day and time
  const day = dt.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }); // "Mon", "Tue", etc.
  const hour = dt.getUTCHours();
  const minute = dt.getUTCMinutes();

  console.log("HOUR", hour);
  // Check if day is in range
  const [days, timeRange] = hoursStr.split(" ");
  const [dayStart, dayEnd] = days.split("-");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayIndex = daysOfWeek.indexOf(day);
  const startIndex = daysOfWeek.indexOf(dayStart);
  const endIndex = daysOfWeek.indexOf(dayEnd);

  const isDayInRange =
    startIndex <= endIndex
      ? dayIndex >= startIndex && dayIndex <= endIndex
      : dayIndex >= startIndex || dayIndex <= endIndex;

  if (!isDayInRange) return false;

  // Parse time range
  const [startTimeStr, endTimeStr] = hoursStr.match(
    /\d{1,2}(:\d{2})?\s?(am|pm)/gi
  );
  const to24Hour = (str) => {
    const [time, modifier] = str
      .toLowerCase()
      .split(/(am|pm)/)
      .filter(Boolean);
    let [hours, minutes = "00"] = time.split(":");
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (modifier === "pm" && hours !== 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const timeNow = hour * 60 + minute;
  const startTime = to24Hour(startTimeStr);
  const endTime = to24Hour(endTimeStr);

  return timeNow >= startTime && timeNow <= endTime;
}

export default app;
