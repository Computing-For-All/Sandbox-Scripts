import fs from 'fs'
import * as csv from 'csv-string'
import { google } from 'googleapis'
const auth = await new google.auth.GoogleAuth({
  keyFile: 'secret.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
})
const client = await auth.getClient()
const googleSheets = google.sheets({ version: 'v4', auth: client })

//NOTE - Use copy relative path here!!!!!
let gradesPath = 'summer-22\\summer-22-attendance'
const spreadsheetId = '1PcW_dxZI4-zOYIJuTVhBwaYlg6JS5UJbDo_duZ3Yx1Y'
const OUTPUT_PATH = 'summer-22\\output\\attendanceData.csv'
const SINGLE_FILE_MODE = true


let output = ''
const groups = await getNamesInSheet()

export async function getNamesInSheet() {

  let g1 = ['Rayaan Ahmed', 'Mohamed Ali',
    'Ruwayda Ahmed', 'Kaleb Kebede',
    'Mebrahtu Baire', 'Hibak Abdullahi',
    'Gordon Tran', 'Racab Kebede',
    'Bilal Muhammed', 'Emmett Saldivar']

  let g2 = ['Abbas Kedir', 'Qasim Abdala',
    'Chaker Baloch', 'Adam Benazouz',
    'Jamie Forbes', 'Rodas Tekle',
    'Tao Hoang', 'Vicky Huang',
    'Ailin Rosario', 'Mohammed Ali']

  let g3 = ['Winnie Tran', 'Linh Pham',
    'Emmanuel Beku', 'Gary Hoang',
    'Elsabeth Assaye', 'Chloe Sow']

  let names = [g1,g2,g3]

  return names
}
//summer PAC   

export function getAttendance() {

  const files = fs.readdirSync(gradesPath)

  //first make the column names
  output = ''//'session, attendance date, is present?, student, hours, clock out, clock in\n'
  let groupLevels = [1,2,4]

  files.forEach((file, index) => {

    //now loop through each group
    //temp
    if(SINGLE_FILE_MODE && file != 'd7-28.csv') return

    groups.forEach((group, groupI) => {
      let { day, map } = appendAttendance(gradesPath + "/" + file, file,group)
      
      let groupNum = groupI+1

      for (const studentKey in map) {

        let level = groupLevels[groupI]
        let studentData = map[studentKey]

        let date = day.replace('.csv', '').replace('d', '').replace('-', '/')
        date += '/22'
        
        if(groupNum < 3) {
          let d = date.split('/')
          
          d.forEach((_,i) => d[i] = Number(d[i]))
          
          //after the date
          if(d[0] >= 8 && d[1] >= 3 && d[2] == 22) {
            level++

          }
          
        }
        
        let session = `PAP-2022-Summer-L${level}-G${groupNum}`

        let isPresent = studentData.status
        let hours = Math.floor(1000 * studentData.duration / 60) / 1000

        var d = new Date(),
        dformat = [d.getMonth()+1,
                    d.getDate(),
                    d.getFullYear()].join('/')+' '+
                    [d.getHours(),
                    d.getMinutes(),
                    d.getSeconds()].join(':');

        let { clockIn, clockOut } = studentData

        let rowStr = `${studentKey},${session},${date},${isPresent},${studentKey},${hours},${clockIn},${clockOut}`

        //let timeStamp = {clockIn:'undefined', clockOut:'undefined', duration:0, status: dayOfWeek === 5 ? "Present" : 'Absent'}
//dont add if it is a friday
if(hours !== 0 || new Date(date).getDay() !== 5)
        output += rowStr + '\n'
      }
    })
  })

  console.log(output)

  fs.writeFileSync(OUTPUT_PATH, output)
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

export function mapName(targetName, students) {
  if (targetName === 'undefined') return

  let output = null
  targetName = targetName.includes(' ') ? targetName.substring(0, targetName.indexOf(' ')) : targetName
  targetName = targetName.replace(' ', '').replace('’s', '')

  students.forEach((name, index) => {

    let lowerCaseName = name.toLowerCase().replace(' ', '')

    if (lowerCaseName.includes(targetName.toLowerCase())) {
      output = name
    }
  })

  return output
}

function appendAttendance(fileName, date, studentsInGroup) {

  const rawData = csv.parse(fs.readFileSync(fileName, 'utf-8'))

  let dayOfWeek = new Date(rawData[1][2]).getDay()
  let map = []

  studentsInGroup.forEach(studentName => {
    let timeStamp = { clockIn: '', clockOut: '', duration: 0, status: dayOfWeek === 5 ? "Present" : 'Absent' }
    map[studentName] = timeStamp
  });

  rawData.forEach((row, i) => {
    let name = row[0]
    let clockInTime = removeTrailingZeros(row[2].trim())
    let clockOutTime = removeTrailingZeros(row[3].trim())
    let duration = row[4]
    let closestName = mapName(name, studentsInGroup)
    
    if(name.toLowerCase().includes('mohammed')) {
      closestName = 'Mohamed Ali'
    }

    if (closestName == null) return

    if (map[closestName].clockIn == '') {

      map[closestName].clockIn = clockInTime;
      map[closestName].status = dayOfWeek === 5 ? "Present" : getStatus(getTimeFromDateStr(clockInTime))
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

  if (hour == "12") {
    if (minute < 40) {
      return "Present"
    } else {
      return "Late"
    }
  }

  return "Late"
}

getAttendance()