"""
CBSE Question Paper Generator
GOMTI NANDAN PUBLIC SCHOOL - UNIT TEST III (2026-27)
Class 11 English Core (301) - Set A & Set B

This script renders two distinct question papers into official CBSE formatted PDFs.
Supports WeasyPrint (if system libraries are present) and Google Chrome headless fallback.
"""

import os
import sys
import subprocess
import shutil
import tempfile

# ==========================================
# CSS TEMPLATE FOR OFFICIAL CBSE FORMATTING
# ==========================================
cbse_css = """
@page {
    size: A4 portrait;
    margin: 19mm;
}
@page :first {
    margin-top: 15mm;
}
body {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.25;
    color: #000;
}
.header-box {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 15px;
}
h1 { font-size: 18pt; font-weight: bold; margin: 0 0 5px 0; letter-spacing: 1px; }
h2 { font-size: 14pt; font-weight: bold; margin: 0 0 5px 0; }
.meta-table { width: 100%; font-size: 12pt; font-weight: bold; margin-bottom: 10px; }
.meta-table td { padding: 3px 0; }
.meta-right { text-align: right; }
.instructions { border: 1px solid #000; padding: 10px; margin-bottom: 20px; }
.instructions-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
.instructions ol { margin: 0; padding-left: 25px; }
.section-title { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 20px 0 15px 0; }
.question-row { width: 100%; margin-bottom: 15px; display: table; }
.q-num { display: table-cell; width: 30px; font-weight: bold; vertical-align: top; }
.q-text { display: table-cell; vertical-align: top; text-align: justify; }
.marks { display: table-cell; width: 40px; text-align: right; font-weight: bold; vertical-align: top; }
.mcq-table { width: 90%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
.mcq-table td { width: 50%; vertical-align: top; padding: 4px 0; }
.mcq-table tr { page-break-inside: avoid; }
.sub-question { margin-left: 20px; margin-top: 8px; }
.internal-choice { text-align: center; font-style: italic; font-weight: bold; margin: 15px 0; }
.diagram-container {
    text-align: center;
    margin: 8px auto 12px auto;
    page-break-inside: avoid;
}
.diagram-container svg {
    display: block;
    margin: 0 auto;
    max-width: 100%;
}
.diagram-caption {
    font-size: 10pt;
    font-weight: bold;
    margin-top: 4px;
    font-style: italic;
    color: #000;
}
.page-break { page-break-before: always; }
"""

