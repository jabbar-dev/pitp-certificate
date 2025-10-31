# Sample Output: Answer Sheet Generator

## What Gets Generated

When you use the Answer Sheet Creator Wizard, here's what each student receives:

---

## Example: Generated Answer Booklet for Student

### File Name: `MID-CS301-FALL25_21CS001.pdf`

---

### Page 1: Front Cover

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║            EXAMINATION ANSWER BOOKLET                         ║
║                                                               ║
║              Midterm Examination - Fall 2025                  ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Subject:      Data Structures (CS-301)                       ║
║  Exam Code:    MID-CS301-FALL25                              ║
║  Examiner:     Dr. Ahmed Khan                                 ║
║  Duration:     120 minutes                                    ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║             STUDENT INFORMATION                               ║
║                                                               ║
║  Student ID:   21CS001                                        ║
║  Student Name: John Doe                                       ║
║                                                               ║
║  ┌──────────────────────┐                                    ║
║  │                      │      QR CODE                       ║
║  │   ████ ██ ████       │    (Encodes exam ID,              ║
║  │   ██     ██   ██     │     student ID,                   ║
║  │   ████ ████ ████     │     booklet ID,                   ║
║  │   ██ ██   ████       │     page number,                  ║
║  │   ████ ██ ████       │     signature)                    ║
║  │                      │                                    ║
║  └──────────────────────┘                                    ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  INSTRUCTIONS:                                                ║
║  • Write your answers clearly and legibly                     ║
║  • Do not remove the staples from this booklet               ║
║  • Use only black or blue ink                                 ║
║  • Cross out any work you do not want to be marked          ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌────────────────────────────┐  ┌───────────────────────┐  ║
║  │ Candidate Signature:       │  │ Invigilator Signature:│  ║
║  │                            │  │                       │  ║
║  │                            │  │                       │  ║
║  └────────────────────────────┘  └───────────────────────┘  ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Page 1 of 11 | Booklet No: MID-CS301-FALL25_21CS001        ║
║            DO NOT WRITE IN THE QR CODE AREA                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### Pages 2-11: Ruled Answer Pages

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  Student ID: 21CS001          Exam: MID-CS301-FALL25         ║
║                                                               ║
║                                        ┌────────┐            ║
║                                        │  QR    │    Page 2  ║
║                                        │  CODE  │    of 11   ║
║                                        │        │            ║
║                                        └────────┘            ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║ _____________________________________________________________ ║
║                                                               ║
║                                                               ║
║                     Page 2 of 11                              ║
║                  DO NOT REMOVE STAPLES                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Bulk Generation Output

When you generate for 100 students, you get:

```
answer_sheets_20251031_091745.zip
├── MID-CS301-FALL25_21CS001.pdf  (11 pages)
├── MID-CS301-FALL25_21CS002.pdf  (11 pages)
├── MID-CS301-FALL25_21CS003.pdf  (11 pages)
├── MID-CS301-FALL25_21CS004.pdf  (11 pages)
├── ... (96 more files)
└── MID-CS301-FALL25_21CS100.pdf  (11 pages)

Total: 100 PDFs × 11 pages = 1,100 pages
Generation Time: ~30-60 seconds
```

---

## QR Code Data Structure

Each QR code encodes:

```json
{
  "examId": "507f1f77bcf86cd799439011",
  "studentId": "507f191e810c19729de860ea",
  "qrBundleId": "a3f5b2c8d9e1f4a7b6c5d8e9",
  "pageNo": 2,
  "signature": "8d7a6f5e4c3b2a1908c7b6a5d4e3f2a1"
}
```

The signature is HMAC-SHA256 hash of:
`examId:studentId:qrBundleId:pageNo` using the exam's private seed

This prevents:
- Fake pages being inserted
- Pages from different exams being mixed
- Unauthorized modifications

---

## After Exam: Scanning & Identification

### Step 1: Scan Physical Booklets
```
Scanner → Digital PDFs (one per student or combined)
```

### Step 2: Upload to System
```
Upload → Python Service splits into pages → QR detection
```

### Step 3: Auto-Identification
```
Each scanned page:
1. QR code detected ✓
2. Decoded to extract metadata
3. Signature verified against privateSeed
4. Student identified automatically
5. Page linked to correct exam & student in database
```

### Result:
```
PageImage records created:
- exam: "507f1f77bcf86cd799439011"
- student: "507f191e810c19729de860ea"
- pageNo: 2
- status: "identified" ✓
- imageFileRef: "/uploads/scans/page_12345.png"
```

---

## Digital Marking Interface

Teachers see:
```
╔═══════════════════════════════════════════════════════════════╗
║  Student: John Doe (21CS001)        Question: Q1(a)           ║
╠═══════════════════════════════════════════════════════════════╣
║                                   ║                           ║
║  [Scanned Answer Image]           ║  Rubric Items:            ║
║                                   ║  ☐ Correct approach (+2)  ║
║  Student's handwritten answer     ║  ☐ Minor error (-1)       ║
║  displayed here with              ║  ☐ Major error (-3)       ║
║  zoom/pan capabilities            ║                           ║
║                                   ║  Score: [___] / 10        ║
║                                   ║                           ║
║                                   ║  Comments:                ║
║                                   ║  [___________________]    ║
║                                   ║                           ║
║                                   ║  [Save] [Next Student]    ║
║                                   ║                           ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Final Export

### CSV Format:
```csv
studentId,studentName,examCode,Q1,Q2,Q3,Q4,totalScore
21CS001,John Doe,MID-CS301-FALL25,8,7,9,8,32
21CS002,Jane Smith,MID-CS301-FALL25,9,8,9,9,35
21CS003,Bob Johnson,MID-CS301-FALL25,7,6,8,7,28
```

### Annotated PDFs:
Each student gets a PDF with:
- All their scanned pages
- Marks/comments overlaid
- Summary score page
- Digital signatures

---

## Benefits Over Traditional Method

### Traditional:
- ❌ Manual template design (hours)
- ❌ Coordinate with print shop
- ❌ Manual tracking of booklets
- ❌ Paper-based marking
- ❌ Manual result entry
- ❌ Risk of lost papers

### With This System:
- ✅ Automated generation (minutes)
- ✅ QR-based tracking
- ✅ Auto-identification of students
- ✅ Digital marking with rubrics
- ✅ Automated result compilation
- ✅ Complete audit trail

---

## System Guarantees

1. **Uniqueness**: Every page has unique QR with signature
2. **Traceability**: Complete tracking from generation to marking
3. **Security**: HMAC signatures prevent tampering
4. **Efficiency**: 100+ booklets generated in <1 minute
5. **Consistency**: Professional formatting across all booklets
6. **Reliability**: Auto-identification reduces human error

---

This sample output demonstrates how the Answer Sheet Creator Wizard transforms exam administration from a manual, error-prone process into an automated, traceable, and efficient system.
