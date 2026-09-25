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

// Class 11 and 12 Business Studies (054) and Economics (030), from the CBSE
// 2026-27 curriculum documents and the Class XII 2026-27 sample papers (both
// unchanged in design). Both papers are 34 questions on the same 1 / 3 / 4 / 6
// mark ladder as Accountancy - 20 MCQs, 4 of 3 marks, 6 of 4 and 4 of 6 - with
// six internal choices (two each of 3, 4 and 6 marks) and CBSE's 32 / 24 / 24
// typology split. Business Studies has no sections; Economics has Section A
// (Macroeconomics, or Statistics in Class 11) and Section B (Indian Economic
// Development, or Microeconomics in Class 11), 40 marks each. Short tests use
// the same ladder, never a 2- or 5-mark question (`shortTests`).
const commerceLadderDesign = { understanding: 32, applying: 24, analysing: 24, percent: [40, 30, 30], labels: physicsDesign.labels };

const commerceShortTests = (kinds) => ({
  unit: [
    { name: "Objective", type: kinds[1], count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Compulsory" },
    { name: "Short Answer", type: kinds[3], count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Internal choice in 1 Q" },
    { name: "Short Answer", type: kinds[4], count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Internal choice" },
    { name: "Long Answer", type: kinds[6], count: 1, unitMark: 6, marksPerQ: "6 Marks", total: 6, choice: "Internal choice" }
  ],
  periodic: [
    { name: "Objective", type: kinds[1], count: 8, unitMark: 1, marksPerQ: "1 Mark", total: 8, choice: "Compulsory" },
    { name: "Short Answer", type: kinds[3], count: 4, unitMark: 3, marksPerQ: "3 Marks", total: 12, choice: "Internal choice in 1 Q" },
    { name: "Short Answer", type: kinds[4], count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in 1 Q" },
    { name: "Long Answer", type: kinds[6], count: 2, unitMark: 6, marksPerQ: "6 Marks", total: 12, choice: "Internal choice in 1 Q" }
  ]
});

const commerceArOptions = ["(A) Both A and R are true and R is the correct explanation of A.", "(B) Both A and R are true but R is not the correct explanation of A.", "(C) A is true but R is false.", "(D) A is false but R is true."];

const bstQuestions = [
  { section: "1-Mark Questions", q: "Q1-Q20", type: "Multiple choice questions", count: 20, each: 1, marks: 20, detail: "Mostly set in a business situation; include Assertion-Reason, statement-based and match-the-column forms; no internal choice" },
  { section: "3-Mark Questions", q: "Q21-Q24", type: "Short answer (50-75 words)", count: 4, each: 3, marks: 12, detail: "Internal choice in Q21 and Q23" },
  { section: "4-Mark Questions", q: "Q25-Q30", type: "Short answer (about 150 words)", count: 6, each: 4, marks: 24, detail: "Internal choice in Q25 and Q28; several are case-based (identify and explain the concept in the case)" },
  { section: "6-Mark Questions", q: "Q31-Q34", type: "Long answer (about 200 words)", count: 4, each: 6, marks: 24, detail: "Internal choice in Q31 and Q34; case-based or 'explain any ...' questions" }
];

const bstGeneralInstructions = [
  "This question paper contains 34 questions.",
  "Marks are indicated against each question.",
  "Answers should be brief and to the point.",
  "Answers to the questions carrying 3 marks may be from 50 to 75 words.",
  "Answers to the questions carrying 4 marks may be about 150 words.",
  "Answers to the questions carrying 6 marks may be about 200 words.",
  "Attempt all parts of the questions together."
];

const bstFormats = {
  markLadder: [1, 3, 4, 6],
  letteredSections: false,
  fullMarks: 80,
  design: commerceLadderDesign,
  questions: bstQuestions,
  generalInstructions: bstGeneralInstructions,
  arOptions: commerceArOptions,
  shortTests: commerceShortTests({ 1: "MCQs (situation-based, Assertion-Reason, statement-based)", 3: "Short answer (50-75 words)", 4: "Short answer or case (about 150 words)", 6: "Long answer or case (about 200 words)" }),
  foundational: "business terms, concepts, principles and the provisions of the Acts in the syllabus",
  misconceptions: "effectiveness vs efficiency, Fayol's principles vs Taylor's techniques, functional vs divisional structure, delegation vs decentralisation, capital budgeting vs working capital decisions, money market vs capital market, product vs production concept",
  constructed: [
    "Short Answer (3 Marks, 50-75 words): state, explain or distinguish, worth 3 value points.",
    "Short Answer (4 Marks, about 150 words): identify the concept in a business case and explain it, or explain any points asked, worth 4 value points.",
    "Long Answer (6 Marks, about 200 words): explain six points, or a case with several parts, with internal choice (A) OR (B)."
  ],
  designNote: "most 3-, 4- and 6-mark questions put the concept in a business situation to identify, explain or apply, not only to recall.",
  sourcing: "Source questions from the NCERT Business Studies textbooks, CBSE's sample and practice papers and past board papers; cases name realistic Indian firms and people.",
  arPlacement: "under each Assertion-Reason question, after the line \"Choose the correct options:\"",
  arAnswered: "answered from the four options printed below it",
  typology: {
    sa: "State, explain or distinguish in **50-75 words**, worth **3 value points**; may name a concept from a short situation.",
    laHeading: "4-Mark and 6-Mark Questions",
    la: [
      "4 marks (about 150 words) and 6 marks (about 200 words): many are case-based - a short business situation in which the student identifies the principle, function, step or concept and explains it; others ask to explain a stated number of points. Each case quotes the relevant line so the answer can be identified from it.",
      "Internal choice only where the blueprint rows say (two 3-mark, two 4-mark and two 6-mark questions); no MCQ carries a choice."
    ]
  },
  rigor: "Formulate questions whose answers are marked point by point: the concept named correctly, each point with a heading and a line of explanation, and in case-based questions the line of the case quoted to support the answer.",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q34 continuously, in the order of the rows above (a row \"Q1-Q20\" is twenty separate questions). The paper has no lettered sections: print the marks against each question. An internal choice sits under one question number as (A) OR (B).",
  requirements: [
    "**Word limits:** print CBSE's general instructions, which give the word limits (3 marks: 50-75 words, 4 marks: about 150 words, 6 marks: about 200 words).",
    "**Internal choice:** exactly 6 questions, as the sample paper places them - Q21 and Q23 (3 marks), Q25 and Q28 (4 marks), Q31 and Q34 (6 marks) - each printed as (A) OR (B).",
    "**Business situations:** most MCQs and most 4- and 6-mark questions are built on a short, realistic Indian business situation (a named firm, manager or entrepreneur)."
  ],
  figureQuota: "Business Studies papers carry no figures: set none unless a question needs a small table",
  diagramRules: `
    *   **Business Studies:** the sample paper has no figures. Use a small HTML table only where a question needs one (for example a match-the-column MCQ).`
};

const bstScope12 = [
  "Principles of management: Fayol's principles and Taylor's scientific management (principles and techniques).",
  "Directing: motivation includes Maslow's hierarchy of needs; leadership styles based on the use of authority; communication barriers.",
  "Financial Markets: money market, capital market, stock exchange and SEBI (objectives and functions).",
  "Consumer Protection: the Consumer Protection Act, 2019 - rights, responsibilities, redressal machinery.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const bstScope11 = [
  "Business Services and Emerging Modes of Business as in the NCERT textbook; GST as a concept.",
  "Social Responsibility of Business: the case for and against social responsibility, and business ethics.",
  "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
];

const ecoQuestions = (secA, secB) => [
  { section: `Section A: ${secA}`, q: "Q1-Q10", type: "Multiple choice questions", count: 10, each: 1, marks: 10, detail: "Varied forms: choose the correct option, statement-based, Assertion-Reason, match or arrange in order, short numerical MCQs; no internal choice" },
  { section: `Section A: ${secA}`, q: "Q11-Q12", type: "Short answer (60-80 words)", count: 2, each: 3, marks: 6, detail: "Internal choice in Q11; one may be built on a cartoon, image or graph, with an alternative for visually impaired candidates" },
  { section: `Section A: ${secA}`, q: "Q13-Q15", type: "Short answer (80-100 words)", count: 3, each: 4, marks: 12, detail: "Internal choice in Q13; numericals, diagrams or explanations" },
  { section: `Section A: ${secA}`, q: "Q16-Q17", type: "Long answer (100-150 words)", count: 2, each: 6, marks: 12, detail: "Internal choice in Q17; one may be based on a given text; numericals with working or diagrams" },
  { section: `Section B: ${secB}`, q: "Q18-Q27", type: "Multiple choice questions", count: 10, each: 1, marks: 10, detail: "Varied forms as in Section A; picture or image based ones with an alternative for visually impaired candidates; no internal choice" },
  { section: `Section B: ${secB}`, q: "Q28-Q29", type: "Short answer (60-80 words)", count: 2, each: 3, marks: 6, detail: "Internal choice in Q29" },
  { section: `Section B: ${secB}`, q: "Q30-Q32", type: "Short answer (80-100 words)", count: 3, each: 4, marks: 12, detail: "Internal choice in Q32" },
  { section: `Section B: ${secB}`, q: "Q33-Q34", type: "Long answer (100-150 words)", count: 2, each: 6, marks: 12, detail: "Internal choice in Q33; Q34 based on a given text" }
];

const ecoGeneralInstructions = (secA, secB) => [
  `This question paper contains two sections: Section A – ${secA}; Section B – ${secB}.`,
  "This paper contains 20 Multiple Choice Type Questions of 1 mark each.",
  "This paper contains 4 Short Answer Type Questions of 3 marks each to be answered in 60 to 80 words.",
  "This paper contains 6 Short Answer Type Questions of 4 marks each to be answered in 80 to 100 words.",
  "This paper contains 4 Long Answer Type Questions of 6 marks each to be answered in 100 to 150 words."
];

const ecoFormats = {
  markLadder: [1, 3, 4, 6],
  letteredSections: true,
  fullMarks: 80,
  design: commerceLadderDesign,
  arOptions: ["(A) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).", "(B) Both Assertion (A) and Reason (R) are true, but Reason (R) is not the correct explanation of Assertion (A).", "(C) Assertion (A) is true, but Reason (R) is false.", "(D) Assertion (A) is false, but Reason (R) is true."],
  shortTests: commerceShortTests({ 1: "MCQs (statement-based, Assertion-Reason, numerical)", 3: "Short answer (60-80 words)", 4: "Short answer or numerical (80-100 words)", 6: "Long answer, numerical or text-based (100-150 words)" }),
  foundational: "economic terms, definitions, formulae and the facts of India's economic history in the syllabus",
  constructed: [
    "Short Answer (3 Marks, 60-80 words): explain, distinguish or work a short numerical, worth 3 value points.",
    "Short Answer (4 Marks, 80-100 words): a numerical with working, a diagram with explanation, or an explanation of 4 points.",
    "Long Answer (6 Marks, 100-150 words): a numerical, diagram-based or text-based question in parts, with internal choice (A) OR (B)."
  ],
  designNote: "most 3-, 4- and 6-mark questions ask the student to explain with a diagram, work a numerical, interpret data or a text, or evaluate a policy.",
  arPlacement: "under each Assertion-Reason question, after the line \"Options:\"",
  arAnswered: "answered from the four options printed below it",
  typology: {
    sa: "Explain, distinguish or work a short numerical in **60-80 words**, worth **3 value points**; one may be built on a cartoon, image or graph.",
    laHeading: "4-Mark and 6-Mark Questions",
    la: [
      "4 marks (80-100 words) and 6 marks (100-150 words): numericals with the formula and every step, diagrams with labelled axes and curves, and explanations; a 6-mark question may be split into parts (for example 3 + 3) or be based on a given text (\"Refer to the following text\").",
      "Internal choice only where the blueprint rows say (two 3-mark, two 4-mark and two 6-mark questions, as the sample paper places them)."
    ]
  },
  rigor: "Formulate questions whose answers are marked on the formula, the working and the final answer with its unit (₹ crore, %), correctly labelled diagrams (axes, curves, equilibrium point), and explanations that use the economic terms of the NCERT text.",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q34 continuously across Section A and Section B, in the order of the rows above (a row \"Q1-Q10\" is ten separate questions). An internal choice sits under one question number as A OR B, for example 11 A OR 11 B, exactly as the sample paper prints it.",
  figureQuota: "Set **2 to 4 visual inputs** (a cartoon, image, graph or data table), each figure-based one with an alternative for visually impaired candidates",
  diagramRules: `
    *   **Economics Figures:** MUST generate clean inline vector SVG or HTML tables for:
        - Graphs with labelled axes and curves: consumption and saving functions, aggregate demand and supply, PPF, demand and supply with equilibrium, cost and revenue curves, price ceiling and floor.
        - Simple cartoons or images described in a caption, and data tables (national income data, sector shares, indicators of India, China and Pakistan) as HTML tables.`
};

// Class 11 and 12 History (027), from the CBSE 2026-27 curriculum document
// (History_SecP2_2026-27) and the Class XII 2026-27 sample paper (design
// unchanged): 34 questions - 21 MCQs, 6 short answers of 3 marks (60-80
// words), 3 long answers of 8 marks (300-350 words), 3 source-based questions
// of 4 marks and a 5-mark map question. In Class XII each of the three NCERT
// books carries 25 marks (7 MCQs, 2 short answers, 1 long answer, 1 source);
// Class XI's own design has the same totals, spread over its themes.
// CBSE's competency split has five parts (map skills among them), so it is
// given as `design.lines` rather than the three-level split.
const historyQuestions = (perBook) => [
  { section: "Section A", q: "Q1-Q21", type: "Multiple choice questions", count: 21, each: 1, marks: 21, detail: `${perBook.mcq}; varied forms: statement-based, Assertion-Reason, match the columns, chronological order, and picture-based ones with a words-only alternative for visually impaired candidates; no internal choice` },
  { section: "Section B", q: "Q22-Q27", type: "Short answer (60-80 words)", count: 6, each: 3, marks: 18, detail: `${perBook.sa}; internal choice in 2 questions (Q22 and Q27 in the sample paper)` },
  { section: "Section C", q: "Q28-Q30", type: "Long answer (300-350 words)", count: 3, each: 8, marks: 24, detail: `${perBook.la}; internal choice in all 3` },
  { section: "Section D", q: "Q31-Q33", type: "Source-based questions", count: 3, each: 4, marks: 12, detail: `${perBook.source}: a source of about 150-200 words from the NCERT textbook with its title and source line, followed by sub-questions of 1, 1 and 2 marks; no internal choice` },
  { section: "Section E", q: "Q34", type: "Map-based question", count: 1, each: 5, marks: 5, detail: `34.1 locate and label 3 places (one with an internal choice) and 34.2 identify 2 places marked A and B, on ${perBook.map || "an outline political map of India"}; a words-only alternative for visually impaired candidates` }
];

const historyDesign = {
  lines: [
    "**Knowledge** (recall facts, terms, basic concepts and answers): **21 marks (26.25%)**.",
    "**Understanding** (organise, translate, interpret, describe and state main ideas): **18 marks (22.5%)**.",
    "**Applying and Analysing** (apply knowledge, facts, techniques and rules to solve problems): **24 marks (30%)**.",
    "**Formulating, Evaluating and Creating** (examine, infer, find evidence for generalisations, present and defend judgements): **12 marks (15%)**.",
    "**Map skills**: **5 marks (6.25%)** - the map question."
  ],
  note: "most short and long answers ask the student to explain, analyse, compare or justify with evidence from the sources, not only to recall."
};

const historyGeneralInstructions = [
  "This question paper contains 34 questions. All questions are compulsory.",
  "Question paper is divided into five Sections – Sections A, B, C, D and E.",
  "Section A – question number 1 to 21 are Multiple Choice type questions. Each question carries 1 mark.",
  "Section B – question number 22 to 27 are Short Answer type questions. Each question carries 3 marks. Write answer to each question in 60 to 80 words.",
  "Section C – question number 28 to 30 are Long Answer (LA) type questions. Each question carries 8 marks. Write answer to each question in 300 to 350 words.",
  "Section D – question number 31 to 33 are Source-based questions having three sub-questions. Each question carries 4 marks.",
  "Section E – question number 34 is Map-based question that includes the identification and location of significant test items. This question carries 5 marks. Attach the Map with the answer-book.",
  "There is no overall choice. However, an internal choice has been provided in Sections B, C and E of question paper. A candidate has to write answer for only one of the alternatives in such questions.",
  "Note that a separate question has been provided for Candidates with Visual Impairment in lieu of questions having visual inputs, Map etc. Such questions are to be attempted by Visually Impaired candidates only."
];

const historyMapList12 = `Part I (Themes 1-4): mature Harappan sites - Harappa, Banawali, Kalibangan, Balakot, Rakhigarhi, Dholavira, Nageshwar, Lothal, Mohenjodaro, Chanhudaro, Kot Diji; Mahajanapadas and cities - Vajji, Magadha, Kosala, Kuru, Panchala, Gandhara, Avanti, Rajgir, Ujjain, Taxila, Varanasi; Ashokan pillar inscriptions - Sanchi, Topra, Meerut Pillar, Kaushambi; kingdoms of the Cholas, Cheras and Pandyas; kingdoms and towns - Kushanas, Shakas, Satavahanas, Vakatakas, Guptas, Mathura, Kanauj, Puhar, Bharukachchha, Shravasti, Rajgir, Vaishali, Varanasi, Vidisha; Buddhist sites - Nagarjunakonda, Sanchi, Amaravati, Lumbini, Bharhut, Bodh Gaya, Ajanta.
Part II (Themes 5-8): Bidar, Golconda, Bijapur, Vijayanagar, Chandragiri, Kanchipuram, Mysore, Thanjavur, Kolar, Tirunelveli; territories under Babur, Akbar and Aurangzeb - Delhi, Agra, Panipat, Amber, Ajmer, Lahore, Goa.
Part III (Themes 9-12): territories and cities under British control in 1857 - Punjab, Sindh, Bombay, Madras, Berar, Bengal, Bihar, Orissa, Surat, Calcutta, Patna, Allahabad; main centres of the Revolt of 1857 - Delhi, Meerut, Jhansi, Lucknow, Kanpur, Azamgarh, Calcutta, Benaras, Gwalior, Jabalpur, Agra, Awadh; centres of the National Movement - Champaran, Kheda, Ahmedabad, Benaras, Amritsar, Chauri Chaura, Lahore, Bardoli, Dandi, Bombay (Quit India Resolution), Karachi.`;

// Short tests keep History's own question types (1-mark MCQs, 3-mark short
// answers, 4-mark sources, 8-mark long answers, the 5-mark map), never a 2-
// or 5-mark written answer.
const historyShortTests = {
  unit: [
    { name: "Section A", type: "MCQs (statement-based, Assertion-Reason, chronological order)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Compulsory" },
    { name: "Section B", type: "Short answer (60-80 words)", count: 1, unitMark: 3, marksPerQ: "3 Marks", total: 3, choice: "Internal choice" },
    { name: "Section C", type: "Source-based question (sub-questions of 1, 1 and 2 marks)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Compulsory" },
    { name: "Section D", type: "Long answer (300-350 words)", count: 1, unitMark: 8, marksPerQ: "8 Marks", total: 8, choice: "Internal choice" }
  ],
  periodic: [
    { name: "Section A", type: "MCQs (statement-based, Assertion-Reason, match the columns, chronological order, picture-based)", count: 10, unitMark: 1, marksPerQ: "1 Mark", total: 10, choice: "Compulsory" },
    { name: "Section B", type: "Short answer (60-80 words)", count: 3, unitMark: 3, marksPerQ: "3 Marks", total: 9, choice: "Internal choice in 1 Q" },
    { name: "Section C", type: "Long answer (300-350 words)", count: 1, unitMark: 8, marksPerQ: "8 Marks", total: 8, choice: "Internal choice" },
    { name: "Section D", type: "Source-based questions (sub-questions of 1, 1 and 2 marks)", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Compulsory" },
    { name: "Section E", type: "Map question (locate and label 3, identify 2 marked A and B)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Internal choice in 1 item" }
  ]
};

const historyFormats = {
  fullMarks: 80,
  mapMarks: 5,
  markLadder: [1, 3, 4, 8],
  letteredSections: true,
  shortTests: historyShortTests,
  design: historyDesign,
  generalInstructions: historyGeneralInstructions,
  arOptions: ["(A) Both (A) and (R) are true and (R) is the correct explanation of (A).", "(B) Both (A) and (R) are true, but (R) is not the correct explanation of (A).", "(C) (A) is true, but (R) is false.", "(D) (A) is false, but (R) is true."],
  foundational: "dates, events, people, places and terms from the themes",
  constructed: [
    "Short Answer (3 Marks, 60-80 words): explain, compare or justify with 3 value points.",
    "Long Answer (8 Marks, 300-350 words): explain, analyse or evaluate a theme with evidence, with internal choice (A) OR (B).",
    "Source-based (4 Marks): a passage from the NCERT textbook with sub-questions of 1, 1 and 2 marks."
  ],
  sourcing: "Source questions from the NCERT Themes textbooks (their sources, pictures and maps), CBSE's sample and practice papers and past board papers.",
  arPlacement: "under each Assertion-Reason question",
  arAnswered: "answered from the four options printed below it",
  typology: {
    sa: "Answer in **60-80 words** with **3 value points**: explain, compare, analyse a statement or justify with examples (\"Justify the statement with suitable examples\").",
    laHeading: "8-Mark Long Answer and 4-Mark Source-Based Questions",
    la: [
      "Long answers (8 marks, 300-350 words): explain, analyse or evaluate an aspect of a theme with evidence, each with an internal choice (A) OR (B) from the same theme or book.",
      "Source-based questions (4 marks): a titled passage of about 150-200 words quoted from the NCERT textbook with its source line (for example \"Source - NCERT History Book 1, Chapter 3\"), followed by three sub-questions of 1, 1 and 2 marks that test understanding and interpretation of the source."
    ]
  },
  rigor: "Formulate questions whose answers are distinct value points: accurate names, dates, places and terms from the NCERT text, and evidence from the sources for every argument.",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q34 continuously across Sections A to E, in the order of the rows above (a row \"Q1-Q21\" is twenty-one separate questions). Source-based sub-questions are numbered 31.1, 31.2, 31.3; the map question 34.1 and 34.2. An internal choice sits under one number as A OR B.",
  figureQuota: "Set **1 outline political map of India** for the map question, and **1 or 2 picture-based MCQs** (a sculpture, coin, inscription or photograph described in a caption), each with a words-only alternative for visually impaired candidates",
  diagramRules: `
    *   **History Map:** where the paper has a map question, print an outline political map of India at the end of the paper, headed with the map question's number ("Map for Q. 34" in the full paper). Mark ONLY the two places the student identifies (A and B); the places the student locates and labels are left unmarked.
    *   **Pictures:** where an MCQ uses a picture from the NCERT textbook, describe it in a caption inside a bordered box (no photographs), with its source.`
};

// Class 11 and 12 Political Science (028), from the CBSE 2026-27 curriculum
// document (PoliticalScience_SecP2_2026-27) and the Class XII 2026-27 sample
// paper (design unchanged): 30 questions in Sections A-E - 12 MCQs, 6 short
// answers of 2 marks (50-60 words), 5 of 4 marks (100-120 words), 3 picture,
// passage and map questions of 4 marks (four 1-mark parts) and 4 long answers
// of 6 marks (170-180 words). Each book carries 40 marks. CBSE's competency
// split has four parts, given as `design.lines`.
const polSciQuestions = (spread) => [
  { section: "Section A", q: "Q1-Q12", type: "Multiple choice questions", count: 12, each: 1, marks: 12, detail: `${spread.mcq}; varied forms: statement-based (Statement-I / Statement-II), Assertion-Reason, match the columns, chronological order, fill in the blank, find the incorrect pair or statement; no internal choice` },
  { section: "Section B", q: "Q13-Q18", type: "Short answer I (50-60 words)", count: 6, each: 2, marks: 12, detail: `${spread.sa2}; state, highlight or explain any two points; no internal choice` },
  { section: "Section C", q: "Q19-Q23", type: "Short answer II (100-120 words)", count: 5, each: 4, marks: 20, detail: `${spread.sa4}; explain, analyse or justify with four points; internal choice in 2 questions (Q21 and Q22 in the sample paper)` },
  { section: "Section D", q: "Q24-Q26", type: spread.dType, count: 3, each: 4, marks: 12, detail: `${spread.d}; each has four parts of 1 mark; no internal choice` },
  { section: "Section E", q: "Q27-Q30", type: "Long answer (170-180 words)", count: 4, each: 6, marks: 24, detail: `${spread.la}; internal choice in all 4` }
];

const polSciDesign = {
  lines: [
    "**Knowledge and Remembering** (recall facts, terms and basic concepts): **22 marks (27.5%)**.",
    "**Understanding** (organise, compare, explain, describe and state main ideas): **24 marks (30%)**.",
    "**Applying** (apply knowledge and facts to interpret a situation, cartoon, clipping, source or map): **22 marks (27.5%)**.",
    "**Analysis and Evaluation** (classify, compare and contrast, integrate information from several sources, identify motives or causes, make inferences with evidence): **12 marks (15%)**."
  ],
  note: "CBSE sets half of the paper as competency-based questions (situations, cartoons, passages, maps and 'analyse' or 'justify' questions)."
};

const polSciGeneralInstructions = [
  "The question paper consists of five sections (A, B, C, D and E) with 30 questions in total.",
  "All questions are compulsory.",
  "Question numbers 1-12 are multiple choice questions of one mark each.",
  "Question numbers 13-18 are of 2 marks each. Answers to these questions should not exceed 50-60 words each.",
  "Question numbers 19-23 are of 4 marks each. Answers to these questions should not exceed 100-120 words each. There is an internal choice in two of the 4-mark questions.",
  "Question numbers 24-26 are picture, passage and map based questions. Answer accordingly.",
  "Question numbers 27-30 are of 6 marks each. Answers to these questions should not exceed 170-180 words.",
  "There are internal choices in all the 6 marks questions."
];

// Short tests keep the paper's own 1 / 2 / 4 / 6 mark types.
const polSciShortTests = {
  unit: [
    { name: "Section A", type: "MCQs (statement-based, Assertion-Reason, match the columns, chronological order)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Compulsory" },
    { name: "Section B", type: "Short answer I (50-60 words)", count: 1, unitMark: 2, marksPerQ: "2 Marks", total: 2, choice: "Compulsory" },
    { name: "Section C", type: "Short answer II (100-120 words)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Internal choice" },
    { name: "Section D", type: "Picture/cartoon or passage-based question (four parts of 1 mark)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Compulsory" },
    { name: "Section E", type: "Long answer (170-180 words)", count: 1, unitMark: 6, marksPerQ: "6 Marks", total: 6, choice: "Internal choice" }
  ],
  periodic: [
    { name: "Section A", type: "MCQs (statement-based, Assertion-Reason, match the columns, chronological order)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "Compulsory" },
    { name: "Section B", type: "Short answer I (50-60 words)", count: 3, unitMark: 2, marksPerQ: "2 Marks", total: 6, choice: "Compulsory" },
    { name: "Section C", type: "Short answer II (100-120 words)", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in 1 Q" },
    { name: "Section D", type: "Picture/cartoon, passage or map-based questions (four parts of 1 mark)", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Compulsory" },
    { name: "Section E", type: "Long answer (170-180 words)", count: 2, unitMark: 6, marksPerQ: "6 Marks", total: 12, choice: "Internal choice in both" }
  ]
};

const polSciFormats = {
  fullMarks: 80,
  markLadder: [1, 2, 4, 6],
  letteredSections: true,
  shortTests: polSciShortTests,
  design: polSciDesign,
  generalInstructions: polSciGeneralInstructions,
  arOptions: ["(A) Both the Assertion (A) and the Reason (R) are correct and the Reason (R) is the correct explanation of the Assertion (A).", "(B) Both the Assertion (A) and the Reason (R) are correct, but the Reason (R) is not the correct explanation of the Assertion (A).", "(C) The Assertion (A) is incorrect, but the Reason (R) is correct.", "(D) The Assertion (A) is correct, but the Reason (R) is incorrect."],
  arPlacement: "under each Assertion-Reason question (note the order: (C) is 'Assertion incorrect, Reason correct' and (D) is 'Assertion correct, Reason incorrect')",
  arAnswered: "answered from the four options printed below it",
  foundational: "dates, events, leaders, organisations, terms and constitutional provisions from the textbooks",
  constructed: [
    "Short Answer I (2 Marks, 50-60 words): state, highlight or explain any two points.",
    "Short Answer II (4 Marks, 100-120 words): explain, analyse or justify a statement with four points.",
    "Long Answer (6 Marks, 170-180 words): explain, analyse or evaluate with examples, with internal choice (A) OR (B)."
  ],
  sourcing: "Source questions from the NCERT textbooks (their text, cartoons, pictures and maps), CBSE's sample and practice papers and past board papers.",
  typology: {
    vsa: "Answer in **50-60 words** with **two points** (\"State any two ...\", \"Highlight any two ...\", \"Explain any two ...\"); one mark per point.",
    laHeading: "4-Mark Short Answer II and 6-Mark Long Answer Questions",
    la: [
      "Short answer II (4 marks, 100-120 words): \"Analyse any four reasons ...\", \"Justify the statement with any four suitable arguments\", \"Explain any four ...\"; four points of 1 mark each. Internal choice (A) OR (B) in two of them.",
      "Long answer (6 marks, 170-180 words): explain, analyse or evaluate a statement or development with examples (\"Support your answer with one example ...\"); every one has an internal choice (A) OR (B) from the same book."
    ],
    cbqHeading: "Picture, Passage and Map-Based Questions",
    cbq: [
      "Each carries four parts of 1 mark (numbered I to IV), mostly MCQs with options (A) to (D) that test interpretation of the stimulus, not only recall.",
      "Picture or cartoon: \"Study the picture given below and answer the questions based on it\", with the source line of the NCERT page (for example \"Source - Page no. 46, Contemporary World Politics, NCERT\").",
      "Passage: a titled passage of about 150-200 words from the NCERT textbook with its source line.",
      "A picture or map question is followed by words-only questions \"for the Candidates with Visual Impairment only, in lieu of\" it."
    ]
  },
  rigor: "Formulate questions whose answers are distinct value points: accurate names, dates, events, organisations and constitutional terms from the NCERT text, and an example for every argument.",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q30 continuously across Sections A to E, in the order of the rows above (a row \"Q1-Q12\" is twelve separate questions). The parts of a picture, passage or map question are numbered I, II, III and IV. An internal choice sits under one number as A OR B."
};

// Class 11 and 12 Geography (029), from the CBSE 2026-27 curriculum document
// (Geography_SecP2_2026-27) and the Class XII 2026-27 sample paper (design
// unchanged). The theory paper is 70 marks (practical 30): 30 questions - 17
// MCQs, 2 source-based questions of 3 marks, 4 short answers of 3 marks
// (80-100 words), 5 long answers of 5 marks (120-150 words) and 2 map
// questions of 5 marks (one on the world map, one on India's). Each book
// carries 30 marks plus its 5-mark map question.
const geoQuestions = (spread) => [
  { section: "Section A", q: "Q1-Q17", type: "Multiple choice questions", count: 17, each: 1, marks: 17, detail: `${spread.mcq}; varied forms: match the columns, choose the correct statements, situation-based, data or table-based (including a short calculation such as population density or natural growth rate), Assertion-Reason, the incorrectly matched pair, and one or two map or graph-based items with a words-only alternative for visually impaired candidates; no internal choice` },
  { section: "Section B", q: "Q18-Q19", type: "Source-based questions", count: 2, each: 3, marks: 6, detail: "Q18 on a map, picture or graph (with a words-only alternative for visually impaired candidates) and Q19 on a passage of about 150 words from the NCERT textbook; three parts each, marked 1, ½+½ and 1" },
  { section: "Section C", q: "Q20-Q23", type: "Short answer (80-100 words)", count: 4, each: 3, marks: 12, detail: "explain a concept, analyse or apply it to a situation (some split 1+2); internal choice in one (Q23 in the sample paper)" },
  { section: "Section D", q: "Q24-Q28", type: "Long answer (120-150 words)", count: 5, each: 5, marks: 25, detail: "explain, classify, distinguish (five points), examine or suggest measures, some split 2+3 or 2½+2½; internal choice in four (Q24, Q25, Q26 and Q28 in the sample paper)" },
  { section: "Section E", q: "Q29-Q30", type: "Map-based questions", count: 2, each: 5, marks: 10, detail: `${spread.map}; each lists seven features (A to G) of which the student answers any five, and has words-only questions for visually impaired candidates in lieu of it (answer any five)` }
];

const geoDesign = {
  understanding: 41, applying: 37, analysing: 22, percent: [41, 37, 22],
  labels: ["Remembering and Understanding (recall facts, terms, basic concepts, data and information; organise, compare, interpret, describe and state main ideas)",
           "Application (use a concept in a new situation; apply acquired knowledge, facts, techniques and rules)",
           "Analysing, Evaluating and Creating (break information into parts, identify motives or causes, distinguish facts from inferences, find evidence for generalisations, synthesise)"]
};

const geoGeneralInstructions = [
  "This question paper contains 30 questions. All questions are compulsory.",
  "This question paper is divided into five sections: sections A, B, C, D, and E.",
  "Section A - Question number 1 to 17 are multiple-choice type questions carrying 1 mark each.",
  "Section B - Question number 18 and 19 are source-based questions carrying 3 marks each.",
  "Section C - Question number 20 to 23 are Short Answer (SA) type questions carrying 3 marks each. The answer to these questions shall be written in 80 to 100 words.",
  "Section D - Question number 24 to 28 are Long Answer (LA) type questions carrying 5 marks each. Answer to these questions shall be written in 120 to 150 words.",
  "Section E - Question number 29 and 30 are map-based questions. Each question carries 5 marks.",
  "In addition to this, NOTE that a separate question has been provided for Visually Impaired Candidates in lieu of questions having visual inputs, maps, etc. Such questions are to be attempted by Visually Impaired Candidates only.",
  "There is no overall choice given in the question paper. However, an internal choice has been provided in a few questions in all sections, except Section A."
];

// Short tests keep the paper's 1 / 3 / 5 mark types.
const geoShortTests = {
  unit: [
    { name: "Section A", type: "MCQs (situation, data or table-based, match the columns, Assertion-Reason)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Compulsory" },
    { name: "Section B", type: "Source-based question (map, picture, graph or passage; parts of 1, ½+½ and 1)", count: 1, unitMark: 3, marksPerQ: "3 Marks", total: 3, choice: "Compulsory" },
    { name: "Section C", type: "Short answer (80-100 words)", count: 1, unitMark: 3, marksPerQ: "3 Marks", total: 3, choice: "Internal choice" },
    { name: "Section D", type: "Long answer (120-150 words)", count: 2, unitMark: 5, marksPerQ: "5 Marks", total: 10, choice: "Internal choice in 1 Q" }
  ],
  periodic: [
    { name: "Section A", type: "MCQs (situation, data or table-based, match the columns, Assertion-Reason)", count: 8, unitMark: 1, marksPerQ: "1 Mark", total: 8, choice: "Compulsory" },
    { name: "Section B", type: "Source-based questions (one on a map, picture or graph, one on a passage)", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Compulsory" },
    { name: "Section C", type: "Short answer (80-100 words)", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Internal choice in 1 Q" },
    { name: "Section D", type: "Long answer (120-150 words)", count: 3, unitMark: 5, marksPerQ: "5 Marks", total: 15, choice: "Internal choice in 2 Qs" },
    { name: "Section E", type: "Map question (any five of seven features from CBSE's map list for the selected chapters; a 5-mark long answer instead if they have no map items)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Any five of seven" }
  ]
};

const geoFormats = {
  fullMarks: 70,
  mapMarks: 10,
  markLadder: [1, 3, 5],
  letteredSections: true,
  shortTests: geoShortTests,
  design: geoDesign,
  generalInstructions: geoGeneralInstructions,
  // As in the sample paper, except that its option D repeats C ("R is
  // incorrect but A is correct"); the standard fourth option is used instead.
  arOptions: ["A. Both A and R are correct and R is the correct explanation of A.", "B. Both A and R are correct and R is not the correct explanation of A.", "C. A is correct but R is incorrect.", "D. A is incorrect but R is correct."],
  arPlacement: "under each Assertion-Reason question",
  arAnswered: "answered from the four options printed below it",
  designNote: "many questions set a real situation, a table of data or a map for the student to interpret, apply a concept to, or analyse, rather than only recall.",
  foundational: "geographical terms, concepts, data, places and schemes from the textbooks",
  constructed: [
    "Source-based (3 Marks): a map, picture, graph or passage with three parts marked 1, ½+½ and 1.",
    "Short Answer (3 Marks, 80-100 words): explain a concept, or apply it to a situation.",
    "Long Answer (5 Marks, 120-150 words): explain, classify, distinguish, examine or suggest measures, with examples."
  ],
  sourcing: "Source questions from the NCERT textbooks (their text, tables, maps and figures), CBSE's sample and practice papers and past board papers.",
  typology: {
    sa: "Answer in **80-100 words**: explain a concept (\"Explain the concept of ... as introduced by ...\"), analyse a statement, or apply a concept to a situation (\"Which type ... should the company choose, and why?\"); marks may split 1+2.",
    laHeading: "3-Mark Source-Based, 5-Mark Long Answer and 5-Mark Map Questions",
    la: [
      "Source-based (3 marks, Section B): one on a map, picture or graph (\"Study the map given below carefully and answer the following questions\"), one on a titled passage from the NCERT textbook; three parts (18.1, 18.2, 18.3 in the full paper, or I, II, III) marked 1, ½+½ and 1.",
      "Long answer (5 marks, 120-150 words): \"Classify ... and illustrate each with examples\", \"Explain any five factors ...\", \"Distinguish between ... mentioning any five points\", \"Examine the role of ...\", \"Suggest suitable measures ...\"; internal choice (A) OR (B) in four of the five.",
      "Map questions (5 marks each): seven features lettered A to G, of which the student answers any five; each map question is followed by words-only questions for visually impaired candidates in lieu of it."
    ]
  },
  rigor: "Formulate questions whose answers are distinct value points: accurate terms, places, data and examples from the NCERT text, one point per mark.",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q30 continuously across Sections A to E, in the order of the rows above (a row \"Q1-Q17\" is seventeen separate questions). Source-based parts are numbered 18.1, 18.2, 18.3 (or I, II, III); map features are lettered A to G. An internal choice sits under one number as (A) OR (B)."
};

const geoMapList12 = {
  world: "Fundamentals of Human Geography (identification on an outline political map of the world): areas of subsistence gathering, nomadic herding, commercial livestock rearing, extensive commercial grain farming and mixed farming; terminal stations of the Trans-Siberian, Trans-Canadian and Trans-Australian railways; major seaports - North Cape, London, Hamburg, Vancouver, San Francisco, New Orleans, Rio de Janeiro, Colon, Valparaiso, Suez, Cape Town, Yokohama, Shanghai, Hong Kong, Aden, Karachi, Kolkata, Perth, Sydney, Melbourne; major airports - Tokyo, Beijing, Mumbai, Jeddah, Aden, Johannesburg, Nairobi, Moscow, London, Paris, Berlin, Rome, Chicago, New Orleans, Mexico City, Buenos Aires, Santiago, Darwin, Wellington; inland waterways - Suez Canal, Panama Canal, Rhine waterway, St. Lawrence Seaway.",
  india: "India - People and Economy (locating and labelling on an outline political map of India): the States with the highest and the lowest population density (2011); leading producing States of rice, wheat, cotton, jute, sugarcane, tea and coffee; iron-ore mines - Mayurbhanj, Bailadila, Ratnagiri, Bellary; manganese - Balaghat, Shimoga; copper - Hazaribagh, Singhbhum, Khetri; bauxite - Katni, Bilaspur, Koraput; coal - Jharia, Bokaro, Raniganj, Neyveli; oil refineries - Mathura, Jamnagar, Barauni; seaports - Kandla, Mumbai, Marmagao, Kochi, Mangalore, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia; international airports - Ahmedabad, Mumbai, Bengaluru, Chennai, Kolkata, Guwahati, Delhi, Amritsar, Thiruvananthapuram, Hyderabad."
};

const geoMapList11 = {
  world: "Fundamentals of Physical Geography (locating and labelling on an outline political map of the world): the continents; the Indian, Pacific, Atlantic, Arctic and Southern Oceans; major and minor lithospheric plates, the Ring of Fire, the Mid-Atlantic Ridge; hot deserts - Mojave, Patagonian, Sahara, Gobi, Thar, Great Victoria; seas - Black, Baltic, Caspian, Mediterranean, North, Red, and the Bay of Fundy; cold currents - Humboldt, California, Falkland, Canaries, West Australian, Oyashio, Labrador; warm currents - Alaska, Brazilian, Agulhas, Kuroshio, Gulf Stream.",
  india: "India - Physical Environment (locating and labelling on an outline political map of India): the latitudinal and longitudinal extent, the Standard Meridian, the Tropic of Cancer, Kanniyakumari; the Karakoram, Garo-Khasi-Jaintia, Aravalli, Vindhya and Satpura ranges, the Western and Eastern Ghats; peaks - K2, Kanchenjunga, Nanda Devi, Nanga Parbat, Namcha Barwa, Anaimudi; passes - Shipki La, Nathu La, Palghat, Bhor Ghat, Thal Ghat; the Malwa, Chhotanagpur, Meghalaya and Deccan plateaus; the Saurashtra, Konkan, North and South Kanara, Malabar, Coromandel and Northern Circars coasts; the Andaman and Nicobar and Lakshadweep islands; rivers - Brahmaputra, Indus, Satluj, Ganga, Yamuna, Chambal, Damodar, Mahanadi, Krishna, Kaveri, Godavari, Narmada, Tapti, Luni; lakes (identification) - Wular, Sambhar, Chilika, Kolleru, Pulicat, Vembanad; the Palk Strait, Rann of Kachchh, Gulf of Kachchh, Gulf of Mannar, Gulf of Khambhat; the areas of highest and lowest temperature and rainfall; forest types (identification) - tropical evergreen, tropical deciduous, tropical thorn, montane, littoral/swamp; national parks - Corbett, Kaziranga, Ranthambore, Shivpuri, Simlipal; bird sanctuaries - Keoladeo Ghana, Ranganathittu; wildlife sanctuaries - Periyar, Rajaji, Mudumalai, Dachigam."
};

const geoDiagramRules = (worldNote) => `
    *   **Maps:** where the paper has a map question, print the outline map it uses at the end of the paper, headed with the question's number ("Map for Q. 29" / "Map for Q. 30" in the full paper). ${worldNote}
    *   **Maps, graphs and pictures in other questions:** draw a simple map, bar or line graph, or describe a picture in a caption inside a bordered box, with its source; add a words-only alternative for visually impaired candidates.`;

// Class 11 and 12 Physical Education (048), from the CBSE 2026-27 curriculum
// document (PhysicalEducation_SecP2_2026-27) and the Class XII 2026-27 sample
// paper (design unchanged). The theory paper is 70 marks (practical 30): 37
// questions in Sections A-E - 18 MCQs, 6 questions of 2 marks (attempt any
// 5), 6 of 3 marks (attempt any 5), 3 case studies of 4 marks and 4 of 5
// marks (attempt any 3). The paper prints 80 marks; CBSE's Class XII unit
// weightages add up to those 80 (`printedMarks`), counting the "b*"
// concept-based marks (tactile diagrams, data interpretation, case studies
// for visually impaired candidates). CBSE gives no competency split.
const peQuestions = [
  { section: "Section A", q: "Q1-Q18", type: "Multiple choice questions", count: 18, each: 1, marks: 18, detail: "direct, fill in the blank, match the following, Assertion-Reason (2 in the sample paper) and picture-based (identify the asana, with a words-only alternative for visually impaired candidates); all compulsory" },
  { section: "Section B", q: "Q19-Q24", type: "Very short answer (60-90 words)", count: 6, each: 2, marks: 10, attempt: 5, of: 6, detail: "define and explain, or state two points (marked 2 or 1+1)" },
  { section: "Section C", q: "Q25-Q30", type: "Short answer (100-150 words)", count: 6, each: 3, marks: 15, attempt: 5, of: 6, detail: "define and explain, list three points, or discuss with an example (marked 1+2, 2+1 or 1+1+1)" },
  { section: "Section D", q: "Q31-Q33", type: "Case studies", count: 3, each: 4, marks: 12, detail: "each a fixture, picture, table or short passage with four 1-mark parts (MCQs or one-line answers), with an internal choice (OR) in one part; a separate case in words only for visually impaired candidates in lieu of any case that uses a picture or fixture" },
  { section: "Section E", q: "Q34-Q37", type: "Long answer (200-300 words)", count: 4, each: 5, marks: 15, attempt: 3, of: 4, detail: "explain with sub-parts (marked 2+1+2, 1+4, 2+3), including drawing a stick diagram of an asana or a labelled diagram, or describing the procedure of a test" }
];

const peGeneralInstructions = [
  "The question paper consists of 5 sections and 37 Questions.",
  "Section A consists of question 1-18 carrying 1 mark each and is multiple choice questions. All questions are compulsory.",
  "Section B consists of questions 19-24 carrying 2 marks each and are very short answer types and should not exceed 60-90 words. Attempt any 5.",
  "Section C consists of Question 25-30 carrying 3 marks each and are short answer types and should not exceed 100-150 words. Attempt any 5.",
  "Section D consists of Question 31-33 carrying 4 marks each and are case studies. There is an internal choice available.",
  "Section E consists of Question 34-37 carrying 5 marks each and are long answer types and should not exceed 200-300 words. Attempt any 3."
];

// Short tests keep the paper's 1 / 2 / 3 / 4 / 5 mark types.
const peShortTests = {
  unit: [
    { name: "Section A", type: "Multiple choice questions (including match the following and Assertion-Reason)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Compulsory" },
    { name: "Section B", type: "Very short answer (60-90 words)", count: 2, unitMark: 2, marksPerQ: "2 Marks", total: 4, choice: "Internal choice in 1 Q" },
    { name: "Section C", type: "Short answer (100-150 words)", count: 1, unitMark: 3, marksPerQ: "3 Marks", total: 3, choice: "Internal choice" },
    { name: "Section D", type: "Case study", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Internal choice in one part" },
    { name: "Section E", type: "Long answer (200-300 words)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Internal choice" }
  ],
  periodic: [
    { name: "Section A", type: "Multiple choice questions (including match the following and Assertion-Reason)", count: 7, unitMark: 1, marksPerQ: "1 Mark", total: 7, choice: "Compulsory" },
    { name: "Section B", type: "Very short answer (60-90 words)", count: 3, unitMark: 2, marksPerQ: "2 Marks", total: 6, choice: "Internal choice in 1 Q" },
    { name: "Section C", type: "Short answer (100-150 words)", count: 3, unitMark: 3, marksPerQ: "3 Marks", total: 9, choice: "Internal choice in 1 Q" },
    { name: "Section D", type: "Case studies", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in one part of each" },
    { name: "Section E", type: "Long answer (200-300 words)", count: 2, unitMark: 5, marksPerQ: "5 Marks", total: 10, choice: "Internal choice in 1 Q" }
  ]
};

const peFormats = {
  fullMarks: 70,
  printedMarks: 80,
  markLadder: [1, 2, 3, 4, 5],
  letteredSections: true,
  shortTests: peShortTests,
  shortCaseDetail: "a fixture, picture, table or short passage with four 1-mark parts, with an internal choice (OR) in one part; a words-only version for visually impaired candidates if it uses a picture or fixture",
  design: null,
  designText: "CBSE gives no competency split for Physical Education. Follow the sample paper: 18 MCQs of recall and understanding; short answers that define, explain and apply; case studies that ask the student to read a fixture, picture, table or passage; and long answers that explain, draw a stick diagram or describe a test procedure. Set about half the marks on applying and interpreting (situations, fixtures, data, pictures).",
  questions: peQuestions,
  generalInstructions: peGeneralInstructions,
  arOptions: ["(a) Both (A) and (R) are true and (R) is the correct explanation of (A).", "(b) Both (A) and (R) are true, but (R) is not the correct explanation of (A).", "(c) (A) is true, but (R) is false.", "(d) (A) is false, but (R) is true."],
  arPlacement: "under each Assertion-Reason question, after \"In context of the above two statements, which one of the following is correct?\"",
  arAnswered: "answered from the four options printed below it",
  foundational: "terms, definitions, test items, asanas, formulas, nutrients and the people and bodies associated with sport",
  constructed: [
    "Very Short Answer (2 Marks, 60-90 words): define and explain, or give two points.",
    "Short Answer (3 Marks, 100-150 words): define and explain, list three points, or discuss with an example.",
    "Long Answer (5 Marks, 200-300 words): explain with sub-parts, draw a stick diagram of an asana, or describe a test procedure."
  ],
  sourcing: "Source questions from CBSE's Physical Education curriculum and its sample and practice papers, past board papers and the CBSE-recommended textbooks.",
  typology: {
    vsa: "Answer in **60-90 words**: define and explain (\"What is PRICE?\"), or give two points (\"Suggest any two isometric exercises for the shoulder region\"); marked 2 or 1+1. Print 6 and let the student attempt any 5 (\"Attempt any 5\").",
    sa: "Answer in **100-150 words**: define and explain (\"What is Scoliosis? What are the causes of Scoliosis?\"), list three points, or discuss with an example; marked 1+2, 2+1 or 1+1+1. Print 6; the student attempts any 5.",
    laHeading: "4-Mark Case Studies and 5-Mark Long Answer Questions",
    la: [
      "Case studies (4 marks): a knockout or league fixture, a picture, a table or a short passage, followed by four 1-mark parts (MCQs or one-line answers, such as the number of byes or matches), with an internal choice (OR) in one part. Where the case uses a picture or fixture, print a separate case in words \"(For Visually Impaired Candidates Only)\".",
      "Long answers (5 marks, 200-300 words): explain with sub-parts (\"What is Diabetes and its types. Draw stick diagram of Gomukhasana and mention its benefits\", 2+1+2), describe the procedure of a test item, or explain a concept with its types (1+4, 2+3). Print 4; the student attempts any 3."
    ]
  },
  rigor: "Formulate questions whose answers are distinct value points: accurate terms, test items and procedures, formulas (number of matches and byes), asanas with their benefits and contraindications, and one point per mark.",
  instructionsNote: "",
  mandatesTitle: null,
  mandates: [],
  numberingNote: "Number the questions Q1 to Q37 continuously across Sections A to E, in the order of the rows above (a row \"Q1-Q18\" is eighteen separate questions). Case-study parts are numbered (i) to (iv) or (a) to (d). Print \"Attempt any 5\" under the Section B and C headings and \"Attempt any 3\" under Section E.",
  figureQuota: "Set **1 knockout or league fixture** (a case study), **1 or 2 pictures** (an asana to identify in Section A, a picture-based case study), each with a words-only alternative for visually impaired candidates",
  diagramRules: `
    *   **Fixtures:** draw knockout fixtures as a clean bracket (teams numbered, byes shown) and league fixtures as a table or cyclic arrangement.
    *   **Asanas and pictures:** describe the asana or picture in a caption inside a bordered box, or draw a simple stick figure; never print the stick diagram a question asks the student to draw.`
};

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
  },
  "Class 12 || Business Studies": {
    code: "054",
    paperLabel: "Business Studies (054)",
    ...bstFormats,
    scope: bstScope12,
    units: [
      { name: "Nature and Significance, Principles of Management, Business Environment", marks: 16, chapters: ["Nature and Significance of Management", "Principles of Management", "Business Environment"] },
      { name: "Planning and Organising", marks: 14, chapters: ["Planning", "Organising"] },
      { name: "Staffing, Directing and Controlling", marks: 20, chapters: ["Staffing", "Directing", "Controlling"] },
      { name: "Financial Management and Financial Markets", marks: 15, chapters: ["Financial Management", "Financial Markets"] },
      { name: "Marketing Management and Consumer Protection", marks: 15, chapters: ["Marketing Management", "Consumer Protection"] }
    ]
  },
  "Class 11 || Business Studies": {
    code: "054",
    paperLabel: "Business Studies (054), Class XI",
    ...bstFormats,
    scope: bstScope11,
    units: [
      { name: "Nature and Purpose of Business, Forms of Business Organisations", marks: 16, chapters: ["Business, Trade and Commerce", "Forms of Business"] },
      { name: "Public, Private and Global Enterprises, Business Services", marks: 14, chapters: ["Private, Public and Global", "Business Services"] },
      { name: "Emerging Modes of Business, Social Responsibility and Business Ethics", marks: 10, chapters: ["Emerging Modes", "Social Responsibilit"] },
      { name: "Sources of Business Finance, Small Business", marks: 20, chapters: ["Sources of Business Finance", "Small Business"] },
      { name: "Internal Trade, International Business", marks: 20, chapters: ["Internal Trade", "International Business"] }
    ]
  },
  "Class 12 || Economics": {
    code: "030",
    paperLabel: "Economics (030)",
    ...ecoFormats,
    questions: ecoQuestions("Macroeconomics", "Indian Economic Development"),
    generalInstructions: ecoGeneralInstructions("Macroeconomics", "Indian Economic Development"),
    misconceptions: "GDP vs GNP and market price vs factor cost, stock vs flow, APC vs MPC, revenue vs capital receipts, fiscal vs primary deficit, current vs capital account, the goals of planning, the features of the LPG reforms",
    sourcing: "Source questions from the NCERT Introductory Macroeconomics and Indian Economic Development textbooks, CBSE's sample and practice papers and past board papers; use current Indian data and schemes where they fit (budgets, RBI rates, UPI, Bharatmala).",
    scope: [
      "Macroeconomics: circular flow (two-sector model), national income by the three methods, money creation, the RBI's credit control tools, AD and multiplier, excess and deficient demand, the government budget and deficits, balance of payments and exchange rate systems.",
      "Indian Economic Development: development experience 1947-90 and reforms since 1991 (LPG, with the concepts of demonetisation and GST); human capital formation; rural development (credit, marketing, cooperatives, diversification, organic farming); employment; sustainable development; India compared with Pakistan and China. No poverty or infrastructure questions.",
      "Content marked excluded for 2026-27 in the NCERT textbooks is not assessed."
    ],
    requirements: [
      "**Two sections:** Section A - Macroeconomics (Q1-Q17, 40 marks) and Section B - Indian Economic Development (Q18-Q34, 40 marks), each with its heading.",
      "**Word limits:** printed in the general instructions (3 marks: 60-80 words, 4 marks: 80-100 words, 6 marks: 100-150 words).",
      "**Internal choice:** exactly 6 questions, as the sample paper places them - Q11 and Q29 (3 marks), Q13 and Q32 (4 marks), Q17 and Q33 (6 marks) - each printed as A OR B under one number.",
      "**Visual inputs:** cartoons, images, graphs and data tables as the sample paper uses them; directly below every question with a visual input, add \"Note: The following question is for the Visually Impaired Candidates only, in lieu of Q. __\" and a words-only question with the same marks."
    ],
    units: [
      { name: "National Income and Related Aggregates", marks: 10, chapters: ["Introduction to Macroeconomics", "National Income"] },
      { name: "Money and Banking", marks: 6, chapters: ["Money and Banking"] },
      { name: "Determination of Income and Employment", marks: 12, chapters: ["Determination of Income", "Excess Demand"] },
      { name: "Government Budget and the Economy", marks: 6, chapters: ["Government Budget"] },
      { name: "Balance of Payments", marks: 6, chapters: ["Balance of Payments"] },
      { name: "Development Experience (1947-90) and Economic Reforms since 1991", marks: 12, chapters: ["Eve of Independence", "1950-1990", "Economic Reforms"] },
      { name: "Current Challenges facing the Indian Economy", marks: 20, chapters: ["Human Capital", "Rural Development", "Employment:", "Sustainable"] },
      { name: "Development Experience of India: a Comparison with Neighbours", marks: 8, chapters: ["Neighbours"] }
    ]
  },
  "Class 11 || Economics": {
    code: "030",
    paperLabel: "Economics (030), Class XI",
    ...ecoFormats,
    questions: ecoQuestions("Statistics for Economics", "Introductory Microeconomics"),
    generalInstructions: ecoGeneralInstructions("Statistics for Economics", "Introductory Microeconomics"),
    misconceptions: "primary vs secondary data, exclusive vs inclusive class intervals, mean vs median for skewed data, positive vs negative correlation, movement along vs shift of a curve, returns to a factor vs returns to scale, average vs marginal cost",
    sourcing: "Source questions from the NCERT Statistics for Economics and Introductory Microeconomics textbooks, CBSE's practice papers and past papers, set on the Class XII sample paper layout; statistics questions use small, realistic Indian data sets.",
    scope: [
      "Statistics: collection, organisation and presentation of data (bar and pie diagrams, histogram, polygon, ogive, time-series graph); mean, median and mode; correlation by Karl Pearson's method (two variables, ungrouped) and Spearman's rank method (non-repeated and repeated ranks); index numbers (WPI, CPI, IIP, simple aggregative method). No measures of dispersion.",
      "Microeconomics: consumer's equilibrium by utility and indifference-curve analysis, demand and its elasticity (percentage and total expenditure methods), production, costs, revenue, producer's equilibrium, supply and its elasticity, perfect competition in the short run only, price ceiling and price floor.",
      "Statistical numericals give the student the data and ask for the interpretation of the result as well as the working."
    ],
    requirements: [
      "**Two sections:** Section A - Statistics for Economics (Q1-Q17, 40 marks) and Section B - Introductory Microeconomics (Q18-Q34, 40 marks), each with its heading.",
      "**Word limits:** printed in the general instructions (3 marks: 60-80 words, 4 marks: 80-100 words, 6 marks: 100-150 words).",
      "**Internal choice:** exactly 6 questions - Q11 and Q29 (3 marks), Q13 and Q32 (4 marks), Q17 and Q33 (6 marks) - each printed as A OR B under one number.",
      "**Visual inputs:** graphs, diagrams and data tables; directly below every question with a picture or graph input, add a words-only alternative for visually impaired candidates with the same marks."
    ],
    units: [
      { name: "Introduction; Collection, Organisation and Presentation of Data", marks: 15, chapters: ["Introduction to Statistics", "Collection of Data", "Organisation of Data", "Presentation of Data"] },
      { name: "Statistical Tools and Interpretation", marks: 25, chapters: ["Central Tendency", "Correlation", "Index Numbers"] },
      { name: "Introduction to Microeconomics", marks: 4, chapters: ["Introduction to Microeconomics"] },
      { name: "Consumer's Equilibrium and Demand", marks: 14, chapters: ["Consumer's Equilibrium", "Theory of Demand"] },
      { name: "Producer Behaviour and Supply", marks: 14, chapters: ["Production Function", "Cost and Revenue", "Producer's Equilibrium", "Theory of Supply"] },
      { name: "Perfect Competition: Price Determination and Simple Applications", marks: 8, chapters: ["Forms of Market"] }
    ]
  },
  "Class 12 || History": {
    code: "027",
    paperLabel: "History (027)",
    ...historyFormats,
    questions: historyQuestions({ mcq: "7 from each of the three books", sa: "2 from each book", la: "one from each book", source: "one from each book" }),
    misconceptions: "the sequence of Harappan sites and features, Mahajanapadas vs later kingdoms, Bhakti vs Sufi traditions, zamindars vs jagirdars, Permanent Settlement vs ryotwari, the phases and leaders of the national movement",
    scope: [
      "Class XII History is Themes in Indian History, Parts I, II and III (NCERT), 25 marks each, and 5 marks of map work. Each book gives 7 MCQs, 2 short answers, 1 long answer and 1 source-based question; with fewer books selected, share the questions equally among them.",
      "Map items come ONLY from CBSE's 2026-27 list for the selected themes:\n        " + historyMapList12.replace(/\n/g, '\n        '),
      "Content marked excluded for 2026-27 in the NCERT textbooks is not assessed."
    ],
    requirements: [
      "**Book spread:** Section A has 7 MCQs from each book (Part I, II, III), Section B 2 short answers from each, Section C one long answer and Section D one source from each book, in book order.",
      "**Map question (Section E):** 34.1 asks the student to locate and label three places from the list in the scope limits (one of them with an internal choice, printed as OR); 34.2 marks two places A and B for the student to identify. Print \"Attach the Map with the answer-book\" and, directly below, the words-only questions \"for the Candidates with Visual Impairment only, in lieu of Q. 34\".",
      "**Internal choice:** 2 questions in Section B, all 3 in Section C and one item of the map question; none in Sections A and D."
    ],
    units: [
      { name: "Themes in Indian History Part I (Themes 1-4)", marks: 25, chapters: ["Theme 1:", "Theme 2:", "Theme 3:", "Theme 4:"] },
      { name: "Themes in Indian History Part II (Themes 5-8)", marks: 25, chapters: ["Theme 5:", "Theme 6:", "Theme 7:", "Theme 8:"] },
      { name: "Themes in Indian History Part III (Themes 9-12)", marks: 25, chapters: ["Theme 9:", "Theme 10:", "Theme 11:", "Theme 12:"] }
    ]
  },
  "Class 11 || History": {
    code: "027",
    paperLabel: "History (027), Class XI",
    ...historyFormats,
    questions: historyQuestions({ mcq: "spread across the sections of Themes in World History as CBSE's Class XI design sets them (3 from Early Societies, 4 from Empires, 6 from Changing Traditions, 8 from Towards Modernisation)", sa: "1 from Early Societies, 2 from Changing Traditions and 3 from Towards Modernisation", la: "2 from Empires and 1 from Towards Modernisation", source: "1 from Early Societies and 2 from Changing Traditions", map: "an outline map of the world or of the region the selected themes cover" }),
    misconceptions: "the chronology of the timelines, Mesopotamian writing vs city life, the Roman Republic vs Empire, the three orders of feudal society, Renaissance humanism, the modernisation of Japan vs China",
    scope: [
      "Class XI History is Themes in World History (NCERT): Theme 1 Writing and City Life, Theme 2 An Empire Across Three Continents, Theme 3 Nomadic Empires, Theme 4 The Three Orders, Theme 5 Changing Cultural Traditions, Theme 6 Displacing Indigenous Peoples, Theme 7 Paths to Modernisation, with 5 marks of map work.",
      "Map items come from the map work of the selected themes (for example Mesopotamian cities, the extent of the Roman Empire, the Mongol Empire, the Americas and Australia, Japan and China), on an outline map of the world or of the region the theme covers.",
      "Content marked excluded for 2026-27 in the NCERT textbook is not assessed."
    ],
    requirements: [
      "**Theme spread:** follow CBSE's Class XI design - Early Societies (Theme 1) 10 marks: 3 MCQs, 1 short answer, 1 source; Empires (Themes 2-3) 20 marks: 4 MCQs, 2 long answers; Changing Traditions (Themes 4-5) 20 marks: 6 MCQs, 2 short answers, 2 sources; Towards Modernisation (Themes 6-7) 25 marks: 8 MCQs, 3 short answers, 1 long answer; map 5 marks. With fewer themes selected, share the questions among them.",
      "**Map question (Section E):** locate and label three places (one with an internal choice) and identify two marked A and B, on an outline map of the world or region, with a words-only alternative for visually impaired candidates.",
      "**Internal choice:** 2 questions in Section B, all 3 in Section C and one item of the map question; none in Sections A and D."
    ],
    figureQuota: "Set **1 outline map** (of the world or the region the selected themes cover) for the map question, and **1 or 2 picture-based MCQs**, each with a words-only alternative for visually impaired candidates",
    diagramRules: `
    *   **History Map:** where the paper has a map question, print an outline map of the world or of the region the question covers at the end of the paper, headed with the map question's number ("Map for Q. 34" in the full paper). Mark ONLY the two places the student identifies (A and B); the places the student locates and labels are left unmarked.
    *   **Pictures:** where an MCQ uses a picture from the NCERT textbook, describe it in a caption inside a bordered box (no photographs), with its source.`,
    units: [
      { name: "Theme 1: Writing and City Life", marks: 10, chapters: ["Theme 1:"] },
      { name: "Theme 2: An Empire Across Three Continents", marks: 10, chapters: ["Theme 2:"] },
      { name: "Theme 3: Nomadic Empires", marks: 10, chapters: ["Theme 3:"] },
      { name: "Theme 4: The Three Orders", marks: 10, chapters: ["Theme 4:"] },
      { name: "Theme 5: Changing Cultural Traditions", marks: 10, chapters: ["Theme 5:"] },
      { name: "Theme 6: Displacing Indigenous Peoples", marks: 10, chapters: ["Theme 6:"] },
      { name: "Theme 7: Paths to Modernisation", marks: 15, chapters: ["Theme 7:"] }
    ]
  },
  "Class 12 || Political Science": {
    code: "028",
    paperLabel: "Political Science (028)",
    ...polSciFormats,
    questions: polSciQuestions({
      mcq: "6 from each book",
      sa2: "3 from each book",
      sa4: "3 from Contemporary World Politics and 2 from Politics in India Since Independence",
      dType: "Picture, passage and map-based questions",
      d: "1 from Contemporary World Politics and 2 from Politics in India Since Independence; in the sample paper Q24 is a cartoon, Q25 a passage and Q26 a map of India with four States marked (A) to (D) to be identified from clues. The map always comes from Politics in India Since Independence; the cartoon and passage may come from either book",
      la: "2 from each book"
    }),
    misconceptions: "the SAARC and ASEAN members and dates, UN bodies vs other international organisations (WTO, IMF, World Bank), traditional vs non-traditional security, the Planning Commission vs NITI Aayog, the Congress split of 1969 (Congress (O) vs Congress (R)), the order of general elections and coalition governments after 1989",
    scope: [
      "Class XII Political Science is Contemporary World Politics (Part A, 40 marks) and Politics in India Since Independence (Part B, 40 marks) (NCERT). Each book gives 6 MCQs, 3 short answers of 2 marks and 2 long answers; Contemporary World Politics gives 3 short answers of 4 marks and 1 Section D question, Politics in India 2 short answers of 4 marks and 2 Section D questions (the map among them).",
      "The map question uses an outline political map of India and asks for States, princely states or places from the selected Politics in India chapters (the reorganisation of States, the integration of princely states, election results, regional movements).",
      "The additional reference material in CBSE's annexure is for classroom teaching and is not assessed. Content marked excluded for 2026-27 in the NCERT textbooks is not assessed."
    ],
    requirements: [
      "**Book spread:** Contemporary World Politics - 6 MCQs, 3 questions of 2 marks, 3 of 4 marks, 1 in Section D, 2 long answers (40 marks); Politics in India Since Independence - 6 MCQs, 3 of 2 marks, 2 of 4 marks, 2 in Section D, 2 long answers (40 marks). With only one book selected, all questions come from it.",
      "**Section D:** Q24 a cartoon or picture with the NCERT source line, Q25 a passage with its source line, Q26 an outline political map of India with four places marked (A) to (D), each identified from a clue (i) to (iv), answered in a table (serial number of the clue, alphabet, name). Print words-only alternatives \"for the Candidates with Visual Impairment only, in lieu of\" Q24 and Q26.",
      "**Internal choice:** 2 of the 4-mark questions in Section C and all 4 long answers in Section E; none in Sections A, B and D."
    ],
    figureQuota: "Set **1 cartoon or picture** (Q24, described in a caption box) and **1 outline political map of India** (Q26, four places marked (A) to (D)), each with a words-only alternative for visually impaired candidates",
    diagramRules: `
    *   **Map:** where the paper has a map question, print an outline political map of India with the four places marked (A) to (D) and NOT named, headed "Map for Q. 26" in the full paper, followed by the answer table (Serial number of the information used / Concerned alphabet given in the map / Name of the State).
    *   **Cartoons and pictures:** describe the NCERT cartoon or picture in a caption inside a bordered box (no photographs), with its source line.`,
    units: [
      { name: "The End of Bipolarity", marks: 6, chapters: ["End of Bipolarity"] },
      { name: "Contemporary Centres of Power", marks: 6, chapters: ["Contemporary Centres of Power"] },
      { name: "Contemporary South Asia", marks: 6, chapters: ["Contemporary South Asia"] },
      { name: "International Organisations", marks: 6, chapters: ["International Organisations"] },
      { name: "Security in the Contemporary World", marks: 6, chapters: ["Security in the Contemporary World"] },
      { name: "Environment and Natural Resources", marks: 6, chapters: ["Environment and Natural Resources"] },
      { name: "Globalisation", marks: 4, chapters: ["Globalisation"] },
      { name: "Challenges of Nation-Building", marks: 6, chapters: ["Nation-Building"] },
      { name: "Era of One-Party Dominance", marks: 4, chapters: ["One-Party Dominance"] },
      { name: "Politics of Planned Development", marks: 2, chapters: ["Planned Development"] },
      { name: "India's External Relations", marks: 6, chapters: ["External Relations"] },
      { name: "Challenges to and Restoration of the Congress System", marks: 4, chapters: ["Restoration of the Congress System"] },
      { name: "The Crisis of Democratic Order", marks: 4, chapters: ["Crisis of Democratic Order"] },
      { name: "Regional Aspirations", marks: 6, chapters: ["Regional Aspirations"] },
      { name: "Recent Developments in Indian Politics", marks: 8, chapters: ["Recent Developments in Indian Politics"] }
    ]
  },
  "Class 11 || Political Science": {
    code: "028",
    paperLabel: "Political Science (028), Class XI",
    ...polSciFormats,
    questions: polSciQuestions({
      mcq: "6 from each book",
      sa2: "3 from each book",
      sa4: "3 from Indian Constitution at Work and 2 from Political Theory",
      dType: "Picture/cartoon and passage-based questions",
      d: "1 from Indian Constitution at Work and 2 from Political Theory: a cartoon or picture from the NCERT textbook and passages with their source lines",
      la: "2 from each book"
    }),
    misconceptions: "fundamental rights vs directive principles, the powers of the President vs the Prime Minister, Lok Sabha vs Rajya Sabha, original vs appellate jurisdiction, the 73rd vs 74th amendments, negative vs positive liberty, formal equality vs equality of opportunity, the Indian vs Western model of secularism",
    scope: [
      "Class XI Political Science is Indian Constitution at Work (Part A, 40 marks) and Political Theory (Part B, 40 marks) (NCERT). The paper follows the Class XII sample paper's layout: each book gives 6 MCQs, 3 short answers of 2 marks and 2 long answers; Indian Constitution at Work gives 3 short answers of 4 marks and 1 Section D question, Political Theory 2 and 2.",
      "Section D uses cartoons, pictures and passages from the NCERT textbooks; CBSE sets map questions only from the Class XII book Politics in India Since Independence.",
      "The additional reference material in CBSE's annexure is for classroom teaching and is not assessed. Content marked excluded for 2026-27 in the NCERT textbooks is not assessed."
    ],
    requirements: [
      "**Book spread:** Indian Constitution at Work - 6 MCQs, 3 questions of 2 marks, 3 of 4 marks, 1 in Section D, 2 long answers (40 marks); Political Theory - 6 MCQs, 3 of 2 marks, 2 of 4 marks, 2 in Section D, 2 long answers (40 marks). With only one book selected, all questions come from it.",
      "**Section D:** a cartoon or picture with the NCERT source line and passages with their source lines, each with four parts of 1 mark; a picture question is followed by words-only questions \"for the Candidates with Visual Impairment only, in lieu of\" it.",
      "**Internal choice:** 2 of the 4-mark questions in Section C and all 4 long answers in Section E; none in Sections A, B and D."
    ],
    figureQuota: "Set **1 cartoon or picture** from the NCERT textbook (described in a caption box) in Section D, with a words-only alternative for visually impaired candidates",
    diagramRules: `
    *   **Cartoons and pictures:** describe the NCERT cartoon or picture in a caption inside a bordered box (no photographs), with its source line.`,
    units: [
      { name: "Constitution: Why and How? and Rights in the Indian Constitution", marks: 8, chapters: ["Constitution: Why and How", "Rights in the Indian Constitution"] },
      { name: "Election and Representation", marks: 6, chapters: ["Election and Representation"] },
      { name: "Executive, Legislature and Judiciary", marks: 12, chapters: ["Executive", "Legislature", "Judiciary"] },
      { name: "Federalism", marks: 6, chapters: ["Federalism"] },
      { name: "Local Governments", marks: 4, chapters: ["Local Governments"] },
      { name: "Constitution as a Living Document and The Philosophy of the Constitution", marks: 4, chapters: ["Constitution as a Living Document", "Philosophy of the Constitution"] },
      { name: "Political Theory: An Introduction", marks: 4, chapters: ["Political Theory: An Introduction"] },
      { name: "Freedom and Equality", marks: 12, chapters: ["Freedom", "Equality"] },
      { name: "Social Justice", marks: 6, chapters: ["Social Justice"] },
      { name: "Rights", marks: 4, chapters: ["Rights"] },
      { name: "Citizenship and Nationalism", marks: 8, chapters: ["Citizenship", "Nationalism"] },
      { name: "Secularism", marks: 6, chapters: ["Secularism"] }
    ]
  },
  "Class 12 || Geography": {
    code: "029",
    paperLabel: "Geography (029)",
    ...geoFormats,
    questions: geoQuestions({
      mcq: "from both books in proportion to their unit marks",
      map: "Q29: seven features marked A to G on an outline political map of the world, from the Fundamentals of Human Geography map list, to be identified from clues; Q30: seven features from the India - People and Economy map list to be located and labelled with appropriate symbols on an outline political map of India"
    }),
    misconceptions: "population density vs growth rate, Environmental Determinism vs Possibilism vs Neo-Determinism, intensive subsistence vs extensive commercial farming, BPO vs KPO, footloose vs raw-material-oriented industries, balance of trade vs balance of payments, INSAT vs IRS satellites, the National Waterways and their stretches",
    scope: [
      "Class XII Geography theory (70 marks) is Fundamentals of Human Geography (30 marks and a 5-mark world map question) and India - People and Economy (30 marks and a 5-mark India map question) (NCERT). The practical book is examined separately and is not part of this paper.",
      "Map items come ONLY from CBSE's 2026-27 map lists for the selected chapters:\n        " + geoMapList12.world + "\n        " + geoMapList12.india,
      "CBSE assesses these topics only formatively, so they are NOT set in this paper: population composition (sex composition, age structure, age-sex pyramid, rural-urban composition, literacy, occupational structure), the classification, types and patterns of rural and urban settlements and their problems, and migration (types, causes, consequences). Content marked excluded for 2026-27 in the NCERT textbooks is not assessed either."
    ],
    requirements: [
      "**Book spread:** Fundamentals of Human Geography and India - People and Economy carry 30 marks each across Sections A to D, in proportion to their unit marks, plus one map question each. With only one book selected, all questions come from it and both map questions use its map list.",
      "**Map questions (Section E):** Q29 marks seven features A to G on an outline political map of the world and gives a clue for each (\"A - An area of nomadic herding\"); the student identifies any five. Q30 lists seven features for the student to locate and label with appropriate symbols on an outline political map of India; any five. Each is followed by words-only questions \"for Visually Impaired Candidates only in lieu of\" it.",
      "**Internal choice:** one question in Section C and four in Section D; Section E by answering any five of seven; none in Sections A and B."
    ],
    figureQuota: "Set **2 outline maps** (the world for Q29 and India for Q30), **1 map, picture or graph** for source-based Q18, and **1 or 2 map, table or graph-based MCQs**, each visual item with a words-only alternative for visually impaired candidates",
    diagramRules: geoDiagramRules("On the world map mark ONLY the seven features A to G; the India map is left blank for the student to locate and label."),
    units: [
      { name: "Fundamentals of Human Geography: Unit I Human Geography", marks: 3, chapters: ["Human Geography: Nature and Scope"] },
      { name: "Fundamentals of Human Geography: Unit II People (World Population, Human Development)", marks: 8, chapters: ["World Population", "Human Development"] },
      { name: "Fundamentals of Human Geography: Unit III Human Activities (Chapters 4-8)", marks: 19, chapters: ["Primary Activities", "Secondary Activities", "Tertiary and Quaternary Activities", "Transport, Communication and Trade", "International Trade"] },
      { name: "India - People and Economy: Unit I Population", marks: 5, chapters: ["Growth and Composition"] },
      { name: "India - People and Economy: Unit II Human Settlements", marks: 3, chapters: ["Human Settlements"] },
      { name: "India - People and Economy: Unit III Resources and Development (Chapters 3-6)", marks: 10, chapters: ["Land Resources and Agriculture", "Water Resources", "Mineral and Energy Resources", "Planning and Sustainable Development"] },
      { name: "India - People and Economy: Unit IV Transport, Communication and International Trade", marks: 7, chapters: ["Transport and Communication (India)", "International Trade (India)"] },
      { name: "India - People and Economy: Unit V Geographical Perspective on Selected Issues and Problems", marks: 5, chapters: ["Geographical Perspective"] }
    ]
  },
  "Class 11 || Geography": {
    code: "029",
    paperLabel: "Geography (029), Class XI",
    ...geoFormats,
    questions: geoQuestions({
      mcq: "from both books in proportion to their unit marks",
      map: "Q29: seven features from the Fundamentals of Physical Geography map list on an outline political map of the world; Q30: seven features from the India - Physical Environment map list on an outline political map of India; the student locates and labels (or, where the list says so, identifies) any five"
    }),
    misconceptions: "endogenic vs exogenic processes, weathering vs erosion, the layers of the Earth's interior and of the atmosphere, conduction vs convection vs advection, relative vs absolute humidity, warm vs cold ocean currents, tides vs waves, the Himalayan vs peninsular rivers, the south-west vs north-east monsoon",
    scope: [
      "Class XI Geography theory (70 marks) is Fundamentals of Physical Geography (30 marks and a 5-mark world map question) and India - Physical Environment (30 marks and a 5-mark India map question) (NCERT), on the Class XII sample paper's layout. The practical book is examined separately and is not part of this paper.",
      "Map items come ONLY from CBSE's 2026-27 map lists for the selected chapters:\n        " + geoMapList11.world + "\n        " + geoMapList11.india,
      "CBSE tests World Climate and Climate Change, Biodiversity and Conservation, and Natural Hazards and Disasters only through internal assessment (projects and presentations), and Minerals and Rocks only formatively, so they are NOT set in this paper. Content marked excluded for 2026-27 in the NCERT textbooks is not assessed either."
    ],
    requirements: [
      "**Book spread:** Fundamentals of Physical Geography and India - Physical Environment carry 30 marks each across Sections A to D, in proportion to their unit marks, plus one map question each. With only one book selected, all questions come from it and both map questions use its map list.",
      "**Map questions (Section E):** each lists seven features lettered A to G from the map list, of which the student answers any five, on an outline political map of the world (Q29) and of India (Q30). Each is followed by words-only questions \"for Visually Impaired Candidates only in lieu of\" it.",
      "**Internal choice:** one question in Section C and four in Section D; Section E by answering any five of seven; none in Sections A and B."
    ],
    figureQuota: "Set **2 outline maps** (the world for Q29 and India for Q30), **1 map, diagram or graph** for source-based Q18, and **1 or 2 map, diagram or graph-based MCQs**, each visual item with a words-only alternative for visually impaired candidates",
    diagramRules: geoDiagramRules("Leave both maps blank for the student to locate and label, except any feature the list asks the student to identify, which is marked with its letter."),
    units: [
      { name: "Fundamentals of Physical Geography: Unit I Geography as a Discipline", marks: 3, chapters: ["Geography as a Discipline"] },
      { name: "Fundamentals of Physical Geography: Unit II The Earth (Chapters 2-4)", marks: 9, chapters: ["Origin and Evolution of the Earth", "Interior of the Earth", "Distribution of Oceans and Continents"] },
      { name: "Fundamentals of Physical Geography: Unit III Landforms (Chapters 5-6)", marks: 6, chapters: ["Geomorphic Processes", "Landforms and their Evolution"] },
      { name: "Fundamentals of Physical Geography: Unit IV Climate (Chapters 7-10)", marks: 8, chapters: ["Composition and Structure of Atmosphere", "Solar Radiation", "Atmospheric Circulation", "Water in the Atmosphere"] },
      { name: "Fundamentals of Physical Geography: Unit V Water (Oceans) (Chapters 12-13)", marks: 4, chapters: ["Water (Oceans)", "Movements of Ocean Water"] },
      { name: "India - Physical Environment: Unit I Introduction (India - Location)", marks: 5, chapters: ["India - Location"] },
      { name: "India - Physical Environment: Unit II Physiography (Chapters 2-3)", marks: 13, chapters: ["Structure and Physiography", "Drainage System"] },
      { name: "India - Physical Environment: Unit III Climate and Vegetation (Chapters 4-5)", marks: 12, chapters: ["Climate", "Natural Vegetation"] }
    ]
  },
  "Class 12 || Physical Education": {
    code: "048",
    paperLabel: "Physical Education (048)",
    ...peFormats,
    unitMarksTotal: 80,
    misconceptions: "knockout vs league fixtures and their formulas (N-1 matches, N(N-1)/2 matches, byes and their placement), kyphosis vs lordosis vs scoliosis, knock knees vs bow legs, sprain vs strain vs contusion, macro vs micro nutrients, water vs fat-soluble vitamins, isometric vs isotonic vs isokinetic exercises, introvert vs extrovert, intrinsic vs extrinsic motivation, the training cycles (micro, meso, macro)",
    scope: [
      "Class XII Physical Education theory (70 marks) is CBSE's ten units: Management of Sporting Events (5+4b), Children and Women in Sports (7), Yoga as Preventive Measure for Lifestyle Disease (6+1b), Physical Education and Sports for CWSN (4+4b), Sports and Nutrition (7), Test and Measurement in Sports (8), Physiology and Injuries in Sports (4+4b), Biomechanics and Sports (10), Psychology and Sports (7), Training in Sports (9). \"b\" marks are concept-based questions (tactile diagram, data interpretation, case study) for visually impaired candidates. The practical is examined separately.",
      "Content outside CBSE's 2026-27 unit-wise course content is not assessed."
    ],
    requirements: [
      "**Unit spread:** the unit marks in the syllabus section count every printed question, including those the student may leave out (80 printed marks, 70 attempted); keep each unit within ±2 marks of its figure.",
      "**Attempt any:** Section B prints 6 questions (attempt any 5), Section C 6 (any 5) and Section E 4 (any 3); Section D's three case studies each have an internal choice in one part; Section A is compulsory.",
      "**Visually impaired candidates:** print a words-only alternative, marked \"(For Visually Impaired Candidates Only)\" or \"(Question for candidates with visual impairment)\", for every question with a picture or fixture."
    ],
    units: [
      { name: "Unit 1: Management of Sporting Events", marks: 9, chapters: ["Unit 1:"] },
      { name: "Unit 2: Children and Women in Sports", marks: 7, chapters: ["Unit 2:"] },
      { name: "Unit 3: Yoga as Preventive Measure for Lifestyle Disease", marks: 7, chapters: ["Unit 3:"] },
      { name: "Unit 4: Physical Education and Sports for CWSN", marks: 8, chapters: ["Unit 4:"] },
      { name: "Unit 5: Sports and Nutrition", marks: 7, chapters: ["Unit 5:"] },
      { name: "Unit 6: Test and Measurement in Sports", marks: 8, chapters: ["Unit 6:"] },
      { name: "Unit 7: Physiology and Injuries in Sports", marks: 8, chapters: ["Unit 7:"] },
      { name: "Unit 8: Biomechanics and Sports", marks: 10, chapters: ["Unit 8:"] },
      { name: "Unit 9: Psychology and Sports", marks: 7, chapters: ["Unit 9:"] },
      { name: "Unit 10: Training in Sports", marks: 9, chapters: ["Unit 10:"] }
    ]
  },
  "Class 11 || Physical Education": {
    code: "048",
    paperLabel: "Physical Education (048), Class XI",
    ...peFormats,
    unitMarksTotal: 70,
    misconceptions: "the aims vs objectives of physical education, the ancient vs modern Olympics, the Olympic symbols and values, asana vs pranayama, health-related vs skill-related fitness, test vs measurement vs evaluation, BMI vs body fat percentage, the types of muscle and joint, the planes and axes of movement, doping methods vs prohibited substances",
    scope: [
      "Class XI Physical Education theory (70 marks) is CBSE's ten units: Changing Trends and Career in Physical Education (4+4b), Olympic Value Education (5), Yoga (6+1b), Physical Education and Sports for CWSN (4+3b), Physical Fitness, Wellness (5), Test, Measurement and Evaluation (8), Fundamentals of Anatomy and Physiology in Sports (8), Fundamentals of Kinesiology and Biomechanics in Sports (4+4b), Psychology and Sports (7), Training and Doping in Sports (7), on the Class XII sample paper's layout. \"b\" marks are concept-based questions for visually impaired candidates. The practical is examined separately.",
      "Content outside CBSE's 2026-27 unit-wise course content is not assessed."
    ],
    requirements: [
      "**Unit spread:** the paper prints 80 marks, of which the student attempts 70; share the printed marks among the units in proportion to the weightages in the syllabus section, within ±2 marks.",
      "**Attempt any:** Section B prints 6 questions (attempt any 5), Section C 6 (any 5) and Section E 4 (any 3); Section D's three case studies each have an internal choice in one part; Section A is compulsory.",
      "**Visually impaired candidates:** print a words-only alternative for every question with a picture or diagram."
    ],
    units: [
      { name: "Unit 1: Changing Trends and Career in Physical Education", marks: 8, chapters: ["Unit 1:"] },
      { name: "Unit 2: Olympic Value Education", marks: 5, chapters: ["Unit 2:"] },
      { name: "Unit 3: Yoga", marks: 7, chapters: ["Unit 3:"] },
      { name: "Unit 4: Physical Education and Sports for CWSN", marks: 7, chapters: ["Unit 4:"] },
      { name: "Unit 5: Physical Fitness, Wellness", marks: 5, chapters: ["Unit 5:"] },
      { name: "Unit 6: Test, Measurement and Evaluation", marks: 8, chapters: ["Unit 6:"] },
      { name: "Unit 7: Fundamentals of Anatomy and Physiology in Sports", marks: 8, chapters: ["Unit 7:"] },
      { name: "Unit 8: Fundamentals of Kinesiology and Biomechanics in Sports", marks: 8, chapters: ["Unit 8:"] },
      { name: "Unit 9: Psychology and Sports", marks: 7, chapters: ["Unit 9:"] },
      { name: "Unit 10: Training and Doping in Sports", marks: 7, chapters: ["Unit 10:"] }
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

  "Class 12 || Business Studies": {
    year: "2026-27",
    fullMarks: 80,
    text: `BUSINESS STUDIES (054), Class XII, Maximum Marks 80, Time Allowed 3 hours.
This question paper contains 34 questions, numbered continuously with no sections:
  Questions 1 to 20 are MCQs of 1 mark each (20).
  Questions 21 to 24 carry 3 marks each, answered in 50 to 75 words (12).
  Questions 25 to 30 carry 4 marks each, answered in about 150 words (24).
  Questions 31 to 34 carry 6 marks each, answered in about 200 words (24).
Internal choice in 6 questions: Q21 and Q23 (3 marks), Q25 and Q28 (4 marks), Q31 and Q34 (6 marks).
Answers should be brief and to the point. Attempt all parts of the questions together.
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Business Studies": {
    year: "2026-27",
    fullMarks: 80,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it. This paper is set on the
Class XII Business Studies 2026-27 sample paper layout, against the Class XI curriculum and its unit weightage.
This question paper contains 34 questions: Q1-Q20 MCQs (1 mark), Q21-Q24 (3 marks, 50-75 words),
Q25-Q30 (4 marks, about 150 words), Q31-Q34 (6 marks, about 200 words).
Internal choice in Q21, Q23, Q25, Q28, Q31 and Q34.`
  },

  "Class 12 || Economics": {
    year: "2026-27",
    fullMarks: 80,
    text: `ECONOMICS (030), Class XII, Maximum Marks 80, Time Allowed 3 hours.
Two sections: Section A - Macroeconomics (Q1-Q17, 40 marks); Section B - Indian Economic Development (Q18-Q34, 40 marks).
Each section: 10 MCQs of 1 mark, 2 questions of 3 marks (60-80 words), 3 of 4 marks (80-100 words) and
2 of 6 marks (100-150 words). In all: 20 MCQs, 4 of 3 marks, 6 of 4 marks and 4 of 6 marks.
Internal choice in 6 questions: Q11 and Q29 (3 marks), Q13 and Q32 (4 marks), Q17 and Q33 (6 marks).
Questions with a visual input carry an alternative for visually impaired candidates.
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || Economics": {
    year: "2026-27",
    fullMarks: 80,
    text: `Class 11 is a school examination, so CBSE publishes no sample paper for it. This paper is set on the
Class XII Economics 2026-27 sample paper layout, against the Class XI curriculum and its unit weightage.
Two sections: Section A - Statistics for Economics (Q1-Q17, 40 marks); Section B - Introductory Microeconomics
(Q18-Q34, 40 marks). Each section: 10 MCQs of 1 mark, 2 of 3 marks (60-80 words), 3 of 4 marks (80-100 words)
and 2 of 6 marks (100-150 words). Internal choice in Q11, Q13, Q17, Q29, Q32 and Q33.`
  },

  "Class 12 || History": {
    year: "2026-27",
    fullMarks: 80,
    text: `HISTORY (027), Class XII, Maximum Marks 80, Time Allowed 3 hours.
34 questions in five sections:
  Section A: Q1-Q21, MCQs of 1 mark (21) - 7 from each of the three books.
  Section B: Q22-Q27, short answers of 3 marks in 60-80 words (18) - 2 from each book.
  Section C: Q28-Q30, long answers of 8 marks in 300-350 words (24) - one from each book.
  Section D: Q31-Q33, source-based questions of 4 marks with three sub-questions (12) - one from each book.
  Section E: Q34, map question of 5 marks - locate and label, and identify.
There is no overall choice; internal choice in Sections B, C and E. A separate question is provided for
candidates with visual impairment in lieu of questions with visual inputs and the map.
CBSE states there is no change in the Question Paper Design and Assessment Pattern for 2026-27.`
  },

  "Class 11 || History": {
    year: "2026-27",
    fullMarks: 80,
    text: `HISTORY (027), Class XI, Maximum Marks 80, Time Allowed 3 hours. CBSE's Class XI design has the same totals as
the Class XII sample paper: 21 MCQs (1 mark), 6 short answers (3 marks, 60-80 words), 3 long answers (8 marks,
300-350 words), 3 source-based questions (4 marks) and a map question (5 marks), in Sections A to E.
Internal choice in Sections B, C and E; alternatives for candidates with visual impairment.`
  },

  "Class 12 || Political Science": {
    year: "2026-27",
    fullMarks: 80,
    text: `POLITICAL SCIENCE (028), Class XII, Maximum Marks 80, Time Allowed 3 hours.
30 questions in five sections:
  Section A: Q1-Q12, MCQs of 1 mark (12) - 6 from each book.
  Section B: Q13-Q18, short answers of 2 marks in 50-60 words (12) - 3 from each book.
  Section C: Q19-Q23, short answers of 4 marks in 100-120 words (20); internal choice in two of them.
  Section D: Q24-Q26, picture, passage and map-based questions of 4 marks (12), four 1-mark parts each.
  Section E: Q27-Q30, long answers of 6 marks in 170-180 words (24); internal choice in all four.
Contemporary World Politics and Politics in India Since Independence carry 40 marks each; the map comes
from Politics in India Since Independence. Alternatives for candidates with visual impairment in lieu of
the picture and map questions. CBSE states there is no change in the Question Paper Design for 2026-27.`
  },

  "Class 11 || Political Science": {
    year: "2026-27",
    fullMarks: 80,
    text: `POLITICAL SCIENCE (028), Class XI, Maximum Marks 80, Time Allowed 3 hours, on the Class XII sample paper's
layout: 12 MCQs (1 mark), 6 short answers of 2 marks (50-60 words), 5 of 4 marks (100-120 words, internal
choice in two), 3 picture/cartoon and passage-based questions of 4 marks, and 4 long answers of 6 marks
(170-180 words, internal choice in all), in Sections A to E. Indian Constitution at Work and Political
Theory carry 40 marks each.`
  },

  "Class 12 || Geography": {
    year: "2026-27",
    fullMarks: 70,
    text: `GEOGRAPHY (029), Class XII, Theory: Maximum Marks 70, Time Allowed 3 hours (practical 30 marks, examined separately).
30 questions in five sections:
  Section A: Q1-Q17, MCQs of 1 mark (17).
  Section B: Q18-Q19, source-based questions of 3 marks (6) - one on a map, picture or graph, one on a passage.
  Section C: Q20-Q23, short answers of 3 marks in 80-100 words (12).
  Section D: Q24-Q28, long answers of 5 marks in 120-150 words (25).
  Section E: Q29-Q30, map questions of 5 marks (10) - the world map (identify any five of seven) and India's
  (locate and label any five of seven).
No overall choice; internal choice in a few questions in all sections except Section A. Separate questions for
visually impaired candidates in lieu of visual inputs and maps. Fundamentals of Human Geography and India -
People and Economy carry 30 marks each plus a 5-mark map question each. No change in design for 2026-27.`
  },

  "Class 11 || Geography": {
    year: "2026-27",
    fullMarks: 70,
    text: `GEOGRAPHY (029), Class XI, Theory: Maximum Marks 70, Time Allowed 3 hours (practical 30 marks, examined separately),
on the Class XII sample paper's layout: 17 MCQs (1 mark), 2 source-based questions (3 marks), 4 short answers
(3 marks, 80-100 words), 5 long answers (5 marks, 120-150 words) and 2 map questions (5 marks: the world and
India), in Sections A to E. Fundamentals of Physical Geography and India - Physical Environment carry 30 marks
each plus a 5-mark map question each.`
  },

  "Class 12 || Physical Education": {
    year: "2026-27",
    fullMarks: 70,
    text: `PHYSICAL EDUCATION (048), Class XII, Theory: Maximum Marks 70, Time 3 hours (practical 30 marks, examined separately).
37 questions in five sections:
  Section A: Q1-Q18, MCQs of 1 mark (18), all compulsory.
  Section B: Q19-Q24, very short answers of 2 marks in 60-90 words - attempt any 5 (10).
  Section C: Q25-Q30, short answers of 3 marks in 100-150 words - attempt any 5 (15).
  Section D: Q31-Q33, case studies of 4 marks with an internal choice (12).
  Section E: Q34-Q37, long answers of 5 marks in 200-300 words - attempt any 3 (15).
Separate questions for visually impaired candidates in lieu of those with pictures or fixtures.
CBSE states there is no change in the Question Paper Design for 2026-27.`
  },

  "Class 11 || Physical Education": {
    year: "2026-27",
    fullMarks: 70,
    text: `PHYSICAL EDUCATION (048), Class XI, Theory: Maximum Marks 70, Time 3 hours (practical 30 marks, examined separately),
on the Class XII sample paper's layout: 18 MCQs (1 mark), 6 very short answers of 2 marks (attempt any 5), 6 short
answers of 3 marks (attempt any 5), 3 case studies of 4 marks and 4 long answers of 5 marks (attempt any 3),
in Sections A to E.`
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
