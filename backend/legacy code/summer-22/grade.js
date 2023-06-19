//todo fix this pls

import fs from 'fs'
import * as csv from 'csv-string';
import * as Utils from './winter-22-attendance.js'

let gradesPath = './winter-22-grades'

let output = ""

export async function getGrades() {

  const files = fs.readdirSync(gradesPath)
  let students = await Utils.getNamesInSheet()

  files.forEach((file, index) => {
    appendAssignments(gradesPath + "/" + file, students)
  })

  fs.writeFileSync('gradeData.txt', output)
}

function appendAssignments(fileName, students) {

  const data = csv.parse(fs.readFileSync(fileName, 'utf-8'))
  const session = fileName.replace('.csv', '').substring(fileName.lastIndexOf('/') + 1)

  data[0].forEach((col, colNum) => {

    if (data[2][colNum] == '' || data[1][colNum] == '(read only)') return
    if (colNum < 4) return

    let assignmentName = col//.substring(0, col.lastIndexOf(" ")).trim()
    let maxPoints = Number(data[1][colNum])

    data.forEach((row, rowNum) => {
      if (rowNum < 2) return

      if (Number.isNaN(Number(row[colNum]))) {
        return
      }

      let studentName = Utils.mapName(row[0], students)
      console.log(assignmentName)
      if (studentName == null) return

      let student = `${studentName},${session},${assignmentName},${Number(row[colNum])},${maxPoints}\n`
      //${Number(row[colNum]) + '/'+ maxPoints}
      output += (student)
    })
  })
}

getGrades()