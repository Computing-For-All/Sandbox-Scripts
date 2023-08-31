# Overview
Full database documentation can be found on the Google Drive [here](https://docs.google.com/document/d/1qSwBaA82GkIyHbg0wV6XWvTuRExl-32aYE8o44q2CL0/edit)

Scripts for parsing data are located in:

        backend > server

## Updating Attendance

- Download attendance CSV files from [Zoom](https://us02web.zoom.us/account/report/user)

        Go to: set [From - To] date > click search > click participants number > Export

- Place CSV files into: server > data> zoom data.

- Run attendance.js [data will be parsed then exported in the output folder]

- Download template from [Microsoft Dynamics](https://cfahelpdesksandbox.crm.dynamics.com/main.aspx?appid=4fdc49ee-ddae-eb11-8236-000d3a5b030a&forceUCI=1&pagetype=entitylist&etn=contact)

- Paste exported data into template then upload to [Microsoft Dynamics](https://cfahelpdesksandbox.crm.dynamics.com/main.aspx?appid=4fdc49ee-ddae-eb11-8236-000d3a5b030a&forceUCI=1&pagetype=entitylist&etn=contact)


## Updating Grades

- Download grades CSV files from [Canvas](https://computingforall.instructure.com/) Grades

        Go to: course > gradebook > export > export entire gradebook
    
- Place CSV files into: server > data> canvas data.

- Run grade.js [data will be parsed then exported in the output folder]

- Download template from [Microsoft Dynamics](https://cfahelpdesksandbox.crm.dynamics.com/main.aspx?appid=4fdc49ee-ddae-eb11-8236-000d3a5b030a&forceUCI=1&pagetype=entitylist&etn=contact)

- Paste exported data into template then upload to [Microsoft Dynamics](https://cfahelpdesksandbox.crm.dynamics.com/main.aspx?appid=4fdc49ee-ddae-eb11-8236-000d3a5b030a&forceUCI=1&pagetype=entitylist&etn=contact)

## How to update script files at the start of every quarter

1. Open the script file (attendance.js or grade.js)
2. Ctrl + f for the TODO comment, this will list the fields to be updated, likely:

        - spreadsheetId (this pulls names, not needed if hard-coded)

        - QUARTER

        - YEAR

        - PROGRAM

        - LEVELS

        - END_DATE

        - group

        - students array (only if hard-coded students at the end)