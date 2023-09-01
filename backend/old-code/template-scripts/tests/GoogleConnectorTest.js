import GoogleConnector from "../utils/GoogleConnector.js";

let sheetPrefix = 'Group'
const spreadsheetId = '1Qvt60nLweuR_mhHvVI-hjkjUrHsynQCygfraVK2siDo'
let secretPath = '..\\utils\\secret.json'
let google = new GoogleConnector(sheetPrefix, spreadsheetId, secretPath)

export async function test() {
    await google.authenticate()
  
    let metaData = await google.get(1,'$A1:$A20')

    console.log(metaData.data)
  } 

  test()