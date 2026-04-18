// create-test-pdf2.js
// Second student for plagiarism testing

const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('student-exam-priya.pdf'));

doc.fontSize(20)
   .font('Helvetica-Bold')
   .text('DATA STRUCTURES - MID TERM EXAM', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(12)
   .font('Helvetica')
   .text('Course Code: CS301', { align: 'center' });
doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Student Details:');
doc.moveDown(0.3);
doc.font('Helvetica')
   .text('Name: Priya Patel')
   .text('Roll Number: 21CS032')
   .text('Date: 18 April 2026')
   .text('Total Marks: 50');
doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

doc.font('Helvetica-Bold').fontSize(13)
   .text('Q1. Explain arrays and their properties. (10 marks)');
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(11)
   .text('Answer: Arrays are data structures storing elements in contiguous memory. Random access is O(1) using index. Fixed size is main limitation. Supports traversal insertion deletion searching. Access O(1), insertion O(n) in worst case.');

doc.moveDown();

doc.font('Helvetica-Bold').fontSize(13)
   .text('Q2. Describe linked lists and compare with arrays. (10 marks)');
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(11)
   .text('Answer: Linked lists have nodes with data and next pointer. Dynamic size advantage over arrays. Insertion deletion efficient at O(1). But access is O(n) which is slower than arrays O(1). More memory used for pointers. Can be singly or doubly linked.');

doc.moveDown();

doc.font('Helvetica-Bold').fontSize(13)
   .text('Q3. Explain time complexity of QuickSort. (15 marks)');
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(11)
   .text('Answer: QuickSort is divide and conquer algorithm. Picks pivot and partitions array. Average case O(n log n). Worst case O(n squared) when array already sorted and pivot is always min or max. Can use random pivot to avoid worst case. Space O(log n) for recursion.');

doc.moveDown();

doc.font('Helvetica-Bold').fontSize(13)
   .text('Q4. Describe Binary Trees and BST properties. (15 marks)');
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(11)
   .text('Answer: Binary tree nodes have at most 2 children. BST property is left smaller right larger than root. Enables O(log n) search insertion deletion average case. Inorder traversal gives sorted sequence. Worst case O(n) for skewed tree.');

doc.end();
console.log('✅ PDF created: student-exam-priya.pdf');