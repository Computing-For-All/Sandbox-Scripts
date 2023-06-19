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
    console.log("data", metaData.data);
  });
  
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