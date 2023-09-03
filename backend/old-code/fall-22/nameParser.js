import fs from 'fs'

let data  = fs.readFileSync('./students/g1.txt', 'utf-8')

console.log(data.split('\n'))