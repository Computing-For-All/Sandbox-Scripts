import fs from 'fs'
import axios from 'axios'
import GoogleConnector from './utils/GoogleConnector.js'
import { CANVAS_KEY } from './utils/keys.js'

/*Canvas API Key access: 
    Canvas > Account > Setting > Generate Access Token (TODO replace later with CFA top level canvas admin [Leslie?])
*/
//TODO - create better excel templates for the assignment and grade data
//TODO - this script is currently tailored for fall data, it does not recognise names from summer and winter, pls fix!
//TODO - Once Simon has access to all of the courses, run this script again to get all of the data

//TODO WHY IS THE API KEY IN PLAIN VIEW???????
const token = CANVAS_KEY    
const prefix = 'https://computingforall.instructure.com/'
const suffix = `?access_token=${token}`
const spreadsheetId = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000
const dataStartRow = 3
const dataEndRow = 1000
const secretPath = '../template-scripts/utils/secret.json'
let sheetPrefix = 'Group'
let google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

let courses = []
let allAssignments = ""

//GET /api/v1/courses
async function getCourses() {
    
    const getCourseUrl = `${prefix}api/v1/courses${suffix}`
    const metaData = await axios.get(getCourseUrl)
    const courses = metaData.data
    
    let index = 0
    let output = ""

    for(let course of courses) {
        try {
        if(course.course_code !== 'PAP-2022-Fall-L2-G2') continue
        const getStudentsInCourseUrl = `${prefix}/api/v1/courses/${course.id}/users${suffix}`
        const metaData = await axios.get(getStudentsInCourseUrl)
        const students = metaData.data

        //these grades assignments do not contain points_possible
        let gradableElements = await getAllGradedAssignments(course.id, course.course_code) 
        let grades = await getGradesFromAssignments(gradableElements, course.id, course.course_code, students)

        grades.forEach((grade, index) => {
            //TODO - 
            output += `${grade.student_name},${grade.session},${grade.name},${grade.score},${grade.max_score},${grade.type},${grade.submitted_at}\n`
        })
 
        index++
        } catch(err) {
            console.log(err)
        }   
    }

    //output = JSON.stringify(courseArray, undefined, 2)

    fs.writeFileSync('../template-scripts/output/canvas-grades.csv', output)
    fs.writeFileSync('../template-scripts/output/canvas-assignments.csv', allAssignments)
    return output
}

//TODO - merge getQuizzes and get Assignments into one function.
async function getQuizzes(courseId) {
    let quizzes = []
    const url = `${prefix}/api/v1/courses/${courseId}/quizzes${suffix}&per_page=500`
    const metaData = await axios.get(url)
    const data = metaData.data
    let map = new Map()
    data.forEach((quiz, i) => {
        quizzes.push({
            id: quiz.id,
            name: quiz.title,
            points_possible: quiz.points_possible,
            created_at: quiz.created_at
        })
    })

    return quizzes
}

async function getAssignments(courseId) {
    let assignmentIds = []
    const assignmentUrl = `https://computingforall.instructure.com/api/v1/courses/${courseId}/assignments?access_token=${token}&per_page=500`
    const assignmentData = await axios.get(assignmentUrl)
    const assignments = assignmentData.data

    assignments.forEach((assignment, index) => {

        assignmentIds.push({
            id: assignment.id,
            name: assignment.name + ` (${assignment.id})`,
            points_possible: assignment.points_possible,
            created_at: assignment.created_at
        })
    })
    // assignment.Id.push(assignmentObject)
    return assignmentIds
}   

// GET /api/v1/courses/:course_id/assignments 
// Get list assignments 
async function getAllGradedAssignments(courseId, session) {

    let assignments = await getAssignments(courseId)
    let quizzes = await getQuizzes(courseId)

    let maxScores = [assignments,quizzes]

    let gradables = []
    const gradableUrl = `https://computingforall.instructure.com/api/v1/courses/${courseId}/gradebook_history/feed?access_token=${token}&per_page=500`
    const gradableData = await axios.get(gradableUrl)
    const data = gradableData.data

    let map = new Map()

    maxScores.forEach((gradable, index) => {

        let gradableObj = {
            id: gradable.id,
            name: gradable.assignment_name,
            max_score: gradable.points_possible,
            current_grade: gradable.current_grade,
            session,
        }

        console.log(gradable)

        if(!map.has(gradable.assignment_name)) map.set(gradable.assignment_name, gradableObj)
    })

    for (const [key, gradeObj] of map.entries()) {

        gradables.push(gradeObj)
        let level = gradeObj.session.charAt(gradeObj.session.indexOf("-L")+2)
        let courseName = `Pre-apprenticeship Level ${level}`

        allAssignments += `${gradeObj.name} (${gradeObj.id}),${gradeObj.session},${gradeObj.type},${gradeObj.max_score},${courseName},${gradeObj.created_at}\n`
    }

    return gradables

    // const assignmentArray = []
    // return assignmentId
}

