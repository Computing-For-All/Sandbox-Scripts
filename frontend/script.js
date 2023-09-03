const csvmaker = function (data) {
  
  // Empty array for storing the values
  csvRows = [];

  // Headers is basically a keys of an object
  // which is id, name, and profession
  const headers = Object.keys(data);

  // As for making csv format, headers must
  // be separated by comma and pushing it
  // into array
  csvRows.push(headers.join(','));

  // Pushing Object values into array
  // with comma separation
  const values = Object.values(data).join(',');
  csvRows.push(values)

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
  $(".fa-download").attr('href', url);
  // Setting the anchor tag attribute for downloading
  // and passing the download file name

  // a.setAttribute('download', 'download.csv');
  $(".fa-download").attr('download', 'download.csv');
  // Performing a download with click
  $(".fa-download").click()
  // a.click()
}

//very funny 
async function serverTest() {
  // const data = await axios.post('http://localhost:5000/',{ data: {message:'message!'}})
  // console.log(data)

  const res = await axios.post('http://localhost:5000/', { answer: 42 });
  console.log(res.data.data);
}

$(document).ready(async function() {

  // Runs the Canvas Script + shows loading indicator while awaiting
  $("#runCanvasScript").click(async function() {    
    console.log("run canvas clicked");
    $("#gradeLoading").addClass('visible').removeClass('invisible');
    let metaData = await axios.post('http://localhost:5000/run/grades');
    $("#gradeLoading").removeClass('visible').addClass('invisible');
    const csvdata = csvmaker(metaData.data[0]);
    download(csvdata);
    console.log("data", metaData.data[0]);
  });
  // $(".fa-download").click(async function() { 

  // });
  
  // 
  $("#attendanceUpload").click(function() {
    // Add logic to upload selected files -> store to local storage 
    // -> parses file -> hit run spreadsheet
    console.log("upload clicked");
  });
  
  // Runs Zoom script spreadsheet uses attendance folder to output attendance csv -> sends request to server with config files
  // TODO: Needs to use upload files in the future
  $("#runSpreadsheetScript").click(function() {
    console.log("run spreadsheet clicked");
    axios.post('http://localhost:5000/run/attendance')
  });
  
  // 
  $("#runSyepScript").click(function() {
    axios.post('http://localhost:5000/test');
    console.log("run syep clicked");
  });
});

// NOTE - Fix the i -> a , and fix the script for the csvmaker function