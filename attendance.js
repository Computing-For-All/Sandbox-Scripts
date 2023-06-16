import fs from 'fs'
import * as csv from 'csv-string'
import GoogleConnector from './utils/GoogleConnector.js'
import {isClassDay, mapName} from './utils/utils.js'

// TODO Quarterly update: spreadsheetId, groupLevels, gradesPath, potentially numGroups 
const QUARTER = 'Spring'
const YEAR = '2023'
const PROGRAM = 'PAP'
const LEVELS = [1,4,6]

const END_DATE = '3/15/23'

const ON_TIME_HOUR = '4'
const ON_TIME_MINUTES = '15'

let attendancePath = PATHS.ZOOM_DATA
const secretPath = PATHS.ZOOM_KEY
const spreadsheetId = '10YeTxdb7ae9h2POr4hrygkk-E59uXWrStBSSGpsOdUk'
let outputPath = 'attendance.csv'
let sheetPrefix = 'Group'
const dataStartRow = 3
const dataEndRow = 1000

// NOTE these are for testing purposes
const SINGLE_FILE_MODE = false
const SINGLE_FILE_NAME = SINGLE_FILE_MODE ? 'test.csv' : ''

let google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

function getAttendance(groups) {
  const files = fs.readdirSync(attendancePath)

  //first make the column names
  let output = ''//'session, attendance date, is present?, student, hours, clock out, clock in\n'

  files.forEach((file, index) => {

    //now loop through each group

    if(SINGLE_FILE_MODE && file !== SINGLE_FILE_NAME) return

    groups.forEach((group, groupI) => {
      let { day, map } = appendAttendance(attendancePath + "/" + file, file,group)
      
      let groupNum = groupI+1

      for (const studentKey in map) {

        let level = LEVELS[groupI]
        let studentData = map[studentKey]

        let date = day.replace('.csv', '').replace('d', '').replace('-', '/')
        date += '/'+new Date().getFullYear();
        
        if(groupNum < 3) {
          let d = date.split('/')
          
          d.forEach((_,i) => d[i] = Number(d[i]))
        }
        
        let session = `${PROGRAM}-${YEAR}-${QUARTER}-L${level}-G${groupNum}`

        let isPresent = studentData.status
        let hours = Math.floor(1000 * studentData.duration / 60) / 1000

        let { clockIn, clockOut } = studentData
        
        let rowStr = `${studentKey},${session},${date},${isPresent},${studentKey},${hours},${clockIn},${clockOut}`

        // If Tues/Thur(class) add record, else if not class and has hours also add record
        
        if(isClassDay(date)) {
          output += rowStr + '\n'
        }
        else if(hours > 0 && isPresent === 'Present') {

          output += rowStr + '\n'
        }  
      }
    })
  })

  fs.writeFileSync(outputPath, output)
  return output
}

function getTimeFromDateStr(date) {
  return date.substring(date.indexOf(" ") + 1, date.lastIndexOf(':')) + date.substring(date.lastIndexOf(' '), date.length)
}

function removeTrailingZeros(date) {

  let d = date.split('/')

  d.forEach((string,i) => {
    if(string.charAt(0) === '0') {
      d[i] = d[i].substring(1)
    }
  })

  return `${d[0]}/${d[1]}/${d[2]}`
}

function appendAttendance(fileName, date, studentsInGroup) {

  const rawData = csv.parse(fs.readFileSync(fileName, 'utf-8'))

  let dayOfWeek = new Date(rawData[1][2]).getDay()
  let map = []

  studentsInGroup.forEach(studentName => {
    let timeStamp = { clockIn: '', clockOut: '', duration: 0, status: 'Absent' }
    map[studentName] = timeStamp
  });

  rawData.forEach((row, rowIndex) => {

    //skips first row because it only contains column names and not actual data
    if(rowIndex == 0) return

    let name = row[0]
    let clockInTime = removeTrailingZeros(row[2].trim())
    let clockOutTime = removeTrailingZeros(row[3].trim())

    let duration = row[4]
    let closestName = mapName(name, studentsInGroup) //todo fix this!!!!! returns null for some reason

    if (closestName == null) return

    if(map[closestName] == null) return

    if (map[closestName].clockIn == '') {
      map[closestName].clockIn = clockInTime;
      map[closestName].status = getStatus(getTimeFromDateStr(clockInTime))
    }

    map[closestName].clockOut = clockOutTime
    map[closestName].duration += Number(duration)
  })


  return {
    day: date,
    map
  }
}

function getStatus(clockIn) {

  let hour = clockIn.substring(0, clockIn.indexOf(":"))
  let minute = Number(clockIn.substring(clockIn.indexOf(":")+1, clockIn.lastIndexOf(' ')))

  if (hour == ON_TIME_HOUR) {
    if (minute < ON_TIME_MINUTES) {
      return "Present"
    } else {
      return "Late"
    }
  } else if(hour < ON_TIME_HOUR) {
    return 'Present'
  } 
  return "Late"
}

export default async function Attendance() {
  await google.authenticate()

  let names = await google.getNamesInSheet()
  return getAttendance(names)
} 

Attendance()