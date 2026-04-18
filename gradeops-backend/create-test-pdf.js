// create-test-pdf.js
// Creates a realistic student exam PDF for testing

const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('student-exam-rahul.pdf'));

// ── Header ──────────────────────────
doc.fontSize(20)
   .font('Helvetica-Bold')
   .text('DATA STRUCTURES - MID TERM EXAM', { align: 'center' });

doc.moveDown(0.5);
doc.fontSize(12)
   .font('Helvetica')
   .text('Course Code: CS301', { align: 'center' });

doc.moveDown();
doc.moveTo(50, doc.y)
   .lineTo(550, doc.y)
   .stroke();
doc.moveDown();

// ── Student Details ──────────────────
doc.fontSize(12).font('Helvetica-Bold').text('Student Details:');
doc.moveDown(0.3);
doc.font('Helvetica')
   .text('Name: Rahul Sharma')
   .text('Roll Number: 21CS045')
   .text('Date: 18 April 2026')
   .text('Total Marks: 50');

doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

// ── Q1 ──────────────────────────────
doc.font('Helvetica-Bold')
   .fontSize(13)
   .text('Q1. Explain arrays and their properties. (10 marks)');
doc.moveDown(0.3);
doc.font('Helvetica')
   .fontSize(11)
   .text('Answer: Arrays are linear data structures that store elements in contiguous memory locations. They provide O(1) random access using index numbers. The main advantage of arrays is fast access time. However they have fixed size which is a disadvantage. Arrays are stored in heap memory and support operations like traversal, insertion, deletion and searching. Time complexity for access is O(1), insertion at end is O(1) amortized, and deletion is O(n).');

doc.moveDown();

// ── Q2 ──────────────────────────────
doc.font('Helvetica-Bold')
   .fontSize(13)
   .text('Q2. Describe linked lists and compare with arrays. (10 marks)');
doc.moveDown(0.3);
doc.font('Helvetica')
   .fontSize(11)
   .text('Answer: Linked lists store data in nodes where each node contains data field and a pointer to the next node. They allow dynamic sizing unlike arrays. Main advantages are efficient insertion and deletion at O(1) when position is known. Disadvantage is O(n) access time compared to O(1) for arrays. Linked lists use more memory due to storing pointers. Types include singly, doubly and circular linked lists.');

doc.moveDown();

// ── Q3 ──────────────────────────────
doc.font('Helvetica-Bold')
   .fontSize(13)
   .text('Q3. Explain time complexity of QuickSort. (15 marks)');
doc.moveDown(0.3);
doc.font('Helvetica')
   .fontSize(11)
   .text('Answer: QuickSort uses divide and conquer strategy. It selects a pivot element and partitions the array into two sub-arrays. Elements smaller than pivot go left, larger go right. Average case time complexity is O(n log n) because we divide array roughly in half each time. Worst case is O(n squared) which occurs when pivot is always the minimum or maximum element, like in already sorted arrays. Best case is O(n log n). Space complexity is O(log n) due to recursion stack. We can improve worst case by using randomized pivot selection or median of three method.');

doc.moveDown();

// ── Q4 ──────────────────────────────
doc.font('Helvetica-Bold')
   .fontSize(13)
   .text('Q4. Describe Binary Trees and BST properties. (15 marks)');
doc.moveDown(0.3);
doc.font('Helvetica')
   .fontSize(11)
   .text('Answer: Binary trees are hierarchical data structures where each node has at most two children called left child and right child. The topmost node is called root. Nodes with no children are called leaf nodes. Binary Search Trees maintain a special property where left subtree contains nodes with smaller values and right subtree contains nodes with larger values. This property enables O(log n) search, insertion and deletion in average case. BST traversals include inorder which gives sorted output, preorder and postorder. Worst case for BST is O(n) when tree becomes skewed like a linked list.');

doc.end();
console.log('✅ PDF created: student-exam-rahul.pdf');
console.log('📁 Location: gradeops-backend/student-exam-rahul.pdf');