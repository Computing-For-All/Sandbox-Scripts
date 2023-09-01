import fs from 'fs'
import * as csv from 'csv-string'
import GoogleConnector from '../fall-22/util/GoogleConnector.js'

// TODO Quarterly update: spreadsheetId, groupLevels, gradesPath, potentially numGroups 
const QUARTER = 'Winter'
const YEAR = '2023'
const PROGRAM = 'PAP'
const LEVELS = [2,3,5]

const ON_TIME_HOUR = '4'
const ON_TIME_MINUTES = '15'
const CLASS_DAYS = [2,4] //date.getDay() Sun-Sat 0-6, 2=Tues, 4=Thur

let gradesPath = 'winter-23\\winter-23-attendance'
let sheetPrefix = 'Group'
let outputPath = 'winter-23\\attendanceData.csv'
const spreadsheetId = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000
const dataStartRow = 3
const dataEndRow = 1000
const secretPath = '../secret.json'

// NOTE these are for testing purposes
const SINGLE_FILE_MODE = true
const SINGLE_FILE_NAME = SINGLE_FILE_MODE ? '01-19.csv' : ''

let google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

function isClassDay(date) {

  let day = new Date(date).getDay()
  return CLASS_DAYS.includes(day)
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

export function getAttendance(groups) {
  const files = fs.readdirSync(gradesPath)

  //first make the column names
  let output = ''//'session, attendance date, is present?, student, hours, clock out, clock in\n'

  files.forEach((file, index) => {

    //now loop through each group

    if(SINGLE_FILE_MODE && file !== SINGLE_FILE_NAME) return

    groups.forEach((group, groupI) => {
      let { day, map } = appendAttendance(gradesPath + "/" + file, file,group)
      
      let groupNum = groupI+1

      for (const studentKey in map) {

        let level = LEVELS[groupI]
        let studentData = map[studentKey]

        let date = day.replace('.csv', '').replace('d', '').replace('-', '/')
        date += '/'+new Date().getFullYear();
        
        if(groupNum < 3) {
          let d = date.split('/')
          
          d.forEach((_,i) => d[i] = Number(d[i]))
          
          //after the date
          // if(d[0] >= 8 && d[1] >= 3 && d[2] == 22) {
          //   level++
          // }
          
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
  console.log('done!')
}

export function getTimeFromDateStr(date) {
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

export function mapName(csvName, names) {
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
    let closestName = mapName(name, studentsInGroup)

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

export function getStatus(clockIn) {

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

export async function Attendance() {
  await google.authenticate()

  let names = await getNamesInSheet()
  console.log(names)
  getAttendance(names)
} 

Attendance()