# ==========================================
# SET A: HTML CONTENT
# ==========================================
set_a_html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Set A</title>
</head>
<body>
    <div class="header-box">
        <h1>GOMTI NANDAN PUBLIC SCHOOL</h1>
        <h2>UNIT TEST III (2026–27)</h2>
        <table class="meta-table">
            <tr>
                <td>CLASS: CLASS 11</td>
                <td class="meta-right">SUBJECT: ENGLISH CORE (301)</td>
            </tr>
            <tr>
                <td>TIME ALLOWED: 45 Mins</td>
                <td class="meta-right">MAXIMUM MARKS: 20</td>
            </tr>
        </table>
    </div>

    <div class="instructions">
        <div class="instructions-title">GENERAL INSTRUCTIONS:</div>
        <ol>
            <li>All questions are compulsory. However, internal choices are provided in specific sections.</li>
            <li>The paper is strictly aligned with the prescribed syllabus (Gap Filling, Sentence Re-ordering, Speech Writing, <i>The Laburnum Top</i>, and <i>The Summer of the Beautiful White Horse</i>).</li>
            <li>Adhere to the prescribed word limits. Maintain neatness and formatting.</li>
        </ol>
    </div>

    <div class="section-title">SECTION A: GRAMMAR (4 MARKS)</div>

    <div class="question-row">
        <div class="q-num">Q1.</div>
        <div class="q-text">
            <b>(A) Fill in the blanks with the correct form of the word/clauses to complete the paragraph focusing on empathy:</b>
            <div class="sub-question">
                A simple act of kindness (i) ____________ (can / must / shall / will) completely change a person's day. When we (ii) ____________ (helps / helped / help / helping) others without expecting anything in return, we build a bridge of genuine human connection.
            </div>
            <br>
            <b>(B) Re-order the following words/phrases to make meaningful sentences:</b>
            <div class="sub-question">
                (i) compassion / is / language / the / deaf / hear / the / can / which <br>
                (ii) it / connects / deeply / human / beings / beyond / words
            </div>
        </div>
        <div class="marks">[2+2=4]</div>
    </div>

    <div class="section-title">SECTION B: LONG WRITING SKILLS (6 MARKS)</div>

    <div class="question-row">
        <div class="q-num">Q2.</div>
        <div class="q-text">
            You are Aryan/Arya, Head Boy/Head Girl of your school. You have observed that in the race for academic excellence, students are becoming increasingly stressed and isolated. Write a speech in 120-150 words to be delivered in the morning assembly on the topic: <b>"The Importance of Compassion in a Competitive World"</b>.
            <div class="internal-choice">OR</div>
            You are Raj/Riya. Frequent natural disasters worldwide have proven that humans cannot conquer nature but must live in harmony with it. Write a speech in 120-150 words for your school's Environment Day on the topic: <b>"Living Harmoniously with Nature: Our Moral Responsibility"</b>.
        </div>
        <div class="marks">[6]</div>
    </div>

    <!-- Forced page break to ensure exact even-page PDF output -->
    <div class="page-break"></div>

    <div class="section-title">SECTION C: LITERATURE (10 MARKS)</div>

    <div class="question-row">
        <div class="q-num">Q3.</div>
        <div class="q-text">
            <b>Read the extract given below and answer the questions that follow:</b><br><br>
            <i>"Till the goldfinch comes, with a twitching chirrup <br>
            A suddenness, a startlement, at a branch end."</i>
            <div class="sub-question">
                <b>(i)</b> What does the 'startlement' at the branch end signify regarding the relationship between the bird and the tree? <b>[1]</b><br>
                <b>(ii)</b> Identify the figure of speech used in the phrase "twitching chirrup". <b>[1]</b><br>
                <b>(iii)</b> <i>Multiple Choice:</i> The sudden arrival of the goldfinch brings a sense of: <b>[1]</b>
                <table class="mcq-table">
                    <tr>
                        <td>(a) Impending danger and sorrow</td>
                        <td>(b) Sudden, electric vitality</td>
                    </tr>
                    <tr>
                        <td>(c) Melancholic grief and silence</td>
                        <td>(d) Destructive chaos to the nest</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="marks">[1x3=3]</div>
    </div>

    <div class="question-row">
        <div class="q-num">Q4.</div>
        <div class="q-text">
            How does Mourad’s gentle, empathetic handling of the injured robin highlight a stark contrast to his supposedly 'crazy' Garoghlanian streak?
        </div>
        <div class="marks">[2]</div>
    </div>

    <div class="question-row">
        <div class="q-num">Q5.</div>
        <div class="q-text">
            Justify how the Laburnum tree and the Goldfinch mutually support each other in the poem, acting as a metaphor for the interdependence of nature.
        </div>
        <div class="marks">[2]</div>
    </div>

    <div class="question-row">
        <div class="q-num">Q6.</div>
        <div class="q-text">
            <i>"Honesty is more than just not stealing; it is the courage to right a wrong."</i><br>
            Analyze how Aram and Mourad ultimately uphold the moral integrity of the Garoghlanian family in <i>The Summer of the Beautiful White Horse</i>, despite their initial lapse in judgement.
        </div>
        <div class="marks">[3]</div>
    </div>

