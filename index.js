const app = require("express")();
const PORT = 8080;
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

app.get("/restaurants/:openTime", (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, "restaurants.csv");

  const dateStr = req.params.openTime;
  const parsedDate = new Date(dateStr);

  if (isNaN(parsedDate)) {
    return res.status(400).send("Invalid date format");
  }

  //   res.json({ parsedDate });
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const filteredResults = results.filter((restaurant) => {
        console.log("RESTAURANT", restaurant);
        return isWithinHours(parsedDate, restaurant.Hours);
      });
      res.json(filteredResults);
    })
    .on("error", (err) => {
      console.error("Error reading CSV file:", err);
      res.status(500).send("Error reading CSV file");
    });
});

function isWithinHours(datetimeStr, hoursStr = "Mon-Sun 11 am - 9:30 pm") {
  const dt = new Date(datetimeStr);
  if (isNaN(dt)) return false;

  // Extract day and time
  const day = dt.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }); // "Mon", "Tue", etc.
  const hour = dt.getUTCHours();
  const minute = dt.getUTCMinutes();

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
    let [h, m = "00"] = time.split(":");
    h = parseInt(h, 10);
    m = parseInt(m, 10);
    if (modifier === "pm" && h !== 12) h += 12;
    if (modifier === "am" && h === 12) h = 0;
    return h * 60 + m;
  };

  const timeNow = hour * 60 + minute;
  const startTime = to24Hour(startTimeStr);
  const endTime = to24Hour(endTimeStr);

  return timeNow >= startTime && timeNow <= endTime;
}
app.listen(PORT, () =>
  console.log(`App is running on 'http://localhost:${PORT}'`)
);
