import fs from 'fs'
import * as csv from 'csv-string';
import GoogleConnector from '../template-scripts/utils/GoogleConnector.js'
import { mapName } from './utils/utils.js';

const gradesPath = '../template-scripts/test_data/winter-23-grades'
const secretPath = '../template-scripts/utils/secret.json'
const outputPath = '../template-scripts/output/winter-grades.csv'

const sheetPrefix = 'Group'
const spreadsheetId = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'
const google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

let output = ""

export async function Grades() {

    await google.authenticate()

    const files = fs.readdirSync(gradesPath)
    let unparsedStudentsList = await google.getNamesInSheet()

    let students = getStudentsFromGroupList(unparsedStudentsList)

    files.forEach((file, index) => {
        appendAssignments(gradesPath + "/" + file, students)
    })

    fs.writeFileSync(outputPath, output)
}

function getStudentsFromGroupList(unparsedStudentsList) {
    let students = []
    
    unparsedStudentsList.forEach(group => {
        group.forEach(student => {
            students.push(student)
        })
    })

    return students
}

function appendGrades(fileName, students) {

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
            console.log(assignmentName)
            if (studentName == null) return

            let student = `${studentName},${session},${assignmentName},${Number(row[colNum])},${maxPoints}\n`
            //${Number(row[colNum]) + '/'+ maxPoints}
            output += (student)
        })
    })
}

Grades()