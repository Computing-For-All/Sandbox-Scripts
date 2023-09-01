import { google } from 'googleapis'

class GoogleConnector {

    constructor(sheetPrefix, spreadsheetId, secretPath) {
        this.auth;
        this.client;
        this.googleSheets;
        this.spreadsheetId = spreadsheetId;
        this.sheetPrefix = sheetPrefix;
        this.secretPath = secretPath
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

    
}

export default GoogleConnector