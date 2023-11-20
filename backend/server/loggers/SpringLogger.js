import fs from "fs"
import * as csv from 'csv-string';
import GoogleConnector from '../util/GoogleConnector.js'
import { file } from "googleapis/build/src/apis/file/index.js";

//todo change this every quarter
//const spreadsheetId = '10YeTxdb7ae9h2POr4hrygkk-E59uXWrStBSSGpsOdUk'
//SYEP
const spreadsheetId = '1iEfB0IxODjaZKhm-XLv6WSfkoIe6HWTK9JgtCeRJ__o'
const blacklist = []
const dateColumnMap = new Map()
const numGroups = 3
const nameStartRow = 3
const nameStartCol = 'A'
const nameEndRow = 1000
const dataStartRow = 3
const dataEndRow = 1000

const DO_NOT_EDIT_MODE = false
const TEST_MODE = false
const SINGLE_FILE_TEST_MODE = false

//use these variables when you only want the script to run with only 1 specified file
const SINGLE_TEST_FILE_NAME = SINGLE_FILE_TEST_MODE ? '03-28.csv' : '' 

const rootPath = '../spring_data/'

const dateRow = '2'
const startDateColumn = 'F'
const startDateRange = startDateColumn + dateRow
const endDateRange = 'ZZ2'
const sheetPrefix = TEST_MODE ? 'Copy of Group' : 'Group'

let google = new GoogleConnector(sheetPrefix, spreadsheetId)

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

function numToSSColumnLetter(num) {
    let columnLetter = "",
        t;

    while (num > 0) {
        t = (num - 1) % 26;
        columnLetter = String.fromCharCode(65 + t) + columnLetter;
        num = (num - t) / 26 | 0;
    }
    return columnLetter || undefined;
}

async function getDatesInSheet() {

    const metaData = await google.get(1, startDateRange + ":" + endDateRange)

    if (metaData.data.values.length == 0) return []

    let keys = metaData.data.values[0]

    keys.forEach((key, i) => {

        //TODO please remove this stupid hardcoded 7
        dateColumnMap.set(key, numToSSColumnLetter((startDateColumn.charCodeAt(0) - 64) + i))
    })

    return dateColumnMap
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

    rows.forEach((row) => {

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

    let rowIndex = dataStartRow-1

    sleep(1000)

    let existingData = (await google.get(groupNum, `${column}${dataStartRow}:${column}${dataEndRow}`)).data.values

    for (const [key, value] of Object.entries(data)) {

        //please add some if statements to make checks
        //check if the data in the row matches to the data in the thing
        if (!matchingRecordExists(rowIndex, existingData, value)) {
            console.log(`exporting record for ${key} on column '${column}' row ${rowIndex+1} ${value.minutes}`)

            if (!DO_NOT_EDIT_MODE) {
                await exportStudentRecord(key, value, groupNum, rowIndex+1, column)
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

function mapName(names, csvName) {
    //lower case
    //separate the name into first and last
    let matchingSheetName = null

    //loop through sheet names
    names?.forEach((sheetName, index) => {

        let cleanedSheetFullName = sheetName.toLowerCase().split(" ")
        let cleanedCsvFullName = cleanCsvName(csvName).split(" ")

        if (cleanedCsvFullName[0] == cleanedSheetFullName[0]) {
            matchingSheetName = sheetName
        }

        //todo handle duplicates here
        if (cleanedCsvFullName[0] == 'jonathan' && cleanedCsvFullName[1] == 'chan') {
            matchingSheetName = null
        }

        if (cleanedCsvFullName[0] == 'john') {
            matchingSheetName = 'Jonathan Steshuk'
        }

        if (cleanedCsvFullName[0] == 'hoàng' && cleanedCsvFullName[1] == 'bảo') {
            matchingSheetName = 'Halie Le'
        }

        if (cleanedCsvFullName[0] === 'sahramohamad') {
            matchingSheetName = 'Sahra Mohamed'
        }

        if (cleanedCsvFullName[0] === 'sahramohamad') {
            matchingSheetName = 'Sahra Mohamed'
        }
        if (cleanedCsvFullName[0].startsWith('adam') && cleanedCsvFullName[1] == 'iphone') {

            matchingSheetName = "Adam Benazouz"
        }

        if(!cleanCsvName(csvName).includes('alvarez') && cleanedCsvFullName[0] === 'bryan') {
            matchingSheetName = 'Brian Yuan'
        }
    })

    return matchingSheetName
}

//row num for each person

async function main() {

    await google.authenticate()

    //map of dates to columns
    let dates = await getDatesInSheet()

    let sheetNames = await getNamesInSheet()

    let sum = 0;
    sheetNames.forEach(names => { sum += names.length })

    let attendanceFiles = fs.readdirSync(rootPath)

    for (let i = 0; i < attendanceFiles.length; i++) {

        let csvFileName = attendanceFiles[i]

       if(SINGLE_FILE_TEST_MODE && csvFileName !== SINGLE_TEST_FILE_NAME) continue

        if (!csvFileName.includes('.csv')) continue

        let fileSyncData = fs.readFileSync(rootPath + csvFileName, 'utf8');
        //data from csv file
        let rows = csv.parse(fileSyncData)

        for (let j = 0; j < sheetNames.length; j++) {

            let data = getAttendanceData(rootPath + csvFileName, sheetNames[j], rows)
            //date = getDateFromRows(rows,dates)
            await exportDataToSheet(data, j + 1, date2Column(rows, dates))
        }
    }
}

function getDateFromRows(rows, dates) {
    //TODO this functions looks super trashy
    let date = rows[1][2]

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
    
    date = date.charAt(0) === '0' ? date.substring(1) : date 

    return dates.get(date)
}

function sleep(miliseconds) {
    const currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

async function attendanceReport() {
    await google.authenticate()

    console.log('/////////////////////////////////////////////////')
    console.log("Attendance report!\n\nHours Missing\n")
    console.log('/////////////////////////////////////////////////')

    for(let i = 0; i < numGroups; i++) {
        let data = (await google.get(i+1, `${'A'}${3}:${'C'}${1000}`)).data.values
        
        let output = ""

        data.forEach(record => {
            if(record.length == 0) return
            if(record[2] == 0) return
            if(record[0] == '') return

            output += `${record[0]} ${record[2]}\n`
        })

        console.log(output)
    }
}
//attendanceReport()
main()