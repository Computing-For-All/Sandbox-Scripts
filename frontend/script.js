// const ExcelJS = require('exceljs');
// // import ExcelJS from "exceljs/lib/exceljs.nodejs";
// // const fs = require('fs');

// const workbook = new ExcelJS.Workbook();
// workbook.xlsx.readFile('./templates/grade-template.xlsx')
//     .then(function() {
//         // Get the worksheet you want to work with
//         const worksheet = workbook.getWorksheet(1);

//         // Update data in the worksheet
//         worksheet.getCell('d2').value = 'Student Name';
//         worksheet.getCell('E2').value = 'Grade';
//         worksheet.getCell('F2').value = 'John Doe';
//         worksheet.getCell('F2').value = 90;
//         console.log("hey")
//         // Save the modified file
//         // return workbook.xlsx.writeFile('output.xlsx');
//     })
//     .then(function() {
//         console.log('File is written');
//     })
//     .catch(function(error) {
//         console.error(error);
//     });

//------------------------------

const csvmaker = function (data) {
  // Empty array for storing the values
  csvRows = []
  // Headers is basically a keys of an object
  const headers = ["Name", ""]
  // As for making csv format, headers must
  // be separated by comma and pushing it
  // into array
  csvRows.push(headers.join(','));
  
  // Pushing Object values into array
  // with comma separation
  const values = data.split(',');
  // console.log(data);
  csvRows.push(values)
  
  console.log(csvRows.join('\n'));
  // console.log(csvRows)
  // Returning the array joining with new line 
  return csvRows.join('\n')
}
const download = function (data) {
  // Creating a Blob for having a csv file format 
  // and passing the data with type
  const blob = new Blob([data], { type: 'text/csv' });

  // Creating an object for downloading url
  const url = window.URL.createObjectURL(blob)

  // Creating an anchor(a) tag of HTML
  // const a = document.createElement('a')

  // Passing the blob downloading url 
  // a.setAttribute('href', url)
  $("#grades-btn").attr('href', url);
  // Setting the anchor tag attribute for downloading
  // and passing the download file name

  // a.setAttribute('download', 'download.csv');
  $("#grades-btn").attr('download', 'download.csv');
}


async function serverTest() {
  // const data = await axios.post('http://localhost:5000/',{ data: {message:'message!'}})
  // console.log(data)

  const res = await axios.post('http://localhost:5000/', { answer: 42 });
  console.log(res.data.data);
}

$(document).ready(async function() {

  // Runs the Grades downloader + shows loading indicator while awaiting
  $("#runCanvasScript").click(async function(evt) {
    evt.preventDefault();
    console.log("run canvas clicked");
    $("#gradeLoading").addClass('visible').removeClass('invisible');

    window.location = 'http://localhost:5000/generate/grades/xlsx';

    $("#gradeLoading").removeClass('visible').addClass('invisible');
    // let metaData = await axios.post('http://localhost:5000/generate/grades/xlsx');
    // $("#gradeLoading").removeClass('visible').addClass('invisible');

    // console.log(metaData.data[0]);
    // const csvdata = csvmaker(metaData.data[0]);
    // download(csvdata);
  });

  
  // Runs the Assignments downloader + shows loading indicator while awaiting
  $("#runGenerateAssignments").click(async function(evt) {
    evt.preventDefault();
    console.log("run canvas clicked");
    $("#gradeLoading").addClass('visible').removeClass('invisible');

    window.location = 'http://localhost:5000/generate/assignments/xlsx';

    $("#gradeLoading").removeClass('visible').addClass('invisible');
  });

  // $(".fa-download").click(async function() { 

  // });
  
  // 
  $("#runGenerateAttendance").click(function(evt) {
    // Add logic to upload selected files -> store to local storage 
    // -> parses file -> hit run spreadsheet
    evt.preventDefault();
    // $("#gradeLoading").addClass('visible').removeClass('invisible');

    window.location = 'http://localhost:5000/generate/attendance/xlsx';

    // $("#gradeLoading").removeClass('visible').addClass('invisible');
    console.log("upload clicked");
  });
  
  // Runs Zoom script spreadsheet uses attendance folder to output attendance csv -> sends request to server with config files
  // TODO: Needs to use upload files in the future
  $("#runAttendanceLogger").click(function() {
    axios.post('http://localhost:5000/run/attendance-spreadsheet')
    console.log("run spreadsheet clicked");
  });
});