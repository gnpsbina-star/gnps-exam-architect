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
export function getSecondaryEnglish(className, subjectName) {
  if (subjectName !== "English (R1)") return null;
  return secondaryEnglish[className] || null;
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
  // The four Class 9 / 10 skill subjects share CBSE's skill paper layout.
  const skill = getSecondarySkill(className, subjectName);
  if (skill) {
    return { year: "2026-27", text: `${skill.label.toUpperCase()}, ${className === "Class 9" ? "Class IX" : "Class X"}, Maximum Marks 50 (theory), Time Allowed 2 hours.\n${skill.pattern}` };
  }
  return null;
}
