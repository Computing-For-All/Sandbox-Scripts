import fs from 'fs'
import * as csv from 'csv-string';

import { google } from 'googleapis'

//TODO change this every quarter
const assignmentsPath = './fall-22-grades'
const outputPath = './output/assignmentData.csv'

let output = ''

export function getAssignments() {

  const files = fs.readdirSync(assignmentsPath)

  files.forEach((file, index) => {
    if(index !== 0) return
    appendAssignments(assignmentsPath + "/" + file)
  })

  fs.writeFileSync(outputPath, output)

  return output
}

function appendAssignments(fileName) {

  const data = csv.parse(fs.readFileSync(fileName, 'utf-8'))

  data[0].forEach((col, i) => {

    if (data[1][i] == '') return
    if (i < 4) return

    let name = col
    let smolName = name.toLocaleLowerCase()
    let type = smolName.includes('quiz') ? 'Quiz' : smolName.includes('exam') ? 'Exam' : 'Practice'
    let maxPoints = Number(data[1][i])
    let level = fileName.charAt(fileName.indexOf('.csv') - 1)
    let session = fileName.replace('.csv', '').substring(fileName.lastIndexOf('/') + 1)

    let course = `Pre-apprenticeship Level ${level}`

    // let assignmentObject = {
    //   Name: name,
    //   AssessmentType: type,
    //   Session: session,
    //   Course: course,
    //   Topic: '',
    //   Description:'',
    //   MaxPoints:maxPoints,
    //   ExternalLink:''
    // }
    name = name//.substring(0, name.lastIndexOf(" ")).trim()

    if (Number.isNaN(Number(maxPoints))) {
      return
    }

    output += (`${name},${session},${type},${course},${maxPoints}\n`)
  })
}

getAssignments()