</body>
</html>
"""

# ==========================================
# SET B: HTML CONTENT
# ==========================================
set_b_html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Set B</title>
</head>
<body>
    <div class="header-box">
        <h1>GOMTI NANDAN PUBLIC SCHOOL</h1>
        <h2>UNIT TEST III (2026–27)</h2>
        <table class="meta-table">
            <tr>
                <td>CLASS: CLASS 11</td>
                <td class="meta-right">SUBJECT: ENGLISH CORE (301)</td>
            </tr>
            <tr>
                <td>TIME ALLOWED: 45 Mins</td>
                <td class="meta-right">MAXIMUM MARKS: 20</td>
            </tr>
        </table>
    </div>

    <div class="instructions">
        <div class="instructions-title">GENERAL INSTRUCTIONS:</div>
        <ol>
            <li>All questions are compulsory. However, internal choices are provided in specific sections.</li>
            <li>The paper is strictly aligned with the prescribed syllabus (Gap Filling, Sentence Re-ordering, Speech Writing, <i>The Laburnum Top</i>, and <i>The Summer of the Beautiful White Horse</i>).</li>
            <li>Adhere to the prescribed word limits. Maintain neatness and formatting.</li>
        </ol>
    </div>

    <div class="section-title">SECTION A: GRAMMAR (4 MARKS)</div>

    <div class="question-row">
        <div class="q-num">Q1.</div>
        <div class="q-text">
            <b>(A) Fill in the blanks with the correct form of the word/clauses to complete the paragraph focusing on resilience:</b>
            <div class="sub-question">
                True resilience (i) ____________ (is found / finds / found / finding) not in never falling, but in rising every time we fall. Those who (ii) ____________ (cultivated / cultivate / cultivates / cultivating) patience and gratitude ultimately triumph over adversity.
            </div>
            <br>
            <b>(B) Re-order the following words/phrases to make meaningful sentences:</b>
            <div class="sub-question">
                (i) gratitude / unlocks / the / fullness / life / of <br>
                (ii) turns / what / have / we / into / it / enough
            </div>
        </div>
        <div class="marks">[2+2=4]</div>
    </div>

    <div class="section-title">SECTION B: LONG WRITING SKILLS (6 MARKS)</div>

    <div class="question-row">
        <div class="q-num">Q2.</div>
        <div class="q-text">
            You are Kavya/Karan, an active member of your school's animal welfare club. You feel deeply pained by the apathy shown by humans towards stray animals. Write a speech in 120-150 words to be delivered during the morning assembly on the topic: <b>"Animals and Us: Co-existing with Compassion."</b>
            <div class="internal-choice">OR</div>
            You are Sam/Samiya. In an age of shortcuts and instant gratification, the value of honesty is often forgotten. Write a speech in 120-150 words to be delivered in the school auditorium on the topic: <b>"The Power of Moral Integrity in the Modern World."</b>
        </div>
        <div class="marks">[6]</div>
    </div>

    <!-- Forced page break to ensure exact even-page PDF output -->
    <div class="page-break"></div>

    <div class="section-title">SECTION C: LITERATURE (10 MARKS)</div>

    <div class="question-row">
        <div class="q-num">Q3.</div>
        <div class="q-text">
            <b>Read the extract given below and answer the questions that follow:</b><br><br>
            <i>"A suspicious man would believe his eyes instead of his heart... My family is famous for honesty."</i>
            <div class="sub-question">
                <b>(i)</b> Why does John Byro deliberately choose to "believe his heart" over his eyes when evaluating the boys? <b>[1]</b><br>
                <b>(ii)</b> What does this statement reveal about the enduring legacy and reputation of the Garoghlanian family? <b>[1]</b><br>
                <b>(iii)</b> <i>Multiple Choice:</i> Byro's reaction towards the young boys reflects his: <b>[1]</b>
                <table class="mcq-table">
                    <tr>
                        <td>(a) Foolishness and poor eyesight</td>
                        <td>(b) Deep empathy and mature wisdom</td>
                    </tr>
                    <tr>
                        <td>(c) Fear of confronting Uncle Khosrove</td>
                        <td>(d) Desire to immediately buy another horse</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="marks">[1x3=3]</div>
    </div>

    <div class="question-row">
        <div class="q-num">Q4.</div>
        <div class="q-text">
            The poem <i>The Laburnum Top</i> opens and closes with absolute silence. Deduce the deeper significance of this silence in the context of the tree's lonely existence.
        </div>
        <div class="marks">[2]</div>
    </div>

    <div class="question-row">
        <div class="q-num">Q5.</div>
        <div class="q-text">
            Evaluate whether Uncle Khosrove's aggressive catchphrase <i>"Pay no attention to it"</i> is a psychological sign of rugged resilience or mere emotional escapism.
        </div>
        <div class="marks">[2]</div>
    </div>

    <div class="question-row">
        <div class="q-num">Q6.</div>
        <div class="q-text">
            <i>"She is the engine of her family."</i><br>
            Synthesize how Ted Hughes brilliantly uses a blend of mechanical and natural imagery to portray the mother goldfinch's selfless dedication to sustaining her vulnerable young.
        </div>
        <div class="marks">[3]</div>
    </div>

</body>
</html>
"""

# ==========================================
# PAGE FOOTER DEFINITIONS (CSS for specific sets)
# ==========================================
footer_css_set_a = """
@page {
    @bottom-left {
        content: "GNPS / UNIT TEST III / SET A";
        font-size: 10pt; font-family: 'Times New Roman', serif; font-weight: bold;
    }
    @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 10pt; font-family: 'Times New Roman', serif;
    }
}
"""

footer_css_set_b = """
@page {
    @bottom-left {
        content: "GNPS / UNIT TEST III / SET B";
        font-size: 10pt; font-family: 'Times New Roman', serif; font-weight: bold;
    }
    @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 10pt; font-family: 'Times New Roman', serif;
    }
}
"""

