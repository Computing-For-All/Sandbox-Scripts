import express from "express";
import cors from "cors";
// import Attendance from '../template-scripts/attendance.js'
// import CanvasGrades from '../template-scripts/CanvasGrades.js'
import getGradesCSV from "./grade-script.js";
import generateGradesXLSX from "./generate-grades-xlsx.js";
 
const app = express();
const port = 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//await axios.get('http://localhost:5000/')

app.use(cors());

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("hello world!");
});

app.post("/run/attendance", (req, res) => {
  console.log("running attendance yay!");
  res.json(Attendance());
});

app.post("/test", (req, res) => {
  console.log("running test yay!");
});

app.post("/run/grades", async (req, res) => {
  console.log("running grades!");

  // const grades = await CanvasGrades()
  const grades = await getGradesCSV();
  res.json(grades);
});

app.get("/generate/grades/xlsx", async (req, res) => {
  console.log("running grades!");
 
  // const grades = await CanvasGrades()
  const grades = await getGradesCSV();
  const gradeRowStrings = grades[0].split("\n");
  if (
    gradeRowStrings.length !== 0 &&
    gradeRowStrings[gradeRowStrings.length - 1].length === 0
  ) {
    gradeRowStrings.splice(gradeRowStrings.length - 1, 1);
  }
  const gradeRows = [];

  for (const row of gradeRowStrings) {
    gradeRows.push(row.split(","));
  }

  console.log(gradeRows);
  const gradesSpreadsheetPath = generateGradesXLSX(gradeRows, "october");
  if (gradesSpreadsheetPath !== "") {
    res.status(200).download(gradesSpreadsheetPath, err => console.log(err));
  } else {
    res.status(500).send("Unable to generate!");
  }
});

app.listen(port, () => {
  console.log("listening on port: " + port);
});