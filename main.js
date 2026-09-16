import { cbseData } from './data.js?v=36';
import { getSqpBlueprint } from './sqp_blueprints.js?v=1';
import { getLiteratureContext } from './literature_context.js?v=1';
import { PRINCIPAL_SIGNATURE_BASE64 } from './signature_asset.js?v=1';

// Persistent Custom Subjects state
let customSubjectsData = {};

// Master per-Part "include in this sheet" toggle, remembered per class:
// { [cls]: { scholastic: bool, sea: bool, cosch: bool, notebook: bool } }.
// A part left out here is omitted from the sheet entirely (screen and PDF
// alike), and the remaining parts renumber to stay sequential. Declared this
// early because page-init code can reach syllabus-sheet render paths before
// a later declaration point would have run - see the authToken comment
// further down for the same class of bug.
let sheetPartInclusion = {};

// Reads the stored auth token directly (safe to call before the module-level
// `authToken`/`safeAuthStorage` bindings further down the file are initialized).
function getStoredAuthToken() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('gnps_auth_token')) {
      return localStorage.getItem('gnps_auth_token');
    }
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('gnps_auth_token')) {
      return sessionStorage.getItem('gnps_auth_token');
    }
  } catch (e) {}
  return '';
}

// Escapes text for safe insertion into innerHTML. Use for any value that
// originates from user input (usernames, audit log fields, etc.).
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Declared here (rather than down in the auth/admin section below) because
// page-init code - e.g. initClassDropdown() synchronously dispatching a
// 'change' event, which cascades into updateExamBlueprint()'s fetch headers -
// runs at module load time and referenced `authToken` before its old
// declaration point, throwing "Cannot access 'authToken' before
// initialization". Declaring it this early guarantees it's always
// initialized before anything else in the file can run.
const safeAuthStorage = {
  getToken: () => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('gnps_auth_token')) {
        return localStorage.getItem('gnps_auth_token');
      }
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('gnps_auth_token')) {
        return sessionStorage.getItem('gnps_auth_token');
      }
    } catch (e) {}
    return '';
  },
  setToken: (token, remember = true) => {
    try {
      if (remember) {
        if (typeof localStorage !== 'undefined') localStorage.setItem('gnps_auth_token', token);
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('gnps_auth_token');
      } else {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('gnps_auth_token', token);
        if (typeof localStorage !== 'undefined') localStorage.removeItem('gnps_auth_token');
      }
    } catch (e) {}
  },
  clearToken: () => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('gnps_auth_token');
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('gnps_auth_token');
    } catch (e) {}
  }
};

let authToken = safeAuthStorage.getToken();

// DOM Elements
const classSelect = document.getElementById('classSelect');
const subjectSelect = document.getElementById('subjectSelect');
const syllabusContainer = document.getElementById('syllabusContainer');
const form = document.getElementById('generator-form');
const outputSection = document.getElementById('output-section');
const generatedPrompt = document.getElementById('generatedPrompt');
const copyBtn = document.getElementById('copyBtn');
const examNameSelect = document.getElementById('examName');
const marksInput = document.getElementById('marks');
const durationInput = document.getElementById('duration');

// Custom Subject & Syllabus DOM Elements
const openAddSubjectModalBtn = document.getElementById('openAddSubjectModalBtn');
const closeAddSubjectModalBtn = document.getElementById('closeAddSubjectModalBtn');
const cancelAddSubjectBtn = document.getElementById('cancelAddSubjectBtn');
const saveAddSubjectBtn = document.getElementById('saveAddSubjectBtn');
const addSubjectModal = document.getElementById('addSubjectModal');
const modalLoadingSpinner = document.getElementById('modalLoadingSpinner');
const modalBodyForm = document.getElementById('modalBodyForm');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const subjectSearchFilter = document.getElementById('subjectSearchFilter');
const cbseSubjectDropdown = document.getElementById('cbseSubjectDropdown');
const deleteCustomSubjectBtn = document.getElementById('deleteCustomSubjectBtn');
const blueprintContainer = document.getElementById('blueprintContainer');
const blueprintBadge = document.getElementById('blueprintBadge');
const difficultySelect = document.getElementById('difficulty');
const fetchCbseSyllabusBtn = document.getElementById('fetchCbseSyllabusBtn');

// Helper to normalize subject string for comparison
function normalizeSubjName(str) {
  return str ? str.toLowerCase().replace(/\s*\([0-9]+\)\s*/g, '').replace(/[^a-z0-9]/g, '') : '';
}

// Check if a subject is already present in the selected class
function isSubjectAlreadyInClass(selectedClass, subjectName, subjectCode) {
  if (!cbseData[selectedClass]) return false;
  const currentSubjects = Object.keys(cbseData[selectedClass]);
  const targetNorm = normalizeSubjName(subjectName);
  
  for (const existing of currentSubjects) {
    if (existing.toLowerCase() === subjectName.toLowerCase()) return true;
    if (subjectCode && existing.includes(`(${subjectCode})`)) return true;
    const existingNorm = normalizeSubjName(existing);
    if (existingNorm === targetNorm && targetNorm.length > 2) return true;
  }
  return false;
}

// ==========================================
// OFFICIAL CBSE BOARD TARGET WORKSHEETS CONFIG (UNIVERSAL ALL-SUBJECT NEP 2020)
// ==========================================
export const WORKSHEET_OPTIONS = [
  {
    value: "Worksheet: CBSE Section A & B Foundational Drill (1 & 2 Marks)",
    label: "⏱️ CBSE Board Target: Foundational Recall & Reasoning (Section A & B: 1 & 2 Marks)",
    shortName: "Section A & B Drill (1 & 2 Marks)",
    tier: "CBSE_SEC_AB",
    marksRange: "1 & 2 Marks",
    color: "#22c55e",
    difficulty: "Balanced",
    summary: "High-Yield Foundation: Section A (1M Objective, Assertion-Reason, Laws/Rules & Terminology) + Section B (2M VSA, Tabular Distinctions & 'Explain Why')",
    verbs: ["Define", "State the law/rule of", "List", "Identify", "Give reasons why", "Distinguish between", "Solve single-step", "Classify"]
  },
  {
    value: "Worksheet: CBSE HOTS & Advanced Analytical Challenge (3M, 4M & 5M)",
    label: "🔥 CBSE Board Target: HOTS & Advanced Analytical Challenge (3M, 4M & 5M)",
    shortName: "HOTS & Advanced Challenge (3M, 4M & 5M)",
    tier: "CBSE_HOTS",
    marksRange: "3, 4 & 5 Marks",
    color: "#ef4444",
    difficulty: "Advanced",
    summary: "Higher Order Thinking Skills (HOTS): Multi-Concept Integration, 'Spot the Error in Student Working', Experimental/Procedural Design & Evaluative Derivations",
    verbs: ["Critique and troubleshoot error", "Justify with evidence", "Design a verification setup", "Synthesize multi-concept problem", "Evaluate outcomes"]
  },
  {
    value: "Worksheet: CBSE Complete Chapter Blueprint (Sections A–E: 1M to 5M)",
    label: "🏆 CBSE Board Target: Complete Chapter Blueprint (Sections A–E: 1M to 5M)",
    shortName: "Complete Chapter Blueprint (Sections A–E)",
    tier: "CBSE_FULL",
    marksRange: "1 to 5 Marks",
    color: "#a855f7",
    difficulty: "Advanced",
    summary: "Full Board Paper Architecture: Section A (1M Objective & A/R) -> Section B (2M VSA) -> Section C (3M SA) -> Section D (5M LA Derivations) -> Section E (4M CBQ Units)",
    verbs: ["Full CBSE Spectrum (Objective -> VSA -> SA -> LA -> Case Studies)"]
  },
  {
    value: "Worksheet: CBSE 50% Competency & Case-Study Booster (NEP 2020 CBQ)",
    label: "⚡ CBSE Board Target: 50% Competency & Case-Study Booster (NEP 2020 CBQ)",
    shortName: "50% Competency Booster (CBQ Special)",
    tier: "CBSE_COMPETENCY",
    marksRange: "1, 3 & 4 Marks",
    color: "#f97316",
    difficulty: "Advanced",
    summary: "100% NEP 2020 Mandated Competency: Real-World Case Studies / Source Extracts (4M), Assertion-Reason (1M), and Contextual Problem Solving (3M)",
    verbs: ["Analyze contextual case", "Interpret source data/graph", "Deduce consequences", "Apply to real-life scenario"]
  },
  {
    value: "Worksheet: CBSE 10-Year High-Yield PYQs & Recurring Trends",
    label: "📜 CBSE Board Target: 10-Year High-Yield PYQs & Recurring Trends",
    shortName: "10-Year High-Yield PYQs (2015–2026)",
    tier: "CBSE_PYQ",
    marksRange: "1, 2, 3 & 5 Marks",
    color: "#eab308",
    difficulty: "Balanced",
    summary: "Official CBSE Board Paper Archives (2015–2026): High-frequency derivations, standard numerical/practical templates, and classic board question trends",
    verbs: ["Standard board derivations", "Frequent PYQ numericals", "Classic board distinctions", "High-probability templates"]
  },
  {
    value: "Worksheet: CBSE Subjective & Step-Marking Mastery (VSA 2M, SA 3M, LA 5M)",
    label: "✍️ CBSE Board Target: Subjective & Step-Marking Mastery (VSA 2M, SA 3M, LA 5M)",
    shortName: "Subjective & Step-Marking Mastery",
    tier: "CBSE_SUBJECTIVE",
    marksRange: "2, 3 & 5 Marks",
    color: "#38bdf8",
    difficulty: "Balanced",
    summary: "Written Answer Mastery: Very Short Answer (2M), Short Answer (3M) & Long Answer Derivations (5M) with official CBSE step-marking rubrics",
    verbs: ["Solve with step-marking", "Derive step-by-step", "Present tabular differences", "Explain with keywords"]
  }
];

export function detectSubjectDomain(subjectName) {
  if (!subjectName || typeof subjectName !== 'string') return 'science';
  const s = ' ' + subjectName.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
  if (s.includes(' computer ') || s.includes(' informatics ') || s.includes(' artificial intelligence ') || s.includes(' information technology ') || s.includes(' information tech ') || s.includes(' it ') || s.includes(' cs ') || s.includes(' ip ') || s.includes(' ai ')) return 'computer';
  if (s.includes(' social ') || s.includes(' sst ') || s.includes(' history ') || s.includes(' geography ') || s.includes(' political ') || s.includes(' pol sci ') || s.includes(' civics ') || s.includes(' sociology ') || s.includes(' psychology ')) return 'social_science';
  if (s.includes(' account ') || s.includes(' accountancy ') || s.includes(' business ') || s.includes(' commerce ') || s.includes(' entrepreneur ') || s.includes(' economics ')) return 'commerce';
  if (s.includes(' math ') || s.includes(' maths ') || s.includes(' mathematics ') || s.includes(' applied math ')) return 'math';
  if (s.includes(' english ') || s.includes(' hindi ') || s.includes(' sanskrit ') || s.includes(' french ') || s.includes(' german ') || s.includes(' arabic ') || s.includes(' urdu ') || s.includes(' punjabi ')) return 'language';
  if (s.includes(' physics ') || s.includes(' chemistry ') || s.includes(' biology ') || s.includes(' science ') || s.includes(' biotech ')) return 'science';
  return 'general';
}

function isWorksheetMode(examVal) {
  return typeof examVal === 'string' && examVal.startsWith("Worksheet:");
}

function getWorksheetConfig(examVal) {
  if (!examVal) return WORKSHEET_OPTIONS[0];
  const direct = WORKSHEET_OPTIONS.find(o => o.value === examVal);
  if (direct) return direct;
  
  // Fallback mappings for legacy worksheet values
  const valLower = examVal.toLowerCase();
  if (valLower.includes('lots') || valLower.includes('remember') || valLower.includes('section a & b')) return WORKSHEET_OPTIONS[0];
  if (valLower.includes('hots') || valLower.includes('evaluate') || valLower.includes('analytical')) return WORKSHEET_OPTIONS[1];
  if (valLower.includes('spectrum') || valLower.includes('ladder') || valLower.includes('blueprint')) return WORKSHEET_OPTIONS[2];
  if (valLower.includes('competency') || valLower.includes('cbq')) return WORKSHEET_OPTIONS[3];
  if (valLower.includes('pyq') || valLower.includes('archive')) return WORKSHEET_OPTIONS[4];
  if (valLower.includes('mots') || valLower.includes('apply') || valLower.includes('subjective')) return WORKSHEET_OPTIONS[5];
  return WORKSHEET_OPTIONS[0];
}

// Helper to filter out subjects not followed by the school (English R2 and Hindi R1)
export function isSchoolExcludedSubject(subjectName) {
  if (!subjectName || typeof subjectName !== 'string') return false;
  const clean = subjectName.toLowerCase().replace(/[\(\)\-_\s]+/g, ' ').trim();
  if (clean.includes('english r2') || clean.includes('english r 2')) return true;
  if (clean.includes('hindi r1') || clean.includes('hindi r 1')) return true;
  return false;
}

// Load custom subjects from server (with localStorage fallback)
async function loadCustomSubjects() {
  // Clear obsolete cached syllabus from older sessions
  try {
    if (typeof localStorage !== 'undefined') {
      const CURRENT_SYLLABUS_VER = '2026_exam_marks_duration_sync_v17';
      if (localStorage.getItem('gnps_syllabus_version') !== CURRENT_SYLLABUS_VER) {
        localStorage.removeItem('gnps_custom_subjects');
        localStorage.setItem('gnps_syllabus_version', CURRENT_SYLLABUS_VER);
      }
    }
  } catch (e) {}

  const loadFromLocalCache = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('gnps_custom_subjects');
        if (cached) {
          customSubjectsData = JSON.parse(cached);
        }
      }
    } catch (e) {}
  };

  try {
    const token = getStoredAuthToken();
    const res = await fetch(`/api/custom-subjects?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: token ? { 'Authorization': `Bearer ${token}`, 'X-Auth-Token': token } : {}
    });
    if (res.ok) {
      customSubjectsData = await res.json();
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('gnps_custom_subjects', JSON.stringify(customSubjectsData));
        }
      } catch (e) {}
    } else {
      // Not authenticated yet (or session expired) - fall back to whatever was cached
      // from the last successful load; loadCustomSubjects() re-runs after login.
      loadFromLocalCache();
    }
  } catch (err) {
    console.warn("Using localStorage fallback for custom subjects", err);
    loadFromLocalCache();
  }

  // Remove school-excluded subjects (English R2, Hindi R1, and Class 8 legacy Computer Science)
  for (const cls of Object.keys(cbseData)) {
    for (const subj of Object.keys(cbseData[cls])) {
      if (isSchoolExcludedSubject(subj) || (cls === 'Class 8' && subj.toLowerCase().includes('computer science'))) {
        delete cbseData[cls][subj];
      }
    }
  }
  if (customSubjectsData && typeof customSubjectsData === 'object') {
    for (const [cls, subjects] of Object.entries(customSubjectsData)) {
      if (subjects && typeof subjects === 'object') {
        for (const subj of Object.keys(subjects)) {
          if (isSchoolExcludedSubject(subj) || (cls === 'Class 8' && subj.toLowerCase().includes('computer science'))) {
            delete subjects[subj];
          }
        }
      }
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('gnps_custom_subjects', JSON.stringify(customSubjectsData));
      }
    } catch (e) {}
  }

  // Merge custom subjects into cbseData (safeguarding rich subtopic objects)
  if (customSubjectsData && typeof customSubjectsData === 'object') {
    for (const [cls, subjects] of Object.entries(customSubjectsData)) {
      if (!cbseData[cls]) {
        cbseData[cls] = {};
      }
      for (const [subj, chapters] of Object.entries(subjects)) {
        if (isSchoolExcludedSubject(subj)) continue;
        const existing = cbseData[cls][subj];
        // If cbseData already has rich subtopics object, don't overwrite with flat array
        if (existing && typeof existing === 'object' && !Array.isArray(existing) && Array.isArray(chapters)) {
          continue;
        }
        // Master data.js is the Single Source of Truth for standard curriculum:
        // If cbseData already has structured writing skills, never overwrite with legacy/flat custom data
        if (existing && typeof existing === 'object' && typeof chapters === 'object') {
          const masterWritingKey = Object.keys(existing).find(k => /writing|लेखन|रचनात्मक/i.test(k));
          const customWritingKey = Object.keys(chapters).find(k => /writing|लेखन|रचनात्मक/i.test(k));
          if (masterWritingKey && customWritingKey) {
            const masterVal = existing[masterWritingKey];
            const customVal = chapters[customWritingKey];
            if (masterVal && typeof masterVal === 'object' && !Array.isArray(masterVal)) {
              if (!customVal || Array.isArray(customVal) || !Object.keys(customVal).some(k => /short|लघु/i.test(k))) {
                chapters[customWritingKey] = masterVal;
              }
            }
          }
        }
        cbseData[cls][subj] = chapters;
      }
    }
  }

  if (classSelect.value) {
    populateSubjectsDropdown(classSelect.value, subjectSelect.value || null);
    if (subjectSelect.value && cbseData[classSelect.value] && cbseData[classSelect.value][subjectSelect.value]) {
      renderSyllabusChecklist(cbseData[classSelect.value][subjectSelect.value]);
      updateExamBlueprint();
    }
  }
}

// Initialize Class Dropdown
function initClassDropdown() {
  classSelect.innerHTML = '<option value="" disabled>Select Class</option>';
  const classes = Object.keys(cbseData);
  classes.forEach(cls => {
    const option = document.createElement('option');
    option.value = cls;
    option.textContent = cls;
    classSelect.appendChild(option);
  });

  // Automatically select Class 8 so Exam Name and Subject are immediately enabled!
  if (classes.includes("Class 8")) {
    classSelect.value = "Class 8";
    classSelect.dispatchEvent(new Event('change'));
  } else if (classes.length > 0) {
    classSelect.value = classes[0];
    classSelect.dispatchEvent(new Event('change'));
  }

  // Pre-select Annual Examination by default so Exam Name is immediately ready and never blank
  if (examNameSelect) {
    const defaultExam = Array.from(examNameSelect.options).find(o => o.value === 'Annual Examination' || o.value === 'Final Examination' || o.value === 'Final Exam' || o.value === 'Half Yearly');
    if (defaultExam) {
      examNameSelect.value = defaultExam.value;
      examNameSelect.dispatchEvent(new Event('change'));
    }
  }
}


// Global active state for Blueprint
let currentBlueprintState = null;
let lastBlueprintConfigKey = "";

function getCleanLiteratureBookName(className, subjectName) {
  const full = getPrescribedBookName(className, subjectName);
  if (!full || full.includes("Official CBSE")) return "";
  return full.replace(/\s*\((?:NCERT|CBSE|Grade\s*\d+|Class\s*[IXVLCDM]+)\)/gi, '').trim();
}

function calculateExamBlueprint(className, subjectName, examName, marksVal, durationVal) {
  if (!className || !subjectName) return null;
  
  let marks = parseInt(marksVal) || 0;
  if (marks === 0 || isNaN(marks)) {
    const defaults = getExamDefaultDetails(className, subjectName, examName);
    marks = defaults.marks;
  }

  const subLower = (subjectName || '').toLowerCase().trim();
  const isSkill = (subLower.startsWith("it (") || subLower.startsWith("it ") || subLower.includes(" it (") || subLower.includes("it 402") || subLower.includes("it 802")) || 
                  subLower.includes("information tech") || 
                  subLower.includes("computer applications") || 
                  subLower.includes("health care") ||
                  subLower.includes("artificial") || subLower.includes("retail") || 
                  subLower.includes("data science") || subLower.includes("fashion") || 
                  subLower.includes("web app") || subLower.includes("yoga");
  const isMiddle = (className === 'Class 6' || className === 'Class 7' || className === 'Class 8');
  const isGK = isMiddle && (subLower.includes("general knowledge") || subLower.includes("gk"));
  const isRobo = isMiddle && subLower.includes("robotics");

  const defaultDuration = isRobo ? (marks <= 10 ? "20 Mins" : "45 Minutes")
                               : (isGK ? (marks <= 10 ? "20 Mins" : (marks <= 25 ? "45 Mins" : "90 Mins"))
                               : (isSkill ? (marks <= 0 ? "No Unit Test" : (marks <= 25 ? "60 Mins" : "120 Mins"))
                               : (marks <= 25 ? "45 Minutes" : (marks <= 45 ? "90 Mins" : (marks <= 50 && isSkill ? "120 Mins" : (isMiddle && marks >= 75 ? "2.5 Hours" : "180 Mins"))))));
  const duration = durationVal || defaultDuration;

  if (isSkill && (marks === 0 || (examName && examName.includes("Unit Test") && marks <= 20))) {
    return {
      totalMarks: 0,
      duration: "No Unit Test",
      competencyRatio: "N/A",
      sections: [
        { name: "CBSE Advisory", type: "No Unit Tests scheduled for Vocational / Skill subjects (Assessments conducted via Periodic Assessment & Annual Board Exams).", count: 0, unitMark: 0, marksPerQ: "—", total: 0, choice: "Not Applicable" }
      ]
    };
  }

  let sections = [];
  let competencyRatio = "50%";

  const isAccountancy = (className === "Class 11" || className === "Class 12") && subLower.includes("account");

  // 0. Accountancy short tests. Part A / Part B is a division of the syllabus
  // for the full paper, so it does not apply here - a unit test is often drawn
  // from a single part. The 1/3/4/6 mark ladder does still apply: Accountancy
  // never sets a 2 or 5 mark question, and these tests should build board
  // habits from the start.
  if (isAccountancy && marks > 0 && marks < 75) {
    const isShortTest = marks <= 25;
    sections = isShortTest ? [
      { name: "Objective", type: "MCQ / Assertion-Reasoning / Fill-ups", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Compulsory" },
      { name: "Short Answer", type: "Practical working (entries / ledger / short computation)", count: 3, unitMark: 3, marksPerQ: "3 Marks", total: 9, choice: "Internal choice in 1 Q" },
      { name: "Long Answer", type: "Full numerical problem", count: 1, unitMark: 6, marksPerQ: "6 Marks", total: 6, choice: "Internal choice" }
    ] : [
      { name: "Objective", type: "MCQ / Assertion-Reasoning / Fill-ups", count: 8, unitMark: 1, marksPerQ: "1 Mark", total: 8, choice: "Compulsory" },
      { name: "Short Answer", type: "Practical working (entries / ledger / short computation)", count: 4, unitMark: 3, marksPerQ: "3 Marks", total: 12, choice: "Internal choice in 1 Q" },
      { name: "Short Answer - numerical", type: "Numerical problem", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in 1 Q" },
      { name: "Long Answer", type: "Full numerical problem", count: 2, unitMark: 6, marksPerQ: "6 Marks", total: 12, choice: "Internal choice in 1 Q" }
    ];
  }
  // 1. Unit Test (20 Marks / 45 Min) or GK/Robo 10M / 20M
  else if (marks <= 20 || (examName && examName.includes("Unit Test") && marks <= 20)) {
    if (subLower.includes("english")) {
      const litBook = getCleanLiteratureBookName(className, subjectName);
      const litSecType = litBook ? `Literature Textbooks (${litBook})` : "Literature Textbooks";

      if (className === "Class 6" || className === "Class 7" || className === "Class 8") {
        sections = [
          { name: "Section A", type: "Applied Grammar (Tenses, Prepositions, Modals)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "Direct Objective / MCQs" },
          { name: "Section B", type: "Creative Writing (Notice / Diary / Letter)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Choice between 2 prompts" },
          { name: "Section C", type: litSecType, count: 4, unitMark: 2.5, marksPerQ: "2-3 Marks", total: 10, choice: "1 RTC (3M) + 2 SA (4M) + 1 LA (3M)" }
        ];
      } else if (className === "Class 11" || className === "Class 12") {
        sections = [
          { name: "Section A", type: "Short Writing Skills (Notice / Invitation / Poster)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Choice between 2 topics" },
          { name: "Section B", type: "Long Writing / Grammar (Letter / Job App / Grammar)", count: 1, unitMark: 6, marksPerQ: "6 Marks", total: 6, choice: "Choice between 2 prompts" },
          { name: "Section C", type: litSecType, count: 4, unitMark: 2.5, marksPerQ: "2-3 Marks", total: 10, choice: "1 RTC (3M) + 2 SA (4M) + 1 LA (3M)" }
        ];
      } else if (className === "Class 9") {
        // Class 9 (NCERT Kaveri)
        sections = [
          { name: "Section A", type: "Applied Grammar (Gap Filling, Editing, Reported Speech)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Answer 5 out of 6 Qs" },
          { name: "Section B", type: "Creative Writing (Descriptive Paragraph / Diary Entry / Story)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "100% Internal Choice (Paragraph OR Diary/Story)" },
          { name: "Section C", type: litSecType, count: 4, unitMark: 2.5, marksPerQ: "2-3 Marks", total: 10, choice: "1 RTC (3M) + 2 SA (4M) + 1 LA (3M)" }
        ];
      } else {
        // Class 10 / Generic English
        sections = [
          { name: "Section A", type: "Applied Grammar (Gap Filling, Editing, Reported Speech)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Answer 5 out of 6 Qs" },
          { name: "Section B", type: "Creative Writing (Formal Letter / Analytical Paragraph)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "100% Internal Choice (Letter OR Para)" },
          { name: "Section C", type: litSecType, count: 4, unitMark: 2.5, marksPerQ: "2-3 Marks", total: 10, choice: "1 RTC (3M) + 2 SA (4M) + 1 LA (3M)" }
        ];
      }
    } else if (subLower.includes("hindi")) {
      sections = [
        { name: "खण्ड 'क'", type: "व्यावहारिक व्याकरण (व्याकरण बहुविकल्पी प्रश्न)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "Direct MCQs on Syllabus Topics" },
        { name: "खण्ड 'ख'", type: "रचनात्मक लेखन (अनुच्छेद लेखन / पत्र लेखन)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Choice between 2 topics" },
        { name: "खण्ड 'ग'", type: "पाठ्यपुस्तक प्रश्नोत्तर (साहित्य)", count: 4, unitMark: 2.5, marksPerQ: "2-3 Marks", total: 10, choice: "1 RTC (3M) + 2 SA (4M) + 1 LA (3M)" }
      ];
    } else if (subLower.includes("sanskrit")) {
      sections = [
        { name: "खण्डः 'क'", type: "अनुप्रयुक्त-व्याकरणम् (सन्धि, समास, प्रत्यय, अव्यय)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "Direct Objective Qs" },
        { name: "खण्डः 'ख'", type: "रचनात्मक-कार्यम् (पत्रलेखनम् / चित्रवर्णनम् / अनुवादः)", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Choice provided" },
        { name: "खण्डः 'ग'", type: "पठित-अवबोधनम् (श्लोक/गद्यांश आधारित प्रश्नोत्तराणि)", count: 4, unitMark: 2.5, marksPerQ: "2-3 Marks", total: 10, choice: "Comprehension & Short Answers" }
      ];
    } else if (subLower.includes("social science") || subLower.includes("social studies") || subLower.includes("sst") || subLower.includes("087")) {
      if (className === "Class 6" || className === "Class 7" || className === "Class 8") {
        sections = [
          { name: "Section A", type: "Objective Type (MCQs, Fill in Blanks & 1-Word Qs)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "All Compulsory" },
          { name: "Section B", type: "Short Answer I (20-30 words)", count: 2, unitMark: 2, marksPerQ: "2 Marks", total: 4, choice: "Direct Conceptual Questions" },
          { name: "Section C", type: "Short Answer II (40-50 words)", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Internal choice in 1 Q" },
          { name: "Section D", type: "Long Answer (60-80 words) & Map Skill Work", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "3M Long Question + 1M Map Location" }
        ];
      } else {
        // Class 9 & Class 10
        sections = [
          { name: "Section A", type: "Objective Type (MCQs, Match Column & Assertion-Reasoning)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "4 MCQs + 1 Assertion-Reasoning" },
          { name: "Section B", type: "Very Short Answer (VSA - 30-40 words)", count: 2, unitMark: 2, marksPerQ: "2 Marks", total: 4, choice: "Internal choice in 1 Q" },
          { name: "Section C", type: "Short Answer (SA - 50-60 words)", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Internal choice in 1 Q" },
          { name: "Section D", type: "Long Answer (LA - 100-120 words) / Case-Based Study", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "100% Internal Choice (LA OR Case Study)" }
        ];
      }
    } else if (subLower.includes("robotics")) {
      if (marks <= 10) {
        sections = [
          { name: "Section A", type: "Objective & Technical MCQs (Components, Sensors, Pins)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "All Compulsory" },
          { name: "Section B", type: "Short Answer & Circuit Logic (Schematics, Code Blocks)", count: 3, unitMark: 2, marksPerQ: "2 Marks", total: 6, choice: "Internal choice in 1 Q" }
        ];
      } else {
        sections = [
          { name: "Section A", type: "Objective & Technical MCQs (Circuits, Sensors, Logic)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "All Compulsory" },
          { name: "Section B", type: "Short Answer (Components & Circuit Logic)", count: 3, unitMark: 2, marksPerQ: "2 Marks", total: 6, choice: "Internal choice in 1 Q" },
          { name: "Section C", type: "Descriptive & Coding / Practical Schematic", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in both Qs (Algorithm / Wiring)" }
        ];
      }
    } else if (subLower.includes("general knowledge") || subLower.includes("gk")) {
      if (marks <= 10) {
        sections = [
          { name: "Section A", type: "Multiple Choice Questions (Current Affairs & General Trivia)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "All Compulsory" },
          { name: "Section B", type: "One-Word Answer / Direct Trivia (Personalities, Monuments, Facts)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Direct Identification" }
        ];
      } else {
        // 20 Marks GK (PA or standard 20M Exam)
        sections = [
          { name: "Section A", type: "Multiple Choice Questions (Current Affairs, Science & India)", count: 8, unitMark: 1, marksPerQ: "1 Mark", total: 8, choice: "All Compulsory" },
          { name: "Section B", type: "One-Word Answer / Identification (Personalities, Monuments, Sobriquets)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "Direct Identification" },
          { name: "Section C", type: "Fill in the Blanks & Match Columns / Trivia (Sports, Books, Facts)", count: 6, unitMark: 1, marksPerQ: "1 Mark", total: 6, choice: "All Compulsory" }
        ];
      }
    } else {
      sections = [
        { name: "Section A", type: "Multiple Choice Questions (MCQs)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Compulsory" },
        { name: "Section B", type: "Very Short Answer (VSA)", count: 2, unitMark: 2, marksPerQ: "2 Marks", total: 4, choice: "Internal choice in 1 Q" },
        { name: "Section C", type: "Short Answer (SA)", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Internal choice in 1 Q" },
        { name: "Section D", type: "Long Answer (LA) / Case-Study", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Internal choice in 1 Q" }
      ];
    }
  }
  // 1b. Periodic Test / Extended UT (25 Marks / 45-60 Min)
  else if (marks <= 25 || (examName && examName.includes("Unit Test"))) {
    if (subLower.includes("english")) {
      const litBook = getCleanLiteratureBookName(className, subjectName);
      const litSecType = litBook ? `Literature Textbooks (${litBook})` : "Literature Textbooks";
      sections = [
        { name: "Section A", type: "Applied Grammar & Objective Comprehension", count: 7, unitMark: 1, marksPerQ: "1 Mark", total: 7, choice: "Direct Objective / MCQs" },
        { name: "Section B", type: "Creative Writing Skills", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Choice between 2 prompts" },
        { name: "Section C", type: litSecType, count: 4, unitMark: 3.25, marksPerQ: "2-5 Marks", total: 13, choice: "1 RTC (4M) + 2 SA (6M) + 1 LA (3M)" }
      ];
    } else if (subLower.includes("hindi")) {
      sections = [
        { name: "खण्ड 'क'", type: "व्यावहारिक व्याकरण (बहुविकल्पी प्रश्न)", count: 7, unitMark: 1, marksPerQ: "1 Mark", total: 7, choice: "Direct MCQs" },
        { name: "खण्ड 'ख'", type: "रचनात्मक लेखन (अनुच्छेद / पत्र लेखन)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Choice between 2 topics" },
        { name: "खण्ड 'ग'", type: "पाठ्यपुस्तक प्रश्नोत्तर (साहित्य)", count: 4, unitMark: 3.25, marksPerQ: "2-5 Marks", total: 13, choice: "1 पठित पद्यांश (4M) + 2 लघु उत्तरीय (6M) + 1 दीर्घ उत्तरीय (3M)" }
      ];
    } else if (subLower.includes("sanskrit")) {
      sections = [
        { name: "खण्डः 'क'", type: "अनुप्रयुक्त-व्याकरणम् (सन्धि, समास, प्रत्यय, अव्यय)", count: 7, unitMark: 1, marksPerQ: "1 Mark", total: 7, choice: "Direct Objective Qs" },
        { name: "खण्डः 'ख'", type: "रचनात्मक-कार्यम् (पत्रलेखनम् / चित्रवर्णनम्)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Choice provided" },
        { name: "खण्डः 'ग'", type: "पठित-अवबोधनम् (श्लोक/गद्यांश आधारित प्रश्नोत्तराणि)", count: 4, unitMark: 3.25, marksPerQ: "2-5 Marks", total: 13, choice: "Comprehension & Short Answers" }
      ];
    } else if (subLower.includes("social science") || subLower.includes("social studies") || subLower.includes("sst") || subLower.includes("087")) {
      sections = [
        { name: "Section A", type: "Objective Type (MCQs & Assertion-Reasoning)", count: 7, unitMark: 1, marksPerQ: "1 Mark", total: 7, choice: "6 MCQs + 1 Assertion-Reasoning" },
        { name: "Section B", type: "Very Short Answer (VSA - 30 words)", count: 2, unitMark: 2, marksPerQ: "2 Marks", total: 4, choice: "Internal choice in 1 Q" },
        { name: "Section C", type: "Short Answer (SA - 50 words)", count: 3, unitMark: 3, marksPerQ: "3 Marks", total: 9, choice: "Internal choice in 1 Q" },
        { name: "Section D", type: "Long Answer (LA) / Map Work", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "100% Internal Choice" }
      ];
    } else if (isSkill) {
      sections = [
        { name: "Part A", type: "Employability Skills (Objective & Short Answer)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "Answer 5 out of 6 Qs" },
        { name: "Part B (I)", type: "Subject Specific Skills (Objective / MCQs)", count: 10, unitMark: 1, marksPerQ: "1 Mark", total: 10, choice: "Answer 10 out of 12 Qs" },
        { name: "Part B (II)", type: "Subject Specific Skills (Short Answer - 2 Marks)", count: 5, unitMark: 2, marksPerQ: "2 Marks", total: 10, choice: "Answer 5 out of 6 Qs" }
      ];
    } else {
      sections = [
        { name: "Section A", type: "Multiple Choice Questions (MCQs)", count: 7, unitMark: 1, marksPerQ: "1 Mark", total: 7, choice: "Compulsory" },
        { name: "Section B", type: "Very Short Answer (VSA)", count: 2, unitMark: 2, marksPerQ: "2 Marks", total: 4, choice: "Internal choice in 1 Q" },
        { name: "Section C", type: "Short Answer (SA)", count: 3, unitMark: 3, marksPerQ: "3 Marks", total: 9, choice: "Internal choice in 1 Q" },
        { name: "Section D", type: "Long Answer (LA) / Case-Study", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "Internal choice in 1 Q" }
      ];
    }
  }
  // 2. Periodic Assessment (40 Marks / 90 Min)
  else if (marks <= 45 || (examName && (examName.includes("PA") || examName.toLowerCase().includes("periodic")))) {
    if (subLower.includes("english")) {
      const litBook = getCleanLiteratureBookName(className, subjectName);
      const litSecType = litBook ? `Language Through Literature (${litBook})` : "Language Through Literature";

      if (className === "Class 11" || className === "Class 12") {
        sections = [
          { name: "Section A", type: "Reading Skills (1 Unseen Comprehension Passage)", count: 1, unitMark: 10, marksPerQ: "10 Marks", total: 10, choice: "MCQs & Inference Qs" },
          { name: "Section B", type: "Creative Writing Skills (Notice 4M + Letter/Job App 6M)", count: 2, unitMark: 5, marksPerQ: "4-6 Marks", total: 10, choice: "Internal choices in both tasks" },
          { name: "Section C", type: litSecType, count: 5, unitMark: 4, marksPerQ: "3-7 Marks", total: 20, choice: "1 RTC (4M) + 3 SA (9M) + 1 LA (7M)" }
        ];
      } else if (className === "Class 6" || className === "Class 7" || className === "Class 8") {
        sections = [
          { name: "Section A", type: "Reading Skills (1 Short Unseen Passage)", count: 1, unitMark: 8, marksPerQ: "8 Marks", total: 8, choice: "Comprehension & Vocabulary" },
          { name: "Section B", type: "Writing & Grammar (Grammar 8M + Writing 6M)", count: 2, unitMark: 7, marksPerQ: "6-8 Marks", total: 14, choice: "Grammar MCQs/Editing (8M) + Notice/Letter/Story (6M)" },
          { name: "Section C", type: litSecType, count: 5, unitMark: 3.6, marksPerQ: "3-5 Marks", total: 18, choice: "1 RTC (4M) + 3 SA (9M) + 1 LA (5M)" }
        ];
      } else if (className === "Class 9") {
        // Class 9 (NCERT Kaveri)
        sections = [
          { name: "Section A", type: "Reading Skills (1 Unseen Discursive/Case Passage)", count: 1, unitMark: 10, marksPerQ: "10 Marks", total: 10, choice: "10 Objective & Inference Qs" },
          { name: "Section B", type: "Writing Skills & Grammar (Grammar 5M + Descriptive Para/Diary/Story 5M)", count: 2, unitMark: 5, marksPerQ: "5 Marks", total: 10, choice: "Grammar MCQs + Descriptive Para OR Diary/Story" },
          { name: "Section C", type: litSecType, count: 5, unitMark: 4, marksPerQ: "3-6 Marks", total: 20, choice: "1 RTC (5M) + 3 SA (9M) + 1 LA (6M)" }
        ];
      } else {
        // Class 10 / Generic English
        sections = [
          { name: "Section A", type: "Reading Skills (1 Unseen Discursive/Case Passage)", count: 1, unitMark: 10, marksPerQ: "10 Marks", total: 10, choice: "10 Objective & Inference Qs" },
          { name: "Section B", type: "Writing Skills & Grammar (Grammar 5M + Letter/Para 5M)", count: 2, unitMark: 5, marksPerQ: "5 Marks", total: 10, choice: "Grammar MCQs + Letter OR Para" },
          { name: "Section C", type: litSecType, count: 5, unitMark: 4, marksPerQ: "3-6 Marks", total: 20, choice: "1 RTC (5M) + 3 SA (9M) + 1 LA (6M)" }
        ];
      }
    } else if (subLower.includes("hindi")) {
      let vyakaranType = "व्यावहारिक व्याकरण (8 बहुविकल्पी प्रश्न)";
      if (subLower.includes("course-a") || subLower.includes("hindi a") || subLower.includes("hindi (r1)") || subLower.includes("hindi r1") || subLower.includes("002")) {
        vyakaranType = "व्यावहारिक व्याकरण (वाच्य, पद-परिचय, वाक्य भेद, अलंकार)";
      } else if (subLower.includes("course-b") || subLower.includes("hindi b") || subLower.includes("hindi (r2") || subLower.includes("hindi r2") || subLower.includes("ganga") || subLower.includes("085")) {
        if (className === "Class 9") {
          vyakaranType = "व्यावहारिक व्याकरण (शब्द व पद, अनुस्वार-अनुनासिक, उपसर्ग-प्रत्यय, स्वर संधि, विराम चिह्न, वाक्य भेद)";
        } else {
          vyakaranType = "व्यावहारिक व्याकरण (पदबंध, रचना के आधार पर वाक्य रूपांतरण, समास, मुहावरे)";
        }
      } else if (className === "Class 11" || className === "Class 12") {
        vyakaranType = "अभिव्यक्ति और माध्यम (जनसंचार व पत्रकारिता आधारित प्रश्न)";
      }

      sections = [
        { name: "खण्ड 'क'", type: "अपठित बोध (1 अपठित गद्यांश - 250-300 शब्द)", count: 1, unitMark: 8, marksPerQ: "8 Marks", total: 8, choice: "MCQs & Short Comprehension" },
        { name: "खण्ड 'ख'", type: vyakaranType, count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "8 MCQs on Prescribed Topics" },
        { name: "खण्ड 'ग'", type: "पाठ्यपुस्तक व पूरक पुस्तक (साहित्य)", count: 4, unitMark: 3.5, marksPerQ: "3-4 Marks", total: 14, choice: "1 RTC (4M) + 2 SA (6M) + 1 LA (4M)" },
        { name: "खण्ड 'घ'", type: "रचनात्मक लेखन (अनुच्छेद लेखन 5M + पत्र/ई-मेल 5M)", count: 2, unitMark: 5, marksPerQ: "5 Marks", total: 10, choice: "Internal choices in both writing tasks" }
      ];
    } else if (subLower.includes("sanskrit")) {
      sections = [
        { name: "खण्डः 'क'", type: "अपठित-अवबोधनम् (1 सरल अपठित-गद्यांशः)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "एकपदेन, पूर्णवाक्येन, शीर्षकम्" },
        { name: "खण्डः 'ख'", type: "रचनात्मक-कार्यम् (पत्रलेखनम् 4M + चित्र/अनुवादः 4M)", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "मञ्जूषाधारित पत्रं व चित्रवर्णनम्" },
        { name: "खण्डः 'ग'", type: "अनुप्रयुक्त-व्याकरणम् (सन्धि, समास, प्रत्ययाः, अव्ययाः)", count: 3, unitMark: 4, marksPerQ: "4 Marks", total: 12, choice: "12 वस्तुनिष्ठ बहुविकल्पी प्रश्नाः" },
        { name: "खण्डः 'घ'", type: "पठित-अवबोधनम् (पाठ्यपुस्तक श्लोक/गद्यांश/प्रश्नोत्तर)", count: 4, unitMark: 3.75, marksPerQ: "3-4 Marks", total: 15, choice: "पद्यांश अवबोधनम्, अन्वयः व प्रश्ननिर्माणम्" }
      ];
    } else if (subLower.includes("social science") || subLower.includes("social studies") || subLower.includes("sst") || subLower.includes("087")) {
      sections = [
        { name: "Section A", type: "Objective Type & Assertion-Reasoning (History, Geo, Civics, Eco)", count: 8, unitMark: 1, marksPerQ: "1 Mark", total: 8, choice: "6 MCQs + 2 Assertion-Reasoning" },
        { name: "Section B", type: "Very Short Answer (VSA - 40 words)", count: 3, unitMark: 2, marksPerQ: "2 Marks", total: 6, choice: "Internal choice in 1 Q" },
        { name: "Section C", type: "Short Answer (SA - 60 words)", count: 4, unitMark: 3, marksPerQ: "3 Marks", total: 12, choice: "Internal choice in 1 Q" },
        { name: "Section D", type: "Long Answer (LA - 120 words)", count: 2, unitMark: 5, marksPerQ: "5 Marks", total: 10, choice: "Internal choice in 1 Q" },
        { name: "Section E", type: "Case-Based Integrated Study / Map Work", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "3M Case/Source + 1M Map Location" }
      ];
    } else if (subLower.includes("general knowledge") || subLower.includes("gk")) {
      sections = [
        { name: "Section A", type: "Multiple Choice Questions (Current Affairs, Science & Tech, India)", count: 15, unitMark: 1, marksPerQ: "1 Mark", total: 15, choice: "All Compulsory" },
        { name: "Section B", type: "One-Word Answer / Identification (Personalities, Monuments, Sobriquets)", count: 10, unitMark: 1, marksPerQ: "1 Mark", total: 10, choice: "Direct Identification" },
        { name: "Section C", type: "Fill in the Blanks & Match Columns (Sports, Books, Currencies)", count: 10, unitMark: 1, marksPerQ: "1 Mark", total: 10, choice: "All Compulsory" },
        { name: "Section D", type: "Logical Reasoning & Mental Ability Trivia (Patterns, Series, Analogies)", count: 5, unitMark: 1, marksPerQ: "1 Mark", total: 5, choice: "All Compulsory" }
      ];
    } else {
      sections = [
        { name: "Section A", type: "MCQs & Assertion-Reasoning", count: 8, unitMark: 1, marksPerQ: "1 Mark", total: 8, choice: "Compulsory" },
        { name: "Section B", type: "Very Short Answer (VSA)", count: 4, unitMark: 2, marksPerQ: "2 Marks", total: 8, choice: "Internal choice in 1 Q" },
        { name: "Section C", type: "Short Answer (SA)", count: 4, unitMark: 3, marksPerQ: "3 Marks", total: 12, choice: "Internal choice in 1 Q" },
        { name: "Section D", type: "Long Answer (LA)", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in 1 Q" },
        { name: "Section E", type: "Case-Based Integrated Study", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Sub-part internal choice" }
      ];
    }
  }
  // 3. Skill Subjects (50 Marks / 2 Hours)
  else if (isSkill || marks === 50) {
    sections = [
      { name: "Part A (I)", type: "Employability Skills (Objective)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Answer 4 out of 6 Qs" },
      { name: "Part A (II)", type: "Employability Skills (Short Answer)", count: 3, unitMark: 2, marksPerQ: "2 Marks", total: 6, choice: "Answer 3 out of 5 Qs" },
      { name: "Part B (I)", type: "Subject Specific (Objective / MCQs)", count: 15, unitMark: 1, marksPerQ: "1 Mark", total: 15, choice: "Answer 15 out of 20 Qs" },
      { name: "Part B (II)", type: "Subject Specific (Short Answer)", count: 5, unitMark: 2, marksPerQ: "2 Marks", total: 10, choice: "Answer 5 out of 6 Qs" },
      { name: "Part B (III)", type: "Subject Specific (Descriptive / LA)", count: 3, unitMark: 5, marksPerQ: "5 Marks", total: 15, choice: "Answer 3 out of 5 Qs" }
    ];
  }
  // 4. English (80 Marks / 3 Hours)
  else if (subLower.includes("english") && marks >= 75) {
    const litBook = getCleanLiteratureBookName(className, subjectName);
    const litSecType = litBook ? `Language Through Literature (${litBook})` : "Language Through Literature";

    if (className === "Class 11" || className === "Class 12") {
      // Class 11 follows the Class 12 board exam structure exactly (same
      // section layout, mark/question distribution) per school policy -
      // only the actual prescribed literature book differs, which
      // litSecType already resolves correctly per class.
      sections = [
        { name: "Section A", type: "Reading Skills (2 Unseen Passages - Discursive & Case-based)", count: 2, unitMark: 11, marksPerQ: "10-12 Marks", total: 22, choice: "Passage 1 Discursive (12M) + Passage 2 Case-based (10M)" },
        { name: "Section B", type: "Creative Writing Skills", count: 4, unitMark: 4.5, marksPerQ: "4-5 Marks", total: 18, choice: "Notice (4M) + Invitation & Reply (4M) + Letter / Job App (5M) + Article / Report (5M)" },
        { name: "Section C", type: litSecType, count: 6, unitMark: 6.6, marksPerQ: "2-5 Marks", total: 40, choice: "Poetry RTC (6M) + Supplementary Reader RTC (4M) + Prose RTC (6M) + SA (14M) + LA (10M)" }
      ];
    } else if (className === "Class 6" || className === "Class 7" || className === "Class 8") {
      sections = [
        { name: "Section A", type: "Reading Skills (2 Unseen Passages)", count: 2, unitMark: 10, marksPerQ: "10 Marks", total: 20, choice: "Passage 1 Factual/Discursive (10M) + Passage 2 Case-based (10M)" },
        { name: "Section B", type: "Writing Skills & Applied Grammar", count: 6, unitMark: 5, marksPerQ: "3-5 Marks", total: 30, choice: "Notice (5M) + Letter/Story/Diary (5M) + Grammar (20M: Gap Fill, Editing, Reordering)" },
        { name: "Section C", type: litSecType, count: 6, unitMark: 5, marksPerQ: "3-6 Marks", total: 30, choice: "1 Prose RTC (5M) + 1 Poetry RTC (5M) + Short Answers (12M) + Long Answer (8M)" }
      ];
    } else if (className === "Class 9") {
      sections = [
        { name: "Section A", type: "Reading Skills (2 Unseen Passages - Discursive & Case-based)", count: 2, unitMark: 10, marksPerQ: "10 Marks", total: 20, choice: "10M Discursive + 10M Case Factual" },
        { name: "Section B", type: "Writing Skills & Applied Grammar", count: 4, unitMark: 5, marksPerQ: "5 Marks", total: 20, choice: "Grammar (10M) + Descriptive Paragraph (5M) + Diary Entry / Story (5M)" },
        { name: "Section C", type: litSecType, count: 8, unitMark: 5, marksPerQ: "5 Marks", total: 40, choice: "RTCs (10M) + SA (18M) + LA (12M)" }
      ];
    } else {
      // Class 10 / Generic English
      sections = [
        { name: "Section A", type: "Reading Skills (2 Unseen Passages)", count: 2, unitMark: 10, marksPerQ: "10 Marks", total: 20, choice: "10M Discursive + 10M Case Factual" },
        { name: "Section B", type: "Writing Skills & Applied Grammar", count: 4, unitMark: 5, marksPerQ: "5 Marks", total: 20, choice: "Grammar (10M) + Letter (5M) + Analytical Para (5M)" },
        { name: "Section C", type: litSecType, count: 8, unitMark: 5, marksPerQ: "5 Marks", total: 40, choice: "RTCs (10M) + SA (18M) + LA (12M)" }
      ];
    }
  }
  // 5. Hindi Course R1 & R2 (80 Marks / 3 Hours)
  else if (subLower.includes("hindi") && marks >= 75) {
    const isR1 = subLower.includes("r1") || subLower.includes("course a") || subLower.includes("hindi a");
    const readingType = isR1 ? "अपठित बोध (1 गद्यांश 200 शब्द 7M + 1 काव्यांश 80-100 शब्द 7M)" : "अपठित बोध (2 अपठित गद्यांश प्रत्येक 200 शब्द 7M+7M)";
    const vyakaranChoice = isR1 ? "उपसर्ग/प्रत्यय (4M) + पद विचार (4M) + वाक्य-भेद (4M) + अलंकार (4M)" : "समानार्थी/मुहावरे (4M) + उपसर्ग/प्रत्यय (4M) + विराम चिह्न (2M) + संज्ञा/सर्वनाम/निपात (6M)";
    const writingChoice = isR1 ? "अनुच्छेद (120w, 5M) + पत्र (100w, 5M) + संवाद (80w, 5M) + सूचना लेखन (80w, 5M)" : "अनुच्छेद (100w, 5M) + पत्र (100w, 5M) + संवाद (80w, 5M) + चित्र-वर्णन (80w, 5M)";

    sections = [
      { name: "खण्ड 'क'", type: readingType, count: 2, unitMark: 7, marksPerQ: "7 Marks", total: 14, choice: "3 MCQs (3M) + 2 Short Qs (4M) per passage" },
      { name: "खण्ड 'ख'", type: "व्यावहारिक व्याकरण (20 में से 16 प्रश्न)", count: 4, unitMark: 4, marksPerQ: "4 Marks", total: 16, choice: vyakaranChoice },
      { name: "खण्ड 'ग'", type: "पाठ्यपुस्तक (गंगा - गद्य खंड 15M + काव्य खंड 15M)", count: 6, unitMark: 5, marksPerQ: "5 Marks", total: 30, choice: "गद्यांश व काव्यांश आधारित बोध एवं प्रश्नोत्तर" },
      { name: "खण्ड 'घ'", type: "रचनात्मक लेखन (4 लेखन कार्य)", count: 4, unitMark: 5, marksPerQ: "5 Marks", total: 20, choice: writingChoice }
    ];
  }
  // 6. Sanskrit (80 Marks / 3 Hours)
  else if (subLower.includes("sanskrit") && marks >= 75) {
    sections = [
      { name: "खण्डः 'क'", type: "अपठित-अवबोधनम् (गद्यांश आधारित)", count: 1, unitMark: 10, marksPerQ: "10 Marks", total: 10, choice: "One-word, Full-sentence & Grammar Qs" },
      { name: "खण्डः 'ख'", type: "रचनात्मक-कार्यम् (पत्र, चित्र/अनुवाद)", count: 3, unitMark: 5, marksPerQ: "5 Marks", total: 15, choice: "Patralekhanam (5M) + Chitra/Anuvad (10M)" },
      { name: "खण्डः 'ग'", type: "अनुप्रयुक्त-व्याकरणम् (सन्धि, समास, प्रत्यय, अव्यय)", count: 5, unitMark: 5, marksPerQ: "5 Marks", total: 25, choice: "MCQs & Sentence Transformation" },
      { name: "खण्डः 'घ'", type: "पठित-अवबोधनम् (पाठ्यपुस्तक श्लोक/गद्यांश/प्रश्नोत्तर)", count: 6, unitMark: 5, marksPerQ: "5 Marks", total: 30, choice: "Gadyansh, Padyansh, Natyansh, Anvaya & Bhavartha" }
    ];
  }
  // 7. Senior Secondary / General 70M Sciences & Practical Electives (Physics, Chemistry, Biology, CS, IP, Geography, Psychology, Physical Ed)
  else if (marks === 70 || (marks < 75 && (className === "Class 11" || className === "Class 12") && (subLower.includes("physics") || subLower.includes("chemistry") || subLower.includes("biology") || subLower.includes("psychology") || subLower.includes("computer science") || subLower.includes("informatics practices") || subLower.includes("geography") || subLower.includes("physical education") || subLower.includes("biotechnology")))) {
    sections = [
      { name: "Section A", type: "MCQs & Assertion-Reasoning", count: 16, unitMark: 1, marksPerQ: "1 Mark", total: 16, choice: "12 MCQs + 4 Assertion-Reason" },
      { name: "Section B", type: "Very Short Answer (VSA)", count: 5, unitMark: 2, marksPerQ: "2 Marks", total: 10, choice: "Internal choice in 2 Qs" },
      { name: "Section C", type: "Short Answer (SA)", count: 7, unitMark: 3, marksPerQ: "3 Marks", total: 21, choice: "Internal choice in 1 Q" },
      { name: "Section D", type: "Case-Based / Source Integrated", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Internal choice in 2-mark sub-part" },
      { name: "Section E", type: "Long Answer (LA)", count: 3, unitMark: 5, marksPerQ: "5 Marks", total: 15, choice: "Internal choice in all 3 Qs" }
    ];
  }
  // 8. Accountancy (Class 11-12): CBSE does not use the generic A-E template
  // here. The real paper is split into Part A and Part B by syllabus content,
  // and its questions run on a 1 / 3 / 4 / 6 mark ladder with no 2 or 5 mark
  // questions at all. Class 11 mirrors the same ladder against its own 56 / 24
  // syllabus weighting (Financial Accounting I and II).
  else if (marks >= 75 && (className === "Class 11" || className === "Class 12") && subLower.includes("account")) {
    const isTwelve = className === "Class 12";
    const partAName = isTwelve
      ? "Part A: Accounting for Partnership Firms & Companies"
      : "Part A: Financial Accounting - I";
    const partBName = isTwelve
      ? "Part B: Analysis of Financial Statements (OR Computerised Accounting)"
      : "Part B: Financial Accounting - II";

    sections = isTwelve ? [
      { name: partAName, type: "Objective (MCQ / Assertion-Reasoning / Fill-ups)", count: 16, unitMark: 1, marksPerQ: "1 Mark", total: 16, choice: "Q1-Q16. Objective questions on partnership and company accounts" },
      { name: partAName, type: "Short Answer - practical working", count: 4, unitMark: 3, marksPerQ: "3 Marks", total: 12, choice: "Q17-Q20. Journal entries / ledger / short numerical working" },
      { name: partAName, type: "Short Answer - numerical", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Q21-Q22. Numerical problems with internal choice" },
      { name: partAName, type: "Long Answer - full numerical", count: 4, unitMark: 6, marksPerQ: "6 Marks", total: 24, choice: "Q23-Q26. Admission/Retirement/Death, Dissolution, Share & Debenture accounts" },
      { name: partBName, type: "Objective (MCQ / Assertion-Reasoning)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Q27-Q30. Objective questions" },
      { name: partBName, type: "Short Answer - practical working", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Q31-Q32. Ratio / statement working" },
      { name: partBName, type: "Short Answer - numerical", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Q33. Numerical problem" },
      { name: partBName, type: "Long Answer - full numerical", count: 1, unitMark: 6, marksPerQ: "6 Marks", total: 6, choice: "Q34. Cash Flow Statement / comprehensive analysis" }
    ] : [
      { name: partAName, type: "Objective (MCQ / Assertion-Reasoning / Fill-ups)", count: 16, unitMark: 1, marksPerQ: "1 Mark", total: 16, choice: "Q1-Q16. Theoretical framework and accounting process" },
      { name: partAName, type: "Short Answer - practical working", count: 4, unitMark: 3, marksPerQ: "3 Marks", total: 12, choice: "Q17-Q20. Journal entries / ledger / short numerical working" },
      { name: partAName, type: "Short Answer - numerical", count: 1, unitMark: 4, marksPerQ: "4 Marks", total: 4, choice: "Q21. Numerical problem with internal choice" },
      { name: partAName, type: "Long Answer - full numerical", count: 4, unitMark: 6, marksPerQ: "6 Marks", total: 24, choice: "Q22-Q25. Bank Reconciliation, Depreciation, Trial Balance & Rectification" },
      { name: partBName, type: "Objective (MCQ / Assertion-Reasoning)", count: 4, unitMark: 1, marksPerQ: "1 Mark", total: 4, choice: "Q26-Q29. Objective questions" },
      { name: partBName, type: "Short Answer - practical working", count: 2, unitMark: 3, marksPerQ: "3 Marks", total: 6, choice: "Q30-Q31. Adjustments / short working" },
      { name: partBName, type: "Short Answer - numerical", count: 2, unitMark: 4, marksPerQ: "4 Marks", total: 8, choice: "Q32-Q33. Numerical problems" },
      { name: partBName, type: "Long Answer - full numerical", count: 1, unitMark: 6, marksPerQ: "6 Marks", total: 6, choice: "Q34. Financial Statements of Sole Proprietorship with adjustments" }
    ];
  }
  // 9. Standard 80M Board Subjects (Math, Science 9/10, SST 9/10, Economics, etc.)
  else {
    const isSecSocial = (className === "Class 9" || className === "Class 10") && (subLower.includes("social") || subLower.includes("sst") || subLower.includes("087"));
    // Only Class 9-10 use the Biology/Chemistry/Physics subject-based split -
    // their NCERT syllabus is genuinely organized into those three
    // disciplines, matching the real Class 10 board pattern. Class 6-8's
    // Science syllabus is thematically integrated (e.g. "Beyond Earth",
    // "Nature's Treasures", "Materials Around Us" don't map cleanly onto
    // Biology/Chemistry/Physics), so it keeps the plain type-based template
    // (MCQ/VSA/SA/LA/Case) at every mark tier, including the full exam.
    const isSecScience = !isSecSocial && (className === "Class 9" || className === "Class 10") && subLower.includes("science");

    if (isSecScience) {
      // CBSE's real Class 9/10 Science paper is NOT split into type-based
      // sections (MCQ/VSA/SA/LA/Case) - it's split into 3 SUBJECT sections
      // (Biology, Chemistry, Physics), each of which internally contains its
      // own mix of every question type. Marks per subject match CBSE's
      // official unit weightage (World of Living + Our Environment = 30,
      // Chemical Substances = 25, Natural Phenomena + Effects of Current = 25).
      sections = [
        { name: "Section A", type: "Biology (World of Living + Our Environment)", count: 15, unitMark: 2, marksPerQ: "Mixed (1/2/3/4/5 Marks)", total: 30, choice: "8 MCQ/Assertion-Reasoning (8M) + 2 VSA (4M) + 3 SA (9M) + 1 LA (5M) + 1 Case-Based (4M)" },
        { name: "Section B", type: "Chemistry (Chemical Substances - Nature & Behaviour)", count: 12, unitMark: 2.1, marksPerQ: "Mixed (1/2/3/4/5 Marks)", total: 25, choice: "6 MCQ/Assertion-Reasoning (6M) + 2 VSA (4M) + 2 SA (6M) + 1 LA (5M) + 1 Case-Based (4M)" },
        { name: "Section C", type: "Physics (Natural Phenomena + Effects of Current)", count: 12, unitMark: 2.1, marksPerQ: "Mixed (1/2/3/4/5 Marks)", total: 25, choice: "6 MCQ/Assertion-Reasoning (6M) + 2 VSA (4M) + 2 SA (6M) + 1 LA (5M) + 1 Case-Based (4M)" }
      ];
    } else if (isSecSocial) {
      sections = [
        { name: "Section A", type: "MCQs & Assertion-Reasoning", count: 20, unitMark: 1, marksPerQ: "1 Mark", total: 20, choice: "18 MCQs + 2 Assertion-Reason" },
        { name: "Section B", type: "Very Short Answer (VSA - 40 words)", count: 4, unitMark: 2, marksPerQ: "2 Marks", total: 8, choice: "Internal choice in 1 Q" },
        { name: "Section C", type: "Short Answer (SA - 60 words)", count: 5, unitMark: 3, marksPerQ: "3 Marks", total: 15, choice: "Internal choice in 1 Q" },
        { name: "Section D", type: "Long Answer (LA - 120 words)", count: 4, unitMark: 5, marksPerQ: "5 Marks", total: 20, choice: "Internal choice in 2 Qs" },
        { name: "Section E", type: "Case-Based Integrated Questions", count: 3, unitMark: 4, marksPerQ: "4 Marks", total: 12, choice: "Internal choice in one sub-part" },
        { name: "Section F", type: "Map Skill Question (History 2M + Geo 3M)", count: 1, unitMark: 5, marksPerQ: "5 Marks", total: 5, choice: "CBSE Prescribed Map Syllabus" }
      ];
    } else {
      sections = [
        { name: "Section A", type: "MCQs & Assertion-Reasoning", count: 20, unitMark: 1, marksPerQ: "1 Mark", total: 20, choice: "18 MCQs + 2 Assertion-Reason" },
        { name: "Section B", type: "Very Short Answer (VSA)", count: 5, unitMark: 2, marksPerQ: "2 Marks", total: 10, choice: "Internal choice in 2 Qs" },
        { name: "Section C", type: "Short Answer (SA)", count: 6, unitMark: 3, marksPerQ: "3 Marks", total: 18, choice: "Internal choice in 2 Qs" },
        { name: "Section D", type: "Long Answer (LA)", count: 4, unitMark: 5, marksPerQ: "5 Marks", total: 20, choice: "Internal choice in 2 Qs" },
        { name: "Section E", type: "Case-Based / Integrated Study", count: 3, unitMark: 4, marksPerQ: "4 Marks", total: 12, choice: "Internal choice in one sub-part" }
      ];
    }
  }

  const calculatedMarks = sections.reduce((acc, s) => acc + (s.total !== undefined ? s.total : (s.count * s.unitMark)), 0);
  const totalQuestions = sections.reduce((acc, s) => acc + s.count, 0);

  return {
    className,
    subjectName,
    examName,
    targetTotalMarks: calculatedMarks || marks,
    marks: calculatedMarks || marks,
    duration,
    totalQuestions,
    competencyRatio,
    sections,
    isModified: false
  };
}

// Cascading Auto-Balancing Function
window.changeSectionQuestionCount = function(k, delta) {
  if (!currentBlueprintState || !currentBlueprintState.sections[k]) return;
  
  const sections = currentBlueprintState.sections;
  const targetTotal = currentBlueprintState.targetTotalMarks;
  const sec = sections[k];
  const unit = sec.unitMark || 1;
  
  if (delta < 0 && sec.count <= 0) return;
  
  // For 1-mark questions paired with 2-mark or multi-mark sections, step by 2 marks so it cleanly trades with 1 question of Section B/etc.
  let stepDelta = delta;
  if (unit === 1 && Math.abs(delta) === 1) {
    const nextSec = sections[(k + 1) % sections.length];
    if (nextSec && nextSec.unitMark === 2) {
      stepDelta = delta * 2;
    }
  }
  
  if (delta < 0 && sec.count + stepDelta < 0) {
    stepDelta = -sec.count;
  }
  
  if (stepDelta === 0) return;
  
  // Apply step change to targeted section
  sec.count += stepDelta;
  sec.total = sec.count * unit;
  
  // Calculate difference from targetTotal
  let currentSum = sections.reduce((acc, s) => acc + (s.count * s.unitMark), 0);
  let diff = targetTotal - currentSum;
  const numSecs = sections.length;
  
  if (diff < 0) {
    // Need to reduce marks from other sections
    let needReduce = -diff;
    for (let step = 1; step < numSecs; step++) {
      const idx = (k + step) % numSecs;
      const targetSec = sections[idx];
      const targetUnit = targetSec.unitMark || 1;
      
      while (targetSec.count > 0 && needReduce >= targetUnit) {
        targetSec.count -= 1;
        targetSec.total = targetSec.count * targetUnit;
        needReduce -= targetUnit;
      }
      if (needReduce === 0) break;
    }
    
    // If fractional remainder remains, reduce 1 more question from next available section and refund surplus to section k
    if (needReduce > 0) {
      for (let step = 1; step < numSecs; step++) {
        const idx = (k + step) % numSecs;
        const targetSec = sections[idx];
        const targetUnit = targetSec.unitMark || 1;
        if (targetSec.count > 0) {
          targetSec.count -= 1;
          targetSec.total = targetSec.count * targetUnit;
          const over = targetUnit - needReduce;
          needReduce = 0;
          sec.count += Math.floor(over / unit);
          sec.total = sec.count * unit;
          break;
        }
      }
    }
  } else if (diff > 0) {
    // Need to add marks to other sections
    let needAdd = diff;
    for (let step = 1; step < numSecs; step++) {
      const idx = (k + step) % numSecs;
      const targetSec = sections[idx];
      const targetUnit = targetSec.unitMark || 1;
      
      while (needAdd >= targetUnit) {
        targetSec.count += 1;
        targetSec.total = targetSec.count * targetUnit;
        needAdd -= targetUnit;
      }
      if (needAdd === 0) break;
    }
    
    // Fine-tune any remainder into 1-mark section
    if (needAdd > 0) {
      for (const s of sections) {
        if (s.unitMark === 1 && s !== sec) {
          s.count += needAdd;
          s.total = s.count * 1;
          needAdd = 0;
          break;
        }
      }
      if (needAdd > 0) {
        sec.count += needAdd;
        sec.total = sec.count * 1;
      }
    }
  }
  
  // Re-sync all section totals & metadata
  sections.forEach(s => { s.total = s.count * s.unitMark; });
  currentBlueprintState.totalQuestions = sections.reduce((acc, s) => acc + s.count, 0);
  currentBlueprintState.marks = sections.reduce((acc, s) => acc + s.total, 0);
  currentBlueprintState.isModified = true;
  
  renderBlueprintView();
};

window.resetBlueprintToDefault = function() {
  currentBlueprintState = null;
  updateExamBlueprint(true);
};

function getQsPerSubtopic() {
  const input = document.getElementById('qsPerSubtopicInput');
  const val = input ? parseInt(input.value, 10) : 30;
  return (!isNaN(val) && val > 0) ? Math.max(1, Math.min(100, val)) : 30;
}

window.setQsPerSubtopic = function(newVal) {
  const val = Math.max(1, Math.min(100, newVal));
  const input = document.getElementById('qsPerSubtopicInput');
  if (input) input.value = val;
  
  // Update active state on preset buttons
  document.querySelectorAll('.qs-preset-btn').forEach(btn => {
    const btnQs = parseInt(btn.getAttribute('data-qs'), 10);
    btn.classList.toggle('active', btnQs === val);
  });
  
  syncWorksheetDynamicScaling();
};

// Dynamic Question Typology Distribution Algorithm (Hamilton / Largest Remainder Proportional Method)
// Universal All-Subject Engine: dynamically adapts to Science, Math, Commerce, Social Science, Language, Computer
export function calculateTypologyDistribution(totalQs, tier = "CBSE_SEC_AB", subjectName = "") {
  const N = Math.max(1, totalQs);
  const domain = detectSubjectDomain(subjectName);
  
  // Normalize legacy tier names if passed
  let effectiveTier = tier;
  if (tier === "LOTS") effectiveTier = "CBSE_SEC_AB";
  else if (tier === "HOTS") effectiveTier = "CBSE_HOTS";
  else if (tier === "LADDER") effectiveTier = "CBSE_FULL";
  else if (tier === "MOTS") effectiveTier = "CBSE_SUBJECTIVE";

  let typologies = [];

  if (effectiveTier === "CBSE_SEC_AB") {
    // Mode 1: Section A & B Foundational Recall & Reasoning (1 & 2 Marks)
    if (domain === "math") {
      typologies = [
        { id: 1, section: "Section A", name: "Core Definitions, Properties & Axioms", marks: "1 Mark each", type: "Property Recall", weight: 0.20 },
        { id: 2, section: "Section A", name: "Formulas, Standard Values & Identity Checks", marks: "1 Mark each", type: "Formula Precision", weight: 0.175 },
        { id: 3, section: "Section A", name: "CBSE Board Assertion–Reasoning (A/R)", marks: "1 Mark each", type: "Mathematical Logic", weight: 0.20 },
        { id: 4, section: "Section B", name: "2-Step Short Proofs & Identity Verification", marks: "2 Marks each", type: "Short Verification", weight: 0.175 },
        { id: 5, section: "Section B", name: "Conceptual Mathematical Explanations", marks: "2 Marks each", type: "Reasoned Working", weight: 0.15 },
        { id: 6, section: "Section B", name: "Geometric, Coordinate & Graph Conventions", marks: "1–2 Marks", type: "Graph/Figure Rules", weight: 0.10 }
      ];
    } else if (domain === "commerce") {
      typologies = [
        { id: 1, section: "Section A", name: "Accounting Rules, Legal Provisions & Principles", marks: "1 Mark each", type: "Statutory Recall", weight: 0.20 },
        { id: 2, section: "Section A", name: "Account Heads, Technical Terms & Classification", marks: "1 Mark each", type: "Terminology Precision", weight: 0.175 },
        { id: 3, section: "Section A", name: "CBSE Board Assertion–Reasoning (A/R)", marks: "1 Mark each", type: "Commercial Logic", weight: 0.20 },
        { id: 4, section: "Section B", name: "Structured Tabular Distinctions on Parameters", marks: "2 Marks each", type: "Comparative Analysis", weight: 0.175 },
        { id: 5, section: "Section B", name: "Conceptual Principles & Practical Reasoning", marks: "2 Marks each", type: "Reasoned Working", weight: 0.15 },
        { id: 6, section: "Section B", name: "Journal Format, Ledger & Reporting Conventions", marks: "1–2 Marks", type: "Format Precision", weight: 0.10 }
      ];
    } else if (domain === "social_science") {
      typologies = [
        { id: 1, section: "Section A", name: "Key Historical Dates, Acts, Articles & Terms", marks: "1 Mark each", type: "Direct Recall", weight: 0.20 },
        { id: 2, section: "Section A", name: "Socio-Economic Indicators & Geographic Concepts", marks: "1 Mark each", type: "Concept Precision", weight: 0.175 },
        { id: 3, section: "Section A", name: "CBSE Board Assertion–Reasoning (A/R)", marks: "1 Mark each", type: "Causal Logic", weight: 0.20 },
        { id: 4, section: "Section B", name: "2-Point Structured Comparative Distinctions", marks: "2 Marks each", type: "Comparative Analysis", weight: 0.175 },
        { id: 5, section: "Section B", name: "Short Causal Reasoning ('Give Reasons Why')", marks: "2 Marks each", type: "Analytical Reasoning", weight: 0.15 },
        { id: 6, section: "Section B", name: "Map Items, Source Symbols & Timeline Conventions", marks: "1–2 Marks", type: "Map/Timeline Rules", weight: 0.10 }
      ];
    } else if (domain === "language") {
      typologies = [
        { id: 1, section: "Section A", name: "Vocabulary in Context, Synonyms & Antonyms", marks: "1 Mark each", type: "Lexical Precision", weight: 0.20 },
        { id: 2, section: "Section A", name: "Poetic Devices, Figures of Speech & Grammar Rules", marks: "1 Mark each", type: "Grammar & Devices", weight: 0.175 },
        { id: 3, section: "Section A", name: "CBSE Assertion–Reasoning on Character/Text", marks: "1 Mark each", type: "Textual Interpretation", weight: 0.20 },
        { id: 4, section: "Section B", name: "2-Point Thematic & Character Contrasts", marks: "2 Marks each", type: "Character/Theme Contrast", weight: 0.175 },
        { id: 5, section: "Section B", name: "Short Textual Answers (30–40 Words) with Keywords", marks: "2 Marks each", type: "Textual Deduction", weight: 0.15 },
        { id: 6, section: "Section B", name: "Formal Writing Layout & Format Conventions", marks: "1–2 Marks", type: "Writing Formats", weight: 0.10 }
      ];
    } else if (domain === "computer") {
      typologies = [
        { id: 1, section: "Section A", name: "Keywords, Syntax Rules & Data Representation", marks: "1 Mark each", type: "Syntax Precision", weight: 0.20 },
        { id: 2, section: "Section A", name: "Network Protocols, Module Methods & Types", marks: "1 Mark each", type: "Technical Definitions", weight: 0.175 },
        { id: 3, section: "Section A", name: "CBSE Assertion–Reasoning on Program Logic", marks: "1 Mark each", type: "Algorithmic Logic", weight: 0.20 },
        { id: 4, section: "Section B", name: "Structured Differences (e.g. List vs Tuple)", marks: "2 Marks each", type: "Construct Comparison", weight: 0.175 },
        { id: 5, section: "Section B", name: "Code Snippet Tracing & Output Prediction", marks: "2 Marks each", type: "Dry-Run Analysis", weight: 0.15 },
        { id: 6, section: "Section B", name: "SQL Syntax, Clauses & Indentation Conventions", marks: "1–2 Marks", type: "Coding Conventions", weight: 0.10 }
      ];
    } else {
      // Science / General
      typologies = [
        { id: 1, section: "Section A", name: "Core Definitions, Laws & Boundary Conditions", marks: "1 Mark each", type: "Precision Recall", weight: 0.20 },
        { id: 2, section: "Section A", name: "SI Units, Dimensions & Physical Significance", marks: "1 Mark each", type: "Dimensional Clarity", weight: 0.175 },
        { id: 3, section: "Section A", name: "CBSE Board Assertion–Reasoning (A/R)", marks: "1 Mark each", type: "Causal Understanding", weight: 0.20 },
        { id: 4, section: "Section B", name: "Structured Tabular Distinctions on Criteria", marks: "2 Marks each", type: "Analytical Contrast", weight: 0.175 },
        { id: 5, section: "Section B", name: "Conceptual 'Give Reasons Why' Explanations", marks: "2 Marks each", type: "Qualitative Reasoning", weight: 0.15 },
        { id: 6, section: "Section B", name: "Diagram Identification & Representation Conventions", marks: "1–2 Marks", type: "Visual Conventions", weight: 0.10 }
      ];
    }
  } else if (effectiveTier === "CBSE_HOTS") {
    // Mode 2: HOTS & Advanced Analytical Challenge (3M, 4M & 5M)
    if (domain === "math") {
      typologies = [
        { id: 1, section: "Section C", name: "Multi-Concept Integration & Algebraic Synthesis", marks: "3 Marks each", type: "Analytical Synthesis", weight: 0.25 },
        { id: 2, section: "Section C", name: "'Spot the Mathematical Fallacy' Step-Error Analysis", marks: "3 Marks each", type: "Critical Evaluation", weight: 0.25 },
        { id: 3, section: "Section C", name: "Non-Routine Parametric & Geometric Deductions", marks: "3 Marks each", type: "Parametric Reasoning", weight: 0.20 },
        { id: 4, section: "Section D", name: "Applied Mathematical Modeling & Case Scenarios", marks: "4 Marks each", type: "Mathematical Modeling", weight: 0.15 },
        { id: 5, section: "Section D", name: "Comprehensive Multi-Concept Proofs & Theorems", marks: "5 Marks each", type: "Complex Problem Solving", weight: 0.15 }
      ];
    } else if (domain === "commerce") {
      typologies = [
        { id: 1, section: "Section C", name: "Multi-Concept Commercial & Financial Problem Solving", marks: "3 Marks each", type: "Analytical Synthesis", weight: 0.25 },
        { id: 2, section: "Section C", name: "'Spot the Accounting/Economic Error' Troubleshooting", marks: "3 Marks each", type: "Critical Evaluation", weight: 0.25 },
        { id: 3, section: "Section C", name: "Parametric Financial Variations & Ratio Deductions", marks: "3 Marks each", type: "Parametric Reasoning", weight: 0.20 },
        { id: 4, section: "Section D", name: "Case-Based Corporate Strategy & Business Scenarios", marks: "4 Marks each", type: "Business Decision", weight: 0.15 },
        { id: 5, section: "Section D", name: "Comprehensive Financial Synthesis & Evaluative Accounts", marks: "5 Marks each", type: "Complex Problem Solving", weight: 0.15 }
      ];
    } else if (domain === "social_science") {
      typologies = [
        { id: 1, section: "Section C", name: "Cross-Thematic Historical & Socio-Economic Linkages", marks: "3 Marks each", type: "Analytical Synthesis", weight: 0.25 },
        { id: 2, section: "Section C", name: "'Critique the Historical/Policy Argument' Analysis", marks: "3 Marks each", type: "Critical Evaluation", weight: 0.25 },
        { id: 3, section: "Section C", name: "Data Deductions & Demographic/Resource Trends", marks: "3 Marks each", type: "Parametric Reasoning", weight: 0.20 },
        { id: 4, section: "Section D", name: "Source-Based Analytical Extract & Historical Critique", marks: "4 Marks each", type: "Source Interpretation", weight: 0.15 },
        { id: 5, section: "Section D", name: "Comprehensive Evaluative Arguments & Constitutional Evidence", marks: "5 Marks each", type: "Complex Problem Solving", weight: 0.15 }
      ];
    } else if (domain === "language") {
      typologies = [
        { id: 1, section: "Section C", name: "Cross-Textual Thematic Synthesis & Motif Comparisons", marks: "3 Marks each", type: "Analytical Synthesis", weight: 0.25 },
        { id: 2, section: "Section C", name: "'Critique & Edit': Syntactic & Interpretive Error Analysis", marks: "3 Marks each", type: "Critical Evaluation", weight: 0.25 },
        { id: 3, section: "Section C", name: "Subtext, Irony & Figurative Language Deductions", marks: "3 Marks each", type: "Literary Deductions", weight: 0.20 },
        { id: 4, section: "Section D", name: "Analytical Paragraph & Data-Driven Argumentation", marks: "4 Marks each", type: "Argumentative Synthesis", weight: 0.15 },
        { id: 5, section: "Section D", name: "Comprehensive Evaluative Long Answer & Literary Critique", marks: "5 Marks each", type: "Complex Literary Critique", weight: 0.15 }
      ];
    } else if (domain === "computer") {
      typologies = [
        { id: 1, section: "Section C", name: "Multi-Paradigm Programming & Data Structure Synthesis", marks: "3 Marks each", type: "Analytical Synthesis", weight: 0.25 },
        { id: 2, section: "Section C", name: "'Spot the Logical Bug & Off-by-One' Troubleshooting", marks: "3 Marks each", type: "Critical Evaluation", weight: 0.25 },
        { id: 3, section: "Section C", name: "Algorithmic Efficiency & Stack Frame Deductions", marks: "3 Marks each", type: "Parametric Reasoning", weight: 0.20 },
        { id: 4, section: "Section D", name: "System Architecture, Network & DB Schema Design", marks: "4 Marks each", type: "System Design", weight: 0.15 },
        { id: 5, section: "Section D", name: "Full Modular Program Synthesis & Complex SQL Queries", marks: "5 Marks each", type: "Complex Problem Solving", weight: 0.15 }
      ];
    } else {
      // Science / General
      typologies = [
        { id: 1, section: "Section C", name: "Multi-Concept Integration Problems", marks: "3 Marks each", type: "Analytical Synthesis", weight: 0.25 },
        { id: 2, section: "Section C", name: "'Spot the Error in Student Working' Troubleshooting", marks: "3 Marks each", type: "Critical Evaluation", weight: 0.25 },
        { id: 3, section: "Section C", name: "Non-Routine Parametric & Data Deductions", marks: "3 Marks each", type: "Parametric Reasoning", weight: 0.20 },
        { id: 4, section: "Section D", name: "Experimental / Procedural / Scenario Design", marks: "4 Marks each", type: "Empirical Design", weight: 0.15 },
        { id: 5, section: "Section D", name: "Comprehensive Evaluative Derivations & Synthesis", marks: "5 Marks each", type: "Complex Problem Solving", weight: 0.15 }
      ];
    }
  } else if (effectiveTier === "CBSE_FULL") {
    // Mode 3: Complete Chapter Blueprint (Sections A–E: 1M to 5M)
    if (domain === "math") {
      typologies = [
        { id: 1, section: "Section A", name: "Objective Questions, Formulas & Assertion-Reason (A/R)", marks: "1 Mark each", type: "Objective Precision", weight: 0.25 },
        { id: 2, section: "Section B", name: "Very Short Answer (VSA) 2-Step Proofs & Calculations", marks: "2 Marks each", type: "Short Concept Checks", weight: 0.20 },
        { id: 3, section: "Section C", name: "Short Answer (SA) Multi-Step Problem Solving", marks: "3 Marks each", type: "Analytical Rigor", weight: 0.25 },
        { id: 4, section: "Section D", name: "Long Answer (LA) Comprehensive Theorems & Proofs", marks: "5 Marks each", type: "In-Depth Synthesis", weight: 0.15 },
        { id: 5, section: "Section E", name: "Case-Based Mathematical Modeling Units (CBQ)", marks: "4 Marks each", type: "NEP Competency", weight: 0.15 }
      ];
    } else if (domain === "commerce") {
      typologies = [
        { id: 1, section: "Section A", name: "Objective Questions, Statutory Rules & Assertion-Reason", marks: "1 Mark each", type: "Objective Precision", weight: 0.25 },
        { id: 2, section: "Section B", name: "Very Short Answer (VSA) 2-Point Differences & Concepts", marks: "2 Marks each", type: "Short Concept Checks", weight: 0.20 },
        { id: 3, section: "Section C", name: "Short Answer (SA) Ledger Adjustments & Economic Analysis", marks: "3 Marks each", type: "Analytical Rigor", weight: 0.25 },
        { id: 4, section: "Section D", name: "Long Answer (LA) Comprehensive Financial & Theory Problems", marks: "5 Marks each", type: "In-Depth Synthesis", weight: 0.15 },
        { id: 5, section: "Section E", name: "Case-Based Corporate Scenarios & Real Business Units", marks: "4 Marks each", type: "NEP Competency", weight: 0.15 }
      ];
    } else if (domain === "social_science") {
      typologies = [
        { id: 1, section: "Section A", name: "Objective Questions, Dates, Articles & Assertion-Reason", marks: "1 Mark each", type: "Objective Precision", weight: 0.25 },
        { id: 2, section: "Section B", name: "Very Short Answer (VSA) 2-Point Distinctions & Definitions", marks: "2 Marks each", type: "Short Concept Checks", weight: 0.20 },
        { id: 3, section: "Section C", name: "Short Answer (SA) Causal Explanations & Resource Analysis", marks: "3 Marks each", type: "Analytical Rigor", weight: 0.25 },
        { id: 4, section: "Section D", name: "Long Answer (LA) Structured Historical / Political Arguments", marks: "5 Marks each", type: "In-Depth Synthesis", weight: 0.15 },
        { id: 5, section: "Section E", name: "Case-Based Source Extracts & Map Interpretations (CBQ)", marks: "4 Marks each", type: "NEP Competency", weight: 0.15 }
      ];
    } else if (domain === "language") {
      typologies = [
        { id: 1, section: "Section A", name: "Lexical MCQs, Grammar Rules, Devices & Assertion-Reason", marks: "1 Mark each", type: "Objective Precision", weight: 0.25 },
        { id: 2, section: "Section B", name: "Very Short Answer (VSA) 2-Point Character & Theme Checks", marks: "2 Marks each", type: "Short Concept Checks", weight: 0.20 },
        { id: 3, section: "Section C", name: "Short Answer (SA) 40–50 Word Thematic Analysis & Inferences", marks: "3 Marks each", type: "Analytical Rigor", weight: 0.25 },
        { id: 4, section: "Section D", name: "Long Answer (LA) Comparative Literary Critique & Formal Writing", marks: "5 Marks each", type: "In-Depth Synthesis", weight: 0.15 },
        { id: 5, section: "Section E", name: "Passage-Based Literary Extract with Sub-Questions (CBQ)", marks: "4 Marks each", type: "NEP Competency", weight: 0.15 }
      ];
    } else if (domain === "computer") {
      typologies = [
        { id: 1, section: "Section A", name: "Syntax MCQs, Protocol Definitions & Assertion-Reason", marks: "1 Mark each", type: "Objective Precision", weight: 0.25 },
        { id: 2, section: "Section B", name: "Very Short Answer (VSA) Construct Differences & Traces", marks: "2 Marks each", type: "Short Concept Checks", weight: 0.20 },
        { id: 3, section: "Section C", name: "Short Answer (SA) Algorithm Coding & Function Tracing", marks: "3 Marks each", type: "Analytical Rigor", weight: 0.25 },
        { id: 4, section: "Section D", name: "Long Answer (LA) Modular Program Synthesis & Advanced SQL", marks: "5 Marks each", type: "In-Depth Synthesis", weight: 0.15 },
        { id: 5, section: "Section E", name: "Case-Based IT System Scenario & Database Case Study", marks: "4 Marks each", type: "NEP Competency", weight: 0.15 }
      ];
    } else {
      // Science / General
      typologies = [
        { id: 1, section: "Section A", name: "Objective Questions & Assertion-Reasoning (A/R)", marks: "1 Mark each", type: "Objective Precision", weight: 0.25 },
        { id: 2, section: "Section B", name: "Very Short Answer (VSA) & 2-Point Distinctions", marks: "2 Marks each", type: "Short Concept Checks", weight: 0.20 },
        { id: 3, section: "Section C", name: "Short Answer (SA) Multi-Step Analytical Problems", marks: "3 Marks each", type: "Analytical Rigor", weight: 0.25 },
        { id: 4, section: "Section D", name: "Long Answer (LA) Comprehensive Derivations & Solutions", marks: "5 Marks each", type: "In-Depth Synthesis", weight: 0.15 },
        { id: 5, section: "Section E", name: "Case-Based / Source-Based Integrated Units (CBQ)", marks: "4 Marks each", type: "NEP Competency", weight: 0.15 }
      ];
    }
  } else if (effectiveTier === "CBSE_COMPETENCY") {
    // Mode 4: 50% Competency & Case-Study Booster (NEP 2020 CBQ)
    typologies = [
      { id: 1, section: "Section A", name: "Contextual Conceptual MCQs & Assertion-Reason", marks: "1 Mark each", type: "Contextual Recall", weight: 0.25 },
      { id: 2, section: "Section C", name: "Real-World Data / Extract Analytical Problems", marks: "3 Marks each", type: "Data Interpretation", weight: 0.25 },
      { id: 3, section: "Section E", name: "Case-Based Integrated Units with Sub-Questions (i, ii, iii)", marks: "4 Marks each", type: "Integrated CBQ", weight: 0.35 },
      { id: 4, section: "Section E", name: "Critical Evaluation & Scenario Troubleshooting", marks: "4 Marks each", type: "Scenario Evaluation", weight: 0.15 }
    ];
  } else if (effectiveTier === "CBSE_PYQ") {
    // Mode 5: 10-Year High-Yield PYQs & Recurring Trends
    typologies = [
      { id: 1, section: "Section A", name: "High-Frequency Board Objective Questions & A/R", marks: "1 Mark each", type: "Board PYQ Objective", weight: 0.20 },
      { id: 2, section: "Section B", name: "Recurring VSA Conceptual Questions & Distinctions", marks: "2 Marks each", type: "Board PYQ VSA", weight: 0.25 },
      { id: 3, section: "Section C", name: "Classic Board Numericals & Analytical SA Problems", marks: "3 Marks each", type: "Board PYQ SA", weight: 0.30 },
      { id: 4, section: "Section D", name: "Standard Board Derivations, Theorems & Long Answers", marks: "5 Marks each", type: "Board PYQ LA", weight: 0.25 }
    ];
  } else {
    // Mode 6: CBSE_SUBJECTIVE (VSA 2M, SA 3M, LA 5M)
    if (domain === "math") {
      typologies = [
        { id: 1, section: "Section B", name: "Very Short Answer (VSA) 2-Step Calculations & Proofs", marks: "2 Marks each", type: "Step-Marked VSA", weight: 0.30 },
        { id: 2, section: "Section C", name: "Short Answer (SA) Multi-Step Problem Solving & Working", marks: "3 Marks each", type: "Step-Marked SA", weight: 0.45 },
        { id: 3, section: "Section D", name: "Long Answer (LA) In-Depth Theorems, Proofs & Coordinate Solutions", marks: "5 Marks each", type: "Step-Marked LA", weight: 0.25 }
      ];
    } else if (domain === "commerce") {
      typologies = [
        { id: 1, section: "Section B", name: "Very Short Answer (VSA) 2-Point Distinctions & Concepts", marks: "2 Marks each", type: "Step-Marked VSA", weight: 0.30 },
        { id: 2, section: "Section C", name: "Short Answer (SA) Practical Accounting & Economic Working", marks: "3 Marks each", type: "Step-Marked SA", weight: 0.45 },
        { id: 3, section: "Section D", name: "Long Answer (LA) Comprehensive Financial Problems & Principles", marks: "5 Marks each", type: "Step-Marked LA", weight: 0.25 }
      ];
    } else if (domain === "social_science") {
      typologies = [
        { id: 1, section: "Section B", name: "Very Short Answer (VSA) 2-Point Distinctions & Definitions", marks: "2 Marks each", type: "Step-Marked VSA", weight: 0.30 },
        { id: 2, section: "Section C", name: "Short Answer (SA) Structured Causal Explanations", marks: "3 Marks each", type: "Step-Marked SA", weight: 0.45 },
        { id: 3, section: "Section D", name: "Long Answer (LA) In-Depth Historical Arguments & Constitutional Evidence", marks: "5 Marks each", type: "Step-Marked LA", weight: 0.25 }
      ];
    } else if (domain === "language") {
      typologies = [
        { id: 1, section: "Section B", name: "Very Short Answer (VSA) 2-Point Thematic & Character Contrasts", marks: "2 Marks each", type: "Step-Marked VSA", weight: 0.30 },
        { id: 2, section: "Section C", name: "Short Answer (SA) 40–50 Word Analytical Responses with Keywords", marks: "3 Marks each", type: "Step-Marked SA", weight: 0.45 },
        { id: 3, section: "Section D", name: "Long Answer (LA) In-Depth Literary Critique & Extended Composition", marks: "5 Marks each", type: "Step-Marked LA", weight: 0.25 }
      ];
    } else if (domain === "computer") {
      typologies = [
        { id: 1, section: "Section B", name: "Very Short Answer (VSA) Construct Differences & Code Dry-Runs", marks: "2 Marks each", type: "Step-Marked VSA", weight: 0.30 },
        { id: 2, section: "Section C", name: "Short Answer (SA) Algorithmic Logic & Function Implementation", marks: "3 Marks each", type: "Step-Marked SA", weight: 0.45 },
        { id: 3, section: "Section D", name: "Long Answer (LA) Full Modular Programs & Complex Relational Queries", marks: "5 Marks each", type: "Step-Marked LA", weight: 0.25 }
      ];
    } else {
      // Science / General
      typologies = [
        { id: 1, section: "Section B", name: "Very Short Answer (VSA) & Conceptual Distinctions", marks: "2 Marks each", type: "Step-Marked VSA", weight: 0.30 },
        { id: 2, section: "Section C", name: "Short Answer (SA) Multi-Step Working & Explanations", marks: "3 Marks each", type: "Step-Marked SA", weight: 0.45 },
        { id: 3, section: "Section D", name: "Long Answer (LA) In-Depth Derivations & Solutions", marks: "5 Marks each", type: "Step-Marked LA", weight: 0.25 }
      ];
    }
  }

  // Largest Remainder Method (Hamilton/Hare-Niemeyer) for exact integer distribution
  const floatCounts = typologies.map(t => t.weight * N);
  const floorCounts = floatCounts.map(f => Math.floor(f));
  let allocated = floorCounts.reduce((a, b) => a + b, 0);
  let remainder = N - allocated;

  const remainders = floatCounts.map((f, idx) => ({
    idx,
    rem: f - floorCounts[idx]
  })).sort((a, b) => b.rem - a.rem);

  for (let i = 0; i < remainder; i++) {
    floorCounts[remainders[i % remainders.length].idx] += 1;
  }

  // Ensure every typology gets at least 1 question when N >= typologies.length
  if (N >= typologies.length) {
    for (let i = 0; i < floorCounts.length; i++) {
      if (floorCounts[i] === 0) {
        let maxIdx = 0;
        for (let j = 1; j < floorCounts.length; j++) {
          if (floorCounts[j] > floorCounts[maxIdx]) maxIdx = j;
        }
        if (floorCounts[maxIdx] > 1) {
          floorCounts[maxIdx] -= 1;
          floorCounts[i] += 1;
        }
      }
    }
  }

  let currentStart = 1;
  return typologies.map((t, idx) => {
    const count = floorCounts[idx];
    const start = currentStart;
    const end = currentStart + count - 1;
    currentStart = count > 0 ? end + 1 : currentStart;
    const numRange = count === 0 ? "—" : (start === end ? `Q ${String(start).padStart(2, '0')}` : `Q ${String(start).padStart(2, '0')} – ${String(end).padStart(2, '0')}`);
    return {
      ...t,
      count,
      start,
      end,
      num: numRange
    };
  }).filter(t => t.count > 0);
}

// Backward compatibility alias
export function calculateClusterDistribution(totalQs, tier = "CBSE_SEC_AB") {
  return calculateTypologyDistribution(totalQs, tier);
}

function renderWorksheetBlueprintView(examVal) {
  if (!blueprintContainer) return;
  const exam = examVal || (examNameSelect ? examNameSelect.value : '');
  const ws = getWorksheetConfig(exam);
  if (!ws) return;
  
  const checkedBoxes = Array.from(document.querySelectorAll('.chapter-cb:checked'))
    .filter(cb => {
      if (cb.disabled) return false;
      const parent = cb.closest('.reading-section-item');
      if (parent && (parent.classList.contains('unit-test-hidden') || parent.style.display === 'none')) return false;
      return true;
    });
    
  const subtopicCount = Math.max(1, checkedBoxes.length);
  const qsPerSubtopic = getQsPerSubtopic();
  const totalQs = subtopicCount * qsPerSubtopic;
  
  if (blueprintBadge) {
    blueprintBadge.innerHTML = `<span style="color: ${ws.color}; font-weight: 700;">● ${ws.shortName}</span> • ${totalQs} Questions (${subtopicCount} Subtopic${subtopicCount > 1 ? 's' : ''})`;
  }
  
  const selectedSubject = subjectSelect ? subjectSelect.value : "";
  const typologyRows = calculateTypologyDistribution(qsPerSubtopic, ws.tier, selectedSubject);
  
  const typologyRowsHtml = typologyRows.map(c => `
    <tr>
      <td style="font-weight: 700; color: ${ws.color}; white-space: nowrap; font-size: 0.75rem;">${c.num}</td>
      <td style="color: #f1f5f9; font-weight: 500; font-size: 0.78rem;">
        <span style="display: inline-block; font-size: 0.68rem; padding: 1px 5px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; margin-right: 4px; font-weight: 600;">${c.section}</span>
        ${c.name} (${c.count} Qs)
      </td>
      <td style="color: #94a3b8; font-size: 0.74rem; text-align: center;">${c.marks}</td>
      <td style="text-align: right; color: #38bdf8; font-size: 0.74rem; font-weight: 600;">${c.type}</td>
    </tr>
  `).join('');

  blueprintContainer.innerHTML = `
    <div class="worksheet-blueprint-card">
      <div class="worksheet-tier-header" style="border-left: 4px solid ${ws.color};">
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="worksheet-tier-badge" style="background: ${ws.color}22; color: ${ws.color}; border: 1px solid ${ws.color}55;">
              ${ws.shortName}
            </span>
            <span style="font-size: 0.78rem; font-weight: 600; color: #f8fafc;">
              Target: ${totalQs} Exhaustive Questions
            </span>
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px;">
            ${ws.summary}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.7rem; color: #94a3b8;">Question Scaling Rule</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8;">
            ${qsPerSubtopic} Qs × ${subtopicCount} Subtopic${subtopicCount > 1 ? 's' : ''} = ${totalQs} Qs
          </div>
          <div style="display: flex; gap: 4px; justify-content: flex-end; margin-top: 5px; flex-wrap: wrap;">
            <button type="button" class="qs-preset-btn ${qsPerSubtopic === 10 ? 'active' : ''}" data-qs="10" title="10 Questions per topic">10 Qs</button>
            <button type="button" class="qs-preset-btn ${qsPerSubtopic === 15 ? 'active' : ''}" data-qs="15" title="15 Questions per topic">15 Qs</button>
            <button type="button" class="qs-preset-btn ${qsPerSubtopic === 20 ? 'active' : ''}" data-qs="20" title="20 Questions per topic">20 Qs</button>
            <button type="button" class="qs-preset-btn ${qsPerSubtopic === 30 ? 'active' : ''}" data-qs="30" title="30 Questions per topic (Standard)">30 Qs</button>
            <button type="button" class="qs-preset-btn ${qsPerSubtopic === 40 ? 'active' : ''}" data-qs="40" title="40 Questions per topic">40 Qs</button>
            <button type="button" class="qs-preset-btn ${qsPerSubtopic === 50 ? 'active' : ''}" data-qs="50" title="50 Questions per topic">50 Qs</button>
          </div>
        </div>
      </div>

      <div class="worksheet-info-pills" style="margin-top: 0.25rem;">
        <span class="worksheet-pill" style="border-color: #22c55e55; color: #22c55e; background: #22c55e11;">
          🎯 Official CBSE Board Typology
        </span>
        <span class="worksheet-pill" style="border-color: #a855f755; color: #c084fc; background: #a855f711;">
          🛡️ 2-Phase Anti-Truncation Delivery
        </span>
        <span class="worksheet-pill" style="border-color: #38bdf855; color: #38bdf8; background: #38bdf811;">
          📝 CBSE Step-by-Step Marking Rubric
        </span>
      </div>

      <div style="margin-top: 0.35rem;">
        <div style="font-size: 0.74rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.25rem;">
          CBSE Board Examination Typology & Marks Distribution (${qsPerSubtopic} Qs Per Subtopic):
        </div>
        <table class="worksheet-typology-table">
          <thead>
            <tr>
              <th style="width: 85px;">Range</th>
              <th>CBSE Question Typology</th>
              <th style="text-align: center; width: 85px;">Marks</th>
              <th style="text-align: right; width: 110px;">CBSE Typology</th>
            </tr>
          </thead>
          <tbody>
            ${typologyRowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 0.25rem; font-size: 0.72rem; color: #94a3b8; line-height: 1.4; background: rgba(15, 23, 42, 0.4); padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px dashed rgba(255,255,255,0.1);">
        💡 <em>Universal All-Subject Engine: Every question count dynamically scales across authentic CBSE sections with zero cluster labels. Works for Science, Maths, Commerce, Social Science, Languages & Computer Science!</em>
      </div>
    </div>
  `;
}

function renderBlueprintView() {
  const examName = examNameSelect ? examNameSelect.value : "";
  if (isWorksheetMode(examName)) {
    renderWorksheetBlueprintView(examName);
    return;
  }

  if (!blueprintContainer || !currentBlueprintState) return;
  
  const blueprint = currentBlueprintState;
  
  if (blueprintBadge) {
    blueprintBadge.textContent = `${blueprint.marks} Marks • ${blueprint.duration}`;
  }

  let tableRowsHtml = '';
  blueprint.sections.forEach((sec, idx) => {
    tableRowsHtml += `
      <tr>
        <td style="font-weight: 600; color: #38bdf8; white-space: nowrap;">${sec.name}</td>
        <td>
          <div style="font-weight: 500; color: #f1f5f9;">${sec.type}</div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 1px;">${sec.choice}</div>
        </td>
        <td style="text-align: center; white-space: nowrap;">
          <div class="blueprint-stepper">
            <button type="button" class="btn-step" onclick="window.changeSectionQuestionCount(${idx}, -1)" title="Decrease question count" ${sec.count <= 0 ? 'disabled' : ''}>▼</button>
            <span class="step-count-val">${sec.count}</span>
            <button type="button" class="btn-step" onclick="window.changeSectionQuestionCount(${idx}, 1)" title="Increase question count">▲</button>
          </div>
        </td>
        <td style="text-align: center; color: #cbd5e1; font-size: 0.78rem;">${sec.marksPerQ}</td>
        <td style="text-align: right; font-weight: 700; color: #34d399; font-size: 0.85rem;">${sec.total} M</td>
      </tr>
    `;
  });

  const repoSqp = getSqpBlueprint(blueprint.className, blueprint.subjectName);
  let instructionsBlock = '';

  if (repoSqp && repoSqp.text) {
    instructionsBlock = `
      <div style="margin-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.5rem;">
        <button type="button" class="blueprint-instructions-toggle" onclick="document.getElementById('sqpInstructionsBox').classList.toggle('hidden')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Official CBSE General Instructions (${repoSqp.year})</span>
        </button>
        <div id="sqpInstructionsBox" class="blueprint-instructions-text hidden">
${repoSqp.text}
        </div>
      </div>
    `;
  }

  const resetBtnHtml = blueprint.isModified ? `
    <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
      <button type="button" class="btn-reset-blueprint" onclick="window.resetBlueprintToDefault()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <span>↺ Reset to Official CBSE Pattern</span>
      </button>
    </div>
  ` : '';

  blueprintContainer.innerHTML = `
    <div class="blueprint-stats">
      <div class="blueprint-stat-pill">
        <span class="label">Total Marks</span>
        <span class="value">${blueprint.marks} M</span>
      </div>
      <div class="blueprint-stat-pill">
        <span class="label">Time Limit</span>
        <span class="value">${blueprint.duration}</span>
      </div>
      <div class="blueprint-stat-pill">
        <span class="label">Questions</span>
        <span class="value">${blueprint.totalQuestions} Qs</span>
      </div>
      <div class="blueprint-stat-pill">
        <span class="label">Competency</span>
        <span class="value" style="color: #34d399;">${blueprint.competencyRatio}</span>
      </div>
    </div>

    <div style="overflow-x: auto; margin-top: 0.25rem;">
      <table class="blueprint-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Question Type & Choice</th>
            <th style="text-align: center;">Count</th>
            <th style="text-align: center;">Weight</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </div>
    ${resetBtnHtml}
    ${instructionsBlock}
  `;
}

async function updateExamBlueprint(forceRecalculate = false) {
  if (!blueprintContainer) return;
  
  const className = classSelect.value;
  const subjectName = subjectSelect.value;
  const examName = examNameSelect.value;
  const marksVal = marksInput.value;
  const durationVal = durationInput.value;

  if (isWorksheetMode(examName)) {
    renderWorksheetBlueprintView(examName);
    return;
  }

  if (!className || !subjectName) {
    blueprintContainer.innerHTML = '<span class="placeholder-text">Select Class, Subject & Exam to preview the official CBSE blueprint</span>';
    if (blueprintBadge) blueprintBadge.textContent = 'Awaiting Selection';
    currentBlueprintState = null;
    lastBlueprintConfigKey = "";
    return;
  }

  const configKey = `${className}|${subjectName}|${examName}|${marksVal}|${durationVal}`;
  
  if (forceRecalculate || !currentBlueprintState || configKey !== lastBlueprintConfigKey) {
    currentBlueprintState = calculateExamBlueprint(className, subjectName, examName, marksVal, durationVal);
    lastBlueprintConfigKey = configKey;
  }

  renderBlueprintView();

}
function syncWorksheetDynamicScaling() {
  const exam = examNameSelect ? examNameSelect.value : "";
  if (!isWorksheetMode(exam)) return;
  
  const ws = getWorksheetConfig(exam);
  const checkedBoxes = Array.from(document.querySelectorAll('.chapter-cb:checked'))
    .filter(cb => {
      if (cb.disabled) return false;
      const parent = cb.closest('.reading-section-item');
      if (parent && (parent.classList.contains('unit-test-hidden') || parent.style.display === 'none')) return false;
      return true;
    });
    
  const n = Math.max(1, checkedBoxes.length);
  const qsPerSubtopic = getQsPerSubtopic();
  const totalQs = n * qsPerSubtopic;
  
  marksInput.value = `${totalQs} Questions (${totalQs} Marks)`;
  durationInput.value = "Self-Paced / No Time Limit";
  
  if (ws && ws.difficulty) {
    difficultySelect.value = ws.difficulty;
  }
  
  const formulaBadge = document.getElementById('worksheetFormulaBadge');
  if (formulaBadge) {
    formulaBadge.textContent = `${qsPerSubtopic} Qs × ${n} Subtopic${n > 1 ? 's' : ''} = ${totalQs} Qs`;
  }

  if (blueprintBadge && ws) {
    blueprintBadge.innerHTML = `<span style="color: ${ws.color}; font-weight: 700;">● ${ws.shortName}</span> • ${totalQs} Questions (${n} Subtopic${n > 1 ? 's' : ''})`;
  }
  
  renderWorksheetBlueprintView(exam);
}

export function getExamDefaultDuration(examName, className = '', subjectName = '') {
  const isMiddle = (className === 'Class 6' || className === 'Class 7' || className === 'Class 8');
  const subLower = (subjectName || '').toLowerCase().trim();
  const exLower = (examName || '').toLowerCase().trim();
  if (isMiddle) {
    if (subLower.includes('robotics')) {
      if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut") ||
          exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
        return '20 Mins';
      }
      return '45 Minutes';
    }
    if (subLower.includes('general knowledge') || subLower.includes('gk')) {
      if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut")) {
        return '20 Mins';
      }
      if (exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
        return '45 Mins';
      }
      return '90 Mins';
    }
  }

  const isSkill = (subLower.startsWith("it (") || subLower.startsWith("it ") || subLower.includes(" it (") || subLower.includes("it 402") || subLower.includes("it 802")) || 
                  subLower.includes("information tech") || 
                  subLower.includes("computer applications") || 
                  subLower.includes("health care") ||
                  subLower.includes("artificial") || subLower.includes("retail") || 
                  subLower.includes("data science") || subLower.includes("fashion") || 
                  subLower.includes("web app") || subLower.includes("yoga");

  if (isSkill) {
    if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut")) {
      return "No Unit Test";
    }
    if (exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
      return "60 Mins";
    }
    return "120 Mins";
  }

  if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut")) {
    return "45 Minutes";
  }
  if (exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
    return "90 Mins";
  }

  return isMiddle ? "2.5 Hours" : "180 Mins";
}

// Centralized helper to determine standard CBSE marks and duration for examinations
function getExamDefaultDetails(className, subjectName, examName) {
  const isMiddle = (className === 'Class 6' || className === 'Class 7' || className === 'Class 8');
  const subLower = (subjectName || '').toLowerCase().trim();
  const exLower = (examName || '').toLowerCase().trim();

  // Special School Configuration for Middle Wing GK & Robotics (Classes 6 to 8)
  if (isMiddle) {
    if (subLower.includes("robotics")) {
      // Skill subject: no unit tests or periodic assessments. The written paper
      // is 30 marks in 60 minutes, alongside a 70 mark practical.
      return { marks: 30, duration: "60 Mins" };
    }
    if (subLower.includes("general knowledge") || subLower.includes("gk")) {
      if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut")) {
        return { marks: 10, duration: "20 Mins" };
      }
      if (exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
        return { marks: 20, duration: "45 Mins" };
      }
      return { marks: 40, duration: "90 Mins" };
    }
  }

  if (!examName) return { marks: 80, duration: isMiddle ? "2.5 Hours" : "180 Mins" };

  const isSenior = (className === 'Class 11' || className === 'Class 12');

  const isSkill = (subLower.startsWith("it (") || subLower.startsWith("it ") || subLower.includes(" it (") || subLower.includes("it 402") || subLower.includes("it 802")) || 
                  subLower.includes("information tech") || 
                  subLower.includes("computer applications") || 
                  subLower.includes("health care") ||
                  subLower.includes("artificial") || subLower.includes("retail") || 
                  subLower.includes("data science") || subLower.includes("fashion") || 
                  subLower.includes("web app") || subLower.includes("yoga");

  // Vocational / Skill subjects (Healthcare, Computer Applications, IT, etc.):
  // - No Unit Tests
  // - PA is half of 50M Annual = 25 Marks in 60 Mins
  // - Final / Pre-Board / Mid-Term = 50 Marks in 120 Mins
  if (isSkill) {
    if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut")) {
      return { marks: 0, duration: "No Unit Test" };
    }
    if (exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
      return { marks: 25, duration: "60 Mins" };
    }
    return { marks: 50, duration: "120 Mins" };
  }

  const isSeniorSciencePractical = isSenior && (
    subLower.includes("physics") || subLower.includes("chemistry") || 
    subLower.includes("biology") || subLower.includes("computer science") || 
    subLower.includes("informatics") || subLower.includes("physical education") || 
    subLower.includes("geography") || subLower.includes("psychology")
  );

  // 1. Unit Tests: 45 Minutes (20 Marks standard)
  if (exLower.includes("unit test") || exLower.includes("ut ") || exLower.includes("ut-") || exLower.startsWith("ut")) {
    return { marks: 20, duration: "45 Minutes" };
  }

  // 2. Periodic Assessments (PA I, PA II, PT): 90 Mins
  if (exLower.includes("pa ") || exLower.includes("periodic") || exLower.includes("pt ") || exLower.startsWith("pa") || exLower.includes("pa-")) {
    return { marks: 40, duration: "90 Mins" };
  }

  // 3. Other Examinations (Mid Term Examination, Half Yearly, Pre-Board, Annual, Final): 2.5 Hours for 6-8, 180 Mins for 9-12
  let fullMarks = 80;
  let fullDuration = isMiddle ? "2.5 Hours" : "180 Mins";

  if (isSeniorSciencePractical) {
    fullMarks = 70;
    fullDuration = "180 Mins";
  }

  return { marks: fullMarks, duration: fullDuration };
}

function updateExamDetails() {
  const cls = classSelect.value;
  const exam = examNameSelect.value;
  const subject = subjectSelect ? subjectSelect.value : '';
  
  if (!cls || !exam) return;

  const wsConfigRow = document.getElementById('worksheetQsConfigRow');

  if (isWorksheetMode(exam)) {
    if (wsConfigRow) wsConfigRow.style.display = 'block';
    syncWorksheetDynamicScaling();
    if (typeof toggleReadingSections === 'function') {
      toggleReadingSections();
    }
    return;
  } else {
    if (wsConfigRow) wsConfigRow.style.display = 'none';
  }
  
  const defaults = getExamDefaultDetails(cls, subject, exam);
  marksInput.value = defaults.marks;
  durationInput.value = defaults.duration;
  
  if (typeof toggleReadingSections === 'function') {
    toggleReadingSections();
  }
}

function toggleReadingSections() {
  const examName = (examNameSelect.value || "").toLowerCase();
  const marks = parseInt(marksInput.value, 10);
  const isUnitTest = examName.includes("unit test") || (!isNaN(marks) && marks <= 25);
  
  const readingHeaders = document.querySelectorAll('.reading-section-header');
  readingHeaders.forEach(header => {
    if (isUnitTest) {
      header.classList.add('unit-test-hidden');
      header.style.display = 'none';
    } else {
      header.classList.remove('unit-test-hidden');
      header.style.display = 'block';
    }
  });

  const readingItems = document.querySelectorAll('.reading-section-item');
  readingItems.forEach(div => {
    const cb = div.querySelector('input[type="checkbox"]');
    if (isUnitTest) {
      div.classList.add('unit-test-hidden');
      div.style.display = 'none';
      if (cb) {
        cb.disabled = true;
        cb.checked = false;
      }
    } else {
      div.classList.remove('unit-test-hidden');
      div.style.display = 'flex';
      div.style.opacity = '1';
      if (cb) {
        cb.disabled = false;
      }
    }
  });

  // Notice banner in syllabusContainer
  const existingNotice = document.getElementById('unitTestReadingNotice');
  if (isUnitTest) {
    if (!existingNotice && readingHeaders.length > 0) {
      const notice = document.createElement('div');
      notice.id = 'unitTestReadingNotice';
      notice.style.cssText = "margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 6px; font-size: 0.8rem; color: #92400e; display: flex; align-items: center; gap: 8px;";
      notice.innerHTML = `<span style="font-size: 1rem;">ℹ️</span> <span><strong>CBSE 20-Mark Unit Test Rule:</strong> Reading Section (Unseen Passages) is automatically disabled and excluded as per CBSE guidelines.</span>`;
      const banner = syllabusContainer.querySelector('.prescribed-book-banner');
      if (banner && banner.nextSibling) {
        syllabusContainer.insertBefore(notice, banner.nextSibling);
      } else {
        syllabusContainer.prepend(notice);
      }
    }
  } else {
    if (existingNotice) {
      existingNotice.remove();
    }
  }

  // Update select all checkbox state
  const allChapterCbs = Array.from(document.querySelectorAll('.chapter-cb')).filter(cb => !cb.disabled);
  const selectAllCb = document.getElementById('selectAllChapters');
  if (selectAllCb && allChapterCbs.length > 0) {
    selectAllCb.checked = allChapterCbs.every(cb => cb.checked);
  }
}

examNameSelect.addEventListener('change', () => {
  updateExamDetails();
  updateExamBlueprint();
  toggleReadingSections();
  if (typeof syncSyllabusSheetFromPromptModule === 'function') {
    syncSyllabusSheetFromPromptModule();
  }
});
marksInput.addEventListener('input', () => {
  updateExamBlueprint();
  toggleReadingSections();
  if (typeof syncSyllabusSheetFromPromptModule === 'function') {
    syncSyllabusSheetFromPromptModule();
  }
});
durationInput.addEventListener('input', () => {
  updateExamBlueprint();
  if (typeof syncSyllabusSheetFromPromptModule === 'function') {
    syncSyllabusSheetFromPromptModule();
  }
});
difficultySelect.addEventListener('change', updateExamBlueprint);

function populateSubjectsDropdown(selectedClass, defaultSelectSubject = null) {
  subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';
  subjectSelect.disabled = false;
  
  if (!cbseData[selectedClass]) return;
  
  // Robotics is assessed in the lab and via a school-set written paper, and
  // General Knowledge is a co-scholastic domain. No question paper is generated
  // for either, so they appear on the Syllabus Sheet only, not in this dropdown.
  const subjects = Object.keys(cbseData[selectedClass])
    .filter(s => !isSchoolExcludedSubject(s) && !/robotics/i.test(s) && !isGeneralKnowledgeSubject(s));
  const customList = (customSubjectsData && customSubjectsData[selectedClass]) ? Object.keys(customSubjectsData[selectedClass]) : [];
  
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    const isCustom = customList.includes(subject);
    option.textContent = isCustom ? `★ ${subject}` : subject;
    if (isCustom) {
      option.style.fontWeight = '600';
      option.style.color = '#38bdf8';
    }
    subjectSelect.appendChild(option);
  });
  
  if (defaultSelectSubject && subjects.includes(defaultSelectSubject) && !isSchoolExcludedSubject(defaultSelectSubject)) {
    subjectSelect.value = defaultSelectSubject;
    subjectSelect.dispatchEvent(new Event('change'));
  } else if (subjects.length > 0) {
    subjectSelect.value = subjects[0];
    subjectSelect.dispatchEvent(new Event('change'));
  }
}

// Handle Class Selection Change
classSelect.addEventListener('change', (e) => {
  const selectedClass = e.target.value;
  
  examNameSelect.innerHTML = '<option value="" disabled selected>Select Exam or Worksheet</option>';
  examNameSelect.disabled = false;
  
  let exams = [];
  if (selectedClass === 'Class 6' || selectedClass === 'Class 7' || selectedClass === 'Class 8') {
    exams = ["Unit Test I", "Unit Test II", "PA I", "Unit Test III", "Mid Term Examination", "Unit Test IV", "PA II", "Unit Test V", "Annual Examination"];
  } else {
    exams = ["Unit Test I", "Unit Test II", "PA I", "Unit Test III", "Mid Term Examination", "Unit Test IV", "PA II", "Unit Test V", "Final Examination", "Pre Board 1", "Pre Board 2", "Pre Board 3"];
  }
  
  const examGroup = document.createElement('optgroup');
  examGroup.label = "📋 CBSE School Examinations (Timed & Blueprint-bound)";
  exams.forEach(exam => {
    const option = document.createElement('option');
    option.value = exam;
    option.textContent = exam;
    examGroup.appendChild(option);
  });
  examNameSelect.appendChild(examGroup);

  const worksheetGroup = document.createElement('optgroup');
  worksheetGroup.label = "🎯 CBSE Board Target Worksheets (Official Typology & NEP 2020)";
  WORKSHEET_OPTIONS.forEach(ws => {
    const option = document.createElement('option');
    option.value = ws.value;
    option.textContent = ws.label;
    worksheetGroup.appendChild(option);
  });
  examNameSelect.appendChild(worksheetGroup);
  
  // Auto-select standard Annual Examination by default so exam details and time duration are always active and correct
  const defaultExam = Array.from(examNameSelect.options).find(o => o.value === 'Annual Examination' || o.value === 'Final Examination' || o.value === 'Final Exam');
  if (defaultExam) {
    examNameSelect.value = defaultExam.value;
  }

  updateExamDetails();
  
  syllabusContainer.innerHTML = '<span class="placeholder-text">Select a subject first</span>';
  deleteCustomSubjectBtn.classList.add('hidden');
  
  populateSubjectsDropdown(selectedClass);
  updateExamBlueprint();
  if (typeof syncSyllabusSheetFromPromptModule === 'function') {
    syncSyllabusSheetFromPromptModule();
  }
});

// Helper to determine the official prescribed textbook name
function getPrescribedBookName(className, subjectName) {
  if (!subjectName || !className) return "";
  const sub = subjectName.toLowerCase().trim();
  const cls = className.trim();

  // Class 6
  if (cls === "Class 6") {
    if (sub.includes("social")) return "Exploring Society: India and Beyond (NCERT)";
    if (sub.includes("science")) return "Curiosity (NCERT)";
    if (sub.includes("math")) return "Mathematics (School Text Book)";
    if (sub.includes("english") && sub.includes("r2")) return "Communicative English Reader (CBSE)";
    if (sub.includes("english")) return "Poorvi (Grade 6) (NCERT)";
    if (sub.includes("hindi")) return "Malhar (मल्हार) & Bal Ramkatha (NCERT)";
    if (sub.includes("sanskrit")) return "Deepakam (दीपकम्) (NCERT)";
    if (sub.includes("general knowledge") || sub === "gk") return "GK (School Text Book)";
    if (sub.includes("robotics") || sub.includes("ai")) return "AI & Robotics (School Curriculum)";
  }

  // Class 7
  if (cls === "Class 7") {
    if (sub.includes("social")) return "Exploring Society: India and Beyond (NCERT)";
    if (sub.includes("science")) return "Curiosity (Grade 7) (NCERT)";
    if (sub.includes("math")) return "Mathematics (School Text Book)";
    if (sub.includes("english") && sub.includes("r2")) return "Communicative English Reader (CBSE)";
    if (sub.includes("english")) return "Poorvi (Grade 7) (NCERT)";
    if (sub.includes("hindi")) return "Malhar (मल्हार) / Vasant Part-2 & Bal Mahabharat Katha (NCERT)";
    if (sub.includes("sanskrit")) return "Deepakam (दीपकम्) (NCERT)";
    if (sub.includes("general knowledge") || sub === "gk") return "GK (School Text Book)";
    if (sub.includes("robotics") || sub.includes("ai")) return "AI & Robotics (School Curriculum)";
  }

  // Class 8
  if (cls === "Class 8") {
    if (sub.includes("social")) return "Exploring Society: India and Beyond (NCERT)";
    if (sub.includes("science")) return "Curiosity (Grade 8) (NCERT)";
    if (sub.includes("math")) return "Mathematics (School Text Book)";
    if (sub.includes("english") && sub.includes("r2")) return "Communicative English Reader (CBSE)";
    if (sub.includes("english")) return "Poorvi (Grade 8) (NCERT)";
    if (sub.includes("hindi")) return "Malhar (मल्हार) / Vasant Part-3 & Bharat Ki Khoj (NCERT)";
    if (sub.includes("sanskrit")) return "Deepakam (दीपकम्) (NCERT)";
    if (sub.includes("computer")) return "Computer Science (School Curriculum)";
    if (sub.includes("general knowledge") || sub === "gk") return "GK (School Text Book)";
    if (sub.includes("robotics") || sub.includes("ai")) return "AI & Robotics (School Curriculum)";
  }

  // Class 9
  if (cls === "Class 9") {
    if (sub.includes("social")) return "Understanding Society: India and Beyond (NCERT)";
    if (sub.includes("rationalized") || sub.includes("legacy")) return "Science (Class IX) (NCERT - CBSE 086 Legacy)";
    if (sub.includes("science") || sub.includes("physics") || sub.includes("chemistry") || sub.includes("biology") || sub.includes("exploration")) return "Exploration: Textbook of Science for Grade 9 (NCERT)";
    if (sub.includes("math")) return "Ganita Manjari (Class IX) (NCERT)";
    if (sub.includes("english") && sub.includes("r2")) return "Interact in English (Communicative) (CBSE)";
    if (sub.includes("english") || sub.includes("kaveri")) return "Kaveri (NCERT)";
    if (sub.includes("ganga") || sub.includes("hindi (r2") || sub.includes("hindi r2")) return "Ganga (गंगा) & Sanchayan Part-1 (NCERT)";
    if (sub.includes("hindi")) return "Kshitij Part-1 & Kritika Part-1 / Ganga (NCERT)";
    if (sub.includes("sanskrit")) return "Shemushi Part-1 / Manika Part-1 (NCERT)";
    if (sub.includes("computer")) return "Computer Applications (Code 165)";
  }

  // Class 10
  if (cls === "Class 10") {
    if (sub.includes("social")) return "India & Contemporary World-II, Contemporary India-II, Democratic Politics-II, Economics (NCERT)";
    if (sub.includes("science")) return "Science (Class X) (NCERT)";
    if (sub.includes("math")) return "Mathematics (Class X) (NCERT)";
    if (sub.includes("english") && sub.includes("r2")) return "Interact in English (Communicative) (CBSE)";
    if (sub.includes("english")) return "First Flight & Footprints Without Feet (NCERT)";
    if (sub.includes("course-b") || sub.includes("hindi b") || sub.includes("hindi (r2")) return "Sparsh Part-2 & Sanchayan Part-2 (NCERT)";
    if (sub.includes("hindi")) return "Kshitij Part-2 & Kritika Part-2 (NCERT)";
    if (sub.includes("sanskrit")) return "Shemushi Part-2 / Manika Part-2 (NCERT)";
    if (sub.includes("computer")) return "Computer Applications (Code 165)";
  }

  // Class 11
  if (cls === "Class 11") {
    if (sub.includes("physics")) return "Physics Part-I & Part-II (NCERT)";
    if (sub.includes("chemistry")) return "Chemistry Part-I & Part-II (NCERT)";
    if (sub.includes("biology")) return "Biology (Class XI) (NCERT)";
    if (sub.includes("applied math")) return "Applied Mathematics (CBSE / NCERT)";
    if (sub.includes("math")) return "Mathematics (Class XI) (NCERT)";
    if (sub.includes("account")) return "Financial Accounting Part-I & Part-II (NCERT)";
    if (sub.includes("business")) return "Business Studies (Class XI) (NCERT)";
    if (sub.includes("economics")) return "Statistics for Economics & Introductory Microeconomics (NCERT)";
    if (sub.includes("computer science")) return "Computer Science with Python (NCERT)";
    if (sub.includes("informatics")) return "Informatics Practices with Python (NCERT)";
    if (sub.includes("history")) return "Themes in World History (NCERT)";
    if (sub.includes("political")) return "Indian Constitution at Work & Political Theory (NCERT)";
    if (sub.includes("geography")) return "Fundamentals of Physical Geography & India: Physical Environment (NCERT)";
    if (sub.includes("psychology")) return "Introduction to Psychology (NCERT)";
    if (sub.includes("sociology")) return "Introducing Sociology & Understanding Society (NCERT)";
    if (sub.includes("physical education")) return "Health and Physical Education (CBSE)";
    if (sub.includes("english")) return "Hornbill & Snapshots (NCERT)";
    if (sub.includes("hindi")) return "Aroh Part-1, Vitan Part-1 & Abhivyakti Aur Madhyam (NCERT)";
  }

  // Class 12
  if (cls === "Class 12") {
    if (sub.includes("physics")) return "Physics Part-I & Part-II (NCERT)";
    if (sub.includes("chemistry")) return "Chemistry Part-I & Part-II (NCERT)";
    if (sub.includes("biology")) return "Biology (Class XII) (NCERT)";
    if (sub.includes("applied math")) return "Applied Mathematics (CBSE / NCERT)";
    if (sub.includes("math")) return "Mathematics Part-I & Part-II (NCERT)";
    if (sub.includes("account")) return "Partnership & Company Accounts, Financial Statement Analysis (NCERT)";
    if (sub.includes("business")) return "Principles and Functions of Management, Business Finance & Marketing (NCERT)";
    if (sub.includes("economics")) return "Introductory Macroeconomics & Indian Economic Development (NCERT)";
    if (sub.includes("computer science")) return "Computer Science with Python (NCERT)";
    if (sub.includes("informatics")) return "Informatics Practices with Python (NCERT)";
    if (sub.includes("history")) return "Themes in Indian History Parts I, II & III (NCERT)";
    if (sub.includes("political")) return "Contemporary World Politics & Politics in India Since Independence (NCERT)";
    if (sub.includes("geography")) return "Fundamentals of Human Geography & India: People and Economy (NCERT)";
    if (sub.includes("psychology")) return "Psychology (Class XII) (NCERT)";
    if (sub.includes("sociology")) return "Indian Society & Social Change and Development in India (NCERT)";
    if (sub.includes("physical education")) return "Health and Physical Education (CBSE)";
    if (sub.includes("english")) return "Flamingo & Vistas (NCERT)";
    if (sub.includes("hindi")) return "Aroh Part-2, Vitan Part-2 & Abhivyakti Aur Madhyam (NCERT)";
  }

  return "Official CBSE / NCERT Prescribed Textbook";
}

// Centralized store for selected chapters/subtopics across all classes & subjects
// Key: `${cls}::${subject}` -> { checked: Set, unchecked: Set, initialized: boolean }
export const syllabusSelectionStore = {};

// Dedicated store for Student Examination Syllabus Sheet circular portions
// Key: `${cls}::${subject}` -> { checked: Set, unchecked: Set, initialized: boolean }
export const sheetSelectionStore = {};

function getActiveSelectionKey() {
  const cls = classSelect ? classSelect.value : '';
  const subj = subjectSelect ? subjectSelect.value : '';
  if (!cls || !subj) return null;
  return `${cls}::${subj}`;
}

function saveActiveMainPanelSyllabusState() {
  const key = getActiveSelectionKey();
  if (!key || !syllabusContainer) return;

  const allCbs = syllabusContainer.querySelectorAll('.chapter-cb');
  if (allCbs.length === 0) return;

  const checkedValues = new Set();
  const uncheckedValues = new Set();

  allCbs.forEach(cb => {
    if (cb.checked) {
      checkedValues.add(cb.value);
    } else {
      uncheckedValues.add(cb.value);
    }
  });

  syllabusSelectionStore[key] = {
    checked: checkedValues,
    unchecked: uncheckedValues,
    initialized: true
  };
}

function restoreMainPanelSyllabusState(cls, subj) {
  const key = `${cls}::${subj}`;
  const saved = syllabusSelectionStore[key];
  if (!saved || !saved.initialized || !syllabusContainer) return false;

  const allCbs = syllabusContainer.querySelectorAll('.chapter-cb');
  allCbs.forEach(cb => {
    if (saved.checked.has(cb.value)) {
      cb.checked = true;
    } else if (saved.unchecked.has(cb.value)) {
      cb.checked = false;
    }
  });

  // Recompute parent checkboxes state (checked / indeterminate / unchecked)
  document.querySelectorAll('.chapter-subtopic-group').forEach(group => {
    const parentCb = group.querySelector('.chapter-parent-cb');
    const badge = group.querySelector('.subtopic-count-badge');
    const childCbs = Array.from(group.querySelectorAll('.subtopic-cb'));
    if (parentCb && childCbs.length > 0) {
      const checkedCount = childCbs.filter(c => c.checked).length;
      if (checkedCount === childCbs.length) {
        parentCb.checked = true;
        parentCb.indeterminate = false;
        if (badge) {
          badge.textContent = `${childCbs.length} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        }
      } else if (checkedCount > 0) {
        parentCb.checked = false;
        parentCb.indeterminate = true;
        if (badge) {
          badge.textContent = `${checkedCount} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        }
      } else {
        parentCb.checked = false;
        parentCb.indeterminate = false;
        if (badge) {
          badge.textContent = `${childCbs.length} Subtopics`;
          badge.classList.remove('has-selected');
        }
      }
    }
  });

  document.querySelectorAll('.writing-subgroup-block').forEach(block => {
    const badge = block.querySelector('.writing-group-badge');
    const childCbs = Array.from(block.querySelectorAll('.writing-topic-cb'));
    if (childCbs.length > 0) {
      const checkedCount = childCbs.filter(c => c.checked).length;
      if (badge) {
        if (checkedCount > 0) {
          badge.textContent = `${checkedCount} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        } else {
          badge.textContent = `${childCbs.length} Topics`;
          badge.classList.remove('has-selected');
        }
      }
      childCbs.forEach(cb => {
        const chip = cb.closest('.writing-topic-chip');
        if (chip) {
          if (cb.checked) chip.classList.add('is-checked');
          else chip.classList.remove('is-checked');
        }
      });
    }
  });

  document.querySelectorAll('.writing-subgroup-card').forEach(card => {
    const parentCb = card.querySelector('.writing-group-cb');
    const badge = card.querySelector('.subtopic-count-badge');
    const childCbs = Array.from(card.querySelectorAll('.writing-topic-cb'));
    if (parentCb && childCbs.length > 0) {
      const checkedCount = childCbs.filter(c => c.checked).length;
      if (checkedCount === childCbs.length) {
        parentCb.checked = true;
        parentCb.indeterminate = false;
        if (badge) {
          badge.textContent = `${childCbs.length} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        }
      } else if (checkedCount > 0) {
        parentCb.checked = false;
        parentCb.indeterminate = true;
        if (badge) {
          badge.textContent = `${checkedCount} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        }
      } else {
        parentCb.checked = false;
        parentCb.indeterminate = false;
        if (badge) {
          badge.textContent = `${childCbs.length} Topics`;
          badge.classList.remove('has-selected');
        }
      }
    }
  });

  // Update Select All checkbox
  const selectAllCb = document.getElementById('selectAllChapters');
  if (selectAllCb) {
    const applicableCbs = Array.from(allCbs).filter(c => !c.disabled);
    selectAllCb.checked = applicableCbs.length > 0 && applicableCbs.every(c => c.checked);
  }

  return true;
}

function getSubjectSelectionForSheet(cls, subjName) {
  const key = `${cls}::${subjName}`;
  const saved = sheetSelectionStore[key];
  if (saved && saved.initialized) {
    return saved.checked;
  }

  // Inherit active selections from Prompt Generation module if available (Unidirectional Sync)
  const promptSaved = syllabusSelectionStore[key];
  if (promptSaved && promptSaved.initialized && promptSaved.checked.size > 0) {
    sheetSelectionStore[key] = {
      checked: new Set(promptSaved.checked),
      unchecked: new Set(promptSaved.unchecked),
      initialized: true
    };
    return sheetSelectionStore[key].checked;
  }

  // Default to ALL prescribed items CHECKED for this subject on initial load
  const flatItems = getFlatItemsForSubject(cls, subjName);
  const allVals = new Set();
  flatItems.forEach(it => {
    allVals.add(it.value);
    if (it.secKey) allVals.add(`${it.secKey}: ${it.value}`);
  });
  sheetSelectionStore[key] = {
    checked: allVals,
    unchecked: new Set(),
    initialized: true
  };
  return sheetSelectionStore[key].checked;
}

// Render Syllabus Checklist in clean Sectionwise/Bookwise & Serial Order
function renderSyllabusChecklist(syllabusData) {
  syllabusContainer.innerHTML = '';
  
  if (!syllabusData || (Array.isArray(syllabusData) && syllabusData.length === 0)) {
    syllabusContainer.innerHTML = '<span class="placeholder-text">No syllabus specified. Click "⚡ Fetch CBSE Syllabus" above to pull official chapters.</span>';
    return;
  }

  const currentClass = classSelect.value;
  const currentSubject = subjectSelect.value;
  const bookName = getPrescribedBookName(currentClass, currentSubject);
  if (bookName) {
    const bookBanner = document.createElement('div');
    bookBanner.className = 'prescribed-book-banner';
    bookBanner.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 6px; font-size: 0.84rem; color: #0f172a;";
    bookBanner.innerHTML = `<span style="font-size: 1.1rem;">📖</span> <span>Prescribed Textbook: <strong style="color: #0369a1; font-weight: 700;">${bookName}</strong></span>`;
    syllabusContainer.appendChild(bookBanner);
  }
  
  const selectAllDiv = document.createElement('div');
  selectAllDiv.className = 'checkbox-item';
  selectAllDiv.style.borderBottom = '1px solid rgba(255,255,255,0.15)';
  selectAllDiv.style.marginBottom = '0.75rem';
  selectAllDiv.style.borderBottom = '1px solid #e2e8f0';
  selectAllDiv.style.paddingBottom = '0.75rem';
  
  const selectAllCb = document.createElement('input');
  selectAllCb.type = 'checkbox';
  selectAllCb.id = 'selectAllChapters';
  
  const selectAllLabel = document.createElement('label');
  selectAllLabel.htmlFor = 'selectAllChapters';
  selectAllLabel.textContent = 'Select All Chapters / Units';
  selectAllLabel.style.margin = '0';
  selectAllLabel.style.cursor = 'pointer';
  selectAllLabel.style.fontWeight = '600';
  selectAllLabel.style.color = '#0284c7';
  selectAllLabel.style.flex = '1';
  
  selectAllDiv.appendChild(selectAllCb);
  selectAllDiv.appendChild(selectAllLabel);

  const expandCollapseBtn = document.createElement('button');
  expandCollapseBtn.type = 'button';
  expandCollapseBtn.id = 'toggleAllAccordionsBtn';
  expandCollapseBtn.textContent = '▾ Expand All';
  expandCollapseBtn.style.cssText = "background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 3px 10px; font-size: 0.74rem; color: #0284c7; cursor: pointer; font-weight: 600; margin-left: auto; transition: all 0.15s ease;";
  selectAllDiv.appendChild(expandCollapseBtn);

  let areAllExpanded = false;
  expandCollapseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    areAllExpanded = !areAllExpanded;
    expandCollapseBtn.textContent = areAllExpanded ? '▴ Collapse All' : '▾ Expand All';
    expandCollapseBtn.style.background = areAllExpanded ? '#0284c7' : '#f1f5f9';
    expandCollapseBtn.style.color = areAllExpanded ? '#ffffff' : '#0284c7';
    document.querySelectorAll('.chapter-subtopic-group').forEach(group => {
      const body = group.querySelector('.chapter-subtopic-body');
      const icon = group.querySelector('.chapter-toggle-icon');
      if (body) body.style.display = areAllExpanded ? 'block' : 'none';
      if (icon) icon.style.transform = areAllExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
    });
  });

  syllabusContainer.appendChild(selectAllDiv);

  // For Class 9 & Class 10 Science, render a sleek discipline switcher bar
  const isClass9or10 = currentClass === 'Class 9' || currentClass === 'Class 10';
  const isScienceRelated = isClass9or10 && (
    currentSubject === 'Science' || 
    currentSubject === 'Science (Physics)' || 
    currentSubject === 'Science (Chemistry)' || 
    currentSubject === 'Science (Biology)' ||
    currentSubject === 'Science (Rationalized 086 Legacy)'
  );

  if (isScienceRelated) {
    const quickBar = document.createElement('div');
    quickBar.className = 'science-subdiscipline-quickbar';
    quickBar.style.cssText = "display: flex; gap: 6px; margin-bottom: 0.85rem; padding: 0.45rem 0.65rem; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; align-items: center; flex-wrap: wrap;";
    
    const label = document.createElement('span');
    label.style.cssText = "font-size: 0.76rem; font-weight: 700; color: #0284c7; margin-right: 4px; display: flex; align-items: center; gap: 4px;";
    label.innerHTML = "<span>⚡ Discipline:</span>";
    quickBar.appendChild(label);

    const disciplines = [
      { name: "Science", label: currentClass === 'Class 9' ? "🧭 Exploration (All Science)" : "🔬 All Science", color: "#0284c7", activeBg: "#0284c7" },
      { name: "Science (Physics)", label: "⚡ Physics", color: "#0369a1", activeBg: "#0284c7" },
      { name: "Science (Chemistry)", label: "🧪 Chemistry", color: "#047857", activeBg: "#059669" },
      { name: "Science (Biology)", label: "🧬 Biology", color: "#7e22ce", activeBg: "#9333ea" }
    ];
    if (currentClass === 'Class 9') {
      disciplines.push({ name: "Science (Rationalized 086 Legacy)", label: "📜 Legacy 086", color: "#64748b", activeBg: "#475569" });
    }

    disciplines.forEach(d => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = currentSubject === d.name;
      btn.style.cssText = `padding: 3px 9px; font-size: 0.74rem; font-weight: ${isActive ? '700' : '600'}; border-radius: 6px; border: 1px solid ${isActive ? d.activeBg : '#cbd5e1'}; background: ${isActive ? d.activeBg : '#f8fafc'}; color: ${isActive ? '#ffffff' : d.color}; cursor: pointer; transition: all 0.15s ease;`;
      btn.textContent = d.label;
      btn.title = `Switch to ${d.label} question paper`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (subjectSelect && subjectSelect.value !== d.name) {
          subjectSelect.value = d.name;
          subjectSelect.dispatchEvent(new Event('change'));
        }
      });
      quickBar.appendChild(btn);
    });

    syllabusContainer.appendChild(quickBar);
  }
  
  let globalCbIndex = 0;
  
  const createCheckbox = (chapterName, serialIndex = null, isReadingSection = false, hideWeightage = false) => {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    div.style.display = 'flex';
    div.style.flexDirection = 'row';
    div.style.alignItems = 'center';
    div.style.width = '100%';
    div.style.padding = '0.45rem 0.25rem';
    div.style.borderBottom = '1px solid #f1f5f9';
    
    if (isReadingSection) {
      div.classList.add('reading-section-item');
    }
    
    const currentIndex = globalCbIndex++;
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = chapterName;
    cb.id = `chapter-${currentIndex}`;
    cb.className = 'chapter-cb';
    
    const label = document.createElement('label');
    label.htmlFor = cb.id;
    
    let displayTitle = chapterName.trim();
    if (serialIndex !== null && !displayTitle.toLowerCase().startsWith('unit') && !displayTitle.toLowerCase().startsWith('chapter') && !/^\d+\./.test(displayTitle)) {
      displayTitle = `${serialIndex}. ${displayTitle}`;
    }
    
    label.textContent = displayTitle;
    label.style.margin = '0';
    label.style.fontWeight = '500';
    label.style.fontSize = '0.88rem';
    label.style.cursor = 'pointer';
    label.style.color = '#0f172a';
    label.style.flex = '1';
    
    div.appendChild(cb);
    div.appendChild(label);
    
    if (!hideWeightage) {
      const weightageRow = document.createElement('div');
      weightageRow.className = 'weightage-options';
      weightageRow.style.display = 'flex';
      weightageRow.style.gap = '15px';
      weightageRow.style.marginLeft = 'auto';
      weightageRow.style.fontSize = '0.85rem';
      weightageRow.style.opacity = '0.4';
      weightageRow.style.pointerEvents = 'none';
      weightageRow.style.transition = 'opacity 0.2s ease';
      
      const weights = ['High', 'Medium', 'Low'];
      weights.forEach(w => {
        const lbl = document.createElement('label');
        lbl.style.display = 'flex';
        lbl.style.alignItems = 'center';
        lbl.style.gap = '4px';
        lbl.style.cursor = 'pointer';
        lbl.style.margin = '0';
        lbl.style.color = '#334155';
        lbl.style.fontWeight = '500';
        
        const rad = document.createElement('input');
        rad.type = 'radio';
        rad.name = `weight-${currentIndex}`;
        rad.value = w;
        if (w === 'Medium') rad.checked = true;
        
        lbl.appendChild(rad);
        lbl.appendChild(document.createTextNode(w));
        weightageRow.appendChild(lbl);
      });
      
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          weightageRow.style.opacity = '1';
          weightageRow.style.pointerEvents = 'auto';
        } else {
          weightageRow.style.opacity = '0.4';
          weightageRow.style.pointerEvents = 'none';
        }
      });
      
      div.appendChild(weightageRow);
    }
    
    syllabusContainer.appendChild(div);
  };

  const renderChapterWithSubtopics = (chapterName, subtopics, targetContainer, isReadingSection = false) => {
    const group = document.createElement('div');
    group.className = 'chapter-subtopic-group';
    if (isReadingSection) group.classList.add('reading-section-item');

    const header = document.createElement('div');
    header.className = 'chapter-subtopic-header';

    const left = document.createElement('div');
    left.className = 'chapter-subtopic-left';

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'chapter-toggle-icon';
    toggleIcon.innerHTML = '▼';
    toggleIcon.style.transform = 'rotate(-90deg)';

    const parentCbId = `ch-parent-${globalCbIndex++}`;
    const parentCb = document.createElement('input');
    parentCb.type = 'checkbox';
    parentCb.className = 'chapter-parent-cb';
    parentCb.id = parentCbId;

    const titleLabel = document.createElement('label');
    titleLabel.htmlFor = parentCbId;
    titleLabel.className = 'chapter-title-label';
    titleLabel.textContent = chapterName;

    left.appendChild(toggleIcon);
    left.appendChild(parentCb);
    left.appendChild(titleLabel);

    const badge = document.createElement('span');
    badge.className = 'subtopic-count-badge';
    badge.textContent = `${subtopics.length} Subtopics`;

    header.appendChild(left);
    header.appendChild(badge);
    group.appendChild(header);

    const body = document.createElement('div');
    body.className = 'chapter-subtopic-body';
    body.style.display = 'none';

    const childCbs = [];

    subtopics.forEach((subtopic, subIdx) => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subtopic-checkbox-item';

      const currentSubId = `sub-cb-${globalCbIndex++}`;
      const subCb = document.createElement('input');
      subCb.type = 'checkbox';
      subCb.value = `${chapterName} -> ${subtopic}`;
      subCb.id = currentSubId;
      subCb.className = 'chapter-cb subtopic-cb';

      const subLabel = document.createElement('label');
      subLabel.htmlFor = currentSubId;
      subLabel.className = 'subtopic-label';
      subLabel.textContent = subtopic;

      subDiv.appendChild(subCb);
      subDiv.appendChild(subLabel);
      body.appendChild(subDiv);
      childCbs.push(subCb);

      subCb.addEventListener('change', () => {
        const checkedCount = childCbs.filter(c => c.checked).length;
        if (checkedCount === childCbs.length) {
          parentCb.checked = true;
          parentCb.indeterminate = false;
          badge.textContent = `${childCbs.length} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        } else if (checkedCount > 0) {
          parentCb.checked = false;
          parentCb.indeterminate = true;
          badge.textContent = `${checkedCount} / ${childCbs.length} Selected`;
          badge.classList.add('has-selected');
        } else {
          parentCb.checked = false;
          parentCb.indeterminate = false;
          badge.textContent = `${childCbs.length} Subtopics`;
          badge.classList.remove('has-selected');
        }
      });
    });

    parentCb.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      parentCb.indeterminate = false;
      childCbs.forEach(cb => {
        if (cb.checked !== isChecked) {
          cb.checked = isChecked;
          cb.dispatchEvent(new Event('change'));
        }
      });
      if (isChecked) {
        badge.textContent = `${childCbs.length} / ${childCbs.length} Selected`;
        badge.classList.add('has-selected');
      } else {
        badge.textContent = `${childCbs.length} Subtopics`;
        badge.classList.remove('has-selected');
      }
    });

    header.addEventListener('click', (e) => {
      if (e.target === parentCb || e.target.closest('input')) return;
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      toggleIcon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
    });

    group.appendChild(body);
    targetContainer.appendChild(group);
  };

  const renderWritingSectionBlock = (sectionKey, groupsObj, targetContainer) => {
    const card = document.createElement('div');
    card.className = 'writing-section-card';

    const header = document.createElement('div');
    header.className = 'writing-section-header';
    header.textContent = sectionKey;
    card.appendChild(header);

    for (const [groupName, topics] of Object.entries(groupsObj)) {
      if (!Array.isArray(topics) || topics.length === 0) continue;

      const block = document.createElement('div');
      block.className = 'writing-subgroup-block';

      const titleRow = document.createElement('div');
      titleRow.className = 'writing-subgroup-title';

      const titleText = document.createElement('span');
      titleText.className = 'writing-title-text';
      titleText.textContent = groupName.endsWith(':') ? groupName : `${groupName}:`;

      const badge = document.createElement('span');
      badge.className = 'writing-group-badge';
      badge.textContent = `${topics.length} Topics`;
      badge.title = 'Click to toggle all topics in this group';

      titleRow.appendChild(titleText);
      titleRow.appendChild(badge);
      block.appendChild(titleRow);

      const row = document.createElement('div');
      row.className = 'writing-topics-row';

      const childCbs = [];

      topics.forEach((topic) => {
        const chip = document.createElement('label');
        chip.className = 'writing-topic-chip';

        const cbId = `wr-cb-${globalCbIndex++}`;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'chapter-cb writing-topic-cb';
        cb.value = `${groupName} -> ${topic}`;
        cb.id = cbId;

        const topicSpan = document.createElement('span');
        topicSpan.textContent = topic;

        chip.appendChild(cb);
        chip.appendChild(topicSpan);
        row.appendChild(chip);
        childCbs.push(cb);

        cb.addEventListener('change', () => {
          if (cb.checked) chip.classList.add('is-checked');
          else chip.classList.remove('is-checked');

          const checkedCount = childCbs.filter(c => c.checked).length;
          if (checkedCount > 0) {
            badge.textContent = `${checkedCount} / ${childCbs.length} Selected`;
            badge.classList.add('has-selected');
          } else {
            badge.textContent = `${childCbs.length} Topics`;
            badge.classList.remove('has-selected');
          }
        });
      });

      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const allChecked = childCbs.every(c => c.checked);
        const newState = !allChecked;
        childCbs.forEach(cb => {
          if (cb.checked !== newState) {
            cb.checked = newState;
            cb.dispatchEvent(new Event('change'));
          }
        });
        saveActiveMainPanelSyllabusState();
        if (typeof renderSyllabusSheetPaper === 'function') {
          renderSyllabusSheetPaper();
        }
      });

      block.appendChild(row);
      card.appendChild(block);
    }

    targetContainer.appendChild(card);
  };

  if (Array.isArray(syllabusData)) {
    syllabusData.forEach((chapter, idx) => createCheckbox(chapter, idx + 1));
  } else if (typeof syllabusData === 'object' && syllabusData !== null) {
    for (const [key, value] of Object.entries(syllabusData)) {
      const isChapterWithSubtopics = Array.isArray(value) && (
        key.toLowerCase().startsWith('chapter') ||
        key.toLowerCase().startsWith('unit') ||
        value.some(item => typeof item === 'string' && /^\d+\.\d+/.test(item)) ||
        (!key.toLowerCase().startsWith('section') && !key.toLowerCase().startsWith('theme') && !key.toLowerCase().startsWith('part') && !key.toLowerCase().includes('theory') && !key.toLowerCase().includes('practical') && !key.toLowerCase().includes('lab') && !key.toLowerCase().includes('reading') && !key.toLowerCase().includes('writing'))
      );

      if (isChapterWithSubtopics) {
        renderChapterWithSubtopics(key, value, syllabusContainer);
      } else if (Array.isArray(value)) {
        const sectionHeader = document.createElement('div');
        sectionHeader.textContent = key;
        sectionHeader.style.color = '#0f172a';
        sectionHeader.style.fontWeight = '800';
        sectionHeader.style.fontSize = '0.84rem';
        sectionHeader.style.textTransform = 'uppercase';
        sectionHeader.style.letterSpacing = '0.5px';
        sectionHeader.style.marginTop = '1.25rem';
        sectionHeader.style.marginBottom = '0.4rem';
        sectionHeader.style.padding = '0.4rem 0.65rem';
        sectionHeader.style.background = '#f1f5f9';
        sectionHeader.style.borderRadius = '6px';
        sectionHeader.style.borderLeft = '4px solid #0284c7';
        sectionHeader.style.border = '1px solid #cbd5e1';
        sectionHeader.style.borderLeftWidth = '4px';
        const isReadingSection = (key.includes("Reading") || key.includes("अपठित") || key.toLowerCase().includes("reading skills")) && !key.includes("पठित-अवबोधनम्");
        if (isReadingSection) {
          sectionHeader.classList.add('reading-section-header');
        }
        syllabusContainer.appendChild(sectionHeader);

        const hideWeightage = isReadingSection || key.toLowerCase().includes("writing") || key.includes("लेखन") || key.includes("रचनात्मक");
        value.forEach((chapter, idx) => createCheckbox(chapter, idx + 1, isReadingSection, hideWeightage));
      } else if (typeof value === 'object' && value !== null) {
        const isWritingSection = key.toLowerCase().includes("writing") || key.includes("लेखन") || key.includes("रचनात्मक");

        if (isWritingSection) {
          renderWritingSectionBlock(key, value, syllabusContainer);
        } else {
          const sectionHeader = document.createElement('div');
          sectionHeader.textContent = key;
          sectionHeader.style.color = '#0f172a';
          sectionHeader.style.fontWeight = '800';
          sectionHeader.style.fontSize = '0.84rem';
          sectionHeader.style.textTransform = 'uppercase';
          sectionHeader.style.letterSpacing = '0.5px';
          sectionHeader.style.marginTop = '1.25rem';
          sectionHeader.style.marginBottom = '0.4rem';
          sectionHeader.style.padding = '0.4rem 0.65rem';
          sectionHeader.style.background = '#f1f5f9';
          sectionHeader.style.borderRadius = '6px';
          sectionHeader.style.borderLeft = '4px solid #0284c7';
          sectionHeader.style.border = '1px solid #cbd5e1';
          sectionHeader.style.borderLeftWidth = '4px';
          syllabusContainer.appendChild(sectionHeader);

          for (const [topicName, subtopics] of Object.entries(value)) {
            if (Array.isArray(subtopics)) {
              renderChapterWithSubtopics(topicName, subtopics, syllabusContainer);
            } else {
              createCheckbox(topicName);
            }
          }
        }
      }
    }
  }
  
  const allChapterCbs = document.querySelectorAll('.chapter-cb');
  const allParentCbs = document.querySelectorAll('.chapter-parent-cb, .topic-group-cb, .writing-group-cb');

  // Restore previously saved checklist state if any, else save initial state
  restoreMainPanelSyllabusState(currentClass, currentSubject);
  saveActiveMainPanelSyllabusState();

  selectAllCb.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    allChapterCbs.forEach(cb => {
      const parent = cb.closest('.reading-section-item');
      const isHidden = parent && (parent.classList.contains('unit-test-hidden') || parent.style.display === 'none');
      if (!cb.disabled && !isHidden && cb.checked !== isChecked) {
        cb.checked = isChecked;
        cb.dispatchEvent(new Event('change'));
      }
    });
    allParentCbs.forEach(parentCb => {
      parentCb.checked = isChecked;
      parentCb.indeterminate = false;
    });
    saveActiveMainPanelSyllabusState();
    if (typeof renderSyllabusSheetPaper === 'function') {
      renderSyllabusSheetPaper();
    }
  });
  
  allChapterCbs.forEach(cb => {
    cb.addEventListener('change', () => {
      const applicableCbs = Array.from(allChapterCbs).filter(c => {
        const parent = c.closest('.reading-section-item');
        const isHidden = parent && (parent.classList.contains('unit-test-hidden') || parent.style.display === 'none');
        return !c.disabled && !isHidden;
      });
      const allChecked = applicableCbs.length > 0 && applicableCbs.every(c => c.checked);
      selectAllCb.checked = allChecked;
      if (isWorksheetMode(examNameSelect.value)) {
        syncWorksheetDynamicScaling();
      }
      saveActiveMainPanelSyllabusState();
      if (typeof renderSyllabusSheetPaper === 'function') {
        renderSyllabusSheetPaper();
      }
    });
  });
  
  if (typeof toggleReadingSections === 'function') {
    toggleReadingSections();
  }

  if (typeof renderSyllabusSheetPaper === 'function') {
    renderSyllabusSheetPaper();
  }
}

// Handle Subject Selection Change
subjectSelect.addEventListener('change', (e) => {
  const selectedClass = classSelect.value;
  const selectedSubject = e.target.value;
  
  const isCustom = customSubjectsData && customSubjectsData[selectedClass] && (selectedSubject in customSubjectsData[selectedClass]);
  if (isCustom) {
    deleteCustomSubjectBtn.classList.remove('hidden');
  } else {
    deleteCustomSubjectBtn.classList.add('hidden');
  }
  
  const syllabusData = cbseData[selectedClass] ? cbseData[selectedClass][selectedSubject] : null;
  renderSyllabusChecklist(syllabusData);

  // If exam is already selected, adapt marks & duration to subject defaults or sync worksheet scaling
  if (examNameSelect && examNameSelect.value) {
    if (isWorksheetMode(examNameSelect.value)) {
      syncWorksheetDynamicScaling();
    } else {
      updateExamDetails();
    }
  }

  updateExamBlueprint();
  if (typeof syncSyllabusSheetFromPromptModule === 'function') {
    syncSyllabusSheetFromPromptModule();
  }
});

// Delete Custom Subject Handler
deleteCustomSubjectBtn.addEventListener('click', async () => {
  const selectedClass = classSelect.value;
  const selectedSubject = subjectSelect.value;
  
  if (!confirm(`Are you sure you want to delete the custom subject "${selectedSubject}" for ${selectedClass}?`)) {
    return;
  }
  
  try {
    const res = await fetch('/api/custom-subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'X-Auth-Token': authToken },
      body: JSON.stringify({ action: 'delete', class: selectedClass, subject: selectedSubject })
    });
    
    if (res.ok) {
      if (customSubjectsData[selectedClass]) {
        delete customSubjectsData[selectedClass][selectedSubject];
      }
      if (cbseData[selectedClass]) {
        delete cbseData[selectedClass][selectedSubject];
      }
      localStorage.setItem('gnps_custom_subjects', JSON.stringify(customSubjectsData));
      
      deleteCustomSubjectBtn.classList.add('hidden');
      populateSubjectsDropdown(selectedClass);
      syllabusContainer.innerHTML = '<span class="placeholder-text">Subject deleted. Please select another subject.</span>';
    }
  } catch (err) {
    alert("Error deleting custom subject: " + err.message);
  }
});

// Fetch Latest CBSE Syllabus Button Handler
if (fetchCbseSyllabusBtn) {
  fetchCbseSyllabusBtn.addEventListener('click', async () => {
    const selectedClass = classSelect.value;
  const selectedSubject = subjectSelect.value;
  
  if (!selectedClass) {
    alert("Please select a Class first.");
    return;
  }
  if (!selectedSubject) {
    alert("Please select a Subject first.");
    return;
  }
  
  const origHtml = fetchCbseSyllabusBtn.innerHTML;
  fetchCbseSyllabusBtn.disabled = true;
  fetchCbseSyllabusBtn.innerHTML = '<span>⏳ Syncing NCERT Syllabus...</span>';
  
  try {
    const res = await fetch(`/api/fetch-syllabus?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Authorization': `Bearer ${authToken}`, 'X-Auth-Token': authToken }
    });
    if (!res.ok) throw new Error("Could not fetch syllabus");

    const data = await res.json();
    if (data.syllabus && (Array.isArray(data.syllabus) ? data.syllabus.length > 0 : Object.keys(data.syllabus).length > 0)) {
      if (!cbseData[selectedClass]) cbseData[selectedClass] = {};
      cbseData[selectedClass][selectedSubject] = data.syllabus;
      if (!customSubjectsData[selectedClass]) customSubjectsData[selectedClass] = {};
      customSubjectsData[selectedClass][selectedSubject] = data.syllabus;

      await fetch('/api/custom-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'X-Auth-Token': authToken },
        body: JSON.stringify({
          action: 'save',
          class: selectedClass,
          subject: selectedSubject,
          chapters: data.syllabus
        })
      });
      localStorage.setItem('gnps_custom_subjects', JSON.stringify(customSubjectsData));
      
      renderSyllabusChecklist(data.syllabus);
      
      fetchCbseSyllabusBtn.innerHTML = '<span>✓ NCERT Syllabus Synced!</span>';
      setTimeout(() => {
        fetchCbseSyllabusBtn.innerHTML = origHtml;
        fetchCbseSyllabusBtn.disabled = false;
      }, 2000);
    } else {
      throw new Error("No units found in CBSE curriculum PDF.");
    }
  } catch (err) {
    alert("CBSE Syllabus Fetch Notice: " + err.message);
    fetchCbseSyllabusBtn.innerHTML = origHtml;
    fetchCbseSyllabusBtn.disabled = false;
  }
});
}

// Fetch Latest CBSE Blueprint Button Handler
// Modal Logic for "+ Add Subject" (Clean List Only with Duplicate Checking)
let fetchedCbseSubjectsList = [];

function renderFilteredCbseOptions(filterText = '') {
  const selectedClass = classSelect.value;
  cbseSubjectDropdown.innerHTML = '';
  const search = filterText.toLowerCase().trim();
  
  const filtered = fetchedCbseSubjectsList.filter(s => {
    if (!search) return true;
    return s.name.toLowerCase().includes(search) || 
           (s.code && s.code.includes(search)) || 
           (s.displayName && s.displayName.toLowerCase().includes(search));
  });
  
  if (filtered.length === 0) {
    const noOpt = document.createElement('option');
    noOpt.value = "";
    noOpt.disabled = true;
    noOpt.textContent = `No subjects found matching "${filterText}"`;
    cbseSubjectDropdown.appendChild(noOpt);
  } else {
    filtered.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.name;
      const isAlreadyAdded = isSubjectAlreadyInClass(selectedClass, sub.name, sub.code);
      
      if (isAlreadyAdded) {
        opt.textContent = `${sub.displayName || `${sub.name} (${sub.code})`} — (✓ Already in List)`;
        opt.style.color = '#94a3b8';
        opt.dataset.alreadyAdded = 'true';
      } else {
        opt.textContent = sub.displayName || `${sub.name} (${sub.code})`;
        opt.dataset.alreadyAdded = 'false';
      }
      
      opt.dataset.code = sub.code || '';
      opt.dataset.displayName = sub.displayName || sub.name;
      cbseSubjectDropdown.appendChild(opt);
    });
    cbseSubjectDropdown.selectedIndex = 0;
  }
}

subjectSearchFilter.addEventListener('input', (e) => {
  renderFilteredCbseOptions(e.target.value);
});

openAddSubjectModalBtn.addEventListener('click', async () => {
  let selectedClass = classSelect.value;
  if (!selectedClass) {
    classSelect.focus();
    alert("Please select a Class first from the Class dropdown!");
    return;
  }
  
  modalTitle.textContent = `Add Subject for ${selectedClass}`;
  modalSubtitle.textContent = `Select an official CBSE subject to add`;
  addSubjectModal.classList.remove('hidden');
  modalLoadingSpinner.classList.remove('hidden');
  modalBodyForm.classList.add('hidden');
  subjectSearchFilter.value = '';
  
  try {
    const res = await fetch(`/api/cbse-subjects?class=${encodeURIComponent(selectedClass)}`, {
      headers: { 'Authorization': `Bearer ${authToken}`, 'X-Auth-Token': authToken }
    });
    if (!res.ok) throw new Error("Failed to fetch CBSE subjects");
    
    fetchedCbseSubjectsList = await res.json();
    
    modalLoadingSpinner.classList.add('hidden');
    modalBodyForm.classList.remove('hidden');
    modalSubtitle.textContent = `Select from ${fetchedCbseSubjectsList.length} CBSE official subjects & electives:`;
    
    renderFilteredCbseOptions('');
    subjectSearchFilter.focus();
    
  } catch (err) {
    alert("Error querying CBSE directory: " + err.message);
    modalLoadingSpinner.classList.add('hidden');
    modalBodyForm.classList.remove('hidden');
  }
});

function closeModal() {
  addSubjectModal.classList.add('hidden');
}

closeAddSubjectModalBtn.addEventListener('click', closeModal);
cancelAddSubjectBtn.addEventListener('click', closeModal);

// Add selected subject with duplicate validation
async function handleAddSelectedSubject() {
  const selectedClass = classSelect.value;
  const selectedOpt = cbseSubjectDropdown.selectedOptions[0];
  
  if (!selectedOpt || !selectedOpt.value) {
    alert("Please select a subject from the list.");
    return;
  }
  
  const finalSubjectName = selectedOpt.dataset.displayName || selectedOpt.value;
  const subjectCode = selectedOpt.dataset.code || '';
  
  // DUPLICATE VALIDATION CHECK
  if (selectedOpt.dataset.alreadyAdded === 'true' || isSubjectAlreadyInClass(selectedClass, selectedOpt.value, subjectCode)) {
    alert(`⚠️ Error: "${finalSubjectName}" is already present in the subject list for ${selectedClass}!\n\nPlease select a different subject.`);
    return;
  }
  
  saveAddSubjectBtn.disabled = true;
  saveAddSubjectBtn.textContent = 'Adding Subject...';
  
  try {
    let chaptersList = [];
    try {
      const sylRes = await fetch(`/api/fetch-syllabus?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedOpt.value)}`, {
        headers: { 'Authorization': `Bearer ${authToken}`, 'X-Auth-Token': authToken }
      });
      if (sylRes.ok) {
        const sylData = await sylRes.json();
        if (sylData.syllabus && (Array.isArray(sylData.syllabus) ? sylData.syllabus.length > 0 : Object.keys(sylData.syllabus).length > 0)) {
          chaptersList = sylData.syllabus;
        }
      }
    } catch (e) {
      console.warn("Could not fetch syllabus for new subject", e);
    }
    
    if (!chaptersList || (Array.isArray(chaptersList) && chaptersList.length === 0)) {
      chaptersList = [
        `Unit 1: Fundamentals of ${finalSubjectName}`,
        `Unit 2: Core Theoretical Principles & Concepts`,
        `Unit 3: Applied Methodologies & Practice`,
        `Unit 4: Advanced Problem Solving & Applications`
      ];
    }
    
    const res = await fetch('/api/custom-subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'X-Auth-Token': authToken },
      body: JSON.stringify({
        action: 'save',
        class: selectedClass,
        subject: finalSubjectName,
        chapters: chaptersList
      })
    });
    
    if (res.ok) {
      if (!customSubjectsData[selectedClass]) customSubjectsData[selectedClass] = {};
      customSubjectsData[selectedClass][finalSubjectName] = chaptersList;
      if (!cbseData[selectedClass]) cbseData[selectedClass] = {};
      cbseData[selectedClass][finalSubjectName] = chaptersList;
      localStorage.setItem('gnps_custom_subjects', JSON.stringify(customSubjectsData));
      
      populateSubjectsDropdown(selectedClass, finalSubjectName);
      closeModal();
    } else {
      throw new Error("Server rejected save operation");
    }
  } catch (err) {
    alert("Error adding subject: " + err.message);
  } finally {
    saveAddSubjectBtn.disabled = false;
    saveAddSubjectBtn.textContent = 'Add Subject';
  }
}

saveAddSubjectBtn.addEventListener('click', handleAddSelectedSubject);
cbseSubjectDropdown.addEventListener('dblclick', handleAddSelectedSubject);

// Helper to get official CBSE subject with code
function getSubjectWithCode(subjectName, className) {
  if (!subjectName) return "";
  if (/\([0-9]{3}\)/.test(subjectName)) return subjectName.trim();
  
  const subLower = subjectName.toLowerCase().trim();
  const isSenior = className === "Class 11" || className === "Class 12";

  if (!isSenior) {
    if (subLower === "physics" || subLower === "science (physics)" || subLower === "physics (science)") return "Science (Physics) (086)";
    if (subLower === "chemistry" || subLower === "science (chemistry)" || subLower === "chemistry (science)") return "Science (Chemistry) (086)";
    if (subLower === "biology" || subLower === "science (biology)" || subLower === "biology (science)") return "Science (Biology) (086)";
  }
  
  const codeMap = {
    "science": "086",
    "science (physics)": "086",
    "science (chemistry)": "086",
    "science (biology)": "086",
    "science (rationalized 086 legacy)": "086",
    "science (ncf-se exploration)": "086",
    "science (exploration)": "086",
    "physics (science)": "086",
    "chemistry (science)": "086",
    "biology (science)": "086",
    "mathematics": isSenior ? "041" : "041",
    "mathematics (standard)": "041",
    "mathematics standard": "041",
    "mathematics (basic)": "241",
    "mathematics basic": "241",
    "social science": "087",
    "english": isSenior ? "301" : "184",
    "english (r1)": isSenior ? "301" : "184",
    "english r1": isSenior ? "301" : "184",
    "english (r1 - kaveri)": "184",
    "english r1 - kaveri": "184",
    "english r1 kaveri": "184",
    "english kaveri": "184",
    "kaveri": "184",
    "english (r2)": "101",
    "english r2": "101",
    "english (language & literature)": "184",
    "english language & literature": "184",
    "english (language and literature)": "184",
    "english language and literature": "184",
    "english core": "301",
    "english elective": "001",
    "english communicative": "101",
    "hindi": isSenior ? "302" : "002",
    "hindi (r1)": isSenior ? "302" : "002",
    "hindi r1": isSenior ? "302" : "002",
    "hindi (r2)": "085",
    "hindi r2": "085",
    "hindi (r2 - ganga)": "085",
    "hindi r2 - ganga": "085",
    "hindi r2 ganga": "085",
    "hindi - ganga": "085",
    "hindi ganga": "085",
    "ganga": "085",
    "hindi a": "002",
    "hindi course a": "002",
    "hindi course-a": "002",
    "hindi b": "085",
    "hindi course b": "085",
    "hindi course-b": "085",
    "hindi core": "302",
    "hindi elective": "002",
    "sanskrit": isSenior ? "322" : "122",
    "sanskrit (r3)": isSenior ? "322" : "122",
    "sanskrit r3": isSenior ? "322" : "122",
    "sanskrit core": "322",
    "sanskrit elective": "022",
    "sanskrit communicative": "119",
    "computer applications": "165",
    "information technology": isSenior ? "802" : "402",
    "artificial intelligence": isSenior ? "843" : "417",
    "data science": isSenior ? "844" : "419",
    "physics": "042",
    "chemistry": "043",
    "biology": "044",
    "applied mathematics": "241",
    "accountancy": "055",
    "business studies": "054",
    "economics": "030",
    "computer science": "083",
    "informatics practices": "065",
    "physical education": "048",
    "history": "027",
    "political science": "028",
    "geography": "029",
    "psychology": "037",
    "sociology": "039",
    "painting": "049",
    "legal studies": "074",
    "biotechnology": "045"
  };

  const code = codeMap[subLower];
  return code ? `${subjectName} (${code})` : subjectName;
}

// ==========================================
// WORKSHEET PROMPT GENERATION ENGINE
// ==========================================
export async function buildWorksheetPromptString(activeBtn) {
  const examName = document.getElementById('examName').value;
  const wsConfig = getWorksheetConfig(examName) || WORKSHEET_OPTIONS[0];
  const className = classSelect.value;
  const subjectName = subjectSelect.value;
  const fullSubjectDisplay = getSubjectWithCode(subjectName, className);
  const subtopicFocusInput = document.getElementById('subtopicFocusInput');
  const subtopicFocus = subtopicFocusInput ? subtopicFocusInput.value.trim() : "";

  const selectedChaptersData = Array.from(document.querySelectorAll('.chapter-cb:checked'))
    .filter(cb => {
      if (cb.disabled) return false;
      const parent = cb.closest('.reading-section-item');
      if (parent && (parent.classList.contains('unit-test-hidden') || parent.style.display === 'none')) return false;
      return true;
    })
    .map(cb => cb.value.trim());

  if (selectedChaptersData.length === 0 && !subtopicFocus) {
    alert('Please select at least one chapter/subtopic from the syllabus or enter a specific focus topic.');
    return null;
  }

  const generateBtn = activeBtn;
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>Crafting Master Worksheet... <i class="fas fa-spinner fa-spin"></i></span>';
  }

  try {
    const subtopicCount = Math.max(1, selectedChaptersData.length);
    const qsPerSubtopic = getQsPerSubtopic();
    const minTargetQuestions = subtopicCount * qsPerSubtopic;
    const marksVal = marksInput.value;
    const numMatch = marksVal.match(/\b(\d+)\b/);
    const totalQuestions = numMatch ? Math.max(parseInt(numMatch[1], 10), minTargetQuestions) : minTargetQuestions;

    const cleanClass = className.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanSub = fullSubjectDisplay.replace(/[^a-zA-Z0-9]/g, '_');
    const topicLabel = subtopicFocus || (selectedChaptersData[0] || "Topic");
    const cleanTopic = topicLabel.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const worksheetHtmlFileName = `${cleanClass}_${cleanSub}_Worksheet_${cleanTopic}_${wsConfig.tier}.html`.replace(/__+/g, '_');
    const worksheetPdfFileName = `${cleanClass}_${cleanSub}_Worksheet_${cleanTopic}_${wsConfig.tier}.pdf`.replace(/__+/g, '_');

    const domain = detectSubjectDomain(subjectName);
    const domainLabels = {
      science: "Science & Technology",
      math: "Mathematics & Applied Mathematics",
      commerce: "Commerce, Accountancy & Economics",
      social_science: "Social Sciences (History, Geography, Pol. Science, Economics)",
      language: "Languages & Literature (English, Hindi, Sanskrit)",
      computer: "Computer Science, IP & Information Technology",
      general: "General Academic Curriculum"
    };
    const domainLabel = domainLabels[domain] || "General Academic Curriculum";

    let tierSpecificGuidance = "";
    if (wsConfig.tier === "CBSE_SEC_AB") {
      let domainRecallExamples = "";
      if (domain === "math") {
        domainRecallExamples = `
      *   **Section A (1 Mark):** Precise definitions, fundamental axioms/theorems, algebraic identities, trigonometric ratios/standard values, and CBSE Assertion-Reasoning testing mathematical logic and converse conditions.
      *   **Section B (2 Marks):** 2-step short proofs/verifications, reasoned mathematical explanations ("Explain why degree cannot be negative"), and coordinate/graphical sign conventions with mandatory step working.`;
      } else if (domain === "commerce") {
        domainRecallExamples = `
      *   **Section A (1 Mark):** Fundamental accounting principles (e.g. Conservatism, Accrual, Matching), statutory provisions (Partnership Act 1932, Companies Act 2013), account heads/classification, and CBSE Assertion-Reasoning.
      *   **Section B (2 Marks):** Structured 2-column distinction tables (e.g. Capital Reserve vs Reserve Capital, Cash Flow vs Fund Flow) on explicitly stated parameters, and reasoned conceptual explanations.`;
      } else if (domain === "social_science") {
        domainRecallExamples = `
      *   **Section A (1 Mark):** Direct recall of key historical dates, acts, constitutional articles, geographic resource categories, economic indicators (e.g. HDI, Infant Mortality Rate), and CBSE Assertion-Reasoning on causal relationships.
      *   **Section B (2 Marks):** 2-point structured comparative distinctions on specified criteria (e.g. Formal vs Informal credit, Bangar vs Khadar), short causal reasoning ("Give two reasons why..."), and map/timeline conventions.`;
      } else if (domain === "language") {
        domainRecallExamples = `
      *   **Section A (1 Mark):** Contextual vocabulary, synonyms/antonyms from literary extracts, grammar accuracy (tenses, reported speech, modals), poetic devices (metaphor, personification), and CBSE Assertion-Reasoning.
      *   **Section B (2 Marks):** 2-point character or thematic contrasts, concise 30–40 word textual reasoning with mandatory keywords, and CBSE formal writing layout conventions.`;
      } else if (domain === "computer") {
        domainRecallExamples = `
      *   **Section A (1 Mark):** Programming keywords, syntax rules, valid identifier rules, data types, network protocols (TCP/IP, HTTP), database constraints, and CBSE Assertion-Reasoning on execution logic.
      *   **Section B (2 Marks):** Structured differences (e.g. List vs Tuple, WHERE vs HAVING), 3-5 line code snippet dry-run output predictions, and SQL syntax/indentation rules.`;
      } else {
        // Science / General
        domainRecallExamples = `
      *   **Section A (1 Mark):** Precise definitions, official statements of scientific laws with mandatory prerequisite conditions (e.g. "at constant temperature"), SI units, dimensional representations, and CBSE Assertion-Reasoning testing cause-and-effect.
      *   **Section B (2 Marks):** Structured 2-column comparison tables (e.g. Resistance vs Resistivity, Real vs Virtual) on explicitly stated criteria, concise 2-point qualitative explanations ("Give reasons why..."), and ray/circuit diagram conventions.`;
      }

      tierSpecificGuidance = `
*   **CBSE PREPARATION TARGET: SECTION A & B FOUNDATIONAL MASTERY (1 & 2 MARKS DRILL):**
    - **Primary Objective:** Build unshakeable foundational precision, rapid recall, and zero-error reasoning on high-yield 1-mark and 2-mark CBSE questions.${domainRecallExamples}
    - **Marking Scheme:** Strictly Section A (1 Mark questions) and Section B (2 Marks questions) with official CBSE step-marking rubrics.
    - **Pedagogical Mandate:** 100% clarity on fundamentals. Eliminates student misconceptions, sign convention slips, and missing prerequisite conditions.`;
    } else if (wsConfig.tier === "CBSE_HOTS") {
      let domainHotsExamples = "";
      if (domain === "math") {
        domainHotsExamples = `
      *   **Multi-Concept Integration (3M):** Connecting two or more disparate topics (e.g. Trigonometry with Heights & Distances, Quadratic Equations with AP), demanding multi-stage algebraic manipulation.
      *   **"Spot the Mathematical Fallacy" (3M):** A student has solved a problem with a subtle conceptual or algebraic flaw (e.g. dividing by zero, ignoring extraneous solutions, sign errors in radicals); identify, critique, and correct the error step-by-step.
      *   **Parametric Reasoning & Variations (3M):** Non-routine parametric questions ("What happens to roots if coefficient b is doubled?"), coordinate deductions, or geometric inequality analysis.
      *   **Mathematical Modeling Scenarios (4M):** Real-world applied scenario with 3-4 structured analytical sub-questions requiring mathematical formulation.
      *   **Comprehensive Proofs & High-Rigor Challenges (5M):** Rigorous 5-mark geometric theorems, algebraic proofs, or multi-step coordinate problems.`;
      } else if (domain === "commerce") {
        domainHotsExamples = `
      *   **Multi-Concept Problem Solving (3M):** Complex partnership admission combined with revaluation and capital adjustment, or fiscal policy impact on money supply and inflation.
      *   **"Spot the Accounting/Economic Error" (3M):** Identify flawed accounting entries, incorrect adjustments in balance sheets, or invalid economic assumptions in a business scenario.
      *   **Parametric Sensitivity (3M):** Analyzing the impact of repo rate changes, exchange rate shifts, or tax restructuring on corporate solvency and consumer demand.
      *   **Case-Based Strategic Decisions (4M):** Comprehensive business scenario analysis with 3-4 structured analytical sub-questions demanding strategic evaluation.
      *   **Financial Statement Synthesis (5M):** Complex cash flow statement reconstruction or comprehensive company accounts synthesis with full step-marking.`;
      } else if (domain === "social_science") {
        domainHotsExamples = `
      *   **Cross-Thematic Analytical Linkages (3M):** Comparing historical movements with modern democratic governance, or linking natural resource distribution with regional economic disparities.
      *   **"Critique the Historical / Policy Argument" (3M):** Evaluating conflicting historical perspectives or critiquing public policy decisions based on empirical economic data.
      *   **Demographic & Economic Data Deductions (3M):** Interpreting complex demographic charts, multi-sector GDP tables, or resource depletion models.
      *   **Source-Based High-Order Extracts (4M):** Real historical or policy extracts with 3-4 analytical sub-questions requiring high-level inference beyond textual recall.
      *   **Evaluative Essay & Constitutional Synthesis (5M):** Multi-point critical evaluations requiring structured historical/legal arguments and balanced conclusions.`;
      } else if (domain === "language") {
        domainHotsExamples = `
      *   **Cross-Textual Thematic Synthesis (3M):** Comparing character motivations, conflicts, or central motifs across two distinct literary texts or poems.
      *   **"Critique and Edit" (3M):** Advanced error identification, syntactic nuances, and correcting flawed stylistic or thematic arguments in an essay extract.
      *   **Subtext, Irony & Figurative Deductions (3M):** Interpreting subtle figurative nuances, authorial tone, and implied meanings in complex textual extracts.
      *   **Analytical Paragraph / Data Argumentation (4M):** Drafting an analytical argument synthesizing conflicting statistical charts or social viewpoints.
      *   **Evaluative Long Answer (5M):** Formal speech, debate, or comparative literary critique requiring sustained reasoning and persuasive structure.`;
      } else if (domain === "computer") {
        domainHotsExamples = `
      *   **Multi-Paradigm Programming Challenges (3M):** Combining recursion, dictionary comprehension, and file handling, or integrating Python data processing with SQL databases.
      *   **"Spot the Logical Bug" (3M):** An algorithm contains subtle logical bugs, off-by-one errors, or data integrity flaws; identify the exact line, explain the fallacy, and provide the corrected code.
      *   **Algorithmic Efficiency & Stack Analysis (3M):** Analyzing recursion depth, time complexity tradeoffs, or the impact of varying inputs on list operations.
      *   **System Architecture & DB Design (4M):** Designing network topologies, IP subnets, and normalized database schemas for real-world enterprise requirements.
      *   **Full Program Synthesis & Complex SQL (5M):** Complete robust Python modular implementations with exception handling, or multi-table queries with nested subqueries.`;
      } else {
        // Science / General
        domainHotsExamples = `
      *   **Multi-Concept Integration (3M):** Connecting multiple physical, chemical, or biological principles demanding high-level synthesis and multi-stage reasoning.
      *   **"Spot the Error in Student's Working" (3M):** A student provides a scientific solution containing a subtle conceptual fallacy; critique the misconception and write the correct step-by-step solution.
      *   **Parametric Sensitivity Analysis (3M):** "What happens to variable Y if variable X is doubled while Z is halved?" Non-standard circuit or reaction rate deductions.
      *   **Experimental & Hypothesis Design (4M):** Lab activity setup troubleshooting, empirical hypothesis testing, circuit redesign, or reaction condition optimization.
      *   **Comprehensive Evaluative Derivations (5M):** 5-mark evaluative derivations, multi-stage reaction mechanisms, or complex numerical problems with full step-marking.`;
      }

      tierSpecificGuidance = `
*   **CBSE PREPARATION TARGET: HIGHER ORDER THINKING SKILLS (HOTS & ADVANCED CHALLENGE — 3M, 4M & 5M):**
    - **Primary Objective:** Master the top 15–20% most challenging, discriminative questions of the CBSE Board Examination.${domainHotsExamples}
    - **Difficulty & Tone:** Pre-Board / Board Centum (100/100) readiness rigor. Strictly ZERO simple 1-step or direct recall questions!`;
    } else if (wsConfig.tier === "CBSE_FULL") {
      tierSpecificGuidance = `
*   **CBSE PREPARATION TARGET: COMPLETE CHAPTER BLUEPRINT (SECTIONS A TO E — 1M TO 5M):**
    - **Primary Objective:** Comprehensive 360° coverage across all official CBSE sections in a single unified mastery document:
      * **Section A (1 Mark):** Objective Questions, Multiple Choice, and Assertion-Reasoning.
      * **Section B (2 Marks):** Very Short Answer (VSA) 2-point conceptual distinctions and short reasoning.
      * **Section C (3 Marks):** Short Answer (SA) multi-step analytical problems and proofs.
      * **Section D (5 Marks):** Long Answer (LA) comprehensive derivations, theorems, and multi-stage solutions.
      * **Section E (4 Marks):** Case-Based / Source-Based Integrated Units (CBQ) with sub-questions (i, ii, iii).
    - **Pedagogical Balance:** Seamless progression from foundational recall to high-rigor competency and application.`;
    } else if (wsConfig.tier === "CBSE_COMPETENCY") {
      tierSpecificGuidance = `
*   **CBSE PREPARATION TARGET: 50% COMPETENCY & CASE-STUDY BOOSTER (NEP 2020 CBQ MANDATE):**
    - **Primary Objective:** Specially formulated to conquer the 50% Competency-Based Question requirement mandated by CBSE and NEP 2020:
      * **Real-World Case-Based Units (4 Marks):** Authentic real-life passages, industrial/practical case scenarios, or experimental setups followed by 3 structured sub-questions testing multi-tier understanding.
      * **Data & Extract Interpretation (3 Marks):** Tabular data, graphical trends, or source extracts requiring direct analytical deduction.
      * **Assertion-Reasoning & Contextual MCQs (1 Mark):** Application-focused objective items eliminating rote memorization.
    - **Tone:** Real-world relevance, practical application, and contextual problem-solving.`;
    } else if (wsConfig.tier === "CBSE_PYQ") {
      tierSpecificGuidance = `
*   **CBSE PREPARATION TARGET: 10-YEAR HIGH-YIELD PYQs & RECURRING TRENDS (2015–2026):**
    - **Primary Objective:** Exam invulnerability through exhaustive coverage of high-frequency board questions, recurring patterns, and standard templates:
      * **Recurring 1M & 2M Board Templates:** Most frequently asked definitions, law statements, SI units, and standard 2-point distinctions.
      * **Classic Board 3M Numericals & Proofs:** High-probability multi-step problems that have appeared repeatedly in past CBSE board exams.
      * **Standard 5M Derivations & Long Questions:** Compulsory board derivations, canonical theorems, and classic multi-part questions.
    - **Tone:** Authentic board examination phrasing and examiner-vetted scoring points.`;
    } else {
      // CBSE_SUBJECTIVE
      tierSpecificGuidance = `
*   **CBSE PREPARATION TARGET: SUBJECTIVE & STEP-MARKING MASTERY (VSA 2M, SA 3M, LA 5M):**
    - **Primary Objective:** Master written presentation and answer structuring to secure full step marks in subjective board evaluation:
      * **Section B (2 Marks VSA):** Concise 2-point answers, structured tabular distinctions on specified criteria, and direct concept explanations.
      * **Section C (3 Marks SA):** 3-point structured answers, multi-step numerical working, and reasoned explanations with key formulas.
      * **Section D (5 Marks LA):** Complete step-by-step derivations, structured proofs, and comprehensive answers with annotated diagrams/tables.
    - **Pedagogical Mandate:** Explicit step-marking focus (½M for formula/definition, 1M for substitution/working, 1M for final answer with correct units/conclusions).`;
    }

    let scopeText = "";
    if (subtopicFocus) {
      scopeText += `**PRIMARY SUBTOPIC FOCUS (DEEP DIVE TARGET):**\n` +
        `- **${subtopicFocus}**\n\n` +
        `**Parent Chapter(s) / Context:**\n` +
        (selectedChaptersData.length > 0 ? selectedChaptersData.map(c => `- ${c}`).join('\n') : `- General syllabus of ${fullSubjectDisplay}`) + `\n\n`;
    } else {
      scopeText += `**Syllabus & Prescribed Subtopics (${selectedChaptersData.length} Selected):**\n` +
        selectedChaptersData.map(c => `- ${c}`).join('\n') + `\n\n`;
    }

    const typologiesDesc = calculateTypologyDistribution(totalQuestions, wsConfig.tier, subjectName);
    
    // Group typologies by section for authentic CBSE section banners
    const sectionGroups = {};
    typologiesDesc.forEach(t => {
      if (!sectionGroups[t.section]) {
        sectionGroups[t.section] = { section: t.section, start: t.start, end: t.end, marks: t.marks, typologies: [] };
      } else {
        sectionGroups[t.section].end = Math.max(sectionGroups[t.section].end, t.end);
      }
      sectionGroups[t.section].typologies.push(t.name);
    });

    const sectionBannersList = Object.values(sectionGroups).map(g => {
      const qRange = g.start === g.end ? `Question ${g.start}` : `Questions ${g.start} to ${g.end}`;
      return `    - **${g.section.toUpperCase()} (${qRange}):** ${g.typologies.join(' / ')} (${g.marks})`;
    }).join('\n');

    // Calculate Section boundaries for authentic CBSE grouping and anti-truncation phases
    let phase1End = Math.max(1, Math.round(totalQuestions / 2));
    const secA = typologiesDesc.filter(t => t.section === 'Section A');
    const secACount = secA.reduce((sum, t) => sum + t.count, 0);
    if (secACount > 0 && secACount < totalQuestions) {
      phase1End = secACount;
    } else {
      // If no Section A or Section A is all questions, split at the end of the first section
      const firstSection = typologiesDesc[0]?.section;
      const firstSecCount = typologiesDesc.filter(t => t.section === firstSection).reduce((sum, t) => sum + t.count, 0);
      if (firstSecCount > 0 && firstSecCount < totalQuestions) {
        phase1End = firstSecCount;
      }
    }
    const phase2Start = phase1End + 1;

    const phase1Items = typologiesDesc.filter(t => t.start <= phase1End);
    const phase2Items = typologiesDesc.filter(t => t.end >= phase2Start || t.start >= phase2Start);
    const phase1Sections = [...new Set(phase1Items.map(t => t.section))].join(' & ') || 'First Half';
    const phase2Sections = [...new Set(phase2Items.map(t => t.section))].join(' & ') || 'Remaining Sections';
    const isSinglePhase = phase1End >= totalQuestions;
    const phase2ActionText = isSinglePhase
      ? 'Complete CBSE Step-Marking Scheme & PDF Compilation!'
      : `Part 2: ${phase2Sections} (Questions ${phase2Start} to ${totalQuestions}) + Complete CBSE Step-Marking Scheme!`;

    const chunkingProtocol = `
**CRITICAL 2-PHASE ANTI-TRUNCATION DELIVERY PROTOCOL (MANDATORY TO PREVENT TOKEN TRUNCATION):**
Because this is an exhaustive ${totalQuestions}-question worksheet with detailed CBSE question stems, MCQ options, and complete step-by-step marking rubrics, you MUST deliver it in 2 distinct, unhurried phases:
1.  **PHASE 1 (Generate Questions 1 to ${phase1End} first):**
    - Output the complete print-ready HTML/CSS setup, school header box, student metadata table, and Questions 1 to ${phase1End} under their respective section banners (${phase1Sections}) in full detail.
    - At the bottom of Question ${phase1End}, STOP COMPLETELY and output this exact interactive checkpoint banner:
      \`\`\`
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ✅ PART 1 COMPLETE (Questions 1 to ${phase1End}: ${phase1Sections})
      📋 Target: ${totalQuestions} Questions | Remaining: ${Math.max(0, totalQuestions - phase1End)} Questions
      👉 Please reply "CONTINUE" to generate ${phase2ActionText}
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      \`\`\`
2.  **PHASE 2 (Upon user replying 'CONTINUE'):**
    ${isSinglePhase ? '' : `- Generate Questions ${phase2Start} to ${totalQuestions} under their respective section banners (${phase2Sections}) in full detail.\n    `}- On a fresh page (\`page-break-before: always;\`), append the complete, verified **CBSE Step-by-Step Marking Scheme & Examiner's Tips** with step mark breakdowns (½M, 1M), underlined mandatory keywords, and student pitfall warnings.
    - Close all HTML tags (\`</body></html>\`) and ensure the standalone HTML is completely closed and ready for direct browser preview and printing (\`Ctrl+P\` / \`Cmd+P\` -> Save as PDF).`;

    const typologyPromptDetails = typologiesDesc.map(t => {
      let archetypeDesc = "";
      if (wsConfig.tier === "CBSE_SEC_AB") {
        if (t.id === 1) {
          if (domain === "math") archetypeDesc = "Direct definitions, axioms, algebraic properties, standard value checks, and prerequisite conditions.";
          else if (domain === "commerce") archetypeDesc = "Statutory accounting provisions, legal rules (Partnership Act/Companies Act), and foundational principles.";
          else if (domain === "social_science") archetypeDesc = "Historical dates, constitutional articles, treaty provisions, and fundamental geographic/economic terms.";
          else if (domain === "language") archetypeDesc = "Lexical precision: contextual vocabulary, synonym/antonym identification from extracts, and idioms.";
          else if (domain === "computer") archetypeDesc = "Syntax rules, valid identifiers, token classification, operator precedence, and data types.";
          else archetypeDesc = "Direct definition checks, official statements of scientific laws with mandatory prerequisite conditions (e.g. 'at constant temperature'), SI units, and symbols.";
        } else if (t.id === 2) {
          if (domain === "math") archetypeDesc = "Formula precision, trigonometric identities, discriminant conditions, and single-step arithmetic/algebraic checks.";
          else if (domain === "commerce") archetypeDesc = "Account heads, technical classification of assets/liabilities, and economic indicators.";
          else if (domain === "social_science") archetypeDesc = "Socio-economic indicators, sector classifications, and geographic resource categories.";
          else if (domain === "language") archetypeDesc = "Grammar rules (tenses, reported speech, modals) and poetic devices (metaphor, personification, alliteration).";
          else if (domain === "computer") archetypeDesc = "Network protocols (TCP/IP, HTTP), database constraints (Primary/Foreign Key), and standard module functions.";
          else archetypeDesc = "Identifying physical quantities from derived units, physical significance of mathematical signs (e.g. negative magnification, negative work), and scalar vs vector classifications.";
        } else if (t.id === 3) {
          if (domain === "language") archetypeDesc = "CBSE Assertion-Reasoning testing thematic interpretation, character motivations, and literary inferences.";
          else if (domain === "computer") archetypeDesc = "CBSE Assertion-Reasoning on program execution logic, recursion, loop termination, or database integrity.";
          else archetypeDesc = "Standard CBSE 4-option Assertion–Reason questions testing direct conceptual understanding, cause-and-effect reasoning, and diagnostic distractors eliminating common student misconceptions.";
        } else if (t.id === 4) {
          archetypeDesc = "Distinguishing between easily confused pairs in a structured 2-column comparison table evaluated strictly on explicitly specified parameters.";
        } else if (t.id === 5) {
          archetypeDesc = "Concise 2-point subject-specific explanations with mandatory technical terminology (\"Give reasons why...\").";
        } else {
          archetypeDesc = "Conventions, notation rules, diagram/symbol identification, or statement verification with 1-line justification.";
        }
      } else if (wsConfig.tier === "CBSE_HOTS") {
        if (t.id === 1) {
          archetypeDesc = "Multi-concept integrative problems connecting two or more disparate topics, demanding multi-stage synthesis and analytical reasoning.";
        } else if (t.id === 2) {
          archetypeDesc = "\"Spot the Error in Student's Working\": A student has solved a complex problem or provided reasoning with a subtle conceptual fallacy; identify, critique, and correct the error step-by-step.";
        } else if (t.id === 3) {
          archetypeDesc = "Non-routine parametric questions (\"What happens to variable Y if variable X is doubled / halved?\"), boundary conditions, or data deductions.";
        } else if (t.id === 4) {
          archetypeDesc = "Applied real-world scenario / experimental design / procedural case study with 3-4 structured analytical sub-questions.";
        } else {
          archetypeDesc = "Comprehensive multi-step evaluative derivations, proofs, or high-rigor synthesis requiring exhaustive step-by-step working.";
        }
      } else if (wsConfig.tier === "CBSE_COMPETENCY") {
        if (t.id === 1) archetypeDesc = "Contextual conceptual MCQs and Assertion-Reasoning testing real-life comprehension without rote recall.";
        else if (t.id === 2) archetypeDesc = "Data interpretation, graphical analysis, or source extract deductions requiring step reasoning.";
        else if (t.id === 3) archetypeDesc = "Comprehensive Real-World Case-Based Integrated Unit with 3 structured sub-questions (i, ii, iii) testing multi-tier competency.";
        else archetypeDesc = "Critical scenario evaluation, decision-making under constraints, or troubleshooting an applied practical problem.";
      } else if (wsConfig.tier === "CBSE_PYQ") {
        if (t.id === 1) archetypeDesc = "High-frequency CBSE board objective questions & Assertion-Reasoning from past 10-year examinations.";
        else if (t.id === 2) archetypeDesc = "Recurring board VSA conceptual questions, definitions, and classic 2-point tabular distinctions.";
        else if (t.id === 3) archetypeDesc = "Classic board Short Answer (SA) multi-step numericals, reasoned explanations, and proofs with recurring patterns.";
        else archetypeDesc = "Standard board derivations, canonical theorems, and 5-mark long answer questions frequent in board papers.";
      } else if (wsConfig.tier === "CBSE_SUBJECTIVE") {
        if (t.id === 1) archetypeDesc = "Very Short Answer (VSA) 2-mark questions: 2-point structured distinctions and direct concept explanations.";
        else if (t.id === 2) archetypeDesc = "Short Answer (SA) 3-mark questions: 3-point structured answers, multi-step problem solving, and reasoned deductions.";
        else archetypeDesc = "Long Answer (LA) 5-mark questions: comprehensive step-by-step derivations, proofs, or in-depth solutions.";
      } else {
        // CBSE_FULL
        archetypeDesc = `${t.name} (${t.marks}) testing comprehensive topic mastery adhering to official CBSE question paper standards.`;
      }
      return `•   **${t.section} | ${t.name} (${t.num} — ${t.count} Question${t.count > 1 ? 's' : ''}, ${t.marks}):**\n    *   ${archetypeDesc}`;
    }).join('\n');

    const literatureContextText = getLiteratureContext(className, subjectName, selectedChaptersData);

    let promptText = `I need you to act as an expert CBSE Senior Curriculum Architect & Master Educator. Generate an exhaustive, rock-solid **CBSE 2027 Board Preparation & Chapter Mastery Worksheet** strictly based on the following specifications:

**Worksheet Specifications:**
*   **Document Type:** CBSE 2027 Board Preparation & Chapter Mastery Worksheet
*   **Academic Session:** 2026–27 (Strictly Aligned with 2027 CBSE Board Examination Pattern & NEP 2020)
*   **CBSE Exam Target / Typology:** ${wsConfig.label}
*   **Subject Domain:** ${domainLabel}
*   **Class:** ${className}
*   **Subject:** ${fullSubjectDisplay}
*   **Total Questions:** Exactly ${totalQuestions} Questions (Sequential Numbering: Q1 to Q${totalQuestions})
*   **Time Duration:** Self-Paced / Open Practice (No Time Limit)
*   **Format Mandate:** QUESTIONS ONLY (Pure Question Paper Format — Strictly ZERO blank lines, dotted lines, or answer write-in spaces. Students solve questions in their own notebooks).
*   **Target Student Profile:** Students preparing for the CBSE 2027 Board Examination, mastering core concepts, and aiming for 100/100 marks under NEP 2020 competency guidelines.

${scopeText.trim()}
${literatureContextText ? '\n\n' + literatureContextText.trim() : ''}

${tierSpecificGuidance.trim()}

**CRITICAL AUTHENTICITY MANDATES (ZERO ARTIFICIAL LABELS):**
1.  **STRICTLY FORBIDDEN:** Do NOT print the words "Cluster", "Cluster 1", "Cluster No.", "LOTS", "MOTS", or any artificial labels anywhere in the worksheet HTML, titles, or question stems. The output MUST look 100% like an official CBSE school question paper.
2.  **AUTHENTIC CBSE SECTION HEADERS ONLY:** Organize the questions sequentially (Q1, Q2, ..., Q${totalQuestions}) under official CBSE Section Banners:
${sectionBannersList}
3.  **STRICT ZERO ANSWER SPACE RULE:** Do NOT include dotted lines, write-in lines, or empty boxes for student answers. Students solve all problems in separate answer booklets.

**CBSE 2027 QUESTION TYPOLOGY & MARKS ARCHITECTURE (TOTAL: ${totalQuestions} QUESTIONS):**
For the selected topic/syllabus, you MUST formulate exactly ${totalQuestions} distinct questions distributed across the following authentic CBSE typologies:
${typologyPromptDetails}

**360° ALL-INCLUSIVE MASTERY SOURCING UNIVERSE (BEYOND TEXTBOOK BOUNDARIES):**
Do NOT restrict questions solely to NCERT textbook exercises! While canonical NCERT grounding is mandatory, you MUST synthesize and integrate ALL question archetypes, problem variations, and difficulty tiers required for ABSOLUTE, 100% TOPIC MASTERY across all dimensions:
1.  **The Canonical NCERT Foundation (MANDATORY BASELINE — ~30% of Questions):**
    - NCERT Main Textbook In-Text Questions, blue-box conceptual checkpoints, in-text examples, and experimental activity deductions.
    - NCERT Main Textbook Chapter-End Exercises (covering all fundamental derivations and standard problem templates).
2.  **NCERT Exemplar Problems (DIAGNOSTIC & HOTS — ~25% of Questions):**
    - Conceptual multiple-choice questions with nuanced distractors testing common student misconceptions.
    - Assertion-Reasoning pairs, critical-thinking short answers, and non-routine analytical problems.
3.  **CBSE Board Archives & Official Competency Question Banks (EXAM INVULNERABILITY — ~25% of Questions):**
    - CBSE Previous 10–12 Years Board Examination Papers (Standard PYQs, recurring board question trends, and high-frequency problem styles).
    - Official CBSE Additional Practice Questions (APQ) and Competency-Based Education (CBE / CBT) question banks (from cbseacademic.nic.in/cbe).
4.  **Advanced Reference Literature & Multi-Concept Challenges (DEEP MASTERY & FOUNDATION — ~20% of Questions):**
    - High-yield conceptual, numerical, and multi-tier variations inspired by premier reference authorities:
      * *For Mathematics:* R.D. Sharma, R.S. Aggarwal, and Pearson Foundation.
      * *For Science (Class 9–10):* Lakhmir Singh & Manjit Kaur, H.C. Verma Foundation, and NCERT Lab Manual experiments.
      * *For Senior Sciences (Class 11–12):* H.C. Verma, S.L. Arora, O.P. Tandon, M.S. Chouhan, and Trueman's Biology.
      * *For Commerce/Economics:* T.S. Grewal, Sandeep Garg, Poonam Gandhi, and NCERT Source-Based extracts.
      * *For Humanities/Social Science:* NCERT Source-Based History/Pol.Sci extracts, Ramesh Singh, D.D. Basu.
      * *For Computer Science / IP:* Preeti Arora, Sumita Arora, and Official CBSE Python/SQL sample papers.
    - Real-world application case studies, parametric sensitivity problems ("what-if" variations), and troubleshooting/error-detection challenges.
*   **THE ABSOLUTE PROFICIENCY GUARANTEE:**
    If a concept, formula, derivation, edge-case, graphical curve, or application exists within this topic, it MUST be comprehensively represented in this worksheet. After completing this worksheet, the student MUST be fully equipped to score 100% on ANY question asked from this topic in school exams, board exams, or competitive foundation tests!

${chunkingProtocol.trim()}

**MANDATORY PRINT-READY HTML & CSS SPECIFICATIONS:**
You must format the entire worksheet in clean, modern, print-ready HTML and CSS adhering to these exact standards:
1.  **A4 Portrait Page Setup:**
    Enforce strict \`@page { size: A4 portrait; margin: 15mm; }\` with CSS line-height: 1.3 and crisp black text (\`#000\`).
2.  **Official School Header (Centered Box at Top of Page 1):**
    \`\`\`html
    <div class="header-box" style="border: 2px solid #000; padding: 10px; text-align: center; margin-bottom: 12px;">
      <h1 style="font-size: 16pt; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 0.5px;">GOMTI NANDAN PUBLIC SCHOOL</h1>
      <h2 style="font-size: 11.5pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">CBSE 2027 BOARD PREPARATION — CHAPTER MASTERY WORKSHEET</h2>
      <div style="font-size: 9.5pt; font-weight: 600; color: #333;">ACADEMIC SESSION 2026–27 | ${wsConfig.shortName.toUpperCase()} | TOTAL QUESTIONS: ${totalQuestions}</div>
    </div>
    \`\`\`
3.  **Student Metadata Box (Right Below Header):**
    \`\`\`html
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #aaa; font-weight: bold; width: 50%;">CLASS: ${className.toUpperCase()} &nbsp;|&nbsp; SUBJECT: ${fullSubjectDisplay.toUpperCase()}</td>
        <td style="padding: 4px 8px; border: 1px solid #aaa; font-weight: bold; width: 50%;">DATE: _______________________</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #aaa;">STUDENT NAME: _________________________________________</td>
        <td style="padding: 4px 8px; border: 1px solid #aaa;">ROLL NO: ____________  SEC: _______</td>
      </tr>
      <tr>
        <td style="padding: 4px 8px; border: 1px solid #aaa;">TOPIC: <strong>${topicLabel}</strong></td>
        <td style="padding: 4px 8px; border: 1px solid #aaa; font-weight: bold;">SCORE: _______ / ${totalQuestions} &nbsp;|&nbsp; SIGN: ________</td>
      </tr>
    </table>
    \`\`\`
4.  **Section Banners & Question Layout (QUESTIONS ONLY — STRICTLY ZERO BLANK ANSWER SPACE):**
    *   **Section Banners:** Before the first question of each section, insert a clean, professional banner:
        \`<div style="background: #1e293b; color: #ffffff; padding: 4px 8px; font-weight: bold; font-size: 9.5pt; margin: 12px 0 8px 0; letter-spacing: 0.5px; border-left: 4px solid #0284c7;">[SECTION NAME]: [SECTION TITLE & MARKS]</div>\`
    *   **CRITICAL ZERO ANSWER SPACE MANDATE:** Do NOT include any dotted lines, blank lines, answer write-in boxes, or working space anywhere in the question sections. This is a compact, high-density question paper; students will solve all questions in their separate answer notebooks.
    *   Keep question spacing tight (\`margin-bottom: 8px;\`) to maximize questions per page and conserve paper.
    *   Wrap each question in a table row:
        \`<div class="q-row" style="width: 100%; margin-bottom: 8px; display: table;">\`
        - Left cell: \`<div style="display: table-cell; width: 35px; font-weight: bold; vertical-align: top;">Q1.</div>\`
        - Center cell: \`<div style="display: table-cell; vertical-align: top; text-align: justify;">[Question Text]</div>\`
        - Right cell: \`<div style="display: table-cell; width: 45px; text-align: right; font-weight: bold; vertical-align: top;">[1]</div>\`
    *   **Assertion-Reason Layout:** Format with standard CBSE options (a), (b), (c), (d) cleanly displayed.
    *   **MCQ Layout:** Format options \`(a)\`, \`(b)\`, \`(c)\`, \`(d)\` into a compact 2x2 grid table immediately below the question stem without extra margins.
    *   **Diagrams & Visuals:** Wrap all diagrams and graphics in '<div class="diagram-container" style="text-align: center; margin: 8px auto 10px auto; page-break-inside: avoid;">' containing an inline vector '<svg>...</svg>' and a bold italic figure caption '<div class="diagram-caption" style="font-size: 10pt; font-weight: bold; margin-top: 4px; font-style: italic;">Fig. X: [Label]</div>'.
5.  **No Footer or Page Numbers:** Do NOT write a footer, page numbers, or "Page X of Y" into the HTML — you cannot know where the pages will break, so it would land mid-page. The GNPS Exam Architect PDF converter stamps the running footer on every page automatically.
6.  **Official CBSE Step-by-Step Marking Scheme & Examiner's Tips:**
    *   At the very end on a fresh page (\`page-break-before: always;\`), provide a complete, verified CBSE Marking Scheme.
    *   **Step-Marking Rubric:** Every question must display precise mark allocation (e.g., [½ Mark for state of law/condition/formula], [½ Mark for substitution/step-reasoning], [1 Mark for final calculated answer with unit / conclusion]).
    *   **Underlined Keywords:** Explicitly \`<u>underline</u>\` or bold the core subject-specific keywords that CBSE evaluators look for.
    *   **Examiner's Warning:** Include a 1-line note per question pointing out where students commonly lose marks in board exams (e.g., omitting constant temperature condition, forgetting units, sign convention error, missing statutory legal reference).

${(() => {
  const wsDiagramProtocol = buildDiagramProtocol(className, subjectName, totalQuestions, true);
  return wsDiagramProtocol ? wsDiagramProtocol.trim() + '\n\n' : '';
})()}**MANDATORY OUTPUT FORMAT — 100% STANDALONE PRINT-READY HTML/CSS:**
You MUST output the complete, publication-grade worksheet as a single, self-contained HTML document inside an \`\`\`html \`\`\` code block:
1. Output complete standalone styled HTML with all typography, diagram SVGs, tables, and CSS embedded in \`<style>\` tags.
2. **STRICTLY DO NOT write or execute Python scripts, and DO NOT use or require any external tools or libraries.** The worksheet is designed to render directly in the Gemini/ChatGPT browser preview or Canvas.
3. Include print-ready CSS (\`@page { size: A4 portrait; margin: 15mm; }\`) and a floating print button (\`<button onclick="window.print()" class="no-print" style="position: fixed; top: 16px; right: 16px; padding: 10px 18px; font-weight: bold; background: #0284c7; color: #fff; border: none; border-radius: 8px; cursor: pointer; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">🖨️ Print / Save as PDF</button>\`).
4. Ensure the HTML renders directly in the browser preview / Canvas, allowing the user to immediately view it and save the exact A4 PDF directly via Print (\`Ctrl+P\` / \`Cmd+P\` -> Save as PDF).`;

    return promptText;
  } catch (err) {
    console.error("Error generating worksheet prompt:", err);
    alert("Error generating worksheet prompt: " + (err.message || err));
    return null;
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = activeBtn._originalHtml || '<span>Generate Expert Prompt</span>';
    }
  }
}

// Universal CBSE Diagram & Visual Protocol Generator (Inline Vector SVG)
function buildDiagramProtocol(className, subjectName, marksVal, isWorksheet = false) {
  const subLower = (subjectName || '').toLowerCase();
  const marks = Number(marksVal) || 80;
  
  const isSst = subLower.includes('social') || subLower.includes('sst') || subLower.includes('history') || subLower.includes('geography') || subLower.includes('political') || subLower.includes('civics') || subLower.includes('087') || subLower.includes('029');
  const isCS = subLower.includes('computer') || subLower.includes('information technology') || subLower.includes('ai') || subLower.includes('artificial intelligence') || subLower.includes('informatics') || subLower.includes('083') || subLower.includes('402') || subLower.includes('417');
  const isScience = !isSst && !isCS && (subLower.includes('science') || subLower.includes('physics') || subLower.includes('chemistry') || subLower.includes('biology') || subLower.includes('086') || subLower.includes('042') || subLower.includes('043') || subLower.includes('044'));
  const isMath = subLower.includes('math') || subLower.includes('041') || subLower.includes('241');
  const isCommerce = subLower.includes('economics') || subLower.includes('accountancy') || subLower.includes('business studies') || subLower.includes('030') || subLower.includes('055') || subLower.includes('054');
  const isEnglish = subLower.includes('english') || subLower.includes('184') || subLower.includes('301') || subLower.includes('001');

  if (!isScience && !isMath && !isSst && !isCommerce && !isCS && !isEnglish) {
    return "";
  }

  let quotaText = "";
  let subjectSpecificRules = "";

  if (isScience) {
    let count = marks >= 70 ? "5 to 8" : marks >= 35 ? "2 to 4" : "1 to 2";
    if (isWorksheet) count = "at least 3 to 6";
    quotaText = `Mandate **${count} diagram-based / experimental questions** distributed across the sections.`;
    subjectSpecificRules = `
    *   **Physics Diagrams:** MUST generate clean inline vector SVG for:
        - Electric circuit schematics (standard cell/battery symbols, resistors in series/parallel, open/closed switch, ammeter in series, voltmeter in parallel, rheostat).
        - Ray optics diagrams (concave/convex lens or mirror, principal axis, optical centre, focal points F and 2F, directional arrowheads on rays ->).
        - Magnetic field lines (bar magnet, current-carrying loop or solenoid), simple pendulums, force vectors.
    *   **Chemistry Setups:** MUST generate clean inline vector SVG for:
        - Experimental apparatus setups (beaker, test tube on stand, delivery tube, gas jar, Bunsen burner, e.g., electrolysis of water, action of acid on metals with soap bubble test, thermal decomposition).
        - Atomic and molecular representations: Electron dot structures (Lewis dot structures with dots/crosses for valence electrons), Bohr's orbital models.
    *   **Biology Diagrams:** MUST generate clean inline vector SVG for:
        - Schematic anatomical & biological structures (e.g., leaf cross-section with stomata, human heart flow schematic, nephron, reflex arc, flower longitudinal section, binary fission in Amoeba / budding in Hydra).
        - **Question Pointer Callouts:** Use clear pointer lines leading to lettered callout labels [A], [B], [C], [D] for student identification and functional explanation questions.`;
  } else if (isMath) {
    let count = marks >= 70 ? "6 to 9" : marks >= 35 ? "3 to 5" : "1 to 2";
    if (isWorksheet) count = "at least 4 to 7";
    quotaText = `Mandate **${count} figure-based / geometric questions** distributed across the sections.`;
    subjectSpecificRules = `
    *   **Geometry Figures:** Circles with tangents from an external point, intersecting chords, triangles with angle arcs, cyclic quadrilaterals, parallel lines with transversals.
    *   **Trigonometry (Heights & Distances):** Right-angled triangles showing tower/pole, ground distance, line of sight, and angle of elevation/depression arcs (30°, 45°, 60°).
    *   **Coordinate Geometry:** Cartesian X-Y coordinate plane with grid markings and plotted coordinates/polygons.
    *   **Mensuration / 3D Solids:** Combination figures (cone mounted on hemisphere, cylinder with hemispherical ends) with labelled dimensions (r, h, l).
    *   **Statistics:** Clear histograms, frequency polygons, or ogives with numbered axis intervals.`;
  } else if (isSst) {
    let count = marks >= 70 ? "3 to 5" : "1 to 2";
    quotaText = `Mandate **${count} visual / map / data-based questions**.`;
    subjectSpecificRules = `
    *   **Map Skill Frame (Section F / Geography):** When map questions are included, generate a clean schematic outline locator frame with labelled markers [A], [B], [C] representing specific Indian geographical/historical locations (e.g., dams, ports, major historical congress sessions) for identification.
    *   **Economics & Civics:** Comparative bar charts (e.g., GDP sector shares, formal vs informal credit) and flowcharts (e.g., judicial hierarchy, manufacturing stages).`;
  } else if (isEnglish) {
    quotaText = `Mandate **1 clear statistical data infographic / chart** for Section A (Reading).`;
    subjectSpecificRules = `
    *   **Case-Based Factual Passage Visual:** In Section A Passage 2 (Case-Based Factual Comprehension), generate an authentic inline vector SVG statistical infographic (bar graph, horizontal comparative chart, or pie chart with percentages and categories) illustrating the passage data. Include 2 to 3 questions in the passage that require students to read, extract, and interpret this visual chart.`;
  } else if (isCommerce) {
    let count = marks >= 70 ? "3 to 5" : "1 to 2";
    quotaText = `Mandate **${count} curve / flowchart / schedule diagrams**.`;
    subjectSpecificRules = `
    *   **Economics:** Supply and demand curves (equilibrium point, shifts vs movements along curves), Production Possibility Frontiers (PPF), circular flow of income diagram, or AD-AS equilibrium.
    *   **Business Studies:** Functional and divisional organizational hierarchy charts.`;
  } else if (isCS) {
    quotaText = `Mandate **2 to 4 logic gate circuits, network topologies, or flowcharts**.`;
    subjectSpecificRules = `
    *   **Logic Gate Circuits:** Standard schematic symbols for AND, OR, NOT, NAND, NOR, XOR gates with input/output wires and truth tables.
    *   **Network Topologies:** Star, Bus, Ring, and Mesh arrangement diagrams.
    *   **Flowcharts:** Start/Stop ovals, decision diamonds, process rectangles, input/output parallelograms with labeled branching arrows.`;
  }

  return `\n\n**MANDATORY CBSE DIAGRAM & VISUAL PROTOCOL (INLINE VECTOR SVG):**
*   **STRICT ZERO-PLACEHOLDER MANDATE:** Under NO circumstances should you output lazy text placeholders such as "[Insert diagram here]", "[Diagram of circuit]", "[Figure of flower]", or skip visual components. CBSE board examinations require real visual stimuli.
*   **MANDATORY FORMAT: PURE INLINE VECTOR SVG (<svg>...</svg>):** You MUST render every stimulus diagram, circuit, ray diagram, apparatus setup, biological schematic, geometry figure, chart, or map locator frame as a valid, self-contained inline SVG element directly inside the question HTML.
*   **CRITICAL ZERO-LEAKAGE RULE: STIMULUS DIAGRAMS VS. STUDENT-DRAWING QUESTIONS:**
    - **NEVER LEAK ANSWERS FOR DRAWING QUESTIONS:** When a question instructs the student to **draw, sketch, trace, or construct** from memory or first principles (e.g., *"Draw a neat, well-labelled schematic diagram depicting the scattering of α-particles by a gold atom...", "Draw a ray diagram showing the image formation by...", "Draw the electron dot structure of...", "Draw an electric circuit to verify Ohm's law...", "Construct a triangle..."*):
      - **STRICTLY DO NOT RENDER THE COMPLETED SOLUTION SVG INSIDE THE STUDENT QUESTION PAPER!** The student must draw it on their answer sheet. Printing the completed diagram underneath a "Draw..." question gives away the solution on the exam sheet.
      - For "Draw..." questions in the Question Paper, output **ONLY the textual question prompt** (no SVG diagram).
      - The completed reference SVG diagram and step-wise mark breakdown (e.g., *[1 Mark for ray paths, 1 Mark for labels]*) belong **EXCLUSIVELY in the Marking Scheme / Answer Key**, NEVER on the blank student Question Paper.
    - **WHEN TO RENDER INLINE SVG ON THE QUESTION PAPER:** Render inline SVG diagrams on the Question Paper ONLY for **Stimulus Questions** where the diagram is an observational/analytical input provided to the student (e.g., *"Study the experimental setup in Fig. 1 and answer...", "In the circuit diagram shown below, calculate the current...", "Identify parts [A] and [B] in the given diagram..."*).
    - **QUESTION FRAMING HARMONY:** If you want a question on the Question Paper to feature an inline SVG diagram, frame the question text as a Stimulus Question (*"The diagram below shows the scattering of α-particles by a gold atom. (i) Why do most particles pass straight through? (ii) What concluded the existence of the nucleus?"*), NEVER as *"Draw the diagram"* while printing that very diagram beneath it!
*   **Subject Quota for this Paper:** ${quotaText}
${subjectSpecificRules}
*   **OFFICIAL CBSE DIAGRAM STYLING & PRINT-SAFE RULES:**
    1. **Monochrome / Grayscale:** All SVG line art MUST use high-contrast black strokes (stroke="#000", stroke-width="1.5" or "2", fill="none" or subtle grayscale fills like #f8fafc) suitable for high-speed risograph / photocopier double-sided printing.
    2. **Typography in SVG:** All text, labels, and values inside <text> tags MUST use font-family="Times New Roman", serif (font-size: 10pt to 12pt) to blend seamlessly with official board typography.
    2b. **MANDATORY SVG ATTRIBUTES (or the diagram will be clipped when converted to PDF):** Every \`<svg>\` MUST carry ALL of \`xmlns="http://www.w3.org/2000/svg"\`, an explicit \`viewBox="0 0 W H"\`, and matching numeric \`width="W" height="H"\` attributes. Every drawn coordinate must lie INSIDE the viewBox bounds — never draw at x or y values larger than the viewBox width/height, or that part of the figure will be cut off.
    3. **Container & Sizing:** Wrap every diagram inside a centered container with an explicit caption:
       \`<div class="diagram-container" style="text-align: center; margin: 8px auto 10px auto; page-break-inside: avoid;">\`
         \`<svg viewBox="0 0 W H" width="240" height="130" style="display: block; margin: 0 auto; max-width: 100%;">...</svg>\`
         \`<div style="font-size: 10pt; font-weight: bold; margin-top: 4px; font-style: italic;">Fig. X: [Concise CBSE Caption]</div>\`
       \`</div>\`
    4. **Anti-Page Break:** The diagram container MUST have \`page-break-inside: avoid;\` so diagrams never get awkwardly split across page breaks. Keep dimensions compact (width: 200px–340px, height: 100px–180px) to preserve strict even-page budgeting.`;
}

// Generate Prompt Function
export async function buildPromptString(activeBtn) {
  const examName = document.getElementById('examName').value;
  if (examName && isWorksheetMode(examName)) {
    return buildWorksheetPromptString(activeBtn);
  }
  const marks = document.getElementById('marks').value;
  const duration = document.getElementById('duration').value;
  const difficulty = document.getElementById('difficulty').value;
  const className = classSelect.value;
  const subjectName = subjectSelect.value;
  const subLower = (subjectName || "").toLowerCase().trim();
  const fullSubjectDisplay = getSubjectWithCode(subjectName, className);
  const isUnitTest = (examName || "").toLowerCase().includes("unit test") || parseInt(marks, 10) <= 25;
  
  const selectedChaptersData = Array.from(document.querySelectorAll('.chapter-cb:checked'))
    .filter(cb => {
      if (cb.disabled) return false;
      const parent = cb.closest('.reading-section-item');
      if (isUnitTest && (parent || cb.value.includes("अपठित") || cb.value.toLowerCase().includes("unseen"))) return false;
      return true;
    })
    .map(cb => {
      const index = cb.id.split('-')[1];
      const hasRadios = document.querySelector(`input[name="weight-${index}"]`);
      const weightRadio = document.querySelector(`input[name="weight-${index}"]:checked`);
      const weightage = hasRadios ? (weightRadio ? weightRadio.value : "Medium") : "None";
      return { name: cb.value, weightage };
    });
                                
  if (selectedChaptersData.length === 0) {
    alert('Please select at least one chapter from the syllabus.');
    return;
  }
  
  const generateBtn = activeBtn;
  const fetchStatus = document.getElementById('fetchStatus');
  
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>Building Prompt... <i class="fas fa-spinner fa-spin"></i></span>';
  fetchStatus.style.display = 'none';

  // The CBSE reference pattern is whatever has already been cached for this
  // subject. Generating never waits on cbseacademic.nic.in: the pattern only
  // changes once a year, so it is refreshed on demand with the "Fetch CBSE
  // Blueprint" button instead of being re-scraped on every single click.
  let sqpData = null;

  try {
    const repoSqp = getSqpBlueprint(className, subjectName);
    if (repoSqp && repoSqp.text) {
      let cleanInstructions = repoSqp.text;
      if (className === "Class 9" && subjectName.toLowerCase().includes("english")) {
        cleanInstructions = cleanInstructions
          .replace(/First Flight\s*(?:&|and)\s*Footprints(?:\s*Without\s*Feet)?/gi, 'Kaveri')
          .replace(/First Flight/gi, 'Kaveri (Prose & Poetry)')
          .replace(/Footprints(?:\s*Without\s*Feet)?/gi, 'Kaveri')
          .replace(/Beehive\s*(?:&|and)\s*Moments/gi, 'Kaveri')
          .replace(/Analytical\s*Paragraph/gi, 'Descriptive Paragraph / Diary Entry / Story Writing');
      }
      sqpData = { year: repoSqp.year || '2026-27', text: cleanInstructions };
    }
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = activeBtn._originalHtml;
  }
  
  let difficultyDistribution = "";
  if (difficulty === "Balanced") {
    difficultyDistribution = `\n*   **Official CBSE Board Examination Typology & Weightage Matrix (BALANCED / STANDARD BOARD LEVEL):**
    - **Official CBSE Question Typology Distribution (Mandatory Board Pattern - NEP 2020):**
      1. **Competency-Focused Questions (CFQs - Minimum 50% Weightage):**
         - Real-world Case-Based Questions (CBQs) / Source-Based Integrated Studies (Section E/D).
         - High-quality conceptual Multiple Choice Questions (MCQs) with diagnostic distractors testing common student misconceptions.
         - Standard CBSE Assertion-Reasoning (A-R) questions with official 4-option rubric.
      2. **Select Response / Foundational Objective Questions (20% Weightage):**
         - Direct NCERT conceptual recall, standard definitions, scientific laws, SI units, and chemical/mathematical nomenclature.
      3. **Constructed Response & Step-Marking Questions (30% Weightage):**
         - Very Short Answer (VSA - 2 Marks, 30–50 words, exactly 2 distinct marking scheme points).
         - Short Answer (SA - 3 Marks, 50–80 words, exactly 3 distinct step-wise points).
         - Long Answer (LA - 5 Marks, sub-divided into structured sub-parts e.g. (a) 2M + (b) 2M + (c) 1M or (a) 3M + (b) 2M, with 100% internal choice).
    - **Official CBSE Sourcing Matrix (To guarantee 100% board score preparation):**
      1. **NCERT Main Textbooks** (In-text activities, solved examples, diagram activities, and chapter-end exercises) -> ~50% of questions.
      2. **NCERT Exemplar Problems** (Standard-level conceptual MCQs, Assertion-Reasoning & structured analytical questions) -> ~25% of questions.
      3. **Official CBSE Competency-Based (CBE / CBT) Question Banks** (from cbseacademic.nic.in) -> ~15% of questions.
      4. **CBSE Past 5-10 Years Board Examination Papers (Standard Board PYQs)** -> ~10% of questions.`;
  } else if (difficulty === "Advanced") {
    difficultyDistribution = `\n*   **Official CBSE Board Examination Typology & Weightage Matrix (ADVANCED / PRE-BOARD RIGOR):**
    - **Official CBSE Question Typology Distribution (High-Rigor Board Pattern - NEP 2020):**
      1. **Competency-Focused Questions (CFQs - Minimum 60% Weightage):**
         - High-tier Case Studies, cross-thematic situational analysis, and experimental troubleshooting from CBSE Additional Practice Questions (APQ).
         - Multi-variable conceptual MCQs and non-routine Assertion-Reasoning questions.
      2. **Structured Constructed Response & Step-Marking Questions (30% Weightage):**
         - Multi-step numerical calculations, derivations with step-marking, and analytical proofs requiring complete formulas, SI units, and Cartesian signs.
         - Rigorous 5-Mark Long Answer questions with structured sub-parts and 100% internal choice.
      3. **High-Precision Objective Questions (10% Weightage):**
         - Diagnostic MCQs with plausible distractors targeting tricky student misconceptions identified in CBSE Board Evaluation Reports.
    - **Official CBSE Sourcing Matrix (Advanced Rigor):**
      1. **NCERT Exemplar Problems (Advanced Level & HOTS)** -> ~40% of questions.
      2. **CBSE Additional Practice Questions (APQ) & Official CBT Question Banks** -> ~30% of questions.
      3. **High-Tier Board PYQs & Standard Reference Literature** (e.g., H.C. Verma, R.D. Sharma Level-2, S.L. Arora, M.S. Chouhan, T.S. Grewal Advanced adjustments) -> ~20% of questions.
      4. **Cross-Chapter Integrated Multi-Tier Case Studies** -> ~10% of questions.`;
  }

  const highChapters = selectedChaptersData.filter(c => c.weightage === "High").map(c => c.name);
  const mediumChapters = selectedChaptersData.filter(c => c.weightage === "Medium").map(c => c.name);
  const lowChapters = selectedChaptersData.filter(c => c.weightage === "Low").map(c => c.name);
  const standardChapters = selectedChaptersData.filter(c => c.weightage === "None").map(c => c.name);

  let syllabusText = "";
  if (selectedChaptersData.length === 1) {
    const singleCh = selectedChaptersData[0].name;
    syllabusText = `**Syllabus & Prescribed Chapters (CRITICAL SCOPE RESTRICTION):**\n` +
      `**[SINGLE-CHAPTER EXAM — 100% OF TOTAL MARKS]:**\n` +
      `- **${singleCh}**\n\n` +
      `*MANDATORY SYLLABUS CONFINEMENT RULE (ZERO TOLERANCE):*\n` +
      `This examination syllabus consists EXCLUSIVELY of "${singleCh}". Exactly 100% of all questions across ALL sections (Section A: MCQs/Objectives, Section B: Short Answer I, Section C: Short Answer II, Section D: Long Answer/Case Studies) amounting to the full ${marks} Marks MUST be formulated SOLELY and EXCLUSIVELY from this single chapter. Under NO circumstances should you include, adapt, or invent questions from any other chapter, unit, or topic outside this chapter.\n\n`;
  } else if (
    (highChapters.length > 0 && mediumChapters.length === 0 && lowChapters.length === 0) ||
    (mediumChapters.length > 0 && highChapters.length === 0 && lowChapters.length === 0) ||
    (lowChapters.length > 0 && highChapters.length === 0 && mediumChapters.length === 0) ||
    (standardChapters.length === selectedChaptersData.length)
  ) {
    syllabusText = `**Syllabus & Prescribed Chapters (EQUAL WEIGHTAGE — 100% OF TOTAL MARKS):**\n` +
      `The examination syllabus consists EXCLUSIVELY of the following ${selectedChaptersData.length} selected chapter(s):\n` +
      selectedChaptersData.map(c => `- ${c.name}`).join('\n') + `\n\n` +
      `*MANDATORY SYLLABUS CONFINEMENT RULE:*\n` +
      `Distribute the 100% total marks (${marks} Marks) evenly and proportionally across ONLY the selected chapters listed above (~${Math.round(100 / selectedChaptersData.length)}% weightage per chapter). Exactly 100% of all questions in Set A and Set B must be drawn strictly from these chapters. Under NO circumstances should you introduce questions from unselected chapters.\n\n`;
  } else {
    syllabusText = `**Syllabus & Chapter Weightage Distribution (100% OF TOTAL MARKS):**\n` +
      `Distribute 100% of the total ${marks} marks strictly among the selected chapters below according to their relative priority tiers. Confine ALL questions across all sections exclusively to these chapters:\n\n`;
    
    if (highChapters.length > 0) {
      syllabusText += `**[HIGH PRIORITY / MAJOR EMPHASIS]:**\n`;
      syllabusText += highChapters.map(c => `- ${c}`).join('\n') + "\n";
      syllabusText += `*(Instruction: Allocate the largest share of marks; prioritize Long Answer, Case-based, and HOTS questions from these chapters).*\n\n`;
    }
    if (mediumChapters.length > 0) {
      syllabusText += `**[MEDIUM PRIORITY / MODERATE EMPHASIS]:**\n`;
      syllabusText += mediumChapters.map(c => `- ${c}`).join('\n') + "\n";
      syllabusText += `*(Instruction: Allocate moderate marks; focus primarily on Short Answer and application-based questions).*\n\n`;
    }
    if (lowChapters.length > 0) {
      syllabusText += `**[LOW PRIORITY / MINOR EMPHASIS]:**\n`;
      syllabusText += lowChapters.map(c => `- ${c}`).join('\n') + "\n";
      syllabusText += `*(Instruction: Allocate a smaller share of marks; focus primarily on MCQs and 1-2 mark questions).*\n\n`;
    }
    if (standardChapters.length > 0) {
      syllabusText += `**[STANDARD SECTIONS]:**\n`;
      syllabusText += standardChapters.map(c => `- ${c}`).join('\n') + "\n\n";
    }

    syllabusText += `*MANDATORY SYLLABUS CONFINEMENT RULE:*\n` +
      `100% of the total ${marks} marks MUST be drawn strictly from the chapters listed above. Under NO circumstances should any question, MCQ, extract, or term be taken from any unselected chapter.\n\n`;
  }

    const activeBlueprint = currentBlueprintState || calculateExamBlueprint(className, subjectName, examName, marks, duration);
  let blueprintPromptText = "";
  if (activeBlueprint && activeBlueprint.sections.length > 0) {
    blueprintPromptText = `\n**MANDATORY QUESTION PAPER BLUEPRINT (STRICT COMPLIANCE REQUIRED):**\n`;
    blueprintPromptText += `*   **Total Marks:** ${activeBlueprint.marks} Marks\n`;
    blueprintPromptText += `*   **Time Duration:** ${activeBlueprint.duration}\n`;
    blueprintPromptText += `*   **Total Questions:** ${activeBlueprint.totalQuestions} Questions\n`;
    blueprintPromptText += `*   **Competency-focused Questions:** Minimum 50% of total marks\n`;
    blueprintPromptText += `\n**Section-wise Question Breakdown & Marks Template:**\n`;
    activeBlueprint.sections.forEach(s => {
      blueprintPromptText += `*   **${s.name}**: ${s.type} -> ${s.count} Question(s) [${s.marksPerQ} each] = ${s.total} Marks (${s.choice})\n`;
    });
    blueprintPromptText += `\n*(Note: You must construct BOTH Set A and Set B strictly conforming to this exact section layout and question count)*\n`;

    const isCombinedScience = (className === 'Class 9' || className === 'Class 10') && subjectName.toLowerCase().includes('science') && !subjectName.toLowerCase().includes('social');
    if (isCombinedScience) {
      blueprintPromptText += `\n**CRITICAL — SECTION MEANING FOR SCIENCE:** Unlike most other subjects, Section A / B / C above are NOT question-type groupings. They are SUBJECT groupings: Section A = Biology questions only, Section B = Chemistry questions only, Section C = Physics questions only. Each section must internally contain its own full mix of MCQs, Assertion-Reasoning, VSA, SA, LA, and Case-Based questions in the exact counts given for that section — do NOT group all MCQs together across subjects, and do NOT create separate Section D/E for question types. This matches the real official CBSE Class 9/10 Science board exam structure.\n`;
    }
  }

  const cleanClass = className.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanExam = examName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanSub = fullSubjectDisplay.replace(/[^a-zA-Z0-9]/g, '_');
  const setAFileName = `${cleanClass}_${cleanExam}_${cleanSub}_Set_A.pdf`.replace(/__+/g, '_');
  const setBFileName = `${cleanClass}_${cleanExam}_${cleanSub}_Set_B.pdf`.replace(/__+/g, '_');

  const literatureContextText = getLiteratureContext(className, subjectName, selectedChaptersData);

  let promptText = `I need you to act as an expert CBSE Paper Setter. Generate a strict CBSE style question paper based on the following specifications:

**Exam Specifications:**
*   **Exam Name:** ${examName}
*   **Class:** ${className}
*   **Subject:** ${fullSubjectDisplay}
*   **Maximum Marks:** ${marks}
*   **Time Duration:** ${duration}
*   **Difficulty Level:** ${difficulty}${difficultyDistribution}

${syllabusText.trim()}
${literatureContextText ? '\n\n' + literatureContextText.trim() : ''}
${blueprintPromptText}

**CRITICAL CONTENT & MANDATORY PRINT-READY HTML/CSS GUIDELINES (MUST FOLLOW):**
1.  **MANDATORY OUTPUT FORMAT — 100% STANDALONE PRINT-READY HTML & CSS:**
    *   You MUST output the complete question paper directly as valid, self-contained HTML/CSS inside an \`\`\`html \`\`\` code block.
    *   **STRICTLY DO NOT write or execute Python scripts, and DO NOT use or require any external compiler or CLI tools.** The document is designed to render directly in the browser preview / Gemini Canvas.
    *   **TWO SEPARATE DOCUMENTS (CRITICAL):** Output **Set A** and **Set B** as **TWO INDEPENDENT, COMPLETE HTML DOCUMENTS in TWO SEPARATE \`\`\`html \`\`\` code blocks**, one immediately after the other. Each code block MUST start with its own \`<!DOCTYPE html>\` and contain its own \`<html>\`, \`<head>\` (with the full embedded \`<style>\`) and \`<body>\` with its own complete school header. **DO NOT merge both sets into one HTML document separated by a page break** — they must be two standalone files so each can be saved and printed as its own separate PDF.
    *   Embed complete print styling (\`@media print { size: A4 portrait; margin: 19mm; }\`) and include a floating print button (\`<button onclick="window.print()" class="no-print" style="position: fixed; top: 16px; right: 16px; padding: 10px 18px; font-weight: bold; background: #0284c7; color: #fff; border: none; border-radius: 8px; cursor: pointer; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">🖨️ Print / Save as PDF</button>\`) so the user can immediately preview and save as a pixel-perfect CBSE A4 PDF directly from their browser (\`Ctrl+P\` / \`Cmd+P\` -> Save as PDF).
2.  **Official CBSE Typography & Diagram Styling:** Style Section headings with **centered bold text only** — do NOT use \`text-decoration: underline\` on a heading/banner block, as the underline misplaces itself onto the next line when the paper is converted to PDF. In your HTML/CSS template, you must set the font family to 'Times New Roman' (or 'Mangal / Noto Serif Devanagari / Kruti Dev 010' for Hindi/Sanskrit), 12pt body text, 14pt bold sub-headings / section headers, and 18pt centered bold main header. For any diagram, chart, or graphic, wrap inside '<div class="diagram-container">' with 'text-align: center; margin: 8px auto 12px auto; page-break-inside: avoid;' and a bold italic figure caption '<div class="diagram-caption">Fig. X: [Label]</div>'.
3.  **Line Spacing & Margins:** Enforce a strict CSS line-height: 1.25 and standard margins of 19mm (0.75 inches) on all sides ('@page { size: A4 portrait; margin: 19mm; }').
4.  **Alignment & Footer:** Ensure clean vertical alignment with right-aligned marks (e.g., [1], [2], [3], [5]) matching official board papers. **DO NOT add a page footer, page numbers, or "Page X of Y" text anywhere in the HTML** — you cannot know how the content will paginate, so any footer you write would land in the middle of a page. The running footer ("GNPS / ${examName.toUpperCase()} / ${fullSubjectDisplay.toUpperCase()} / SET A" on the left and "Page X of Y" on the right) is stamped automatically onto every page by the GNPS Exam Architect PDF converter. Simply leave the bottom of the document clean.
5.  **Even-Page Budgeting & Page Breaks (Critical for Printing):**
    *   The final output for EACH PDF must fit EXACTLY into an even number of pages (e.g., exactly 2, 4, or 6 pages).
    *   **NEVER force a page break between sections.** Do NOT put \`page-break-before: always;\` on Section banners/headings (Section A, B, C...). Sections must flow continuously down the page, one starting immediately after the previous one ends, otherwise the paper wastes half-empty pages. The ONLY permitted forced page break is between Set A and Set B (and those are separate documents anyway).
    *   Compact your line gaps and format MCQ options into a 2x2 grid ((a) ... (b) ... / (c) ... (d) ...).
    *   **CRITICAL CSS RULE FOR PAGE BREAKS:** You must NOT apply 'page-break-inside: avoid;' globally to all table rows ('tr'). Doing so causes long text blocks (like Reading Passages) to jump entirely to the next page, leaving massive blank spaces. You must allow main question rows to break naturally across pages. You may ONLY apply 'page-break-inside: avoid;' strictly to small, nested elements such as the 2x2 MCQ option tables (e.g., '.mcq-table tr { page-break-inside: avoid; }'). The files must be completely ready for double-sided printing.
6.  **Dual Balanced Sets (Set A & Set B):**
    *   Generate **EXACTLY TWO DISTINCT SETS** (**Set A** and **Set B**), delivered as two separate standalone HTML documents in two separate \`\`\`html \`\`\` code blocks (see Rule 1).
    *   Both sets must feature 100% different questions while maintaining the exact same difficulty level, chapter weightage, and blueprint question counts.
7.  **High-Yield Official Repositories (MANDATORY SOURCING):** You MUST source, adapt, and formulate questions directly from the following authoritative repositories:
    *   **Official CBSE Competency-Based Education (CBE / CBT) Question Banks** (from cbseacademic.nic.in/cbe/).
    *   **Official CBSE Additional Practice Questions (APQs)** & latest Board Sample Papers.
    *   **NCERT Exemplar Problems** (mandatory source for conceptual MCQs, Assertion-Reasoning, and HOTS questions).
    *   **NCERT Main Textbooks** (in-text experiment activities, highlighted conceptual boxes, and exercise problems).
    *   **CBSE Previous 10 Years Board Papers (PYQs)**.
8.  **Official CBSE Board Typology Framing & 100% Score Exam Guidelines (NEP 2020 & Latest Board SQP Pattern):**
    *(Note: these typology rules apply to every question of the stated mark value, regardless of which lettered Section it physically appears in - some subjects group questions by type (Section A = all 1-mark, etc.), while Class 9/10 Science groups them by subject area instead (Section A = Biology, B = Chemistry, C = Physics), with every question type appearing inside each of those sections. Follow the "Section-wise Question Breakdown" blueprint above for the actual physical layout.)*
    *   **1-Mark Objective & Assertion-Reasoning Questions:**
        - **Diagnostic MCQs:** Options (a), (b), (c), (d) must feature plausible distractors targeting common student misconceptions documented in CBSE Board Evaluation Reports (e.g., reciprocal lens formula errors, Cartesian sign mistakes in mirror/coordinate geometry, incomplete definitions).
        - **Assertion-Reasoning:** Must strictly follow the official CBSE 4-option rubric:
          *(a) Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).*
          *(b) Both Assertion (A) and Reason (R) are true, but Reason (R) is NOT the correct explanation of Assertion (A).*
          *(c) Assertion (A) is true, but Reason (R) is false.*
          *(d) Assertion (A) is false, but Reason (R) is true.*
    *   **2-Mark Very Short Answer (VSA) Questions:**
        - Word limit: 30–50 words. Formulate questions so students provide **exactly 2 distinct marking points** (1M each or 0.5M × 4), matching official CBSE Marking Scheme value points.
    *   **3-Mark Short Answer (SA) Questions:**
        - Word limit: 50–80 words. Formulate questions so answers require **3 distinct step-wise value points** (or a structured 2M + 1M split).
    *   **5-Mark Long Answer (LA) Questions:**
        - **CBSE Board Rule:** Never frame an unstructured single 5-mark essay. All 5-mark questions MUST be sub-divided into structured sub-parts (e.g., '(a) [2 Marks] + (b) [2 Marks] + (c) [1 Mark]' or '(a) [3 Marks] + (b) [2 Marks]'), exactly as official CBSE Board SQPs do.
        - **100% Internal Choice:** Provide mandatory internal choice between two questions testing the same chapter and skill level.
    *   **4-Mark Case-Based Questions (CBQs):**
        - Authentic real-world case/scenario, diagram, or data table from NCERT or CBSE Question Bank followed by:
          - (i) 1 Mark (factual/conceptual)
          - (ii) 1 Mark (analytical/application)
          - (iii) 2 Marks (higher-order reasoning) with **Internal Choice: (iii) Option A (2M) OR Option B (2M)**.
    *   **Miniature Scaling for Unit Tests (20 Marks) & Periodic Assessments (40 Marks):**
        - For a 20-Mark Unit Test (45 Min): 5 Objective Questions (4 MCQs + 1 A/R) [5M], 2 VSA [4M], 2 SA [6M], 1 LA / Case Study with internal choice [5M] = 20 Marks.
        - For a 40-Mark Periodic Assessment (90 Min): 10 Objective Questions (8 MCQs + 2 A/R) [10M], 3 VSA [6M], 3 SA [9M], 1 LA [5M], 2 Case Studies [10M] = 40 Marks.
        - Every examination, regardless of duration, builds authentic board exam presentation habits and time-management skills from Day 1.
    *   **100% Score Presentation Rigor (Marking Scheme Value Points):**
        - Formulate questions requiring explicit formula statements, correct Cartesian sign conventions (+/-), final numerical answers with mandatory SI units (m, s, N, J, W, Pa, Ω, A, V, etc.), 100% balanced chemical equations with state symbols (s, l, g, aq), labeled biological diagrams with pointer lines, and clean schematic circuit symbols. Strict penalty cues train students for zero mark-deduction in board examinations.
9.  **Strict Rationalization & Strict Syllabus Confinement:**
    *   Strictly **EXCLUDE** all deleted topics/chapters rationalized by CBSE/NCERT for ${fullSubjectDisplay} in ${className}.
    *   **ZERO TOLERANCE FOR UNSELECTED CHAPTERS:** Every single question across all sections (MCQs, Short Answers, Long Answers, Case Studies) in Set A and Set B MUST be derived 100% exclusively from the chapters specified in the Syllabus section above. Under NO circumstances should you invent, borrow, or frame questions from unselected chapters of ${fullSubjectDisplay}.
10. **School Branding & Official Header:**
    *   Display the prominent school header at the top of BOTH sets:
        ------------------------------------------------------------------------
                              GOMTI NANDAN PUBLIC SCHOOL
                               ${examName.toUpperCase()} (${getCurrentAcademicSession()})
        CLASS: ${className.toUpperCase()}               SUBJECT: ${fullSubjectDisplay.toUpperCase()}
        TIME ALLOWED: ${duration}                             MAXIMUM MARKS: ${marks}
        ------------------------------------------------------------------------
        GENERAL INSTRUCTIONS:
        1. All questions are compulsory. However, internal choices are provided.
        2. ... (Specific CBSE instructions for this subject) ...
        ------------------------------------------------------------------------
11. **NO ANSWERS OR MARKING SCHEMES (ZERO SOLUTION LEAKAGE):** Output ONLY the blank student question paper ready for direct printing. If any question asks the student to "Draw...", "Sketch...", "Construct...", or "Plot..." a diagram, output ONLY the question text—NEVER draw or print the completed diagram solution on the student question paper!`;

  if (subjectName.includes("English")) {
    const limits = {
      "Class 6": "Passage 1 (Discursive, approx. 125 words) | Passage 2 (Case-based factual, approx. 75 words)",
      "Class 7": "Passage 1 (Discursive, approx. 150 words) | Passage 2 (Case-based factual, approx. 100 words)",
      "Class 8": "Passage 1 (Discursive, approx. 200 words) | Passage 2 (Case-based factual, approx. 100 words)",
      "Class 9": "Passage 1 (Discursive, approx. 300 words) | Passage 2 (Case-based factual, approx. 150 words)",
      "Class 10": "Passage 1 (Discursive, approx. 400 words) | Passage 2 (Case-based factual, approx. 200 words)",
      "Class 11": "Passage 1 (Discursive, approx. 500 words) | Passage 2 (Case-based factual, approx. 300 words)",
      "Class 12": "Passage 1 (Discursive, approx. 600 words) | Passage 2 (Case-based factual, approx. 400 words)"
    };
    if (limits[className]) {
      promptText += `\n11. **English Reading Section Word Limits:** Ensure the unseen passages adhere to these limits: ${limits[className]}. These are approximate limits; you may increase the word limit by up to 10% if required to maintain passage quality.`;
    }

    const selectedGrammarTopics = selectedChaptersData
      .map(c => c.name)
      .filter(n => n.includes(":") && (n.toLowerCase().includes("grammar") || n.includes("Tenses") || n.includes("Pronouns") || n.includes("Voice") || n.includes("Speech") || n.includes("Concord") || n.includes("Modals") || n.includes("Clauses") || n.includes("Verbs") || n.includes("Adjectives") || n.includes("Prepositions") || n.includes("Sentence")));
      
    if (selectedGrammarTopics.length > 0) {
      promptText += `\n\n**CRITICAL MANDATORY GRAMMAR CONFINEMENT RULE (ZERO TOLERANCE):**\n` +
        `The teacher has selected SPECIFIC grammar subtopics for this examination:\n` +
        selectedGrammarTopics.map(t => `* ${t}`).join('\n') + `\n` +
        `*MANDATORY RESTRICTION:* In Section B (Applied Grammar), formulate all grammar questions (editing, omission, cloze gap-filling, sentence transformation, dialogue completion, and error detection) EXCLUSIVELY based on the specific subtopics listed above. DO NOT frame questions on any unselected grammar rules under any circumstances!`;
    }

    const selectedWritingTopics = selectedChaptersData
      .map(c => c.name)
      .filter(n => {
        const lower = n.toLowerCase();
        return lower.includes("writing") || lower.includes("notice") || lower.includes("letter") || lower.includes("diary") ||
               lower.includes("story") || lower.includes("paragraph") || lower.includes("article") || lower.includes("speech") ||
               lower.includes("message") || lower.includes("email") || lower.includes("invitation") ||
               n.includes("लेखन") || n.includes("अनुच्छेद") || n.includes("पत्र") || n.includes("संवाद") ||
               n.includes("रचनात्मक") || n.includes("चित्रवर्णन") || n.includes("सूक्ति") || n.includes("कथा") || n.includes("विज्ञापन");
      });

    if (selectedWritingTopics.length > 0) {
      promptText += `\n\n**CRITICAL MANDATORY WRITING SKILLS CONFINEMENT RULE:**\n` +
        `The teacher has selected SPECIFIC writing skills topics for this examination:\n` +
        selectedWritingTopics.map(t => `* ${t}`).join('\n') + `\n` +
        `*MANDATORY RESTRICTION:* In Section B (Writing Skills), formulate the writing prompts EXCLUSIVELY from the selected topics above. Adhere strictly to the latest NCERT/CBSE word limits and formatting conventions (box format for Notice/Message, proper sender/receiver addresses & formal salutation for Letters, Day/Date/Time for Diary Entry, outline cues for Story, and Title & Byline for Paragraph/Article). Include internal choices between prompts where prescribed.`;
    }

    if (className === "Class 9") {
      promptText += `\n\n**CRITICAL MANDATORY TEXTBOOK & WRITING OVERRIDE FOR CLASS 9 ENGLISH:**\n` +
        `1. **PRESCRIBED LITERATURE TEXTBOOK: "KAVERI" (NCERT):** The ONLY official literature textbook for Class 9 English is **"Kaveri"**. Strictly DO NOT use or mention Class 10 books ("First Flight", "Footprints Without Feet") or legacy books ("Beehive", "Moments"). All literature extracts, reference-to-context questions, short-answer questions, and long-answer questions in Section C MUST be framed strictly from the selected units/poems of **Kaveri**.\n` +
        `2. **CLASS 9 WRITING SKILLS FORMATS:** For Section B (Writing Skills), strictly formulate prompts for **Descriptive Paragraph (Person/Event/Situation)**, **Diary Entry**, and **Story Writing** (DO NOT frame questions on Analytical Paragraphs which are strictly exclusive to Class 10).`;
    }
  }

  if (subjectName === "Hindi" || subjectName === "Hindi A") {
    const limits = {
      "Class 6": "Passage 1 (Prose, approx. 100-150 words) | Passage 2 (Poem, approx. 50-70 words, 8-10 lines)",
      "Class 7": "Passage 1 (Prose, approx. 150-200 words) | Passage 2 (Poem, approx. 70-80 words, 10-12 lines)",
      "Class 8": "Passage 1 (Prose, approx. 200-220 words) | Passage 2 (Poem, approx. 80-100 words, 12-14 lines)"
    };
    if (limits[className]) {
      promptText += `\n11. **Hindi Reading Section Word Limits:** Ensure the unseen passages adhere to these limits: ${limits[className]}. These are approximate limits; you may increase the word limit by up to 10% if required to maintain passage quality.`;
    }
  }

  if (subjectName === "Hindi B" || subjectName.includes("Hindi B") || subjectName.includes("085")) {
    const limits = {
      "Class 9": "Passage 1 (Prose, strictly NOT LESS THAN 200 words, approx. 200-250 words) | Passage 2 (Prose, strictly NOT LESS THAN 200 words, approx. 200-250 words)",
      "Class 10": "Passage 1 (Prose, strictly NOT LESS THAN 200 words, approx. 200-250 words) | Passage 2 (Prose, strictly NOT LESS THAN 200 words, approx. 200-250 words)"
    };
    if (limits[className]) {
      promptText += `\n11. **Hindi Reading Section Word Limits:** Ensure the unseen passages strictly adhere to these limits: ${limits[className]}. Passages must be intellectually rich, engaging, and strictly NOT LESS THAN 200 words each.`;
    }
  }

  if (subjectName.includes("Sanskrit")) {
    const limits = {
      "Class 6": "1 Passage (approx. 40-50 words, 4-5 simple sentences)",
      "Class 7": "1 Passage (approx. 50-60 words)",
      "Class 8": "1 Passage (approx. 60-80 words)"
    };
    if (limits[className]) {
      promptText += `\n11. **Sanskrit Reading Section Word Limits:** Ensure the unseen passage adheres to these limits: ${limits[className]}. These are approximate limits; you may increase the word limit by up to 10% if required to maintain passage quality.`;
    }
  }

  const isLanguageSubject = subjectName.includes("English") || subjectName.includes("Hindi") || subjectName.includes("Sanskrit");
  if (isLanguageSubject) {
    promptText += `\n\n**INSPIRATIONAL & VALUE-BASED PASSAGE THEMES (MANDATORY CHARACTER BUILDING):**
All unseen reading comprehension passages (both Discursive/Reflective and Case-Based) MUST carry a powerful, subtle underlying theme that inspires students to be compassionate, resilient, and good human beings.
Anchor the passages in timeless human values:
1. **Empathy, Kindness & Inclusivity:** Treating everyone with dignity, supporting the vulnerable, and understanding another's struggle.
2. **Moral Integrity & Honesty:** Living with truthfulness and moral courage, choosing what is right over what is easy.
3. **Resilience, Patience & Gratitude:** Overcoming adversity with optimism, learning from failure, and valuing parents, teachers, and nature.
4. **Compassion for Animals & Nature:** Living harmoniously with the environment and protecting the voiceless.
5. **Selfless Service (Seva) & Civic Responsibility:** The deep fulfillment of contributing to society and helping others selflessly.
*(Note: Present these values naturally through an intellectually mature, engaging real-life story or analytical article, avoiding a preachy tone).*`;
  }

  if (isLanguageSubject) {
    promptText += `\n12. **Assertion-Reasoning & Statement Evaluation in Language Papers:**
    *   **In Reading Section (Unseen Passages):** ${marks >= 75 ? "Embed 1–2 Statement-Evaluation / Assertion-Reasoning questions (testing author's intent, cause-and-effect, and inference)." : marks >= 40 ? "Embed 1 Statement-Evaluation / Cause-and-Effect question in the reading comprehension passage." : "Keep questions direct and focused on core comprehension within the 45-minute limit."}
    *   **In Literature Section (RTC Extracts):** ${marks >= 75 ? "Include 1 Statement 1 vs Statement 2 relationship analysis question in the prose/drama extract." : "Ensure RTC questions test contextual literary analysis."}
    *   **In Grammar Section:** Strictly follow official CBSE MCQ / gap-filling / transformation formats (do NOT force artificial A-R templates into grammar).`;
  } else {
    promptText += `\n12. **Assertion-Reasoning Guidelines for Academic Subjects (Science/Math/SST/Physics/Chemistry/Commerce):**
    *   **Section A Mandate:** Ensure Assertion-Reasoning questions use standard CBSE format: 'Assertion (A)' followed by 'Reason (R)', with options (a) Both A and R are true and R is correct explanation, (b) Both true but R is not correct explanation, (c) A is true R is false, (d) A is false R is true.`;
  }

  if (examName.includes("Unit Test") && isLanguageSubject) {
    promptText += `\n13. **NO READING SECTION (UNIT TEST):** Since this is a 45-minute Unit Test, completely EXCLUDE the long Reading Section (no unseen passages). Distribute the marks originally allocated to the reading section among Grammar, Writing, and Literature.`;
  }

  const isSocialScience = subLower.includes("social science") || subLower.includes("social studies") || subLower.includes("sst") || subLower.includes("087");
  if (isSocialScience && (marks <= 25 || examName.includes("Unit Test"))) {
    const hasMapChapter = selectedChaptersData.some(c => {
      const name = c.name.toLowerCase();
      return name.includes("india") || name.includes("location") || name.includes("physical features") || 
             name.includes("drainage") || name.includes("climate") || name.includes("vegetation") || 
             name.includes("resources") || name.includes("agriculture") || name.includes("minerals") || 
             name.includes("manufacturing") || name.includes("french revolution") || name.includes("nationalism") ||
             name.includes("forest") || name.includes("water");
    });

    if (hasMapChapter) {
      promptText += `\n14. **Social Science Unit Test Map Skill Rule:** Since Geography/History map-related chapters are in the syllabus, provide an internal choice in Section D: Option (A) Pure 5M Long Answer Question OR Option (B) 4M Analytical Question + 1M Map Location/Identification Question from the prescribed CBSE map syllabus.`;
    } else {
      promptText += `\n14. **Social Science Unit Test Map Skill Rule:** Since the selected syllabus comprises Civics/Economics (or non-map units), allocate all 20 marks strictly to conceptual, objective, and analytical questions (NO Map Work).`;
    }
  }

  const isMiddle = (className === 'Class 6' || className === 'Class 7' || className === 'Class 8');
  if (subLower.includes("account") && (className === "Class 11" || className === "Class 12")) {
    const isFullPaper = marks >= 75;
    const partALabel = className === "Class 12"
      ? "Part A (Accounting for Partnership Firms & Companies, 60 Marks)"
      : "Part A (Financial Accounting - I, 56 Marks)";
    const partBLabel = className === "Class 12"
      ? "Part B (Analysis of Financial Statements, 20 Marks — state on the paper that candidates attempt EITHER this OR Computerised Accounting)"
      : "Part B (Financial Accounting - II, 24 Marks)";
    const sixMarkTopics = className === "Class 12"
      ? "Admission / Retirement / Death of a partner, Dissolution of a firm, Issue & Forfeiture of Shares, Issue and Redemption of Debentures, Cash Flow Statement"
      : "Bank Reconciliation Statement, Depreciation (Straight Line & Written Down Value), Trial Balance & Rectification of Errors, Financial Statements of a Sole Proprietorship with adjustments";

    // The chapter checkboxes carry only "Chapter -> subtopic", so the Part a
    // chapter sits under is lost by the time the syllabus list is written out.
    // Spell the mapping out from the live syllabus data.
    const accountancySyllabus = (cbseData[className] || {})[subjectName];
    let partMapText = '';
    if (accountancySyllabus && typeof accountancySyllabus === 'object' && !Array.isArray(accountancySyllabus)) {
      const partGroups = Object.entries(accountancySyllabus)
        .filter(([group, chapters]) => /^part\s/i.test(group) && chapters && typeof chapters === 'object' && !Array.isArray(chapters));
      if (isFullPaper && partGroups.length) {
        partMapText = `\n\n**WHICH CHAPTER BELONGS TO WHICH PART (place every question in the correct Part):**` +
          partGroups.map(([group, chapters]) => `\n*   **${group}** — ${Object.keys(chapters).join('; ')}`).join('') +
          `\n*   A question drawn from a Part A chapter must be numbered inside Part A, and likewise for Part B. Never mix them.`;
      }
    }

    promptText += `\n\n**CBSE ACCOUNTANCY PAPER DESIGN (MANDATORY — THIS SUBJECT DOES NOT USE THE GENERIC SECTION A-E TEMPLATE):**
${isFullPaper
  ? `*   **Two Parts, not lettered sections:** The paper is divided into ${partALabel} and ${partBLabel}. Number the questions continuously from Q1 to Q34 across both parts — do NOT restart numbering in Part B and do NOT label the parts as "Section A/B/C/D/E".`
  : `*   **No Part A / Part B here:** that split belongs to the full ${className === "Class 12" ? "80-mark board-pattern" : "80-mark"} paper. This is a short internal test drawn from the selected chapters only, which may all sit within one part. Print it as ONE continuous run of questions numbered from Q1, with no Part or lettered Section headings.`}
*   **Mark ladder:** Accountancy uses ONLY 1, 3, 4 and 6 mark questions. **NEVER set a 2-mark or a 5-mark question in this subject.**
*   **Internal choice:** ${isFullPaper ? "Provide internal choice in exactly 7 questions, concentrated in the 4-mark and 6-mark numericals, exactly as CBSE does." : "Provide internal choice in the 6-mark numerical, and in one 3-mark or 4-mark question."}
*   **This overrides the general typology guidance above for this subject:** ignore the 2-mark VSA and 5-mark LA rules entirely, and treat the 4-mark questions as numerical problems rather than case-based questions with (i)/(ii)/(iii) sub-parts.

**NUMERICAL / PRACTICAL WEIGHTAGE (THE MOST COMMON FAILURE — READ CAREFULLY):**
*   Accountancy is a **practical, problem-solving subject**. A paper of definitions and theory is WRONG and will not prepare the student.
*   **Every single 4-mark and 6-mark question MUST be a full numerical problem** built on realistic figures — never a descriptive or "explain the concept" question.
*   **At least 70% of the total ${marks} marks must come from numerical / practical problems** requiring the student to prepare accounts, pass entries or compute values. Theory is confined to the 1-mark objective questions and at most one or two 3-mark parts.
*   Every numerical must supply **complete, internally consistent data** — amounts, dates, ratios, rates of interest, depreciation rates — so the problem is actually solvable and the figures reconcile (Balance Sheet totals must agree, Realisation/Revaluation accounts must balance).
*   Required practical formats, reproduced as proper ruled formats with correct column headings: Journal entries with narration, Ledger accounts, Cash Book, Revaluation Account, Partners' Capital Accounts (fixed and fluctuating), Realisation Account, Balance Sheet, Comparative & Common-Size Statements, Accounting Ratios and Cash Flow Statement.
*   Anchor the 6-mark questions in: ${sixMarkTopics}.
*   Use Indian currency notation (₹) and realistic Indian business names and amounts throughout.${partMapText}`;
  }

  const isScienceBranch = subLower.includes("physics") || subLower.includes("chemistry") || subLower.includes("biology");
  if (isScienceBranch) {
    if (subLower.includes("physics")) {
      promptText += `\n\n**CBSE SCIENCE (PHYSICS) BRANCH MANDATES & PEDAGOGICAL RIGOR:**
*   **Ray & Circuit Diagrams:** Ray optics questions must demand clean, sharp ray diagrams with arrowheads denoting ray direction; electricity problems must require standard schematic circuit symbols (resistor, cell/battery polarity, ammeter in series, voltmeter in parallel).
*   **Numerical Working & Step Marking:** Provide complete step calculations with explicit formula statements (e.g. 1/f = 1/v - 1/u, V = IR, H = I²Rt), correct Cartesian sign conventions (+/-), and explicit SI units (m, cm, Ω, A, V, W, J) in final answers.
*   **Physical Reasoning:** Emphasize physical significance of signs (e.g. negative magnification indicating real and inverted image), atmospheric refraction phenomena, and cause-effect reasoning.`;
    } else if (subLower.includes("chemistry")) {
      promptText += `\n\n**CBSE SCIENCE (CHEMISTRY) BRANCH MANDATES & PEDAGOGICAL RIGOR:**
*   **Balanced Chemical Equations:** Every chemical reaction must be fully balanced with correct state symbols (s, l, g, aq) and reaction conditions (temperature, heat, sunlight, catalysts) explicitly specified.
*   **Observations & Distinctions:** Structure observation questions highlighting visible physical changes (color changes, gas evolution with tests like lime water turning milky or brisk effervescence, precipitate formation).
*   **Nomenclature & Bonding:** Enforce correct IUPAC naming conventions, structural isomers, and electron dot structures for covalent bonding.`;
    } else if (subLower.includes("biology")) {
      promptText += `\n\n**CBSE SCIENCE (BIOLOGY) BRANCH MANDATES & PEDAGOGICAL RIGOR:**
*   **Biological Precision & Diagrammatic Accuracy:** Emphasize neat, proportional schematic representations (e.g. nephron, reflex arc, human heart flow diagram, longitudinal section of flower) with accurate 4-point annotations.
*   **Physiological & Mechanism Steps:** Require sequential step pathways (e.g. breakdown of glucose pathways in respiration, double circulation sequence, urine formation steps).
*   **Genetics & Ecology Rubrics:** For heredity questions, strictly require Punnett squares displaying parental genotypes, gametes, and explicit phenotypic and genotypic ratios.`;
    }
  }

  const diagramProtocol = buildDiagramProtocol(className, subjectName, marks, false);
  if (diagramProtocol) {
    promptText += diagramProtocol;
  }

  if (className === 'Class 10' || className === 'Class 12') {
    promptText += `\n\n**BOARD EXAM CRITICAL INSTRUCTION:**\nSince this is for a Board Examination class (${className}), you MUST think hard, take your time, and double-check each and every question. Deeply analyze the Previous Year Question Papers (PYQs) and recent CBSE trends. Prioritize and include questions that have a very high probability of appearing in the upcoming CBSE board examination.`;
  }

  if (sqpData && sqpData.text) {
    promptText += `\n\n**Reference Material (Official ${sqpData.year} Sample Paper Blueprint):**\nBelow is the General Instructions block extracted from the latest official CBSE sample question paper. This block outlines the exact paper pattern, number of sections, and mark distribution. Please strictly adhere to this exact structural template.\n\n**CRITICAL: DOWNSCALING REQUIRED:**\nSince this official reference pattern is for a full 80-mark / 3-hour exam, you MUST proportionally downscale the number of questions in each section to fit the target ${marks} Marks and ${duration} time limit requested above. Maintain the exact same ratio of MCQ vs Short Answer vs Long Answer questions, just fewer of them.\n\n<CBSE_PATTERN_BLUEPRINT>\n${sqpData.text}\n</CBSE_PATTERN_BLUEPRINT>`;
  } else {
    promptText += `\n\n**Reference Material:**\nPlease use your knowledge of the latest official CBSE sample question paper pattern to structure this paper, ensuring the correct ratio of competency-based questions and section-wise mark distribution.`;
  }

  return promptText;
}

function renderSinglePromptOutput(promptText, currentSub) {
  if (!promptText) {
    outputSection.classList.add('hidden');
    return;
  }
  generatedPrompt.value = promptText;
  const promptCharCount = document.getElementById('promptCharCount');
  if (promptCharCount) {
    promptCharCount.textContent = `${promptText.length.toLocaleString()} characters | ~${Math.round(promptText.length / 4)} tokens`;
  }

  const batchStatusBadge = document.getElementById('batchStatusBadge');
  const isWs = isWorksheetMode(examNameSelect ? examNameSelect.value : '');
  if (batchStatusBadge) {
    batchStatusBadge.textContent = isWs ? `Worksheet Ready (${currentSub})` : `Ready for AI (${currentSub})`;
    batchStatusBadge.style.background = isWs ? 'rgba(168, 85, 247, 0.18)' : 'rgba(56, 189, 248, 0.15)';
    batchStatusBadge.style.color = isWs ? '#c084fc' : '#38bdf8';
  }

  outputSection.classList.remove('hidden');
  outputSection.scrollIntoView({ behavior: 'smooth' });
}

// Master Prompt Queue Management (Window 2: Multi-Paper Sequential Generator)
let masterPromptQueue = [];
try {
  const savedQueue = localStorage.getItem('gnps_master_prompt_queue');
  if (savedQueue) {
    masterPromptQueue = JSON.parse(savedQueue);
  }
} catch (e) {
  masterPromptQueue = [];
}

let lastGeneratedPaper = null;

function saveMasterPromptQueue() {
  try {
    localStorage.setItem('gnps_master_prompt_queue', JSON.stringify(masterPromptQueue));
  } catch (e) {
    console.error("Failed to save master queue", e);
  }
}

export function generateMasterSequentialPrompt() {
  if (masterPromptQueue.length === 0) return "";
  const totalPapers = masterPromptQueue.length;
  
  const overviewList = masterPromptQueue.map((p, i) => {
    const marksLabel = typeof p.marks === 'string' && p.marks.includes('Questions') ? p.marks : `${p.marks} Marks`;
    return `${i + 1}. [${p.className}] ${p.subjectName} — ${p.examName || 'Annual Exam'} (${marksLabel}, ${p.duration || '3 Hours'})`;
  }).join('\n');
  
  let text = `================================================================================
🌟 CBSE MULTI-SUBJECT SEQUENTIAL EXAMINATION MASTER PROMPT (${totalPapers} QUESTION PAPERS BUNDLE) 🌟
================================================================================
ACADEMIC BUNDLE OVERVIEW:
${overviewList}
--------------------------------------------------------------------------------
CRITICAL EXECUTION PROTOCOL (INTERACTIVE ONE-BY-ONE CONFIRMATION LOOP):
You are acting as the Chief CBSE Examination Controller tasked with generating the complete, official examination papers for all ${totalPapers} subjects listed above.

STRICT SEQUENTIAL RULE TO PREVENT AI TOKEN TRUNCATION & MAINTAIN 100% ACADEMIC DEPTH:
1. NEVER attempt to generate multiple question papers in a single response. Generating multiple papers simultaneously causes severe output token truncation, missing questions, and superficial answers.
2. YOU MUST GENERATE EXACTLY ONE QUESTION PAPER PER RESPONSE CYCLE.
3. STEP 1: Begin immediately by generating ONLY Question Paper #1: [${masterPromptQueue[0].className} - ${masterPromptQueue[0].subjectName}] in complete, publication-grade academic detail according to its full blueprint specifications below (BOTH Set A and Set B, complete questions, figures/tables/data, source-based case studies, and full marking scheme).
4. AT THE END OF QUESTION PAPER #1, STOP COMPLETELY AND DO NOT PROCEED TO PAPER #2. Output this exact checkpoint verification message:
   "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✓ [QUESTION PAPER 1 OF ${totalPapers}: ${masterPromptQueue[0].subjectName.toUpperCase()} IS COMPLETE]
   Please review the generated question paper above. When you are ready, reply 'CONTINUE' or 'PROCEED' to begin Question Paper 2: ${totalPapers > 1 ? masterPromptQueue[1].subjectName : 'END OF BUNDLE'}.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
5. WAIT FOR EXPLICIT USER CONFIRMATION. Do NOT output any content for Question Paper #2 until the user sends confirmation.
6. Upon user confirmation ('CONTINUE' or 'PROCEED'), generate Question Paper #2, stop and ask for confirmation again, and repeat this strict one-by-one verification cycle until all ${totalPapers} question papers are complete.
================================================================================\n\n`;

  masterPromptQueue.forEach((p, idx) => {
    text += `################################################################################\n`;
    text += `📦 [QUESTION PAPER ${idx + 1} OF ${totalPapers} SPECIFICATION]: ${p.className} - ${(p.subjectName || '').toUpperCase()}\n`;
    text += `################################################################################\n\n`;
    const pText = p.promptText || p.prompt || "";
    text += pText.trim() + `\n\n`;
  });

  return text;
}

function renderMasterPromptWindow() {
  const masterSection = document.getElementById('master-prompt-section');
  const masterChips = document.getElementById('masterQueueChips');
  const masterTextarea = document.getElementById('masterPromptTextarea');
  const masterBadge = document.getElementById('masterBadge');
  const masterCharCount = document.getElementById('masterPromptCharCount');
  
  if (!masterSection || !masterChips || !masterTextarea) return;

  if (masterPromptQueue.length === 0) {
    masterSection.classList.add('hidden');
    masterTextarea.value = "";
    if (masterBadge) masterBadge.textContent = "0 Papers Queued";
    return;
  }

  masterSection.classList.remove('hidden');
  if (masterBadge) {
    masterBadge.textContent = `${masterPromptQueue.length} Paper${masterPromptQueue.length === 1 ? '' : 's'} Queued`;
  }

  // Render chips
  masterChips.innerHTML = "";
  masterPromptQueue.forEach((item, index) => {
    const chip = document.createElement('div');
    chip.style.cssText = "display: inline-flex; align-items: center; gap: 8px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.45); color: #f3e8ff; padding: 0.35rem 0.8rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500;";
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = `${index + 1}. [${item.className}] ${item.subjectName} (${item.marks}M)`;
    chip.appendChild(titleSpan);

    const removeBtn = document.createElement('button');
    removeBtn.type = "button";
    removeBtn.innerHTML = "&times;";
    removeBtn.style.cssText = "background: rgba(239, 68, 68, 0.25); border: none; color: #fca5a5; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; line-height: 1; transition: all 0.2s;";
    removeBtn.title = "Remove this paper from master queue";
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      masterPromptQueue.splice(index, 1);
      saveMasterPromptQueue();
      renderMasterPromptWindow();
    });
    chip.appendChild(removeBtn);
    masterChips.appendChild(chip);
  });

  const fullMasterText = generateMasterSequentialPrompt();
  masterTextarea.value = fullMasterText;

  if (masterCharCount) {
    masterCharCount.textContent = `${fullMasterText.length.toLocaleString()} characters | ~${Math.round(fullMasterText.length / 4)} tokens`;
  }
}

// Form Submission for standard prompt generation
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('generateBtn');
  btn._originalHtml = btn.innerHTML;
  
  const promptText = await buildPromptString(btn);
  if (!promptText) return;
  
  const currentClass = classSelect.value;
  const currentSub = getSubjectWithCode(subjectSelect.value, currentClass);
  const examName = examNameSelect ? examNameSelect.value : 'Annual Examination';
  const isWs = isWorksheetMode(examName);
  const marks = isWs ? marksInput.value : (currentBlueprintState ? currentBlueprintState.targetTotalMarks : 80);
  const duration = isWs ? 'Self-Paced' : (currentBlueprintState ? currentBlueprintState.duration : '3 Hours');

  lastGeneratedPaper = {
    id: Date.now(),
    className: currentClass,
    subjectName: currentSub,
    examName: examName,
    marks: marks,
    duration: duration,
    promptText: promptText
  };

  renderSinglePromptOutput(promptText, currentSub);
});

// Append to Master Queue Button Handler (Window 1 Action)
const addToMasterBtn = document.getElementById('addToMasterBtn');
if (addToMasterBtn) {
  addToMasterBtn.addEventListener('click', () => {
    if (!lastGeneratedPaper || !lastGeneratedPaper.promptText) {
      alert("Please generate a prompt first before adding to the Master Queue.");
      return;
    }

    // Check if duplicate, replace or append
    const existingIndex = masterPromptQueue.findIndex(p => p.className === lastGeneratedPaper.className && p.subjectName.toLowerCase() === lastGeneratedPaper.subjectName.toLowerCase());
    if (existingIndex >= 0) {
      masterPromptQueue[existingIndex] = { ...lastGeneratedPaper, id: masterPromptQueue[existingIndex].id };
    } else {
      masterPromptQueue.push({ ...lastGeneratedPaper });
    }

    saveMasterPromptQueue();
    renderMasterPromptWindow();

    const origHtml = addToMasterBtn.innerHTML;
    addToMasterBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    addToMasterBtn.style.color = '#ffffff';
    addToMasterBtn.innerHTML = `✓ Added Paper #${masterPromptQueue.length} to Master Queue!`;

    setTimeout(() => {
      addToMasterBtn.innerHTML = origHtml;
      addToMasterBtn.style.background = '';
      addToMasterBtn.style.color = '';
    }, 2200);

    const masterSection = document.getElementById('master-prompt-section');
    if (masterSection) {
      masterSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Append Next Subject Form Button Handler (Direct to Master Queue)
const appendSubjectBtn = document.getElementById('appendSubjectBtn');
if (appendSubjectBtn) {
  appendSubjectBtn.addEventListener('click', async () => {
    appendSubjectBtn._originalHtml = appendSubjectBtn.innerHTML;
    
    const promptText = await buildPromptString(appendSubjectBtn);
    if (!promptText) return;
    
    const currentClass = classSelect.value;
    const currentSub = getSubjectWithCode(subjectSelect.value, currentClass);
    const examName = examNameSelect ? examNameSelect.value : 'Annual Examination';
    const isWs = isWorksheetMode(examName);
    const marks = isWs ? marksInput.value : (currentBlueprintState ? currentBlueprintState.targetTotalMarks : 80);
    const duration = isWs ? 'Self-Paced' : (currentBlueprintState ? currentBlueprintState.duration : '3 Hours');

    const paperObj = {
      id: Date.now(),
      className: currentClass,
      subjectName: currentSub,
      examName: examName,
      marks: marks,
      duration: duration,
      promptText: promptText
    };

    lastGeneratedPaper = paperObj;
    renderSinglePromptOutput(promptText, currentSub);

    const existingIndex = masterPromptQueue.findIndex(p => p.className === currentClass && p.subjectName.toLowerCase() === currentSub.toLowerCase());
    if (existingIndex >= 0) {
      masterPromptQueue[existingIndex] = { ...paperObj, id: masterPromptQueue[existingIndex].id };
    } else {
      masterPromptQueue.push({ ...paperObj });
    }

    saveMasterPromptQueue();
    renderMasterPromptWindow();

    const masterSection = document.getElementById('master-prompt-section');
    if (masterSection) {
      masterSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Clear / Reset Window 1 Prompt
const clearPromptBtn = document.getElementById('clearPromptBtn');
if (clearPromptBtn) {
  clearPromptBtn.addEventListener('click', () => {
    lastGeneratedPaper = null;
    generatedPrompt.value = "";
    outputSection.classList.add('hidden');
  });
}

// Clear / Reset Window 2 Master Queue
const clearMasterQueueBtn = document.getElementById('clearMasterQueueBtn');
if (clearMasterQueueBtn) {
  clearMasterQueueBtn.addEventListener('click', () => {
    if (masterPromptQueue.length === 0) return;
    if (confirm(`Are you sure you want to clear all ${masterPromptQueue.length} question papers from the Master Prompt Queue?`)) {
      masterPromptQueue = [];
      saveMasterPromptQueue();
      renderMasterPromptWindow();
    }
  });
}

// Download Master Prompt Bundle as .txt
const downloadMasterBtn = document.getElementById('downloadMasterBtn');
if (downloadMasterBtn) {
  downloadMasterBtn.addEventListener('click', () => {
    const text = generateMasterSequentialPrompt();
    if (!text) {
      alert("No papers currently in the Master Prompt Queue.");
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CBSE_Master_Exam_Prompt_${masterPromptQueue.length}_Papers_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Copy Master Prompt to Clipboard
const copyMasterBtn = document.getElementById('copyMasterBtn');
if (copyMasterBtn) {
  copyMasterBtn.addEventListener('click', () => {
    const masterTextarea = document.getElementById('masterPromptTextarea');
    if (!masterTextarea || !masterTextarea.value) {
      alert("Master prompt is empty.");
      return;
    }
    masterTextarea.select();
    document.execCommand('copy');
    
    const originalHtml = copyMasterBtn.innerHTML;
    copyMasterBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    copyMasterBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>✓ Master Prompt Copied!</span>`;
    
    setTimeout(() => {
      copyMasterBtn.innerHTML = originalHtml;
      copyMasterBtn.style.background = '';
    }, 2500);
  });
}

// Copy Window 1 Prompt to Clipboard
copyBtn.addEventListener('click', () => {
  generatedPrompt.select();
  document.execCommand('copy');
  
  const originalHtml = copyBtn.innerHTML;
  copyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>✓ Copied!</span>`;
  
  setTimeout(() => {
    copyBtn.innerHTML = originalHtml;
    copyBtn.style.background = '';
  }, 2500);
});

// ---------------------------------------------------------------------------
// AI Answer -> Ready-to-Print PDF
// Takes whatever Gemini/ChatGPT returned (full reply with ```html fences, or a
// raw HTML paste) and turns each question paper it contains into its own PDF,
// so Set A and Set B download as two separate files.
// ---------------------------------------------------------------------------

const SET_LABEL_RE = /\bSET\s*[-–—:]?\s*([A-D])\b/;

// Adjacent elements concatenate when read via textContent ("...180 Mins" +
// "SET A" reads as "MINSSET A"), which hides the set label from the pattern
// above. Replace the tags themselves with spaces so words stay separated.
function flattenMarkupText(markup) {
  return String(markup || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function extractHtmlDocuments(raw) {
  const text = (raw || '').trim();
  if (!text) return [];

  const fenced = [];
  const fenceRe = /```(?:html|HTML)?[^\S\n]*\n([\s\S]*?)```/g;
  let match;
  while ((match = fenceRe.exec(text)) !== null) {
    const block = match[1].trim();
    if (/<!doctype\s+html|<html[\s>]|<body[\s>]|<div[\s>]|<table[\s>]/i.test(block)) fenced.push(block);
  }
  if (fenced.length) return fenced;

  const splitIfRepeated = (pattern) => {
    const count = (text.match(pattern) || []).length;
    if (count < 2) return null;
    return text.split(new RegExp(`(?=${pattern.source})`, 'i')).map(s => s.trim()).filter(Boolean);
  };
  return splitIfRepeated(/<!doctype\s+html/gi) || splitIfRepeated(/<html[\s>]/gi) || [text];
}

// Fallback for older responses that merge both sets into one document separated
// by a page break. Returns null when the split can't be made confidently.
function splitCombinedSets(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  if (!doc.body) return null;

  const children = Array.from(doc.body.children);
  if (children.length < 2) return null;

  const textOf = (nodes) => flattenMarkupText(nodes.map(n => n.outerHTML || '').join(' '));
  let splitIdx = -1;
  for (let i = 1; i < children.length; i++) {
    const el = children[i];
    const styled = [el, ...el.querySelectorAll('[style]')];
    const hasBreak = styled.some(n => /page-break-before\s*:\s*always/i.test(n.getAttribute('style') || ''));
    if (!hasBreak) continue;
    const before = textOf(children.slice(0, i));
    const after = textOf(children.slice(i));
    if (/\bSET\s*[-–—:]?\s*A\b/.test(before) && /\bSET\s*[-–—:]?\s*B\b/.test(after)) {
      splitIdx = i;
      break;
    }
  }
  if (splitIdx <= 0) return null;

  const headHtml = doc.head ? doc.head.innerHTML : '';
  const wrap = (nodes) =>
    `<!DOCTYPE html><html><head>${headHtml}</head><body>${nodes.map(n => n.outerHTML).join('\n')}</body></html>`;
  return [wrap(children.slice(0, splitIdx)), wrap(children.slice(splitIdx))];
}

function detectPaperLabel(htmlString, index, total) {
  const match = flattenMarkupText(htmlString).match(SET_LABEL_RE);
  if (match) return `Set ${match[1]}`;
  return total > 1 ? `Paper ${index + 1}` : 'Question Paper';
}

// Only the converter knows how the paper paginates, so the running footer is
// stamped here rather than asked of the AI, which cannot know its own page count.
function buildFooterLeftText(label) {
  const examEl = document.getElementById('examName');
  const parts = ['GNPS'];
  if (examEl && examEl.value) parts.push(examEl.value);
  if (subjectSelect && subjectSelect.value) parts.push(subjectSelect.value);
  if (label && /^set\b/i.test(label)) parts.push(label);
  return parts.join(' / ').toUpperCase();
}

function stampRunningFooter(pdf, footerLeft) {
  const total = pdf.internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  for (let page = 1; page <= total; page++) {
    pdf.setPage(page);
    pdf.setFont('times', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(90);
    const baseline = pageHeight - 5;
    if (footerLeft) pdf.text(footerLeft, 12, baseline);
    pdf.text(`Page ${page} of ${total}`, pageWidth - 12, baseline, { align: 'right' });
  }
}

function buildAiPdfFileName(label) {
  const examEl = document.getElementById('examName');
  const parts = ['GNPS', classSelect && classSelect.value, subjectSelect && subjectSelect.value, examEl && examEl.value, label]
    .filter(Boolean)
    .map(s => String(s).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .filter(Boolean);
  return `${parts.join('_').replace(/_+/g, '_')}.pdf`;
}

// The pasted markup comes from an external AI chat, so it is untrusted: strip
// scripts, inline event handlers and javascript: URLs before it ever touches
// the live DOM (this page holds the signed-in user's session).
function buildPrintableNode(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  doc.querySelectorAll('script, .no-print, [data-no-print]').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      else if (['href', 'src', 'xlink:href'].includes(name) && /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
    });
  });

  // A leading page break (the one that separated Set A from Set B, or a stray
  // one from the AI) would render an empty first page. Clear it down the
  // opening first-child chain.
  let lead = doc.body ? doc.body.firstElementChild : null;
  while (lead) {
    const style = lead.getAttribute('style');
    if (style && /page-break-before\s*:\s*always/i.test(style)) {
      lead.setAttribute('style', style.replace(/page-break-before\s*:\s*always\s*;?/gi, ''));
    }
    lead = lead.firstElementChild;
  }

  let css = Array.from(doc.querySelectorAll('style')).map(s => s.textContent || '').join('\n');
  // Sections must flow on continuously; a forced break before each one leaves
  // half-empty pages between Biology / Chemistry / Physics.
  css = css.replace(/page-break-before\s*:\s*always\s*;?/gi, '');
  doc.querySelectorAll('[style*="page-break-before"]').forEach(el => {
    if (/^\s*SECTION\b/i.test(el.textContent || '')) {
      el.setAttribute('style', (el.getAttribute('style') || '').replace(/page-break-before\s*:\s*always\s*;?/gi, ''));
    }
  });

  const content = document.createElement('div');
  content.style.cssText = `width: ${PDF_STAGE_WIDTH}px; padding: ${PDF_PAGE_PADDING}; margin: 0; background: #ffffff; color: #000000; box-sizing: border-box;`;
  content.innerHTML = doc.body ? doc.body.innerHTML : htmlString;
  return { content, css };
}

// An <svg> without a viewBox clips anything drawn past its declared width or
// height, which is how apparatus and circuit diagrams end up as a stray sliver.
// One with a viewBox but no width/height instead stretches to the full column.
// Give each a viewBox covering its real content and its intrinsic pixel size.
function normalizeRenderedSvgs(root) {
  root.querySelectorAll('svg').forEach(svg => {
    if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    if (!svg.getAttribute('viewBox')) {
      try {
        const box = svg.getBBox();
        if (box.width > 0 && box.height > 0) {
          const pad = 4;
          svg.setAttribute('viewBox', `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`);
        }
      } catch (err) {
        /* getBBox throws for an empty or detached SVG; nothing to normalise */
      }
    }

    const viewBox = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).filter(Boolean).map(Number);
    const isPlainNumber = (value) => value && /^\d+(\.\d+)?(px)?$/i.test(value);
    if (viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
      if (!isPlainNumber(svg.getAttribute('width'))) svg.setAttribute('width', Math.round(viewBox[2]));
      if (!isPlainNumber(svg.getAttribute('height'))) svg.setAttribute('height', Math.round(viewBox[3]));
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    svg.style.overflow = 'visible';
    svg.style.maxWidth = '100%';
  });
}

// html2canvas rasterises an inline <svg> at its serialised intrinsic size and
// falls back to 300x150, which lops the right-hand side off wider apparatus and
// circuit diagrams. Convert each one to a PNG at its real rendered size first,
// so what reaches the PDF is a plain image that cannot be mismeasured.
async function rasterizeSvgs(root) {
  for (const svg of Array.from(root.querySelectorAll('svg'))) {
    try {
      const rect = svg.getBoundingClientRect();
      const width = Math.round(rect.width) || Number(svg.getAttribute('width')) || 300;
      const height = Math.round(rect.height) || Number(svg.getAttribute('height')) || 150;
      if (width < 1 || height < 1) continue;

      const clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', width);
      clone.setAttribute('height', height);
      const source = 'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(new XMLSerializer().serializeToString(clone));

      const loaded = await new Promise(resolve => {
        const probe = new Image();
        probe.onload = () => resolve(probe);
        probe.onerror = () => resolve(null);
        probe.src = source;
      });
      if (!loaded) continue;

      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(loaded, 0, 0, canvas.width, canvas.height);

      const flat = document.createElement('img');
      flat.src = canvas.toDataURL('image/png');
      flat.style.cssText = `width: ${width}px; height: ${height}px; display: inline-block; max-width: 100%;`;
      svg.replaceWith(flat);
    } catch (err) {
      /* keep the original SVG if it cannot be rasterised */
    }
  }
}

// The pasted stylesheet targets `body`, `@page` and bare tag names, so injecting
// it as-is restyles the app itself — which also skews the measurements
// html2canvas takes and clips the right edge off the capture. Re-emit every
// rule confined to the render stage, using the browser's own CSS parser so
// @media blocks survive intact.
function scopeCssToStage(cssText, scopeSelector) {
  const carrier = document.createElement('style');
  carrier.media = 'not all';
  carrier.textContent = cssText;
  document.head.appendChild(carrier);

  const scopeSelectorList = (selectorText) => selectorText
    .split(',')
    .map(part => {
      const trimmed = part.trim();
      if (!trimmed) return '';
      if (/^(html|body|:root)$/i.test(trimmed)) return scopeSelector;
      return `${scopeSelector} ${trimmed.replace(/^(html|body)\s+/i, '')}`;
    })
    .filter(Boolean)
    .join(', ');

  const collect = (rules, out) => {
    Array.from(rules || []).forEach(rule => {
      if (rule.type === CSSRule.STYLE_RULE) {
        out.push(`${scopeSelectorList(rule.selectorText)} { ${rule.style.cssText} }`);
      } else if (rule.type === CSSRule.MEDIA_RULE) {
        const inner = [];
        collect(rule.cssRules, inner);
        // We are producing print output, so print rules apply unconditionally.
        if (/print/i.test(rule.conditionText || rule.media.mediaText || '')) out.push(inner.join('\n'));
        else out.push(`@media ${rule.media.mediaText} { ${inner.join('\n')} }`);
      } else if (rule.type === CSSRule.PAGE_RULE) {
        /* @page margins are the PDF generator's job, not the document's */
      } else if (rule.cssText) {
        out.push(rule.cssText);
      }
    });
  };

  const chunks = [];
  try {
    collect(carrier.sheet && carrier.sheet.cssRules, chunks);
  } catch (err) {
    carrier.remove();
    return '';
  }
  carrier.remove();
  return chunks.join('\n');
}

const PDF_STAGE_WIDTH = 794; // A4 portrait at 96dpi
const PDF_PAGE_MARGIN_MM = 12; // top/bottom margin, applied by html2pdf on every page
const PDF_PAGE_HEIGHT_PX = ((297 - 2 * PDF_PAGE_MARGIN_MM) / 25.4) * 96; // usable A4 height at 96dpi
const PDF_PAGE_PADDING = '0 48px'; // side margins (~12mm); vertical margin comes from html2pdf
const PDF_STAGE_ID = 'ai-pdf-paper';

// Push any block that would straddle a page boundary onto the next page, so a
// line of text is never sliced through the middle.
//
// html2pdf's own 'avoid-all' cannot be relied on here: it measures against the
// viewport rather than the paper (so its spacers land a few pixels short and
// cut the line anyway) and it gives up entirely on any block taller than a
// page, which is exactly what a case study with a figure is. Measuring against
// the paper and recursing into oversized blocks fixes both.
function makePagePad(heightPx) {
  const pad = document.createElement('div');
  pad.dataset.pdfPad = '1';
  pad.style.cssText = `display: block; margin: 0; padding: 0; border: 0; float: none; height: ${Math.ceil(heightPx)}px;`;
  return pad;
}

// A block's opening line is usually loose text with no element of its own (a
// case study's heading, say), so it cannot be pushed like a child can. Measure
// it with a Range and, if it straddles, pad from inside the block — wrapping it
// in a div instead would knock a floated mark allocation onto its own line.
function padLeadingInlineContent(el, paperTop, pageHeightPx) {
  const leading = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const display = getComputedStyle(node).display;
      if (display !== 'inline' && display !== 'inline-block') break;
    }
    leading.push(node);
  }
  if (!leading.length || !leading.some(node => (node.textContent || '').trim())) return;

  const range = document.createRange();
  range.setStartBefore(leading[0]);
  range.setEndAfter(leading[leading.length - 1]);
  const rect = range.getBoundingClientRect();
  if (!rect || rect.height <= 0) return;

  const top = rect.top - paperTop;
  const bottom = rect.bottom - paperTop;
  if (Math.floor(top / pageHeightPx) === Math.floor((bottom - 1) / pageHeightPx)) return;

  el.insertBefore(makePagePad(pageHeightPx - (top % pageHeightPx)), el.firstChild);
}

function insertSafePageBreaks(root, pageHeightPx) {
  const paperTop = root.getBoundingClientRect().top;

  const walk = (parent, depth) => {
    if (depth > 4) return;
    for (const el of Array.from(parent.children)) {
      if (el.tagName === 'STYLE' || el.dataset.pdfPad === '1') continue;

      const rect = el.getBoundingClientRect();
      if (rect.height <= 0) continue;

      const top = rect.top - paperTop;
      const bottom = rect.bottom - paperTop;
      if (Math.floor(top / pageHeightPx) === Math.floor((bottom - 1) / pageHeightPx)) continue;

      if (rect.height > pageHeightPx && el.children.length) {
        // Too tall to move as one piece, so break between its parts instead.
        padLeadingInlineContent(el, paperTop, pageHeightPx);
        walk(el, depth + 1);
        continue;
      }

      el.parentNode.insertBefore(makePagePad(pageHeightPx - (top % pageHeightPx)), el);
    }
  };

  walk(root, 0);
}

async function exportPastedPaperToPdf(htmlString, filename, footerLeft) {
  const { content, css } = buildPrintableNode(htmlString);

  const stage = document.createElement('div');
  stage.id = 'ai-pdf-render-stage';
  stage.style.cssText = `position: fixed; left: 0; top: 0; width: ${PDF_STAGE_WIDTH}px; margin: 0; padding: 0; background: #ffffff; z-index: 999999; overflow: visible;`;

  // The scope id and the stylesheet both live on the captured element itself:
  // html2canvas clones only that subtree, so styles hung off an ancestor
  // wrapper would not match anything during rasterisation.
  content.id = PDF_STAGE_ID;
  if (css) {
    const styleTag = document.createElement('style');
    styleTag.textContent = scopeCssToStage(css, `#${PDF_STAGE_ID}`);
    content.insertBefore(styleTag, content.firstChild);
  }
  stage.appendChild(content);
  document.body.appendChild(stage);

  await new Promise(resolve => setTimeout(resolve, 250));

  normalizeRenderedSvgs(content);
  await rasterizeSvgs(content);

  // Trailing empty nodes and a final bottom margin can spill a few pixels past
  // the last page, producing a blank extra sheet that wastes paper when the
  // paper is printed double-sided.
  let tail = content.lastElementChild;
  while (tail && !(tail.textContent || '').trim() && !tail.querySelector('img, svg, canvas, table, hr')) {
    const previous = tail.previousElementSibling;
    tail.remove();
    tail = previous;
  }
  if (tail) tail.style.marginBottom = '0';

  insertSafePageBreaks(content, PDF_PAGE_HEIGHT_PX);

  // Margins are split deliberately. Vertical margins go to html2pdf so every
  // page gets them (padding on this wrapper would only indent the first and
  // last page, letting the rest run into the paper edge). Horizontal margin
  // stays 0 and comes from the wrapper's side padding instead, because
  // html2pdf resizes the captured element to the page's inner width — any
  // left/right margin here would squeeze the layout and clip its right edge.
  const opt = {
    margin: [PDF_PAGE_MARGIN_MM, 0, PDF_PAGE_MARGIN_MM, 0],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(content).toPdf()
      .get('pdf').then(pdf => stampRunningFooter(pdf, footerLeft))
      .save();
  } finally {
    stage.remove();
  }
}

async function handleGeneratePdfFromAi() {
  const input = document.getElementById('aiResponseInput');
  const statusEl = document.getElementById('aiPdfStatus');
  const badgeEl = document.getElementById('aiPdfBadge');
  const btn = document.getElementById('generatePdfFromAiBtn');
  const btnText = document.getElementById('generatePdfFromAiBtnText');
  if (!input || !btn) return;

  const setStatus = (msg, color = '#94a3b8') => {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.style.color = color;
    }
  };

  const raw = input.value.trim();
  if (!raw) {
    setStatus('Paste the AI response first, then click Generate PDF(s).', '#f87171');
    return;
  }
  if (typeof html2pdf === 'undefined') {
    setStatus('PDF engine failed to load. Check your internet connection and refresh the page.', '#f87171');
    return;
  }

  if (!/<[a-z!][\s\S]*>/i.test(raw)) {
    setStatus('That looks like plain text, not a question paper. Copy the AI\'s HTML output (the ```html code block) and paste it here.', '#f87171');
    return;
  }

  let papers = extractHtmlDocuments(raw);
  if (papers.length === 1) {
    const split = splitCombinedSets(papers[0]);
    if (split) papers = split;
  }
  if (!papers.length) {
    setStatus('No HTML question paper found in what you pasted. Copy the AI\'s full answer including the ```html code block.', '#f87171');
    return;
  }

  const originalText = btnText ? btnText.textContent : '';
  btn.disabled = true;
  const labels = papers.map((html, i) => detectPaperLabel(html, i, papers.length));

  try {
    for (let i = 0; i < papers.length; i++) {
      if (btnText) btnText.textContent = `Rendering ${labels[i]} (${i + 1}/${papers.length})...`;
      setStatus(`Rendering ${labels[i]} — ${i + 1} of ${papers.length}. The download starts automatically.`, '#4ade80');
      await exportPastedPaperToPdf(papers[i], buildAiPdfFileName(labels[i]), buildFooterLeftText(labels[i]));
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    setStatus(`Done — ${papers.length} PDF${papers.length > 1 ? 's' : ''} downloaded (${labels.join(', ')}).`, '#4ade80');
    if (badgeEl) badgeEl.textContent = `${papers.length} PDF${papers.length > 1 ? 's' : ''} Generated`;
  } catch (err) {
    console.error('AI response -> PDF failed:', err);
    setStatus(`Could not build the PDF: ${err.message || err}. Try pasting just the HTML code block.`, '#f87171');
  } finally {
    btn.disabled = false;
    if (btnText) btnText.textContent = originalText || 'Generate PDF(s)';
  }
}

(function setupAiToPdfSection() {
  const input = document.getElementById('aiResponseInput');
  const btn = document.getElementById('generatePdfFromAiBtn');
  const clearBtn = document.getElementById('clearAiResponseBtn');
  const countEl = document.getElementById('aiResponseCharCount');
  const badgeEl = document.getElementById('aiPdfBadge');
  if (!input || !btn) return;

  btn.addEventListener('click', handleGeneratePdfFromAi);

  input.addEventListener('input', () => {
    const len = input.value.length;
    if (countEl) countEl.textContent = len ? `${len.toLocaleString()} characters` : '';
    if (badgeEl) badgeEl.textContent = len ? 'Ready to Convert' : 'Awaiting Paste';
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      if (countEl) countEl.textContent = '';
      if (badgeEl) badgeEl.textContent = 'Awaiting Paste';
      const statusEl = document.getElementById('aiPdfStatus');
      if (statusEl) {
        statusEl.textContent = 'Tip: Set A and Set B are detected automatically and downloaded as two separate PDF files.';
        statusEl.style.color = '#94a3b8';
      }
    });
  }
})();

// Dynamic Academic Session Calculation (April to March cycle)
function getCurrentAcademicSession() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 3 = April
  if (month >= 3) {
    return `${year}–${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}–${year.toString().slice(-2)}`;
  }
}

function setupWorksheetScalingEventListeners() {
  const qsInput = document.getElementById('qsPerSubtopicInput');
  const minusBtn = document.getElementById('btnQsMinus');
  const plusBtn = document.getElementById('btnQsPlus');
  
  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      const current = getQsPerSubtopic();
      window.setQsPerSubtopic(Math.max(1, current - 1));
    });
  }
  
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      const current = getQsPerSubtopic();
      window.setQsPerSubtopic(Math.min(100, current + 1));
    });
  }
  
  if (qsInput) {
    qsInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1) {
        window.setQsPerSubtopic(Math.min(100, val));
      }
    });
    qsInput.addEventListener('change', (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 100) val = 100;
      window.setQsPerSubtopic(val);
    });
  }
  
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.qs-preset-btn');
    if (btn && btn.hasAttribute('data-qs')) {
      const qs = parseInt(btn.getAttribute('data-qs'), 10);
      if (!isNaN(qs)) {
        window.setQsPerSubtopic(qs);
      }
    }
  });
}

// ==========================================================================
// STUDENT EXAMINATION SYLLABUS SHEET GENERATOR (ALL SUBJECTS)
// ==========================================================================

const openSyllabusSheetBtn = document.getElementById('openSyllabusSheetBtn');
const openSyllabusSheetFromCardBtn = document.getElementById('openSyllabusSheetFromCardBtn');
const closeSyllabusSheetModalBtn = document.getElementById('closeSyllabusSheetModalBtn');
const syllabusSheetModal = document.getElementById('syllabusSheetModal');
const sheetSchoolName = document.getElementById('sheetSchoolName');
const sheetClassSelect = document.getElementById('sheetClassSelect');
const sheetClassBadge = document.getElementById('sheetClassBadge');
const sheetExamSelect = document.getElementById('sheetExamSelect');
const sheetCustomExamInput = document.getElementById('sheetCustomExamInput');
const sheetMaxMarks = document.getElementById('sheetMaxMarks');
const sheetDuration = document.getElementById('sheetDuration');
const sheetSchoolTiming = document.getElementById('sheetSchoolTiming');
const sheetIncludeInstructions = document.getElementById('sheetIncludeInstructions');
const sheetIncludeSubtopics = document.getElementById('sheetIncludeSubtopics');
const sheetIncludePrincipalSig = document.getElementById('sheetIncludePrincipalSig');
const sheetHideUncheckedToggle = document.getElementById('sheetHideUncheckedToggle');
const printSheetBtn = document.getElementById('printSheetBtn');
const exportPdfSheetBtn = document.getElementById('exportPdfSheetBtn');
const exportExcelSheetBtn = document.getElementById('exportExcelSheetBtn');
const syllabusSheetPaper = document.getElementById('syllabusSheetPaper');
const sheetSEADateFrom = document.getElementById('sheetSEADateFrom');
const sheetSEADateTo = document.getElementById('sheetSEADateTo');
const sheetCoSchDateFrom = document.getElementById('sheetCoSchDateFrom');
const sheetCoSchDateTo = document.getElementById('sheetCoSchDateTo');
const sheetWindowsPanel = document.getElementById('sheetWindowsPanel');
const sheetMiddleSettingsPanel = document.getElementById('sheetMiddleSettingsPanel');
const sheetGeneralControlsPanel = document.getElementById('sheetGeneralControlsPanel');
const sheetPart1Time = document.getElementById('sheetPart1Time');
const sheetPart1Marks = document.getElementById('sheetPart1Marks');
const sheetPart1TimingStart = document.getElementById('sheetPart1TimingStart');
const sheetPart1TimingEnd = document.getElementById('sheetPart1TimingEnd');
const sheetPart2Marks = document.getElementById('sheetPart2Marks');
const sheetPart2TimingStart = document.getElementById('sheetPart2TimingStart');
const sheetPart2TimingEnd = document.getElementById('sheetPart2TimingEnd');
const sheetPart3TimingStart = document.getElementById('sheetPart3TimingStart');
const sheetPart3TimingEnd = document.getElementById('sheetPart3TimingEnd');

let coSchExamDateFrom = '2026-02-09';
let coSchExamDateTo = '2026-02-13';
let seaExamDateFrom = '2026-02-02';
let seaExamDateTo = '2026-02-06';

// Run Init immediately
initClassDropdown();
loadCustomSubjects();
renderMasterPromptWindow();
setupWorksheetScalingEventListeners();

const sessionBadge = document.getElementById('sessionBadge');
if (sessionBadge) {
  sessionBadge.textContent = `Session ${getCurrentAcademicSession()}`;
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateRange(from, to) {
  const f = formatShortDate(from);
  const t = formatShortDate(to);
  if (!f && !t) return 'As Per Date Sheet';
  if (f && !t) return f;
  if (!f && t) return t;
  return `${f} – ${t}`;
}

if (typeof window !== 'undefined') {
  window.setSEAPreset = function(from, to) {
    seaExamDateFrom = from;
    seaExamDateTo = to;
    if (sheetSEADateFrom) sheetSEADateFrom.value = from;
    if (sheetSEADateTo) sheetSEADateTo.value = to;
    renderSyllabusSheetPaper();
  };

  window.setCoSchPreset = function(from, to) {
    coSchExamDateFrom = from;
    coSchExamDateTo = to;
    if (sheetCoSchDateFrom) sheetCoSchDateFrom.value = from;
    if (sheetCoSchDateTo) sheetCoSchDateTo.value = to;
    renderSyllabusSheetPaper();
  };
}

export const cbseSEAData = {
  "Class 6": [
    {
      subject: "English (R1)",
      activities: [
        "ASL 1: Extempore / 1-Minute Speech on themes like 'My Favourite Storybook Character' or 'Conserving Water' (Fluency, Vocabulary & Pronunciation).",
        "ASL 2: Audio Listening Comprehension: Listening to a recorded story and completing an objective response worksheet.",
        "ASL 3: Character Dramatization / Dialogue Delivery from Unit 1 or Unit 2 stories with appropriate expression and modulation."
      ]
    },
    {
      subject: "Hindi (R2)",
      activities: [
        "गतिविधि 1: आशुभाषण / 'प्रकृति का संरक्षण' अथवा 'मेरा प्रिय त्योहार' विषय पर 2 मिनट का मौखिक वक्तव्य (शुद्ध उच्चारण एवं प्रवाह)।",
        "गतिविधि 2: श्रवण कौशल - शिक्षक द्वारा पढ़े गए प्रेरक प्रसंग को ध्यानपूर्वक सुनकर बहुविकल्पीय प्रश्नों के सही उत्तर चुनना।",
        "गतिविधि 3: कविता पाठ - 'वह चिड़िया जो' अथवा 'चाँद से थोड़ी सी गप्पें' का उचित लय, ताल एवं भाव-भंगिमा सहित सस्वर गायन।"
      ]
    },
    {
      subject: "Sanskrit (R3)",
      activities: [
        "गतिविधि 1: सस्वर श्लोकोच्चारणम् - नीतिश्लोकाः / सुभाषितानि (शुद्ध उच्चारण, स्पष्ट पदच्छेद एवं लय सहित)।",
        "गतिविधि 2: सरल संस्कृत वार्तालापः - 'मम परिचयः' (नाम, कक्षा, विद्यालयः, प्रिय-विषयः) सरल संस्कृत वाक्यों में बोलना।",
        "गतिविधि 3: चित्रवर्णनम् - विद्यालय अथवा क्रीडाक्षेत्र के चित्र को देखकर 4-5 संस्कृत वाक्यों का निर्माण एवं वाचन।"
      ]
    },
    {
      subject: "Mathematics",
      activities: [
        "Math Lab 1: Verification of Angle Types (Acute, Right, Obtuse, Straight) and Angle Sum in geometric shapes using paper folding.",
        "Math Lab 2: Hands-on exploration of Factors and Prime Numbers using rectangular grid paper arrays (Eratosthenes Sieve model).",
        "Math Lab 3: Preparation of a Double Bar Chart / Pictograph representing daily temperature or sports preferences with analysis."
      ]
    },
    {
      subject: "Science",
      activities: [
        "Science Lab 1: Chemical testing for Starch (Dilute Iodine Test) and Fats (Translucent spot test) on common food samples.",
        "Science Lab 2: Assembly of an electric circuit using wires, switch, battery, and bulb to classify objects as Conductors or Insulators.",
        "Science Lab 3: Experimental demonstration of Sedimentation, Decantation, and Filtration using funnel and filter paper."
      ]
    },
    {
      subject: "Social Science",
      activities: [
        "SST Activity 1: Physical Map of India: Marking and labeling major Mountain Ranges (Himalayas, Western Ghats), Rivers & Oceans.",
        "SST Activity 2: Timeline Chart Construction: Visual chronology of major prehistoric eras (Paleolithic, Mesolithic, Neolithic).",
        "SST Activity 3: Local Self-Government Project: Portfolio or model explaining the structure and functions of a Gram Panchayat."
      ]
    }
  ],
  "Class 7": [
    {
      subject: "English (R1)",
      activities: [
        "ASL 1: Declamation / Debate on topics: 'Social Media: Boon or Bane' or 'Importance of Mental Well-being' (2 Minutes).",
        "ASL 2: Audio Comprehension Task: Evaluating tone, central idea, and specific data points from an audio passage.",
        "ASL 3: Role Play & Situational Dialogue: Enacting a mock interview or customer service interaction with formal diction."
      ]
    },
    {
      subject: "Hindi (R2)",
      activities: [
        "गतिविधि 1: वाद-विवाद / 'पर्यावरण संरक्षण में युवाओं की भूमिका' अथवा 'इंटरनेट का सदुपयोग' पर पक्ष/विपक्ष में विचार प्रस्तुति।",
        "गतिविधि 2: श्रवण कौशल - ऐतिहासिक संस्मरण या वैज्ञानिक वार्ता सुनकर मुख्य बिंदुओं पर आधारित कार्यपत्रिका पूर्ण करना।",
        "गतिविधि 3: कविता पाठ - 'हम पंछी उन्मुक्त गगन के' अथवा 'कठपुतली' का भावपूर्ण सस्वर वाचन एवं अंतर्निहित संदेश का स्पष्टीकरण।"
      ]
    },
    {
      subject: "Sanskrit (R3)",
      activities: [
        "गतिविधि 1: सस्वर श्लोक-गायनम् - सुभाषितानि / नीतिश्लोकाः (सस्वर उच्चारण, भावार्थ एवं नीतिपरक संदेश सहित)।",
        "गतिविधि 2: संस्कृत-संवादः - दैनन्दिन जीवन पर आधारित दो छात्रों के बीच सरल संस्कृत वार्तालाप (क्रीडा, पठन, मित्र-मिलन)।",
        "गतिविधि 3: सूक्ति-लेखनम् एवं व्याख्या - 3 प्रमुख संस्कृत सूक्तियों का सुंदर आलेखन एवं हिंदी में अर्थ निरूपण।"
      ]
    },
    {
      subject: "Mathematics",
      activities: [
        "Math Lab 1: Experimental verification of the Exterior Angle Property and Angle Sum Property of a Triangle by paper cutting & pasting.",
        "Math Lab 2: Geometric construction and verification of Pythagoras Theorem using 3-4-5 unit square grids.",
        "Math Lab 3: Hands-on estimation and experimental verification of Circle Circumference-to-Diameter ratio (Approximation of Pi π)."
      ]
    },
    {
      subject: "Science",
      activities: [
        "Science Lab 1: Preparation of Natural Indicators (Turmeric paste & China Rose extract) and testing Acidic/Basic domestic solutions.",
        "Science Lab 2: Laboratory demonstration of Neutralisation reaction (Dilute Hydrochloric Acid + Sodium Hydroxide with Phenolphthalein).",
        "Science Lab 3: Demonstration of Transpiration in plants using a potted plant and polythene bell jar & stomata observation under microscope."
      ]
    },
    {
      subject: "Social Science",
      activities: [
        "SST Activity 1: Historical Map of India: Locating major capitals of the Delhi Sultanate and Mughal Empire (Delhi, Agra, Daulatabad, Lahore).",
        "SST Activity 2: Disaster Management Project: Preparedness guide and infographic poster on Cyclones, Earthquakes, or Floods.",
        "SST Activity 3: Case Study Portfolio on Gender Equality and Wage Parity in organized vs unorganized sectors."
      ]
    }
  ],
  "Class 8": [
    {
      subject: "English (R1)",
      activities: [
        "ASL 1: Extempore / Formal Speech: Critical analysis of 'AI and the Future of Learning' or 'Combatting Climate Despair' (3 Minutes).",
        "ASL 2: Advanced Audio Listening Task: Inference extraction, speaker bias detection, and analytical response to an audio documentary.",
        "ASL 3: Dramatic Monologue / Literary Review: Performance and critical appreciation of poetry or prose from the Poorvi textbook."
      ]
    },
    {
      subject: "Hindi (R2)",
      activities: [
        "गतिविधि 1: आशुभाषण / 'सोशल मीडिया और युवा पीढ़ी' अथवा 'स्वदेशी एवं आत्मनिर्भर भारत' पर ओजस्वी मौखिक वक्तव्य (तर्कसंगत प्रस्तुति)।",
        "गतिविधि 2: श्रवण कौशल - समसामयिक परिचर्चा सुनकर वक्ता के मुख्य तर्कों का विश्लेषण एवं मूल्यांकन आधारित प्रश्नावली हल करना।",
        "गतिविधि 3: काव्य पाठ एवं समीक्षा - 'ध्वनि' अथवा 'दीवानों की हस्ती' का भावपूर्ण वाचन, रस-अलंकार एवं केंद्रीय भाव पर मौखिक व्याख्या।"
      ]
    },
    {
      subject: "Sanskrit (R3)",
      activities: [
        "गतिविधि 1: सस्वर गीता-श्लोकोच्चारणम् - श्रीमद्भगवद्गीता (कर्मयोग / स्थितप्रज्ञ लक्षण) श्लोकों का शुद्ध एवं लयबद्ध वाचन।",
        "गतिविधि 2: संस्कृत लघुनाटिका / संवाद प्रस्तुति - 'डिजीभारतम्' अथवा 'पंचतंत्र कथा' पर आधारित संस्कृत संवाद अभिनय।",
        "गतिविधि 3: व्याकरण-आधारित गतिविधि - क्त्वा, ल्यप्, तुमुन् प्रत्ययों का प्रयोग करते हुए 5 मौलिक संस्कृत वाक्यों का निर्माण एवं वाचन।"
      ]
    },
    {
      subject: "Mathematics",
      activities: [
        "Math Lab 1: Verification of Algebraic Identities (e.g., (a + b)² = a² + 2ab + b² and a² - b² = (a - b)(a + b)) using colored unit paper tiles.",
        "Math Lab 2: Construction of 3D Polyhedra Nets (Cube, Cuboid, Cylinder, Cone) and physical derivation of Total Surface Area.",
        "Math Lab 3: Coordinate geometry / Real-world Line Graphs: Tracking temperature vs time and interpreting gradients and intersections."
      ]
    },
    {
      subject: "Science",
      activities: [
        "Science Lab 1: Demonstration of Chemical Effects of Electric Current: Electroplating copper onto an iron key using Copper Sulphate solution.",
        "Science Lab 2: Preparation of temporary stained mounts of Onion Peel cells and Human Cheek cells for microscopic comparison.",
        "Science Lab 3: Verification of Laws of Reflection using a plane mirror, ray box, and protractor on drawing board."
      ]
    },
    {
      subject: "Social Science",
      activities: [
        "SST Activity 1: Historical & Economic Map: Marking key centers of the 1857 Revolt and major Iron & Steel industries in India.",
        "SST Activity 2: Constitutional Rights & Judicial Structure: Mock Parliament / Mock Court case study portfolio on Fundamental Rights.",
        "SST Activity 3: Sustainable Agriculture & Resource Conservation Project: Analytical comparison of Organic Farming vs Intensive Farming."
      ]
    }
  ],
  "Class 9": [
    {
      subject: "English (R1)",
      activities: [
        "ASL 1: Extempore / Speech on themes like 'The Value of Sportsmanship' or 'Digital Habits of Teenagers' (2 Minutes).",
        "ASL 2: Audio Listening Comprehension: Listening to a recorded passage/news bulletin and answering objective/short-answer questions.",
        "ASL 3: Prose/Poetry Recitation & Appreciation from Beehive/Moments with correct diction, stress, and expression."
      ]
    },
    {
      subject: "Hindi (R2 - Ganga)",
      activities: [
        "गतिविधि 1: आशुभाषण - 'समय का सदुपयोग' अथवा 'डिजिटल जीवनशैली' विषय पर 2 मिनट का सारगर्भित वक्तव्य।",
        "गतिविधि 2: श्रवण कौशल - रेडियो समाचार अथवा प्रेरक प्रसंग सुनकर वस्तुनिष्ठ/लघु प्रश्नों के उत्तर देना।",
        "गतिविधि 3: पाठ्यपुस्तक की कविता/गद्यांश का सस्वर वाचन एवं भाव-सम्प्रेषण सहित प्रस्तुतीकरण।"
      ]
    },
    {
      subject: "Sanskrit (R3)",
      activities: [
        "गतिविधि 1: सस्वर श्लोकोच्चारणम् - शेमुषी पाठ्यपुस्तक के नीति-श्लोकों का शुद्ध उच्चारण एवं लयबद्ध वाचन।",
        "गतिविधि 2: संस्कृत भाषणम् - 'मम विद्यालयः' अथवा 'ऋतु-वर्णनम्' विषये सरल संस्कृत वाक्येषु वक्तव्यम्।",
        "गतिविधि 3: श्रवण कौशलम् - शिक्षकेन पठितं लघुकथानकं श्रुत्वा प्रश्नानाम् उत्तराणि लेखनम्।"
      ]
    },
    {
      subject: "Mathematics",
      activities: [
        "Math Lab 1: Verification of algebraic identities (e.g., (a + b)³, a³ - b³) using paper cut-outs or geometric models.",
        "Math Lab 2: Construction and verification of triangle congruence/similarity criteria using compass and straightedge.",
        "Math Lab 3: Statistical data collection and construction of a Histogram/Frequency Polygon based on a class survey."
      ]
    },
    {
      subject: "Science",
      activities: [
        "Science Lab 1: Verification of laws of motion / measurement of density of regular and irregular solids using a spring balance and displacement method.",
        "Science Lab 2: Preparation of a temporary mount to observe plant/animal cells under a microscope and label the parts.",
        "Science Lab 3: Study of properties of acids and bases using litmus paper and pH testing of common household substances."
      ]
    },
    {
      subject: "Social Science",
      activities: [
        "SST Activity 1: Physical/Political Map of India or the World: Marking key locations related to the French Revolution or the Indian freedom movement.",
        "SST Activity 2: Case study/portfolio on a democratic institution (e.g., Panchayati Raj, Election Commission) or a current economic issue (poverty, food security).",
        "SST Activity 3: Data-based project comparing physical features, climate, or natural vegetation across two Indian states/regions."
      ]
    }
  ],
  "Class 10": [
    {
      subject: "English (R1)",
      activities: [
        "ASL 1: Formal Speech/Debate on topics like 'Impact of Artificial Intelligence on Careers' or 'Value of Perseverance' (3 Minutes).",
        "ASL 2: Advanced Audio Comprehension: Analyzing tone, central idea, and inference from a recorded speech or interview.",
        "ASL 3: Dramatic Reading / Literary Appreciation of a prose or poetry piece from First Flight with critical commentary."
      ]
    },
    {
      subject: "Hindi (R2 - Ganga)",
      activities: [
        "गतिविधि 1: वाद-विवाद/आशुभाषण - 'स्वच्छ भारत अभियान' अथवा 'आत्मनिर्भर भारत' विषय पर ओजस्वी वक्तव्य।",
        "गतिविधि 2: श्रवण कौशल - समसामयिक परिचर्चा सुनकर वक्ता के तर्कों का विश्लेषणात्मक मूल्यांकन।",
        "गतिविधि 3: पाठ्यपुस्तक की कविता की भावपूर्ण प्रस्तुति एवं केंद्रीय भाव पर मौखिक व्याख्या।"
      ]
    },
    {
      subject: "Sanskrit (R3)",
      activities: [
        "गतिविधि 1: सस्वर श्लोकोच्चारणम् - शेमुषी द्वितीयो भागः के चयनित श्लोकों का शुद्ध एवं भावपूर्ण वाचन।",
        "गतिविधि 2: संस्कृत संभाषणम् - दैनिकजीवन-संबंधि सरल संवाद-प्रस्तुतीकरणम्।",
        "गतिविधि 3: व्याकरण-आधारित गतिविधि - प्रत्यय/समास का प्रयोग करते हुए वाक्य-निर्माणम्।"
      ]
    },
    {
      subject: "Mathematics",
      activities: [
        "Math Lab 1: Verification/derivation of trigonometric identities and heights-and-distances problems using clinometer models.",
        "Math Lab 2: Graphical verification of the nature of roots of a quadratic equation by plotting the corresponding parabola.",
        "Math Lab 3: Construction of a cumulative frequency curve (ogive) and estimation of median from real class data."
      ]
    },
    {
      subject: "Science",
      activities: [
        "Science Lab 1: Study of chemical reactions (combination, decomposition, displacement) using common laboratory reagents with safety precautions.",
        "Science Lab 2: Tracing the path of light through a glass prism/convex lens and verification of laws of refraction.",
        "Science Lab 3: Study of a model of the human circulatory/excretory system with correct labeling of parts."
      ]
    },
    {
      subject: "Social Science",
      activities: [
        "SST Activity 1: Historical map work on the spread of Nationalism in Europe/India, or resource-distribution mapping (minerals, power).",
        "SST Activity 2: Project/portfolio on Federalism, Political Parties, or a case study of a social movement in India.",
        "SST Activity 3: Economic survey/project on globalization, consumer rights, or sectoral contribution to the Indian economy."
      ]
    }
  ]
};

// Unified, class-agnostic SEA domain label per subject - shown once under
// the subject name in Part 2, valid regardless of which class or which
// specific chapter/activity is currently being taught.
const SEA_DOMAIN_MAP = [
  ["english", "ASL — Oral Communication & Listening Comprehension"],
  ["hindi", "ASL — मौखिक अभिव्यक्ति एवं श्रवण-बोध"],
  ["sanskrit", "ASL — श्रवणम्, वाचनम् एवं मौखिक-अभिव्यक्तिः"],
  ["mathematics", "Hands-on Investigation & Practical Application"],
  ["social science", "Map Work & Project Work — Geographical Skills, Research & Portfolio"],
  ["science", "Experiments, Observation & Practical Activities"]
];

function getSEADomainText(subjName) {
  const clean = (subjName || '').toLowerCase();
  for (const [key, text] of SEA_DOMAIN_MAP) {
    if (clean.includes(key)) return text;
  }
  return "Practical / Project-Based Enrichment Activity";
}

function isGeneralKnowledgeSubject(name) {
  return /general knowledge|\bgk\b/i.test(name || '');
}

// Robotics is a skill subject: the written paper is taken only in the Mid Term
// and the final exam. It has no unit tests or periodic assessments.
function roboticsHasWrittenExam(examName) {
  return /mid\s*term|annual|final/i.test(examName || '');
}

export const coScholasticSubjects = [
  { name: "Work Education", subtitle: "Pre-vocational skills, self-reliance & dignity of labour" },
  { name: "Art Education", subtitle: "Visual arts, music, dance & drama" },
  { name: "Health & Physical Education", subtitle: "Games, yoga, fitness & health awareness" },
  { name: "General Knowledge (GK) / General Awareness", subtitle: "Current affairs, science, sports & world awareness" },
  { name: "Discipline & Value Education", subtitle: "Conduct, punctuality, values & respect for peers" }
];

// Tracks filtered chapters: { [subject]: Set([chapter1, chapter2]) }
let sheetSelectedPortions = {};

// Tracks exam dates per class and subject: { [cls]: { [subject]: 'YYYY-MM-DD' } }
let sheetSubjectDates = {};

// Tracks subject inclusion per class and subject: { [cls]: { [subjectKey]: boolean } }
let sheetSubjectInclusions = {};

function isSubjectIncludedInSheet(cls, subjKey) {
  if (!sheetSubjectInclusions[cls]) {
    sheetSubjectInclusions[cls] = {};
  }
  if (sheetSubjectInclusions[cls][subjKey] === undefined) {
    return true; // Default to INCLUDED
  }
  return sheetSubjectInclusions[cls][subjKey];
}

function setSubjectIncludedInSheet(cls, subjKey, included) {
  if (!sheetSubjectInclusions[cls]) {
    sheetSubjectInclusions[cls] = {};
  }
  sheetSubjectInclusions[cls][subjKey] = !!included;
}

// Part 4 (Notebook Completion & Submission) dates, one per class and
// scholastic subject: { [cls]: { [subject]: 'YYYY-MM-DD' } }
let sheetNotebookDates = {};

function isPartIncludedInSheet(cls, partKey) {
  if (!sheetPartInclusion[cls]) {
    sheetPartInclusion[cls] = {};
  }
  if (sheetPartInclusion[cls][partKey] === undefined) {
    return true; // Default to INCLUDED
  }
  return sheetPartInclusion[cls][partKey];
}

function setPartIncludedInSheet(cls, partKey, included) {
  if (!sheetPartInclusion[cls]) {
    sheetPartInclusion[cls] = {};
  }
  sheetPartInclusion[cls][partKey] = !!included;
}

// Computes the display number for each part that's actually going to be
// rendered for this class, in fixed structural order (Scholastic, SEA,
// Co-Scholastic [only for Class 6-8], Notebook). A part excluded via its
// checkbox is simply missing from the returned map - callers skip it
// entirely, and every part after it shifts up to stay sequential.
function getSheetPartNumbers(cls, hasCoSch) {
  const order = ['scholastic', 'sea'];
  if (hasCoSch) order.push('cosch');
  order.push('notebook');

  const numbers = {};
  let n = 1;
  order.forEach(key => {
    if (isPartIncludedInSheet(cls, key)) {
      numbers[key] = n++;
    }
  });
  return numbers;
}

// Co-scholastic (Part 3) evaluation criteria, typed in manually by the subject
// teacher per class. Not persisted anywhere - lives only in this page's memory
// for the current session: { [cls]: { [subjectName]: text } }
let sheetCoScholasticCriteria = {};

function getCoScholasticCriteriaText(cls, subjName) {
  return (sheetCoScholasticCriteria[cls] && sheetCoScholasticCriteria[cls][subjName]) || '';
}

function setCoScholasticCriteriaText(cls, subjName, text) {
  if (!sheetCoScholasticCriteria[cls]) {
    sheetCoScholasticCriteria[cls] = {};
  }
  sheetCoScholasticCriteria[cls][subjName] = text;
}

// SEA (Part 2) manual teacher notes, additive alongside the prescribed
// activity checklist. Same behavior as the co-scholastic box above: blank by
// default, per class per subject, session-only (never persisted).
let sheetSEAManualNotes = {};

function getSEAManualNoteText(cls, subjName) {
  return (sheetSEAManualNotes[cls] && sheetSEAManualNotes[cls][subjName]) || '';
}

function setSEAManualNoteText(cls, subjName, text) {
  if (!sheetSEAManualNotes[cls]) {
    sheetSEAManualNotes[cls] = {};
  }
  sheetSEAManualNotes[cls][subjName] = text;
}

// Builds Part 2 (SEA) table rows for a class. Shared by the Class 6-8 and
// Class 9-10 renderers so both stay in lockstep with Part 1's inclusion
// state and the unified domain text.
function buildPart2RowsHtml(cls) {
  let part2RowsHtml = '';
  let p2Sno = 1;
  const seaList = (cbseSEAData[cls] || []).filter(item => isSubjectIncludedInSheet(cls, item.subject));

  seaList.forEach(item => {
    const seaSubjKey = `SEA: ${item.subject}`;
    const checkedSet = getSubjectSelectionForSheet(cls, seaSubjKey);

    let actsHtml = '';
    let checkedCount = 0;

    item.activities.forEach(act => {
      const isChecked = !!(checkedSet && checkedSet.has(act));
      if (isChecked) checkedCount++;

      const colonIdx = act.indexOf(':');
      const badgeText = colonIdx > -1 ? act.substring(0, colonIdx) : 'Activity';
      const bodyText = colonIdx > -1 ? act.substring(colonIdx + 1).trim() : act;

      actsHtml += `
        <label class="sea-activity-item ${isChecked ? 'is-selected' : 'is-unselected'}" data-subject="${seaSubjKey}" title="${isChecked ? 'Click to exclude' : 'Click to include'}">
          <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${seaSubjKey}" data-val="${act.replace(/"/g, '&quot;')}" ${isChecked ? 'checked' : ''}>
          <span class="sea-badge">${badgeText}</span>
          <span class="sea-activity-title">${bodyText}</span>
        </label>
      `;
    });

    const hasActs = actsHtml.trim().length > 0;
    const displayActs = (checkedCount === 0 && !hasActs)
      ? `<div style="font-style: italic; font-size: 8.5pt; color: #000000;">Prescribed CBSE Internal Assessment Activities</div>`
      : actsHtml;

    part2RowsHtml += `
      <tr class="paper-subject-row paper-part2-row">
        <td class="paper-row-sno" style="text-align: center; font-weight: bold; font-size: 9pt; color: #000000; width: 32px; padding: 12px 4px;">${p2Sno++}</td>
        <td style="width: 140px; vertical-align: top; padding: 12px 8px;">
          <div class="paper-subj-title">${item.subject}</div>
          <div style="font-size: 8pt; color: #000000; font-style: italic; margin-top: 1px;">${getSEADomainText(item.subject)}</div>
          <div class="paper-subj-actions no-print" style="margin-top: 4px;">
            <button type="button" class="btn-subj-quick btn-subj-all" data-subject="${seaSubjKey}" title="Select all ${item.subject} SEA">All</button>
            <button type="button" class="btn-subj-quick btn-subj-clear" data-subject="${seaSubjKey}" title="Clear all ${item.subject} SEA">Clear</button>
          </div>
        </td>
        <td style="padding: 12px 8px; vertical-align: top;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${displayActs}
          </div>
          <div style="font-size: 8.5pt; color: #000000; line-height: 1.45; margin-top: 8px;">
            <strong>Teacher's Notes:</strong> <span class="paper-sea-manual-display">${escapeHtml(getSEAManualNoteText(cls, item.subject))}</span>
          </div>
          <textarea
            class="sheet-sea-manual-input no-print"
            data-subject="${item.subject}"
            rows="2"
            placeholder="Type any additional activity/notes for ${item.subject} here..."
          >${escapeHtml(getSEAManualNoteText(cls, item.subject))}</textarea>
        </td>
      </tr>
    `;
  });

  return part2RowsHtml;
}

// Builds Part 4 (Notebook Completion) table rows for a class, given the
// list of scholastic subject entries to consider (same shape as
// Object.entries(subjectsData)). Mirrors Part 1's "Include in circular"
// state - a subject excluded there gets no row here either.
function buildPart4RowsHtml(cls, entries) {
  let part4RowsHtml = '';
  let p4Sno = 1;

  entries.forEach(([subjName]) => {
    if (isSchoolExcludedSubject(subjName)) return;
    if (!isSubjectIncludedInSheet(cls, subjName)) return;

    const notebookDate = (sheetNotebookDates[cls] && sheetNotebookDates[cls][subjName]) ? sheetNotebookDates[cls][subjName] : '';
    const notebookDateBadgeHtml = notebookDate
      ? `<div class="paper-subj-date-badge"><span class="no-print">📅 </span><span class="paper-date-label">Date: </span>${formatExamDate(notebookDate)}</div>`
      : `<div class="paper-subj-no-date no-print">📅 Set Submission Date</div>`;

    part4RowsHtml += `
      <tr class="paper-subject-row">
        <td class="paper-row-sno" style="text-align: center; font-weight: bold; font-size: 9pt; color: #000000; width: 32px; padding: 10px 4px;">${p4Sno++}</td>
        <td style="padding: 10px 8px;">
          <div class="paper-subj-title">${subjName}</div>
        </td>
        <td style="padding: 10px 8px; text-align: center;">
          <input type="date" class="sheet-notebook-date-input no-print" data-subject="${subjName}" value="${notebookDate}" title="Notebook Submission Date">
          ${notebookDateBadgeHtml}
        </td>
      </tr>
    `;
  });

  return part4RowsHtml;
}

function formatExamDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(d.getTime())) return dateStr;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  return `${dayNum}-${monthName}-${year} (${dayName})`;
}

function getSelectedSheetExamName() {
  if (sheetExamSelect && sheetExamSelect.value === 'custom') {
    const customVal = sheetCustomExamInput ? sheetCustomExamInput.value.trim() : '';
    return customVal || 'Custom Examination';
  }
  return (sheetExamSelect && sheetExamSelect.value) ? sheetExamSelect.value : 'Annual Examination';
}

function matchExamOption(examA, examB) {
  if (!examA || !examB) return false;
  const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const ca = clean(examA);
  const cb = clean(examB);
  if (ca === cb) return true;
  if (ca.includes(cb) || cb.includes(ca)) return true;
  if ((ca.includes('ut1') || ca.includes('unittest1') || ca.includes('unittesti')) && (cb.includes('ut1') || cb.includes('unittest1') || cb.includes('unittesti'))) return true;
  if ((ca.includes('ut2') || ca.includes('unittest2') || ca.includes('unittestii')) && (cb.includes('ut2') || cb.includes('unittest2') || cb.includes('unittestii'))) return true;
  if ((ca.includes('ut3') || ca.includes('unittest3') || ca.includes('unittestiii')) && (cb.includes('ut3') || cb.includes('unittest3') || cb.includes('unittestiii'))) return true;
  if ((ca.includes('ut4') || ca.includes('unittest4') || ca.includes('unittestiv')) && (cb.includes('ut4') || cb.includes('unittest4') || cb.includes('unittestiv'))) return true;
  if ((ca.includes('ut5') || ca.includes('unittest5') || ca.includes('unittestv')) && (cb.includes('ut5') || cb.includes('unittest5') || cb.includes('unittestv'))) return true;
  if (ca.includes('pai') && cb.includes('pai')) return true;
  if (ca.includes('paii') && cb.includes('paii')) return true;
  if ((ca.includes('preboard1') || ca.includes('preboardi')) && (cb.includes('preboard1') || cb.includes('preboardi'))) return true;
  if ((ca.includes('preboard2') || ca.includes('preboardii')) && (cb.includes('preboard2') || cb.includes('preboardii'))) return true;
  if ((ca.includes('preboard3') || ca.includes('preboardiii')) && (cb.includes('preboard3') || cb.includes('preboardiii'))) return true;
  if (ca.includes('annual') && cb.includes('annual')) return true;
  if ((ca.includes('midterm') || ca.includes('halfyearly') || ca.includes('term1') || ca.includes('termi')) && (cb.includes('midterm') || cb.includes('halfyearly') || cb.includes('term1') || cb.includes('termi'))) return true;
  if ((ca.includes('final') || ca.includes('annual')) && (cb.includes('final') || cb.includes('annual'))) return true;
  return false;
}

// Helper to fetch and order subject list directly matching main panel for this class
function getSheetSubjectsData(cls) {
  const isExcluded = (subj) => isSchoolExcludedSubject(subj) || (cls === 'Class 8' && subj.toLowerCase().includes('computer science'));

  if (classSelect && classSelect.value === cls && subjectSelect && subjectSelect.options.length > 1) {
    const mainSubjectNames = Array.from(subjectSelect.options)
      .filter(o => o.value && o.value !== "" && !isExcluded(o.value))
      .map(o => o.value);
    
    if (mainSubjectNames.length > 0 && cbseData[cls]) {
      const ordered = {};
      mainSubjectNames.forEach(sName => {
        if (cbseData[cls][sName] && !isExcluded(sName)) {
          ordered[sName] = cbseData[cls][sName];
        }
      });
      for (const [k, v] of Object.entries(cbseData[cls])) {
        if (!ordered[k] && !isExcluded(k)) ordered[k] = v;
      }
      return ordered;
    }
  }
  if (cbseData[cls]) {
    const filtered = {};
    for (const [k, v] of Object.entries(cbseData[cls])) {
      if (!isExcluded(k)) filtered[k] = v;
    }
    return filtered;
  }
  return {};
}

function populateSheetExamDropdown(cls) {
  if (!sheetExamSelect) return;
  sheetExamSelect.innerHTML = '';

  let examsList = [];

  // 1. Fetch exam options directly from main panel examNameSelect if available
  if (examNameSelect) {
    const options = Array.from(examNameSelect.querySelectorAll('option'));
    options.forEach(opt => {
      if (!opt.value || isWorksheetMode(opt.value)) return;
      const def = getExamDefaultDetails(cls, subjectSelect ? subjectSelect.value : '', opt.value);
      examsList.push({
        name: opt.value,
        marks: `${def.marks} Marks`,
        duration: def.duration
      });
    });
  }

  // 2. Fallback if main panel has not populated yet
  if (examsList.length === 0) {
    const rawList = (cls === 'Class 6' || cls === 'Class 7' || cls === 'Class 8')
      ? ["Unit Test I", "Unit Test II", "PA I", "Unit Test III", "Mid Term Examination", "Unit Test IV", "PA II", "Unit Test V", "Annual Examination"]
      : ["Unit Test I", "Unit Test II", "PA I", "Unit Test III", "Mid Term Examination", "Unit Test IV", "PA II", "Unit Test V", "Final Examination", "Pre Board 1", "Pre Board 2", "Pre Board 3"];

    rawList.forEach(exName => {
      const def = getExamDefaultDetails(cls, subjectSelect ? subjectSelect.value : '', exName);
      examsList.push({
        name: exName,
        marks: `${def.marks} Marks`,
        duration: def.duration
      });
    });
  }

  examsList.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.name;
    opt.textContent = ex.name;
    try {
      if (opt.dataset) {
        opt.dataset.marks = ex.marks || '';
        opt.dataset.duration = ex.duration || '';
      }
    } catch (e) {}
    opt.setAttribute('data-marks', ex.marks || '');
    opt.setAttribute('data-duration', ex.duration || '');
    sheetExamSelect.appendChild(opt);
  });

  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = '✏️ Custom Examination Name...';
  sheetExamSelect.appendChild(customOpt);
}

function initSheetClassDropdown() {
  if (!sheetClassSelect) return;
  sheetClassSelect.innerHTML = '';
  const classes = Object.keys(cbseData);
  classes.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    sheetClassSelect.appendChild(opt);
  });
}

export function autoUpdateSheetHeaderControls() {
  const sheetClass = document.getElementById('sheetClassSelect');
  const cls = (sheetClass && sheetClass.value) ? sheetClass.value : 'Class 8';
  const exam = getSelectedSheetExamName();
  const isMiddle = ['Class 6', 'Class 7', 'Class 8'].includes(cls);
  const exLower = (exam || '').toLowerCase().trim();
  const isUT = /unit\s*test|ut\s*[-_–—]?[iv1-5]/i.test(exLower);
  const isPA = /periodic\s*test|periodic\s*assessment|\bpa\b|pt\s*[-_–—]?[1-2]/i.test(exLower);

  const sheetMarks = document.getElementById('sheetMaxMarks');
  const sheetDur = document.getElementById('sheetDuration');
  const sheetP1Marks = document.getElementById('sheetPart1Marks');
  const sheetP1Time = document.getElementById('sheetPart1Time');

  if (isMiddle) {
    if (sheetP1Marks) {
      sheetP1Marks.value = isUT ? '20' : (isPA ? '40' : '80');
    }
    if (sheetP1Time) {
      sheetP1Time.value = isUT ? '45 Minutes' : (isPA ? '90 Mins' : '2.5 Hours');
    }
    if (sheetMarks) {
      sheetMarks.value = isUT ? '20 Marks' : (isPA ? '40 Marks' : '80 Marks');
    }
    if (sheetDur) {
      sheetDur.value = isUT ? '45 Minutes' : (isPA ? '90 Mins' : '2.5 Hours');
    }
  } else {
    // Classes 9 to 12
    const currentSubject = (subjectSelect && subjectSelect.value) ? subjectSelect.value : '';
    const def = getExamDefaultDetails(cls, currentSubject, exam);
    if (sheetMarks) {
      sheetMarks.value = `${def.marks} Marks`;
    }
    if (sheetDur) {
      sheetDur.value = def.duration;
    }
    if (sheetP1Marks) {
      sheetP1Marks.value = `${def.marks}`;
    }
    if (sheetP1Time) {
      sheetP1Time.value = def.duration;
    }
  }
}
if (typeof window !== 'undefined') {
  window.autoUpdateSheetHeaderControls = autoUpdateSheetHeaderControls;
}

export function syncSyllabusSheetFromPromptModule() {
  const sheetClass = document.getElementById('sheetClassSelect');
  const sheetBadge = document.getElementById('sheetClassBadge');
  const sheetExam = document.getElementById('sheetExamSelect');

  if (!sheetExam) return;

  const mainClass = (classSelect && classSelect.value) ? classSelect.value : 'Class 8';
  if (sheetClass && sheetClass.value !== mainClass) {
    sheetClass.value = mainClass;
  }
  if (sheetBadge) {
    sheetBadge.textContent = mainClass;
  }

  // Populate sheet exam dropdown if needed
  if (!sheetExam.options || sheetExam.options.length === 0) {
    populateSheetExamDropdown(mainClass);
  }

  const mainExam = (examNameSelect && examNameSelect.value && !isWorksheetMode(examNameSelect.value)) ? examNameSelect.value : '';
  if (mainExam) {
    let matched = false;
    for (let opt of sheetExam.options) {
      if (matchExamOption(opt.value, mainExam)) {
        sheetExam.value = opt.value;
        matched = true;
        break;
      }
    }
  }

  // Auto-set the calibrated Maximum Marks and Time Allowed into sheet header controls
  autoUpdateSheetHeaderControls();

  // Re-render paper if modal is currently open and visible
  const modal = document.getElementById('syllabusSheetModal');
  if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
    if (typeof renderSyllabusSheetPaper === 'function') {
      renderSyllabusSheetPaper();
    }
  }
}
if (typeof window !== 'undefined') {
  window.syncSyllabusSheetFromPromptModule = syncSyllabusSheetFromPromptModule;
}

function openSyllabusSheetModal() {
  const modal = document.getElementById('syllabusSheetModal') || syllabusSheetModal;
  if (!modal) return;

  // 1. Immediately reveal modal so user gets instant visual response
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  try {
    initSheetClassDropdown();

    // 2. Fetch Class & Exam options directly from Main Panel
    const mainClass = (classSelect && classSelect.value) ? classSelect.value : 'Class 8';
    if (sheetClassSelect) sheetClassSelect.value = mainClass;
    if (sheetClassBadge) sheetClassBadge.textContent = mainClass;

    populateSheetExamDropdown(mainClass);

    // 3. Synchronize Exam, Marks, and Duration directly from Prompt Generation Module
    syncSyllabusSheetFromPromptModule();

    if (sheetCustomExamInput) {
      sheetCustomExamInput.style.display = (sheetExamSelect && sheetExamSelect.value === 'custom') ? 'block' : 'none';
    }

    if (sheetIncludeSubtopics) {
      sheetIncludeSubtopics.checked = false;
    }

    renderSyllabusSheetPaper();
  } catch (err) {
    console.error("Error populating syllabus sheet:", err);
  }
}

function closeSyllabusSheetModal() {
  const modal = document.getElementById('syllabusSheetModal') || syllabusSheetModal;
  if (!modal) return;
  modal.classList.add('hidden');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

if (typeof window !== 'undefined') {
  window.openSyllabusSheetModal = openSyllabusSheetModal;
  window.closeSyllabusSheetModal = closeSyllabusSheetModal;
}

// Global delegated click handler guarantees that clicking anywhere on open button triggers modal
document.addEventListener('click', (e) => {
  const openBtn = e.target.closest('#openSyllabusSheetBtn, #openSyllabusSheetFromCardBtn');
  if (openBtn) {
    e.preventDefault();
    openSyllabusSheetModal();
    return;
  }
  const closeBtn = e.target.closest('#closeSyllabusSheetModalBtn');
  if (closeBtn) {
    e.preventDefault();
    closeSyllabusSheetModal();
    return;
  }
});

function isLanguageSkillSection(secKey) {
  if (!secKey) return false;
  const s = secKey.toLowerCase();
  // Reading
  if (s.includes('reading') || s.includes('अपठित')) return true;
  // Writing
  if (s.includes('writing') || s.includes('रचनात्मक') || s.includes('लेखन') || s.includes('अभिव्यक्ति और माध्यम')) return true;
  // Grammar
  if (s.includes('grammar') || s.includes('व्याकरण')) return true;
  return false;
}

function getFlatItemsForSubject(cls, subj) {
  if (!subj || isSchoolExcludedSubject(subj)) return [];
  if (subj.startsWith('SEA: ')) {
    const rawSubj = subj.replace('SEA: ', '').trim();
    const seaList = (cbseSEAData && cbseSEAData[cls]) ? cbseSEAData[cls] : [];
    const entry = seaList.find(e => e.subject === rawSubj);
    if (entry && Array.isArray(entry.activities)) {
      return entry.activities.map(act => ({ value: act, label: act }));
    }
    return [];
  }
  if (['Music', 'Art & Craft', 'Yoga'].includes(subj)) {
    return [{ value: '__included__', label: `${subj} (Include in circular)` }];
  }
  const subjectsData = getSheetSubjectsData(cls);
  const data = subjectsData[subj];
  if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
    if (subj.toLowerCase().includes('general knowledge') || subj.toLowerCase().includes('robotics')) {
      return [{ value: '__included__', label: `${subj} (Include in circular)` }];
    }
    return [];
  }
  const items = [];
  const isLang = /english|hindi|sanskrit|french|german|spanish|urdu/i.test(subj);

  if (Array.isArray(data)) {
    data.forEach(ch => {
      const title = typeof ch === 'string' ? ch : ch.name || String(ch);
      items.push({ value: title, label: title });
    });
  } else if (typeof data === 'object' && data !== null) {
    const isKeysAreChapters = Object.keys(data).some(k => /^(Chapter|Unit)\s*\d+/i.test(k));
    if (isKeysAreChapters && !isLang) {
      for (const [chKey, subList] of Object.entries(data)) {
        items.push({ value: chKey, label: chKey });
        if (Array.isArray(subList)) {
          subList.forEach(sub => {
            items.push({ value: `${chKey} -> ${sub}`, label: `${chKey}: ${sub}`, parentTopic: chKey });
            items.push({ value: sub, label: `${chKey}: ${sub}`, parentTopic: chKey });
          });
        }
      }
    } else {
      for (const [secKey, secVal] of Object.entries(data)) {
        if (Array.isArray(secVal)) {
          secVal.forEach(ch => {
            const title = typeof ch === 'string' ? ch : ch.name || String(ch);
            items.push({ value: title, label: `${secKey} > ${title}`, secKey });
          });
        } else if (typeof secVal === 'object' && secVal !== null) {
          for (const [topName, subtopicsList] of Object.entries(secVal)) {
            items.push({ value: topName, label: topName, secKey });
            if (Array.isArray(subtopicsList) && subtopicsList.length > 0) {
              subtopicsList.forEach(sub => {
                items.push({ value: `${topName} -> ${sub}`, label: `${topName}: ${sub}`, secKey, parentTopic: topName });
                items.push({ value: sub, label: `${topName}: ${sub}`, secKey, parentTopic: topName });
              });
            }
          }
        }
      }
    }
  }
  return items;
}

function handleInlineCheckboxChange(cb) {
  if (!sheetClassSelect || !cb) return;
  const cls = sheetClassSelect.value;
  const subj = cb.dataset?.subject || cb.getAttribute('data-subject');
  const val = cb.dataset?.val || cb.getAttribute('data-val');
  const sec = cb.dataset?.section || cb.getAttribute('data-section') || '';
  const subGroup = cb.dataset?.subgroup || cb.getAttribute('data-subgroup') || '';
  if (!subj || !val) return;
  const isChecked = cb.checked;
  const key = `${cls}::${subj}`;

  const flatItems = getFlatItemsForSubject(cls, subj);

  if (!sheetSelectionStore[key] || !sheetSelectionStore[key].initialized) {
    const allVals = new Set();
    flatItems.forEach(it => {
      allVals.add(it.value);
      if (it.secKey) allVals.add(`${it.secKey}: ${it.value}`);
    });
    sheetSelectionStore[key] = {
      checked: allVals,
      unchecked: new Set(),
      initialized: true
    };
  }

  const store = sheetSelectionStore[key];
  const isRobotics = subj.toLowerCase().includes('robotics');
  const relatedValues = new Set([val]);
  if (sec) {
    relatedValues.add(`${sec}: ${val}`);
  }
  if (subGroup) {
    relatedValues.add(`${subGroup} -> ${val}`);
  }
  if (!isRobotics) {
    flatItems.forEach(it => {
      if (it.parentTopic === val || it.value.startsWith(`${val} ->`)) {
        relatedValues.add(it.value);
      }
    });
  }

  if (isChecked) {
    relatedValues.forEach(v => {
      store.checked.add(v);
      store.unchecked.delete(v);
    });
  } else {
    relatedValues.forEach(v => {
      store.checked.delete(v);
      store.unchecked.add(v);
    });
  }

  renderSyllabusSheetPaper();
}

function handleSubjectSelectAll(subj) {
  if (!sheetClassSelect) return;
  const cls = sheetClassSelect.value;
  const flatItems = getFlatItemsForSubject(cls, subj);
  const key = `${cls}::${subj}`;

  const allVals = new Set();
  flatItems.forEach(it => {
    allVals.add(it.value);
    if (it.secKey) allVals.add(`${it.secKey}: ${it.value}`);
  });

  sheetSelectionStore[key] = {
    checked: allVals,
    unchecked: new Set(),
    initialized: true
  };

  renderSyllabusSheetPaper();
}

function handleSubjectClearAll(subj) {
  if (!sheetClassSelect) return;
  const cls = sheetClassSelect.value;
  const flatItems = getFlatItemsForSubject(cls, subj);
  const key = `${cls}::${subj}`;

  const allVals = new Set();
  flatItems.forEach(it => {
    allVals.add(it.value);
    if (it.secKey) allVals.add(`${it.secKey}: ${it.value}`);
  });

  sheetSelectionStore[key] = {
    checked: new Set(),
    unchecked: allVals,
    initialized: true
  };

  renderSyllabusSheetPaper();
}

function handleSubjectDateChange(inputEl) {
  if (!sheetClassSelect) return;
  const cls = sheetClassSelect.value;
  const subj = inputEl.dataset.subject;
  const range = inputEl.dataset.range;
  const val = inputEl.value ? inputEl.value.trim() : '';
  if (!sheetSubjectDates[cls]) {
    sheetSubjectDates[cls] = {};
  }
  const key = range ? `${subj}_${range}` : subj;
  if (val) {
    sheetSubjectDates[cls][key] = val;
  } else {
    delete sheetSubjectDates[cls][key];
  }
  renderSyllabusSheetPaper();
}

function handleNotebookDateChange(inputEl) {
  if (!sheetClassSelect) return;
  const cls = sheetClassSelect.value;
  const subj = inputEl.dataset.subject;
  const val = inputEl.value ? inputEl.value.trim() : '';
  if (!sheetNotebookDates[cls]) {
    sheetNotebookDates[cls] = {};
  }
  if (val) {
    sheetNotebookDates[cls][subj] = val;
  } else {
    delete sheetNotebookDates[cls][subj];
  }
  renderSyllabusSheetPaper();
}

function handleSubjectInclusionChange(cb) {
  if (!sheetClassSelect) return;
  const cls = sheetClassSelect.value;
  const subj = cb.dataset?.subject || cb.getAttribute('data-subject');
  if (!subj) return;
  setSubjectIncludedInSheet(cls, subj, cb.checked);
  renderSyllabusSheetPaper();
}

function handlePartInclusionChange(cb) {
  if (!sheetClassSelect) return;
  const cls = sheetClassSelect.value;
  const partKey = cb.dataset?.part || cb.getAttribute('data-part');
  if (!partKey) return;
  setPartIncludedInSheet(cls, partKey, cb.checked);
  renderSyllabusSheetPaper();
}

// Keeps the persistent header-ribbon Part checkboxes showing the truth for
// whichever class is currently selected (per-class memory), and hides the
// Co-Scholastic toggle entirely for Class 9-10 where that part never exists.
function syncPartInclusionCheckboxes(cls, isMiddleSchool) {
  document.querySelectorAll('.sheet-part-include-cb').forEach(cb => {
    const partKey = cb.dataset.part;
    cb.checked = isPartIncludedInSheet(cls, partKey);
  });
  const coSchWrapper = document.getElementById('sheetIncludeCoSchWrapper');
  if (coSchWrapper) {
    coSchWrapper.style.display = isMiddleSchool ? 'inline-flex' : 'none';
  }
}

function renderSyllabusSheetPaper() {
  if (!syllabusSheetPaper || !sheetClassSelect) return;
  // The main page's own init cascade (initClassDropdown() -> ... ->
  // renderSyllabusChecklist()) fires synchronously at module load, before
  // this modal has ever been opened - and before later module-level consts
  // further down the file (e.g. cbseSEAData) exist yet. There's nothing to
  // render for a hidden modal anyway, and openSyllabusSheetModal() already
  // re-renders for real once the user opens it.
  if (syllabusSheetModal && syllabusSheetModal.classList.contains('hidden')) return;

  const school = (sheetSchoolName && sheetSchoolName.value) ? sheetSchoolName.value.trim() : 'GOMTI NANDAN PUBLIC SCHOOL';
  const cls = sheetClassSelect.value;
  const isMiddleSchool = ['Class 6', 'Class 7', 'Class 8'].includes(cls);
  const exam = getSelectedSheetExamName();
  const marks = (sheetMaxMarks && sheetMaxMarks.value) ? sheetMaxMarks.value.trim() : '80 Marks';
  const duration = (sheetDuration && sheetDuration.value) ? sheetDuration.value.trim() : (isMiddleSchool ? '2.5 Hours' : '3 Hrs');
  const includeInstructions = sheetIncludeInstructions ? sheetIncludeInstructions.checked : true;
  const includeSubtopics = sheetIncludeSubtopics ? sheetIncludeSubtopics.checked : false;
  const includePrincipalSig = sheetIncludePrincipalSig ? sheetIncludePrincipalSig.checked : true;
  const session = getCurrentAcademicSession();
  syncPartInclusionCheckboxes(cls, isMiddleSchool);
  if (sheetWindowsPanel) {
    sheetWindowsPanel.style.display = 'none';
  }
  if (sheetMiddleSettingsPanel) {
    sheetMiddleSettingsPanel.style.display = isMiddleSchool ? 'flex' : 'none';
  }
  if (sheetGeneralControlsPanel) {
    sheetGeneralControlsPanel.style.display = isMiddleSchool ? 'none' : 'block';
  }

  const p1Time = (sheetPart1Time && sheetPart1Time.value.trim()) || getExamDefaultDuration(exam);
  const p1Marks = (sheetPart1Marks && sheetPart1Marks.value.trim()) || '80';
  const p1TimingStart = (sheetPart1TimingStart && sheetPart1TimingStart.value.trim()) || '07:30 AM';
  const p1TimingEnd = (sheetPart1TimingEnd && sheetPart1TimingEnd.value.trim()) || '02:30 PM';

  const p2Marks = (sheetPart2Marks && sheetPart2Marks.value.trim()) || '5 Marks (Internal)';
  const p2TimingStart = (sheetPart2TimingStart && sheetPart2TimingStart.value.trim()) || '07:30 AM';
  const p2TimingEnd = (sheetPart2TimingEnd && sheetPart2TimingEnd.value.trim()) || '02:30 PM';

  const p3TimingStart = (sheetPart3TimingStart && sheetPart3TimingStart.value.trim()) || '07:30 AM';
  const p3TimingEnd = (sheetPart3TimingEnd && sheetPart3TimingEnd.value.trim()) || '02:30 PM';

  const coSchDateFrom = (sheetCoSchDateFrom && sheetCoSchDateFrom.value) ? sheetCoSchDateFrom.value : coSchExamDateFrom;
  const coSchDateTo = (sheetCoSchDateTo && sheetCoSchDateTo.value) ? sheetCoSchDateTo.value : coSchExamDateTo;
  const seaDateFrom = (sheetSEADateFrom && sheetSEADateFrom.value) ? sheetSEADateFrom.value : seaExamDateFrom;
  const seaDateTo = (sheetSEADateTo && sheetSEADateTo.value) ? sheetSEADateTo.value : seaExamDateTo;

  const defaultTimingText = isMiddleSchool
    ? 'Full Working Day for Part 2 & 3 | Exam Hours for Part 1'
    : '07:30 AM – 02:30 PM';
  const schoolTiming = (sheetSchoolTiming && sheetSchoolTiming.value) ? sheetSchoolTiming.value.trim() : defaultTimingText;

  const hideUnchecked = sheetHideUncheckedToggle ? sheetHideUncheckedToggle.checked : false;
  if (syllabusSheetPaper) {
    if (hideUnchecked) {
      syllabusSheetPaper.classList.add('hide-unselected');
    } else {
      syllabusSheetPaper.classList.remove('hide-unselected');
    }
  }

  // Pre-seed default single exam dates for middle school scholastic subjects if not set
  if (isMiddleSchool) {
    if (!sheetSubjectDates[cls]) sheetSubjectDates[cls] = {};
    const defaultDates = {
      'English (R1)': '2026-02-16',
      'Hindi (R2)': '2026-02-18',
      'Sanskrit (R3)': '2026-02-20',
      'Mathematics': '2026-02-23',
      'Science': '2026-02-25',
      'Social Science': '2026-02-27',
      'General Knowledge': '2026-03-02',
      'Robotics_from': '2026-03-02',
      'Robotics_to': '2026-03-06'
    };
    for (const [sName, sDate] of Object.entries(defaultDates)) {
      if (!sheetSubjectDates[cls][sName]) {
        sheetSubjectDates[cls][sName] = sDate;
      }
    }
  }

  const subjectsData = getSheetSubjectsData(cls);
  const subjectEntries = Object.entries(subjectsData);

  // Sort subjects by exam date in ascending chronological order (earliest first)
  subjectEntries.sort(([subjA], [subjB]) => {
    const isRoboA = /robotics|computer/i.test(subjA);
    const isRoboB = /robotics|computer/i.test(subjB);
    const rawDateA = sheetSubjectDates[cls] ? (sheetSubjectDates[cls][subjA] || (isRoboA ? (sheetSubjectDates[cls]['Robotics_from'] || '2026-03-02') : '')) : '';
    const rawDateB = sheetSubjectDates[cls] ? (sheetSubjectDates[cls][subjB] || (isRoboB ? (sheetSubjectDates[cls]['Robotics_from'] || '2026-03-02') : '')) : '';
    const dateA = rawDateA ? rawDateA.trim() : '';
    const dateB = rawDateB ? rawDateB.trim() : '';
    if (dateA && dateB) {
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return 0;
    }
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    return 0;
  });

  // Preserve open state of chapter customization details across live re-renders
  const openDetailsKeys = new Set();
  if (syllabusSheetPaper) {
    syllabusSheetPaper.querySelectorAll('details.sheet-ch-customizer[open]').forEach(el => {
      const s = el.getAttribute('data-subject');
      const sec = el.getAttribute('data-section') || '';
      if (s) openDetailsKeys.add(`${s}::${sec}`);
    });
  }

  // Helper to format chapter sequences (e.g. Chapter 1 to Chapter 5, Chapter 8 & Chapter 9)
  function buildChapterSequenceString(selectedItems, totalItemsCount) {
    if (!selectedItems || selectedItems.length === 0) {
      return { text: 'No chapters selected', count: 0, isAll: false };
    }

    const numericItems = selectedItems.filter(it => it.num !== null);

    if (numericItems.length === 0) {
      const titles = selectedItems.map(it => it.title || it.raw);
      let text = '';
      if (titles.length === 1) text = titles[0];
      else if (titles.length === 2) text = `${titles[0]} & ${titles[1]}`;
      else text = titles.slice(0, -1).join(', ') + ' & ' + titles[titles.length - 1];
      return { text, count: selectedItems.length, isAll: selectedItems.length === totalItemsCount };
    }

    numericItems.sort((a, b) => a.num - b.num);

    const prefix = numericItems[0].prefix || 'Chapter';
    const isHindi = prefix === 'पाठ' || prefix === 'अध्याय';
    const toWord = isHindi ? 'से' : 'to';
    const andWord = isHindi ? 'व' : '&';

    if (numericItems.length === 1) {
      return { text: `${prefix} ${numericItems[0].num}`, count: 1, isAll: totalItemsCount === 1 };
    }

    if (numericItems.length === 2) {
      return { text: `${prefix} ${numericItems[0].num} ${andWord} ${prefix} ${numericItems[1].num}`, count: 2, isAll: totalItemsCount === 2 };
    }

    const ranges = [];
    let currentRange = [numericItems[0]];

    for (let i = 1; i < numericItems.length; i++) {
      const prev = numericItems[i - 1];
      const curr = numericItems[i];
      if (curr.num === prev.num + 1) {
        currentRange.push(curr);
      } else {
        ranges.push(currentRange);
        currentRange = [curr];
      }
    }
    ranges.push(currentRange);

    const rangeStrings = ranges.map(range => {
      if (range.length === 1) {
        return `${prefix} ${range[0].num}`;
      } else if (range.length === 2) {
        return `${prefix} ${range[0].num} ${andWord} ${prefix} ${range[1].num}`;
      } else {
        const start = range[0].num;
        const end = range[range.length - 1].num;
        return `${prefix} ${start} ${toWord} ${prefix} ${end}`;
      }
    });

    let resultStr = rangeStrings.join(', ');
    const isAll = numericItems.length === totalItemsCount && totalItemsCount >= 3;
    if (isAll) {
      resultStr += isHindi ? ' (सम्पूर्ण पाठ्यक्रम)' : (prefix === 'Lab' ? ' (Complete Practical Portion)' : ' (Complete Syllabus)');
    }

    return { text: resultStr, count: selectedItems.length, isAll };
  }

  function parseChapterItem(item, secKey = '', checkedSet = null) {
    const rawStr = typeof item === 'string' ? item : (item.name || item.title || String(item));
    const isChecked = !checkedSet || checkedSet.has(rawStr) || (secKey && (checkedSet.has(`${secKey}: ${rawStr}`) || checkedSet.has(`${secKey} -> ${rawStr}`)));
    const m = rawStr.match(/^(?:Chapter|Unit|पाठ|अध्याय|Lesson|Lab\s*Q?|Q)\s*(\d+)\s*[:.\-]?\s*(.*)$/i);
    let prefix = 'Chapter';
    let num = null;
    let title = rawStr;
    if (m) {
      if (/^पाठ/i.test(m[0])) prefix = 'पाठ';
      else if (/^अध्याय/i.test(m[0])) prefix = 'अध्याय';
      else if (/^Unit/i.test(m[0])) prefix = 'Unit';
      else if (/^Lab/i.test(m[0])) prefix = 'Lab';
      num = parseInt(m[1], 10);
      title = m[2].trim();
    } else {
      title = rawStr.replace(/^\d+[\.\)]\s*/, '').trim();
    }
    return { raw: rawStr, num, prefix, title, isChecked, secKey };
  }

  // Helper to render standard portion HTML for a subject
  function renderSubjectPortionContent(subjName, subjSyllabus, checkedSet) {
    let contentHtml = '';
    let checkedCount = 0;
    const isLang = /english|hindi|sanskrit|french|german|spanish|urdu/i.test(subjName);
    const isGk = /general knowledge|gk/i.test(subjName);
    const isMath = /mathematics|math/i.test(subjName);
    const isSci = /science/i.test(subjName);
    const isSst = /social science|social studies|sst/i.test(subjName);
    const isRobo = /robotics|computer/i.test(subjName);

    // The portion heading names the actual prescribed textbook instead of a
    // generic "NCERT chapters" label. `cls` is the sheet's own class, not the
    // prompt panel's, since the two can differ. Unrecognised subjects fall
    // back to getPrescribedBookName's catch-all, which is not worth printing,
    // so those keep a neutral label.
    const prescribedBook = getPrescribedBookName(cls, subjName);
    const hasPrescribedBook = !!prescribedBook && !prescribedBook.includes('Official CBSE');
    const bookLine = (seqText) => hasPrescribedBook
      ? `<div class="portion-book-line"><span class="portion-book-name">${prescribedBook}</span> &mdash; <span class="portion-book-chapters">${seqText}</span></div>`
      : `<div class="portion-book-line"><span class="portion-book-name">Prescribed Chapters:</span> <span class="portion-book-chapters">${seqText}</span></div>`;

    // 1. GENERAL KNOWLEDGE
    if (isGk) {
      const items = Array.isArray(subjSyllabus) ? subjSyllabus : Object.keys(subjSyllabus || {});
      const parsed = items.map(it => parseChapterItem(it, '', checkedSet));
      const selected = parsed.filter(it => it.isChecked);
      checkedCount = selected.length;

      const seq = buildChapterSequenceString(selected, items.length);

      contentHtml = `
        <div class="portion-inline-text">
          <!-- Print/PDF output -->
          <div class="portion-print-summary">
            ${bookLine(seq.text)}
          </div>
          <!-- On-screen view: only checkboxes -->
          <div class="portion-screen-selector">
            <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}">
              ${parsed.map(it => `
                <label class="sheet-ch-customizer-item">
                  <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                  <span>${it.raw}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      return { contentHtml, checkedCount };
    }

    // 2. MATHEMATICS
    if (isMath) {
      const rawList = Array.isArray(subjSyllabus) ? subjSyllabus : Object.keys(subjSyllabus || {});
      const parsed = rawList.map(it => parseChapterItem(it, '', checkedSet));
      const selected = parsed.filter(it => it.isChecked);
      checkedCount = selected.length;

      const seq = buildChapterSequenceString(selected, rawList.length);

      contentHtml = `
        <div class="portion-inline-text">
          <!-- Print/PDF output -->
          <div class="portion-print-summary">
            ${bookLine(seq.text)}
          </div>
          <!-- On-screen view: only checkboxes -->
          <div class="portion-screen-selector">
            <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}">
              ${parsed.map(it => `
                <label class="sheet-ch-customizer-item">
                  <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                  <span>${it.raw}</span>
                </label>
              `).join('')}
            </div>
          </div>

        </div>
      `;
      return { contentHtml, checkedCount };
    }

    // 3. SCIENCE
    if (isSci && typeof subjSyllabus === 'object' && !Array.isArray(subjSyllabus)) {
      const isChapterKeys = Object.keys(subjSyllabus).some(k => /^(Chapter|Unit)\s*\d+/i.test(k));
      if (isChapterKeys) {
        const rawList = Object.keys(subjSyllabus);
        const parsed = rawList.map(k => {
          const subList = subjSyllabus[k];
          const isChecked = !checkedSet || (
            checkedSet.has(k) ||
            (Array.isArray(subList) && subList.some(sub => checkedSet.has(`${k} -> ${sub}`) || checkedSet.has(sub)))
          );
          const m = k.match(/^(?:Chapter|Unit)\s*(\d+)\s*[:.\-]?\s*(.*)$/i);
          return {
            raw: k,
            num: m ? parseInt(m[1], 10) : null,
            prefix: 'Chapter',
            title: m ? m[2].trim() : k,
            isChecked
          };
        });
        const selected = parsed.filter(it => it.isChecked);
        checkedCount = selected.length;

        const seq = buildChapterSequenceString(selected, rawList.length);

        contentHtml = `
          <div class="portion-inline-text">
            <!-- Print/PDF output -->
            <div class="portion-print-summary">
              ${bookLine(seq.text)}
            </div>
            <!-- On-screen view: only checkboxes -->
            <div class="portion-screen-selector">
              <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}">
                ${parsed.map(it => `
                  <label class="sheet-ch-customizer-item">
                    <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                    <span>${it.raw}</span>
                  </label>
                `).join('')}
              </div>
            </div>

          </div>
        `;
        return { contentHtml, checkedCount };
      }
    }

    // 4. SOCIAL SCIENCE
    if (isSst && typeof subjSyllabus === 'object' && !Array.isArray(subjSyllabus)) {
      const themes = Object.entries(subjSyllabus);
      let totalSstChapters = 0;
      let selectedSstChapters = 0;
      const themeDataList = [];

      themes.forEach(([themeKey, chList]) => {
        const list = Array.isArray(chList) ? chList : Object.keys(chList || {});
        totalSstChapters += list.length;
        const parsed = list.map(ch => parseChapterItem(ch, themeKey, checkedSet));
        const selected = parsed.filter(it => it.isChecked);
        selectedSstChapters += selected.length;
        const seq = buildChapterSequenceString(selected, list.length);
        themeDataList.push({
          themeKey,
          parsed,
          selected,
          seqText: seq.text,
          isAllSelected: selected.length === list.length
        });
      });

      checkedCount = selectedSstChapters;

      // Classes 6-9 number their Social Science chapters continuously across
      // the themes, so the printed portion reads as one plain chapter range
      // with no theme names. Class 10 restarts numbering inside each of its
      // four books, where a merged range would mean four different "Chapter 1"s,
      // so those keep their book names. Decided from the numbers themselves
      // rather than the class, so it stays right if the syllabus changes.
      const allSelectedSst = themeDataList.flatMap(t => t.selected);
      const selectedNums = allSelectedSst.map(it => it.num).filter(n => n !== null && n !== undefined);
      const numbersRepeatAcrossGroups = new Set(selectedNums).size !== selectedNums.length;
      const canMergeIntoOneRange = selectedNums.length === allSelectedSst.length && !numbersRepeatAcrossGroups;

      // Map Work carries no syllabus of its own - it is set from the chapters
      // listed above, so the line says that instead of naming extra topics.
      const MAP_WORK_TEXT = 'Identification and labelling on the Outline Political Map of India, from the prescribed chapters listed above only. No additional map syllabus.';
      const mapWorkLine = `<div style="margin-top: 3px; font-size: 9pt; color: #333333;">&bull; <strong>Map Work:</strong> ${MAP_WORK_TEXT}</div>`;

      let themesSummaryHtml = '';
      if (canMergeIntoOneRange && allSelectedSst.length > 0) {
        const mergedSeq = buildChapterSequenceString(allSelectedSst, totalSstChapters);
        themesSummaryHtml = `
          <div class="portion-inline-text">
            ${bookLine(mergedSeq.text)}
            ${mapWorkLine}
          </div>
        `;
      } else {
        themesSummaryHtml = `
          <div class="portion-inline-text">
            ${themeDataList.filter(t => t.selected.length > 0).map(t => `
              <div><span class="portion-sec-title">${t.themeKey}:</span> <span style="font-weight: bold;">${t.seqText}</span></div>
            `).join('')}
            ${mapWorkLine}
          </div>
        `;
      }

      contentHtml = `
        <div class="portion-inline-text">
          <!-- Print/PDF output -->
          <div class="portion-print-summary">
            ${themesSummaryHtml}
          </div>
          <!-- On-screen view: organized theme checkboxes -->
          <div class="portion-screen-selector">
            ${themeDataList.map(t => `
              <div style="margin-bottom: 6px;">
                <div style="font-weight: 600; font-size: 9pt; color: #1e293b; margin-top: 3px;">${t.themeKey}:</div>
                <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="${t.themeKey}">
                  ${t.parsed.map(it => `
                    <label class="sheet-ch-customizer-item">
                      <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="${t.themeKey}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                      <span>${it.raw}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            <div style="margin-top: 3px; font-size: 9pt; color: #475569;">&bull; <strong>Map Work:</strong> ${MAP_WORK_TEXT}</div>
          </div>
        </div>
      `;
      return { contentHtml, checkedCount };
    }

    // 5. LANGUAGE SUBJECTS (English, Hindi, Sanskrit)
    if (isLang && typeof subjSyllabus === 'object' && !Array.isArray(subjSyllabus)) {
      const allSecKeys = Object.keys(subjSyllabus);
      const litKeys = allSecKeys.filter(k => /literature|poorvi|honeydew|beehive|first flight|moments|footprints|it so happened/i.test(k));
      const shouldAggregateLit = litKeys.length > 1;
      const nonLitKeys = shouldAggregateLit ? allSecKeys.filter(k => !litKeys.includes(k)) : allSecKeys;

      const sectionBlocks = [];

      // A. Standard non-literature sections (Reading, Writing, Grammar, or standard book)
      nonLitKeys.forEach(secKey => {
        const secVal = subjSyllabus[secKey];
        const isWritingSection = /writing|लेखन|रचनात्मक/i.test(secKey);
        const isNestedGroup = typeof secVal === 'object' && !Array.isArray(secVal) && secVal !== null;

        if (isWritingSection && isNestedGroup) {
          let subgroupSummaries = [];
          let subgroupSelectors = [];
          let hasAnySubgroupSelected = false;

          for (const [subGroupName, subGroupTopics] of Object.entries(secVal)) {
            const rawItems = Array.isArray(subGroupTopics) ? subGroupTopics : Object.keys(subGroupTopics || {});
            const parsed = rawItems.map(it => {
              const isChecked = !checkedSet || (
                checkedSet.has(it) ||
                checkedSet.has(`${subGroupName} -> ${it}`) ||
                checkedSet.has(`${secKey}: ${it}`)
              );
              return {
                raw: it,
                title: it,
                num: null,
                isChecked
              };
            });
            const selected = parsed.filter(it => it.isChecked);
            if (selected.length > 0) {
              checkedCount += selected.length;
              hasAnySubgroupSelected = true;
            }
            const seq = buildChapterSequenceString(selected, rawItems.length);

            subgroupSummaries.push(`
              <div style="margin-top: 2px; line-height: 1.35; font-size: 9pt;">
                &bull; <strong>${subGroupName.endsWith(':') ? subGroupName.slice(0, -1) : subGroupName}:</strong> ${seq.text}
              </div>
            `);

            subgroupSelectors.push(`
              <div style="margin-top: 4px; margin-bottom: 6px;">
                <div style="font-weight: 700; font-size: 8.5pt; color: #1e293b; margin-bottom: 3px;">${subGroupName.endsWith(':') ? subGroupName : subGroupName + ':'}</div>
                <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="${secKey}" data-subgroup="${subGroupName}">
                  ${parsed.map(it => `
                    <label class="sheet-ch-customizer-item">
                      <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="${secKey}" data-subgroup="${subGroupName}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                      <span>${it.raw}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `);
          }

          sectionBlocks.push(`
            <div class="paper-section-block ${!hasAnySubgroupSelected ? 'is-unselected' : ''}" style="margin-bottom: 4px;">
              <div>
                <span class="portion-sec-title">${secKey}:</span>
                <!-- Print/PDF output -->
                <div class="portion-print-summary" style="margin-top: 2px;">
                  ${subgroupSummaries.join('')}
                </div>
              </div>
              <!-- On-screen view: organized sub-group checkboxes -->
              <div class="portion-screen-selector">
                ${subgroupSelectors.join('')}
              </div>
            </div>
          `);
          return;
        }

        const rawItems = Array.isArray(secVal) ? secVal : Object.keys(secVal || {});
        const parsed = rawItems.map(it => parseChapterItem(it, secKey, checkedSet));
        const selected = parsed.filter(it => it.isChecked);
        if (selected.length > 0) checkedCount += selected.length;

        const seq = buildChapterSequenceString(selected, rawItems.length);
        const isBookSection = /पाठ्यपुस्तक|मल्हार|दीपकम्|reader|textbook/i.test(secKey);

        sectionBlocks.push(`
          <div class="paper-section-block ${selected.length === 0 ? 'is-unselected' : ''}" style="margin-bottom: 4px;">
            <div>
              <span class="portion-sec-title">${secKey}:</span>
              <!-- Print/PDF output -->
              <span class="portion-print-summary" style="${isBookSection ? 'font-weight: bold;' : ''}"> ${seq.text}</span>
            </div>
            <!-- On-screen view: only checkboxes -->
            <div class="portion-screen-selector">
              <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="${secKey}">
                ${parsed.map(it => `
                  <label class="sheet-ch-customizer-item">
                    <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="${secKey}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                    <span>${it.raw}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        `);
      });

      // B. Aggregated English Literature sections (Poorvi / Honeydew across all units)
      if (shouldAggregateLit) {
        const allLitItems = [];
        litKeys.forEach(secKey => {
          const secVal = subjSyllabus[secKey];
          if (Array.isArray(secVal)) {
            secVal.forEach(ch => allLitItems.push(parseChapterItem(ch, secKey, checkedSet)));
          }
        });

        const selectedLit = allLitItems.filter(it => it.isChecked);
        if (selectedLit.length > 0) checkedCount += selectedLit.length;

        const seq = buildChapterSequenceString(selectedLit, allLitItems.length);
        const bookMatch = litKeys[0].match(/Literature\s*-\s*([^(\n]+)/i);
        const bookName = bookMatch ? bookMatch[1].trim() : 'Poorvi';
        const unifiedLitTitle = `Section C: Literature — ${bookName} (Prose & Poetry)`;

        sectionBlocks.push(`
          <div class="paper-section-block ${selectedLit.length === 0 ? 'is-unselected' : ''}" style="margin-bottom: 4px;">
            <div>
              <span class="portion-sec-title">${unifiedLitTitle}:</span>
              <!-- Print/PDF output -->
              <span class="portion-print-summary" style="font-weight: bold;"> ${seq.text}</span>
            </div>
            <!-- On-screen view: only checkboxes -->
            <div class="portion-screen-selector">
              <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="literature">
                ${allLitItems.map(it => `
                  <label class="sheet-ch-customizer-item">
                    <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="${it.secKey}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                    <span>${it.raw}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        `);
      }

      contentHtml = `<div class="portion-inline-text">${sectionBlocks.join('')}</div>`;
      return { contentHtml, checkedCount };
    }

    // 6. ROBOTICS / COMPUTER
    if (isRobo) {
      let theoryRawList = [];
      let practicalRawList = [];

      if (typeof subjSyllabus === 'object' && subjSyllabus !== null && !Array.isArray(subjSyllabus)) {
        theoryRawList = Object.keys(subjSyllabus);
        for (const [chKey, labs] of Object.entries(subjSyllabus)) {
          if (Array.isArray(labs)) {
            labs.forEach(lab => {
              if (typeof lab === 'string' && lab.trim().length > 0) {
                practicalRawList.push(lab.trim());
              }
            });
          }
        }
      } else if (Array.isArray(subjSyllabus)) {
        subjSyllabus.forEach(it => {
          const str = typeof it === 'string' ? it : (it.name || String(it));
          if (/^Lab/i.test(str)) practicalRawList.push(str);
          else theoryRawList.push(str);
        });
      }

      // Theory items
      const theoryParsed = theoryRawList.map(it => parseChapterItem(it, 'theory', checkedSet));
      const theorySelected = theoryParsed.filter(it => it.isChecked);
      const theorySeq = buildChapterSequenceString(theorySelected, theoryRawList.length);

      // Practical / Lab items
      const labParsed = practicalRawList.map(it => parseChapterItem(it, 'practical', checkedSet));
      const labSelected = labParsed.filter(it => it.isChecked);
      const labSeq = buildChapterSequenceString(labSelected, practicalRawList.length);

      checkedCount = theorySelected.length + labSelected.length;

      contentHtml = `
        <div class="portion-inline-text">
          <div class="paper-section-block ${theorySelected.length === 0 ? 'is-unselected' : ''}" style="margin-bottom: 6px;">
            <span class="portion-sec-title">Theory Portion:</span>
            <div class="portion-print-summary" style="font-weight: bold; font-size: 10pt; color: #000000; line-height: 1.45; margin-top: 2px;">
              ${theorySeq.text}
            </div>
            <div class="portion-screen-selector">
              <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="theory">
                ${theoryParsed.map(it => `
                  <label class="sheet-ch-customizer-item" title="${it.raw.replace(/"/g, '&quot;')}">
                    <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="theory" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                    <span>${it.raw}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="paper-section-block ${labSelected.length === 0 ? 'is-unselected' : ''}" style="margin-top: 6px;">
            <span class="portion-sec-title">Practical / Lab Portion:</span>
            <div class="portion-print-summary" style="font-weight: bold; font-size: 10pt; color: #000000; line-height: 1.45; margin-top: 2px;">
              ${labSeq.text}
            </div>
            <div class="portion-screen-selector">
              <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="practical">
                ${labParsed.map(it => `
                  <label class="sheet-ch-customizer-item" title="${it.raw.replace(/"/g, '&quot;')}">
                    <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="practical" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                    <span>${it.raw}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
      return { contentHtml, checkedCount };
    }

    // 7. GENERIC FALLBACK (High school electives or other subjects)
    if (Array.isArray(subjSyllabus)) {
      const parsed = subjSyllabus.map(it => parseChapterItem(it, '', checkedSet));
      const selected = parsed.filter(it => it.isChecked);
      checkedCount = selected.length;
      const seq = buildChapterSequenceString(selected, subjSyllabus.length);

      contentHtml = `
        <div class="portion-inline-text">
          <!-- Print/PDF output -->
          <div class="portion-print-summary">
            ${bookLine(seq.text)}
          </div>
          <!-- On-screen view: only checkboxes -->
          <div class="portion-screen-selector">
            <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}">
              ${parsed.map(it => `
                <label class="sheet-ch-customizer-item">
                  <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                  <span>${it.raw}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      return { contentHtml, checkedCount };
    } else if (typeof subjSyllabus === 'object' && subjSyllabus !== null) {
      const secBlocks = [];
      for (const [secKey, secVal] of Object.entries(subjSyllabus)) {
        const rawList = Array.isArray(secVal) ? secVal : Object.keys(secVal || {});
        const parsed = rawList.map(it => parseChapterItem(it, secKey, checkedSet));
        const selected = parsed.filter(it => it.isChecked);
        if (selected.length > 0) checkedCount += selected.length;
        const seq = buildChapterSequenceString(selected, rawList.length);

        secBlocks.push(`
          <div class="paper-section-block ${selected.length === 0 ? 'is-unselected' : ''}" style="margin-bottom: 4px;">
            <div>
              <span class="portion-sec-title">${secKey}:</span>
              <!-- Print/PDF output -->
              <span class="portion-print-summary"> ${seq.text}</span>
            </div>
            <!-- On-screen view: only checkboxes -->
            <div class="portion-screen-selector">
              <div class="sheet-topic-selector-grid no-print" data-subject="${subjName}" data-section="${secKey}">
                ${parsed.map(it => `
                  <label class="sheet-ch-customizer-item">
                    <input type="checkbox" class="sheet-inline-cb no-print" data-subject="${subjName}" data-section="${secKey}" data-val="${it.raw.replace(/"/g, '&quot;')}" ${it.isChecked ? 'checked' : ''}>
                    <span>${it.raw}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        `);
      }
      contentHtml = `<div class="portion-inline-text">${secBlocks.join('')}</div>`;
      return { contentHtml, checkedCount };
    }

    return { contentHtml: '<div style="font-style: italic; font-size: 9.5pt; color: #000000;">Complete Prescribed Syllabus</div>', checkedCount: 0 };
  }

  // --------------------------------------------------------------------------
  // CASE A: MIDDLE SCHOOL (CLASSES 6, 7, 8) -> CBSE 3-PART COMPREHENSIVE CIRCULAR
  // --------------------------------------------------------------------------
  if (isMiddleSchool) {
    const partNumbers = getSheetPartNumbers(cls, true);

    // 1. PART 1: Scholastic Subjects (Written Pen-Paper Exams)
    // General Knowledge is assessed as a co-scholastic domain (Part 3), not as a
    // written scholastic paper, so it is not listed here.
    const scholasticEntries = subjectEntries.filter(([sName]) => {
      const sLow = sName.toLowerCase();
      return !sLow.includes('music') && !sLow.includes('art') && !sLow.includes('yoga') &&
             !isGeneralKnowledgeSubject(sName);
    });

    let part1RowsHtml = '';
    let p1Sno = 1;

    scholasticEntries.forEach(([subjName, subjSyllabus]) => {
      if (isSchoolExcludedSubject(subjName)) return;

      const isRobo = /robotics|computer/i.test(subjName);
      if (isRobo && !roboticsHasWrittenExam(exam)) return;

      const checkedSet = getSubjectSelectionForSheet(cls, subjName);
      const { contentHtml, checkedCount } = renderSubjectPortionContent(subjName, subjSyllabus, checkedSet);

      let dateContainerHtml = '';

      if (isRobo) {
        const roboFrom = (sheetSubjectDates[cls] && sheetSubjectDates[cls]['Robotics_from']) ? sheetSubjectDates[cls]['Robotics_from'] : '2026-03-02';
        const roboTo = (sheetSubjectDates[cls] && sheetSubjectDates[cls]['Robotics_to']) ? sheetSubjectDates[cls]['Robotics_to'] : '2026-03-06';
        const fromFormatted = formatShortDate(roboFrom) || '02 Mar 2026';
        const toFormatted = formatShortDate(roboTo) || '06 Mar 2026';

        dateContainerHtml = `
          <div class="paper-subj-date-container">
            <div class="no-print" style="margin-bottom: 3px; font-size: 7.5pt; color: #475569;">
              <div style="display: flex; gap: 3px; align-items: center; margin-bottom: 2px;">
                <span style="width: 28px;">From:</span>
                <input type="date" class="sheet-subj-date-input no-print" data-subject="${subjName}" data-range="from" value="${roboFrom}" title="Start Date">
              </div>
              <div style="display: flex; gap: 3px; align-items: center;">
                <span style="width: 28px;">To:</span>
                <input type="date" class="sheet-subj-date-input no-print" data-subject="${subjName}" data-range="to" value="${roboTo}" title="End Date">
              </div>
            </div>
            <div class="paper-subj-date-badge" style="white-space: normal; text-align: left;">
              <span class="no-print">📅 </span><span class="paper-date-label">Date: </span>${fromFormatted} – ${toFormatted}
              <div style="font-size: 7.5pt; font-weight: normal; color: #222222; margin-top: 2px; line-height: 1.25;">
                (Exam will be taken during regular school days within this date range)
              </div>
            </div>
          </div>
        `;
      } else {
        const subjDate = (sheetSubjectDates[cls] && sheetSubjectDates[cls][subjName]) ? sheetSubjectDates[cls][subjName] : '';
        const dateBadgeHtml = subjDate
          ? `<div class="paper-subj-date-badge"><span class="no-print">📅 </span><span class="paper-date-label">Date: </span>${formatExamDate(subjDate)}</div>`
          : `<div class="paper-subj-no-date no-print">📅 Set Exam Date</div>`;

        dateContainerHtml = `
          <div class="paper-subj-date-container">
            <input type="date" class="sheet-subj-date-input no-print" data-subject="${subjName}" value="${subjDate}" title="Set Exam Date for ${subjName}">
            ${dateBadgeHtml}
          </div>
        `;
      }

      const hasContent = (contentHtml && contentHtml.trim().length > 0);
      const displayContent = (checkedCount === 0 && !hasContent)
        ? `<div style="font-style: italic; font-size: 9pt; color: #000000; padding: 2px 0;">Complete Prescribed Syllabus</div>`
        : contentHtml;
      const isIncluded = isSubjectIncludedInSheet(cls, subjName);
      const currentRowNum = isIncluded ? p1Sno++ : '—';

      const def = getExamDefaultDetails(cls, subjName, exam);
      const isUT = /unit\s*test|ut\s*[-_–—]?[iv1-5]/i.test(exam);
      const isGK = subjName.toLowerCase().includes('general knowledge') || subjName.toLowerCase().includes('gk');
      let subjectMarks = def.marks;
      if (!isRobo && !isGK && sheetPart1Marks && sheetPart1Marks.value.trim() && !isNaN(parseInt(sheetPart1Marks.value, 10))) {
        subjectMarks = parseInt(sheetPart1Marks.value, 10);
      }
      const marksBadgeText = isRobo ? '100 Marks' : `${subjectMarks} Marks`;
      const marksBadgeHtml = `<span class="subj-marks-badge">${marksBadgeText}</span>`;

      // Robotics is assessed as 70 marks practical + a 30 mark written paper,
      // so the split is spelled out under the subject name.
      const roboticsBreakdownHtml = isRobo ? `
        <div style="font-size: 8pt; color: #000000; line-height: 1.4; margin-top: 3px;">
          <div><strong>Practical (70M):</strong> Hands-on (40) + Project (20) + Viva (10)</div>
          <div><strong>Written Exam (30M):</strong> Theory (30) &mdash; 60 Mins</div>
        </div>
      ` : '';

      const includeCheckboxHtml = `
        <div class="sheet-include-subject-wrapper no-print">
          <label class="sheet-subject-include-label ${!isIncluded ? 'is-excluded' : ''}" title="${isIncluded ? 'Uncheck to exclude from circular' : 'Check to include in circular'}">
            <input type="checkbox" class="sheet-subject-include-cb no-print" data-subject="${subjName}" ${isIncluded ? 'checked' : ''}>
            <span>Include in circular</span>
          </label>
        </div>
      `;

      part1RowsHtml += `
        <tr class="paper-subject-row ${!isIncluded ? 'is-subject-excluded is-unselected' : ''}">
          <td class="paper-row-sno" style="text-align: center; font-weight: bold; font-size: 9pt; color: #000000; width: 32px;">${currentRowNum}</td>
          <td style="width: 140px; vertical-align: top;">
            <div class="paper-subj-title">${subjName} ${marksBadgeHtml}</div>
            ${roboticsBreakdownHtml}
            ${dateContainerHtml}
            <div class="paper-subj-actions no-print">
              <button type="button" class="btn-subj-quick btn-subj-all" data-subject="${subjName}" title="Select ${subjName}">All</button>
              <button type="button" class="btn-subj-quick btn-subj-clear" data-subject="${subjName}" title="Clear ${subjName}">Clear</button>
            </div>
            ${includeCheckboxHtml}
          </td>
          <td>
            ${displayContent}
          </td>
        </tr>
      `;
    });

    // 2. PART 2: Subject Enrichment Activities (SEA - 5 Marks Internal Assessment)
    const part2RowsHtml = buildPart2RowsHtml(cls);

    // 3. PART 3: Co-Scholastic Activities (Internal Skills Assessment)
    let part3RowsHtml = '';
    let p3Sno = 1;

    coScholasticSubjects.forEach(item => {
      const subjName = item.name;
      const isIncluded = isSubjectIncludedInSheet(cls, subjName);
      const currentRowNum = isIncluded ? p3Sno++ : '—';

      // General Knowledge keeps its prescribed chapter list, which moved here
      // from Part 1 along with the subject itself.
      let domainPortionHtml = '';
      if (isGeneralKnowledgeSubject(subjName)) {
        const gkEntry = subjectEntries.find(([sName]) => isGeneralKnowledgeSubject(sName));
        if (gkEntry) {
          const gkSyllabus = gkEntry[1];
          const gkChecked = getSubjectSelectionForSheet(cls, gkEntry[0]);
          const { contentHtml } = renderSubjectPortionContent(gkEntry[0], gkSyllabus, gkChecked);
          if (contentHtml) domainPortionHtml = `<div style="margin-bottom: 6px;">${contentHtml}</div>`;
        }
      }

      const includeCheckboxHtml = `
        <div class="sheet-include-subject-wrapper no-print" style="margin-top: 6px;">
          <label class="sheet-subject-include-label ${!isIncluded ? 'is-excluded' : ''}" title="${isIncluded ? 'Uncheck to exclude from circular' : 'Check to include in circular'}">
            <input type="checkbox" class="sheet-subject-include-cb no-print" data-subject="${subjName}" ${isIncluded ? 'checked' : ''}>
            <span>Include in circular</span>
          </label>
        </div>
      `;

      part3RowsHtml += `
        <tr class="paper-subject-row ${!isIncluded ? 'is-subject-excluded is-unselected' : ''}">
          <td class="paper-row-sno" style="text-align: center; font-weight: bold; font-size: 9pt; color: #000000; width: 32px; padding: 10px 4px;">${currentRowNum}</td>
          <td style="width: 140px; vertical-align: top; padding: 10px 8px;">
            <div class="paper-subj-title">${subjName}</div>
            <div style="font-size: 8pt; color: #000000; font-style: italic; margin-top: 1px;">${item.subtitle}</div>
            ${includeCheckboxHtml}
          </td>
          <td style="min-height: 100px; vertical-align: top; padding: 10px 8px;">
            ${domainPortionHtml}
            <div style="font-size: 8.5pt; color: #000000; line-height: 1.45;">
              <strong>Evaluation Criteria:</strong> <span class="paper-coscholastic-criteria-display">${escapeHtml(getCoScholasticCriteriaText(cls, subjName))}</span>
            </div>
            <textarea
              class="sheet-coscholastic-criteria-input no-print"
              data-subject="${subjName}"
              rows="2"
              placeholder="Type this year's ${subjName} evaluation criteria here..."
            >${escapeHtml(getCoScholasticCriteriaText(cls, subjName))}</textarea>
          </td>
        </tr>
      `;
    });

    // 4. PART 4: Notebook Completion & Submission (Internal Assessment)
    const part4RowsHtml = buildPart4RowsHtml(cls, scholasticEntries);

    const instructionLines = [];
    if (partNumbers.scholastic) {
      instructionLines.push(`<li><strong>Part ${partNumbers.scholastic} (Scholastic Written Examinations):</strong> Pen-paper exams will be conducted on scheduled dates. Timely reporting is compulsory.</li>`);
    }
    if (partNumbers.sea) {
      instructionLines.push(`<li><strong>Part ${partNumbers.sea} (Subject Enrichment Activities - SEA):</strong> Mandatory 5-mark activities (ASL, Math Lab, Science Experiments, SST Map/Project) are assessed between ${formatDateRange(seaDateFrom, seaDateTo)} in regular subject periods.</li>`);
    }
    if (partNumbers.cosch) {
      instructionLines.push(`<li><strong>Part ${partNumbers.cosch} (Co-Scholastic Assessments):</strong> Co-scholastic domain evaluations are conducted between ${formatDateRange(coSchDateFrom, coSchDateTo)} during class periods.</li>`);
    }
    if (partNumbers.notebook) {
      instructionLines.push(`<li><strong>Part ${partNumbers.notebook} (Notebook Completion & Submission):</strong> Notebooks must be submitted to the respective subject teacher on the date specified against each subject; 5 marks are awarded per the evaluation criteria noted below.</li>`);
    }
    instructionLines.push(`<li><strong>Compulsory Attendance & Materials:</strong> Full-day attendance is compulsory. Students must carry complete practical files, journals, and stationery.</li>`);

    const instructionsHtml = includeInstructions ? `
      <div class="paper-instructions-box">
        <div class="paper-instructions-heading" style="text-decoration: none !important;">GENERAL INSTRUCTIONS:</div>
        <ol class="paper-instructions-list">
          ${instructionLines.join('\n          ')}
        </ol>
      </div>
    ` : '';

    const part1SectionHtml = partNumbers.scholastic ? `
      <!-- PART ${partNumbers.scholastic}: SCHOLASTIC SUBJECTS -->
      <div class="paper-part-section paper-part-section-scholastic">
        <div class="paper-part-banner paper-part-banner-scholastic">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="paper-part-badge paper-part-badge-scholastic">PART ${partNumbers.scholastic}</span>
            <span>SCHOLASTIC SUBJECTS (Written Pen-Paper Examination)</span>
          </div>
        </div>
        <div class="paper-part-meta-strip paper-part-meta-strip-3col">
          <div class="part-meta-cell"><strong>TIME ALLOWED:</strong> ${p1Time}</div>
          <div class="part-meta-cell"><strong>MAXIMUM MARKS:</strong> ${p1Marks} Marks</div>
          <div class="part-meta-cell"><strong>SCHOOL TIMINGS:</strong> (${p1TimingStart} – ${p1TimingEnd})</div>
        </div>
        <table class="paper-syllabus-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">S.No.</th>
              <th style="width: 145px;">Subject & Exam Date</th>
              <th>Prescribed Examination Portion & Detailed Topics</th>
            </tr>
          </thead>
          <tbody>
            ${part1RowsHtml}
          </tbody>
        </table>
      </div>
    ` : '';

    const part2SectionHtml = partNumbers.sea ? `
      <!-- PART ${partNumbers.sea}: SUBJECT ENRICHMENT ACTIVITIES (SEA) -->
      <div class="paper-part-section paper-part-section-sea">
        <div class="paper-part-banner paper-part-banner-sea">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="paper-part-badge paper-part-badge-sea">PART ${partNumbers.sea}</span>
            <span>SUBJECT ENRICHMENT ACTIVITIES (SEA — 5 MARKS INTERNAL ASSESSMENT)</span>
          </div>
        </div>
        <div class="paper-part-meta-strip paper-part-meta-strip-3col">
          <div class="part-meta-cell"><strong>MAXIMUM MARKS:</strong> ${p2Marks}</div>
          <div class="part-meta-cell"><strong>DATE:</strong> From: ${formatExamDate(seaDateFrom)} TO ${formatExamDate(seaDateTo)}</div>
          <div class="part-meta-cell"><strong>SCHOOL TIMINGS:</strong> (${p2TimingStart} – ${p2TimingEnd})</div>
        </div>
        <table class="paper-syllabus-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">S.No.</th>
              <th style="width: 145px;">Scholastic Subject</th>
              <th>Prescribed 5-Mark Enrichment Activities & Practical Rubrics</th>
            </tr>
          </thead>
          <tbody>
            ${part2RowsHtml}
          </tbody>
        </table>
      </div>
    ` : '';

    const part3SectionHtml = partNumbers.cosch ? `
      <!-- PART ${partNumbers.cosch}: CO-SCHOLASTIC ACTIVITIES -->
      <div class="paper-part-section paper-part-section-cosch">
        <div class="paper-part-banner paper-part-banner-cosch">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="paper-part-badge paper-part-badge-cosch">PART ${partNumbers.cosch}</span>
            <span>CO-SCHOLASTIC DOMAINS (Holistic Development &amp; Life Skills) (Graded on a 3-Point Scale)</span>
          </div>
        </div>
        <div class="paper-part-meta-strip paper-part-meta-strip-2col">
          <div class="part-meta-cell"><strong>DATE:</strong> From: ${formatExamDate(coSchDateFrom)} TO ${formatExamDate(coSchDateTo)}</div>
          <div class="part-meta-cell"><strong>SCHOOL TIMINGS:</strong> (${p3TimingStart} – ${p3TimingEnd})</div>
        </div>
        <table class="paper-syllabus-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">S.No.</th>
              <th style="width: 145px;">Co-Scholastic Domain</th>
              <th>Evaluation Criteria & Practical Portion</th>
            </tr>
          </thead>
          <tbody>
            ${part3RowsHtml}
          </tbody>
        </table>
      </div>
    ` : '';

    const part4SectionHtml = partNumbers.notebook ? `
      <!-- PART ${partNumbers.notebook}: NOTEBOOK COMPLETION & SUBMISSION -->
      <div class="paper-part-section">
        <div class="paper-part-banner">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="paper-part-badge">PART ${partNumbers.notebook}</span>
            <span>NOTEBOOK COMPLETION & SUBMISSION (INTERNAL ASSESSMENT)</span>
          </div>
        </div>
        <div class="paper-part-meta-strip" style="grid-template-columns: 1fr !important; text-align: left !important;">
          <div class="part-meta-cell" style="border-right: none !important;">
            <strong>Evaluation Criteria (5 Marks):</strong> Regularity &amp; Syllabus Completion (2) — all classwork/homework recorded regularly, entire prescribed syllabus completed, corrections done; Neatness, Upkeep &amp; Presentation (2) — notebook well-maintained, properly covered &amp; labelled, index page maintained, legible handwriting; Overall Discipline (1) — margins, date-wise entries, diagrams/tables neatly done.
          </div>
        </div>
        <table class="paper-syllabus-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">S.No.</th>
              <th>Subject</th>
              <th style="width: 190px; text-align: center;">Notebook Submission Date</th>
            </tr>
          </thead>
          <tbody>
            ${part4RowsHtml}
          </tbody>
        </table>
      </div>
    ` : '';

    syllabusSheetPaper.innerHTML = `
      <div class="syllabus-paper-header">
        <div class="paper-school-title">${school}</div>
        <div class="paper-doc-subtitle">EXAMINATION DATE SHEET & SYLLABUS</div>
        <div class="paper-session-tag">ACADEMIC SESSION ${session}</div>
      </div>

      <div class="paper-meta-table">
        <div class="paper-meta-cell"><strong>CLASS:</strong> ${cls}</div>
        <div class="paper-meta-cell"><strong>EXAMINATION:</strong> ${exam}</div>
      </div>

      ${instructionsHtml}

      ${part1SectionHtml}
      ${part2SectionHtml}
      ${part3SectionHtml}
      ${part4SectionHtml}

      <div class="paper-signatures-row">
        <div class="sig-block">
          <div class="sig-img-slot"></div>
          <div class="sig-line"></div>
          <div class="sig-title">Class Teacher</div>
        </div>
        <div class="sig-block">
          <div class="sig-img-slot"></div>
          <div class="sig-line"></div>
          <div class="sig-title">Head Mistress</div>
        </div>
        <div class="sig-block sig-principal-block">
          <div class="sig-img-slot">
            ${includePrincipalSig ? `<img src="${PRINCIPAL_SIGNATURE_BASE64}" class="principal-sig-img" alt="Principal Signature">` : ''}
          </div>
          <div class="sig-line"></div>
          <div class="sig-title">Principal</div>
        </div>
      </div>
    `;
    return;
  }

  // --------------------------------------------------------------------------
  // CASE B: CLASS 9-10 -> SCHOLASTIC TABLE + SEA + NOTEBOOK COMPLETION
  // (No Co-Scholastic part for these classes.)
  // --------------------------------------------------------------------------
  const partNumbers = getSheetPartNumbers(cls, false);

  let part1RowsHtml = '';
  let visibleRowIndex = 1;

  subjectEntries.forEach(([subjName, subjSyllabus], index) => {
    if (isSchoolExcludedSubject(subjName)) return;
    const checkedSet = getSubjectSelectionForSheet(cls, subjName);
    const { contentHtml, checkedCount } = renderSubjectPortionContent(subjName, subjSyllabus, checkedSet);

    const isIncluded = isSubjectIncludedInSheet(cls, subjName);
    const rowSno = isIncluded ? visibleRowIndex++ : '—';

    const subjDate = (sheetSubjectDates[cls] && sheetSubjectDates[cls][subjName]) ? sheetSubjectDates[cls][subjName] : '';
    const dateBadgeHtml = subjDate
      ? `<div class="paper-subj-date-badge"><span class="no-print">📅 </span><span class="paper-date-label">Date: </span>${formatExamDate(subjDate)}</div>`
      : `<div class="paper-subj-no-date no-print">📅 Set Exam Date</div>`;

    const hasContent = (contentHtml && contentHtml.trim().length > 0);
    const displayContent = (checkedCount === 0 && !hasContent)
      ? `<div style="font-style: italic; font-size: 9pt; color: #000000; padding: 2px 0;">Complete Prescribed Syllabus</div>`
      : contentHtml;

    const includeCheckboxHtml = `
      <div class="sheet-include-subject-wrapper no-print" style="margin-top: 6px;">
        <label class="sheet-subject-include-label ${!isIncluded ? 'is-excluded' : ''}" title="${isIncluded ? 'Uncheck to exclude from circular' : 'Check to include in circular'}">
          <input type="checkbox" class="sheet-subject-include-cb no-print" data-subject="${subjName}" ${isIncluded ? 'checked' : ''}>
          <span>Include in circular</span>
        </label>
      </div>
    `;

    const def = getExamDefaultDetails(cls, subjName, exam);
    let marksBadgeHtml = '';
    if (def) {
      if (def.marks > 0) {
        marksBadgeHtml = `<span class="subj-marks-badge">${def.marks} Marks</span>`;
      } else if (def.duration === 'No Unit Test') {
        marksBadgeHtml = `<span class="subj-marks-badge is-no-ut">No Unit Test</span>`;
      }
    }

    part1RowsHtml += `
      <tr class="paper-subject-row ${!isIncluded ? 'is-subject-excluded is-unselected' : ''}">
        <td class="paper-row-sno" style="text-align: center; font-weight: bold; font-size: 9pt; color: #000000; width: 32px;">${rowSno}</td>
        <td style="width: 140px; vertical-align: top;">
          <div class="paper-subj-title">${subjName} ${marksBadgeHtml}</div>
          <div class="paper-subj-date-container">
            <input type="date" class="sheet-subj-date-input no-print" data-subject="${subjName}" value="${subjDate}" title="Set Exam Date for ${subjName}">
            ${dateBadgeHtml}
          </div>
          <div class="paper-subj-actions no-print">
            <button type="button" class="btn-subj-quick btn-subj-all" data-subject="${subjName}" title="Select ${subjName}">All</button>
            <button type="button" class="btn-subj-quick btn-subj-clear" data-subject="${subjName}" title="Clear ${subjName}">Clear</button>
          </div>
          ${includeCheckboxHtml}
        </td>
        <td>
          ${displayContent}
        </td>
      </tr>
    `;
  });

  const part2RowsHtml = buildPart2RowsHtml(cls);
  const part4RowsHtml = buildPart4RowsHtml(cls, subjectEntries);

  const instructionLines = [];
  if (partNumbers.scholastic) {
    instructionLines.push(`<li><strong>Part ${partNumbers.scholastic} (Scholastic Written Examinations):</strong> Pen-paper exams will be conducted on scheduled dates. Timely reporting is compulsory.</li>`);
  }
  if (partNumbers.sea) {
    instructionLines.push(`<li><strong>Part ${partNumbers.sea} (Subject Enrichment Activities - SEA):</strong> Mandatory 5-mark activities (ASL, Math Lab, Science Experiments, SST Map/Project) are assessed between ${formatDateRange(seaDateFrom, seaDateTo)} in regular subject periods.</li>`);
  }
  if (partNumbers.notebook) {
    instructionLines.push(`<li><strong>Part ${partNumbers.notebook} (Notebook Completion & Submission):</strong> Notebooks must be submitted to the respective subject teacher on the date specified against each subject; 5 marks are awarded per the evaluation criteria noted below.</li>`);
  }
  instructionLines.push(`<li><strong>In-Depth Study Required:</strong> Do not rely solely on chapter-end exercises; read the entire chapter thoroughly for deep conceptual questions.</li>`);
  instructionLines.push(`<li><strong>Strict Attendance:</strong> No half-days are permitted, and absolutely no re-examinations will be conducted for absentees.</li>`);
  instructionLines.push(`<li><strong>Zero Tolerance (UFM):</strong> Any use of Unfair Means will result in the immediate cancellation of the exam and strict disciplinary action.</li>`);
  instructionLines.push(`<li><strong>Bring Own Stationery:</strong> Bring your own complete examination stationery (blue/black pens, pencils, geometry instruments). Lending or borrowing is strictly prohibited.</li>`);

  const instructionsHtml = includeInstructions ? `
    <div class="paper-instructions-box">
      <div class="paper-instructions-heading" style="text-decoration: none !important;">GENERAL INSTRUCTIONS FOR STUDENTS:</div>
      <ol class="paper-instructions-list">
        ${instructionLines.join('\n        ')}
      </ol>
    </div>
  ` : '';

  const part1SectionHtml = partNumbers.scholastic ? `
    <!-- PART ${partNumbers.scholastic}: SCHOLASTIC SUBJECTS -->
    <div class="paper-part-section paper-part-section-scholastic">
      <div class="paper-part-banner paper-part-banner-scholastic">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="paper-part-badge paper-part-badge-scholastic">PART ${partNumbers.scholastic}</span>
          <span>SCHOLASTIC SUBJECTS (Written Pen-Paper Examination)</span>
        </div>
      </div>
      <div class="paper-part-meta-strip paper-part-meta-strip-3col">
        <div class="part-meta-cell"><strong>TIME ALLOWED:</strong> ${duration}</div>
        <div class="part-meta-cell"><strong>MAXIMUM MARKS:</strong> ${marks}</div>
        <div class="part-meta-cell"><strong>SCHOOL TIMINGS:</strong> ${schoolTiming}</div>
      </div>
      <table class="paper-syllabus-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">S.No.</th>
            <th style="width: 145px;">Subject & Exam Date</th>
            <th>Prescribed Examination Portion & Chapter Breakdown</th>
          </tr>
        </thead>
        <tbody>
          ${part1RowsHtml}
        </tbody>
      </table>
    </div>
  ` : '';

  const part2SectionHtml = partNumbers.sea ? `
    <!-- PART ${partNumbers.sea}: SUBJECT ENRICHMENT ACTIVITIES (SEA) -->
    <div class="paper-part-section paper-part-section-sea">
      <div class="paper-part-banner paper-part-banner-sea">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="paper-part-badge paper-part-badge-sea">PART ${partNumbers.sea}</span>
          <span>SUBJECT ENRICHMENT ACTIVITIES (SEA — 5 MARKS INTERNAL ASSESSMENT)</span>
        </div>
      </div>
      <div class="paper-part-meta-strip paper-part-meta-strip-3col">
        <div class="part-meta-cell"><strong>MAXIMUM MARKS:</strong> ${p2Marks}</div>
        <div class="part-meta-cell"><strong>DATE:</strong> From: ${formatExamDate(seaDateFrom)} TO ${formatExamDate(seaDateTo)}</div>
        <div class="part-meta-cell"><strong>SCHOOL TIMINGS:</strong> (${p2TimingStart} – ${p2TimingEnd})</div>
      </div>
      <table class="paper-syllabus-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">S.No.</th>
            <th style="width: 145px;">Scholastic Subject</th>
            <th>Prescribed 5-Mark Enrichment Activities & Practical Rubrics</th>
          </tr>
        </thead>
        <tbody>
          ${part2RowsHtml}
        </tbody>
      </table>
    </div>
  ` : '';

  const part4SectionHtml = partNumbers.notebook ? `
    <!-- PART ${partNumbers.notebook}: NOTEBOOK COMPLETION & SUBMISSION -->
    <div class="paper-part-section">
      <div class="paper-part-banner">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="paper-part-badge">PART ${partNumbers.notebook}</span>
          <span>NOTEBOOK COMPLETION & SUBMISSION (INTERNAL ASSESSMENT)</span>
        </div>
      </div>
      <div class="paper-part-meta-strip" style="grid-template-columns: 1fr !important; text-align: left !important;">
        <div class="part-meta-cell" style="border-right: none !important;">
          <strong>Evaluation Criteria (5 Marks):</strong> Regularity &amp; Syllabus Completion (2) — all classwork/homework recorded regularly, entire prescribed syllabus completed, corrections done; Neatness, Upkeep &amp; Presentation (2) — notebook well-maintained, properly covered &amp; labelled, index page maintained, legible handwriting; Overall Discipline (1) — margins, date-wise entries, diagrams/tables neatly done.
        </div>
      </div>
      <table class="paper-syllabus-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">S.No.</th>
            <th>Subject</th>
            <th style="width: 190px; text-align: center;">Notebook Submission Date</th>
          </tr>
        </thead>
        <tbody>
          ${part4RowsHtml}
        </tbody>
      </table>
    </div>
  ` : '';

  syllabusSheetPaper.innerHTML = `
    <div class="syllabus-paper-header">
      <div class="paper-school-title">${school}</div>
      <div class="paper-doc-subtitle">EXAMINATION DATE SHEET & SYLLABUS</div>
      <div class="paper-session-tag">ACADEMIC SESSION ${session}</div>
    </div>

    <div class="paper-meta-table">
      <div class="paper-meta-cell"><strong>CLASS:</strong> ${cls}</div>
      <div class="paper-meta-cell"><strong>EXAMINATION:</strong> ${exam}</div>
    </div>

    ${instructionsHtml}

    ${part1SectionHtml}
    ${part2SectionHtml}
    ${part4SectionHtml}

    <div class="paper-signatures-row">
      <div class="sig-block">
        <div class="sig-img-slot"></div>
        <div class="sig-line"></div>
        <div class="sig-title">Class Teacher</div>
      </div>
      <div class="sig-block">
        <div class="sig-img-slot"></div>
        <div class="sig-line"></div>
        <div class="sig-title">Head Mistress</div>
      </div>
      <div class="sig-block sig-principal-block">
        <div class="sig-img-slot">
          ${includePrincipalSig ? `<img src="${PRINCIPAL_SIGNATURE_BASE64}" class="principal-sig-img" alt="Principal Signature">` : ''}
        </div>
        <div class="sig-line"></div>
        <div class="sig-title">Principal</div>
      </div>
    </div>
  `;
}

async function triggerPrintSyllabusSheet() {
  if (!syllabusSheetPaper) return;
  const stage = document.createElement('div');
  stage.id = 'print-sandbox-stage';
  stage.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; background: #ffffff; z-index: 999999; overflow: auto;';

  const clone = syllabusSheetPaper.cloneNode(true);
  clone.classList.add('is-pdf-exporting');
  clone.classList.add('hide-unselected');
  clone.style.cssText = 'width: 100% !important; max-width: 750px !important; margin: 0 auto !important; padding: 8px 12px !important; background: #ffffff !important; box-sizing: border-box !important; display: block !important;';

  // Strip all screen-only controls, buttons, checkboxes, and selectors from the print clone
  clone.querySelectorAll('.no-print, .portion-screen-selector, .sheet-topic-selector-grid, .paper-subj-actions, .sheet-ch-customizer').forEach(el => el.remove());

  // Clean up trailing commas on the clone for the last visible item in each inline flow
  clone.querySelectorAll('.paper-inline-chapter-flow, .paper-topic-list').forEach(container => {
    const visibleCommas = container.querySelectorAll('.is-selected .paper-item-comma');
    if (visibleCommas.length > 0) {
      visibleCommas[visibleCommas.length - 1].style.display = 'none';
    }
  });

  stage.appendChild(clone);
  document.body.appendChild(stage);

  await new Promise(resolve => setTimeout(resolve, 150));
  window.print();

  setTimeout(() => {
    stage.remove();
  }, 1000);
}

async function exportSyllabusSheetToPdf() {
  if (!syllabusSheetPaper) return;
  const school = (sheetSchoolName && sheetSchoolName.value) ? sheetSchoolName.value.trim() : 'GNPS';
  const cls = sheetClassSelect ? sheetClassSelect.value : 'Class';
  const exam = getSelectedSheetExamName();
  const cleanFileName = `${school.replace(/[^a-zA-Z0-9]/g, '_')}_${cls.replace(/[^a-zA-Z0-9]/g, '_')}_${exam.replace(/[^a-zA-Z0-9]/g, '_')}_Syllabus_Sheet.pdf`;

  if (typeof html2pdf !== 'undefined') {
    const origHtml = exportPdfSheetBtn.innerHTML;
    exportPdfSheetBtn.disabled = true;
    exportPdfSheetBtn.innerHTML = '<span>⏳ Generating PDF...</span>';

    // 1. Create a dedicated, clean top-level export stage directly on document.body
    // This eliminates ALL modal flexbox centering, scroll-wrapper offsets, and parent clipping!
    const stage = document.createElement('div');
    stage.id = 'pdf-render-stage';
    stage.style.cssText = 'position: fixed; left: 0; top: 0; width: 750px; min-width: 750px; max-width: 750px; margin: 0; padding: 0; background: #ffffff; z-index: 999999; overflow: visible;';

    // 2. Clone the syllabusSheetPaper
    const clone = syllabusSheetPaper.cloneNode(true);
    clone.classList.add('is-pdf-exporting');
    clone.classList.add('hide-unselected');
    clone.style.cssText = 'width: 750px !important; min-width: 750px !important; max-width: 750px !important; margin: 0 !important; padding: 8px 12px !important; background: #ffffff !important; box-sizing: border-box !important; display: block !important;';

    // Strip all screen-only controls, buttons, checkboxes, and selectors from the PDF clone
    clone.querySelectorAll('.no-print, .portion-screen-selector, .sheet-topic-selector-grid, .paper-subj-actions, .sheet-ch-customizer').forEach(el => el.remove());

    // Clean up trailing commas on the clone for the last visible item in each inline flow
    clone.querySelectorAll('.paper-inline-chapter-flow, .paper-topic-list').forEach(container => {
      const visibleCommas = container.querySelectorAll('.is-selected .paper-item-comma');
      if (visibleCommas.length > 0) {
        visibleCommas[visibleCommas.length - 1].style.display = 'none';
      }
    });

    // Remove all excluded subject rows from print output
    clone.querySelectorAll('tr.is-subject-excluded').forEach(r => r.remove());

    // Renumber remaining visible rows in each table strictly sequentially (1, 2, 3...)
    clone.querySelectorAll('.paper-syllabus-table').forEach(table => {
      let sno = 1;
      table.querySelectorAll('tbody tr.paper-subject-row').forEach(row => {
        const snoCell = row.querySelector('.paper-row-sno');
        if (snoCell) snoCell.textContent = sno++;
      });
    });

    // Remove any empty sections where all subject rows were excluded
    clone.querySelectorAll('.paper-part-section').forEach(section => {
      const remainingRows = section.querySelectorAll('tbody tr.paper-subject-row');
      if (remainingRows.length === 0) {
        section.remove();
      }
    });

    stage.appendChild(clone);
    document.body.appendChild(stage);

    // Give browser layout engine time to reflow into fixed 750px A4 layout
    await new Promise(resolve => setTimeout(resolve, 200));

    const opt = {
      margin: [5, 5, 5, 5],
      filename: cleanFileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: ['tr', '.paper-signatures-row', '.paper-instructions-box']
      }
    };

    try {
      await html2pdf().set(opt).from(clone).save();
    } catch (err) {
      console.error('html2pdf error, falling back to print:', err);
      triggerPrintSyllabusSheet();
    } finally {
      stage.remove();
      exportPdfSheetBtn.innerHTML = origHtml;
      exportPdfSheetBtn.disabled = false;
    }
  } else {
    triggerPrintSyllabusSheet();
  }
}

function exportSyllabusSheetToExcel() {
  if (!sheetClassSelect) return;
  const school = (sheetSchoolName && sheetSchoolName.value) ? sheetSchoolName.value.trim() : 'GOMTI NANDAN PUBLIC SCHOOL';
  const cls = sheetClassSelect.value;
  const isMiddleSchool = ['Class 6', 'Class 7', 'Class 8'].includes(cls);
  const exam = getSelectedSheetExamName();
  const marks = (sheetMaxMarks && sheetMaxMarks.value) ? sheetMaxMarks.value.trim() : '80 Marks';
  const duration = (sheetDuration && sheetDuration.value) ? sheetDuration.value.trim() : (isMiddleSchool ? '2.5 Hours' : '3 Hrs');
  const schoolTiming = (sheetSchoolTiming && sheetSchoolTiming.value) ? sheetSchoolTiming.value.trim() : '07:30 AM – 02:30 PM';
  const session = getCurrentAcademicSession();

  const subjectsData = getSheetSubjectsData(cls);
  const subjectEntries = Object.entries(subjectsData);

  // Sort subjects by exam date in ascending chronological order (earliest first)
  subjectEntries.sort(([subjA], [subjB]) => {
    const dateA = (sheetSubjectDates[cls] && sheetSubjectDates[cls][subjA]) ? sheetSubjectDates[cls][subjA].trim() : '';
    const dateB = (sheetSubjectDates[cls] && sheetSubjectDates[cls][subjB]) ? sheetSubjectDates[cls][subjB].trim() : '';
    if (dateA && dateB) {
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return 0;
    }
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    return 0;
  });

  const includeSubtopics = sheetIncludeSubtopics ? sheetIncludeSubtopics.checked : false;

  let csv = "\uFEFF"; // UTF-8 BOM
  csv += `"${school}"\n`;
  csv += `"EXAMINATION DATE SHEET & SYLLABUS - ACADEMIC SESSION ${session}"\n`;
  csv += `"Class:","${cls}","Examination:","${exam}","Time Allowed:","${duration}","Maximum Marks:","${marks}","School Timings:","${schoolTiming}"\n\n`;
  csv += includeSubtopics
    ? `"S.No","Exam Date","Subject","Section / Category","Chapter / Topic","Detailed Subtopics / Concepts"\n`
    : `"S.No","Exam Date","Subject","Section / Category","Chapter / Topic"\n`;

  let rowCount = 1;

  for (const [subjName, subjSyllabus] of subjectEntries) {
    if (!isSubjectIncludedInSheet(cls, subjName)) continue;
    if (/robotics/i.test(subjName) && !roboticsHasWrittenExam(exam)) continue;
    const checkedSet = getSubjectSelectionForSheet(cls, subjName);
    const subjDate = (sheetSubjectDates[cls] && sheetSubjectDates[cls][subjName]) ? formatExamDate(sheetSubjectDates[cls][subjName]) : '';
    const isBlankSubject = (subjName.toLowerCase().includes('general knowledge') || subjName.toLowerCase().includes('robotics')) && (!subjSyllabus || (Array.isArray(subjSyllabus) && subjSyllabus.length === 0) || (typeof subjSyllabus === 'object' && Object.keys(subjSyllabus).length === 0));

    if (isBlankSubject) {
      if (checkedSet && checkedSet.has('__included__')) {
        csv += includeSubtopics
          ? `"${rowCount++}","${subjDate}","${subjName}","Prescribed Portion","(Blank space for custom portion)",""\n`
          : `"${rowCount++}","${subjDate}","${subjName}","Prescribed Portion","(Blank space for custom portion)"\n`;
      }
      continue;
    }

    const isLang = /english|hindi|sanskrit|french|german|spanish|urdu/i.test(subjName);
    const isRobotics = subjName.toLowerCase().includes('robotics');
    const isKeysAreChapters = typeof subjSyllabus === 'object' && !Array.isArray(subjSyllabus) && Object.keys(subjSyllabus).some(k => /^(Chapter|Unit)\s*\d+/i.test(k));

    if (isRobotics) {
      let chaptersEntries = [];
      if (subjSyllabus && typeof subjSyllabus === 'object') {
        if (subjSyllabus['Theory (Chapters)'] && Array.isArray(subjSyllabus['Theory (Chapters)'])) {
          const theoryList = subjSyllabus['Theory (Chapters)'];
          const labList = subjSyllabus['Practical / Lab Examination Questions'] || [];
          chaptersEntries = theoryList.map((th, idx) => [th, labList[idx] ? [labList[idx]] : []]);
        } else {
          chaptersEntries = Object.entries(subjSyllabus);
        }
      }
      for (const [chKey, subList] of chaptersEntries) {
        const isChChecked = !!(checkedSet && checkedSet.has(chKey));
        const selectedLabs = (Array.isArray(subList) ? subList : []).filter(sub => checkedSet && (checkedSet.has(sub) || checkedSet.has(`${chKey} -> ${sub}`)));
        if (isChChecked || selectedLabs.length > 0) {
          const labText = selectedLabs.join('; ');
          csv += includeSubtopics
            ? `"${rowCount++}","${subjDate}","${subjName}","Theory & Practical","${chKey.replace(/"/g, '""')}","${labText.replace(/"/g, '""')}"\n`
            : `"${rowCount++}","${subjDate}","${subjName}","Theory & Practical","${chKey.replace(/"/g, '""')}"\n`;
        }
      }
      continue;
    }

    if (isKeysAreChapters && !isLang) {
      for (const [chKey, subList] of Object.entries(subjSyllabus)) {
        const isChecked = !!(checkedSet && (
          checkedSet.has(chKey) ||
          (Array.isArray(subList) && subList.some(sub => checkedSet.has(`${chKey} -> ${sub}`) || checkedSet.has(sub)))
        ));
        if (isChecked) {
          csv += includeSubtopics
            ? `"${rowCount++}","${subjDate}","${subjName}","Full Subject Syllabus","${chKey.replace(/"/g, '""')}",""\n`
            : `"${rowCount++}","${subjDate}","${subjName}","Full Subject Syllabus","${chKey.replace(/"/g, '""')}"\n`;
        }
      }
      continue;
    }

    if (Array.isArray(subjSyllabus)) {
      subjSyllabus.forEach(ch => {
        const title = typeof ch === 'string' ? ch : ch.name || String(ch);
        if (checkedSet && checkedSet.has(title)) {
          csv += includeSubtopics
            ? `"${rowCount++}","${subjDate}","${subjName}","Full Subject Syllabus","${title.replace(/"/g, '""')}",""\n`
            : `"${rowCount++}","${subjDate}","${subjName}","Full Subject Syllabus","${title.replace(/"/g, '""')}"\n`;
        }
      });
    } else if (typeof subjSyllabus === 'object' && subjSyllabus !== null) {
      for (const [secKey, secVal] of Object.entries(subjSyllabus)) {
        const isSkillSec = isLang && isLanguageSkillSection(secKey);

        if (Array.isArray(secVal)) {
          secVal.forEach(ch => {
            const title = typeof ch === 'string' ? ch : ch.name || String(ch);
            if (checkedSet && (checkedSet.has(title) || checkedSet.has(`${secKey}: ${title}`))) {
              csv += includeSubtopics
                ? `"${rowCount++}","${subjDate}","${subjName}","${secKey.replace(/"/g, '""')}","${title.replace(/"/g, '""')}",""\n`
                : `"${rowCount++}","${subjDate}","${subjName}","${secKey.replace(/"/g, '""')}","${title.replace(/"/g, '""')}"\n`;
            }
          });
        } else if (typeof secVal === 'object' && secVal !== null) {
          for (const [topName, subtopicsList] of Object.entries(secVal)) {
            let checkedSubs = [];
            if (checkedSet && Array.isArray(subtopicsList)) {
              checkedSubs = subtopicsList.filter(sub => {
                return checkedSet.has(`${topName} -> ${sub}`) || checkedSet.has(sub) || checkedSet.has(`${secKey}: ${sub}`);
              });
            }
            const isWritingSubGroup = /short writing|long writing|लघु लेखन|दीर्घ लेखन|लघु रचनात्मक|दीर्घ रचनात्मक/i.test(topName);
            const isParentChecked = !checkedSet || (checkedSet.has(topName) || checkedSet.has(`${secKey}: ${topName}`) || checkedSubs.length > 0);
            if (isParentChecked) {
              const effectiveTopics = checkedSubs.length > 0 ? checkedSubs : (Array.isArray(subtopicsList) ? subtopicsList : []);
              const subsStr = (isSkillSec && includeSubtopics)
                ? (checkedSubs.length > 0 ? checkedSubs.join('; ') : (Array.isArray(subtopicsList) ? subtopicsList.join('; ') : ''))
                : '';
              const chapterCol = (!includeSubtopics && isWritingSubGroup && effectiveTopics.length > 0)
                ? `${topName}: ${effectiveTopics.join(', ')}`
                : topName;
              csv += includeSubtopics
                ? `"${rowCount++}","${subjDate}","${subjName}","${secKey.replace(/"/g, '""')}","${chapterCol.replace(/"/g, '""')}","${subsStr.replace(/"/g, '""')}"\n`
                : `"${rowCount++}","${subjDate}","${subjName}","${secKey.replace(/"/g, '""')}","${chapterCol.replace(/"/g, '""')}"\n`;
            }
          }
        }
      }
    }
  }

  {
    const seaDateFrom = (sheetSEADateFrom && sheetSEADateFrom.value) ? sheetSEADateFrom.value : seaExamDateFrom;
    const seaDateTo = (sheetSEADateTo && sheetSEADateTo.value) ? sheetSEADateTo.value : seaExamDateTo;

    // Add Subject Enrichment Activities (mirrors Part 1's inclusion) - Class 6-10
    const seaList = (cbseSEAData[cls] || []).filter(item => isSubjectIncludedInSheet(cls, item.subject));
    seaList.forEach(item => {
      const seaSubjKey = `SEA: ${item.subject}`;
      const checkedSet = getSubjectSelectionForSheet(cls, seaSubjKey);
      if (checkedSet) {
        item.activities.forEach(act => {
          if (checkedSet.has(act)) {
            csv += includeSubtopics
              ? `"${rowCount++}","${formatDateRange(seaDateFrom, seaDateTo)}","${item.subject}","Subject Enrichment (SEA)","${act.replace(/"/g, '""')}","${getSEADomainText(item.subject).replace(/"/g, '""')}"\n`
              : `"${rowCount++}","${formatDateRange(seaDateFrom, seaDateTo)}","${item.subject}","Subject Enrichment (SEA)","${act.replace(/"/g, '""')}"\n`;
          }
        });
      }
    });
  }

  if (isMiddleSchool) {
    const coSchDateFrom = (sheetCoSchDateFrom && sheetCoSchDateFrom.value) ? sheetCoSchDateFrom.value : coSchExamDateFrom;
    const coSchDateTo = (sheetCoSchDateTo && sheetCoSchDateTo.value) ? sheetCoSchDateTo.value : coSchExamDateTo;

    // Add Co-Scholastic subjects (Class 6-8 only)
    ['Music', 'Art & Craft', 'Yoga'].forEach(subjName => {
      if (!isSubjectIncludedInSheet(cls, subjName)) return;
      const checkedSet = getSubjectSelectionForSheet(cls, subjName);
      if (checkedSet && (checkedSet.has('__included__') || checkedSet.has(subjName))) {
        const criteria = getCoScholasticCriteriaText(cls, subjName).replace(/"/g, '""');
        csv += includeSubtopics
          ? `"${rowCount++}","${formatDateRange(coSchDateFrom, coSchDateTo)}","${subjName}","Co-Scholastic Activities","${criteria}",""\n`
          : `"${rowCount++}","${formatDateRange(coSchDateFrom, coSchDateTo)}","${subjName}","Co-Scholastic Activities","${criteria}"\n`;
      }
    });
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${school.replace(/[^a-zA-Z0-9]/g, '_')}_${cls.replace(/[^a-zA-Z0-9]/g, '_')}_${exam.replace(/[^a-zA-Z0-9]/g, '_')}_Syllabus.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listeners for Student Syllabus Sheet
if (openSyllabusSheetBtn) {
  openSyllabusSheetBtn.addEventListener('click', openSyllabusSheetModal);
}
if (openSyllabusSheetFromCardBtn) {
  openSyllabusSheetFromCardBtn.addEventListener('click', openSyllabusSheetModal);
}
if (closeSyllabusSheetModalBtn) {
  closeSyllabusSheetModalBtn.addEventListener('click', closeSyllabusSheetModal);
}
if (sheetClassSelect) {
  sheetClassSelect.addEventListener('change', () => {
    const newCls = sheetClassSelect.value;
    if (sheetClassBadge) sheetClassBadge.textContent = newCls;

    // 1. Sync Class to Main Panel
    if (classSelect && classSelect.value !== newCls) {
      classSelect.value = newCls;
      classSelect.dispatchEvent(new Event('change'));
    }

    // 2. Fetch updated Exam Name List from Main Panel
    populateSheetExamDropdown(newCls);
    if (sheetCustomExamInput) sheetCustomExamInput.style.display = 'none';

    // 3. Synchronize all settings directly from Prompt Generation Module
    syncSyllabusSheetFromPromptModule();

    renderSyllabusSheetPaper();
  });
}

if (sheetExamSelect) {
  sheetExamSelect.addEventListener('change', () => {
    if (sheetExamSelect.value === 'custom') {
      if (sheetCustomExamInput) {
        sheetCustomExamInput.style.display = 'block';
        sheetCustomExamInput.focus();
      }
    } else {
      if (sheetCustomExamInput) {
        sheetCustomExamInput.style.display = 'none';
      }
      // Synchronize with main panel exam selection
      if (examNameSelect) {
        let matchingOpt = Array.from(examNameSelect.options).find(o => o.value === sheetExamSelect.value);
        if (!matchingOpt) {
          matchingOpt = Array.from(examNameSelect.options).find(o => matchExamOption(o.value, sheetExamSelect.value));
        }
        if (matchingOpt && examNameSelect.value !== matchingOpt.value) {
          examNameSelect.value = matchingOpt.value;
          updateExamDetails();
          updateExamBlueprint();
        }
      }
      syncSyllabusSheetFromPromptModule();
    }
    renderSyllabusSheetPaper();
  });
}

if (sheetCustomExamInput) {
  sheetCustomExamInput.addEventListener('input', renderSyllabusSheetPaper);
}

[sheetSchoolName, sheetMaxMarks, sheetDuration, sheetSchoolTiming].forEach(input => {
  if (input) {
    input.addEventListener('input', renderSyllabusSheetPaper);
  }
});
if (sheetIncludeInstructions) {
  sheetIncludeInstructions.addEventListener('change', renderSyllabusSheetPaper);
}
if (sheetIncludeSubtopics) {
  sheetIncludeSubtopics.addEventListener('change', renderSyllabusSheetPaper);
}
if (sheetIncludePrincipalSig) {
  sheetIncludePrincipalSig.addEventListener('change', renderSyllabusSheetPaper);
}

// Master per-Part toggles live in the persistent header ribbon (not inside
// syllabusSheetPaper), so they stay reachable even when the part they
// control is currently hidden - unlike a checkbox placed inside the part's
// own section, which would vanish along with it.
document.querySelectorAll('.sheet-part-include-cb').forEach(cb => {
  cb.addEventListener('change', () => handlePartInclusionChange(cb));
});

[sheetSEADateFrom, sheetSEADateTo, sheetCoSchDateFrom, sheetCoSchDateTo].forEach(input => {
  if (input) {
    input.addEventListener('change', renderSyllabusSheetPaper);
  }
});

[
  sheetPart1Time,
  sheetPart1Marks,
  sheetPart1TimingStart,
  sheetPart1TimingEnd,
  sheetPart2Marks,
  sheetPart2TimingStart,
  sheetPart2TimingEnd,
  sheetPart3TimingStart,
  sheetPart3TimingEnd
].forEach(input => {
  if (input) {
    input.addEventListener('input', renderSyllabusSheetPaper);
  }
});




// Inline checkbox and quick actions delegation on syllabusSheetPaper
if (syllabusSheetPaper) {
  syllabusSheetPaper.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('sheet-subject-include-cb')) {
      handleSubjectInclusionChange(e.target);
    }
    if (e.target && e.target.classList.contains('sheet-inline-cb')) {
      handleInlineCheckboxChange(e.target);
    }
    if (e.target && e.target.classList.contains('sheet-subj-date-input')) {
      handleSubjectDateChange(e.target);
    }
    if (e.target && e.target.classList.contains('sheet-notebook-date-input')) {
      handleNotebookDateChange(e.target);
    }
  });

  syllabusSheetPaper.addEventListener('click', (e) => {
    const allBtn = e.target.closest('.btn-subj-all');
    if (allBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleSubjectSelectAll(allBtn.dataset.subject);
      return;
    }
    const clearBtn = e.target.closest('.btn-subj-clear');
    if (clearBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleSubjectClearAll(clearBtn.dataset.subject);
      return;
    }
  });

  // Co-scholastic (Part 3) manual evaluation criteria: update state and the
  // paired print-visible display span directly, without a full re-render,
  // so the teacher doesn't lose focus/cursor position while typing.
  syllabusSheetPaper.addEventListener('input', (e) => {
    if (e.target && e.target.classList.contains('sheet-coscholastic-criteria-input')) {
      const subjName = e.target.dataset.subject;
      const cls = sheetClassSelect ? sheetClassSelect.value : '';
      setCoScholasticCriteriaText(cls, subjName, e.target.value);

      const row = e.target.closest('tr');
      const display = row ? row.querySelector('.paper-coscholastic-criteria-display') : null;
      if (display) display.textContent = e.target.value;

      // Auto-grow to fit the typed content
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }

    if (e.target && e.target.classList.contains('sheet-sea-manual-input')) {
      const subjName = e.target.dataset.subject;
      const cls = sheetClassSelect ? sheetClassSelect.value : '';
      setSEAManualNoteText(cls, subjName, e.target.value);

      const row = e.target.closest('tr');
      const display = row ? row.querySelector('.paper-sea-manual-display') : null;
      if (display) display.textContent = e.target.value;

      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  });
}



// Maximize / Fullscreen toggle
const maximizeSyllabusSheetModalBtn = document.getElementById('maximizeSyllabusSheetModalBtn');
if (maximizeSyllabusSheetModalBtn) {
  maximizeSyllabusSheetModalBtn.addEventListener('click', () => {
    const modalCard = document.querySelector('.syllabus-sheet-modal-card');
    if (modalCard) {
      modalCard.classList.toggle('is-maximized');
      const isMax = modalCard.classList.contains('is-maximized');
      maximizeSyllabusSheetModalBtn.textContent = isMax ? '❐' : '⛶';
      maximizeSyllabusSheetModalBtn.title = isMax ? 'Exit Fullscreen' : 'Toggle Fullscreen';
    }
  });
}
if (printSheetBtn) {
  printSheetBtn.addEventListener('click', triggerPrintSyllabusSheet);
}
if (exportPdfSheetBtn) {
  exportPdfSheetBtn.addEventListener('click', exportSyllabusSheetToPdf);
}
if (exportExcelSheetBtn) {
  exportExcelSheetBtn.addEventListener('click', exportSyllabusSheetToExcel);
}

// Close on backdrop click
if (syllabusSheetModal) {
  syllabusSheetModal.addEventListener('click', (e) => {
    if (e.target === syllabusSheetModal) closeSyllabusSheetModal();
  });
}

// ==========================================================================
// INSTITUTIONAL AUTHENTICATION & SUPER ADMIN MANAGEMENT SYSTEM
// ==========================================================================
// (safeAuthStorage / authToken are declared at the top of this file - see
// the comment there for why.)

let authCurrentUser = null;
let cachedAdminUsers = [];
let cachedAdminLogs = [];
let activeAdminTab = 'users';

const loginModal = document.getElementById('loginModal');
const loginAlertBox = document.getElementById('loginAlertBox');
const userProfilePill = document.getElementById('userProfilePill');
const headerUserAvatar = document.getElementById('headerUserAvatar');
const headerUserName = document.getElementById('headerUserName');
const headerUserRole = document.getElementById('headerUserRole');
const openAdminPanelBtn = document.getElementById('openAdminPanelBtn');
const adminControlModal = document.getElementById('adminControlModal');

function showLoginAlert(type, message) {
  if (!loginAlertBox) return;
  loginAlertBox.classList.remove('hidden', 'alert-error', 'alert-success', 'alert-withdrawn');
  loginAlertBox.classList.add(`alert-${type}`);
  loginAlertBox.innerHTML = message;
}

function clearLoginAlert() {
  if (loginAlertBox) {
    loginAlertBox.classList.add('hidden');
    loginAlertBox.innerHTML = '';
  }
}

function updateHeaderAuthUI() {
  if (authCurrentUser) {
    if (loginModal) loginModal.style.display = 'none';
    if (userProfilePill) userProfilePill.classList.remove('hidden');

    if (headerUserName) headerUserName.textContent = authCurrentUser.name || authCurrentUser.username;
    if (headerUserAvatar) headerUserAvatar.textContent = (authCurrentUser.name || authCurrentUser.username).charAt(0).toUpperCase();

    const isSuperAdmin = authCurrentUser.role === 'super_admin';
    if (headerUserRole) {
      headerUserRole.textContent = isSuperAdmin ? 'SUPER ADMIN' : 'FACULTY';
      headerUserRole.style.color = isSuperAdmin ? '#fbbf24' : '#38bdf8';
    }

    if (openAdminPanelBtn) {
      if (isSuperAdmin) {
        openAdminPanelBtn.classList.remove('hidden');
      } else {
        openAdminPanelBtn.classList.add('hidden');
      }
    }
  } else {
    if (loginModal) loginModal.style.display = 'flex';
    if (userProfilePill) userProfilePill.classList.add('hidden');
    if (openAdminPanelBtn) openAdminPanelBtn.classList.add('hidden');
  }
}

// 1. Initial Verification on Page Load
async function checkAuthSession() {
  if (!authToken) {
    updateHeaderAuthUI();
    return;
  }

  try {
    const res = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Auth-Token': authToken
      }
    });

    if (res.ok) {
      const data = await res.json();
      authCurrentUser = data.user;
      updateHeaderAuthUI();
    } else {
      authToken = '';
      safeAuthStorage.clearToken();
      authCurrentUser = null;
      updateHeaderAuthUI();
    }
  } catch (err) {
    console.warn('Auth session check network error:', err);
    updateHeaderAuthUI();
  }
}

// 2. Google Sign-In Callback
const GOOGLE_CLIENT_ID = '512204084471-3eimhonv10j2om186kvj07447320va4r.apps.googleusercontent.com';

async function handleGoogleCredentialResponse(response) {
  clearLoginAlert();
  try {
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      authToken = data.token;
      authCurrentUser = data.user;

      safeAuthStorage.setToken(authToken, true);
      loadCustomSubjects();

      showLoginAlert('success', `✅ Welcome back, <strong>${escapeHtml(data.user.name)}</strong>! Unlocking portal...`);
      setTimeout(() => {
        updateHeaderAuthUI();
        clearLoginAlert();
      }, 500);
    } else if (res.status === 429) {
      showLoginAlert('error', '⏳ ' + (data.error || 'Too many failed login attempts. Please wait 5 minutes.'));
    } else {
      showLoginAlert('error', data.error || '❌ Could not sign you in. Please use your official @mygnps.com Google account.');
    }
  } catch (err) {
    console.error('Login error:', err);
    showLoginAlert('error', '🔌 Network or server error. Please ensure the backend server is running.');
  }
}

function showGoogleSignInError(message) {
  const btnContainer = document.getElementById('googleSignInButton');
  if (btnContainer) {
    btnContainer.innerHTML = `<div style="color: #fca5a5; font-size: 0.78rem; text-align: center; padding: 8px 12px; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px; background: rgba(239, 68, 68, 0.1);">${message}</div>`;
  }
}

function initGoogleSignIn() {
  const btnContainer = document.getElementById('googleSignInButton');
  if (!btnContainer) return;

  if (typeof google === 'undefined' || !google.accounts?.id) {
    showGoogleSignInError('⚠️ Could not load Google Sign-In (accounts.google.com may be blocked on this network). Try refreshing, or a different network.');
    return;
  }

  try {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse
    });
    google.accounts.id.renderButton(btnContainer, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill'
    });

    // Google's script sometimes fails silently (no exception) when the
    // page's origin isn't registered in the OAuth Client ID's "Authorized
    // JavaScript origins" - in that case nothing gets rendered into the
    // container at all, so check for that after giving it a moment.
    setTimeout(() => {
      if (!btnContainer.hasChildNodes()) {
        showGoogleSignInError(`⚠️ Google Sign-In did not load. This usually means "${window.location.origin}" is not yet registered as an Authorized JavaScript origin for this Google OAuth Client ID.`);
      }
    }, 1500);
  } catch (err) {
    console.error('Google Sign-In render error:', err);
    showGoogleSignInError('⚠️ Google Sign-In failed to load. Please refresh the page. If this persists, the site\'s URL may not be registered with Google yet.');
  }
}

// 3. Logout Handler
async function handleAuthLogout() {
  if (authToken) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Auth-Token': authToken
        }
      });
    } catch (e) {
      console.warn('Logout notification error:', e);
    }
  }

  authToken = '';
  authCurrentUser = null;
  safeAuthStorage.clearToken();

  updateHeaderAuthUI();
  showLoginAlert('success', '👋 You have been securely signed out of GNPS Exam Architect.');
}

// ==========================================================================
// SUPER ADMIN MANAGEMENT CONSOLE
// ==========================================================================

function openAdminControlModal() {
  if (!authCurrentUser || authCurrentUser.role !== 'super_admin') {
    alert('Access restricted to Super Administrators only.');
    return;
  }
  if (adminControlModal) {
    adminControlModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    switchAdminTab('users');
  }
}

function closeAdminControlModal() {
  if (adminControlModal) {
    adminControlModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  const tabBtnUsers = document.getElementById('adminTabBtnUsers');
  const tabBtnLogs = document.getElementById('adminTabBtnLogs');
  const contentUsers = document.getElementById('adminTabContentUsers');
  const contentLogs = document.getElementById('adminTabContentLogs');

  if (tab === 'users') {
    if (tabBtnUsers) tabBtnUsers.classList.add('active');
    if (tabBtnLogs) tabBtnLogs.classList.remove('active');
    if (contentUsers) contentUsers.classList.remove('hidden');
    if (contentLogs) contentLogs.classList.add('hidden');
    loadAdminUsers();
  } else {
    if (tabBtnUsers) tabBtnUsers.classList.remove('active');
    if (tabBtnLogs) tabBtnLogs.classList.add('active');
    if (contentUsers) contentUsers.classList.add('hidden');
    if (contentLogs) contentLogs.classList.remove('hidden');
    loadAdminLogs();
  }
}

// 4. Load & Render Faculty Users
async function loadAdminUsers() {
  if (!authToken) return;
  try {
    const res = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Auth-Token': authToken
      }
    });

    if (res.ok) {
      const data = await res.json();
      cachedAdminUsers = data.users || [];
      renderAdminUsersTable(cachedAdminUsers);
      const countBadge = document.getElementById('adminUserCountBadge');
      if (countBadge) countBadge.textContent = cachedAdminUsers.length;
    } else if (res.status === 401 || res.status === 403) {
      alert('Session expired or unauthorized. Please re-login.');
      handleAuthLogout();
    }
  } catch (err) {
    console.error('Error fetching admin users:', err);
  }
}

function renderAdminUsersTable(usersList) {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  if (usersList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">No faculty accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = usersList.map(u => {
    const isSuperAdmin = u.role === 'super_admin';
    const isActive = u.status === 'active';

    return `
      <tr>
        <td style="font-weight: 700; color: #ffffff;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 24px; height: 24px; border-radius: 6px; background: ${isSuperAdmin ? '#f59e0b' : '#3b82f6'}; color: #000; font-size: 0.70rem; font-weight: 900; display: flex; align-items: center; justify-content: center;">
              ${escapeHtml((u.name || u.username).charAt(0).toUpperCase())}
            </span>
            <span>${escapeHtml(u.name)}</span>
          </div>
        </td>
        <td style="font-family: monospace; color: #94a3b8;">${escapeHtml(u.username)}</td>
        <td>
          <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; background: ${isSuperAdmin ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)'}; color: ${isSuperAdmin ? '#fde68a' : '#7dd3fc'}; border: 1px solid ${isSuperAdmin ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)'};">
            ${isSuperAdmin ? '👑 SUPER ADMIN' : '👨‍🏫 FACULTY'}
          </span>
        </td>
        <td>
          <span class="admin-perm-toggle-btn ${isActive ? 'admin-perm-active' : 'admin-perm-suspended'}" title="Managed in source code, not from this panel">
            <span>${isActive ? '🟢 PERMITTED' : '🔴 WITHDRAWN'}</span>
          </span>
        </td>
        <td style="color: #94a3b8; font-size: 0.72rem;">${escapeHtml(u.last_login || 'Never')}</td>
      </tr>
    `;
  }).join('');
}

// 9. Load & Render Security Audit Logs
async function loadAdminLogs() {
  if (!authToken) return;
  try {
    const res = await fetch('/api/admin/logs', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Auth-Token': authToken
      }
    });

    if (res.ok) {
      const data = await res.json();
      cachedAdminLogs = data.logs || [];
      filterAdminLogs();
      const countBadge = document.getElementById('adminLogCountBadge');
      if (countBadge) countBadge.textContent = cachedAdminLogs.length;
    }
  } catch (err) {
    console.error('Error fetching admin logs:', err);
  }
}

function renderAdminLogsTable(logsList) {
  const tbody = document.getElementById('adminLogsTableBody');
  if (!tbody) return;

  if (logsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">No matching audit logs found.</td></tr>`;
    return;
  }

  tbody.innerHTML = logsList.map(l => {
    let resultBadge = '';
    if (l.status === 'SUCCESS') {
      resultBadge = '<span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3);">🟢 SUCCESS</span>';
    } else if (l.status === 'WRONG_DOMAIN') {
      resultBadge = '<span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4);">⛔ NOT STAFF</span>';
    } else if (l.status === 'LOGOUT') {
      resultBadge = '<span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3);">🚪 LOGOUT</span>';
    } else if (l.status === 'BLOCKED_RATE_LIMIT') {
      resultBadge = '<span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; background: rgba(245, 158, 11, 0.15); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.3);">🚫 RATE LIMITED</span>';
    } else {
      resultBadge = '<span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; background: rgba(245, 158, 11, 0.15); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.3);">🔴 INVALID TOKEN</span>';
    }

    return `
      <tr>
        <td style="font-family: monospace; color: #cbd5e1; font-size: 0.72rem; white-space: nowrap;">${escapeHtml(l.timestamp)}</td>
        <td>
          <div style="font-weight: 700; color: #ffffff;">${escapeHtml(l.name || l.username)}</div>
          <div style="font-family: monospace; font-size: 0.65rem; color: #64748b;">@${escapeHtml(l.username)}</div>
        </td>
        <td>${resultBadge}</td>
        <td style="font-family: monospace; color: #38bdf8; font-size: 0.72rem;">${escapeHtml(l.ip)}</td>
        <td style="color: #e2e8f0; font-size: 0.72rem;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>💻</span> <span>${escapeHtml(l.device || 'Standard Client')}</span>
          </div>
        </td>
        <td style="color: #94a3b8; font-size: 0.72rem;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>📍</span> <span>${escapeHtml(l.location || 'Local School Network')}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminUsers(query = '') {
  const q = (query || '').toLowerCase().trim();
  const filtered = cachedAdminUsers.filter(u => 
    (u.name || '').toLowerCase().includes(q) ||
    (u.username || '').toLowerCase().includes(q)
  );
  renderAdminUsersTable(filtered);
}

function filterAdminLogs() {
  const searchInput = document.getElementById('adminLogSearchInput');
  const statusSelect = document.getElementById('adminLogStatusFilter');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const status = statusSelect ? statusSelect.value : 'ALL';

  const filtered = cachedAdminLogs.filter(l => {
    const matchStatus = status === 'ALL' || l.status === status;
    const matchQuery = !q || (
      (l.username || '').toLowerCase().includes(q) ||
      (l.name || '').toLowerCase().includes(q) ||
      (l.ip || '').toLowerCase().includes(q) ||
      (l.device || '').toLowerCase().includes(q) ||
      (l.location || '').toLowerCase().includes(q)
    );
    return matchStatus && matchQuery;
  });

  renderAdminLogsTable(filtered);
}

function exportAuditLogsToCSV() {
  if (!cachedAdminLogs || cachedAdminLogs.length === 0) {
    alert('No audit logs available to export.');
    return;
  }

  // Escapes a value for a CSV cell and neutralizes leading =,+,-,@ so spreadsheet
  // apps (Excel/Sheets) never interpret attacker-controlled log fields as formulas.
  const csvCell = (val) => {
    let s = String(val ?? '').replace(/"/g, '""');
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s}"`;
  };

  let csv = 'Timestamp (IST),Username,Full Name,Role,Login Result,IP Address,Device and Browser,Geographic Location\n';
  cachedAdminLogs.forEach(l => {
    csv += [
      csvCell(l.timestamp), csvCell(l.username), csvCell(l.name || l.username),
      csvCell(l.role || 'user'), csvCell(l.status), csvCell(l.ip),
      csvCell(l.device), csvCell(l.location)
    ].join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GNPS_Security_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function clearAuditLogs() {
  if (!confirm('Are you sure you want to clear all security audit logs? This action cannot be undone.')) return;
  if (!authToken) return;

  try {
    const res = await fetch('/api/admin/clear-logs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Auth-Token': authToken
      }
    });

    if (res.ok) {
      cachedAdminLogs = [];
      filterAdminLogs();
      const countBadge = document.getElementById('adminLogCountBadge');
      if (countBadge) countBadge.textContent = '0';
      alert('Security audit logs cleared successfully.');
    }
  } catch (err) {
    console.error('Clear logs error:', err);
  }
}

// Bind to window for HTML event handlers
window.handleAuthLogout = handleAuthLogout;
window.openAdminControlModal = openAdminControlModal;
window.closeAdminControlModal = closeAdminControlModal;
window.switchAdminTab = switchAdminTab;
window.filterAdminUsers = filterAdminUsers;
window.filterAdminLogs = filterAdminLogs;
window.exportAuditLogsToCSV = exportAuditLogsToCSV;
window.clearAuditLogs = clearAuditLogs;

// Close modals on backdrop click
if (adminControlModal) {
  adminControlModal.addEventListener('click', (e) => {
    if (e.target === adminControlModal) closeAdminControlModal();
  });
}

// Check session on page load
checkAuthSession();

// Render the "Sign in with Google" button once the GSI script has loaded
// (it's fetched with async/defer, so it may not be ready immediately).
// Once attempts run out, initGoogleSignIn() is still called so it can show
// a visible error instead of leaving the button silently blank.
(function waitForGoogleSignIn(attemptsLeft) {
  if ((typeof google !== 'undefined' && google.accounts?.id) || attemptsLeft <= 0) {
    initGoogleSignIn();
  } else {
    setTimeout(() => waitForGoogleSignIn(attemptsLeft - 1), 200);
  }
})(25);



