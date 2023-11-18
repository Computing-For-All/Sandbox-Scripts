// Require library
import xl from 'excel4node';
import path from 'path'


export default function GenerateGradesXLSX(rowsData, filename = 'Grades Excel Spreadsheet') {

  // Create a new instance of a Workbook class
  const wb = new xl.Workbook();
  
  // Add Worksheets to the workbook
  const ws = wb.addWorksheet('Sheet 1');
  
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
    font: {
      color: '000000',
      size: 11,
    },
  });
  
  ws.row(1).filter();
  ws.column(1).setWidth(31.43);
  ws.column(2).setWidth(28.86);
  ws.column(3).setWidth(26.86);
  ws.column(4).setWidth(20.29);
  ws.column(5).setWidth(20.29);
  ws.column(6).setWidth(24.29);
  ws.column(7).setWidth(13.29);
  ws.column(8).setWidth(13.29);
  
  ws.cell(1, 1).string('(Do Not Modify) Grade ID').style(headerStyle);
  ws.cell(1, 2).string('(Do Not Modify) Row Checksum').style(headerStyle);
  ws.cell(1, 3).string('(Do Not Modify) Modified On').style(headerStyle);
  ws.cell(1, 4).string('Student').style(headerStyle);
  ws.cell(1, 5).string('Session').style(headerStyle);
  ws.cell(1, 6).string('Assignment').style(headerStyle);
  ws.cell(1, 7).string('Score').style(headerStyle);
  ws.cell(1, 8).string('Total Score').style(headerStyle);
  
  
  let rowNum = 2;
  for (const [student, session, assignment, score, totalScore] of rowsData) {
    const currentLeftStyle = (rowNum % 2 === 0) ? normalEvenLeftStyle : normalOddLeftStyle;
    const currentCenterStyle = (rowNum % 2 === 0) ? normalEvenCenterStyle : normalOddCenterStyle;
    const currentRightStyle = (rowNum % 2 === 0) ? normalEvenRightStyle : normalOddRightStyle;
  
    ws.cell(rowNum, 1).style(currentLeftStyle);
    ws.cell(rowNum, 2).style(currentCenterStyle);
    ws.cell(rowNum, 3).style(currentCenterStyle);
    ws.cell(rowNum, 4).string(student).style(currentCenterStyle);
    ws.cell(rowNum, 5).string(session).style(currentCenterStyle);
    ws.cell(rowNum, 6).string(assignment).style(currentCenterStyle);
    ws.cell(rowNum, 7).number(parseInt(score)).style(currentCenterStyle);
    ws.cell(rowNum, 8).number(parseInt(totalScore)).style(currentRightStyle);
  
    rowNum++;
  }
  
  
  const filepath = './' + filename + '.xlsx';
  try {
    wb.write(filepath);
    return path.resolve(filepath);
  }
  catch (e) {
    console.log('Unexpected Error!', e.message, e);
  }
}