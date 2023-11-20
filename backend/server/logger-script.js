import fs from "fs"
import * as csv from 'csv-string';
import { file } from "googleapis/build/src/apis/file/index.js";
import GoogleConnector from './utils/GoogleConnector.js'
import * as settings from './quarter-settings.js'
import {mapName} from './utils/utils.js'

let {QUARTER, YEAR, PROGRAM , LEVELS, ON_TIME_HOUR, ON_TIME_MINUTES, ATTENDANCE_PATH, GRADE_PATH, STUDENTS, SPREADSHEET_ID} = settings.FALL_23

//SECTION - ALL THIS SHOULD BE FALSE WHEN NOT TESTING
const DO_NOT_EDIT_MODE = true
const TEST_MODE = false
const SINGLE_FILE_MODE = false

//TODO change this every quarter
const blacklist = []
const dateColumnMap = new Map()
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000
const dataStartRow = 3
const dataEndRow = 1000
let startDateColumn = 'F'
let startDateRange = startDateColumn + '2'
let endDateRange = 'ZZ2'
let sheetPrefix = TEST_MODE ? 'Copy of Group' : 'Group'

//TODO - Change if you want a different path
const SECRET_PATH = './api_keys/secret.json'
let google = new GoogleConnector(sheetPrefix, SPREADSHEET_ID, SECRET_PATH)
let googleSheets 

function numToSSColumnLetter(num) {
    let columnLetter = "", t;

    while (num > 0) {
        t = (num - 1) % 26;
        columnLetter = String.fromCharCode(65 + t) + columnLetter;
        num = (num - t) / 26 | 0;
    }
    return columnLetter || undefined;
}

async function getDatesInSheet() {

    const metaData = await google.get(LEVELS[0], startDateRange + ":" + endDateRange)

    if (metaData.data.values.length == 0) return []

    let keys = metaData.data.values[0]

    keys.forEach((key, i) => {

        //TODO please remove this stupid hardcoded 7
        dateColumnMap.set(key, numToSSColumnLetter((startDateColumn.charCodeAt(0) - 64) + i))
    })

    return dateColumnMap
}

function getAttendanceData(csvFileName, namesInGroup, rows) {

    if (!namesInGroup) return

    let map = []

    namesInGroup.forEach(name => {

        map[name] = {
            clockIn: '',
            clockOut: '',
            minutes: 0
        }
    })

    rows.forEach((row, rowIndex) => {

        let [csvName, email, clockIn, clockOut, minutes, ...rest] = row

        let sheetName = mapName(namesInGroup, csvName)
        if (!sheetName) {
            if (!blacklist.includes(csvName)) {
                blacklist.push(csvName)
            }
            return
        }
        if (!map[sheetName]) return

        //this ensures that clockin time is accurate
        if (map[sheetName].clockIn === '') {
            map[sheetName].clockIn = formatTime(clockIn)
        }
        map[sheetName].clockOut = formatTime(clockOut)
        map[sheetName].minutes += parseInt(minutes)
    })

    return map
}

function formatTime(time) {

    let timeRegex = /\d\d:\d\d(?=:\d\d)/gm
    let periodRegex = /AM|PM/
    let hourAndMinutes = ''
    let period = ''

    try {
        hourAndMinutes = time.match(timeRegex)
        period = time.match(periodRegex)
    } catch (e) {
        console.log('period match not found')
    }

    return hourAndMinutes + period
}

async function exportDataToSheet(data, groupNum, column) {

    //add a feature that fills in gaps
    //todo hardcoded range pls fix

    let rowIndex = dataStartRow - 1

    sleep(1000)
    let existingData = (await google.get(groupNum, `${column}${dataStartRow}:${column}${dataEndRow}`)).data.values

    for(const [key, value] of Object.entries(data)) {

        //please add some if statements to make checks
        //check if the data in the row matches to the data in the thing
        if (!matchingRecordExists(rowIndex, existingData, value)) {
            console.log(`exporting record for ${key} on column '${column}' row ${rowIndex + 1} ${value.minutes} `)
            
            //if name does not exist, add it

            if (!DO_NOT_EDIT_MODE) {
                await exportStudentRecord(key, value, groupNum, rowIndex + 1, column)
            }
        }
        rowIndex += 5
    }
}

function matchingRecordExists(rowNum, existingData, newData) {

    let existingRecord = existingData.slice(rowNum - 2, rowNum + 1)

    if (existingRecord.length == 0) return false

    let clockInMatch = checkIfTimesMatch(existingRecord[0], newData.clockIn)
    let clockOutMatch = checkIfTimesMatch(existingRecord[1], newData.clockOut)
    let minutesMatch = (existingRecord[2][0] ? existingRecord[2][0] : '0') == newData.minutes

    return clockInMatch && clockOutMatch && minutesMatch
}

function checkIfTimesMatch(existingTime, newTime) {

    newTime = newTime.charAt(0) == '0' ? newTime.substring(1) : newTime

    if (existingTime.length == 0) {
        existingTime = ""
    } else {
        existingTime = existingTime[0].replace(" ", "")
    }

    return newTime == existingTime
}

async function exportStudentRecord(name, record, groupNum, rowNum, column) {

    let values = [[record.clockIn], [record.clockOut], [record.minutes]]

    await google.clear(groupNum, `${column + (rowNum)}:${column + (rowNum + 2)}`)
    sleep(1000)
    await google.append(sheetPrefix + groupNum, column, rowNum, values)
    sleep(1000)
    
}

function getDateFromRows(rows, dates) {
    //TODO this functions looks super trashy
    let date = rows[2][2]

    date = date.substring(0, date.indexOf(" "))

    let dateComponents = date.split("/")

    let month = dateComponents[0]
    let day = dateComponents[1]

    day = day.charAt(0) === '0' ? day.substring(1) : day

    date = month + "/" + day

    return date
}

function date2Column(rows, dates) {

    let date = getDateFromRows(rows, dates)

    if ((date.charAt(0) == '0')) {
        date = date.substring(1)
    }

    return dates.get(date)
}

function sleep(miliseconds) {
    const currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

async function updateQuarterlyHours(date) {
    

}

export default async function runLogger() {

    console.log('logger is running!')
    
    googleSheets = await google.authenticate()

    //map of dates to columns
    let dates = await getDatesInSheet()

    let sum = 0;
    STUDENTS.forEach(names => { sum += names.length })

    //todo change 
    let attendanceFiles = fs.readdirSync(ATTENDANCE_PATH)

    for (let i = 0; i < attendanceFiles.length; i++) {

        let csvFileName = attendanceFiles[i]

        if(SINGLE_FILE_MODE && csvFileName !== 'd10-26.csv') continue

        if (!csvFileName.includes('.csv')) continue

        let fileSyncData = fs.readFileSync(ATTENDANCE_PATH + csvFileName, 'utf8');
        //data from csv file
        let rows = csv.parse(fileSyncData)

        //update the date 

        for (let j = 0; j < STUDENTS.length; j++) {

            let data = getAttendanceData(ATTENDANCE_PATH + csvFileName, STUDENTS[j], rows)
            let date = getDateFromRows(rows, dates)

            await exportDataToSheet(data, LEVELS[j], date2Column(rows, dates))
        }
    }
}
