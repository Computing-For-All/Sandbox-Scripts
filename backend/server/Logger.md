# Logger.js

## Purpose

Logger.js is meant to take zoom attendance data in the form of csv files and upload it onto a google sheet.

## How to Use

### 1. Set up zoom log sheet for new quarter
1. In the first row on top of the dates you will see hours like "2.75" for each class day. Verify that this number is filled in for each class that has happened since the last time you ran the script. Class days that have not happened yet should not be filled in.
### This is going to updated 


### 2. Download attendance date from zoom
1.  Go to [zoom.us](https://zoom.us/)
2.  Sign in. If already signed in, go to "My Account"
3.  Go to Account Management -> Reports -> Active Hosts
4.  You will now see a list of all meetings
5.  To download a meeting, click on the number in the participants column highlighted in blue
6.  Click Export, this should download the meeting file locally
7.  Name that downloaded file after the date. Example: "d8-02.csv"
8.  Repeat steps 5 - 7 for every meeting desired
9.  Go back to VS Code, have this Sandbox-Scripts project open
10. Place the csv files here:
    "backend/server/input/[quarter]-[year]-attendance"

### DISCLAIMER : If the student hours is wrong it's most likely for these reason:
1. They joined in the zoom with the wrong/different name (check inside of utils.js to adjust for it)
2. If you're running the script the same day as a class day but don't have that day's attendence data, it will assume they all missed today's hours //NEEDS TO BE VERIED