const CLASS_DAYS = [2, 4]; //date.getDay() Sun-Sat 0-6, 2=Tues, 4=Thur

export function isClassDay(date) {
  let day = new Date(date).getDay();
  return CLASS_DAYS.includes(day);
}

function cleanCsvName(csvName) {
  // console.log(csvName)
  csvName = csvName.toLowerCase();
  csvName = csvName.replace(/[0-9]/g, '');

  
  //remove pronouns
  if (csvName.includes('(') && csvName.includes(')') && csvName.includes(' ')) {
      csvName = csvName.substring(0, csvName.lastIndexOf(" "))
  }

  return csvName
}

export function mapName(names, csvName) {
  //lower case
  //separate the name into first and last
  let matchingSheetName = null;

  // console.log(csvName)
  // console.log(cleanCsvName(csvName).split(" "))

  //loop through sheet names
  // if(typeof names === "string") names = [names]
  names?.forEach((sheetName, index) => {
    let cleanedSheetFullName = sheetName.toLowerCase().split(" ");
    let cleanedCsvFullName = cleanCsvName(csvName).split(" ");
    
    if (cleanedCsvFullName[0] == cleanedSheetFullName[0]) {
      matchingSheetName = sheetName;
    }

    //TODO handle duplicates here
    if (
      cleanedCsvFullName[0] == "jonathan" &&
      cleanedCsvFullName[1] == "chan"
    ) {
      matchingSheetName = null;
    }

    if (cleanedCsvFullName[0] == "john") {
      matchingSheetName = "Jonathan Steshuk";
    }

    if (cleanedCsvFullName[0] == "hoàng" && cleanedCsvFullName[1] == "bảo") {
      matchingSheetName = "Halie Le";
    }

    if (cleanedCsvFullName[0] === "sahramohamad") {
      matchingSheetName = "Sahra Mohamed";
    }
    if (cleanedCsvFullName[0] === "sahramohamad") {
      matchingSheetName = "Sahra Mohamed";
    }
    if (cleanedCsvFullName[0] === "jian") {
      matchingSheetName = "Jian Fu Chen";
    }
    if (cleanedCsvFullName[0] === "(xiuyi)jasmine") {
      matchingSheetName = "Xiuyi Li";
    }
    if (cleanedCsvFullName[0] === "XIUYI") {
      matchingSheetName = "Xiuyi Li";
    }
    if (cleanedCsvFullName[0] === "xiuyili (justin)") {
      matchingSheetName = "Xiuyi Li";
    }
    if (cleanedCsvFullName[0] === "justin") {
      matchingSheetName = "Xiuyi Li";
    }
    if (cleanedCsvFullName[0] === "jasmine") {
      matchingSheetName = "Xiuyi Li";
    }
    if (cleanedCsvFullName[0] == "nsereko" && cleanedCsvFullName[1] == "colline") {
      matchingSheetName = "Collins Nsereko";
    }
    if (cleanedCsvFullName[0] === "camrynlee") {
      matchingSheetName = "Camryn Lee";
    }
    
    if(cleanedCsvFullName[0] == "christinaellenburg") {
      matchingSheetName = "Christina Ellenburg";
    }

    if (cleanedCsvFullName[0] == "nsereko" && cleanedCsvFullName[1] == "collins") {
      matchingSheetName = "Collins Nsereko";
    }

    if (cleanedCsvFullName[0] === "kevin" && cleanedCsvFullName[1] == "duc") {
      matchingSheetName = "Kevin Tran";
    }

  });

  return matchingSheetName;
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
