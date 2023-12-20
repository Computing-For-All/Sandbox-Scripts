import GoogleConnector from './utils/GoogleConnector.js'
import fs from 'fs'
import * as csv from 'csv-string';
import { mapName, sleep } from './utils/utils.js'
import PATHS from './paths.js'
import * as settings from './quarter-settings.js'

// const QUARTER = 'Winter'
// const YEAR = '2023'
// const PROGRAM = 'PAP'
// const LEVELS = [2,3,5]
// const END_DATE = '3/15/23'

const secretPath = PATHS.ZOOM_KEY
const sheetPrefix = 'Group'
const gradeOutput = PATHS.OUTPUT_PATH

let quarterSettings = settings.FALL_23

//analyze the spreadsheet 
async function readCSV(csvFileName) {
    let unparsedStudentsList = quarterSettings.STUDENTS

    let students = getStudentsFromGroupList(unparsedStudentsList)

    let canvasPath = csvFileName    

    let assignments = appendAssignments(canvasPath)
    
    //fs.writeFileSync(gradeOutput+"/assignment.csv", assignments)
    
    let grades = appendGrades(canvasPath, students)
    //fs.writeFileSync(gradeOutput+"/grades.csv", grades)

    return [grades,assignments]
} 

export async function getGradesCSV() {

    let gradesOutput = ''
    let assignmentsOutput = '' 

    const files = fs.readdirSync(quarterSettings.GRADE_PATH)
    for(let i = 0; i < files.length; i++) {
        
        let file = files[i]

        //NOTE - used for debugging. Please comment out this line when not in use!!!!
        //if(i !== 0) continue
        
        let data = await readCSV(quarterSettings.GRADE_PATH+file)
      


        gradesOutput += data[0]
        assignmentsOutput += data[1]
        sleep(4000)
    }

    // console.log(gradesOutput)

    //NOTE - used for debugging. Please comment out this line when not in use!!!!
    //fs.writeFileSync(gradeOutput+"/assignment.csv", assignmentsOutput)
    //fs.writeFileSync(gradeOutput+"/grades.csv", gradesOutput)

    return [gradesOutput, assignmentsOutput]
}
export default getGradesCSV

//NOTE - used for debugging. Please comment out this line when not in use!!!!
//await getGradesCSV()

function getStudentsFromGroupList(unparsedStudentsList) {
    let students = []
    
    unparsedStudentsList.forEach(group => {
        group.forEach(student => {
            students.push(student)
        })
    })

    return students
}
  
function appendAssignments(fileName) {


    const data = csv.parse(fs.readFileSync(fileName, 'utf-8'))

    let output = ''

    data[0].forEach((col, i) => {

        if (data[1][i] == '') return
        if (i < 4) return

        let name = col
        let smolName = name.toLocaleLowerCase()
        let type = smolName.includes('quiz') ? 'Quiz' : smolName.includes('exam') ? 'Exam' : 'Practice'
        let maxPoints = Number(data[1][i])
        let level = fileName.charAt(fileName.indexOf('.csv') - 1)
        const session = fileName.replace('.csv', '').substring(fileName.indexOf('PAP'))

        //let course = `Pre-apprenticeship Level ${level}`

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
        
        output += (`${name},${session},${type},${maxPoints}\n`)
    })

    return output   
}

function appendGrades(fileName, students) {

    let output = ""
    console.log(fileName)

    const data = csv.parse(fs.readFileSync(fileName, 'utf-8'))
    const session = fileName.replace('.csv', '').substring(fileName.indexOf('PAP'))

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

            let studentName = mapName(students, parseNameFromCSV(row[0]))

            if (studentName == null) return
            
            let student = `${studentName},${session},${assignmentName},${Number(row[colNum])},${maxPoints}\n`
            //${Number(row[colNum]) + '/'+ maxPoints}

            output += (student)
        })
    })

    return output
}

function parseNameFromCSV(name) {

    let tokens = name.split(",")

    let first = tokens[0].split(" ")[0].toLowerCase().trim()
    
    if(tokens.length == 2) {
        first = tokens[1].toLowerCase().trim()
        let last = tokens[0].toLowerCase().trim()
        return first + " "+last
    }
    return first
}

async function getGradesFromAllQuarters() {
    let quarters =[]
    // quarters.push(settings.SUMMER_22)
    // quarters.push(settings.FALL_22)
    // quarters.push(settings.WINTER_22)
    // quarters.push(settings.SPRING_23)
    // quarters.push(settings.SUMMER_23)
    quarters.push(settings.FALL_23)

    let allGrades = ''
    let allAssignments = ''
    await quarters.forEach(async (quarter) => {
        quarterSettings = quarter
        let gradeData = await getGradesCSV()
        allGrades += gradeData[0]
        allAssignments += gradeData[1]
    })

    fs.writeFileSync('output/grades.csv', allGrades)
    fs.writeFileSync('output/assignments.csv', allAssignments)
}

await getGradesFromAllQuarters()