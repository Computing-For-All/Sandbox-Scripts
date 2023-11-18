// Require library
import xl from 'excel4node';
import path from 'path'


export default function GenerateAssignmentsXLSX(rowsData, filename = 'Assignments Excel Spreadsheet') {

  // Create a new instance of a Workbook class
  const wb = new xl.Workbook();
  
  // Add Worksheets to the workbook
  const ws = wb.addWorksheet('Course Assessment');
  
  // Create a reusable style
  const headerStyle = wb.createStyle({
    fill: {
      fgColor: '4273C5',
      patternType: 'solid',
      type: 'pattern',
    },
    font: {
      bold: true,
      color: 'FFFFFF',
      size: 11,
    },
  });
  const normalEvenLeftStyle = wb.createStyle({
    border: {
      left: {
          style: 'thin',
          color: '8FABDC'
      },
      top: {
        style: 'thin',
        color: '8FABDC'
      },
      bottom: {
        style: 'thin',
        color: '8FABDC'
      },
    },
    fill: {
      fgColor: 'DAE2F2',
      patternType: 'solid',
      type: 'pattern',
    },
    font: {
      color: '000000',
      size: 11,
    },
  });
  const normalEvenCenterStyle = wb.createStyle({
    border: {
      top: {
        style: 'thin',
        color: '8FABDC'
      },
      bottom: {
        style: 'thin',
        color: '8FABDC'
      },
    },
    fill: {
      fgColor: 'DAE2F2',
      patternType: 'solid',
      type: 'pattern',
    },
    font: {
      color: '000000',
      size: 11,
    },
  });
  const normalEvenRightStyle = wb.createStyle({
    border: {
      right: {
        style: 'thin',
        color: '8FABDC'
      },
      top: {
        style: 'thin',
        color: '8FABDC'
      },
      bottom: {
        style: 'thin',
        color: '8FABDC'
      },
    },
    fill: {
      fgColor: 'DAE2F2',
      patternType: 'solid',
      type: 'pattern',
    },
    font: {
      color: '000000',
      size: 11,
    },
  });
  const normalOddLeftStyle = wb.createStyle({
    border: {
      left: {
          style: 'thin',
          color: '8FABDC'
      },
      top: {
        style: 'thin',
        color: '8FABDC'
      },
      bottom: {
        style: 'thin',
        color: '8FABDC'
      },
    },
    font: {
      color: '000000',
      size: 11,
    },
  });
  const normalOddCenterStyle = wb.createStyle({
    border: {
      top: {
        style: 'thin',
        color: '8FABDC'
      },
      bottom: {
        style: 'thin',
        color: '8FABDC'
      },
    },
    font: {
      color: '000000',
      size: 11,
    },
  });
  const normalOddRightStyle = wb.createStyle({
    border: {
      right: {
        style: 'thin',
        color: '8FABDC'
      },
      top: {
        style: 'thin',
        color: '8FABDC'
      },
      bottom: {
        style: 'thin',
        color: '8FABDC'
      },
    },
    font: {
      color: '000000',
      size: 11,
    },
  });
  
  ws.row(1).filter();
  ws.column(1).setWidth(20.86);
  ws.column(2).setWidth(14.43);
  ws.column(3).setWidth(26.57);
  ws.column(4).setWidth(41.29);
  ws.column(5).setWidth(41.29);
  ws.column(6).setWidth(41.29);
  ws.column(7).setWidth(41.29);
  
  ws.cell(1, 1).string('(Do Not Modify) CourseAssessment').style(headerStyle);
  ws.cell(1, 2).string('(Do Not Modify) Row Checksum').style(headerStyle);
  ws.cell(1, 3).string('(Do Not Modify) Modified On').style(headerStyle);
  ws.cell(1, 4).string('Name').style(headerStyle);
  ws.cell(1, 5).string('Session').style(headerStyle);
  ws.cell(1, 6).string('Assessment Type').style(headerStyle);
  ws.cell(1, 7).string('Max Points').style(headerStyle);
  
  
  let rowNum = 2;
  for (const [name, session, assessmentType, maxPoints] of rowsData) {
    const currentLeftStyle = (rowNum % 2 === 0) ? normalEvenLeftStyle : normalOddLeftStyle;
    const currentCenterStyle = (rowNum % 2 === 0) ? normalEvenCenterStyle : normalOddCenterStyle;
    const currentRightStyle = (rowNum % 2 === 0) ? normalEvenRightStyle : normalOddRightStyle;
  
    ws.cell(rowNum, 1).style(currentLeftStyle);
    ws.cell(rowNum, 2).style(currentCenterStyle);
    ws.cell(rowNum, 3).style(currentCenterStyle);
    ws.cell(rowNum, 4).string(name).style(currentCenterStyle);
    ws.cell(rowNum, 5).string(session).style(currentCenterStyle);
    ws.cell(rowNum, 6).string(assessmentType).style(currentCenterStyle);
    ws.cell(rowNum, 7).number(parseInt(maxPoints)).style(currentRightStyle);
  
    rowNum++;
  }
  
  
  const filepath = './output/generated/' + filename + '.xlsx';
  try {
    wb.write(filepath);
    return path.resolve(filepath);
  }
  catch (e) {
    console.log('Unexpected Error!', e.message, e);
  }
}