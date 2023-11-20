import express from "express";
import cors from "cors";
// import Attendance from '../template-scripts/attendance.js'
// import CanvasGrades from '../template-scripts/CanvasGrades.js'
import getGradesCSV from "./grade-script.js";
import generateGradesXLSX from "./generate-grades-xlsx.js";
import generateAssignmentsXLSX from "./generate-assignments-xlsx.js";
import getAttendanceCSV from "./attendance-script.js";
import generateAttendanceXLSX from './generate-attendance-xlsx.js'
import runLogger from "./logger-script.js";


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

app.post("/run/grades", async (req, res) => {
  console.log("running grades!");

  // const grades = await CanvasGrades()
  const grades = await getGradesCSV();
  res.json(grades);
});

app.get("/generate/assignments/xlsx", async (req, res) => {
  console.log("running assignments!");

  const assignments = await getGradesCSV();
  const assignmentRowStrings = assignments[1].split("\n");
  if (
    assignmentRowStrings.length !== 0 &&
    assignmentRowStrings[assignmentRowStrings.length - 1].length === 0 
  ) {
    assignmentRowStrings.splice(assignmentRowStrings.length - 1, 1);
  }
  const assignmentRows = [];

  for (const row of assignmentRowStrings) {
    assignmentRows.push(row.split(","));
  }

  const currentDT = new Date();
  const dateTimeString = `${currentDT.getFullYear()}-${currentDT.getMonth()}-${currentDT.getDay()}_${currentDT.getHours()}h${currentDT.getMinutes()}m${currentDT.getSeconds()}s`;
  const assignmentsSpreadsheetPath = generateAssignmentsXLSX(assignmentRows, "assignments_" + dateTimeString);
  setTimeout(()=>{
    if (assignmentsSpreadsheetPath !== "") {
      res.status(200).download(assignmentsSpreadsheetPath, err => console.log(err));
    } else {
      res.status(500).send("Unable to generate!");
    }
  }, 2000);
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
  const currentDT = new Date();
  const dateTimeString = `${currentDT.getFullYear()}-${currentDT.getMonth()}-${currentDT.getDay()}_${currentDT.getHours()}h${currentDT.getMinutes()}m${currentDT.getSeconds()}s`;
  const gradesSpreadsheetPath = generateGradesXLSX(gradeRows, "grades_" + dateTimeString);
  setTimeout(()=>{
    if (gradesSpreadsheetPath !== "") {
      res.status(200).download(gradesSpreadsheetPath, err => console.log(err));
    } else {
      res.status(500).send("Unable to generate!");
    }
  }, 2000);
});

app.get("/generate/attendance/xlsx", async (req, res) => {
  console.log("running attendance!");

  const attendance = await getAttendanceCSV();
  const attendanceRowStrings = attendance.split("\n");
  if (
    attendanceRowStrings.length !== 0 &&
    attendanceRowStrings[attendanceRowStrings.length - 1].length === 0
  ) {
    attendanceRowStrings.splice(attendanceRowStrings.length - 1, 1);
  }
  const attendanceRows = [];
  
  for (const row of attendanceRowStrings) {
    attendanceRows.push(row.split(","));
  }
  const currentDT = new Date();
  const dateTimeString = `${currentDT.getFullYear()}-${currentDT.getMonth()}-${currentDT.getDay()}_${currentDT.getHours()}h${currentDT.getMinutes()}m${currentDT.getSeconds()}s`;
  const attendanceSpreadsheetPath = generateAttendanceXLSX(attendanceRows, "attendance_" + dateTimeString);
  setTimeout(()=>{
    if (attendanceSpreadsheetPath !== "") {
      res.status(200).download(attendanceSpreadsheetPath, err => console.log(err));
    } else {
      res.status(500).send("Unable to generate!");
    }
  }, 2000);
});

app.post('/run/attendance-spreadsheet', async (req,res) => {
  console.log('running logger');

  setTimeout(() => {
    runLogger()
  }, 0)
})

app.listen(port, () => {
  console.log("listening on port: " + port);
});