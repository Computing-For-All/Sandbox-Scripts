const CLASS_DAYS = [2,4] //date.getDay() Sun-Sat 0-6, 2=Tues, 4=Thur

export function isClassDay(date) {
    let day = new Date(date).getDay()
    return CLASS_DAYS.includes(day)
}

  export function cleanCsvName(csvName) {
    csvName = csvName.toLowerCase();
    csvName = csvName.replace(/[0-9]/g, '');
    //remove pronouns
    if (csvName.includes('(')) {
        csvName = csvName.substring(0, csvName.lastIndexOf(" "))
    }
  
    return csvName
  }

  export function mapName(csvName, names) {
    let matchingSheetName = null
  
      //loop through sheet names
      names?.forEach((sheetName) => {
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