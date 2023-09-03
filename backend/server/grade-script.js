import GoogleConnector from './utils/GoogleConnector.js'
import fs from 'fs'
import * as csv from 'csv-string';
import { mapName, sleep } from './utils/utils.js'
import PATHS from './paths.js'

// const QUARTER = 'Winter'
// const YEAR = '2023'
// const PROGRAM = 'PAP'
// const LEVELS = [2,3,5]
// const END_DATE = '3/15/23'

const secretPath = PATHS.ZOOM_KEY
const sheetPrefix = 'Group'
const gradeOutput = PATHS.OUTPUT_PATH

//analyze the spreadsheet 
async function readCSV(csvFileName) {
    let unparsedStudentsList = [
        [
          'Abdisalam Kadir',
          'Adreal Manansala', 
          'Aliyan Muhammad',
          'Benjamin Madrid',
          'Cindy Nguyen',
          'Cynthia Chand',
          'DjoDjo Kamili', 
          'Fatima Jawara', 
          'Mohamed Hassan', 
          'Henok Mandefro', 
          'Hiya Mehta',
          'Kaleb Kabede', 
          'Kinza Anwar',
          'Masud Dalmar Dahir',
          'Mohamed Hassan',
          'Mozhgan Khairandish', 
          'Regina Lin',
          'Samantha Treacy', 
          'Tanya Jain',
          'Timothy Hoang', 
          'Yahya Abdullahi',
        ],
        [
          'Aayan Muhammad',
          'Farheen Ibrahim',
          'Imara Wangia', 
          'Jaden Wong',
          'Kevin Tran', 
          'Rameez Hussain',
          'Vincent Ly',
          'Xuan Ouyang',
          'Xiuyi Li',
          'Rajbir Sandhu',
        ],
        [
          'Elroe S Yayiso',
          'Gordon Tran',
          'Jian Fu Chen',
          'Michelle Dang',
          'Nikolai Evans',
        ],
        [
          'Chaker Baloch',
          'Henry Nguyen',
          'Winnie Tran',
          'Tao Hoang',
          'Damien Cruz',
        ]
      ]

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

    const files = fs.readdirSync(PATHS.CANVAS_DATA)
    for(let i = 0; i < files.length; i++) {
        
        let file = files[i]

        //NOTE - used for debugging. Please comment out this line when not in use!!!!
        //if(i !== 0) continue
        
        let data = await readCSV('input\\canvas_archive\\'+file)
      
        gradesOutput += data[0]
        assignmentsOutput += data[1]
        sleep(4000)
    }

    // console.log(gradesOutput)

    //NOTE - used for debugging. Please comment out this line when not in use!!!!
    fs.writeFileSync(gradeOutput+"/assignment.csv", assignmentsOutput)
    fs.writeFileSync(gradeOutput+"/grades.csv", gradesOutput)

    return [gradesOutput, assignmentsOutput]
}
getGradesCSV()
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

            let studentName = mapName(parseNameFromCSV(row[0]), students)

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
