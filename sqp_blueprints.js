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

const acc = accountancyPaper;
const accIC = acc.internalChoice;
const accLadder = acc.markLadder.join(', ').replace(/, (\d+)$/, ' and $1');
const accExcluded = acc.excludedMarks.map(m => `${m}-mark`).join(' or ');

export const sqpBlueprints = {
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
  return null;
}
