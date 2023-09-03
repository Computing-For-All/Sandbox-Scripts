//todo fix this pls

import fs from 'fs'
import * as csv from 'csv-string';
import * as Utils from './attendance.js'
import GoogleConnector from '../fall-22/util/GoogleConnector.js'
let sheetPrefix = 'Group'
const spreadsheetId = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'
const secretPath = '../secret.json'
let google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

let gradesPath = './winter-23-grades'

let output = ""
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000

export async function Grades() {

  const files = fs.readdirSync(gradesPath)
  let students = await getNamesInSheet()

  files.forEach((file, index) => {
    appendAssignments(gradesPath + "/" + file, students)
  })

  fs.writeFileSync('gradeData.txt', output)
}

async function getNamesInSheet() {
    
  let names = []

  for (let groupIndex = 1; groupIndex <= numGroups; groupIndex++) {
      const metaData = await google.get(groupIndex, `${nameStartCol}${nameStartRow}:${nameStartCol}${nameEndRow}`)

      metaData.data.values.forEach((element, i) => {

          metaData.data.values[i] = element[0]
      })
      metaData.data.values = metaData.data.values.filter(name => name && name !== "FIRST LAST")

      names.push(metaData.data.values)
  }

  return names
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

Grades()