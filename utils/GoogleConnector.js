import { google } from 'googleapis'

class GoogleConnector {

    constructor(sheetPrefix, spreadsheetId, secretPath) {
        this.auth;
        this.client;
        this.googleSheets;
        this.spreadsheetId = spreadsheetId;
        this.sheetPrefix = sheetPrefix;
        this.secretPath = secretPath
        this.numGroups = 3
        this.nameStartRow = 3
        this.nameStartCol = 'A'
        this.nameEndRow = 1000
    }

    async authenticate() {
        console.log('Authenicating...')
        this.auth = await new google.auth.GoogleAuth({
            keyFile: this.secretPath,
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        })
        this.client = await this.auth.getClient()
        this.googleSheets = google.sheets({ version: 'v4', auth: this.client })

        console.log('Authenticated!')
    }

    async clear(groupNum, range) {
        await this.googleSheets.spreadsheets.values.clear({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetPrefix}${groupNum}!${range}`
        })
    }

    async get(groupNum, range) {
        const metaData = await this.googleSheets.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetPrefix}${groupNum}!${range}`
        })
        return metaData
    }

    async append(sheetName, column, rowNum, values) {
        await this.googleSheets.spreadsheets.values.append({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}!${column}${rowNum}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values
            }
        })
    }

    async getNamesInSheet() {
    
        let names = []
      
        for (let groupIndex = 1; groupIndex <= this.numGroups; groupIndex++) {
            const metaData = await this.get(groupIndex, `${this.nameStartCol}${this.nameStartRow}:${this.nameStartCol}${this.nameEndRow}`)
      
            metaData.data.values.forEach((element, i) => {
      
                metaData.data.values[i] = element[0]
            })
            metaData.data.values = metaData.data.values.filter(name => name && name !== "FIRST LAST")
      
            names.push(metaData.data.values)
        }
      
        return names
      }
}

export default GoogleConnector