# Quick Start Guide

## Exam Management System - Answer Sheet Creator Wizard

### What This System Does

This is a comprehensive exam management platform that allows universities to:

1. **Generate QR-coded answer booklets** for students automatically
2. **Manage the entire exam lifecycle** from creation to results
3. **Mark digitally** with rubrics and annotations
4. **Auto-identify** scanned papers using QR codes
5. **Export results** in multiple formats

### The Answer Sheet Creator Wizard ⭐

The star feature of this system is the **Answer Sheet Creator Wizard** that generates professional, standardized answer booklets with:

- **Front cover page** with student info, exam details, and QR code
- **Multiple ruled answer pages** with headers and QR tracking
- **Unique QR codes** on every page for auto-identification
- **Professional formatting** ready for printing
- **Bulk generation** for entire classes

## Setup (5 minutes)

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB

### Installation

```bash
# Run the setup script
./setup.sh

# OR manually:

# 1. Frontend
npm install

# 2. Backend
cd backend
npm install
cd ..

# 3. Python service
cd python-service
pip3 install -r requirements.txt
cd ..
```

### Configuration

1. **Start MongoDB:**
   ```bash
   mongod
   ```

2. **Create Admin User** (in MongoDB shell):
   ```javascript
   use exam-management
   
   db.users.insertOne({
     name: "Admin User",
     email: "admin@example.com",
     passwordHash: "$2a$10$K8YrVlqYsXvEQ7J8lF8B6.WYjH5R.9bGfMmNfJ8J8lVQfFwY7nY6W",
     role: "admin",
     assignedSubjects: [],
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

### Running the System

Open **3 terminals**:

**Terminal 1 - Frontend:**
```bash
npm start
# Opens http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 3 - Python Service:**
```bash
cd python-service
python3 app.py
# Runs on http://localhost:5001
```

## Using the Answer Sheet Creator

### Step 1: Login
1. Go to http://localhost:3000/login
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### Step 2: Add Students
1. Go to **Dashboard** → **Students**
2. Import via CSV or add manually
3. CSV format:
   ```csv
   studentId,fullName,program,batch,section
   21CS001,John Doe,BS CS,2021,A
   21CS002,Jane Smith,BS CS,2021,B
   ```

### Step 3: Create an Exam
1. Go to **Dashboard** → **Exams**
2. Click "Create New Exam"
3. Fill in:
   - Exam Code (e.g., MID-CS301-FALL25)
   - Title (e.g., Midterm - Data Structures)
   - Subject, Date, Duration

### Step 4: Generate Answer Sheets 🎯
1. Go to **Dashboard** → **Answer Sheet Creator**
2. **Wizard Step 1** - Exam Details:
   - Select your exam
   - Fill in exam metadata
3. **Wizard Step 2** - Select Students:
   - Choose which students need answer sheets
   - Use "Select All" for entire class
4. **Wizard Step 3** - Configuration:
   - Set number of answer pages (typically 10-14)
   - Choose if graph paper needed
5. **Wizard Step 4** - Generate:
   - Click "Generate Answer Sheets"
   - Wait for processing
   - Download ZIP file with all PDFs

### Step 5: Print and Distribute
1. Extract the ZIP file
2. Print each PDF (one per student)
3. Distribute before exam
4. Each booklet has QR codes for auto-tracking

## What Gets Generated

Each student receives a PDF booklet with:

### Front Cover Page Contains:
- University branding area
- Exam title and code
- Subject and teacher name
- Student ID and name (pre-filled)
- Duration and marks info
- Large QR code for identification
- Signature boxes (candidate & invigilator)
- Instructions

### Answer Pages (10-14 pages):
- Ruled lines for writing
- Page headers with student ID
- Page numbers
- QR code on each page
- "Do not remove staples" reminders

## After the Exam

### Workflow:
1. **Collect** answer booklets
2. **Scan** using any scanner
3. **Upload** scanned PDFs to the system
4. System **auto-identifies** students via QR
5. **Mark digitally** using the marking interface
6. Apply **rubrics** for consistent grading
7. **Export** final results as CSV or annotated PDFs

## Key Features

### Secure & Traceable
- Every page has unique QR with signature
- Tamper-proof identification
- Full audit trail

### Fast & Efficient
- Generate 100+ booklets in seconds
- Bulk operations throughout
- Automated workflows

### Professional Quality
- University-standard formatting
- Print-ready PDFs
- Consistent layout

## Troubleshooting

### "Connection refused" errors
- Ensure all 3 services are running
- Check ports 3000, 5000, 5001 are free

### "Python service unavailable"
- Make sure Python dependencies installed
- Run `cd python-service && python3 app.py`

### "MongoDB connection error"
- Start MongoDB: `mongod`
- Check connection string in `backend/.env`

### PDFs not generating
- Check Python service logs
- Ensure reportlab is installed: `pip3 install reportlab`

## Example: Complete Workflow

```bash
# 1. Start all services (3 terminals)
npm start
cd backend && npm start
cd python-service && python3 app.py

# 2. Login to http://localhost:3000/login

# 3. Create students, subjects, exam

# 4. Use Answer Sheet Creator:
#    - Select exam
#    - Pick 30 students
#    - Set 10 answer pages
#    - Generate
#    - Download ZIP

# 5. Extract and print 30 PDFs

# 6. Conduct exam with printed booklets

# 7. Scan completed booklets

# 8. Upload scans for auto-identification

# 9. Mark digitally with rubrics

# 10. Export results to CSV
```

## Next Steps

- Explore the **Marking** interface
- Set up **Rubrics** for consistent grading
- Configure **Scan Upload** for post-exam processing
- Try the **Results Export** feature

## Support

See the main README.md for:
- Complete API documentation
- Database schema details
- Advanced configuration
- Deployment guide

---

**Remember:** The Answer Sheet Creator Wizard is the centerpiece of this system. It saves hours of manual work and ensures every answer sheet is properly tracked with QR codes for the digital marking workflow.
