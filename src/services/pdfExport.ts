import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FeePayment, ExamSubjectMark, SchoolProfile, AttendanceRecord } from '../types';

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const content = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateStudentListPDF(students: Student[], school: SchoolProfile, filterClass?: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // School Header
  doc.setFontSize(18);
  doc.setTextColor(245, 158, 11); // Golden Amber #F59E0B
  doc.text(school.name, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`${school.address} | Tel: ${school.phone}`, 14, 25);
  doc.text(`Official Student Enrollment Report · Academic Year: ${school.academicYear} · Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  if (filterClass && filterClass !== 'All') {
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Class Filter: Class ${filterClass}`, 14, 37);
  }

  const tableHead = [['Student ID', 'Full Name', 'Class-Sec', 'Gender', 'Parent Name', 'Parent Contact', 'Admission Date']];
  const tableData = students.map(s => [
    s.id,
    s.fullName,
    `${s.classNum}-${s.section}`,
    s.gender,
    s.parentName,
    s.parentPhone,
    s.admissionDate,
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableData,
    startY: filterClass && filterClass !== 'All' ? 42 : 36,
    theme: 'grid',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55],
    },
    alternateRowStyles: {
      fillColor: [254, 243, 199], // subtle light amber tint
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} · SchoolPro Management System`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`Student_List_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateAttendanceReportPDF(
  records: AttendanceRecord[],
  studentMap: Record<string, Student>,
  school: SchoolProfile,
  date: string,
  classNum: string,
  section: string
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(18);
  doc.setTextColor(245, 158, 11);
  doc.text(school.name, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Daily Class Attendance Log · ${school.address}`, 14, 24);

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Date: ${date}   |   Class: ${classNum}-${section}`, 14, 32);

  const total = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const absent = total - present;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  doc.setFontSize(10);
  doc.setTextColor(22, 163, 74);
  doc.text(`Present: ${present}`, 14, 40);
  doc.setTextColor(220, 38, 38);
  doc.text(`Absent: ${absent}`, 50, 40);
  doc.setTextColor(31, 41, 55);
  doc.text(`Attendance Rate: ${rate}%`, 85, 40);

  const tableHead = [['#', 'Student ID', 'Student Full Name', 'Class-Sec', 'Status', 'Marked By']];
  const tableData = records.map((r, i) => {
    const stu = studentMap[r.studentId];
    return [
      String(i + 1),
      r.studentId,
      stu ? stu.fullName : r.studentId,
      `${r.classNum}-${r.section}`,
      r.status,
      r.markedBy || 'Teacher',
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableData,
    startY: 46,
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        if (data.cell.raw === 'Present') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`Attendance_Report_${classNum}-${section}_${date}.pdf`);
}

export function generateFeeReceiptPDF(
  payment: FeePayment,
  student: Student | undefined,
  school: SchoolProfile,
  totalCategoryFee: number = 450,
  totalPaidSoFar: number = 450
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  // Border frame
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.rect(8, 8, doc.internal.pageSize.width - 16, doc.internal.pageSize.height - 16);

  // Header
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.text(school.name, 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(school.address, 14, 23);
  doc.text(`Phone: ${school.phone} · Email: ${school.email}`, 14, 27);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 31, doc.internal.pageSize.width - 14, 31);

  // Title & Receipt No
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('OFFICIAL FEE PAYMENT RECEIPT', 14, 39);

  doc.setFontSize(9);
  doc.text(`Receipt No: ${payment.receiptNumber}`, doc.internal.pageSize.width - 65, 39);
  doc.text(`Date: ${payment.paymentDate}`, doc.internal.pageSize.width - 65, 45);

  // Student Info Block
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student Name:`, 14, 48);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.studentName, 42, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID:`, 14, 54);
  doc.setTextColor(15, 23, 42);
  doc.text(payment.studentId, 42, 54);

  doc.setTextColor(71, 85, 105);
  doc.text(`Class & Section:`, 14, 60);
  doc.setTextColor(15, 23, 42);
  doc.text(`Class ${payment.classNum}-${payment.section}`, 42, 60);

  if (student) {
    doc.setTextColor(71, 85, 105);
    doc.text(`Parent Name:`, 14, 66);
    doc.setTextColor(15, 23, 42);
    doc.text(student.parentName, 42, 66);
  }

  // Payment Table
  const balance = Math.max(0, totalCategoryFee - totalPaidSoFar);

  autoTable(doc, {
    startY: 72,
    head: [['Description / Fee Category', 'Payment Method', 'Amount Paid']],
    body: [
      [payment.category, payment.paymentMethod, `${school.currencySymbol}${payment.amountPaid.toFixed(2)}`],
      ['Total Fee Assigned', '-', `${school.currencySymbol}${totalCategoryFee.toFixed(2)}`],
      ['Total Paid To Date', '-', `${school.currencySymbol}${totalPaidSoFar.toFixed(2)}`],
      ['Outstanding Balance', '-', `${school.currencySymbol}${balance.toFixed(2)}`],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8.5,
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 14;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Remarks / Note:', 14, finalY);
  doc.setTextColor(31, 41, 55);
  doc.text(payment.notes || 'No remarks recorded. Payment successfully cleared.', 14, finalY + 5);

  // Signatures
  doc.line(14, finalY + 30, 54, finalY + 30);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signature', 14, finalY + 35);

  doc.line(doc.internal.pageSize.width - 54, finalY + 30, doc.internal.pageSize.width - 14, finalY + 30);
  doc.text('Accountant / Stamp', doc.internal.pageSize.width - 50, finalY + 35);

  doc.save(`Receipt_${payment.receiptNumber}.pdf`);
}

export function generateStudentReportCardPDF(
  student: Student,
  marks: ExamSubjectMark[],
  examName: string,
  school: SchoolProfile
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Border decoration
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);

  // School Header
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11);
  doc.text(school.name, doc.internal.pageSize.width / 2, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(school.motto, doc.internal.pageSize.width / 2, 28, { align: 'center' });
  doc.text(`${school.address} · Tel: ${school.phone}`, doc.internal.pageSize.width / 2, 33, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(18, 38, doc.internal.pageSize.width - 18, 38);

  // Exam Title
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('STUDENT PROGRESS REPORT CARD', doc.internal.pageSize.width / 2, 46, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11);
  doc.text(`${examName} · Academic Session ${school.academicYear}`, doc.internal.pageSize.width / 2, 52, { align: 'center' });

  // Student Details box
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student Name:`, 18, 62);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(student.fullName, 50, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID:`, 18, 68);
  doc.setTextColor(15, 23, 42);
  doc.text(student.id, 50, 68);

  doc.setTextColor(71, 85, 105);
  doc.text(`Class & Section:`, 18, 74);
  doc.setTextColor(15, 23, 42);
  doc.text(`Class ${student.classNum}-${student.section}`, 50, 74);

  doc.setTextColor(71, 85, 105);
  doc.text(`Parent / Guardian:`, 110, 62);
  doc.setTextColor(15, 23, 42);
  doc.text(student.parentName, 150, 62);

  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Birth:`, 110, 68);
  doc.setTextColor(15, 23, 42);
  doc.text(student.dob, 150, 68);

  doc.setTextColor(71, 85, 105);
  doc.text(`Emergency Contact:`, 110, 74);
  doc.setTextColor(15, 23, 42);
  doc.text(student.parentPhone, 150, 74);

  // Marks Table
  let totalMax = 0;
  let totalObtained = 0;

  const tableBody = marks.map((m, idx) => {
    totalMax += m.maxMarks;
    totalObtained += m.obtainedMarks;
    return [
      String(idx + 1),
      m.subject,
      String(m.maxMarks),
      String(m.obtainedMarks),
      `${Math.round((m.obtainedMarks / m.maxMarks) * 100)}%`,
      m.grade,
      m.remarks || 'Satisfactory',
    ];
  });

  const aggregatePercent = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
  let overallGrade = 'Fail';
  const pctNum = parseFloat(aggregatePercent);
  if (pctNum >= 90) overallGrade = 'A+';
  else if (pctNum >= 80) overallGrade = 'A';
  else if (pctNum >= 70) overallGrade = 'B';
  else if (pctNum >= 60) overallGrade = 'C';
  else if (pctNum >= 40) overallGrade = 'D';

  autoTable(doc, {
    startY: 82,
    head: [['#', 'Subject', 'Max Marks', 'Obtained Marks', 'Percentage', 'Grade', 'Teacher Remarks']],
    body: tableBody,
    foot: [['', 'Grand Total', String(totalMax), String(totalObtained), `${aggregatePercent}%`, overallGrade, '']],
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    footStyles: {
      fillColor: [254, 243, 199],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9.5,
    },
    bodyStyles: {
      fontSize: 9,
    },
    margin: { left: 18, right: 18 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Grading Scale Reference
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Grading Scale: A+ (90-100%) · A (80-89%) · B (70-79%) · C (60-69%) · D (40-59%) · Fail (<40%)', 18, finalY);

  // Teacher feedback
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('General Conduct & Remarks:', 18, finalY + 10);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    overallGrade === 'A+' || overallGrade === 'A'
      ? 'Exceptional academic competence, active participation in class discussions, and admirable peer collaboration.'
      : 'Good effort demonstrated. Additional focus recommended in foundational conceptual problem-solving.',
    18,
    finalY + 16
  );

  // Signatures
  const signY = doc.internal.pageSize.height - 35;
  doc.line(18, signY, 68, signY);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Class Teacher Signature', 18, signY + 5);

  doc.line(doc.internal.pageSize.width / 2 - 25, signY, doc.internal.pageSize.width / 2 + 25, signY);
  doc.text('Parent Signature', doc.internal.pageSize.width / 2 - 15, signY + 5);

  doc.line(doc.internal.pageSize.width - 68, signY, doc.internal.pageSize.width - 18, signY);
  doc.text(school.principalName, doc.internal.pageSize.width - 65, signY + 5);
  doc.text('Principal', doc.internal.pageSize.width - 50, signY + 9);

  doc.save(`Report_Card_${student.id}_${student.fullName.replace(/\s+/g, '_')}.pdf`);
}
