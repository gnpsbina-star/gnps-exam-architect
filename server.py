import os
import sys

# Ensure current working directory is always the folder where server.py is located
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import http.server
import socketserver
import urllib.parse
import urllib.request
import json
import ssl
import re
import io
from bs4 import BeautifulSoup
import pypdf
import auth_service

PORT = int(os.environ.get('PORT', 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_URL = "https://cbseacademic.nic.in/"

# Live, admin-editable custom subjects live on the persistent disk (DATA_DIR)
# so they survive redeploys/restarts, same as users.json/sessions.json in
# auth_service.py. CUSTOM_FILE_BASELINE is the git-tracked copy shipped with
# the repo, used only to seed a fresh DATA_DIR the first time.
DATA_DIR = os.environ.get("DATA_DIR", BASE_DIR)
os.makedirs(DATA_DIR, exist_ok=True)
CUSTOM_FILE_BASELINE = os.path.join(BASE_DIR, "custom_subjects.json")
CUSTOM_FILE = os.path.join(DATA_DIR, "custom_subjects.json")

def _seed_custom_subjects_if_missing():
    if not os.path.exists(CUSTOM_FILE) and os.path.exists(CUSTOM_FILE_BASELINE):
        try:
            with open(CUSTOM_FILE_BASELINE, 'r', encoding='utf-8') as f:
                baseline = f.read()
            with open(CUSTOM_FILE, 'w', encoding='utf-8') as f:
                f.write(baseline)
        except Exception as e:
            print(f"Error seeding {CUSTOM_FILE} from baseline: {e}")

_seed_custom_subjects_if_missing()

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Comprehensive mapping of official CBSE Subject Codes
CBSE_SUBJECT_CODES = {
    # Senior Secondary Academic
    "Accountancy": "055",
    "Applied Arts (Commercial Art)": "052",
    "Applied Mathematics": "241",
    "Arabic": "016",
    "Assamese": "014",
    "Bengali": "005",
    "Bharatanatyam": "056",
    "Bhoti": "025",
    "Bhutia": "026",
    "Biology": "044",
    "Biotechnology": "045",
    "Bio Technology": "045",
    "Bodo": "092",
    "Business Studies": "054",
    "Carnatic Melodic": "032",
    "Carnatic Percussion": "033",
    "Carnatic Vocal": "031",
    "Chemistry": "043",
    "Computer Science": "083",
    "Dance Manipuri": "058",
    "Dance Odissi": "059",
    "Economics": "030",
    "Engineering Graphics": "046",
    "Engg. Graphic": "046",
    "English Core": "301",
    "English Elective": "001",
    "Entrepreneurship": "066",
    "Fine Arts": "049",
    "French": "118",
    "Geography": "029",
    "German": "120",
    "Graphic": "050",
    "Gujarati": "010",
    "Hindi Core": "302",
    "Hindi Elective": "002",
    "Hindustani Music (Melodic)": "035",
    "Hindustani Melodic": "035",
    "Hindustani Music (Percussion)": "036",
    "Hindustani Percussion": "036",
    "Hindustani Music (Vocal)": "034",
    "Hindustani Vocal": "034",
    "History": "027",
    "Home Science": "064",
    "Informatics Practices": "065",
    "Infomatics Practices": "065",
    "Japanese": "194",
    "Kannada": "015",
    "Kashmiri": "097",
    "Kathak": "056",
    "Kathakali": "057",
    "Knowledge Tradition - Practices India": "073",
    "KTPI": "073",
    "Kuchipudi": "058",
    "Legal Studies": "074",
    "Lepcha": "026",
    "Limboo": "025",
    "Malayalam": "012",
    "Manipuri": "011",
    "Marathi": "009",
    "Mathematics": "041",
    "Mizo": "098",
    "National Cadet Corps (NCC)": "076",
    "NCC": "076",
    "Nepali": "024",
    "Kokborok": "091",
    "Odia": "013",
    "Painting": "049",
    "Persian": "023",
    "Physical Education": "048",
    "Physics": "042",
    "Political Science": "028",
    "Psychology": "037",
    "Punjabi": "004",
    "Russian": "021",
    "Sanskrit Core": "322",
    "Sanskrit Elective": "022",
    "Sculpture": "051",
    "Sindhi": "008",
    "Sociology": "039",
    "Spanish": "122",
    "Tamil": "006",
    "Tangkhul": "093",
    "Tangkhul (MIL)": "093",
    "Telugu (AP)": "007",
    "Telugu AP": "007",
    "Telugu (Telangana)": "089",
    "Telugu Telangana": "089",
    "Tibetan": "017",
    "Urdu Core": "303",
    "Urdu Elective": "003",

    # Secondary Academic
    "Science": "086",
    "Mathematics (Standard)": "041",
    "Mathematics Standard": "041",
    "Mathematics (Basic)": "241",
    "Mathematics Basic": "241",
    "Social Science": "087",
    "English (Language & Literature)": "184",
    "English - Language and Literature": "184",
    "English (Communicative)": "101",
    "English Communicative": "101",
    "Hindi A": "002",
    "Hindi Course A": "002",
    "Hindi Course-A": "002",
    "Hindi B": "085",
    "Hindi Course B": "085",
    "Hindi Course-B": "085",
    "Computer Application": "165",
    "Computer Applications": "165",
    "Sanskrit": "122",
    "Sanskrit Communicative": "119",
    "Elements of Business": "154",
    "Elements of Book Keeping and Accountancy": "254",
    "Urdu A": "003",
    "Urdu B": "303",

    # Skill Subjects (Secondary - 400 series)
    "Retail": "401",
    "Retailing": "401",
    "Information Technology": "402",
    "Information Tech": "402",
    "IT": "402",
    "Security": "403",
    "Automotive": "404",
    "Financial Markets": "405",
    "Introduction to Financial Markets": "405",
    "Tourism": "406",
    "Introduction to Tourism": "406",
    "Beauty & Wellness": "407",
    "Beauty and Wellness": "407",
    "Agriculture": "408",
    "Food Production": "409",
    "Front Office Operations": "410",
    "Banking & Insurance": "411",
    "Marketing & Sales": "412",
    "Health Care": "413",
    "Apparel": "414",
    "Media": "415",
    "Multimedia": "415",
    "Multi Media": "415",
    "Multi Skill Foundation Course": "416",
    "Artificial Intelligence": "417",
    "AI": "417",
    "Physical Activity Trainer": "418",
    "Data Science": "419",
    "Electronics & Hardware": "420",
    "Design Thinking & Innovation": "422",

    # Skill Subjects (Senior Secondary - 800 series)
    "Retail (801)": "801",
    "Information Technology (802)": "802",
    "Web Application": "803",
    "Automotive (804)": "804",
    "Financial Markets Management": "805",
    "Tourism (806)": "806",
    "Beauty & Wellness (807)": "807",
    "Agriculture (808)": "808",
    "Food Production (809)": "809",
    "Front Office Operations (810)": "810",
    "Banking": "811",
    "Marketing": "812",
    "Health Care (813)": "813",
    "Insurance": "814",
    "Horticulture": "816",
    "Typography & Computer Applications": "817",
    "Geospatial Technology": "818",
    "Electrical Technology": "819",
    "Electronics Technology": "820",
    "Media (821)": "821",
    "Taxation": "822",
    "Cost Accounting": "823",
    "Office Procedures & Practices": "824",
    "Shorthand (English)": "825",
    "Shorthand (Hindi)": "826",
    "Air-Conditioning & Refrigeration": "827",
    "Medical Diagnostics": "828",
    "Textile Design": "829",
    "Design": "830",
    "Salesmanship": "831",
    "Business Administration": "833",
    "Food Nutrition & Dietetics": "834",
    "Mass Media Studies": "835",
    "Library & Information Science": "836",
    "Fashion Studies": "837",
    "Yoga": "841",
    "Early Childhood Care & Education": "842",
    "ECCE": "842",
    "Artificial Intelligence (843)": "843",
    "Data Science (844)": "844",
    "Physical Activity Trainer (845)": "845",
    "Electronics & Hardware (847)": "847",
    "Design Thinking & Innovation (848)": "848"
}

SKILL_TITLES_CLASS_X = [
    ("Retail", "401"),
    ("Information Technology", "402"),
    ("Security", "403"),
    ("Automotive", "404"),
    ("Introduction to Financial Markets", "405"),
    ("Introduction to Tourism", "406"),
    ("Beauty & Wellness", "407"),
    ("Agriculture", "408"),
    ("Food Production", "409"),
    ("Front Office Operations", "410"),
    ("Banking & Insurance", "411"),
    ("Marketing & Sales", "412"),
    ("Health Care", "413"),
    ("Apparel", "414"),
    ("Multi Media", "415"),
    ("Multi Skill Foundation Course", "416"),
    ("Artificial Intelligence", "417"),
    ("Physical Activity Trainer", "418"),
    ("Data Science", "419"),
    ("Electronics & Hardware", "420"),
    ("Biotechnology (Skill)", "421"),
    ("Design Thinking & Innovation", "422")
]

SKILL_TITLES_CLASS_XII = [
    ("Retail", "801"),
    ("Information Technology", "802"),
    ("Web Application", "803"),
    ("Automotive", "804"),
    ("Financial Markets Management", "805"),
    ("Tourism", "806"),
    ("Beauty & Wellness", "807"),
    ("Agriculture", "808"),
    ("Food Production", "809"),
    ("Front Office Operations", "810"),
    ("Banking", "811"),
    ("Marketing", "812"),
    ("Health Care", "813"),
    ("Insurance", "814"),
    ("Horticulture", "816"),
    ("Typography & Computer Applications", "817"),
    ("Geospatial Technology", "818"),
    ("Electrical Technology", "819"),
    ("Electronics Technology", "820"),
    ("Media / Multimedia", "821"),
    ("Taxation", "822"),
    ("Cost Accounting", "823"),
    ("Office Procedures & Practices", "824"),
    ("Shorthand (English)", "825"),
    ("Shorthand (Hindi)", "826"),
    ("Air-Conditioning & Refrigeration", "827"),
    ("Medical Diagnostics", "828"),
    ("Textile Design", "829"),
    ("Design", "830"),
    ("Salesmanship", "831"),
    ("Business Administration", "833"),
    ("Food Nutrition & Dietetics", "834"),
    ("Mass Media Studies", "835"),
    ("Library & Information Science", "836"),
    ("Fashion Studies", "837"),
    ("Yoga", "841"),
    ("Early Childhood Care & Education", "842"),
    ("Artificial Intelligence (Skill)", "843"),
    ("Data Science (Skill)", "844"),
    ("Physical Activity Trainer (Skill)", "845"),
    ("Electronics & Hardware (Skill)", "847"),
    ("Design Thinking & Innovation (Skill)", "848")
]

ROMAN_TO_INT = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
    'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15
}

def get_custom_data():
    if os.path.exists(CUSTOM_FILE):
        try:
            with open(CUSTOM_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_custom_data(data):
    temp_path = f"{CUSTOM_FILE}.tmp.{os.getpid()}"
    with open(temp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(temp_path, CUSTOM_FILE)

# From 2026-27, Class 10 Mathematics is two subjects, Standard (041) and Basic
# (241), each with its own CBSE sample paper. The live copy on DATA_DIR was
# seeded before that split, so it still holds a single "Mathematics" that would
# reappear in the dropdown. Both papers use the same NCERT syllabus, so the old
# entry (including any admin edits to it) becomes the chapter list of both.
def _split_class10_maths():
    data = get_custom_data()
    class10 = data.get("Class 10")
    if not isinstance(class10, dict) or "Mathematics" not in class10:
        return
    migrated = {}
    for subj, chapters in class10.items():
        if subj == "Mathematics":
            migrated.setdefault("Mathematics (Standard)", chapters)
            migrated.setdefault("Mathematics (Basic)", chapters)
        elif subj not in migrated:
            migrated[subj] = chapters
    data["Class 10"] = migrated
    try:
        save_custom_data(data)
    except Exception as e:
        print(f"Error splitting Class 10 Mathematics in {CUSTOM_FILE}: {e}")

_split_class10_maths()

# Subjects whose chapter lists were rewritten from a CBSE curriculum document.
# The live copy on DATA_DIR keeps whatever it was seeded with, and it overrides
# data.js in the browser, so each rewrite is copied across from the shipped
# baseline once. The applied update ids are recorded beside it so a later admin
# edit to the same subject is never overwritten again.
CURRICULUM_UPDATES = [
    ("2026-27-maths", [("Class 9", "Mathematics"),
                       ("Class 10", "Mathematics (Standard)"),
                       ("Class 10", "Mathematics (Basic)")]),
    ("2026-27-science", [("Class 9", "Science"), ("Class 9", "Science (Physics)"),
                         ("Class 9", "Science (Chemistry)"), ("Class 9", "Science (Biology)"),
                         ("Class 10", "Science"), ("Class 10", "Science (Physics)")]),
    ("2026-27-social-science", [("Class 10", "Social Science")]),
    ("2026-27-english", [("Class 9", "English (R1)")]),
]
CURRICULUM_UPDATES_FILE = os.path.join(DATA_DIR, "curriculum_updates_applied.json")

def _apply_curriculum_updates():
    if os.path.abspath(CUSTOM_FILE) == os.path.abspath(CUSTOM_FILE_BASELINE):
        return
    try:
        with open(CURRICULUM_UPDATES_FILE, 'r', encoding='utf-8') as f:
            applied = set(json.load(f))
    except Exception:
        applied = set()
    pending = [(uid, subjects) for uid, subjects in CURRICULUM_UPDATES if uid not in applied]
    if not pending:
        return
    try:
        with open(CUSTOM_FILE_BASELINE, 'r', encoding='utf-8') as f:
            baseline = json.load(f)
        data = get_custom_data()
        for uid, subjects in pending:
            for cls, subj in subjects:
                if subj in baseline.get(cls, {}):
                    data.setdefault(cls, {})[subj] = baseline[cls][subj]
            applied.add(uid)
        save_custom_data(data)
        with open(CURRICULUM_UPDATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(sorted(applied), f)
    except Exception as e:
        print(f"Error applying curriculum updates to {CUSTOM_FILE}: {e}")

_apply_curriculum_updates()

def fetch_cbse_subjects_list(cls):
    is_senior = cls in ['Class 11', 'Class 12']
    is_middle = cls in ['Class 6', 'Class 7', 'Class 8']
    page = 'SQP_CLASSXII_2025-26.html' if is_senior else 'SQP_CLASSX_2025-26.html'
    
    subjects = []
    seen = set()
    
    # 1. Middle School Defaults
    if is_middle:
        middle_defaults = [
            ("Science", "086"), ("Mathematics", "041"), ("Social Science", "087"),
            ("English", "184"), ("Hindi", "002"), ("Sanskrit", "122"),
            ("French", "018"), ("German", "020"), ("Spanish", "022"),
            ("Computer Science / Coding", "165"),
            ("Artificial Intelligence & Computational Thinking", "417"),
            ("General Knowledge", "090"), ("Urdu", "003"), ("Punjabi", "004"),
            ("Music", "034"), ("Painting / Visual Arts", "049")
        ]
        for name, code in middle_defaults:
            display_name = f"{name} ({code})"
            seen.add(display_name.lower())
            seen.add(name.lower())
            subjects.append({"name": name, "code": code, "displayName": display_name})

    # 2. Add All Official CBSE_SUBJECT_CODES by Class Level
    for sub_name, code in CBSE_SUBJECT_CODES.items():
        # Filter senior vs secondary based on code heuristics
        code_int = int(code) if code.isdigit() else 0
        if is_senior:
            # Senior secondary subjects (001-084, 300 series, 500 series, 800 series)
            if code_int >= 800 or (300 <= code_int < 400) or (code_int in [27, 28, 29, 30, 37, 39, 41, 42, 43, 44, 45, 48, 49, 54, 55, 65, 83, 74]):
                display_name = f"{sub_name} ({code})" if code and not f"({code})" in sub_name else sub_name
                if display_name.lower() not in seen and sub_name.lower() not in seen:
                    seen.add(display_name.lower())
                    seen.add(sub_name.lower())
                    subjects.append({"name": sub_name, "code": code, "displayName": display_name})
        elif not is_middle:
            # Secondary (Class 9 & 10) (002-241, 400 series)
            if (400 <= code_int < 500) or code_int in [2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 41, 85, 86, 87, 89, 90, 94, 101, 119, 122, 154, 165, 184, 241, 254]:
                display_name = f"{sub_name} ({code})" if code and not f"({code})" in sub_name else sub_name
                if display_name.lower() not in seen and sub_name.lower() not in seen:
                    seen.add(display_name.lower())
                    seen.add(sub_name.lower())
                    subjects.append({"name": sub_name, "code": code, "displayName": display_name})

    # 3. Main Academic SQP Page (Live Web Extraction)
    try:
        req = urllib.request.Request(BASE_URL + page, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=4).read()
        soup = BeautifulSoup(html, 'html.parser')
        
        for tr in soup.find_all('tr'):
            tds = tr.find_all('td')
            if len(tds) >= 3:
                raw_name = tds[0].text.strip()
                if not raw_name or 'subject' in raw_name.lower() or 'sample question' in raw_name.lower():
                    continue
                
                clean_name = raw_name.split('\n')[0].strip()
                bracket_match = re.search(r'\(([^)]+)\)', clean_name)
                code = ""
                if bracket_match and bracket_match.group(1).isdigit():
                    code = bracket_match.group(1)
                else:
                    code = CBSE_SUBJECT_CODES.get(clean_name, '')
                    if not code:
                        for k, v in CBSE_SUBJECT_CODES.items():
                            if k.lower() == clean_name.lower() or k.lower() in clean_name.lower():
                                code = v
                                break
                                
                display_name = f"{clean_name} ({code})" if code and not f"({code})" in clean_name else clean_name
                if display_name.lower() not in seen and clean_name.lower() not in seen:
                    seen.add(display_name.lower())
                    seen.add(clean_name.lower())
                    subjects.append({
                        "name": clean_name,
                        "code": code,
                        "displayName": display_name
                    })
    except Exception as e:
        print(f"Error fetching CBSE academic subjects from live site: {e}")

    # 4. Add All Skill & Vocational Courses
    skill_list = SKILL_TITLES_CLASS_XII if is_senior else SKILL_TITLES_CLASS_X
    for name, code in skill_list:
        display_name = f"{name} ({code})"
        if display_name.lower() not in seen and name.lower() not in seen:
            seen.add(display_name.lower())
            seen.add(name.lower())
            subjects.append({
                "name": name,
                "code": code,
                "displayName": display_name
            })
        
    return sorted(subjects, key=lambda s: s['displayName'].lower())

def fetch_syllabus_from_cbse(cls, subject_name):
    clean_sub = re.sub(r'\s*\([0-9]+\)\s*', '', subject_name).strip().lower()
    is_senior = cls in ['Class 11', 'Class 12']

    alias_map = {
        'mathematics standard': 'mathematics',
        'mathematics basic': 'mathematics',
        'maths': 'mathematics',
        'math': 'mathematics',
        'english language and literature': 'english (r1)',
        'english language & literature': 'english (r1)',
        'english': 'english (r1)',
        'english (r1)': 'english (r1)',
        'english r1': 'english (r1)',
        'english (r1 - kaveri)': 'english (r1)',
        'english r1 - kaveri': 'english (r1)',
        'english r1 kaveri': 'english (r1)',
        'english kaveri': 'english (r1)',
        'english (kaveri)': 'english (r1)',
        'kaveri': 'english (r1)',
        'english (r2)': 'english (r2)',
        'english r2': 'english (r2)',
        'english communicative': 'english (r2)',
        'hindi course-a': 'hindi (r1)',
        'hindi course a': 'hindi (r1)',
        'hindi a': 'hindi (r1)',
        'hindi (r1)': 'hindi (r1)',
        'hindi r1': 'hindi (r1)',
        'hindi': 'hindi (r1)',
        'hindi course-b': 'hindi (r2 - ganga)',
        'hindi course b': 'hindi (r2 - ganga)',
        'hindi b': 'hindi (r2 - ganga)',
        'hindi (r2)': 'hindi (r2 - ganga)',
        'hindi r2': 'hindi (r2 - ganga)',
        'hindi (r2 - ganga)': 'hindi (r2 - ganga)',
        'hindi r2 - ganga': 'hindi (r2 - ganga)',
        'hindi r2 ganga': 'hindi (r2 - ganga)',
        'hindi - ganga': 'hindi (r2 - ganga)',
        'hindi ganga': 'hindi (r2 - ganga)',
        'ganga': 'hindi (r2 - ganga)',
        'sanskrit': 'sanskrit (r3)',
        'sanskrit (r3)': 'sanskrit (r3)',
        'sanskrit r3': 'sanskrit (r3)',
        'social studies': 'social science',
        'sst': 'social science'
    }
    normalized_query = alias_map.get(clean_sub, clean_sub)

    # 1. Load custom_subjects.json verified rationalized NCERT/CBSE curriculum first
    try:
        custom_data = get_custom_data()
        if cls in custom_data:
            # Exact or normalized match check
            for s, syl in custom_data[cls].items():
                s_clean = re.sub(r'\s*\([0-9]+\)\s*', '', s).strip().lower()
                s_norm = alias_map.get(s_clean, s_clean)
                if s_clean == clean_sub or s_norm == normalized_query:
                    return syl
            # Cleaned string match
            for s, syl in custom_data[cls].items():
                s_clean = re.sub(r'\s*\([0-9]+\)\s*', '', s).strip().lower()
                if s_clean.replace(' ', '') == clean_sub.replace(' ', ''):
                    return syl
    except Exception as e:
        print(f"Error loading from custom_subjects.json: {e}")

    # 2. Load data.js verified rationalized curriculum
    try:
        data_js_path = os.path.join(BASE_DIR, 'data.js')
        if os.path.exists(data_js_path):
            with open(data_js_path, 'r', encoding='utf-8') as df:
                dj_text = df.read()
            dj_cleaned = re.sub(r'^\s*export\s+const\s+cbseData\s*=\s*', '', dj_text)
            dj_cleaned = re.sub(r';\s*$', '', dj_cleaned.strip())
            live_cbse_data = json.loads(dj_cleaned)
            
            if cls in live_cbse_data:
                for s, syl in live_cbse_data[cls].items():
                    s_clean = re.sub(r'\s*\([0-9]+\)\s*', '', s).strip().lower()
                    s_norm = alias_map.get(s_clean, s_clean)
                    if s_clean == clean_sub or s_norm == normalized_query or s_clean.replace(' ', '') == clean_sub.replace(' ', ''):
                        return syl
    except Exception as e:
        print(f"Error loading from data.js: {e}")

    # 2. Check if it is a Skill Education subject (400 / 800 series)
    is_skill = any(k in clean_sub for k in ['retail', 'information tech', 'it', 'web app', 'auto', 'financial market', 'tourism', 'beauty', 'agriculture', 'food product', 'front office', 'banking', 'marketing', 'health', 'insurance', 'horticulture', 'typography', 'geospatial', 'electrical', 'electronic', 'media', 'taxation', 'cost account', 'office proc', 'shorthand', 'refrigeration', 'medical', 'textile', 'design', 'salesmanship', 'business admin', 'fashion', 'yoga', 'ecce', 'artificial intel', 'ai', 'data science', 'physical activity', 'security', 'apparel', 'multi skill'])
    
    raw_pdf_text = ""
    # 3. Search CBSE Curriculum Pages
    for page in ['curriculum_2026.html', 'curriculum_2027.html', 'curriculum_2025.html']:
        try:
            req = urllib.request.Request(BASE_URL + page, headers={'User-Agent': 'Mozilla/5.0'})
            html = urllib.request.urlopen(req, context=ctx).read()
            soup = BeautifulSoup(html, 'html.parser')
            
            target_link = None
            for a in soup.find_all('a'):
                href = a.get('href', '')
                text = a.text.strip().lower()
                if 'pdf' in href.lower() and text:
                    if clean_sub == text or clean_sub == text.replace(' ', ''):
                        target_link = href
                        break
                        
            if not target_link:
                for a in soup.find_all('a'):
                    href = a.get('href', '')
                    text = a.text.strip().lower()
                    if 'pdf' in href.lower() and text:
                        if (clean_sub in text or text in clean_sub) and not ('social' in clean_sub and 'social' not in text):
                            target_link = href
                            break

            if target_link:
                url = BASE_URL + target_link if not target_link.startswith('http') else target_link
                req_pdf = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                pdf_bytes = urllib.request.urlopen(req_pdf, context=ctx).read()
                reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                
                start_page = 0
                target_marker = 'CLASS XII' if cls == 'Class 12' else ('CLASS X' if cls == 'Class 10' else ('CLASS XI' if cls == 'Class 11' else 'CLASS IX'))
                
                for p_idx, p in enumerate(reader.pages):
                    p_txt = p.extract_text()
                    if target_marker in p_txt.upper() or f"CLASS - {target_marker.split()[-1]}" in p_txt.upper():
                        start_page = p_idx
                        break
                        
                for i in range(start_page, min(start_page + 10, len(reader.pages))):
                    raw_pdf_text += reader.pages[i].extract_text() + "\n"
                break
        except Exception as e:
            print(f"Curriculum syllabus fetch error: {e}")
            
    # Try Skill SQP PDF if needed
    if not raw_pdf_text and is_skill:
        try:
            target_folder = 'XII' if is_senior else 'X'
            req_skill = urllib.request.Request(BASE_URL + 'skill-education-sqp.html', headers={'User-Agent': 'Mozilla/5.0'})
            html_skill = urllib.request.urlopen(req_skill, context=ctx).read()
            soup_skill = BeautifulSoup(html_skill, 'html.parser')
            for a in soup_skill.find_all('a'):
                href = a.get('href', '')
                if f'SQP_MS_{target_folder}' in href and 'sqp.pdf' in href.lower():
                    clean_href = href.lower().replace('_', ' ')
                    clean_tokens = [t for t in clean_sub.split() if len(t) > 2]
                    if clean_tokens and all(t in clean_href for t in clean_tokens):
                        url = BASE_URL + href if not href.startswith('http') else href
                        req_pdf = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                        pdf_bytes = urllib.request.urlopen(req_pdf, context=ctx).read()
                        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                        for i in range(min(6, len(reader.pages))):
                            raw_pdf_text += reader.pages[i].extract_text() + "\n"
                        break
        except Exception as e:
            print(f"Skill SQP syllabus fetch error: {e}")

    if raw_pdf_text:
        lines = raw_pdf_text.split('\n')
        
        if is_skill:
            part_a = [
                "Unit 1: Communication Skills",
                "Unit 2: Self-Management Skills",
                "Unit 3: Information and Communication Technology (ICT) Skills",
                "Unit 4: Entrepreneurial Skills",
                "Unit 5: Green Skills"
            ]
            part_b = []
            seen_b = set()
            
            unit_pattern = re.compile(r'^(?:Unit|Chapter)\s*[-–:]*\s*([IVX0-9]+)[\s:–-]+([^\n\r]+)', re.I)
            for line in lines:
                l = line.strip()
                if any(k in l.lower() for k in ['communication skills', 'self-management', 'ict skills', 'entrepreneurial', 'green skills', 'total', 'hours', 'marks', 'weightage']):
                    continue
                m = unit_pattern.match(l)
                if m:
                    num_raw = m.group(1).upper()
                    num_val = ROMAN_TO_INT.get(num_raw, num_raw)
                    title = re.sub(r'[\._\-\–\:\d\s]+$', '', m.group(2)).strip()
                    title = re.sub(r'\s+', ' ', title)
                    if len(title) > 3 and not title.lower().startswith('name') and not title.lower().startswith('topic'):
                        cleaned_title = f"Unit {num_val}: {title}"
                        if cleaned_title.lower() not in seen_b:
                            seen_b.add(cleaned_title.lower())
                            part_b.append(cleaned_title)
                            
            if not part_b:
                part_b = [
                    f"Unit 1: Introduction to {subject_name}",
                    f"Unit 2: Core Subject Specific Skills",
                    f"Unit 3: Advanced Practical Tools & Applications",
                    f"Unit 4: Industry Workflows & Project Implementation"
                ]
                
            return {
                "Part A: Employability Skills": part_a,
                "Part B: Subject Specific Skills": part_b
            }
            
        else:
            units = []
            seen_units = set()
            unit_pattern = re.compile(r'^(?:Unit|Chapter)\s*[-–:]*\s*([IVX0-9]+)[\s:–-]+([^\n\r]+)', re.I)
            for line in lines:
                l = line.strip()
                if any(k in l.lower() for k in ['total', 'hours', 'periods', 'weightage', 'grand total', 'internal assessment', 'question paper design', 'unit name']):
                    continue
                m = unit_pattern.match(l)
                if m:
                    num_raw = m.group(1).upper()
                    num_val = ROMAN_TO_INT.get(num_raw, num_raw)
                    title = re.sub(r'[\._\-\–\:\d\s]+$', '', m.group(2)).strip()
                    title = re.sub(r'\s+', ' ', title)
                    if len(title) > 3 and not title.lower().startswith('name') and not title.lower().startswith('topic'):
                        cleaned_title = f"Unit {num_val}: {title}"
                        if cleaned_title.lower() not in seen_units:
                            seen_units.add(cleaned_title.lower())
                            units.append(cleaned_title)
                            
            if len(units) >= 2:
                try:
                    units.sort(key=lambda u: int(re.search(r'Unit\s*(\d+)', u).group(1)) if re.search(r'Unit\s*(\d+)', u) else 99)
                except Exception:
                    pass
                return units

    return [
        f"Unit 1: Fundamentals of {subject_name}",
        f"Unit 2: Core Theoretical Principles & Concepts",
        f"Unit 3: Applied Methodologies & Practice",
        f"Unit 4: Advanced Problem Solving & Case Studies",
        f"Unit 5: Practical Skills & Project Applications"
    ]

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def extract_auth_token(self):
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:].strip()
        return self.headers.get('X-Auth-Token', '').strip()

    def require_auth(self):
        """
        Verifies the request carries a valid session token.
        Returns the authenticated user dict, or sends a 401 response and returns None.
        """
        token = self.extract_auth_token()
        is_valid, user = auth_service.verify_session_token(token)
        if not is_valid:
            self.send_json(401, {"error": "Authentication required. Please sign in."})
            return None
        return user

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def read_json_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                return {}
            post_data = self.rfile.read(content_length)
            return json.loads(post_data.decode('utf-8'))
        except Exception as e:
            print(f"Error reading JSON body: {e}")
            return {}

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        query_components = urllib.parse.parse_qs(parsed_path.query)

        # --- Authentication & Session Verification ---
        if parsed_path.path == '/api/auth/verify':
            token = self.extract_auth_token()
            is_valid, user = auth_service.verify_session_token(token)
            if not is_valid:
                self.send_json(401, {"error": "Invalid or expired session token"})
                return
            self.send_json(200, {"success": True, "user": user})
            return

        # --- Super Admin: View All Users ---
        elif parsed_path.path == '/api/admin/users':
            token = self.extract_auth_token()
            is_valid, user = auth_service.verify_session_token(token)
            if not is_valid or user.get("role") != "super_admin":
                self.send_json(403, {"error": "Unauthorized. Super Admin privileges required."})
                return
            users = auth_service.admin_get_recent_signins()
            self.send_json(200, {"success": True, "users": users})
            return

        # --- Super Admin: View Security & Login Audit Logs ---
        elif parsed_path.path == '/api/admin/logs':
            token = self.extract_auth_token()
            is_valid, user = auth_service.verify_session_token(token)
            if not is_valid or user.get("role") != "super_admin":
                self.send_json(403, {"error": "Unauthorized. Super Admin privileges required."})
                return
            logs = auth_service.get_logs()
            status_filter = query_components.get('status', ['ALL'])[0]
            search_filter = query_components.get('search', [''])[0].strip().lower()

            if status_filter != 'ALL':
                logs = [l for l in logs if l.get('status') == status_filter]
            if search_filter:
                logs = [
                    l for l in logs if (
                        search_filter in l.get('username', '').lower() or
                        search_filter in l.get('name', '').lower() or
                        search_filter in l.get('ip', '').lower() or
                        search_filter in l.get('device', '').lower() or
                        search_filter in l.get('location', '').lower()
                    )
                ]
            self.send_json(200, {"success": True, "logs": logs})
            return

        elif parsed_path.path == '/api/cbse-subjects':
            if not self.require_auth():
                return
            cls = query_components.get('class', ['Class 10'])[0]
            print(f"API: Fetching all CBSE subjects for {cls}")
            sys.stdout.flush()
            subjects = fetch_cbse_subjects_list(cls)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(subjects).encode('utf-8'))
            return

        elif parsed_path.path == '/api/fetch-syllabus':
            if not self.require_auth():
                return
            cls = query_components.get('class', [''])[0]
            subject = query_components.get('subject', [''])[0]
            if not cls or not subject:
                self.send_error(400, "Missing class or subject")
                return
            print(f"API: Fetching CBSE syllabus for {cls} - {subject}")
            sys.stdout.flush()
            syllabus = fetch_syllabus_from_cbse(cls, subject)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"class": cls, "subject": subject, "syllabus": syllabus}).encode('utf-8'))
            return

        elif parsed_path.path == '/api/custom-subjects':
            if not self.require_auth():
                return
            data = get_custom_data()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return

        return super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)

        # --- Authentication: Google Sign-In ---
        if parsed_path.path == '/api/auth/google-login':
            try:
                body = self.read_json_body() or {}
                credential = body.get('credential', '')
                ip = auth_service.get_client_ip(self.headers, self.client_address)
                ua = self.headers.get('User-Agent', '')
                success, result, status_code = auth_service.authenticate_google_user(credential, ip, ua)
                self.send_json(status_code, result)
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        # --- Authentication: Logout ---
        elif parsed_path.path == '/api/auth/logout':
            try:
                token = self.extract_auth_token()
                ip = auth_service.get_client_ip(self.headers, self.client_address)
                ua = self.headers.get('User-Agent', '')
                auth_service.revoke_session_token(token, ip, ua)
                self.send_json(200, {"success": True, "message": "Logged out successfully"})
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        # --- Admin: Clear Logs ---
        elif parsed_path.path == '/api/admin/clear-logs':
            token = self.extract_auth_token()
            is_valid, user = auth_service.verify_session_token(token)
            if not is_valid or user.get("role") != "super_admin":
                self.send_json(403, {"error": "Unauthorized. Super Admin privileges required."})
                return
            try:
                auth_service.admin_clear_logs()
                self.send_json(200, {"success": True, "message": "Audit logs cleared successfully"})
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        elif parsed_path.path == '/api/custom-subjects':
            if not self.require_auth():
                return
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Empty payload")
                return
            post_data = self.rfile.read(content_length)
            try:
                req_data = json.loads(post_data.decode('utf-8'))
                action = req_data.get('action', 'save')
                cls = req_data.get('class')
                subject = req_data.get('subject')
                chapters = req_data.get('chapters', [])
                
                if not cls or not subject:
                    self.send_error(400, "Missing class or subject")
                    return
                    
                data = get_custom_data()
                if cls not in data:
                    data[cls] = {}
                    
                if action == 'delete':
                    if subject in data[cls]:
                        del data[cls][subject]
                else:
                    data[cls][subject] = chapters
                    
                save_custom_data(data)
                print(f"Custom subjects updated: {action} {cls} - {subject}")
                sys.stdout.flush()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "data": data}).encode('utf-8'))
            except Exception as e:
                print(f"Custom subjects save error: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif parsed_path.path == '/api/gemini':
            if not self.require_auth():
                return
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Empty payload")
                return
                
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                prompt = data.get('prompt')
                api_key = data.get('api_key')
                
                if not prompt or not api_key:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Missing prompt or API key"}).encode('utf-8'))
                    return
                
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                
                req = urllib.request.Request(
                    gemini_url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                
                try:
                    response = urllib.request.urlopen(req, context=ctx)
                    response_json = json.loads(response.read().decode('utf-8'))
                    
                    generated_text = ""
                    if 'candidates' in response_json and len(response_json['candidates']) > 0:
                        parts = response_json['candidates'][0]['content']['parts']
                        generated_text = parts[0].get('text', '')
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"text": generated_text}).encode('utf-8'))
                    
                except urllib.error.HTTPError as e:
                    error_msg = e.read().decode('utf-8')
                    print(f"Gemini API Error: {error_msg}")
                    
                    display_error = "Invalid API Key or API Error. Please check your key."
                    try:
                        err_json = json.loads(error_msg)
                        if 'error' in err_json and 'message' in err_json['error']:
                            display_error = f"Google API Error: {err_json['error']['message']}"
                    except:
                        display_error = f"Google API Error: {error_msg}"
                        
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": display_error}).encode('utf-8'))
                    
            except Exception as e:
                print(f"Server Error: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                
            return
            
        self.send_json(404, {"error": "Not found"})

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHttpRequestHandler) as httpd:
        print(f"GNPS Server running at http://0.0.0.0:{PORT} (Port: {PORT})")
        sys.stdout.flush()
        httpd.serve_forever()
