// import csvMain from './csv.js'
// import fs from 'fs'
// import canvas from './canvas.js'
// const GRADE_PATH = './canvas'
// //TEMP
// const SPREADSHEET_ID_TEST = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'

// //go through each canvas file
// const files = fs.readdirSync(GRADE_PATH)

// let gradeOutput = './output/grades.txt'
// let assignmentOutput = './output/assignment.txt'

// let gradeContent = ''
// let assignmentContent = ''

// async function main() {

//     await files.forEach(async (file, index) => {

//         if(index !== 0) return
    
//         let data = await csvMain(file, SPREADSHEET_ID_TEST, new Map(), new Map())
    
//         gradeContent += data[0]
        
//         assignmentContent += data[1]
//     })
    
//     fs.writeFileSync(gradeOutput, gradeContent)
//     fs.writeFileSync(assignmentOutput, assignmentContent)
// }

// main()