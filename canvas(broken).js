import fs from 'fs'
import axios from 'axios'
import GoogleConnector from './utils/GoogleConnector.js'
import { CANVAS_KEY } from './utils/keys.js'
//fuck it, get a list of all assignments and quizzes
// {name, date submitted}

const token = CANVAS_KEY    
const prefix = 'https://computingforall.instructure.com/'
const suffix = `?access_token=${token}`

const winterSpreadsheetId = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'
const fallSpreadsheetId = '1FAaVUgrKbSvVj6Nqt4rJQ4HsvwhP6ZcX-2mQ99AjuF0'
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000
const dataStartRow = 3
const dataEndRow = 1000
const secretPath = '../template-scripts/utils/secret.json'
let sheetPrefix = 'Group'

//TEMP

export default async function canvas() {

    let map = {}

    let courses = await getCourses()

    return map
} 

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
        const metaDataCourse = await axios.get(getStudentsInCourseUrl)
        const students = metaDataCourse.data
        
        const enollmentsURL = `${prefix}/api/v1/courses/${course.id}/enrollments${suffix}`
        const metaDataEnrollments = await axios.get(enollmentsURL)
        const enrollments = metaDataEnrollments.data

        const gradesURL = `${prefix}/api/v1/courses/${course.id}/gradebook_history/feed${suffix}&assignment_id=2322`
        const metaDataGrades = await axios.get(gradesURL)
        const grades = metaDataGrades.data
        
        fs.writeFileSync('s.txt',  JSON.stringify(grades))
        
        index++
        } catch(err) {
            console.log(err.message)
        }   
    }

    fs.writeFileSync('output/canvas-assignments.csv', output)
    return output
}