def assemble_full_html(html_body, custom_css):
    """Combines HTML body with style block in head."""
    styled_head = f"""<head>
    <meta charset="UTF-8">
    <style>
{custom_css}
    </style>
</head>"""
    return html_body.replace("<head>\n    <meta charset=\"UTF-8\">\n    <title>Set A</title>\n</head>", styled_head).replace("<head>\n    <meta charset=\"UTF-8\">\n    <title>Set B</title>\n</head>", styled_head)


def render_with_chrome(html_path, pdf_path, set_label):
    """Renders HTML to PDF using Google Chrome headless."""
    chrome_paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chrome")
    ]
    chrome_bin = next((p for p in chrome_paths if p and os.path.exists(p)), None)
    if not chrome_bin:
        raise RuntimeError("Google Chrome not found on system.")

    footer_html = f"""<div style="width: 100%; font-family: 'Times New Roman', serif; font-size: 10pt; display: flex; justify-content: space-between; padding-left: 19mm; padding-right: 19mm; box-sizing: border-box;">
        <span><b>GNPS / UNIT TEST III / {set_label}</b></span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>"""

    header_html = "<div></div>"

    profile_dir = tempfile.mkdtemp(prefix="chrome_pdf_")
    try:
        cmd = [
            chrome_bin,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--user-data-dir={profile_dir}",
            "--display-header-footer",
            f"--footer-template={footer_html}",
            f"--header-template={header_html}",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={pdf_path}",
            f"file://{os.path.abspath(html_path)}"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if not os.path.exists(pdf_path) or os.path.getsize(pdf_path) == 0:
            raise RuntimeError(f"Chrome PDF generation failed. Error: {result.stderr}")
    finally:
        shutil.rmtree(profile_dir, ignore_errors=True)


def generate_cbse_papers():
    cwd = os.getcwd()
    file_a_pdf = os.path.join(cwd, "Class_11_Unit_Test_III_English_Core_301_Set_A.pdf")
    file_b_pdf = os.path.join(cwd, "Class_11_Unit_Test_III_English_Core_301_Set_B.pdf")
    file_a_html = os.path.join(cwd, "Class_11_Unit_Test_III_English_Core_301_Set_A.html")
    file_b_html = os.path.join(cwd, "Class_11_Unit_Test_III_English_Core_301_Set_B.html")

    # Save standalone HTML files for direct browser viewing & printing
    full_html_a = assemble_full_html(set_a_html, cbse_css + footer_css_set_a)
    full_html_b = assemble_full_html(set_b_html, cbse_css + footer_css_set_b)

    with open(file_a_html, "w", encoding="utf-8") as f:
        f.write(full_html_a)
    with open(file_b_html, "w", encoding="utf-8") as f:
        f.write(full_html_b)
    print(f"Generated standalone HTML: {os.path.basename(file_a_html)}")
    print(f"Generated standalone HTML: {os.path.basename(file_b_html)}")

    # Attempt WeasyPrint first
    weasyprint_success = False
    try:
        from weasyprint import HTML, CSS
        print("Attempting PDF rendering using WeasyPrint...")
        print(f"Rendering {os.path.basename(file_a_pdf)}...")
        HTML(string=set_a_html).write_pdf(
            file_a_pdf,
            stylesheets=[CSS(string=cbse_css + footer_css_set_a)]
        )
        print(f"Rendering {os.path.basename(file_b_pdf)}...")
        HTML(string=set_b_html).write_pdf(
            file_b_pdf,
            stylesheets=[CSS(string=cbse_css + footer_css_set_b)]
        )
        weasyprint_success = True
        print("Success! Both CBSE compliant PDF files generated via WeasyPrint.")
    except Exception as e:
        print(f"WeasyPrint unavailable or missing C libraries ({e}).")
        print("Switching to Google Chrome engine fallback...")

    # Fallback to Google Chrome headless
    if not weasyprint_success:
        try:
            print(f"Rendering {os.path.basename(file_a_pdf)} via Chrome...")
            render_with_chrome(file_a_html, file_a_pdf, "SET A")
            print(f"Rendering {os.path.basename(file_b_pdf)} via Chrome...")
            render_with_chrome(file_b_html, file_b_pdf, "SET B")
            print("Success! Both CBSE compliant PDF files generated via Chrome engine.")
        except Exception as e:
            print(f"Error rendering PDFs: {e}")
            print(f"Note: You can also open the generated HTML files directly in your browser and select 'Print -> Save as PDF':")
            print(f"  - {file_a_html}")
            print(f"  - {file_b_html}")

if __name__ == "__main__":
    generate_cbse_papers()
