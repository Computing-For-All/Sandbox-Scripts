//todo fix this pls

import fs from 'fs'
import * as csv from 'csv-string';

//TODO put utils into it's own script pls
import GoogleConnector from './util/GoogleConnector.js'

//TODO change this every quarter
let gradesPath = './fall-22-grades'
let sheetPrefix = 'Group'
let outputPath = './output/gradeData.csv'
const spreadsheetId = '1FAaVUgrKbSvVj6Nqt4rJQ4HsvwhP6ZcX-2mQ99AjuF0'
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000
const dataStartRow = 3
const dataEndRow = 1000
const secretPath = '../secret.json'

let google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

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

let output = ""

export async function getGrades(names) {

  const files = fs.readdirSync(gradesPath)
  let groups = await getNamesInSheet()

  files.forEach((file, index) => {
    //if(index != 0) return
    appendAssignments(gradesPath + "/" + file, groups[index])
  })
  
  fs.writeFileSync(outputPath, output)
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

      let studentName = mapName(row[0], students)

      if (studentName == null) {
        return
      }

      let student = `${studentName},${session},${assignmentName},${Number(row[colNum])},${maxPoints},${assignmentName}\n`

      output += (student)
    })
  })
}

export function mapName(targetName, students) {
  if (targetName === 'undefined') return

  let output = null
  let tokens = targetName.split(' ')

  if(tokens.length === 3) {
    targetName = targetName.substring(0, targetName.lastIndexOf(' '))
  }

  if(tokens.length > 1) {
    targetName = tokens[1]
  }
  targetName = targetName.replace(', ', '').toLowerCase()  
  
  students.forEach((name, i) => {
    
    let lowerCaseName = name.toLowerCase().replace(' ', '')
    
    if (lowerCaseName.includes(targetName)) {
      output = name
    }
  })

  return output
}

async function init() {

  await google.authenticate()

  let groups = (await getNamesInSheet())

  getGrades(groups)
}

init()
