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
// "2 of 3 marks, 2 of 4 marks and 2 of 6 marks" - written from the numbers so
// the pattern text and the prompt never disagree about where the choices are.
export function accountancyChoiceText() {
  const parts = Object.entries(accountancyPaper.internalChoice.byMark)
    .filter(([, n]) => n > 0)
    .map(([mark, n]) => `${n} of ${mark} marks`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts.join('');
}

export const accountancyPaper = {
  totalQuestions: 34,
  markLadder: [1, 3, 4, 6],
  excludedMarks: [2, 5],
  // 2026-27 sample paper: Q17 and Q31 (3 marks), Q22 and Q33 (4), Q25 and Q26 (6).
  internalChoice: { total: 6, byMark: { 3: 2, 4: 2, 6: 2 } },
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

// Class 9 and 10 Mathematics, from the CBSE 2026-27 curriculum documents
// (Maths_SecP1_X_2026-27, Maths_SecP1_IX_2026-27) and the 2026-27 sample
// papers for Mathematics Standard (041) and Basic (241). Both sample papers say
// the question paper design is unchanged for 2026-27, and both use the same
// 38-question layout; they differ only in how the marks are split between
// recall, application and analysis. Class 9 is a school examination with no
// CBSE sample paper, so it is set on the Class 10 layout (school policy) with
// its own curriculum's design and unit weightage.
//
// `units[].chapters` are words matched against the chapter titles in data.js,
// so the prompt can weight whichever chapters a teacher selects. The longest
// match wins, so "Areas Related to Circles" is Mensuration, not Geometry.
// `design.percent` is CBSE's own rounded percentages, printed as published.
const mathsPaperLayout = `This question paper contains 38 questions. All questions are compulsory.
The paper is divided into five Sections - A, B, C, D and E.
  Section A: Questions 1 to 18 are Multiple Choice Questions (MCQs) and Questions 19 and 20 are
             Assertion-Reason based questions, of 1 mark each (20 x 1 = 20).
  Section B: Questions 21 to 25 are Very Short Answer (VSA) questions of 2 marks each (5 x 2 = 10).
  Section C: Questions 26 to 31 are Short Answer (SA) questions of 3 marks each (6 x 3 = 18).
  Section D: Questions 32 to 35 are Long Answer (LA) questions of 5 marks each (4 x 5 = 20).
  Section E: Questions 36 to 38 are case study based questions of 4 marks each (3 x 4 = 12),
             each with three sub-parts (i), (ii), (iii) of 1, 1 and 2 marks.
There is no overall choice. Internal choice is provided in 2 questions of Section B,
2 questions of Section C and 2 questions of Section D, and in the 2-mark sub-part of
every Section E question.
Draw neat and clean figures wherever required. Take pi = 22/7 wherever required, if not stated.
Use of calculators is not allowed.`;

const class10MathsUnits = [
  { name: "Number Systems", marks: 6, chapters: ["Real Numbers"] },
  { name: "Algebra", marks: 20, chapters: ["Polynomials", "Pair of Linear Equations", "Quadratic Equations", "Arithmetic Progressions"] },
  { name: "Coordinate Geometry", marks: 6, chapters: ["Coordinate Geometry"] },
  { name: "Geometry", marks: 15, chapters: ["Triangles", "Circles"] },
  { name: "Trigonometry", marks: 12, chapters: ["Introduction to Trigonometry", "Applications of Trigonometry"] },
  { name: "Mensuration", marks: 10, chapters: ["Areas Related to Circles", "Surface Areas and Volumes"] },
  { name: "Statistics and Probability", marks: 11, chapters: ["Statistics", "Probability"] }
];

const class10MathsScope = [
  "Real Numbers: Fundamental Theorem of Arithmetic; irrationality proofs of numbers like sqrt(2), sqrt(3), sqrt(5) and 3 + 2 sqrt(5).",
  "Polynomials: zeroes and the relationship between zeroes and coefficients of QUADRATIC polynomials.",
  "Quadratic Equations: solve by factorisation and by the quadratic formula ONLY (no completing-the-square method), real roots only, nature of roots from the discriminant.",
  "Coordinate Geometry: distance formula and section formula for INTERNAL division only. No area of a triangle and no centroid.",
  "Triangles: PROVE only the Basic Proportionality Theorem. Its converse and the AA, SSS and SAS similarity criteria are STATED WITHOUT PROOF - use them, never ask students to prove them.",
  "Circles: prove that the tangent is perpendicular to the radius at the point of contact, and that tangents from an external point are equal.",
  "Trigonometry: ratios of 0, 30, 45, 60 and 90 degrees; ONLY SIMPLE identities based on sin^2 A + cos^2 A = 1.",
  "Heights and Distances: at most TWO right triangles per problem, and angles of elevation/depression of 30, 45 or 60 degrees ONLY.",
  "Areas Related to Circles: area of a segment ONLY for central angles of 60, 90 or 120 degrees.",
  "Surface Areas and Volumes: combinations of ANY TWO of cube, cuboid, sphere, hemisphere, right circular cylinder or cone. No conversion of one solid into another (melting/recasting) and no frustum.",
  "Statistics: mean (direct, assumed-mean and step-deviation methods), median and mode of grouped data. Avoid bimodal data. No ogive / cumulative frequency graphs.",
  "Probability: classical definition and simple problems only."
];

const class9MathsUnits = [
  { name: "Number System", marks: 7, chapters: ["World of Numbers", "Number System"] },
  { name: "Algebra", marks: 20, chapters: ["Linear Polynomials", "Introduction to Polynomials", "Sequences and Progressions", "Algebraic Identities", "Linear Equations in Two Variables"] },
  { name: "Coordinate Geometry", marks: 4, chapters: ["Use of Coordinates", "Coordinate Geometry"] },
  { name: "Geometry", marks: 25, chapters: ["Euclid", "Lines and Angles", "Triangles", "4-gons", "Quadrilaterals", "Round and Round", "Circles"] },
  { name: "Mensuration", marks: 14, chapters: ["Perimeter and Area", "Surface Area and Volume"] },
  { name: "Statistics and Probability", marks: 10, chapters: ["Statistics", "Probability"] }
];

const class9MathsScope = [
  "Number System: rational numbers, their density and decimal forms; irrationality proofs of sqrt(2) and sqrt(3) only; the square root spiral.",
  "Coordinate Geometry: distance between two points and the midpoint of a segment ONLY - no section formula.",
  "Sequences: explicit and recursive rules, nth term of an AP and of a GP, sum of the first n natural numbers. No sum of n terms of an AP or GP.",
  "Mensuration: area of a sector and of a segment, arc length, Heron's formula and Brahmagupta's formula; surface area and volume of cuboid, cube, cylinder, cone, pyramid, sphere and hemisphere.",
  "Statistics: graphical representation (including stacked and 100% stacked bar graphs), mean, median, mode and weighted average.",
  "Probability: empirical and theoretical probability, with tree diagrams and tables.",
  "Indian Knowledge System content named in the curriculum (Baudhayana's Sulbasutras, Brahmagupta, Aryabhata, Madhava) may be used in questions and case studies."
];

export const secondaryMaths = {
  "Class 10 || Mathematics (Standard)": {
    paperLabel: "Mathematics Standard (041)",
    design: { understanding: 43, applying: 19, analysing: 18, percent: [54, 24, 22] },
    units: class10MathsUnits,
    scope: class10MathsScope,
    style: "Standard (041) is the higher-level paper. Its sample paper uses multi-step problems, unfamiliar real-life contexts and reasoning tasks, for example asking the student to find and correct the error in a worked solution, or to prove a theorem and then apply it. 37 of the 80 marks go to applying and analysing, so do not make the paper a set of direct textbook exercises."
  },
  "Class 10 || Mathematics (Basic)": {
    paperLabel: "Mathematics Basic (241)",
    design: { understanding: 60, applying: 12, analysing: 8, percent: [75, 15, 10] },
    units: class10MathsUnits,
    scope: class10MathsScope,
    style: "Basic (241) is the more accessible paper. Its sample paper keeps most questions direct and close to NCERT textbook exercises and examples: straightforward one- or two-step working, standard proofs and familiar contexts. Three quarters of the marks go to remembering and understanding, so keep the analysing and evaluating load light (about 8 of 80 marks) and avoid long chains of reasoning."
  },
  "Class 9 || Mathematics": {
    paperLabel: "Mathematics (Class IX)",
    design: { understanding: 43, applying: 19, analysing: 18, percent: [54, 24, 22] },
    units: class9MathsUnits,
    scope: class9MathsScope,
    style: "Class IX follows the Class X Standard paper layout and the same question design (43 / 19 / 18). Questions must come only from the Class IX curriculum (Ganita Manjari), never from Class X topics such as quadratic equations, similarity of triangles, trigonometry or tangents to a circle."
  }
};

export function getSecondaryMaths(className, subjectName) {
  if (!className || !subjectName) return null;
  return secondaryMaths[`${className} || ${subjectName}`] || null;
}

// Class 9 and 10 Science (086), from the CBSE 2026-27 curriculum documents
// (Science_SecP1_2026-27 for Class X, ScienceSt_SecP1_2026-27 for Class IX)
// and the Class X 2026-27 sample paper. The paper is split into sections by
// DISCIPLINE, each with its own mix of question types; `counts` is that mix,
// read question by question from the sample paper (7+2+3+2+1+1 = 16 questions
// and 30 marks in Biology, and so on). Class 9 has no CBSE sample paper: it is
// set on the Class 10 layout (school policy), with Earth as a System (5 marks)
// placed in the Biology section just as Class 10 places Our Environment there,
// so its sections carry the Class 9 unit marks 32 / 25 / 23 in the same 39
// questions.
//
// `chapters` are words matched against data.js chapter titles (longest match
// wins) to decide which section a selected chapter belongs to.
export const scienceQuestionMarks = { mcq: 1, ar: 1, vsa: 2, sa: 3, cbq: 4, la: 5 };

const scienceDesign = {
  understanding: 50, applying: 30, analysing: 20,
  labels: ["Demonstrate Knowledge and Understanding (state, name, list, identify, define, describe, outline, summarise)",
           "Application of Knowledge / Concepts (calculate, illustrate, show, adapt, explain, distinguish)",
           "Formulate, Analyse, Evaluate and Create (interpret, analyse, compare, contrast, examine, evaluate, discuss, construct)"]
};

const class10ScienceScope = [
  "Chemical Substances: Periodic Classification of Elements is NOT assessed in the year-end examination.",
  "Acids, Bases and Salts: the pH scale without its logarithm definition.",
  "Carbon and its Compounds: ethanol and ethanoic acid - properties and uses only.",
  "Heredity: Mendel's laws and sex determination. Evolution (acquired and inherited traits, speciation, fossils, evolution by stages, human evolution) is NOT assessed.",
  "Light: the mirror formula and lens formula are applied, never derived.",
  "Human Eye and the Colourful World: do not ask about the colour of the Sun at sunrise and sunset.",
  "Magnetic Effects of Electric Current: the electric motor, electromagnetic induction and the electric generator are NOT assessed.",
  "Information given in boxes in the NCERT textbook is not assessed."
];

const class9ScienceScope = [
  "Chapter 1 (Exploration: Entering the World of Secondary Science) is not part of the annual examination's course structure: set NO question from it in a full-length paper.",
  "Cell: the key organelles are the nucleus, mitochondria, chloroplast, endoplasmic reticulum, vacuoles, plasma membrane and cell wall.",
  "Mixtures: express concentration only as mass by mass, mass by volume or volume by volume percentage.",
  "Structure of an Atom: electron distribution for the first 18 elements only.",
  "Motion: kinematic equations derived by the graphical method; only an elementary idea of uniform circular motion.",
  "Force and Laws of Motion: universal gravitation is not in this chapter. Work, Energy and Simple Machines: no pressure, thrust or floatation. Sound: no ultrasound or SONAR."
];

export const secondaryScience = {
  "Class 10": {
    design: scienceDesign,
    scope: class10ScienceScope,
    sections: [
      { key: "biology", label: "Biology", units: "World of Living + Our Environment", marks: 30,
        counts: { mcq: 7, ar: 2, vsa: 3, sa: 2, cbq: 1, la: 1 },
        chapters: ["Life Processes", "Control and Coordination", "Reproduce", "Heredity", "Our Environment"] },
      { key: "chemistry", label: "Chemistry", units: "Chemical Substances - Nature and Behaviour", marks: 25,
        counts: { mcq: 7, ar: 1, vsa: 1, sa: 2, cbq: 1, la: 1 },
        chapters: ["Chemical Reactions", "Acids, Bases", "Metals and Non-metals", "Carbon and its Compounds"] },
      { key: "physics", label: "Physics", units: "Natural Phenomena + Effects of Current", marks: 25,
        counts: { mcq: 2, ar: 1, vsa: 2, sa: 3, cbq: 1, la: 1 },
        chapters: ["Light", "Human Eye", "Electricity", "Magnetic Effects"] }
    ]
  },
  "Class 9": {
    design: scienceDesign,
    scope: class9ScienceScope,
    notAssessed: ["Exploration"],
    sections: [
      { key: "biology", label: "Biology", units: "World of Living + Earth as a System", marks: 32,
        counts: { mcq: 7, ar: 2, vsa: 4, sa: 2, cbq: 1, la: 1 },
        chapters: ["Cell", "Tissues", "Reproduction", "Diversity", "Earth as a System"] },
      { key: "chemistry", label: "Chemistry", units: "Matter - Its Nature and Behaviour", marks: 25,
        counts: { mcq: 7, ar: 1, vsa: 1, sa: 2, cbq: 1, la: 1 },
        chapters: ["Mixtures", "Inside the Atom", "Atomic Foundations"] },
      { key: "physics", label: "Physics", units: "Motion, Force, Work and Sound", marks: 23,
        counts: { mcq: 2, ar: 1, vsa: 1, sa: 3, cbq: 1, la: 1 },
        chapters: ["Motion", "Forces", "Work, Energy", "Sound"] }
    ]
  }
};

// The combined Science subject only: the Physics / Chemistry / Biology
// sub-subjects and the legacy 086 syllabus are not set on this layout.
export function getSecondaryScience(className, subjectName) {
  if (subjectName !== "Science") return null;
  return secondaryScience[className] || null;
}

// Which section of a discipline-split paper (Science or Social Science) a
// chapter title belongs to, or null (also for chapters that are not assessed
// in the annual examination).
export function disciplineSectionOf(spec, chapterTitle) {
  const title = String(chapterTitle).toLowerCase();
  if ((spec.notAssessed || []).some(k => title.includes(k.toLowerCase()))) return null;
  let best = null, bestLen = 0;
  spec.sections.forEach(sec => sec.chapters.forEach(k => {
    if (title.includes(k.toLowerCase()) && k.length > bestLen) { best = sec; bestLen = k.length; }
  }));
  return best;
}

const class10SciencePattern = `This question paper consists of 39 questions in 3 sections. Section A is Biology,
Section B is Chemistry and Section C is Physics. Questions are numbered 1 to 39 continuously.
All questions are compulsory. However, an internal choice is provided in some questions.
A student is expected to attempt only one of the alternatives in these questions.
  Section A - Biology (30 marks), Q1-Q16: 7 MCQs and 2 Assertion-Reason (1 mark each),
              3 questions of 2 marks, 2 of 3 marks, 1 case-based question of 4 marks, 1 long answer of 5 marks.
  Section B - Chemistry (25 marks), Q17-Q29: 7 MCQs and 1 Assertion-Reason, 1 question of 2 marks,
              2 of 3 marks, 1 case-based question of 4 marks, 1 long answer of 5 marks.
  Section C - Physics (25 marks), Q30-Q39: 2 MCQs and 1 Assertion-Reason, 2 questions of 2 marks,
              3 of 3 marks, 1 case-based question of 4 marks, 1 long answer of 5 marks.
Internal choice (about 33%, 9 questions): in every section, the long answer, the 2-mark sub-part
of the case-based question, and one 2- or 3-mark question.
Case-based questions have sub-parts A (1 mark), B (1 mark) and C OR D (2 marks).
Long answers are split into sub-parts (for example I and II, or I to IV).
Figures: 9 questions carry a figure, 3 in each section, and every figure-based question has an
alternative for visually impaired students. 2 questions ask the student to draw.`;

// Class 9 and 10 Social Science (087), from the CBSE 2026-27 curriculum
// documents (SocialScience_SecP1X_2026-27 for Class X, SocialScience_SecP1IX
// for Class IX) and the Class X 2026-27 sample paper. Like Science, the paper
// is split into sections by DISCIPLINE - History, Geography, Political Science
// and Economics, 20 marks each - and `counts` is each section's mix, read
// question by question from the sample paper (History Q1-Q9: 4 MCQs, one
// 2-mark, one 3-mark, a case study, a long answer and a 2-mark map question,
// and so on). Across the paper that is CBSE's published type weightage:
// 20 MCQs, 4 x 2, 5 x 3, 3 case studies, 4 long answers and 5 marks of maps.
//
// `map` is the section's map question. It is only set when one of its
// `chapters` is selected, since the map list comes from those chapters; with
// none selected its marks become a 2- or 3-mark question instead. `choiceIn`
// says where the sample paper puts internal choice in that section: the 3-mark
// question (History Q6), the long answer, or one item of the map question
// (Geography Q19).
//
// Class 9 moves to the new integrated NCERT textbook in 2026-27, and CBSE's
// Class IX document says its course structure "will be provided shortly", so
// there are no Class 9 unit marks yet. Class 9 is a school examination with no
// CBSE sample paper, so it is set on the Class 10 layout (school policy): the
// same four 20-mark discipline sections, grouped as data.js groups the book's
// themes, with map questions drawn from the curriculum's map-related learning
// outcomes.
export const socialScienceQuestionMarks = { mcq: 1, ar: 1, vsa: 2, sa: 3, cbq: 4, la: 5 };

// CBSE 2026-27 weightage to competency levels, out of 80 (Class X document).
// CBSE prints 13.25% for Applying; 11 of 80 marks is 13.75%.
const socialScienceDesign = {
  understanding: 24, applying: 11, analysing: 40, mapSkill: 5,
  labels: ["Remembering and Understanding (recall facts, terms and basic concepts; organise, interpret, describe and state main ideas)",
           "Applying (solve problems in new situations using acquired knowledge, facts, techniques and rules)",
           "Analysing, Evaluating and Creating (identify motives or causes, make inferences, find evidence for generalisations, judge ideas, combine information in a new way or propose alternatives)",
           "Map Skill (locate, label and identify places on an outline map)"]
};

const class10SocialScienceScope = [
  "Subtopics marked [Not assessed in the Board exam], and chapters marked (Periodic Assessment only) or (Board exam: map pointing only), may appear in the syllabus list above because they are taught; follow the marking: they carry NO written question in this paper, and the discipline sections of the blueprint, not the length of the list, decide the marks.",
  "The Making of a Global World: ONLY subtopics 1 to 1.3 are assessed - the pre-modern world: silk routes, food travels, and conquest, disease and trade. The nineteenth century (1815-1914), the inter-war economy and the post-war era are internally assessed through the interdisciplinary project: set NO question from them.",
  "The Age of Industrialisation is assessed in Periodic Assessment only: set NO question from it in this paper.",
  "Lifelines of National Economy: ONLY map pointing (major sea ports and international airports) is assessed. Set no theory question from it.",
  "Globalisation and the Indian Economy: ONLY 'What is Globalisation?' and 'Factors that have enabled Globalisation' (technology, and liberalisation of foreign trade and foreign investment) are assessed. Production across countries, interlinking production, Chinese toys in India, the WTO, the impact of globalisation and the struggle for a fair globalisation are internally assessed through the interdisciplinary project: set NO question from them.",
  "Consumer Rights is project work only: set NO question from it.",
  "Map questions use ONLY the items on CBSE's 2026-27 map list given in the Social Science requirements below."
];

const class9SocialScienceScope = [
  "Class 9 follows the NEW NCERT integrated textbook, Social Science Part 1 and Part 2 (2026-27). Set questions ONLY from its themes as listed in the syllabus. Do NOT use the old Class 9 books (India and the Contemporary World-I, Contemporary India-I, Democratic Politics-I, Economics): no French Revolution, Nazism, Physical Features or Drainage of India, Constitutional Design, Village Palampur, Poverty as a Challenge or Food Security questions.",
  "Keep to the concepts in the CBSE 2026-27 Class IX course outline for each theme, for example: Elections - electoral systems, the Delimitation Commission, the Election Commission of India, constituency, electoral rolls, the party system, coalition government and the anti-defection law; Smart Ways to Manage Your Finances - inflation, simple and compound interest, budgeting, savings and investment options, risk and insurance, personal income tax."
];

const class10MapList = {
  history: `History (Nationalism in India) - on an outline map of India:
    Congress sessions: 1920 Calcutta, 1920 Nagpur, 1927 Madras.
    Satyagraha movements: Kheda, Champaran, Ahmedabad (mill workers).
    Jallianwala Bagh (Amritsar). Dandi (Dandi March).`,
  geography: `Geography - on an outline map of India:
    Resources and Development: identify the major soil types.
    Water Resources (locate and label dams): Salal, Bhakra Nangal, Tehri, Rana Pratap Sagar, Sardar Sarovar, Hirakud, Nagarjuna Sagar, Tungabhadra.
    Agriculture (identify): major areas of rice and wheat; the largest / major producer states of sugarcane, tea, coffee, rubber, cotton and jute.
    Minerals and Energy Resources (identify): iron ore mines - Mayurbhanj, Durg, Bailadila, Bellary, Kudremukh; coal mines - Raniganj, Bokaro, Talcher, Neyveli; oil fields - Digboi, Naharkatia, Mumbai High, Bassien, Kalol, Ankaleshwar. Locate and label power plants: thermal - Namrup, Singrauli, Ramagundam; nuclear - Narora, Kakrapara, Tarapur, Kalpakkam.
    Manufacturing Industries (locate and label): cotton textile - Mumbai, Indore, Surat, Kanpur, Coimbatore; iron and steel plants - Durgapur, Bokaro, Jamshedpur, Bhilai, Vijayanagar, Salem; software technology parks - Noida, Gandhinagar, Mumbai, Pune, Hyderabad, Bengaluru, Chennai, Thiruvananthapuram.
    Lifelines of National Economy (locate and label): major sea ports - Kandla, Tuticorin, Mumbai, Chennai, Marmagao, Visakhapatnam, New Mangalore, Paradip, Kochi, Haldia; international airports - Amritsar (Raja Sansi - Sri Guru Ram Dass Ji), Delhi (Indira Gandhi), Mumbai (Chhatrapati Shivaji), Chennai (Meenambakkam), Kolkata (Netaji Subhash Chandra Bose), Hyderabad (Rajiv Gandhi).
    Items listed for locating and labelling may also be given for identification.`
};

// CBSE has not published a Class 9 map list for the new textbook. These are
// the map tasks its Class IX learning outcomes and pedagogy notes name.
const class9MapList = {
  history: `History - on an outline map of the world or of India, as the item needs:
    sites of the Harappan civilisation and its contemporary cultures; the Mesopotamian, Egyptian and Chinese civilisations;
    the extent of important early Indian empires; India's ancient trade routes and major trading ports
    (with Mesopotamia, Greece, the Roman Empire, China and Southeast Asia).`,
  geography: `Geography - on an outline map of the world or of India, as the item needs:
    the major tectonic plates (world map); the climatic zones of the world and the monsoon winds over India;
    the biosphere reserves of India (map of India).`
};

export const secondarySocialScience = {
  "Class 10": {
    design: socialScienceDesign,
    scope: class10SocialScienceScope,
    mapList: class10MapList,
    mapPaper: "one outline map of India",
    notAssessed: ["Age of Industrialisation"],
    sections: [
      { key: "history", label: "History", units: "India and the Contemporary World-II", marks: 20,
        counts: { mcq: 4, ar: 0, vsa: 1, sa: 1, cbq: 1, la: 1 },
        map: { marks: 2, task: "identify two places marked A and B on the outline map of India", chapters: ["Nationalism in India"] },
        choiceIn: ["sa", "la"],
        chapters: ["Rise of Nationalism in Europe", "Nationalism in India", "Making of a Global World", "Age of Industrialisation", "Print Culture"] },
      { key: "geography", label: "Geography", units: "Contemporary India-II", marks: 20,
        counts: { mcq: 5, ar: 1, vsa: 1, sa: 0, cbq: 1, la: 1 },
        map: { marks: 3, task: "locate and label three items with suitable symbols on the outline map of India, one of them with an OR", chapters: ["Resources and Development", "Water Resources", "Agriculture", "Minerals and Energy", "Manufacturing Industries", "Lifelines"] },
        choiceIn: ["la", "map"],
        chapters: ["Resources and Development", "Forest and Wildlife", "Water Resources", "Agriculture", "Minerals and Energy", "Manufacturing Industries", "Lifelines"] },
      { key: "political", label: "Political Science", units: "Democratic Politics-II", marks: 20,
        counts: { mcq: 3, ar: 1, vsa: 2, sa: 1, cbq: 1, la: 1 },
        choiceIn: ["la"],
        chapters: ["Power Sharing", "Power-sharing", "Federalism", "Gender, Religion and Caste", "Political Parties", "Outcomes of Democracy"] },
      { key: "economics", label: "Economics", units: "Understanding Economic Development", marks: 20,
        counts: { mcq: 5, ar: 1, vsa: 0, sa: 3, cbq: 0, la: 1 },
        choiceIn: ["la"],
        chapters: ["Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation"] }
    ]
  },
  "Class 9": {
    design: socialScienceDesign,
    scope: class9SocialScienceScope,
    mapList: class9MapList,
    mapPaper: "an outline map of India, and an outline map of the world only if an item needs it,",
    notAssessed: [],
    sections: [
      { key: "history", label: "History", units: "Social Science Part 1 and 2 - History themes", marks: 20,
        counts: { mcq: 4, ar: 0, vsa: 1, sa: 1, cbq: 1, la: 1 },
        map: { marks: 2, task: "identify two places or areas marked A and B on an outline map", chapters: ["Early Humans", "State and Society", "India and the World"] },
        choiceIn: ["sa", "la"],
        chapters: ["Understanding Social Science", "Early Humans", "State and Society", "Resistance and Resilience", "India and the World"] },
      { key: "geography", label: "Geography", units: "Social Science Part 1 and 2 - Geography themes", marks: 20,
        counts: { mcq: 5, ar: 1, vsa: 1, sa: 0, cbq: 1, la: 1 },
        map: { marks: 3, task: "locate and label three items with suitable symbols on an outline map, one of them with an OR", chapters: ["Shaping of the Earth", "Atmosphere and Climate", "Life on Earth"] },
        choiceIn: ["la", "map"],
        chapters: ["Shaping of the Earth", "Atmosphere and Climate", "Oceans and Life", "Life on Earth"] },
      { key: "political", label: "Political Science", units: "Social Science Part 1 and 2 - Political Science themes", marks: 20,
        counts: { mcq: 3, ar: 1, vsa: 2, sa: 1, cbq: 1, la: 1 },
        choiceIn: ["la"],
        chapters: ["Democracy", "Elections", "Authority"] },
      { key: "economics", label: "Economics", units: "Social Science Part 1 and 2 - Economics themes", marks: 20,
        counts: { mcq: 5, ar: 1, vsa: 0, sa: 3, cbq: 0, la: 1 },
        choiceIn: ["la"],
        chapters: ["Building Blocks", "Price Puzzle", "Ideas to Startups", "Manage Your Finances"] }
    ]
  }
};

export function getSecondarySocialScience(className, subjectName) {
  if (subjectName !== "Social Science") return null;
  return secondarySocialScience[className] || null;
}

const class10SocialSciencePattern = `There are 38 questions in the question paper. All questions are compulsory.
The question paper has four sections, one per discipline, with MCQs, VSA, SA, LA and CBQ in each:
  Section A - History (20 marks), Q1-Q9: 4 MCQs (1 mark each), 1 VSA (2 marks), 1 SA (3 marks),
              1 long answer (5 marks), 1 case-based question (4 marks), 1 map question (2 marks).
  Section B - Geography (20 marks), Q10-Q19: 5 MCQs and 1 Assertion-Reason (1 mark each), 1 VSA (2 marks),
              1 long answer (5 marks), 1 case-based question (4 marks), 1 map question (3 marks).
  Section C - Political Science (20 marks), Q20-Q28: 3 MCQs and 1 Assertion-Reason, 2 VSA (2 marks each),
              1 SA (3 marks), 1 long answer (5 marks), 1 case-based question (4 marks).
  Section D - Economics (20 marks), Q29-Q38: 5 MCQs and 1 Assertion-Reason, 3 SA (3 marks each),
              1 long answer (5 marks).
Very Short Answer (VSA) questions carry 2 marks each; answers should not exceed 40 words.
Short Answer (SA) questions carry 3 marks each; answers should not exceed 60 words.
Long Answer (LA) questions carry 5 marks each; answers should not exceed 120 words.
Case-based questions (CBQ) have three sub-questions and carry 4 marks each; answers should not exceed 100 words.
The map-based questions carry 5 marks in two parts: Q9 in Section A - History (2 marks) and Q19 in
Section B - Geography (3 marks), on one outline map of India printed at the end of the paper.
There is no overall choice. Internal choice is provided in a few questions: all four long answers,
the History 3-mark question and one item of the Geography map question.
A separate question is provided for visually impaired candidates in lieu of every question with a
visual input (picture, cartoon or map). Such questions are to be attempted by visually impaired candidates only.`;

const class9SocialSciencePattern = `Class 9 is a school examination, so CBSE publishes no sample paper for it, and CBSE's Class IX
2026-27 curriculum says its course structure (marks per unit) will be provided shortly. This paper is
set on the Class 10 Social Science 2026-27 sample paper layout against the Class 9 curriculum (the new
NCERT Social Science Part 1 and Part 2), with the same four 20-mark discipline sections:
  Section A - History (20 marks), Q1-Q9: 4 MCQs, 1 VSA (2 marks), 1 SA (3 marks), 1 long answer
              (5 marks), 1 case-based question (4 marks), 1 map question (2 marks).
  Section B - Geography (20 marks), Q10-Q19: 5 MCQs and 1 Assertion-Reason, 1 VSA (2 marks), 1 long answer
              (5 marks), 1 case-based question (4 marks), 1 map question (3 marks).
  Section C - Political Science (20 marks), Q20-Q28: 3 MCQs and 1 Assertion-Reason, 2 VSA, 1 SA,
              1 long answer, 1 case-based question.
  Section D - Economics (20 marks), Q29-Q38: 5 MCQs and 1 Assertion-Reason, 3 SA (3 marks each), 1 long answer.
Everything else follows the Class 10 paper: 38 questions, all compulsory; word limits of 40 (VSA),
60 (SA), 100 (CBQ) and 120 (LA) words; internal choice in every long answer, the History 3-mark
question and one item of the Geography map question; a separate question for visually impaired
candidates in lieu of every question with a visual input.`;

// Class 9 and 10 English, from the CBSE 2026-27 curriculum documents
// (English_LL_SecP1_2026-27 for Class X Language and Literature, code 184;
// English_LL_SecP1IX_2026-27 for Class IX) and the Class X 2026-27 sample
// paper. The school's "English (R1)" is Language and Literature at Class 10.
// Unlike Science and Social Science, CBSE publishes a full question paper
// design for Class 9 English this year, built on the new NCERT textbook
// Kaveri, and it differs from Class 10: 14 questions in 20 / 30 / 30 marks,
// against Class 10's 11 questions in 20 / 20 / 40.
//
// `questions` lists the paper question by question, grouped by section, and
// becomes the blueprint rows. `attempt` / `of` give "answer any N of M".
// `book` names the literature book a question is set from, so the prompt can
// move a question to the other book when only one book is selected.
export const secondaryEnglish = {
  "Class 10": {
    code: "184",
    paperLabel: "English Language and Literature (184)",
    books: { prose: "First Flight", poetry: "First Flight", supplementary: "Footprints Without Feet" },
    // Which syllabus group in data.js holds which book (matched on the group name).
    bookGroups: { "First Flight (Prose)": "First Flight", "First Flight (Poetry)": "First Flight", "Footprints Without Feet": "Footprints Without Feet" },
    competencies: [
      "Reading Comprehension (20 marks): conceptual understanding, decoding, analysing, inferring, interpreting and vocabulary.",
      "Writing Skills and Grammar (20 marks): creative expression of an opinion, reasoning, justifying, illustrating, appropriate style and tone, appropriate format and fluency; applying conventions and using integrated structures with accuracy and fluency.",
      "Language through Literature (40 marks): recalling, reasoning, appreciating, applying literary conventions, illustrating and justifying; extracting relevant information, identifying the central theme and sub-themes, understanding the writer's message and writing fluently."
    ],
    grammar: "determiners, tenses, modals, subject-verb concord, and reported speech (commands and requests, statements, questions)",
    readingLimits: ["Passage 1 (Discursive, 400-450 words)", "Passage 2 (Case-based factual, with visual input such as statistical data or a chart, 200-250 words)"],
    scope: [
      "Grammar is set ONLY on the five CBSE 2026-27 items: determiners, tenses, modals, subject-verb concord, and reported speech (commands and requests, statements, questions).",
      "Writing in this paper is ONLY a formal letter (Q4) and an analytical paragraph (Q5). Notices and messages in the syllabus list are for school tests: do not set them here.",
      "Literature comes ONLY from First Flight and Footprints Without Feet, from the selected chapters and poems. Words and Expressions (the workbook) is not examined in this paper."
    ],
    questions: [
      { section: "Section A", heading: "Reading Skills", q: "Q1", type: "Discursive passage (400-450 words), unseen", marks: 10,
        detail: "8 to 9 sub-questions: MCQs and objective items (complete the sentence, true or false, analogy, fact or opinion, meaning of a phrase) of 1 mark, and two short answers of 2 marks in 30-40 words" },
      { section: "Section A", heading: "Reading Skills", q: "Q2", type: "Case-based factual passage (200-250 words) with statistical data", marks: 10,
        detail: "9 sub-questions: 1-mark objective items including one Assertion-Reason, and one short answer of 2 marks in 30-40 words, several of them reading the figures" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q3", type: "Grammar", marks: 10, attempt: 10, of: 12,
        detail: "12 items of 1 mark: gap filling, editing (identify the error and write the correction) and transformation (report a statement, question or command), each set in a real-life text such as a formal email, notice, report or blog" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q4", type: "Formal letter (100-120 words)", marks: 5, attempt: 1, of: 2,
        detail: "for example a letter to the editor, or a letter of complaint, enquiry or request to an official" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q5", type: "Analytical paragraph (100-120 words)", marks: 5, attempt: 1, of: 2,
        detail: "on a chart, graph, table, map, product details or SWOT notes, to be analysed and evaluated" },
      { section: "Section C", heading: "Language through Literature", q: "Q6", type: "Prose / drama extract", marks: 5, attempt: 1, of: 2, book: "either",
        detail: "extracts A and B, one from First Flight and one from Footprints Without Feet: 4 sub-questions of 1, 1, 1 and 2 marks" },
      { section: "Section C", heading: "Language through Literature", q: "Q7", type: "Poetry extract", marks: 5, attempt: 1, of: 2, book: "First Flight",
        detail: "extracts A and B from two First Flight poems: 4 sub-questions of 1, 1, 1 and 2 marks" },
      { section: "Section C", heading: "Language through Literature", q: "Q8", type: "Short answers, First Flight (40-50 words)", marks: 12, each: 3, attempt: 4, of: 5, book: "First Flight",
        detail: "3 marks each, from prose and poetry, assessing interpretation, analysis, inference and evaluation" },
      { section: "Section C", heading: "Language through Literature", q: "Q9", type: "Short answers, Footprints Without Feet (40-50 words)", marks: 6, each: 3, attempt: 2, of: 3, book: "Footprints Without Feet",
        detail: "3 marks each, assessing interpretation, analysis, inference and evaluation" },
      { section: "Section C", heading: "Language through Literature", q: "Q10", type: "Long answer, First Flight (100-120 words)", marks: 6, attempt: 1, of: 2, book: "First Flight",
        detail: "assessing creativity, imagination and extrapolation beyond and across texts (for example comparing two texts); may be passage-based on a situation from the text" },
      { section: "Section C", heading: "Language through Literature", q: "Q11", type: "Long answer, Footprints Without Feet (100-120 words)", marks: 6, attempt: 1, of: 2, book: "Footprints Without Feet",
        detail: "on theme or plot, interpretation, extrapolation beyond the text, inference or character sketch" }
    ]
  },
  "Class 9": {
    code: "184",
    paperLabel: "English (R1), Kaveri",
    books: { prose: "Kaveri", poetry: "Kaveri" },
    bookGroups: { "Kaveri (Prose)": "Kaveri", "Kaveri (Poetry)": "Kaveri" },
    competencies: [
      "Reading Skills (20 marks): comprehension, interpretation, analysis, inference, evaluation and vocabulary through selected and constructed responses.",
      "Writing Skills and Grammar (30 marks): accurate grammar in context, and writing for real-life purposes in different styles (narrative, descriptive, expository, persuasive) with clear organisation.",
      "Language through Literature (30 marks): close reading of prose and poetry, literary devices, character, theme and plot, and extrapolation beyond and across texts."
    ],
    grammar: "sequence of tenses, modal auxiliaries (ability, obligation, permission, possibility, advice), reported speech in extended texts (statements, questions, commands and requests), conditional clauses (Type 1), subject-verb concord, determiners, and noun and relative clauses",
    readingLimits: ["Passage 1 (Descriptive / Discursive, 400-450 words)", "Passage 2 (Case-based, with verbal or visual input such as statistical data or a chart, 200-250 words)"],
    scope: [
      "Class 9 English follows the CBSE 2026-27 design for the NEW NCERT textbook Kaveri: 14 questions, Reading 20, Writing and Grammar 30, Literature 30 marks.",
      "Grammar is set ONLY on the CBSE 2026-27 Class IX items: sequence of tenses, modal auxiliaries, reported speech (statements, questions, commands and requests), conditional clauses (Type 1), subject-verb concord, determiners, and noun and relative clauses.",
      "Writing is ONLY the four CBSE 2026-27 Class IX tasks: notice or informal invitation; letter to the editor or formal e-mail; factual description or magazine article; descriptive or narrative essay. Do NOT set a diary entry, story, descriptive paragraph, informal letter, message or analytical paragraph.",
      "Literature comes ONLY from Kaveri (never Beehive, Moments, First Flight or Footprints Without Feet), from the selected chapters and poems."
    ],
    questions: [
      { section: "Section A", heading: "Reading Skills", q: "Q1", type: "Descriptive / discursive passage (400-450 words), unseen", marks: 10,
        detail: "MCQs, objective items, very short and short answers (selected and constructed responses)" },
      { section: "Section A", heading: "Reading Skills", q: "Q2", type: "Case-based passage (200-250 words) with verbal or visual input", marks: 10,
        detail: "a passage with statistical data or a chart; MCQs, objective items, very short and short answers, several of them reading the data" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q3", type: "Grammar: editing / omission (MCQs)", marks: 4,
        detail: "4 items of 1 mark, as multiple choice: spot the error or the omitted word in a short text and choose the correction" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q4", type: "Grammar: sentence rearrangement", marks: 3,
        detail: "3 items of 1 mark: rearrange jumbled words or phrases into a meaningful sentence" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q5", type: "Grammar: sentence transformation", marks: 3,
        detail: "3 items of 1 mark: transform sentences as directed (for example reported speech, conditional, combining with a relative or noun clause)" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q6", type: "Notice / informal invitation (up to 50 words)", marks: 3, attempt: 1, of: 2,
        detail: "for example a school event or a celebration at home" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q7", type: "Letter to the editor / formal e-mail (120-150 words)", marks: 5, attempt: 1, of: 2,
        detail: "on a given issue, presenting views and suggestions" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q8", type: "Factual description / magazine article (120-150 words)", marks: 5, attempt: 1, of: 2,
        detail: "of a place, process, event or object, or an article for the school magazine" },
      { section: "Section B", heading: "Grammar and Writing Skills", q: "Q9", type: "Descriptive / narrative essay (200-250 words)", marks: 7, attempt: 1, of: 2,
        detail: "with a clear beginning, middle and end; the two choices may be on the same or different topics" },
      { section: "Section C", heading: "Language through Literature", q: "Q10", type: "Prose / drama extract", marks: 5, attempt: 1, of: 2, book: "Kaveri",
        detail: "extracts A and B: MCQs, objective items and very short answers" },
      { section: "Section C", heading: "Language through Literature", q: "Q11", type: "Poetry extract", marks: 5, attempt: 1, of: 2, book: "Kaveri",
        detail: "extracts A and B: MCQs, objective items and very short answers" },
      { section: "Section C", heading: "Language through Literature", q: "Q12", type: "Short answers (40-50 words)", marks: 10, each: 2, attempt: 5, of: 6, book: "Kaveri",
        detail: "2 marks each, from prose and poetry" },
      { section: "Section C", heading: "Language through Literature", q: "Q13", type: "Long answer (120-150 words)", marks: 5, attempt: 1, of: 2, book: "Kaveri",
        detail: "assessing extrapolation beyond the text and across texts" },
      { section: "Section C", heading: "Language through Literature", q: "Q14", type: "Long answer (120-150 words)", marks: 5, attempt: 1, of: 2, book: "Kaveri",
        detail: "assessing theme, plot or character" }
    ]
  }
};

// Class 9 and 10 "English (R1)" only; other English courses keep their layout.
// Class 11 and 12 English Core (301), from the CBSE 2026-27 curriculum
// document (English_core_SecP2_2026-27) and the Class XII 2026-27 sample
// paper, which says the design is unchanged: 13 questions, Reading 22,
// Creative Writing 18 and Literature 40, with a choice in every question.
// Class 11 is set on the same Class 12 layout (school policy), with the
// Class XI texts (Hornbill, Snapshots) and the Class XI writing tasks
// (classified advertisement, poster, speech, debate) in the four writing
// slots. CBSE's own Class XI paper also tests grammar and note-making; the
// school's Class 11 paper does not, so those stay with unit tests.
//
// The fields after `questions` override the Class 9 / 10 wording in the
// prompt builder, which was written for those papers' marks and word limits.
const seniorEnglishLiterature = (poetryBook, proseBook, suppBook) => [
  { section: "Section C", heading: "Literature", q: "Q7", type: `Poetry extract, ${poetryBook}`, marks: 6, attempt: 1, of: 2, book: poetryBook,
    detail: `extracts A and B from two ${poetryBook} poems, the poem's title in brackets: 6 sub-questions of 1 mark (complete from the options in brackets, complete the sentence, MCQs, one-line answers on imagery, metaphor or contrast)` },
  { section: "Section C", heading: "Literature", q: "Q8", type: `Prose / drama extract, ${suppBook}`, marks: 4, attempt: 1, of: 2, book: suppBook,
    detail: `extracts A and B from two ${suppBook} chapters: 4 sub-questions of 1 mark (MCQs and one-line inferences about character, tone or meaning)` },
  { section: "Section C", heading: "Literature", q: "Q9", type: `Prose extract, ${proseBook}`, marks: 6, attempt: 1, of: 2, book: proseBook,
    detail: `extracts A and B from two ${proseBook} prose chapters: 6 sub-questions of 1 mark (MCQs, complete the sentence, identify the statement that does NOT fit the extract, irony or tone)` },
  { section: "Section C", heading: "Literature", q: "Q10", type: `Short answers, ${proseBook} (40-50 words)`, marks: 10, each: 2, attempt: 5, of: 6, book: proseBook,
    detail: "2 marks each, from prose and poetry, the text's title in brackets; inferential answers through critical thinking" },
  { section: "Section C", heading: "Literature", q: "Q11", type: `Short answers, ${suppBook} (40-50 words)`, marks: 4, each: 2, attempt: 2, of: 3, book: suppBook,
    detail: "2 marks each, the chapter's title in brackets; interpretation, analysis and inference" },
  { section: "Section C", heading: "Literature", q: "Q12", type: `Long answer, ${proseBook} (120-150 words)`, marks: 5, attempt: 1, of: 2, book: proseBook,
    detail: "on an incident, theme, passage, extract or event as reference points; may link two texts, as the sample paper links Keeping Quiet with Going Places" },
  { section: "Section C", heading: "Literature", q: "Q13", type: `Long answer, ${suppBook} (120-150 words)`, marks: 5, attempt: 1, of: 2, book: suppBook,
    detail: "global comprehension and extrapolation beyond the text: theme, plot, character or a turning point" }
];

const seniorEnglishReading = (words1, words2) => [
  { section: "Section A", heading: "Reading Skills", q: "Q1", type: `Unseen passage (${words1} words): factual, descriptive or literary`, marks: 12,
    detail: "10 sub-questions: 8 objective items of 1 mark (MCQs, complete the sentence with a reason, fill in from options, the writer's tone, the main idea) and 2 short answers of 2 marks in about 40 words; paragraphs numbered and referred to" },
  { section: "Section A", heading: "Reading Skills", q: "Q2", type: `Case-based factual passage (${words2} words) with charts or statistical data`, marks: 10,
    detail: "8 sub-questions: 6 objective items of 1 mark and 2 short answers of 2 marks in about 40 words, some reading the charts; a source line under the passage" }
];

const seniorEnglishShared = {
  shortMarks: 2, longMarks: 5, longWords: "120-150", readingShortWords: "about 40 words",
  extractNote: "print the title of the text in brackets after each extract. EVERY sub-question carries 1 mark: MCQs, complete the sentence (from options in brackets or in the student's words), fill in the blank, and one-line answers on meaning, imagery, tone or irony. No 2-mark item inside an extract.",
  extractItems: "1-mark MCQs, complete-the-sentence and fill-in items and one-line answers",
  readingNote: "Follow the sample paper: 1-mark objective items (MCQs, complete the sentence, fill in from options, tone, main idea) and 2-mark answers in about 40 words; no Assertion-Reason in the passages."
};

Object.assign(secondaryEnglish, {
  "Class 12": {
    code: "301",
    paperLabel: "English Core (301)",
    books: { prose: "Flamingo", poetry: "Flamingo", supplementary: "Vistas" },
    bookGroups: { "Flamingo (Prose)": "Flamingo", "Flamingo (Poetry)": "Flamingo", "Vistas": "Vistas" },
    competencies: [
      "Reading Skills (22 marks): conceptual understanding, decoding, analysing, inferring, interpreting, appreciating literary conventions and vocabulary.",
      "Creative Writing Skills (18 marks): conceptual understanding, application of rules, analysis, reasoning, appropriate style and tone, appropriate format and fluency, inference, evaluation and creativity.",
      "Literature Textbook and Supplementary Reading Text (40 marks): recalling, reasoning, critical thinking, appreciating literary conventions, inference and analysis, creativity with fluency."
    ],
    grammar: null,
    readingLimits: ["Passage 1 (factual, descriptive or literary, about 400-420 words)", "Passage 2 (case-based factual, with statistical data or charts, about 300-330 words); both passages together 700-750 words"],
    scope: [
      "Class XII has no grammar section: writing is ONLY a notice (Q3), a formal or informal invitation or reply (Q4), a letter to the editor or a job application with bio-data (Q5), and an article or report (Q6).",
      "Literature comes ONLY from Flamingo (prose and poetry) and Vistas, from the selected chapters and poems. Memories of Childhood has two parts: The Cutting of My Long Hair and We Too are Human Beings.",
      "State that all names and addresses in the writing questions are fictitious, as the sample paper does."
    ],
    questions: [
      ...seniorEnglishReading("about 400-420", "about 300-330"),
      { section: "Section B", heading: "Creative Writing Skills", q: "Q3", type: "Notice (about 50 words, in a box)", marks: 4, attempt: 1, of: 2,
        detail: "Format 1, Content 2, Accuracy of spelling and grammar 1; the student is named and the notice is put in a box" },
      { section: "Section B", heading: "Creative Writing Skills", q: "Q4", type: "Formal or informal invitation, or reply (about 50 words)", marks: 4, attempt: 1, of: 2,
        detail: "for example a formal invitation to a guest speaker, or a formal reply accepting an invitation; Format 1, Content 2, Accuracy 1" },
      { section: "Section B", heading: "Creative Writing Skills", q: "Q5", type: "Letter (120-150 words)", marks: 5, attempt: 1, of: 2,
        detail: "a letter to the editor with verbal cues, or a job application with a detailed bio-data based on an advertisement; Format 1, Organisation 1, Content 2, Accuracy 1" },
      { section: "Section B", heading: "Creative Writing Skills", q: "Q6", type: "Article or report (120-150 words)", marks: 5, attempt: 1, of: 2,
        detail: "an article for a school magazine or a report on an event, with cue points; Format 1, Organisation 1, Content 2, Accuracy 1" },
      ...seniorEnglishLiterature("Flamingo", "Flamingo", "Vistas")
    ],
    ...seniorEnglishShared,
    generalInstructions: [
      "This question paper has 13 questions. All questions are compulsory.",
      "This question paper contains three sections: Section A: Reading Skills; Section B: Creative Writing Skills; Section C: Literature.",
      "Attempt all questions based on specific instructions for each part. Write the correct question number and part thereof in your answer sheet.",
      "Separate instructions are given with each question/part, wherever necessary.",
      "Adhere to the prescribed word limit while answering the questions."
    ],
    writingFormats: "notice (about 50 words, in a box: issuing body, NOTICE, date, heading, body with the necessary details and registration process, name and designation); formal or informal invitation or reply (about 50 words, in the third person for a formal invitation, with the occasion, date, time, venue and RSVP); letter to the editor or job application (120-150 words: sender's address, date, receiver's address, subject, salutation, body, complimentary close, name; a job application encloses a detailed bio-data); article (title and byline) or report (heading, byline with place and date) of 120-150 words"
  },
  "Class 11": {
    code: "301",
    paperLabel: "English Core (301), Class XI",
    books: { prose: "Hornbill", poetry: "Hornbill", supplementary: "Snapshots" },
    bookGroups: { "Hornbill (Prose)": "Hornbill", "Hornbill (Poetry)": "Hornbill", "Snapshots": "Snapshots" },
    competencies: [
      "Reading Skills (22 marks): conceptual understanding, decoding, analysing, inferring, interpreting, appreciating literary conventions and vocabulary.",
      "Creative Writing Skills (18 marks): appropriate format, style and tone, reasoning, fluency and creativity in the Class XI writing tasks.",
      "Literature Textbook and Supplementary Reading Text (40 marks): recalling, reasoning, critical thinking, appreciating literary conventions, inference and analysis, creativity with fluency."
    ],
    grammar: "gap filling (tenses, clauses) and re-ordering or transformation of sentences",
    readingLimits: ["Passage 1 (factual, descriptive or literary, about 350-400 words)", "Passage 2 (case-based factual, with statistical data or charts, about 250-300 words); both passages together 600-700 words"],
    scope: [
      "Class 11 is a school examination set on the Class XII 2026-27 layout (school policy), with the Class XI texts and writing tasks. Grammar and note-making are NOT examined in this paper.",
      "Writing is ONLY the Class XI tasks: a classified advertisement (Q3), a poster (Q4), a speech (Q5) and a debate (Q6). Do NOT set a notice, invitation, letter, article or report.",
      "Literature comes ONLY from Hornbill (prose and poetry) and Snapshots, from the selected chapters and poems.",
      "State that all names and addresses in the writing questions are fictitious."
    ],
    questions: [
      ...seniorEnglishReading("about 350-400", "about 250-300"),
      { section: "Section B", heading: "Creative Writing Skills", q: "Q3", type: "Classified advertisement (up to 50 words, in a box)", marks: 4, attempt: 1, of: 2,
        detail: "situation vacant or wanted, to-let, for sale, or lost and found; Format 1, Content 2, Expression 1" },
      { section: "Section B", heading: "Creative Writing Skills", q: "Q4", type: "Poster (up to 50 words)", marks: 4, attempt: 1, of: 2,
        detail: "a social-awareness campaign or a school, cultural or educational event, with a slogan; Format 1, Content 2, Expression 1" },
      { section: "Section B", heading: "Creative Writing Skills", q: "Q5", type: "Speech (120-150 words)", marks: 5, attempt: 1, of: 2,
        detail: "on verbal or visual cues about a contemporary, age-appropriate topic; Format 1, Content 2, Expression 2" },
      { section: "Section B", heading: "Creative Writing Skills", q: "Q6", type: "Debate (120-150 words)", marks: 5, attempt: 1, of: 2,
        detail: "for or against a motion on a contemporary, topical issue, on verbal or visual inputs; Format 1, Content 2, Expression 2" },
      ...seniorEnglishLiterature("Hornbill", "Hornbill", "Snapshots")
    ],
    ...seniorEnglishShared,
    generalInstructions: [
      "This question paper has 13 questions. All questions are compulsory.",
      "This question paper contains three sections: Section A: Reading Skills; Section B: Creative Writing Skills; Section C: Literature.",
      "Attempt all questions based on specific instructions for each part. Write the correct question number and part thereof in your answer sheet.",
      "Separate instructions are given with each question/part, wherever necessary.",
      "Adhere to the prescribed word limit while answering the questions."
    ],
    writingFormats: "classified advertisement (up to 50 words, in a box, in telegraphic style with the category heading and contact details); poster (up to 50 words, in a box: title or slogan, organiser, event or cause details, date, time, venue); speech (120-150 words: address the audience, introduce the topic, develop points, conclude and thank); debate (120-150 words: address the chair and audience, state the motion and your stand for or against, argue with reasons and examples, conclude)"
  }
});

export function getSecondaryEnglish(className, subjectName) {
  if (subjectName === "English (R1)" && (className === "Class 9" || className === "Class 10")) return secondaryEnglish[className];
  if (subjectName === "English Core" && (className === "Class 11" || className === "Class 12")) return secondaryEnglish[className];
  return null;
}

const class10EnglishPattern = `ENGLISH LANGUAGE AND LITERATURE - CODE NO. 184, Class X, Maximum Marks 80, Time Allowed 3 hours.
This question paper comprises 11 questions. All questions are compulsory.
The question paper contains THREE sections:
  Section A - Reading Skills (20 marks):
    Q1. A discursive passage of 400-450 words (10 marks).
    Q2. A case-based factual passage of 200-250 words with visual input or statistical data (10 marks).
    Multiple choice / objective type questions and short answer questions (30-40 words).
  Section B - Grammar and Creative Writing Skills (20 marks):
    Q3. Grammar: 12 items, attempt any 10 (10 marks) - gap filling, editing and transformation.
    Q4. Formal letter in 100-120 words, one of two (5 marks).
    Q5. Analytical paragraph in 100-120 words on a given map / chart / graph / cue, one of two (5 marks).
  Section C - Literature Textbook (40 marks):
    Q6. One of two extracts from drama / prose (5 marks).
    Q7. One of two extracts from poetry (5 marks).
    Q8. Four of five short answers in 40-50 words, FIRST FLIGHT (4 x 3 = 12 marks).
    Q9. Two of three short answers in 40-50 words, FOOTPRINTS WITHOUT FEET (2 x 3 = 6 marks).
    Q10. One of two long answers in 100-120 words, FIRST FLIGHT (6 marks).
    Q11. One of two long answers in 100-120 words, FOOTPRINTS WITHOUT FEET (6 marks).
Attempt questions based on the specific instructions for each part.
All details presented in the questions of the writing section are imaginary and created for assessment purposes.`;

const class9EnglishPattern = `ENGLISH (R1), Class IX, Maximum Marks 80, Time Allowed 3 hours - CBSE 2026-27 question paper design
for the NCERT textbook Kaveri. Class 9 is a school examination, so CBSE publishes no sample paper for it;
this is the design printed in CBSE's Class IX 2026-27 curriculum. The paper has 14 questions in three sections:
  Section A - Reading Skills (20 marks):
    Q1. A descriptive / discursive passage of 400-450 words (10 marks).
    Q2. A case-based passage of 200-250 words with verbal / visual input - statistical data, chart etc. (10 marks).
    Selected and constructed responses: MCQs, objective type, very short and short answers.
  Section B - Writing Skills and Grammar (30 marks):
    Q3. Editing / omitting, as MCQs (4 marks).
    Q4. Sentence rearrangement (3 marks).
    Q5. Sentence transformation (3 marks).
    Q6. Notice / informal invitation, up to 50 words (3 marks).
    Q7. Letter to the editor / formal e-mail on a given issue, presenting views and suggestions, 120-150 words (5 marks).
    Q8. Factual description / magazine article, 120-150 words (5 marks).
    Q9. Descriptive / narrative essay, 200-250 words (7 marks).
    For questions 6 to 9, attempt any one as per the internal choice provided; the choice may be on the same or different topics.
  Section C - Language through Literature (30 marks):
    Q10. One of two extracts from drama / prose (5 marks).
    Q11. One of two extracts from poetry (5 marks).
    Q12. Five of six questions in 40-50 words (5 x 2 = 10 marks).
    Q13. One of two questions assessing extrapolation beyond and across the texts, about 120-150 words (5 marks).
    Q14. One of two questions assessing theme / plot / character, about 120-150 words (5 marks).`;

// Class 9 and 10 Hindi, from the CBSE 2026-27 curriculum documents
// (Hindi_B_SecP1_2026-27 for Class X Hindi Course B, code 085;
// Hindi_SecP1IX_2026-27 for Class IX R2) and the Class X Course B 2026-27
// sample paper. The school's "Hindi (R2 - Ganga)" is Course B at Class 10
// (Sparsh Part 2 and Sanchayan Part 2) and R2 at Class 9 (the new NCERT
// textbook Ganga, which CBSE says serves R1 and R2 alike).
//
// Class 10: 16 questions in 14 / 16 / 28 / 22 marks, question by question as
// the sample paper sets them (the poetry extract comes before the prose one).
// Class 9: CBSE prints the section marks (14 / 16 / 30 / 20) and the grammar
// and writing breakdown, but not the 30-mark textbook section. That section is
// set here on the Class 10 pattern (school policy): poetry and prose extracts
// of 5 MCQs, 3 of 4 short answers from each, and one 2 of 3 question of 4
// marks that makes up the other two marks.
//
// `part` says which part of the syllabus a literature question comes from,
// so the prompt can move it when that part has no chapter selected.
export const secondaryHindi = {
  "Class 10": {
    code: "085",
    paperLabel: "हिंदी पाठ्यक्रम 'ब' (085)",
    parts: {
      prose: { label: "स्पर्श भाग-2 (गद्य खंड)", group: "स्पर्श भाग-2 (गद्य खंड)" },
      poetry: { label: "स्पर्श भाग-2 (काव्य खंड)", group: "स्पर्श भाग-2 (काव्य खंड)" },
      supplementary: { label: "संचयन भाग-2", group: "संचयन" }
    },
    readingLimits: ["Passage 1 (अपठित गद्यांश, about 200 words)", "Passage 2 (अपठित गद्यांश, about 200 words)"],
    grammar: "पदबंध, रचना के आधार पर वाक्य रूपांतरण, समास and मुहावरे",
    scope: [
      "Grammar is set ONLY on the four Course B items: पदबंध, रचना के आधार पर वाक्य रूपांतरण, समास, मुहावरे (4 of 5 items each).",
      "Literature comes ONLY from स्पर्श भाग-2 and संचयन भाग-2, from the selected lessons. These lessons are NOT examined in 2026-27: बिहारी के दोहे, महादेवी वर्मा - मधुर-मधुर मेरे दीपक जल, अंतोन चेखव - गिरगिट.",
      "Writing is ONLY the five Course B tasks: अनुच्छेद (about 120 words), औपचारिक पत्र (about 100 words), सूचना (about 60 words), विज्ञापन (about 40 words), and ई-मेल (about 80 words) OR लघुकथा (about 100 words). Do NOT set a संदेश, संवाद or अनौपचारिक पत्र."
    ],
    questions: [
      { section: "खंड 'क'", heading: "अपठित बोध", q: "Q1", type: "अपठित गद्यांश (about 200 words)", marks: 7,
        detail: "3 MCQs of 1 mark (one may be कथन-कारण) and 2 short answers of 2 marks" },
      { section: "खंड 'क'", heading: "अपठित बोध", q: "Q2", type: "अपठित गद्यांश (about 200 words)", marks: 7,
        detail: "3 MCQs of 1 mark (one may be कथन-कारण) and 2 short answers of 2 marks" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q3", type: "पदबंध", marks: 4, each: 1, attempt: 4, of: 5,
        detail: "identify the पदबंध and its type in a sentence" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q4", type: "रचना के आधार पर वाक्य रूपांतरण", marks: 4, each: 1, attempt: 4, of: 5,
        detail: "convert between सरल, संयुक्त and मिश्र वाक्य, or identify the type" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q5", type: "समास", marks: 4, each: 1, attempt: 4, of: 5,
        detail: "समास-विग्रह and naming the समास, or forming the समस्त पद" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q6", type: "मुहावरे", marks: 4, each: 1, attempt: 4, of: 5,
        detail: "use the मुहावरा correctly in context, or choose the मुहावरा that fits the sentence" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक", q: "Q7", type: "पठित काव्यांश (स्पर्श भाग-2)", marks: 5, each: 1, part: "poetry",
        detail: "5 MCQs of 1 mark on the extract" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक", q: "Q8", type: "काव्य खंड प्रश्न (25-30 words)", marks: 6, each: 2, attempt: 3, of: 4, part: "poetry",
        detail: "2 marks each, testing काव्यबोध" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक", q: "Q9", type: "पठित गद्यांश (स्पर्श भाग-2)", marks: 5, each: 1, part: "prose",
        detail: "5 MCQs of 1 mark on the extract" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक", q: "Q10", type: "गद्य खंड प्रश्न (25-30 words)", marks: 6, each: 2, attempt: 3, of: 4, part: "prose",
        detail: "2 marks each, on content, understanding and expression" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक", q: "Q11", type: "पूरक पाठ्यपुस्तक संचयन भाग-2 (50-60 words)", marks: 6, each: 3, attempt: 2, of: 3, part: "supplementary",
        detail: "3 marks each" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q12", type: "अनुच्छेद लेखन (about 120 words)", marks: 5, attempt: 1, of: 3,
        detail: "three current, practical topics, each with 3 संकेत-बिंदु" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q13", type: "औपचारिक पत्र (about 100 words)", marks: 5, attempt: 1, of: 2,
        detail: "to a principal, editor or official, in the prescribed format" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q14", type: "सूचना लेखन (about 60 words)", marks: 4, attempt: 1, of: 2,
        detail: "on a matter of everyday school or community life, in a box" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q15", type: "विज्ञापन लेखन (about 40 words)", marks: 3, attempt: 1, of: 2,
        detail: "for a product, service or cause, with a slogan" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q16", type: "ई-मेल लेखन (about 80 words) OR लघुकथा लेखन (about 100 words)", marks: 5, attempt: 1, of: 2,
        detail: "a formal e-mail on a given subject, or a short story on a given topic or title" }
    ]
  },
  "Class 9": {
    code: "R2",
    paperLabel: "हिंदी (आर-2), गंगा",
    parts: {
      prose: { label: "गंगा (गद्य खंड)", group: "गंगा (गद्य खंड)" },
      poetry: { label: "गंगा (काव्य खंड)", group: "गंगा (काव्य खंड)" }
    },
    readingLimits: ["Passage 1 (अपठित गद्यांश, about 200 words)", "Passage 2 (अपठित गद्यांश, about 200 words)"],
    grammar: "शब्द भंडार (समानार्थी शब्द, मुहावरे), शब्द-निर्माण (उपसर्ग, प्रत्यय), विराम चिह्न, and संज्ञा, सर्वनाम, निपात",
    scope: [
      "Class 9 Hindi follows the CBSE 2026-27 R2 design for the NEW NCERT textbook गंगा: खंड क 14, खंड ख 16, खंड ग 30, खंड घ 20 marks. Use ONLY गंगा: never क्षितिज, कृतिका, स्पर्श or संचयन.",
      "Grammar is set ONLY on the R2 items: समानार्थी शब्द and मुहावरे (from the textbook), उपसर्ग and प्रत्यय, विराम चिह्न, and संज्ञा, सर्वनाम, निपात. Do NOT set संधि, समास, अलंकार, वाक्य-भेद, अनुस्वार-अनुनासिक or नुक़्ता.",
      "Writing is ONLY the four R2 tasks: अनुच्छेद (about 100 words), अनौपचारिक पत्र (about 100 words), संवाद (about 80 words) and चित्र पर आधारित लेखन (about 80 words). Do NOT set सूचना, विज्ञापन, संदेश, ई-मेल, लघुकथा or औपचारिक पत्र.",
      "CBSE does not break down the 30-mark textbook section for Class 9; follow the blueprint's questions for it."
    ],
    questions: [
      { section: "खंड 'क'", heading: "अपठित बोध", q: "Q1", type: "अपठित गद्यांश (about 200 words)", marks: 7,
        detail: "3 MCQs of 1 mark and 2 short answers of 2 marks" },
      { section: "खंड 'क'", heading: "अपठित बोध", q: "Q2", type: "अपठित गद्यांश (about 200 words)", marks: 7,
        detail: "3 MCQs of 1 mark and 2 short answers of 2 marks" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q3", type: "शब्द भंडार: समानार्थी शब्द और मुहावरे (पाठ्यपुस्तक के आधार पर)", marks: 4, each: 1,
        detail: "समानार्थी शब्द 2 of 3 and मुहावरे 2 of 3, 1 mark each" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q4", type: "शब्द-निर्माण: उपसर्ग और प्रत्यय", marks: 4, each: 1, attempt: 4, of: 5,
        detail: "उपसर्ग 2 marks and प्रत्यय 2 marks" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q5", type: "विराम चिह्न", marks: 2, each: 1, attempt: 2, of: 3,
        detail: "add or correct the punctuation" },
      { section: "खंड 'ख'", heading: "व्यावहारिक व्याकरण", q: "Q6", type: "संज्ञा, सर्वनाम और निपात", marks: 6, each: 1, attempt: 6, of: 7,
        detail: "2 marks each for संज्ञा, सर्वनाम and निपात" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक", q: "Q7", type: "पठित काव्यांश (गंगा)", marks: 5, each: 1, part: "poetry",
        detail: "5 MCQs of 1 mark on the extract" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक", q: "Q8", type: "काव्य खंड प्रश्न (25-30 words)", marks: 6, each: 2, attempt: 3, of: 4, part: "poetry",
        detail: "2 marks each, testing काव्यबोध" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक", q: "Q9", type: "पठित गद्यांश (गंगा)", marks: 5, each: 1, part: "prose",
        detail: "5 MCQs of 1 mark on the extract" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक", q: "Q10", type: "गद्य खंड प्रश्न (25-30 words)", marks: 6, each: 2, attempt: 3, of: 4, part: "prose",
        detail: "2 marks each, on content, understanding and expression" },
      { section: "खंड 'ग'", heading: "पाठ्यपुस्तक", q: "Q11", type: "गद्य एवं काव्य खंड प्रश्न (60-80 words)", marks: 8, each: 4, attempt: 2, of: 3, part: "either",
        detail: "4 marks each, from prose and poetry together, testing thought and expression across lessons" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q12", type: "अनुच्छेद लेखन (about 100 words)", marks: 5, attempt: 1, of: 3,
        detail: "three current, practical topics, each with संकेत-बिंदु" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q13", type: "अनौपचारिक पत्र (about 100 words)", marks: 5, attempt: 1, of: 2,
        detail: "to a friend or relative, focused on expression" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q14", type: "संवाद लेखन (about 80 words)", marks: 5, attempt: 1, of: 2,
        detail: "on a given topic or situation" },
      { section: "खंड 'घ'", heading: "रचनात्मक लेखन", q: "Q15", type: "चित्र पर आधारित लेखन (about 80 words)", marks: 5,
        detail: "on a picture of a scene or event, with NO choice" }
    ]
  }
};

// Class 9 and 10 "Hindi (R2 - Ganga)" only; other Hindi courses keep their layout.
export function getSecondaryHindi(className, subjectName) {
  if (subjectName !== "Hindi (R2 - Ganga)") return null;
  return secondaryHindi[className] || null;
}

const class10HindiPattern = `हिंदी पाठ्यक्रम 'ब' - CODE NO. 085, Class X, Maximum Marks 80, Time Allowed 3 hours.
The question paper has 16 questions. All questions are compulsory. It is divided into four sections - क, ख, ग and घ.
  खंड क - अपठित बोध (14 marks): Q1-Q2, two unseen prose passages of about 200 words, each with 3 MCQs (1 mark)
          and 2 short answers (2 marks) - 7 + 7.
  खंड ख - व्यावहारिक व्याकरण (16 marks): 20 items, 16 to be answered.
          Q3 पदबंध, Q4 रचना के आधार पर वाक्य रूपांतरण, Q5 समास, Q6 मुहावरे - 4 of 5 items in each, 1 mark each.
  खंड ग - पाठ्यपुस्तक एवं पूरक पाठ्यपुस्तक (28 marks):
          Q7 पठित काव्यांश from स्पर्श भाग-2, 5 MCQs (5). Q8 3 of 4 questions on the poems, 25-30 words (3 x 2 = 6).
          Q9 पठित गद्यांश from स्पर्श भाग-2, 5 MCQs (5). Q10 3 of 4 questions on the prose lessons, 25-30 words (3 x 2 = 6).
          Q11 2 of 3 questions on संचयन भाग-2, 50-60 words (2 x 3 = 6).
  खंड घ - रचनात्मक लेखन (22 marks), with internal choice:
          Q12 अनुच्छेद, about 120 words, one of three topics with संकेत-बिंदु (5).
          Q13 औपचारिक पत्र, about 100 words (5).   Q14 सूचना, about 60 words (4).   Q15 विज्ञापन, about 40 words (3).
          Q16 ई-मेल, about 80 words, OR लघुकथा, about 100 words (5).
Answer the questions following the instructions given, and as far as possible answer the four sections in order.`;

const class9HindiPattern = `हिंदी (आर-2), Class IX, Maximum Marks 80, Time Allowed 3 hours - CBSE 2026-27 R2 design for the NCERT
textbook गंगा. Class 9 is a school examination, so CBSE publishes no sample paper for it. CBSE's Class IX
curriculum sets the section marks and the grammar and writing questions; the textbook section's questions
are set on the Class 10 Course B pattern (school policy). The paper has 15 questions in four sections:
  खंड क - अपठित बोध (14 marks): Q1-Q2, two unseen prose passages of about 200 words, each with 3 MCQs (1 mark)
          and 2 short answers (2 marks) - 7 + 7.
  खंड ख - व्यावहारिक व्याकरण (16 marks), 16 items to be answered:
          Q3 शब्द भंडार - समानार्थी शब्द (2 of 3) and मुहावरे (2 of 3), from the textbook (4).
          Q4 शब्द-निर्माण - उपसर्ग and प्रत्यय, 4 of 5 (4).   Q5 विराम चिह्न, 2 of 3 (2).
          Q6 संज्ञा, सर्वनाम, निपात, 6 of 7 (6).
  खंड ग - पाठ्यपुस्तक गंगा (30 marks):
          Q7 पठित काव्यांश, 5 MCQs (5). Q8 3 of 4 questions on the poems, 25-30 words (6).
          Q9 पठित गद्यांश, 5 MCQs (5). Q10 3 of 4 questions on the prose lessons, 25-30 words (6).
          Q11 2 of 3 questions across prose and poetry, 60-80 words (2 x 4 = 8).
  खंड घ - रचनात्मक लेखन (20 marks):
          Q12 अनुच्छेद, about 100 words, one of three topics with संकेत-बिंदु (5).
          Q13 अनौपचारिक पत्र, about 100 words, with choice (5).   Q14 संवाद, about 80 words, with choice (5).
          Q15 चित्र पर आधारित लेखन, about 80 words, with no choice (5).`;

// Class 9 and 10 skill subjects, from the CBSE 2026-27 skill curricula
// (405-FMM, 413-HEALTHCARE, 417-AI, 418-PHYSICAL_ACTIVITY_TRAINER, IX and X).
// Each is 100 marks: a 50-mark theory paper (Part A Employability Skills 10,
// Part B Subject Specific Skills 40, with the unit marks below) and 50 marks
// of practical work, project and viva that are not part of the written paper.
//
// The theory paper layout is read from CBSE's skill sample papers
// (cbseacademic.nic.in/skill-education-sqp.html). The newest are for 2025-26;
// CBSE has not published 2026-27 skill papers, and the 2026-27 units carry the
// same marks. All five papers CBSE serves (Class X 405, 413, 417, 418 and
// Class IX 413) use this same layout, word for word in their instructions.
// CBSE's links for the Class IX 405, 417 and 418 papers are broken (404).
//
// `sqp` on a unit is the number of questions the sample paper's blueprint
// prints from it: [1-mark, 2-mark, 4-mark] (Part A: [1-mark, 2-mark]).
export const skillPaperQuestions = [
  { section: "Section A", heading: "Objective Type Questions", q: "Q1", type: "Employability Skills - objective questions", marks: 4, each: 1, attempt: 4, of: 6, part: "A",
    detail: "MCQs, fill in the blanks and one-word answers on Part A" },
  { section: "Section A", heading: "Objective Type Questions", q: "Q2", type: "Subject Specific Skills - objective questions", marks: 5, each: 1, attempt: 5, of: 6, part: "B",
    detail: "MCQs, fill in the blanks, true or false and match the following on Part B" },
  { section: "Section A", heading: "Objective Type Questions", q: "Q3", type: "Subject Specific Skills - objective questions", marks: 5, each: 1, attempt: 5, of: 6, part: "B",
    detail: "MCQs, fill in the blanks, true or false and match the following on Part B" },
  { section: "Section A", heading: "Objective Type Questions", q: "Q4", type: "Subject Specific Skills - objective questions", marks: 5, each: 1, attempt: 5, of: 6, part: "B",
    detail: "MCQs, fill in the blanks, true or false and match the following on Part B, including a short case or situation" },
  { section: "Section A", heading: "Objective Type Questions", q: "Q5", type: "Subject Specific Skills - objective questions", marks: 5, each: 1, attempt: 5, of: 6, part: "B",
    detail: "MCQs, fill in the blanks, true or false and match the following on Part B, including a short case or situation" },
  { section: "Section B", heading: "Subjective Type Questions", q: "Q6-Q10", count: 5, type: "Employability Skills - short answers (20-30 words)", marks: 6, each: 2, attempt: 3, of: 5, part: "A",
    detail: "2 marks each, on Part A" },
  { section: "Section B", heading: "Subjective Type Questions", q: "Q11-Q16", count: 6, type: "Subject Specific Skills - short answers (20-30 words)", marks: 8, each: 2, attempt: 4, of: 6, part: "B",
    detail: "2 marks each, on Part B" },
  { section: "Section B", heading: "Subjective Type Questions", q: "Q17-Q21", count: 5, type: "Subject Specific Skills - long answers (50-80 words)", marks: 12, each: 4, attempt: 3, of: 5, part: "B",
    detail: "4 marks each, on Part B, including application, case and situation based questions" }
];

const skillPaperPattern = `The question paper is divided into two sections, A and B. Section A has objective type questions and
Section B has subjective type questions. Out of the given (5 + 16 =) 21 questions, a candidate has to answer
(5 + 10 =) 15 questions in the allotted (maximum) time of 2 hours. All questions of a section must be attempted
in the correct order.
  SECTION A - OBJECTIVE TYPE QUESTIONS (24 marks): 5 questions, each with sub-parts; there is no negative marking.
    Q1. Employability Skills: answer any 4 of the given 6 questions (1 x 4 = 4).
    Q2 to Q5. Subject Specific Skills: in each, answer any 5 of the given 6 questions (1 x 5 = 5 each, 20 marks).
  SECTION B - SUBJECTIVE TYPE QUESTIONS (26 marks): 16 questions, of which 10 are to be answered.
    Q6 to Q10. Employability Skills: answer any 3 of the 5 questions, in 20-30 words each (2 x 3 = 6).
    Q11 to Q16. Subject Specific Skills: answer any 4 of the 6 questions, in 20-30 words each (2 x 4 = 8).
    Q17 to Q21. Subject Specific Skills: answer any 3 of the 5 questions, in 50-80 words each (4 x 3 = 12).
Marks: Part A Employability Skills 10 (4 + 6), Part B Subject Specific Skills 40 (20 + 8 + 12). Theory 50 marks;
the other 50 marks are practical work, project and viva, assessed separately.`;

const employabilityUnits = [
  { match: "Communication Skills", marks: 2, sqp: [1, 1] }, { match: "Self-Management Skills", marks: 2, sqp: [2, 1] },
  { match: "Information and Communication Technology Skills", marks: 2, sqp: [1, 1] },
  { match: "Entrepreneurial Skills", marks: 2, sqp: [1, 1] }, { match: "Green Skills", marks: 2, sqp: [1, 1] }
];

// A row with `count` stands for that many separately numbered questions (the
// Section B groups); the others are one question each, with sub-parts.
// `units` are the Part B units with their theory marks; `match` is matched
// against the unit titles in data.js. `practicalOnly` units carry no theory marks.
export const secondarySkill = {
  "Introduction to Financial Markets (405)": {
    code: "405", label: "Introduction to Financial Markets (405)",
    book: "Introduction to Financial Markets (CBSE and NSE Academy) - job role: Business Correspondent",
    "Class 9": [
      { match: "Money - What it is", marks: 4 }, { match: "Money Exchange Systems", marks: 3 },
      { match: "Key Characteristics of Money", marks: 2 }, { match: "What is Financial Planning", marks: 6 },
      { match: "What is Income", marks: 2 }, { match: "What are Expenses", marks: 2 },
      { match: "What is a Bank", marks: 6 }, { match: "Why Save", marks: 3 },
      { match: "Setting Goals", marks: 3 }, { match: "Systematic Saving and Investments", marks: 5 },
      { match: "Making a Budget", marks: 4 }],
    "Class 10": [
      { match: "Investment Basics", marks: 2, sqp: [4, 0, 0] }, { match: "Securities", marks: 2, sqp: [2, 0, 0] },
      { match: "Primary Market", marks: 7, sqp: [4, 1, 1] }, { match: "Secondary Market", marks: 7, sqp: [4, 1, 1] },
      { match: "Derivatives", marks: 2, sqp: [2, 0, 0] }, { match: "Depository", marks: 2, sqp: [2, 1, 0] },
      { match: "Mutual Funds", marks: 4, sqp: [1, 0, 1] }, { match: "Miscellaneous", marks: 6, sqp: [2, 1, 1] },
      { match: "Concepts and Modes of Analysis", marks: 6, sqp: [2, 1, 1] }, { match: "Ratio Analysis", marks: 2, sqp: [1, 1, 0] }],
    notes: ["Numerical questions (interest, Rule of 72, budgets, brokerage, NAV, dividend yield, ratios) use simple Indian-rupee figures that can be worked by hand."]
  },
  "Health Care (413)": {
    code: "413", label: "Health Care (413)",
    book: "Health Care (CBSE skill curriculum) - job role: General Duty Assistant",
    "Class 9": [
      { match: "Health Care Delivery Systems", marks: 10, sqp: [5, 1, 1] }, { match: "Role of Patient Care Assistant", marks: 10, sqp: [5, 1, 1] },
      { match: "Personal Hygiene and Hygiene Standards", marks: 10, sqp: [5, 1, 1] },
      { match: "Primary Healthcare and Emergency Medical Response", marks: 5, sqp: [5, 1, 1] }, { match: "Immunization", marks: 5, sqp: [4, 2, 1] }],
    "Class 10": [
      { match: "Hospital Structure and Functions", marks: 10, sqp: [4, 1, 1] }, { match: "Care Plan and Care of Patients", marks: 5, sqp: [4, 1, 1] },
      { match: "Sterilization and Disinfection", marks: 5, sqp: [4, 1, 1] }, { match: "Basic First Aid", marks: 10, sqp: [4, 1, 1] },
      { match: "Structure, Functions and Nutrition", marks: 5, sqp: [4, 1, 1] }, { match: "Public Relations in Hospital", marks: 5, sqp: [4, 1, 0] }],
    notes: ["Frame situations in a hospital, clinic or community health setting; procedures (hand washing, bed making, vital signs, first aid, biomedical waste colour codes) are asked as correct steps."]
  },
  "Artificial Intelligence (417)": {
    code: "417", label: "Artificial Intelligence (417)",
    book: "Artificial Intelligence (CBSE curriculum, code 417)",
    "Class 9": [
      { match: "AI Reflection, Project Cycle and Ethics", marks: 10 }, { match: "Data Literacy", marks: 10 },
      { match: "Math for AI", marks: 7 }, { match: "Introduction to Generative AI", marks: 5 },
      { match: "Introduction to Python", marks: 8 }],
    "Class 10": [
      { match: "Revisiting AI Project Cycle", marks: 7, sqp: [5, 1, 1] }, { match: "Advanced Concepts of Modelling", marks: 11, sqp: [4, 2, 2] },
      { match: "Evaluating Models", marks: 10, sqp: [6, 1, 1] }, { match: "Statistical Data", marks: 0, practicalOnly: true },
      { match: "Computer Vision", marks: 4, sqp: [4, 1, 0] }, { match: "Natural Language Processing", marks: 8, sqp: [5, 1, 1] },
      { match: "Advance Python", marks: 0, practicalOnly: true }],
    notes: ["Python questions (Class 9) ask the student to predict output, find the error or write a few lines of code; evaluation questions (Class 10) give a confusion matrix to calculate accuracy, precision, recall or F1 score."]
  },
  "Physical Activity Trainer (418)": {
    code: "418", label: "Physical Activity Trainer (418)",
    book: "Physical Activity Trainer (CBSE skill curriculum, code 418)",
    "Class 9": [
      { match: "Role of Physical Education in Child Development", marks: 10 },
      { match: "Planning Age Appropriate Physical Activity", marks: 10 },
      { match: "Organising Age Appropriate Physical Activities", marks: 12 },
      { match: "Children Health and Safety", marks: 8 }],
    "Class 10": [
      { match: "Physical Activity Facilitator", marks: 10, sqp: [6, 1, 1] }, { match: "Assessment and Evaluation of Students", marks: 10, sqp: [6, 2, 2] },
      { match: "Free-play", marks: 10, sqp: [6, 1, 1] }, { match: "Monitoring and Inventory Management", marks: 10, sqp: [6, 2, 1] }],
    notes: ["Frame situations of a school physical activity facilitator working with young children: planning sessions, organising events, safety and first aid, assessment and equipment."]
  }
};

export function getSecondarySkill(className, subjectName) {
  if (className !== "Class 9" && className !== "Class 10") return null;
  const subject = secondarySkill[subjectName];
  if (!subject) return null;
  return { ...subject, units: subject[className], employabilityUnits, questions: skillPaperQuestions, pattern: skillPaperPattern };
}

// Class 11 and 12 Physics (042), from the CBSE 2026-27 curriculum document
// (Physics_SecP2_2026-27) and the Class XII 2026-27 sample paper, which says
// the question paper design is unchanged for 2026-27. The full paper is 70
// marks (30 more are practical) and `questions` is its layout, read from the
// sample paper: 33 questions in Sections A to E. Class 11 is a school
// examination with no CBSE sample paper, so it is set on the Class 12 layout
// (school policy) with its own unit weightage.
//
// Unit Tests and Periodic Assessments keep their own short shape; only the
// question formats (Assertion-Reason options, case studies, no word limits on
// numericals) and the scope limits apply to them as well.
//
// `units` are CBSE's mark bands. CBSE gives marks to groups of units (Units I
// and II together carry 16), so each band lists its chapters; `chapters` are
// words matched against the chapter titles in data.js, longest match wins.
const physicsPaperQuestions = [
  { section: "Section A", q: "Q1-Q12", type: "Multiple Choice Questions", count: 12, each: 1, marks: 12,
    detail: "Four options (A)-(D); at least one MCQ built on a figure (a circuit or a field diagram), with a words-only alternative for visually impaired students" },
  { section: "Section A", q: "Q13-Q16", type: "Assertion-Reason", count: 4, each: 1, marks: 4,
    detail: "The four options printed once above Q13; a question may open with a one-line context before the Assertion" },
  { section: "Section B", q: "Q17-Q21", type: "Very Short Answer", count: 5, each: 2, marks: 10,
    detail: "Internal choice in 2 questions (Q20 and Q21 in the sample paper); a short numerical, a reason, or two parts I and II" },
  { section: "Section C", q: "Q22-Q28", type: "Short Answer", count: 7, each: 3, marks: 21,
    detail: "Internal choice in 1 question (Q27 in the sample paper); numericals, derivations the curriculum allows, and explain-type questions in parts I, II, III" },
  { section: "Section D", q: "Q29-Q30", type: "Case study based", count: 2, each: 4, marks: 8,
    detail: "Each a passage of about 120-180 words followed by 4 sub-parts I-IV of 1 mark each (MCQs and one-line answers); no internal choice" },
  { section: "Section E", q: "Q31-Q33", type: "Long Answer", count: 3, each: 5, marks: 15,
    detail: "Internal choice in all 3 (A OR B); each split into sub-parts such as 2+2+1 or 3+2; one asks for a neat labelled diagram" }
];

const physicsPaperPattern = `There are 33 questions in all. All questions are compulsory.
This question paper has five sections: Section A, Section B, Section C, Section D and Section E.
All the sections are compulsory.
  Section A contains sixteen questions, twelve MCQ (Q1-Q12) and four Assertion-Reasoning based (Q13-Q16), of 1 mark each.
  Section B contains five questions of two marks each (Q17-Q21).
  Section C contains seven questions of three marks each (Q22-Q28).
  Section D contains two case study based questions of four marks each (Q29-Q30), each with four 1-mark sub-parts.
  Section E contains three long answer questions of five marks each (Q31-Q33).
There is no overall choice. However, an internal choice has been provided in two questions in Section B,
one question in Section C, and all three questions in Section E. You have to attempt only one of the
choices in such questions.
Use of calculators is not allowed.
The general instructions list the physical constants, to be used wherever necessary:
  c = 3 x 10^8 m/s; me = 9.1 x 10^-31 kg; mp = 1.7 x 10^-27 kg; e = 1.6 x 10^-19 C; mu0 = 4 pi x 10^-7 T m A^-1;
  h = 6.63 x 10^-34 J s; epsilon0 = 8.854 x 10^-12 C^2 N^-1 m^-2; Avogadro's number = 6.023 x 10^23 per gram mole;
  radius of nucleus ~ 10^-15 m.
A figure-based question carries a words-only alternative "For Visually Impaired Students only".`;

const physicsGeneralInstructions = [
  "There are 33 questions in all. All questions are compulsory.",
  "This question paper has five sections: Section A, Section B, Section C, Section D and Section E. All the sections are compulsory.",
  "Section A contains sixteen questions, twelve MCQ and four Assertion-Reasoning based of 1 mark each, Section B contains five questions of two marks each, Section C contains seven questions of three marks each, Section D contains two case study-based questions of four marks each and Section E contains three long answer questions of five marks each.",
  "There is no overall choice. However, an internal choice has been provided in two questions in Section B, one question in Section C, and all three questions in Section E. You have to attempt only one of the choices in such questions.",
  "Use of calculators is not allowed.",
  "You may use the following values of physical constants wherever necessary: c = 3 × 10⁸ m/s; mₑ = 9.1 × 10⁻³¹ kg; mₚ = 1.7 × 10⁻²⁷ kg; e = 1.6 × 10⁻¹⁹ C; μ₀ = 4π × 10⁻⁷ T m A⁻¹; h = 6.63 × 10⁻³⁴ J s; ε₀ = 8.854 × 10⁻¹² C² N⁻¹ m⁻²; Avogadro's number = 6.023 × 10²³ per gram mole; radius of nucleus ≈ 10⁻¹⁵ m."
];

// CBSE 2026-27 question paper design for Physics theory, Class XI and XII.
const physicsDesign = {
  understanding: 27, applying: 22, analysing: 21, percent: [38, 32, 30],
  labels: ["Remembering and Understanding (recall facts, terms and basic concepts; organise, compare, interpret, describe and state main ideas)",
           "Applying (solve problems in new situations using acquired knowledge, facts, techniques and rules)",
           "Analysing, Evaluating and Creating (break information into parts, make inferences, judge validity, combine elements in a new pattern)"]
};

// The Assertion-Reason options exactly as the 2026-27 Physics sample paper
// prints them. Option D is "both false", not "A false, R true".
const physicsArOptions = [
  "A. Both Assertion and Reason are true and Reason is the correct explanation of Assertion.",
  "B. Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
  "C. Assertion is true but Reason is false.",
  "D. Both Assertion and Reason are false."
];

const class12PhysicsScope = [
  "Energy stored in a capacitor: formulae only, NO derivation.",
  "Straight solenoid: qualitative treatment only. Ampere's circuital law is applied to an infinitely long straight wire; no proof of the law.",
  "Bar magnet as an equivalent solenoid, the field of a bar magnet along and perpendicular to its axis, and the torque on a bar magnet in a uniform field: qualitative treatment only. No time period of a magnet oscillating in a field.",
  "Moving coil galvanometer: current sensitivity and conversion to ammeter and voltmeter.",
  "Alternating current: LCR series circuit with phasors only; resonance, power, power factor and wattless current. No LC oscillations.",
  "Electromagnetic waves: displacement current as a basic idea; transverse nature is qualitative; the spectrum with elementary facts about uses.",
  "Young's double slit experiment: use the fringe width expression, do NOT ask for its derivation. Single-slit diffraction: width of the central maximum is qualitative only. No polarisation.",
  "Atoms: Bohr model with the expressions for the radius, velocity and energy of the nth orbit; hydrogen line spectra qualitative only (no Rydberg-formula numericals on spectral series).",
  "Nuclei: no radioactivity, no decay laws or half-life.",
  "Semiconductors: energy bands qualitative only; p-n junction, diode I-V characteristics and the diode as a rectifier. No Zener diode, special-purpose diodes, transistors or logic gates.",
  "The meter bridge and potentiometer are practical-examination experiments: do not set them as theory questions.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const class11PhysicsScope = [
  "Units and Measurements: units, systems of units, SI units, significant figures, uncertainty in a result, dimensions and dimensional analysis.",
  "Kinematics: frame of reference, position-time and velocity-time graphs, equations of uniformly accelerated motion (graphical and calculus treatment); vectors, projectile motion and uniform circular motion.",
  "Work, Energy and Power includes motion in a vertical circle and elastic and inelastic collisions in one and two dimensions.",
  "Rotational motion: centre of mass of a two-particle system and of a uniform rod; moments of inertia of simple objects are used, NOT derived.",
  "Mechanical Properties of Solids: shear modulus and applications of elastic behaviour are qualitative only.",
  "Mechanical Properties of Fluids: Bernoulli's theorem applied to Torricelli's law and dynamic lift; surface tension, excess pressure across a curved surface, drops, bubbles and capillary rise. No Reynolds number.",
  "Thermal Properties of Matter: blackbody radiation, Wien's law and Stefan's law are qualitative only.",
  "Kinetic Theory: the law of equipartition of energy is stated, not derived; mean free path is a concept only (no derivation).",
  "Oscillations: simple pendulum time period derived. No damped or forced oscillations.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

// How a Physics paper is written, as the prompt describes it. Every field of
// a senior paper spec below that holds prose is read by the prompt builder in
// main.js; the Unit Test and PA prompts use `constructed`, `typology`,
// `rigor`, `mandates` and `scope`, the full paper uses all of them.
const physicsFormats = {
  subject: "Physics",
  constructed: [
    "Very Short Answer (VSA - 2 Marks): a short numerical, a reason, or two parts I and II, worth exactly 2 marking-scheme value points. No word limit.",
    "Short Answer (SA - 3 Marks): a numerical (formula, substitution, answer with SI unit), a derivation the curriculum allows, or an explanation in parts I, II, III, worth 3 value points. No word limit.",
    "Long Answer (LA - 5 Marks): sub-parts such as 2 + 2 + 1 or 3 + 2 (a principle, derivation or labelled diagram, then a numerical or reasoning), with internal choice (A) OR (B)."
  ],
  designNote: "most 2-, 3- and 5-mark questions ask the student to solve, reason, compare or justify, not only to recall.",
  sourcing: "Source questions from the NCERT textbook and NCERT Exemplar, CBSE competency-based question banks and past board papers, as the sample paper does; case studies may use recent real-world applications of physics.",
  arPlacement: `once above the Assertion-Reason questions (note that D is "both false")`,
  arAnswered: "answered from the four options printed once above them",
  typology: {
    vsa: "A short numerical, a reason, or two parts (I and II) earning **exactly 2 marking-scheme value points**. Physics answers carry NO word limit; a numerical shows the formula, the substitution and the answer with its SI unit.",
    sa: `A numerical, a derivation the curriculum allows, or an explanation in parts I, II, III (for example "Explain: I ... II ... III ..."), worth **3 value points**, or a 2 + 1 split shown in the marks column. No word limit.`,
    cbqHeading: "Case Study Based Questions",
    cbq: [
      "A passage of about 120-180 words on a real-world application, a recent development or a historic experiment (the sample paper uses flexible polymer semiconductors in wearables, and Einstein's explanation of the photoelectric effect), followed by **four sub-parts I, II, III and IV of 1 mark each**: mostly MCQs with four options, and one or two one-line answers (define, state why).",
      "**No internal choice** inside a case study, as in the CBSE 2026-27 sample paper."
    ]
  },
  rigor: "Formulate questions requiring the formula to be stated, the substitution shown, and the final numerical answer with its SI unit (m, s, N, J, W, Pa, Ω, A, V, T, eV) and correct sign convention; derivations set out step by step; labelled circuit and ray diagrams where the student draws. Numbers must work out by hand, because calculators are not allowed.",
  instructionsNote: " (with the list of physical constants)",
  requirements: [
    `**Figures, as in the sample paper:** 2 to 3 questions give the student a figure (for example a circuit or bridge network in an MCQ, a current-carrying loop, a ray or wavefront diagram). Directly below EVERY question that depends on a figure, add an alternative headed "For Visually Impaired Students only" that tests the same concept in words only, with the same marks.`,
    "**Student drawing:** one long answer asks for a neat labelled diagram (for example a transformer, a compound microscope or a p-n junction rectifier). Never print the answer figure; give its words-only alternative for visually impaired students.",
    "**Assertion-Reason:** print the four options (A)-(D) once, above Q13, exactly as given in the typology rules above (rule 8).",
    "**Case studies (Section D):** four 1-mark sub-parts I-IV each, no internal choice.",
    "**Long answers (Section E):** each has an internal choice (A) OR (B) from the same unit and at the same level, split into sub-parts with the marks shown (for example 2+2+1 or 3+2)."
  ],
  figureQuota: "Set **2 to 3 figure-based questions** and **1 question in which the student draws a labelled diagram**, each with a words-only alternative for visually impaired students",
  diagramRules: `
    *   **Physics Diagrams:** MUST generate clean inline vector SVG for:
        - Circuit schematics (cells, resistors, capacitors, Wheatstone bridge networks, ammeter in series, voltmeter in parallel, galvanometer, diode) with values labelled.
        - Field and geometry figures (current-carrying loops and wires, field lines, charges and dipoles with distances), ray diagrams and wavefronts, graphs (V-I characteristics, binding energy per nucleon, photoelectric current vs potential).`
};

const physicsMandates = (roman, examples, samplePaper) => ({
  mandatesTitle: `CBSE PHYSICS (${roman}) MANDATES & PEDAGOGICAL RIGOR`,
  mandates: [
    "**No calculators:** choose values that can be worked by hand (powers of ten, simple ratios, π² ≈ 10 where the sample paper style allows), and use the physical constants printed in the general instructions.",
    "**Numerical working:** every numerical is marked on the formula, the substitution and the final answer with its SI unit and correct sign convention (Cartesian signs for mirrors and lenses, direction for vectors and fields).",
    `**Derivations:** ask only for derivations the curriculum keeps (see the CBSE 2026-27 scope limits in rule 9 above); where the curriculum says "no derivation" or "qualitative only", ask for the use of the result or a qualitative explanation instead.`,
    `**Physical reasoning:** include explain-why questions on everyday and technological situations (for example ${examples}), as the ${samplePaper}sample paper does.`
  ]
});

// Class 11 and 12 Chemistry (043), from the CBSE 2026-27 curriculum document
// (Chemistry_SecP2_2026-27) and the Class XII 2026-27 sample paper, which says
// the question paper design is unchanged. The layout matches Physics (33
// questions, 70 marks), but the formats differ: case-based questions are
// 1 + 1 + 2 marks with a choice in the 2-mark part, only one Section B
// question has a choice, and the Assertion-Reason options are the standard
// ones, printed under each question. Topics the curriculum assesses only
// formatively carry no question in a written paper.
const chemistryPaperQuestions = [
  { section: "Section A", q: "Q1-Q12", type: "Multiple Choice Questions", count: 12, each: 1, marks: 12,
    detail: "Four options (A)-(D); some built on a data table, graph, figure or structural formulae, a figure-based one with a separate question for visually challenged learners" },
  { section: "Section A", q: "Q13-Q16", type: "Assertion-Reason", count: 4, each: 1, marks: 4,
    detail: "Each followed by 'Select the most appropriate answer from the options given below:' and the four options" },
  { section: "Section B", q: "Q17-Q21", type: "Very Short Answer", count: 5, each: 2, marks: 10,
    detail: "Internal choice in 1 question (Q17 in the sample paper, 'Attempt either A or B'); often two 1-mark parts (I) and (II)" },
  { section: "Section C", q: "Q22-Q28", type: "Short Answer", count: 7, each: 3, marks: 21,
    detail: "Internal choice in 1 question (Q27 in the sample paper); numericals, name reactions, conversions, IUPAC names and reasoning, split 1 + 2 or 3 x 1" },
  { section: "Section D", q: "Q29-Q30", type: "Case-based / data-based", count: 2, each: 4, marks: 8,
    detail: "A passage, experiment, graph or data table followed by (I) 1 mark, (II) 1 mark and (IIIA) OR (IIIB) 2 marks; choice only in part III" },
  { section: "Section E", q: "Q31-Q33", type: "Long Answer", count: 3, each: 5, marks: 15,
    detail: "Internal choice in all 3 ('Attempt either A or B'); split such as 3 x 1 + 2, 5 x 1 or 1 + 2 + 1 + 1" }
];

const chemistryPaperPattern = `There are 33 questions in this question paper with internal choice.
SECTION A consists of 16 multiple-choice questions carrying 1 mark each (Q1-Q12 MCQ, Q13-Q16 Assertion-Reason).
SECTION B consists of 5 very short answer questions carrying 2 marks each (Q17-Q21).
SECTION C consists of 7 short answer questions carrying 3 marks each (Q22-Q28).
SECTION D consists of 2 case-based questions carrying 4 marks each (Q29-Q30), with sub-parts of 1, 1 and 2 marks.
SECTION E consists of 3 long answer questions carrying 5 marks each (Q31-Q33).
All questions are compulsory. There is no overall choice; internal choice ("Attempt either A or B") is given in
one question of Section B, one of Section C, the 2-mark part of each case-based question and all three long answers.
In addition, a separate question is provided for visually impaired candidates in lieu of questions having visual inputs.
Use of log tables and calculators is not allowed.`;

const chemistryGeneralInstructions = [
  "There are 33 questions in this question paper with internal choice.",
  "SECTION A consists of 16 multiple-choice questions carrying 1 mark each.",
  "SECTION B consists of 5 very short answer questions carrying 2 marks each.",
  "SECTION C consists of 7 short answer questions carrying 3 marks each.",
  "SECTION D consists of 2 case-based questions carrying 4 marks each.",
  "SECTION E consists of 3 long answer questions carrying 5 marks each.",
  "All questions are compulsory.",
  "In addition to this, a separate question has been provided for visually impaired candidates in lieu of questions having visual inputs.",
  "Use of log tables and calculators is not allowed."
];

// CBSE 2026-27 question paper design for Chemistry theory, Class XI and XII.
const chemistryDesign = {
  understanding: 28, applying: 21, analysing: 21, percent: [40, 30, 30],
  labels: physicsDesign.labels
};

const chemistryArOptions = [
  "A. Both A and R are true, and R is the correct explanation of A.",
  "B. Both A and R are true, and R is not the correct explanation of A.",
  "C. A is true but R is false.",
  "D. A is false but R is true."
];

const chemistryNoLogs = "Log tables and calculators are not allowed: choose numbers that work by hand, and print in the question any logarithm or antilogarithm a numerical needs (for example log 2 = 0.3010, log 3 = 0.4771).";

const class12ChemistryScope = [
  "Surface Chemistry, General Principles and Processes of Isolation of Elements, Polymers and Chemistry in Everyday Life are assessed only formatively in 2026-27: set NO question from them.",
  chemistryNoLogs,
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const class11ChemistryScope = [
  "s- and p-Block Elements and the Gaseous State are assessed only formatively in 2026-27: set NO question from them.",
  chemistryNoLogs,
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const chemistryFormats = {
  subject: "Chemistry",
  misconceptions: "SN1 vs SN2 stereochemistry (racemisation vs inversion), order vs molecularity, strong vs weak field ligands and high vs low spin, basicity of amines in water vs the gas phase, reducing vs non-reducing sugars, the effect of electron-withdrawing and electron-releasing groups on acidity",
  constructed: [
    "Very Short Answer (VSA - 2 Marks): two 1-mark parts (I) and (II) or one 2-mark question - complete and balance a reaction, account for an observation, a short numerical, or reflect on a statement - worth exactly 2 marking-scheme value points.",
    "Short Answer (SA - 3 Marks): a numerical (formula, working, answer with unit), identifying name reactions and completing a sequence, conversions, IUPAC names, or reasoning split 1 + 2 or 3 x 1, worth 3 value points.",
    "Long Answer (LA - 5 Marks): sub-parts such as 3 x 1 + 2, 5 x 1 or 1 + 2 + 1 + 1, with internal choice (A) OR (B)."
  ],
  designNote: "most 2-, 3- and 5-mark questions ask the student to explain, predict, justify, compare or interpret data, not only to recall.",
  sourcing: "Source questions from the NCERT textbook and NCERT Exemplar, CBSE competency-based question banks and past board papers, as the sample paper does; case-based questions may use an experiment, test results, a data table or a graph.",
  arPlacement: `under each Assertion-Reason question, after the line "Select the most appropriate answer from the options given below:"`,
  arAnswered: "answered from the four options printed below it",
  typology: {
    vsa: "Two 1-mark parts (I) and (II), or one 2-mark question: complete and balance a reaction, account for an observation, a short numerical, or \"reflect on the statement\". Exactly **2 marking-scheme value points**; no fixed word limit.",
    sa: "A numerical (formula, working and answer with unit), identify name reactions and complete the missing reactant or product, a conversion in two or three steps, an IUPAC name with reasoning, or explanations split 1 + 2 or 3 x 1. **3 value points**; no fixed word limit.",
    cbqHeading: "Case-Based / Data-Based Questions",
    cbq: [
      "A short passage, experiment, data table or graph (the sample paper uses a bar graph of pKa values of substituted phenols, and the tests a class carries out to identify a carbohydrate), followed by **(I) a 1-mark MCQ, (II) a 1-mark MCQ and (III) a 2-mark question with an internal choice (IIIA) OR (IIIB)** that asks the student to predict, justify or interpret the data.",
      "The internal choice is ONLY in part III. A case built on a graph or figure gets a separate words-only version for visually challenged learners."
    ]
  },
  rigor: "Formulate questions requiring balanced equations with the reagent and conditions over the arrow, correct structural or condensed formulae, IUPAC names, numericals with the formula, working and the answer with its unit, and reasons that name the effect involved (inductive, resonance, steric, hydrogen bonding, crystal field). Numbers must work out by hand, because log tables and calculators are not allowed.",
  instructionsNote: "",
  requirements: [
    `**Section instructions, as in the sample paper:** under each Section heading print CBSE's instruction line, for example "Question 1 to 16 are multiple choice questions. Only one of the choices is correct. Select and write the correct choice as well as the answer to these questions." and "Question No. 29 & 30 are case-based/data-based questions carrying 4 marks each."`,
    `**Visual inputs, as in the sample paper:** about 4 to 6 questions use a figure, graph, data table or structural formula (for example a table of boiling points and pKb values in an MCQ, a gas-solution equilibrium figure, a DNA strand to complete, a log k vs 1/T graph, a pKa bar graph in a case-based question). Directly below every question that depends on a figure or graph, add a separate question headed "(For Visually Challenged Learners)" on the same concept in words only, with the same marks. A data table set in text needs no alternative.`,
    `**Internal choice:** print "Attempt either A or B" and number the choices 17(A) OR 17(B); in a case-based question print "Attempt either (IIIA) or (IIIB)". Choice sits in one Section B question, one Section C question, part III of both case-based questions and all three long answers (about 33% of the marks).`,
    "**Assertion-Reason:** print the line and the four options under EACH Assertion-Reason question, exactly as given in the typology rules above (rule 8).",
    "**Real-life and experimental contexts:** a student's experiment or observation (named students are fine), test results, data tables and graphs, as the sample paper uses throughout."
  ],
  figureQuota: `Set **4 to 6 questions with a visual input** (figure, graph, data table or structural formula), each figure or graph with a separate question for visually challenged learners`,
  diagramRules: `
    *   **Chemistry Visuals:** MUST generate clean inline vector SVG or HTML tables for:
        - Structural formulae of organic compounds (skeletal or condensed) and reaction schemes with the reagent and conditions written over the arrow and a blank for the missing reactant or product.
        - Graphs with labelled axes and scales (log k vs 1/T, concentration vs time, vapour pressure vs mole fraction, molar conductivity vs square root of concentration, bar graphs of pKa or boiling points).
        - Apparatus and models (galvanic or electrolytic cell, a gas above a solution under a piston, a DNA strand with bases to complete); data tables as HTML tables.`
};

const chemistryMandates = (roman, nameReactions) => ({
  mandatesTitle: `CBSE CHEMISTRY (${roman}) MANDATES & PEDAGOGICAL RIGOR`,
  mandates: [
    "**Equations:** every reaction is balanced, with the reagent, catalyst and conditions (temperature, pressure, medium) written over the arrow; organic reactions show structural or condensed formulae.",
    `**Name reactions and conversions:** ask the student to identify a named reaction and complete the missing reactant or product (${nameReactions}), or to convert one compound into another in two or three steps.`,
    "**Numericals:** state the formula, substitute with units and give the answer with its unit; no log tables or calculators, so print any logarithm values needed.",
    "**Reasoning:** \"Account for\", \"Give reason\", \"Predict\" and \"Justify\" questions name the effect behind the answer (inductive, resonance, hyperconjugation, steric, hydrogen bonding, crystal field splitting), as the sample paper does."
  ]
});

// Class 11 and 12 Biology (044), from the CBSE 2026-27 curriculum document
// (Biology_SecP2_2026-27) and the Class XII 2026-27 sample paper, which says
// the design is unchanged. Same 33-question, 70-mark layout as Physics and
// Chemistry, with Biology's own choices: three Section B questions, none in
// Section C, and a choice between the last two 1-mark parts (C or D) of each
// case-based question. Several questions give a small hypothetical data table.
const biologyPaperQuestions = [
  { section: "Section A", q: "Q1-Q12", type: "Multiple Choice Questions", count: 12, each: 1, marks: 12,
    detail: "Four options (A)-(D), most set in a real-life or experimental situation; figure-based ones (labelled diagram, pedigree chart, experiment illustration) with a words-only alternative for visually impaired students" },
  { section: "Section A", q: "Q13-Q16", type: "Assertion-Reason", count: 4, each: 1, marks: 4,
    detail: "The four options printed once above Q13" },
  { section: "Section B", q: "Q17-Q21", type: "Very Short Answer", count: 5, each: 2, marks: 10,
    detail: "Internal choice in 3 questions (Q17, Q20 and Q21 in the sample paper); 2 or 3 built on a small hypothetical data table" },
  { section: "Section C", q: "Q22-Q28", type: "Short Answer", count: 7, each: 3, marks: 21,
    detail: "No internal choice; clinical, genetic-cross and research situations, often in parts A, B, C of 1 mark each" },
  { section: "Section D", q: "Q29-Q30", type: "Case-based", count: 2, each: 4, marks: 8,
    detail: "A real-life case followed by A (1 mark), B (2 marks) and C OR D (1 mark); choice only between C and D" },
  { section: "Section E", q: "Q31-Q33", type: "Long Answer", count: 3, each: 5, marks: 15,
    detail: "Internal choice in all 3 ('Attempt either option A or B'); situation-based, split such as 4 + 1, 2 + 2 + 1 or I to IV" }
];

const biologyPaperPattern = `All questions are compulsory. The question paper has five sections and 33 questions.
Section A has 16 questions of 1 mark each (Q1-Q12 MCQ, Q13-Q16 Assertion-Reason); Section B has 5 questions of
2 marks each (Q17-Q21); Section C has 7 questions of 3 marks each (Q22-Q28); Section D has 2 case-based
questions of 4 marks each (Q29-Q30), with parts A (1), B (2) and C OR D (1); and Section E has 3 questions of
5 marks each (Q31-Q33).
There is no overall choice. Internal choice is provided in three questions of Section B, in the last part of
each case-based question, and in all three questions of Section E; Section C has none.
Wherever necessary, neat and properly labelled diagrams should be drawn.
A figure-based question carries a words-only alternative "For Visually impaired students".`;

const biologyGeneralInstructions = [
  "All questions are compulsory.",
  "The question paper has five sections and 33 questions.",
  "Section–A has 16 questions of 1 mark each; Section–B has 5 questions of 2 marks each; Section–C has 7 questions of 3 marks each; Section–D has 2 case-based questions of 4 marks each; and Section–E has 3 questions of 5 marks each.",
  "There is no overall choice. Answer all 33 questions. However, internal choices have been provided in some questions. A student has to attempt only one of the alternatives in such questions.",
  "Wherever necessary, neat and properly labeled diagrams should be drawn."
];

// CBSE 2026-27 question paper design for Biology: 50 / 30 / 20 per cent.
const biologyDesign = {
  understanding: 35, applying: 21, analysing: 14, percent: [50, 30, 20],
  labels: ["Demonstrate Knowledge and Understanding (state, name, list, identify, define, suggest, describe, outline, summarise)",
           "Application of Knowledge / Concepts (calculate, illustrate, show, adapt, explain, distinguish)",
           "Analyse, Evaluate and Create (interpret, analyse, compare, contrast, examine, evaluate, discuss, construct)"]
};

const biologyArOptions = [
  "A. Both A and R are true and R is the correct explanation of A.",
  "B. Both A and R are true but R is not the correct explanation of A.",
  "C. A is true but R is false.",
  "D. A is False but R is true."
];

const class12BiologyScope = [
  "Environmental Issues (air and water pollution, solid wastes, agro-chemicals, radioactive wastes, greenhouse effect and global warming, ozone depletion, deforestation) is assessed only formatively in 2026-27: set NO question from it.",
  "Organisms and Populations: population interactions (mutualism, competition, predation, parasitism) and population attributes (growth, birth rate, death rate, age distribution) only; no questions on the organism and its environment or on adaptations.",
  "Pregnancy, placenta formation, parturition and lactation are elementary ideas only; IVF, ZIFT and GIFT are for general awareness.",
  "Ecosystem: patterns, components, productivity, decomposition, energy flow and ecological pyramids; no ecological succession or nutrient cycling.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const class11BiologyScope = [
  "Digestion and Absorption is assessed only formatively in 2026-27: set NO question from it.",
  "Biomolecules: the nature of the bond linking monomers in a polymer, the dynamic state of body constituents, the concept of metabolism, the metabolic basis of living and the living state are excluded.",
  "Photosynthetic pigments and the mechanism of hormone action are elementary ideas only; respiratory organs in animals are recall only.",
  "Animal Kingdom: non-chordates up to phylum level and chordates up to class level, with salient features and a few examples.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const biologyFormats = {
  subject: "Biology",
  misconceptions: "autogamy vs geitonogamy, the timelines of spermatogenesis and oogenesis, dominant, recessive and sex-linked inheritance in pedigrees, transcription vs translation, the types of natural selection, what a high BOD means",
  constructed: [
    "Very Short Answer (VSA - 2 Marks): a reason, a comparison, a short explanation or reading a small hypothetical data table, worth exactly 2 marking-scheme value points.",
    "Short Answer (SA - 3 Marks): a clinical, genetic or research situation to analyse, a genetic cross with a Punnett square, or an explanation in parts A, B, C, worth 3 value points.",
    "Long Answer (LA - 5 Marks): situation-based, with sub-parts such as 4 + 1, 2 + 2 + 1 or I to IV, and internal choice (A) OR (B)."
  ],
  designNote: "about half the 2-, 3- and 5-mark questions ask the student to explain, interpret data, analyse a situation or evaluate a claim; the rest test knowledge and understanding, often set in a real-life situation.",
  sourcing: "Source questions from the NCERT textbook and NCERT Exemplar, CBSE competency-based question banks and past board papers, as the sample paper does; cases may use a patient's history, a couple at a clinic, a farmer's field, a laboratory experiment or a hypothetical data table.",
  arPlacement: `once above Q13, after the line "Question No. 13 to 16 consist of two statements – Assertion (A) and Reason (R). Answer these questions selecting the appropriate option given below:"`,
  arAnswered: "answered from the four options printed once above them",
  typology: {
    vsa: "A reason, a comparison, a short explanation (\"Comment\", \"Suggest one strategy and justify\"), or reading a small hypothetical data table (\"Interpret the relationship\", \"Calculate the NPP\"). Exactly **2 marking-scheme value points**.",
    sa: "A clinical, genetic or research situation to analyse (for example a couple at a fertility clinic, a dihybrid cross with a Punnett square and ratios, a host-parasite interaction), often in parts A, B, C of 1 mark each. **3 value points**.",
    cbqHeading: "Case-Based Questions",
    cbq: [
      "A real-life case of about 100-150 words (the sample paper uses a girl's irregular menstrual cycles explained by the hypothalamic-pituitary-ovarian axis, and a farmer controlling cabbage loopers with Nucleopolyhedrovirus), followed by **A (1 mark), B (2 marks) and then C OR D (1 mark)**, with the marks shown against each part.",
      "The only internal choice is between C and D, printed as \"Attempt either subpart C or D.\""
    ]
  },
  rigor: "Formulate questions whose answers are distinct value points: correct biological terms spelt as in NCERT, labelled diagrams with pointer lines, genetic crosses showing parental genotypes, gametes, the Punnett square and the phenotypic and genotypic ratios, and processes written as steps in the right order.",
  instructionsNote: "",
  requirements: [
    `**Section instructions, as in the sample paper:** print "Q. Nos. 1 to 12 are multiple choice questions. Only one of the choices is correct. Select and write the correct choice as well as the answer to these questions." under the Section A heading, and the Assertion-Reason line with its four options once above Q13.`,
    `**Figures, as in the sample paper:** about 4 to 6 questions give the student a figure (a labelled diagram such as an embryo sac or a transcription unit, a pedigree chart, an illustration of a classic experiment). Directly below each, after a dashed line, add a words-only alternative headed "For Visually impaired students" on the same concept with the same marks.`,
    `**Hypothetical data:** 2 to 3 questions, mostly in Section B, give a small data table to interpret, calculate from or evaluate, introduced with a line such as "The following is a hypothetical dataset".`,
    `**Internal choice:** "Attempt either option A or B." in three Section B questions and all three long answers; "Attempt either subpart C or D." in each case-based question; NO choice in Section C.`,
    "**Student drawing:** at least one question asks the student to draw (a Punnett square, a labelled diagram or a tRNA adaptor molecule). Never print the answer figure."
  ],
  figureQuota: "Set **4 to 6 figure-based questions** (labelled diagrams, pedigree charts, experiment illustrations) and **2 to 3 small hypothetical data tables**, each figure with a words-only alternative for visually impaired students",
  diagramRules: `
    *   **Biology Diagrams:** MUST generate clean inline vector SVG for:
        - Labelled schematic diagrams with pointer lines and letter callouts [A], [B], [C], [D] for identification (for example an embryo sac after fertilisation, a transcription unit, a flower in section, reproductive organs, a nephron, a neuron).
        - Pedigree charts with standard symbols (squares, circles, shaded affected, half-shaded carriers), population growth curves and hormone-level graphs with labelled axes.
        - Illustrations of classic experiments in steps (Griffith, Avery-MacLeod-McCarty, Meselson-Stahl, Hershey-Chase); data tables as HTML tables.`
};

const biologyMandates = (roman, focus) => ({
  mandatesTitle: `CBSE BIOLOGY (${roman}) MANDATES & PEDAGOGICAL RIGOR`,
  mandates: [
    "**Situation-based framing:** most questions put the concept in a real situation (a patient, a couple at a fertility clinic, a farmer, a researcher's experiment), as the sample paper does; named people are fine.",
    "**Genetics and data:** crosses give the parental genotypes, gametes, a Punnett square and the ratios; pedigrees use standard symbols; hypothetical data tables have units and are small enough to read at a glance.",
    focus,
    "**Diagrams:** where the student draws, ask for a neat, properly labelled diagram and credit the labels, as CBSE's general instructions say."
  ]
});

// Class 11 and 12 Mathematics (041) and Applied Mathematics (241), from the
// CBSE 2026-27 curriculum documents (Maths_SecP2, Applied_Mathematics_SecP2)
// and the Class XII 2026-27 sample papers, which both say the design is
// unchanged. Both papers use the same 80-mark, 38-question layout; they differ
// in Section C (Mathematics gives a choice in three questions, Applied
// Mathematics in two), in figures (only the Mathematics paper carries
// figure-based questions with alternatives for visually impaired candidates)
// and in content. CBSE publishes a typology split for Mathematics (44 / 20 /
// 16) but none for Applied Mathematics.
const seniorMathsQuestions = sectionCChoices => [
  { section: "Section A", q: "Q1-Q18", type: "Multiple Choice Questions", count: 18, each: 1, marks: 18,
    detail: "Four options (A)-(D)" },
  { section: "Section A", q: "Q19-Q20", type: "Assertion-Reason", count: 2, each: 1, marks: 2,
    detail: "The Directions line and the four options printed once above Q19" },
  { section: "Section B", q: "Q21-Q25", type: "Very Short Answer", count: 5, each: 2, marks: 10,
    detail: "Internal choice in 2 questions" },
  { section: "Section C", q: "Q26-Q31", type: "Short Answer", count: 6, each: 3, marks: 18,
    detail: `Internal choice in ${sectionCChoices} questions` },
  { section: "Section D", q: "Q32-Q35", type: "Long Answer", count: 4, each: 5, marks: 20,
    detail: "Internal choice in 2 questions; one complete multi-step problem each" },
  { section: "Section E", q: "Q36-Q38", type: "Case study based", count: 3, each: 4, marks: 12,
    detail: "Q36 and Q37: sub-parts (i) 1, (ii) 1 and (iii) 2 marks, with (iii) (a) OR (b); Q38: two sub-parts of 2 marks each, no choice" }
];

const seniorMathsInstructions = sectionCChoices => [
  "This question paper contains 38 questions. All questions are compulsory.",
  "This question paper is divided into five Sections - A, B, C, D and E.",
  "In Section A, Question no. 1 to 18 are multiple choice questions (MCQs) and Questions no. 19 and 20 are Assertion-Reason based questions of 1 mark each.",
  "In Section B, Question no. 21 to 25 are Very Short Answer (VSA)-type questions, carrying 2 marks each.",
  "In Section C, Question no. 26 to 31 are Short Answer (SA)-type questions, carrying 3 marks each.",
  "In Section D, Question no. 32 to 35 are Long Answer (LA)-type questions, carrying 5 marks each.",
  "In Section E, Question no. 36 to 38 are case study-based questions carrying 4 marks each.",
  `There is no overall choice. However, an internal choice has been provided in 2 questions in Section B, ${sectionCChoices} questions in Section C, 2 questions in Section D and one sub-part each in 2 questions of Section E.`,
  "Draw neat and clean figures wherever required. Take π = 22/7 wherever required, if not stated.",
  "Use of calculators is not allowed."
];

const seniorMathsPattern = sectionCChoices => `This question paper contains 38 questions. All questions are compulsory.
The paper is divided into five Sections - A, B, C, D and E.
  Section A: Questions 1 to 18 are MCQs and Questions 19 and 20 are Assertion-Reason based, 1 mark each (20 x 1 = 20).
  Section B: Questions 21 to 25 are Very Short Answer (VSA) questions of 2 marks each (5 x 2 = 10).
  Section C: Questions 26 to 31 are Short Answer (SA) questions of 3 marks each (6 x 3 = 18).
  Section D: Questions 32 to 35 are Long Answer (LA) questions of 5 marks each (4 x 5 = 20).
  Section E: Questions 36 to 38 are case study based questions of 4 marks each (3 x 4 = 12). The first two have
             sub-parts (i), (ii), (iii) of 1, 1 and 2 marks; the third has two sub-parts of 2 marks each.
There is no overall choice. Internal choice is provided in 2 questions of Section B, ${sectionCChoices} of Section C,
2 of Section D and one sub-part each in 2 questions of Section E.
Draw neat and clean figures wherever required. Take pi = 22/7 wherever required, if not stated.
Use of calculators is not allowed.`;

const seniorMathsArOptions = [
  "(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).",
  "(B) Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).",
  "(C) Assertion (A) is true but Reason (R) is false.",
  "(D) Assertion (A) is false but Reason (R) is true."
];

// CBSE 2026-27 question paper design for Mathematics (041), Class XI and XII.
const seniorMathsDesign = {
  understanding: 44, applying: 20, analysing: 16, percent: [55, 25, 20],
  labels: physicsDesign.labels
};

const seniorMathsFormats = {
  shortCaseDetail: "A real-life context with sub-parts (i) 1 mark, (ii) 1 mark and (iii) 2 marks, where (iii) has an internal choice (a) OR (b)",
  foundational: "formulae, standard results and mathematical terms",
  constructed: [
    "Very Short Answer (VSA - 2 Marks): short working or reasoning worth exactly 2 marking-scheme value points. No word limit.",
    "Short Answer (SA - 3 Marks): step-wise working worth 3 value points. No word limit.",
    "Long Answer (LA - 5 Marks): one complete multi-step problem; sub-parts are optional."
  ],
  designNote: "the paper needs genuine problem solving beyond direct textbook recall.",
  arPlacement: `once above Q19, after the Directions line "Question numbers 19 and 20 are Assertion and Reason based questions carrying 1 mark each. Two statements are given, one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer from the options (A), (B), (C) and (D) as given below:"`,
  arAnswered: "answered from the four options printed once above them",
  typology: {
    vsa: "Short working, a short proof or a reasoning step earning **exactly 2 marking-scheme value points**. Mathematics answers have NO word limit.",
    sa: "Step-wise working or a short proof worth **3 value points**. No word limit.",
    la: [
      "One complete multi-step problem (sub-parts are allowed but NOT required; CBSE's own papers mostly set single 5-mark problems), worth 5 step-marked value points.",
      "**Internal choice:** exactly 2 of the 4 Long Answer questions have an internal choice (A) OR (B), from the same chapter and at the same level."
    ],
    cbqHeading: "Case Study Based Questions",
    cbq: [
      "A real-life context of about 80-150 words (the sample papers use laser security beams as lines in space, a river-restoration budget modelled by a quadratic, fruit baskets priced by a system of equations, and water tanks filled by pipes), followed by the sub-parts the blueprint gives.",
      "Q36 and Q37: **(i) 1 mark, (ii) 1 mark and (iii) 2 marks, where (iii) has an internal choice (a) OR (b)**. Q38: **two sub-parts of 2 marks each, with no choice**. Print \"Based on the given information, answer the following questions:\" before the sub-parts."
    ]
  },
  instructionsNote: "",
  figureQuota: null,
  diagramRules: null
};

const seniorMathsMandates = (roman, subject, extra) => ({
  mandatesTitle: `CBSE ${subject.toUpperCase()} (${roman}) MANDATES & PEDAGOGICAL RIGOR`,
  mandates: [
    "**No calculators:** choose numbers that can be worked by hand; take π = 22/7 unless the question says otherwise.",
    "**Step marking:** every constructed answer is marked on the method (the formula or result used), the working and the final answer, so frame questions whose solution has clear steps.",
    extra,
    "**Section headings:** under each Section heading print CBSE's line, for example \"This section comprises of 18 multiple choice questions and two assertion and reason type questions of 1 mark each.\""
  ]
});

const class12MathsScope = [
  "Relations and Functions: types of relations (reflexive, symmetric, transitive, equivalence) and one-one and onto functions ONLY. No composition of functions, invertible functions or binary operations.",
  "Matrices and Determinants: determinants up to 3 x 3; non-commutativity and zero products shown with square matrices of order 2; systems of linear equations with a unique solution, solved using the inverse of a matrix.",
  "Applications of Derivatives: rate of change, increasing and decreasing functions, maxima and minima (first and second derivative tests). No tangents and normals, no approximations, no Rolle's or mean value theorem.",
  "Integrals: substitution, partial fractions, by parts and the standard forms in the curriculum; the Fundamental Theorem of Calculus is used without proof.",
  "Applications of Integrals: area under simple curves - lines, circles, parabolas and ellipses in standard form only. No area between two curves.",
  "Differential Equations: variables separable, homogeneous of first order and first degree, and linear dy/dx + Py = Q or dx/dy + Px = Q. No formation of differential equations.",
  "Three-dimensional Geometry: direction cosines and ratios, equations of a line (vector and Cartesian), angle between two lines, skew lines and shortest distance. No planes.",
  "Linear Programming: graphical method in two variables with up to three non-trivial constraints.",
  "Probability: conditional probability, multiplication theorem, independent events, total probability and Bayes' theorem. No random variables, probability distributions or binomial distribution.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const class11MathsScope = [
  "Topics CBSE assesses only formatively in 2026-27 carry NO question in this paper: practical problems on union and intersection of two sets, composition of functions, general solutions of trigonometric equations, mathematical induction, polar representation of complex numbers and solving quadratic equations in the complex number system, graphical solution of linear inequalities in two variables, general and middle terms of a binomial expansion, the sums of k, k² and k³, the normal form and general equation of a line, the section formula in three dimensions, the chain rule, and random experiments, outcomes and sample spaces.",
  "Limits and Derivatives: derivatives of polynomial and trigonometric functions (sum, difference, product and quotient).",
  "Statistics: measures of dispersion (range, mean deviation, variance and standard deviation) only.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const class12AppliedScope = [
  "Calculus: differential equations are solved by direct integration or variables separable only; applications of integration are consumer and producer surplus, and total cost or revenue from marginal cost or revenue.",
  "Probability Distributions include the binomial, Poisson and normal distributions; Inferential Statistics is limited to population and sample, parameter and statistic, and the one-sample t-test for a small sample.",
  "Time-based Data: time series, its components, secular trend and methods of measuring trend. No index numbers.",
  "Financial Mathematics: perpetuity, sinking funds, valuation of bonds, EMI, CAGR and the linear method of depreciation.",
  "Where a numerical needs a logarithm or a table value (for example t-values or normal-curve areas), print the value in the question, as the sample paper does (\"Use log(1.331) = 0.124\")."
];

const class11AppliedScope = [
  "Class XI Applied Mathematics has seven units: Numbers, Quantification and Numerical Applications; Algebra (sets, relations, mathematical logic, sequences and series); Calculus; Combinatorics and Probability; Descriptive Statistics; Basics of Financial Mathematics; Coordinate Geometry. There is no Mathematical Reasoning unit.",
  "Descriptive Statistics: measures of dispersion, percentiles (ungrouped data), Karl Pearson's and Spearman's rank correlation (ungrouped data) and regression.",
  "Basics of Financial Mathematics: interest rates, annuities (up to 3 periods), income tax, GST and utility bills.",
  "Where a numerical needs a logarithm, print the value in the question, as CBSE's Applied Mathematics papers do."
];

// Class 11 and 12 Accountancy (055), from the CBSE 2026-27 curriculum
// document (Accountancy_SecP2_2026-27) and the Class XII 2026-27 sample paper,
// which says the design is unchanged. The paper runs on the 1 / 3 / 4 / 6 mark
// ladder in accountancyPaper (top of this file) and is split into Part A and
// Part B by syllabus, not into lettered sections; main.js adds its own
// Accountancy block (numerical weightage, formats, which chapter sits in
// which part) on top of what this entry gives. Class 11 mirrors the Class 12
// layout against its own syllabus (school policy).
const accPartA12 = "Part A: Accounting for Partnership Firms & Companies";
const accPartB12 = "Part B: Analysis of Financial Statements (OR Computerised Accounting)";
const accPartA11 = "Part A: Financial Accounting - I";
const accPartB11 = "Part B: Financial Accounting - II";

const accountancyGeneralInstructions = [
  "This question paper contains 34 questions. All questions are compulsory.",
  "This question paper is divided into two parts, Part A and B.",
  "Part - A is compulsory for all candidates.",
  "Part - B has two options i.e. (i) Analysis of Financial Statements and (ii) Computerised Accounting. Students must attempt only one of the given options.",
  "Questions 1 to 16 and 27 to 30 carry 1 mark each.",
  "Questions 17 to 20, 31 and 32 carry 3 marks each.",
  "Questions 21, 22 and 33 carry 4 marks each.",
  "Questions 23 to 26 and 34 carry 6 marks each.",
  "There is no overall choice. However, an internal choice has been provided in 2 questions of three marks, 2 questions of four marks and 2 questions of six marks."
];

const accountancyFormats = {
  misconceptions: "gaining vs sacrificing ratio, premium for goodwill shared in the sacrificing ratio, interest on partner's loan as a charge vs an appropriation, securities premium not received on forfeiture, current vs quick ratio, operating vs investing vs financing activities",
  foundational: "accounting terms, concepts, formats and the provisions of the Partnership Act and Schedule III",
  constructed: [
    "Short Answer (3 Marks): journal entries, a short ledger or appropriation working, or a short computation (goodwill, ratios, share of profit), worth 3 value points. No word limit on numericals.",
    "Numerical (4 Marks): a complete short numerical problem with working, not case-based sub-parts.",
    "Long numerical (6 Marks): a full problem - accounts, statements or entries - built on complete, consistent data."
  ],
  designNote: "most 3-, 4- and 6-mark questions are numericals that apply the rules to new data, not theory.",
  sourcing: "Source questions from the NCERT Accountancy textbooks, CBSE's sample and practice papers and past board papers; figures in ₹ with realistic Indian firm and company names.",
  arPlacement: "under each Assertion-Reason question, lettered exactly like this (C and D in this order, as the sample paper prints them)",
  arAnswered: "answered from the four options printed below it",
  typology: {
    sa: "Journal entries, a short account or appropriation working, or a short computation (goodwill, sacrificing or gaining ratio, a ratio, a share of profit), worth **3 value points**. Numerical answers carry no word limit; show the working.",
    laHeading: "4-Mark and 6-Mark Numerical Questions",
    la: [
      "Every 4-mark and 6-mark question is a numerical problem with complete, internally consistent data, answered in the proper ruled format (journal with narration, ledger / capital / revaluation / realisation accounts, balance sheet extract, statement or cash flow statement).",
      "Internal choice sits ONLY where the blueprint rows say: two 3-mark, two 4-mark and two 6-mark questions carry (A) OR (B). No 1-mark question has a choice."
    ]
  },
  rigor: "Formulate questions whose answers are marked on correct entries and narrations, correct account formats and totals that agree, working notes for every computation, and amounts in ₹ with Indian digit grouping (₹ 1,50,000).",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q34 continuously across Part A and Part B, in the order of the rows above (a row \"Q1-Q16\" is sixteen separate questions); do NOT restart the numbering in Part B. An internal choice sits under one question number as (A) OR (B), for example 17 A OR 17 B, exactly as the sample paper prints it.",
  design: { understanding: 32, applying: 24, analysing: 24, percent: [40, 30, 30], labels: physicsDesign.labels }
};

const class12AccountancyScope = [
  "Partnership: interest on a partner's loan is a charge against profits; goodwill is valued by average profit, super profit and capitalisation only; past adjustments and guarantee of profits are included.",
  "Dissolution: realisation account, capital accounts and cash / bank account ONLY - no piecemeal distribution, sale to a company or insolvency of a partner. A tangible asset with no realised value given is realised at book value; an intangible asset with none given realises nil.",
  "Share capital: calls in arrears and in advance WITHOUT interest; issue for consideration other than cash; forfeiture and reissue; private placement, ESOP and sweat equity as concepts only.",
  "Debentures: issue at par, premium and discount, for consideration other than cash, with terms of redemption, and as collateral security; interest on debentures without TDS; discount or loss on issue written off in the year of allotment, first from Securities Premium then from the Statement of Profit and Loss. No redemption of debentures.",
  "Financial statements of a company follow Schedule III; exceptional items, extraordinary items and discontinued operations are excluded. Net profit ratio is worked on profit before and after tax.",
  "Cash Flow Statement (AS-3, indirect method): adjustments for depreciation and amortisation, profit or loss on sale of assets including investments, dividend (final and interim) and tax; bank overdraft and cash credit are short-term borrowings; the previous year's proposed dividend is given effect as per AS-4.",
  "Part B is either Analysis of Financial Statements or Computerised Accounting; the school sets Analysis of Financial Statements unless told otherwise."
];

const class11AccountancyScope = [
  "Depreciation by the straight line and written down value methods only, with no change of method.",
  "GST: characteristics and advantages, and simple GST calculation in journal and subsidiary-book entries (including trade discount, freight and cartage).",
  "Rectification of errors includes errors that do and do not affect the trial balance, and the suspense account.",
  "Financial statements of a sole proprietorship with the prescribed adjustments."
];

export const seniorPapers = {
  "Class 12 || Physics": {
    code: "042",
    paperLabel: "Physics (042)",
    fullMarks: 70,
    design: physicsDesign,
    questions: physicsPaperQuestions,
    generalInstructions: physicsGeneralInstructions,
    arOptions: physicsArOptions,
    scope: class12PhysicsScope,
    ...physicsFormats,
    ...physicsMandates("XII", "a superconducting ball near a magnet, a bar magnet falling through a ring, why diamonds sparkle", ""),
    units: [
      { name: "Electrostatics + Current Electricity (Units I-II)", marks: 16, chapters: ["Electric Charges and Fields", "Electrostatic Potential", "Current Electricity"] },
      { name: "Magnetic Effects of Current and Magnetism + Electromagnetic Induction and Alternating Currents (Units III-IV)", marks: 17, chapters: ["Moving Charges", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current"] },
      { name: "Electromagnetic Waves + Optics (Units V-VI)", marks: 18, chapters: ["Electromagnetic Waves", "Ray Optics", "Wave Optics"] },
      { name: "Dual Nature of Radiation and Matter + Atoms and Nuclei (Units VII-VIII)", marks: 12, chapters: ["Dual Nature", "Atoms", "Nuclei"] },
      { name: "Electronic Devices (Unit IX)", marks: 7, chapters: ["Semiconductor"] }
    ]
  },
  "Class 11 || Physics": {
    code: "042",
    paperLabel: "Physics (042), Class XI",
    fullMarks: 70,
    design: physicsDesign,
    questions: physicsPaperQuestions,
    generalInstructions: physicsGeneralInstructions,
    arOptions: physicsArOptions,
    scope: class11PhysicsScope,
    ...physicsFormats,
    ...physicsMandates("XI", "why a cyclist leans on a turn, why a raindrop reaches a terminal velocity, why a metal feels colder than wood", "Class XII "),
    units: [
      { name: "Physical World and Measurement + Kinematics + Laws of Motion (Units I-III)", marks: 23, chapters: ["Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion"] },
      { name: "Work, Energy and Power + Motion of System of Particles and Rigid Body + Gravitation (Units IV-VI)", marks: 17, chapters: ["Work, Energy and Power", "System of Particles", "Gravitation"] },
      { name: "Properties of Bulk Matter + Thermodynamics + Kinetic Theory (Units VII-IX)", marks: 20, chapters: ["Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties", "Thermodynamics", "Kinetic Theory"] },
      { name: "Oscillations and Waves (Unit X)", marks: 10, chapters: ["Oscillations", "Waves"] }
    ]
  },
  "Class 12 || Chemistry": {
    code: "043",
    paperLabel: "Chemistry (043)",
    fullMarks: 70,
    design: chemistryDesign,
    questions: chemistryPaperQuestions,
    generalInstructions: chemistryGeneralInstructions,
    arOptions: chemistryArOptions,
    scope: class12ChemistryScope,
    ...chemistryFormats,
    ...chemistryMandates("XII", "for example Aldol, Cannizzaro, Clemmensen, Wolff-Kishner, Etard, Rosenmund, Hell-Volhard-Zelinsky, Sandmeyer, Gabriel phthalimide, Hoffmann bromamide, Reimer-Tiemann, Kolbe"),
    units: [
      { name: "Solutions", marks: 7, chapters: ["Solutions"] },
      { name: "Electrochemistry", marks: 9, chapters: ["Electrochemistry"] },
      { name: "Chemical Kinetics", marks: 7, chapters: ["Chemical Kinetics"] },
      { name: "d- and f-Block Elements", marks: 7, chapters: ["d- and f-", "d and f Block"] },
      { name: "Coordination Compounds", marks: 7, chapters: ["Coordination Compounds"] },
      { name: "Haloalkanes and Haloarenes", marks: 6, chapters: ["Haloalkanes"] },
      { name: "Alcohols, Phenols and Ethers", marks: 6, chapters: ["Alcohols, Phenols"] },
      { name: "Aldehydes, Ketones and Carboxylic Acids", marks: 8, chapters: ["Aldehydes"] },
      { name: "Amines", marks: 6, chapters: ["Amines"] },
      { name: "Biomolecules", marks: 7, chapters: ["Biomolecules"] }
    ]
  },
  "Class 11 || Chemistry": {
    code: "043",
    paperLabel: "Chemistry (043), Class XI",
    fullMarks: 70,
    design: chemistryDesign,
    questions: chemistryPaperQuestions,
    generalInstructions: chemistryGeneralInstructions,
    arOptions: chemistryArOptions,
    scope: class11ChemistryScope,
    ...chemistryFormats,
    ...chemistryMandates("XI", "for example Wurtz reaction, Kolbe electrolysis, Markovnikov and anti-Markovnikov (Kharasch) addition, ozonolysis, Friedel-Crafts alkylation and acylation"),
    units: [
      { name: "Some Basic Concepts of Chemistry", marks: 7, chapters: ["Some Basic Concepts"] },
      { name: "Structure of Atom", marks: 9, chapters: ["Structure of Atom"] },
      { name: "Classification of Elements and Periodicity in Properties", marks: 6, chapters: ["Classification of Elements"] },
      { name: "Chemical Bonding and Molecular Structure", marks: 7, chapters: ["Chemical Bonding"] },
      { name: "Chemical Thermodynamics", marks: 9, chapters: ["Thermodynamics"] },
      { name: "Equilibrium", marks: 7, chapters: ["Equilibrium"] },
      { name: "Redox Reactions", marks: 4, chapters: ["Redox"] },
      { name: "Organic Chemistry: Some Basic Principles and Techniques", marks: 11, chapters: ["Organic Chemistry"] },
      { name: "Hydrocarbons", marks: 10, chapters: ["Hydrocarbons"] }
    ]
  },
  "Class 12 || Biology": {
    code: "044",
    paperLabel: "Biology (044)",
    fullMarks: 70,
    design: biologyDesign,
    questions: biologyPaperQuestions,
    generalInstructions: biologyGeneralInstructions,
    arOptions: biologyArOptions,
    scope: class12BiologyScope,
    ...biologyFormats,
    ...biologyMandates("XII", "**Molecular biology and biotechnology:** name the enzyme, vector or technique the answer needs (restriction enzymes, Ti plasmid, retroviruses, gel electrophoresis, DNA probes, PCR), and test the sequence of a process (replication, transcription, translation, rDNA steps)."),
    units: [
      { name: "Reproduction (Unit VI)", marks: 16, chapters: ["Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health"] },
      { name: "Genetics and Evolution (Unit VII)", marks: 20, chapters: ["Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution"] },
      { name: "Biology and Human Welfare (Unit VIII)", marks: 12, chapters: ["Human Health", "Microbes in Human Welfare"] },
      { name: "Biotechnology and its Applications (Unit IX)", marks: 12, chapters: ["Biotechnology"] },
      { name: "Ecology and Environment (Unit X)", marks: 10, chapters: ["Organisms and Populations", "Ecosystem", "Biodiversity"] }
    ]
  },
  "Class 11 || Biology": {
    code: "044",
    paperLabel: "Biology (044), Class XI",
    fullMarks: 70,
    design: biologyDesign,
    questions: biologyPaperQuestions,
    generalInstructions: biologyGeneralInstructions,
    arOptions: biologyArOptions,
    scope: class11BiologyScope,
    ...biologyFormats,
    ...biologyMandates("XI", "**Physiology and classification:** ask for mechanisms and their regulation (hormones, pressure gradients, partial pressures, the cardiac cycle, nerve impulse conduction), and for distinguishing features with examples in classification, not bare lists."),
    units: [
      { name: "Diversity of Living Organisms (Unit I)", marks: 15, chapters: ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom"] },
      { name: "Structural Organisation in Plants and Animals (Unit II)", marks: 10, chapters: ["Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals"] },
      { name: "Cell: Structure and Function (Unit III)", marks: 15, chapters: ["Cell: The Unit of Life", "Biomolecules", "Cell Cycle"] },
      { name: "Plant Physiology (Unit IV)", marks: 12, chapters: ["Photosynthesis", "Respiration in Plants", "Plant Growth"] },
      { name: "Human Physiology (Unit V)", marks: 18, chapters: ["Breathing", "Body Fluids", "Excretory Products", "Locomotion", "Neural Control", "Chemical Coordination"] }
    ]
  },
  "Class 12 || Mathematics": {
    code: "041",
    paperLabel: "Mathematics (041)",
    fullMarks: 80,
    design: seniorMathsDesign,
    questions: seniorMathsQuestions(3).map(q => q.q === "Q1-Q18" ? { ...q, detail: "Four options (A)-(D); one or two built on a graph or figure, each with an alternative \"For Visually Impaired\" in words only" } : q),
    generalInstructions: seniorMathsInstructions(3),
    arOptions: seniorMathsArOptions,
    scope: class12MathsScope,
    ...seniorMathsFormats,
    misconceptions: "principal value branches of inverse trigonometric functions, domain and range, sign errors in derivatives, forgetting the constant or the limits in integrals, confusing independent and mutually exclusive events, direction ratios vs direction cosines",
    sourcing: "Source questions from the NCERT textbook and NCERT Exemplar, CBSE competency-based question banks and past board papers, as the sample paper does; case studies may use real settings such as security beams, budgets, prices or tanks.",
    rigor: "Formulate questions requiring the formula or result to be stated, complete step-wise working, correct notation (vectors, intervals, limits of integration, the constant of integration) and a fully simplified final answer with units where there are any. Numbers must work out cleanly by hand, because calculators are not allowed.",
    requirements: [
      "**Figures, as in the sample paper:** a few questions give a graph or figure (for example the graph of an inverse trigonometric function in an MCQ, or a region whose area is found). Directly below each, add an alternative headed \"For Visually Impaired:\" that tests the same concept in words only, with the same marks. LPP and area questions may ask the student to draw the graph: never print the answer figure.",
      "**Internal choice:** 2 questions in Section B, 3 in Section C, 2 in Section D, and part (iii) of Q36 and Q37, printed as (A) OR (B) or (a) OR (b).",
      "**Assertion-Reason:** print the Directions line and the four options once, above Q19, exactly as given in the typology rules above (rule 8).",
      "**Case studies (Section E):** Q36 and Q37 are (i) 1 + (ii) 1 + (iii) 2 with a choice in (iii); Q38 is two parts of 2 marks each with no choice."
    ],
    figureQuota: "Set **3 to 5 figure-based questions** (graphs of functions, regions for area, feasible regions, 3D line sketches), each with a words-only alternative for visually impaired candidates",
    diagramRules: `
    *   **Mathematics Figures:** MUST generate clean inline vector SVG for:
        - Graphs of functions (inverse trigonometric functions, curves and lines) on labelled axes with scales, and shaded regions whose area is found.
        - Feasible regions of linear programming problems with the boundary lines labelled and the corner points marked.
        - Sketches of lines in space or triangles for vector questions, with labelled points; data as HTML tables.`,
    ...seniorMathsMandates("XII", "Mathematics", "**Proofs and reasoning:** include \"show that\" and \"prove\" items the curriculum keeps (for example one-one and onto, equivalence relations, continuity and differentiability at a point), and a case study that models a real situation."),
    units: [
      { name: "Relations and Functions (Unit I)", marks: 8, chapters: ["Relations and Functions", "Inverse Trigonometric"] },
      { name: "Algebra (Unit II)", marks: 10, chapters: ["Matrices", "Determinants"] },
      { name: "Calculus (Unit III)", marks: 35, chapters: ["Continuity", "Applications of Derivatives", "Integrals", "Differential Equations"] },
      { name: "Vectors and Three-Dimensional Geometry (Unit IV)", marks: 14, chapters: ["Vector Algebra", "Three Dimensional Geometry"] },
      { name: "Linear Programming (Unit V)", marks: 5, chapters: ["Linear Programming"] },
      { name: "Probability (Unit VI)", marks: 8, chapters: ["Probability"] }
    ]
  },
  "Class 11 || Mathematics": {
    code: "041",
    paperLabel: "Mathematics (041), Class XI",
    fullMarks: 80,
    design: seniorMathsDesign,
    questions: seniorMathsQuestions(3).map(q => q.q === "Q1-Q18" ? { ...q, detail: "Four options (A)-(D); one or two built on a graph or figure, each with an alternative \"For Visually Impaired\" in words only" } : q),
    generalInstructions: seniorMathsInstructions(3),
    arOptions: seniorMathsArOptions,
    scope: class11MathsScope,
    ...seniorMathsFormats,
    misconceptions: "radian and degree conversion, signs of trigonometric functions in each quadrant, permutation vs combination, the common ratio in a GP, slope of perpendicular lines, mutually exclusive vs exhaustive events",
    sourcing: "Source questions from the NCERT textbook and NCERT Exemplar, CBSE competency-based question banks and past papers, set on the Class XII sample paper layout; case studies may use real settings such as seating, budgets, surveys or games.",
    rigor: "Formulate questions requiring the formula or result to be stated, complete step-wise working, correct notation (set-builder form, intervals, nPr and nCr, limits) and a fully simplified final answer. Numbers must work out cleanly by hand, because calculators are not allowed.",
    requirements: [
      "**Figures:** a few questions give a graph or figure (for example a Venn diagram, the graph of a function, a line or a conic). Directly below each, add an alternative headed \"For Visually Impaired:\" that tests the same concept in words only, with the same marks.",
      "**Internal choice:** 2 questions in Section B, 3 in Section C, 2 in Section D, and part (iii) of Q36 and Q37, printed as (A) OR (B) or (a) OR (b).",
      "**Assertion-Reason:** print the Directions line and the four options once, above Q19, exactly as given in the typology rules above (rule 8).",
      "**Case studies (Section E):** Q36 and Q37 are (i) 1 + (ii) 1 + (iii) 2 with a choice in (iii); Q38 is two parts of 2 marks each with no choice."
    ],
    figureQuota: "Set **3 to 5 figure-based questions** (Venn diagrams, graphs of functions, lines and conics on axes), each with a words-only alternative for visually impaired candidates",
    diagramRules: `
    *   **Mathematics Figures:** MUST generate clean inline vector SVG for:
        - Venn diagrams with labelled sets and regions; graphs of real functions (modulus, signum, greatest integer, trigonometric) on labelled axes.
        - Lines, circles, parabolas, ellipses and hyperbolas on coordinate axes with labelled points; data as HTML tables.`,
    ...seniorMathsMandates("XI", "Mathematics", "**Proofs and reasoning:** include \"show that\" and \"prove\" items the curriculum keeps (for example trigonometric identities, the binomial theorem, the relation between AM and GM), and a case study that models a real situation."),
    units: [
      { name: "Sets and Functions (Unit I)", marks: 23, chapters: ["Sets", "Relations and Functions", "Trigonometric Functions"] },
      { name: "Algebra (Unit II)", marks: 25, chapters: ["Complex Numbers", "Linear Inequalities", "Permutations", "Binomial", "Sequences"] },
      { name: "Coordinate Geometry (Unit III)", marks: 12, chapters: ["Straight Lines", "Conic Sections", "Three Dimensional"] },
      { name: "Calculus (Unit IV)", marks: 8, chapters: ["Limits and Derivatives"] },
      { name: "Statistics and Probability (Unit V)", marks: 12, chapters: ["Statistics", "Probability"] }
    ]
  },
  "Class 12 || Applied Mathematics": {
    code: "241",
    paperLabel: "Applied Mathematics (241)",
    fullMarks: 80,
    design: null,
    designText: "CBSE publishes no typology split for Applied Mathematics. Follow the sample paper's balance: most questions apply mathematics to a business, finance, economics or everyday situation, with MCQs on concepts and direct computations and longer questions that formulate and solve a real problem.",
    questions: seniorMathsQuestions(2),
    generalInstructions: seniorMathsInstructions(2),
    arOptions: seniorMathsArOptions,
    scope: class12AppliedScope,
    ...seniorMathsFormats,
    misconceptions: "modular arithmetic remainders, alligation ratios, marginal cost vs total cost, parameter vs statistic, one-tailed vs two-tailed tests, perpetuity vs annuity, feasible vs optimal solutions",
    sourcing: "Source questions from the NCERT Applied Mathematics textbook, CBSE's Applied Mathematics sample and practice papers and past board papers; set them in business, finance, economics and everyday contexts (pipes and cisterns, races, EMIs, bonds, sales trends, production planning).",
    rigor: "Formulate questions requiring the formula or method to be stated, complete step-wise working, correct units (₹, %, hours, km) and a clearly stated conclusion (for example \"reject the null hypothesis\", \"the EMI is ₹ ...\"). Numbers must work out by hand, because calculators are not allowed; print any logarithm or table value needed.",
    requirements: [
      "**Internal choice:** 2 questions in Section B, 2 in Section C, 2 in Section D, and part (iii) of Q36 and Q37, printed as (A) OR (B) or (a) OR (b).",
      "**Assertion-Reason:** print the Directions line and the four options once, above Q19, exactly as given in the typology rules above (rule 8).",
      "**Case studies (Section E):** Q36 and Q37 are (i) 1 + (ii) 1 + (iii) 2 with a choice in (iii); Q38 is two parts of 2 marks each with no choice.",
      "**Values for hand working:** print any logarithm, t-table or normal-table value a question needs, in square brackets after the question, as the sample paper does."
    ],
    figureQuota: "Use **1 to 3 figures or tables** where a question needs them (a feasible region, a time-series graph, a data table)",
    diagramRules: `
    *   **Applied Mathematics Figures:** MUST generate clean inline vector SVG or HTML tables for:
        - Feasible regions of linear programming problems, demand and supply or cost curves, consumer and producer surplus regions, time-series plots with a trend line.
        - Data tables (sales over years, samples for a t-test, probability distributions) as HTML tables.`,
    ...seniorMathsMandates("XII", "Applied Mathematics", "**Applied contexts:** most questions are set in a business, finance, economics or everyday situation and ask the student to formulate the mathematics as well as solve it."),
    units: [
      { name: "Numbers, Quantification and Numerical Applications (Unit I)", marks: 11, chapters: ["Unit 1:"] },
      { name: "Algebra (Unit II)", marks: 10, chapters: ["Unit 2:"] },
      { name: "Calculus (Unit III)", marks: 15, chapters: ["Unit 3:"] },
      { name: "Probability Distributions (Unit IV)", marks: 10, chapters: ["Unit 4:"] },
      { name: "Inferential Statistics (Unit V)", marks: 5, chapters: ["Unit 5:"] },
      { name: "Time-based Data (Unit VI)", marks: 6, chapters: ["Unit 6:"] },
      { name: "Financial Mathematics (Unit VII)", marks: 15, chapters: ["Unit 7:"] },
      { name: "Linear Programming (Unit VIII)", marks: 8, chapters: ["Unit 8:"] }
    ]
  },
  "Class 11 || Applied Mathematics": {
    code: "241",
    paperLabel: "Applied Mathematics (241), Class XI",
    fullMarks: 80,
    design: null,
    designText: "CBSE publishes no typology split for Applied Mathematics. Follow the Class XII sample paper's balance: most questions apply mathematics to a business, finance or everyday situation, with MCQs on concepts and direct computations and longer questions that formulate and solve a real problem.",
    questions: seniorMathsQuestions(2),
    generalInstructions: seniorMathsInstructions(2),
    arOptions: seniorMathsArOptions,
    scope: class11AppliedScope,
    ...seniorMathsFormats,
    misconceptions: "binary conversion, laws of logarithms, the angle between clock hands, odd days, permutation vs combination, mean deviation vs standard deviation, nominal vs effective rate of interest",
    sourcing: "Source questions from the NCERT Applied Mathematics textbook, CBSE's Applied Mathematics sample and practice papers and past papers; set them in business, finance and everyday contexts (clocks and calendars, work and time, seating plans, interest, taxes and utility bills).",
    rigor: "Formulate questions requiring the formula or method to be stated, complete step-wise working, correct units (₹, %, hours, km) and a clearly stated conclusion. Numbers must work out by hand, because calculators are not allowed; print any logarithm value needed.",
    requirements: [
      "**Internal choice:** 2 questions in Section B, 2 in Section C, 2 in Section D, and part (iii) of Q36 and Q37, printed as (A) OR (B) or (a) OR (b).",
      "**Assertion-Reason:** print the Directions line and the four options once, above Q19, exactly as given in the typology rules above (rule 8).",
      "**Case studies (Section E):** Q36 and Q37 are (i) 1 + (ii) 1 + (iii) 2 with a choice in (iii); Q38 is two parts of 2 marks each with no choice.",
      "**Values for hand working:** print any logarithm value a question needs, in square brackets after the question."
    ],
    figureQuota: "Use **1 to 3 figures or tables** where a question needs them (a Venn diagram, a line or circle on axes, a data table)",
    diagramRules: `
    *   **Applied Mathematics Figures:** MUST generate clean inline vector SVG or HTML tables for:
        - Venn diagrams, clock faces, seating plans (linear or circular), lines, circles and parabolas on coordinate axes.
        - Data tables (scores for percentiles, paired data for correlation, bills and tax slabs) as HTML tables.`,
    ...seniorMathsMandates("XI", "Applied Mathematics", "**Applied contexts:** most questions are set in a business, finance or everyday situation and ask the student to formulate the mathematics as well as solve it."),
    units: [
      { name: "Numbers, Quantification and Numerical Applications (Unit I)", marks: 10, chapters: ["Unit 1:"] },
      { name: "Algebra (Unit II)", marks: 18, chapters: ["Unit 2:"] },
      { name: "Calculus (Unit III)", marks: 12, chapters: ["Unit 3:"] },
      { name: "Combinatorics and Probability (Unit IV)", marks: 10, chapters: ["Unit 4:"] },
      { name: "Descriptive Statistics (Unit V)", marks: 10, chapters: ["Unit 5:"] },
      { name: "Basics of Financial Mathematics (Unit VI)", marks: 15, chapters: ["Unit 6:"] },
      { name: "Coordinate Geometry (Unit VII)", marks: 5, chapters: ["Unit 7:"] }
    ]
  },
  "Class 12 || Accountancy": {
    code: "055",
    paperLabel: "Accountancy (055)",
    fullMarks: 80,
    questions: [
      { section: accPartA12, q: "Q1-Q16", type: "Objective (MCQ / Assertion-Reason / fill in the blank)", count: 16, each: 1, marks: 16, detail: "On partnership and company accounts; no internal choice" },
      { section: accPartA12, q: "Q17-Q20", type: "Short answer - practical working", count: 4, each: 3, marks: 12, detail: "Journal entries, appropriation or short computation; internal choice in Q17" },
      { section: accPartA12, q: "Q21-Q22", type: "Numerical", count: 2, each: 4, marks: 8, detail: "Short numerical problems; internal choice in Q22" },
      { section: accPartA12, q: "Q23-Q26", type: "Long numerical", count: 4, each: 6, marks: 24, detail: "Admission, retirement or death, dissolution, shares and debentures; internal choice in Q25 and Q26" },
      { section: accPartB12, q: "Q27-Q30", type: "Objective (MCQ / Assertion-Reason)", count: 4, each: 1, marks: 4, detail: "On financial statements, ratios and cash flow; no internal choice" },
      { section: accPartB12, q: "Q31-Q32", type: "Short answer - practical working", count: 2, each: 3, marks: 6, detail: "Classification under Schedule III, a ratio, or comparative / common-size working; internal choice in Q31" },
      { section: accPartB12, q: "Q33", type: "Numerical", count: 1, each: 4, marks: 4, detail: "Ratios, or a comparative / common-size statement; internal choice" },
      { section: accPartB12, q: "Q34", type: "Long numerical", count: 1, each: 6, marks: 6, detail: "Cash Flow Statement by the indirect method (AS-3); no internal choice" }
    ],
    generalInstructions: accountancyGeneralInstructions,
    arOptions: ["(A) Both (A) and (R) are true and (R) is correct explanation to (A).", "(B) Both (A) and (R) are true but (R) is not correct explanation of (A).", "(C) (A) is false but (R) is correct.", "(D) (A) is correct but (R) is false."],
    scope: class12AccountancyScope,
    ...accountancyFormats,
    requirements: [
      "**Two parts:** Part A (Accounting for Partnership Firms and Companies, 60 marks) and Part B (Analysis of Financial Statements, 20 marks); print under the Part B heading that candidates attempt EITHER Analysis of Financial Statements OR Computerised Accounting.",
      "**Internal choice:** exactly 6 questions, as the sample paper places them - Q17 and Q31 (3 marks), Q22 and Q33 (4 marks), Q25 and Q26 (6 marks) - each printed as A OR B under one number."
    ],
    units: [
      { name: "Accounting for Partnership Firms (Part A)", marks: 36, chapters: ["Partnership - Basic", "Reconstitution", "Admission", "Retirement", "Dissolution"] },
      { name: "Accounting for Companies (Part A)", marks: 24, chapters: ["Share Capital", "Debentures"] },
      { name: "Analysis of Financial Statements (Part B)", marks: 12, chapters: ["Financial Statements of a Company", "Financial Statement Analysis", "Accounting Ratios"] },
      { name: "Cash Flow Statement (Part B)", marks: 8, chapters: ["Cash Flow"] }
    ]
  },
  "Class 11 || Accountancy": {
    code: "055",
    paperLabel: "Accountancy (055), Class XI",
    fullMarks: 80,
    questions: [
      { section: accPartA11, q: "Q1-Q16", type: "Objective (MCQ / Assertion-Reason / fill in the blank)", count: 16, each: 1, marks: 16, detail: "Theoretical framework and accounting process; no internal choice" },
      { section: accPartA11, q: "Q17-Q20", type: "Short answer - practical working", count: 4, each: 3, marks: 12, detail: "Journal entries, ledger or short working; internal choice in Q17" },
      { section: accPartA11, q: "Q21", type: "Numerical", count: 1, each: 4, marks: 4, detail: "Short numerical problem; internal choice" },
      { section: accPartA11, q: "Q22-Q25", type: "Long numerical", count: 4, each: 6, marks: 24, detail: "Bank reconciliation, depreciation, subsidiary books, trial balance and rectification; internal choice in Q24 and Q25" },
      { section: accPartB11, q: "Q26-Q29", type: "Objective (MCQ / Assertion-Reason)", count: 4, each: 1, marks: 4, detail: "Financial statements of a sole proprietorship; no internal choice" },
      { section: accPartB11, q: "Q30-Q31", type: "Short answer - practical working", count: 2, each: 3, marks: 6, detail: "Capital vs revenue items, adjustments; internal choice in Q30" },
      { section: accPartB11, q: "Q32-Q33", type: "Numerical", count: 2, each: 4, marks: 8, detail: "Trading or profit and loss working; internal choice in Q32" },
      { section: accPartB11, q: "Q34", type: "Long numerical", count: 1, each: 6, marks: 6, detail: "Financial statements of a sole proprietorship with adjustments; no internal choice" }
    ],
    generalInstructions: [
      "This question paper contains 34 questions. All questions are compulsory.",
      "This question paper is divided into two parts, Part A (Financial Accounting - I, 56 marks) and Part B (Financial Accounting - II, 24 marks).",
      "Questions 1 to 16 and 26 to 29 carry 1 mark each.",
      "Questions 17 to 20, 30 and 31 carry 3 marks each.",
      "Questions 21, 32 and 33 carry 4 marks each.",
      "Questions 22 to 25 and 34 carry 6 marks each.",
      "There is no overall choice. However, an internal choice has been provided in 2 questions of three marks, 2 questions of four marks and 2 questions of six marks."
    ],
    arOptions: ["(A) Both (A) and (R) are true and (R) is correct explanation to (A).", "(B) Both (A) and (R) are true but (R) is not correct explanation of (A).", "(C) (A) is false but (R) is correct.", "(D) (A) is correct but (R) is false."],
    scope: class11AccountancyScope,
    ...accountancyFormats,
    numberingNote: "Number the questions Q1 to Q34 continuously across Part A and Part B, in the order of the rows above; do NOT restart the numbering in Part B. An internal choice sits under one question number as (A) OR (B).",
    requirements: [
      "**Two parts:** Part A (Financial Accounting - I, 56 marks) and Part B (Financial Accounting - II, 24 marks).",
      "**Internal choice:** exactly 6 questions - Q17 and Q30 (3 marks), Q21 and Q32 (4 marks), Q24 and Q25 (6 marks) - each printed as A OR B under one number."
    ],
    units: [
      { name: "Theoretical Framework (Part A)", marks: 12, chapters: ["Introduction to Accounting", "Theory Base"] },
      { name: "Accounting Process (Part A)", marks: 44, chapters: ["Recording of Transactions", "Bank Reconciliation", "Trial Balance", "Depreciation"] },
      { name: "Financial Statements of Sole Proprietorship (Part B)", marks: 24, chapters: ["Financial Statements of Sole"] }
    ]
  }
};

export function getSeniorPaper(className, subjectName) {
  if (!className || !subjectName) return null;
  return seniorPapers[`${className} || ${subjectName}`] || null;
}

const acc = accountancyPaper;
const accIC = acc.internalChoice;
const accLadder = acc.markLadder.join(', ').replace(/, (\d+)$/, ' and $1');
const accExcluded = acc.excludedMarks.map(m => `${m}-mark`).join(' or ');

export const sqpBlueprints = {
  "Class 10 || Hindi (R2 - Ganga)": {
    year: "2026-27",
    text: `${class10HindiPattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 9 || Hindi (R2 - Ganga)": {
    year: "2026-27",
    text: class9HindiPattern
  },

  "Class 10 || English (R1)": {
    year: "2026-27",
    text: `${class10EnglishPattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 9 || English (R1)": {
    year: "2026-27",
    text: class9EnglishPattern
  },

  "Class 10 || Social Science": {
    year: "2026-27",
    text: `SOCIAL SCIENCE - CODE NO. 087, Class X, Maximum Marks 80, Time Allowed 3 hours.
${class10SocialSciencePattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 9 || Social Science": {
    year: "2026-27",
    text: class9SocialSciencePattern
  },

  "Class 10 || Science": {
    year: "2026-27",
    text: `SCIENCE - CODE NO. 086, Class X, Maximum Marks 80, Time Allowed 3 hours.
${class10SciencePattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 9 || Science": {
    year: "2026-27",
    text: `Class 9 is a school examination, so CBSE publishes no sample paper for it. This paper is set
on the Class 10 Science 2026-27 sample paper layout against the Class 9 curriculum. The Class 9
units give the sections different marks, in the same 39 questions:
  Section A - Biology with Earth as a System (32 marks), Q1-Q17: 7 MCQs and 2 Assertion-Reason,
              4 questions of 2 marks, 2 of 3 marks, 1 case-based question of 4 marks, 1 long answer of 5 marks.
  Section B - Chemistry (25 marks), Q18-Q30: 7 MCQs and 1 Assertion-Reason, 1 question of 2 marks,
              2 of 3 marks, 1 case-based question of 4 marks, 1 long answer of 5 marks.
  Section C - Physics (23 marks), Q31-Q39: 2 MCQs and 1 Assertion-Reason, 1 question of 2 marks,
              3 of 3 marks, 1 case-based question of 4 marks, 1 long answer of 5 marks.
Everything else follows the Class 10 paper: all questions compulsory, internal choice in each
section's long answer, case-study 2-mark sub-part and one 2- or 3-mark question; case-based
sub-parts of 1, 1 and 2 marks; 9 figure-based questions (3 per section), each with an alternative
for visually impaired students; 2 questions in which the student draws.`
  },

  "Class 10 || Mathematics (Standard)": {
    year: "2026-27",
    text: `SUBJECT: MATHEMATICS STANDARD (041), Maximum Marks 80, Time Allowed 3 hours.
${mathsPaperLayout}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 10 || Mathematics (Basic)": {
    year: "2026-27",
    text: `SUBJECT: MATHEMATICS BASIC (241), Maximum Marks 80, Time Allowed 3 hours.
${mathsPaperLayout}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 9 || Mathematics": {
    year: "2026-27",
    text: `Class 9 is a school examination, so CBSE publishes no sample paper for it.
This paper is set on the Class 10 Mathematics 2026-27 sample paper layout, against the
Class 9 curriculum, so students meet the board format a year early.
${mathsPaperLayout}`
  },

  "Class 12 || Physics": {
    year: "2026-27",
    fullMarks: 70,
    text: `SUBJECT: PHYSICS (042), Class XII, Maximum Marks 70, Time Allowed 3 hours.
${physicsPaperPattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Physics": {
    year: "2026-27",
    fullMarks: 70,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This paper is set on the Class XII Physics 2026-27 sample paper layout, against the Class XI
curriculum and its unit weightage, so students meet the board format a year early.
SUBJECT: PHYSICS (042), Class XI, Maximum Marks 70, Time Allowed 3 hours.
${physicsPaperPattern}`
  },

  "Class 12 || Chemistry": {
    year: "2026-27",
    fullMarks: 70,
    text: `CHEMISTRY (CODE - 043), Class XII, Maximum Marks 70, Time Allowed 3 hours.
${chemistryPaperPattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Chemistry": {
    year: "2026-27",
    fullMarks: 70,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This paper is set on the Class XII Chemistry 2026-27 sample paper layout, against the Class XI
curriculum and its unit weightage, so students meet the board format a year early.
CHEMISTRY (CODE - 043), Class XI, Maximum Marks 70, Time Allowed 3 hours.
${chemistryPaperPattern}`
  },

  "Class 12 || Biology": {
    year: "2026-27",
    fullMarks: 70,
    text: `BIOLOGY - CODE NO. 044, Class XII, Maximum Marks 70, Time Allowed 3 hours.
${biologyPaperPattern}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Biology": {
    year: "2026-27",
    fullMarks: 70,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This paper is set on the Class XII Biology 2026-27 sample paper layout, against the Class XI
curriculum and its unit weightage, so students meet the board format a year early.
BIOLOGY - CODE NO. 044, Class XI, Maximum Marks 70, Time Allowed 3 hours.
${biologyPaperPattern}`
  },

  "Class 12 || Mathematics": {
    year: "2026-27",
    fullMarks: 80,
    text: `SUBJECT: MATHEMATICS (041), Class XII, Maximum Marks 80, Time Allowed 3 hours.
${seniorMathsPattern(3)}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Mathematics": {
    year: "2026-27",
    fullMarks: 80,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This paper is set on the Class XII Mathematics 2026-27 sample paper layout, against the Class XI
curriculum and its unit weightage, so students meet the board format a year early.
SUBJECT: MATHEMATICS (041), Class XI, Maximum Marks 80, Time Allowed 3 hours.
${seniorMathsPattern(3)}`
  },

  "Class 12 || Applied Mathematics": {
    year: "2026-27",
    fullMarks: 80,
    text: `SUBJECT: APPLIED MATHEMATICS (241), Class XII, Maximum Marks 80, Time Allowed 3 hours.
${seniorMathsPattern(2)}
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Applied Mathematics": {
    year: "2026-27",
    fullMarks: 80,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This paper is set on the Class XII Applied Mathematics 2026-27 sample paper layout, against the
Class XI curriculum and its unit weightage, so students meet the board format a year early.
SUBJECT: APPLIED MATHEMATICS (241), Class XI, Maximum Marks 80, Time Allowed 3 hours.
${seniorMathsPattern(2)}`
  },

  "Class 12 || English Core": {
    year: "2026-27",
    text: `ENGLISH CORE - Code No. 301, Class XII, Maximum Marks 80, Time Allowed 3 hours.
This question paper has 13 questions. All questions are compulsory.
It contains three sections: Section A: Reading Skills (22), Section B: Creative Writing Skills (18), Section C: Literature (40).
  Q1 unseen passage (12) and Q2 case-based factual passage with charts (10), together 700-750 words.
  Q3 notice (4) and Q4 invitation or reply (4), about 50 words; Q5 letter (5) and Q6 article or report (5), 120-150 words.
  Q7 Flamingo poetry extract (6), Q8 Vistas extract (4), Q9 Flamingo prose extract (6).
  Q10 Flamingo short answers, any 5 of 6 (5 x 2); Q11 Vistas short answers, any 2 of 3 (2 x 2), 40-50 words each.
  Q12 Flamingo long answer (5) and Q13 Vistas long answer (5), 120-150 words, any one of two.
Every writing and extract question offers a choice of (A) or (B). Attempt all questions based on the specific
instructions for each part. Adhere to the prescribed word limit while answering the questions.
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || English Core": {
    year: "2026-27",
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it. This paper is set on the
Class XII English Core 2026-27 sample paper layout (school policy) with the Class XI texts and writing tasks.
ENGLISH CORE - Code No. 301, Class XI, Maximum Marks 80, Time Allowed 3 hours.
This question paper has 13 questions. All questions are compulsory.
It contains three sections: Section A: Reading Skills (22), Section B: Creative Writing Skills (18), Section C: Literature (40).
  Q1 unseen passage (12) and Q2 case-based factual passage with charts (10).
  Q3 classified advertisement (4) and Q4 poster (4), up to 50 words; Q5 speech (5) and Q6 debate (5), 120-150 words.
  Q7 Hornbill poetry extract (6), Q8 Snapshots extract (4), Q9 Hornbill prose extract (6).
  Q10 Hornbill short answers, any 5 of 6 (5 x 2); Q11 Snapshots short answers, any 2 of 3 (2 x 2), 40-50 words each.
  Q12 Hornbill long answer (5) and Q13 Snapshots long answer (5), 120-150 words, any one of two.
Every writing and extract question offers a choice of (A) or (B).`
  },

  "Class 12 || Accountancy": {
    year: "2026-27",
    fullMarks: 80,
    text: `The question paper contains ${acc.totalQuestions} questions. All questions are compulsory.
The paper is divided into two parts, Part A and Part B.
  Part A - ${acc.parts["Class 12"].a.name} (${acc.parts["Class 12"].a.marks} Marks), compulsory for all candidates.
  Part B - candidates attempt EITHER "${acc.parts["Class 12"].b.name}" OR "Computerised Accounting" (${acc.parts["Class 12"].b.marks} Marks).
Mark distribution, numbered continuously across both parts:
  Questions 1 to 16 and 27 to 30 carry 1 mark each.
  Questions 17 to 20, 31 and 32 carry 3 marks each.
  Questions 21, 22 and 33 carry 4 marks each.
  Questions 23 to 26 and 34 carry 6 marks each.
There is no overall choice. Internal choice is provided in ${accIC.total} questions: ${accountancyChoiceText()}
(Q17, Q22, Q25, Q26, Q31 and Q33 in the sample paper). The 1-mark questions carry no choice.
Accountancy never uses ${accExcluded} questions.
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Accountancy": {
    year: "2026-27",
    fullMarks: 80,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it.
This pattern mirrors the Class 12 Accountancy design against the Class 11 syllabus
weighting, so students meet the board format from the first year.
The paper contains ${acc.totalQuestions} questions, divided into two parts:
  Part A - ${acc.parts["Class 11"].a.name} (${acc.parts["Class 11"].a.marks} Marks): Theoretical Framework (12) and Accounting Process (44).
  Part B - ${acc.parts["Class 11"].b.name} (${acc.parts["Class 11"].b.marks} Marks): Financial Statements of Sole Proprietorship.
Questions run on the same ${acc.markLadder.join(' / ')} mark ladder used at Class 12, numbered
continuously across both parts, and internal choice follows the Class 12 paper:
${accIC.total} questions in all - ${accountancyChoiceText()}; the 1-mark questions carry no choice.
Accountancy never uses ${accExcluded} questions.`
  }
};

export function getSqpBlueprint(className, subjectName) {
  if (!className || !subjectName) return null;
  const wanted = `${className} || ${subjectName}`.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const [key, value] of Object.entries(sqpBlueprints)) {
    if (key.toLowerCase().replace(/\s+/g, ' ').trim() === wanted) return value;
  }
  // The four Class 9 / 10 skill subjects share CBSE's skill paper layout.
  const skill = getSecondarySkill(className, subjectName);
  if (skill) {
    return { year: "2026-27", text: `${skill.label.toUpperCase()}, ${className === "Class 9" ? "Class IX" : "Class X"}, Maximum Marks 50 (theory), Time Allowed 2 hours.\n${skill.pattern}` };
  }
  return null;
}