function getDataFromGradableRecord(maxScores, gradableName) {

    let data = {
        max_score: 0,
        type: "Practice",
        created_at: ""
    }

    const types = ["Assignment","Quiz"]

    for(let i =  0; i < maxScores.length; i++) {
        
        let assignmentType = maxScores[i]

        for(let j = 0; j < assignmentType.length; j++) {

            if(assignmentType[j].name === gradableName) {
                data.type = types[i]
                data.max_score = assignmentType[j].points_possible
                data.created_at = assignmentType[j].created_at
            }
        }
    }

    return data
}

async function getNamesInSheet() {
    
    let names = []

    for (let groupIndex = 1; groupIndex <= numGroups; groupIndex++) {
        const metaData = await google.get(groupIndex, `${nameStartCol}${nameStartRow}:${nameStartCol}${nameEndRow}`)
  
        metaData.data.values.forEach((element, i) => {

            metaData.data.values[i] = element[0]
        })
        metaData.data.values = metaData.data.values.filter(name => name && name !== "FIRST LAST")
  
        metaData.data.values.forEach((value, i) => {
            names.push(value)
        })
    }
  
    return names
}

function mapName(csvName, names) {

    let matchingSheetName = null
  
      //loop through sheet names
      names?.forEach((sheetName, index) => {
          let cleanedSheetFullName = sheetName.toLowerCase().split(" ")
          let cleanedCsvFullName = cleanCsvName(csvName).split(" ")

          if (cleanedCsvFullName[0] == cleanedSheetFullName[0]) {
              matchingSheetName = sheetName
          }
  
          // TODO handle duplicates here
          if (cleanedCsvFullName[0] == 'jonathan' && cleanedCsvFullName[1] == 'chan') {
              matchingSheetName = null
          }
  
          if (cleanedCsvFullName[0] == 'john') {
              matchingSheetName = 'Jonathan Steshuk'
          }
  
          if (cleanedCsvFullName[0] == 'hoàng' && cleanedCsvFullName[1] == 'bảo') {
              matchingSheetName = 'Hoang Le'
          }
          if (cleanedCsvFullName[0] == 'halie') {
            matchingSheetName = 'Hoang Le'
        }
  
          if (cleanedCsvFullName[0] === 'sahramohamad') {
              matchingSheetName = 'Sahra Mohamad'
          }
  
          if (cleanedCsvFullName[0] === 'mohammed') {
            matchingSheetName = 'Mohammed Ali'
        }
      })
  
      return matchingSheetName
  }
  function cleanCsvName(csvName) {
    csvName = csvName.toLowerCase();
    csvName = csvName.replace(/[0-9]/g, '');
    //remove pronouns
    if (csvName.includes('(')) {
        csvName = csvName.substring(0, csvName.lastIndexOf(" "))
    }
  
    return csvName
  }

async function getGradesFromAssignments(gradables, courseId, courseCode, students) {
    let grades = []
    
    //map
    let map = new Map()
    let namesInSheet = await getNamesInSheet()
    //names from canvas -> name on sheet  -> put into grade object -> put it in csv format -> put into grade and attendance template -> higher ed

        let url = `${prefix}/api/v1/courses/${courseId}/gradebook_history/feed${suffix}&per_page=100`

        const data = await axios.get(url)
        const gradeData = data.data
        
        //WATCH FOR DUPLICATES!!!!!
        gradeData.forEach((grade, j) => {

            //TODO ADD SESSION AND ASSIGNMENT TYPE TO THE GRADE OBJECT

            let key = grade.user_name+" "+grade.assignment_name
            //todo there is something in the logic that is preventing records from being added
            if(!map.has(key)) {
                map.set(key, grade)
            }
        })

        // loop through the map, key:map of student:gradeObj
        for (let [key, gradeObj] of map.entries()) {

            let gradable = findGradable(gradables, gradeObj) 

            if(gradable == null) continue

            grades.push({   
                student_name: mapName(gradeObj.user_name, namesInSheet),
                session:courseCode,
                assignment_name: gradable.name + `(${gradable.id})`,
                name: gradable.name + ` (${gradable.id})`,
                score: gradeObj.grade ? gradeObj.grade : "ungraded", 
                //score: Math.min(gradeObj.current_grade, gradable.max_score),
                max_score: gradable.max_score,
                assignment_id: gradable.id,
                submitted_at: gradeObj.submitted_at ? gradeObj.submitted_at : gradeObj.graded_at,
                type: gradable.type,
                id: gradeObj.user_id,
            })
        }

    return grades
    // const assignmentArray = []
    // return assignmentId
}

function findGradable(gradables, gradeObj) {
    
    for(let gradable of gradables) {
        
        let sameNames = gradeObj.assignment_name === gradable.name
        if(sameNames) {
            return gradable
        }
    }
    return null
}

function isInteger(value) {
    return (parseInt(value,10).toString()===value) 
}

// TODO: rework assignment and grade scripts, get list of submissions for each assignment

// /api/v1/courses/${courseId}/assignments/${assignmentId}/submissions

export default async function CanvasGrades() {
    await google.authenticate()
    return await getCourses()
}

CanvasGrades()