const PDFDocument = require("pdfkit-table");
const fs = require("fs");

/**
 * Generate a PDF report for attendance
 * @param {string} filename - The output PDF file name
 * @param {string} title - The report title
 * @param {Array} data - Attendance data
 * @returns {string} - Path to generated PDF
 */
const generatePDF = (filename, title, data) => {
  return new Promise((resolve, reject) => {
    let doc = new PDFDocument({ margin: 30, size: "A4" });
    // to save on server
    const filePath = `./reports/${filename}`;
    // Ensure the reports folder exists
    if (!fs.existsSync("./reports")) {
      fs.mkdirSync("./reports");
    }
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add Report Title

    doc.fontSize(20).text(title, {
      align: "center",
    });

    // Add Recorded Date
    const recordedDate = new Date().toLocaleDateString();
    doc.fontSize(12).text(`Date: ${recordedDate}`, { align: "right" });

    // move to down
    doc.moveDown();

    // table
    const tableArray = {
      headers: ["Student Name", "Status"],
      rows: data.map((record) => [record.student_name, record.status]),
    };
    doc.table(tableArray, { width: 300 }); // A4 595.28 x 841.89 (portrait) (about width sizes)

    // move to down
    doc.moveDown(); // separate tables

    // Add footer
    doc.y = doc.page.height - 50;
    doc.fontSize(10).text("Generated by School Management System", {
      align: "center",
      width: 410,
      oblique: true,
    });

    // move to down
    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generatePDF;
