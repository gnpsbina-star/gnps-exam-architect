// Official CBSE paper patterns, held in the repository rather than scraped.
//
// CBSE publishes a pattern about once a year, so fetching it from
// cbseacademic.nic.in on every prompt generation was slow, fragile and pointless.
// This file is the source of truth instead: it ships with the app, so it works
// offline, survives every redeploy, and never depends on the CBSE site or on a
// paid host with a persistent disk.
//
// HOW TO ADD OR UPDATE A SUBJECT
//   Key   : "<Class> || <Subject>" exactly as they appear in the dropdowns.
//   year  : the session the pattern was taken from.
//   text  : the paper's General Instructions, as the AI should follow them.
// A subject with no entry here is not a problem: the app already computes a full
// section-by-section blueprint for every class, subject and exam, and that is
// what drives the paper. An entry here is supporting detail, so only add one for
// a pattern that has actually been checked against the published sample paper.

// The Accountancy paper's structure, written down once. Both the pattern text
// below and the paper-design instructions in main.js are generated from these
// numbers, so a correction lands everywhere at once. Getting this wrong in one
// copy and not the other is exactly how the prompt came to claim both 7 and 12
// internal choices.
export const accountancyPaper = {
  totalQuestions: 34,
  markLadder: [1, 3, 4, 6],
  excludedMarks: [2, 5],
  internalChoice: { total: 12, byMark: { 1: 7, 3: 2, 4: 1, 6: 2 } },
  parts: {
    "Class 12": {
      a: { name: "Accounting for Partnership Firms and Companies", marks: 60 },
      b: { name: "Analysis of Financial Statements", marks: 20 }
    },
    "Class 11": {
      a: { name: "Financial Accounting I", marks: 56 },
      b: { name: "Financial Accounting II", marks: 24 }
    }
  }
};

const acc = accountancyPaper;
const accIC = acc.internalChoice;
const accLadder = acc.markLadder.join(', ').replace(/, (\d+)$/, ' and $1');
const accExcluded = acc.excludedMarks.map(m => `${m}-mark`).join(' or ');

export const sqpBlueprints = {
  "Class 10 || Science": {
    year: "2025-26",
    text: `The question paper comprises 39 questions. All questions are compulsory.
The paper is divided into three sections by SUBJECT, not by question type:
  Section A - Biology (30 Marks): the "World of Living" and "Our Environment" units.
  Section B - Chemistry (25 Marks): "Chemical Substances - Nature and Behaviour".
  Section C - Physics (25 Marks): "Natural Phenomena" and "Effects of Current".
Each of those three sections internally contains its own mix of multiple choice,
assertion-reasoning, very short answer, short answer, long answer and case-based
questions. Internal choice is provided in some questions.`
  },

  "Class 12 || Accountancy": {
    year: "2025-26",
    text: `The question paper contains ${acc.totalQuestions} questions. All questions are compulsory.
The paper is divided into two parts, Part A and Part B.
  Part A - ${acc.parts["Class 12"].a.name} (${acc.parts["Class 12"].a.marks} Marks), compulsory for all candidates.
  Part B - candidates attempt EITHER "${acc.parts["Class 12"].b.name}" OR "Computerised Accounting" (${acc.parts["Class 12"].b.marks} Marks).
Mark distribution, numbered continuously across both parts:
  Questions 1 to 16 and 27 to 30 carry 1 mark each.
  Questions 17 to 20, 31 and 32 carry 3 marks each.
  Questions 21, 22 and 33 carry 4 marks each.
  Questions 23 to 26 and 34 carry 6 marks each.
There is no overall choice. Internal choice is provided in ${accIC.total} questions:
${accIC.byMark[1]} questions of 1 mark, ${accIC.byMark[3]} of 3 marks, ${accIC.byMark[4]} of 4 marks and ${accIC.byMark[6]} of 6 marks.
Accountancy never uses ${accExcluded} questions.`
  },

  "Class 11 || Accountancy": {
    year: "2025-26",
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This pattern mirrors the Class 12 Accountancy design against the Class 11 syllabus
weighting, so students meet the board format from the first year.
The paper contains ${acc.totalQuestions} questions, divided into two parts:
  Part A - ${acc.parts["Class 11"].a.name} (${acc.parts["Class 11"].a.marks} Marks): Theoretical Framework (12) and Accounting Process (44).
  Part B - ${acc.parts["Class 11"].b.name} (${acc.parts["Class 11"].b.marks} Marks): Financial Statements of Sole Proprietorship.
Questions run on the same ${acc.markLadder.join(' / ')} mark ladder used at Class 12, numbered
continuously across both parts, and internal choice follows the Class 12 paper:
${accIC.total} questions in all - ${accIC.byMark[1]} of 1 mark, ${accIC.byMark[3]} of 3 marks, ${accIC.byMark[4]} of 4 marks and ${accIC.byMark[6]} of 6 marks.
Accountancy never uses ${accExcluded} questions.`
  }
};

export function getSqpBlueprint(className, subjectName) {
  if (!className || !subjectName) return null;
  const wanted = `${className} || ${subjectName}`.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const [key, value] of Object.entries(sqpBlueprints)) {
    if (key.toLowerCase().replace(/\s+/g, ' ').trim() === wanted) return value;
  }
  return null;
}
