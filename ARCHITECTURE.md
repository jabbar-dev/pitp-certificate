# System Architecture Overview

## Exam Management System

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              REACT FRONTEND (Port 3000)                   │  │
│  │                                                            │  │
│  │  - Authentication UI (Login/Dashboard)                    │  │
│  │  - Answer Sheet Creator Wizard ⭐                         │  │
│  │  - Student/Exam Management                                │  │
│  │  - Protected Routes (Role-based)                          │  │
│  │  - Tailwind CSS Styling                                   │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │ HTTP/REST API                              │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               NODE.JS BACKEND (Port 5000)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  EXPRESS.JS API                           │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Authentication Middleware (JWT)                    │  │  │
│  │  │  - protect: Verify JWT tokens                       │  │  │
│  │  │  - authorize: Check user roles                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  API Routes                                         │  │  │
│  │  │  - /api/auth (login, register, me)                 │  │  │
│  │  │  - /api/students (CRUD + CSV import)               │  │  │
│  │  │  - /api/subjects (CRUD)                            │  │  │
│  │  │  - /api/exams (CRUD)                               │  │  │
│  │  │  - /api/answer-sheets (generate, list)            │  │  │
│  │  │  - /api/rubrics (CRUD)                             │  │  │
│  │  │  - /api/marking (tasks, submit)                    │  │  │
│  │  │  - /api/results (finalize, export CSV)            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Communicates with Python Service ──────┐                │  │
│  └──────────────┬───────────────────────────┼────────────────┘  │
│                 │                           │                   │
│                 │                           │ HTTP POST         │
│                 │ MongoDB Driver            └──────────┐        │
└─────────────────┼──────────────────────────────────────┼────────┘
                  │                                      │
                  ▼                                      ▼
    ┌─────────────────────────┐         ┌──────────────────────────┐
    │    MONGODB               │         │  PYTHON SERVICE          │
    │    (Port 27017)          │         │  (Port 5001)             │
    │                          │         │                          │
    │  Collections:            │         │  Flask Web Server        │
    │  - users                 │         │                          │
    │  - students              │         │  ┌────────────────────┐ │
    │  - subjects              │         │  │ PDF Generation     │ │
    │  - exams                 │         │  │ - ReportLab        │ │
    │  - generatedpapers       │         │  │ - QR Code gen      │ │
    │  - pageimages            │         │  │ - Ruled lines      │ │
    │  - rubricstems           │         │  │ - Cover pages      │ │
    │  - markrecords           │         │  └────────────────────┘ │
    │  - finalresults          │         │                          │
    │                          │         │  ┌────────────────────┐ │
    │  Mongoose ODM            │         │  │ ZIP Creation       │ │
    └──────────────────────────┘         │  │ - Bundle PDFs      │ │
                                         │  │ - File management  │ │
                                         │  └────────────────────┘ │
                                         │                          │
                                         │  Output: /output/        │
                                         │  - *.pdf (per student)   │
                                         │  - *.zip (bulk)          │
                                         └──────────────────────────┘
```

## Data Flow: Answer Sheet Generation

```
1. User (Admin) in React UI
   └─> Selects exam, students, config
       └─> POST to /api/answer-sheets/generate
           
2. Express Backend
   └─> Validates request, checks auth
       └─> Retrieves exam & student data from MongoDB
           └─> Generates QR data with signatures
               └─> POST to Python Service /generate-answer-sheets
               
3. Python Service (Flask)
   └─> Receives booklet specifications
       └─> For each student:
           ├─> Create cover page (A4)
           │   ├─> Exam details
           │   ├─> Student info
           │   └─> QR code (with signature)
           └─> Create answer pages (ruled)
               ├─> Header with student ID
               ├─> Page numbers
               ├─> QR code on each page
               └─> Ruled lines for writing
       └─> Bundle all PDFs into ZIP
           └─> Return download URL
           
4. Backend
   └─> Saves GeneratedPaper records to MongoDB
       └─> Returns success + download link to React
       
5. React UI
   └─> Displays success message
       └─> Provides download link
```

## Security Flow

```
┌─────────────┐
│   User      │
│  Attempts   │
│   Login     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│  POST /api/auth/login            │
│  { email, password }             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Backend Auth Route              │
│  1. Find user by email           │
│  2. Compare password (bcrypt)    │
│  3. Generate JWT token           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Return:                         │
│  { token, user: { id, role } }   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  React stores token in:          │
│  - localStorage                  │
│  - AuthContext                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Subsequent Requests Include:    │
│  Authorization: Bearer <token>   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Backend Middleware:             │
│  - Verify JWT signature          │
│  - Extract user ID               │
│  - Check role permissions        │
│  - Attach user to req.user       │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Route Handler Executes          │
│  with authenticated context      │
└──────────────────────────────────┘
```

## Technology Stack Details

### Frontend Stack
```
React 18.3.1
├── react-router-dom (routing)
├── axios (HTTP client)
├── Context API (state management)
└── Tailwind CSS (styling)
```

### Backend Stack
```
Node.js + Express 4.18
├── mongoose 7.0 (MongoDB ODM)
├── jsonwebtoken 9.0 (JWT auth)
├── bcryptjs 2.4 (password hashing)
├── multer (file uploads)
├── cors (cross-origin)
└── dotenv (env config)
```

### Python Service Stack
```
Python 3.8+
├── Flask 3.0 (web framework)
├── ReportLab 4.0 (PDF generation)
├── qrcode 7.4 (QR code generation)
├── Pillow 10.1 (image processing)
└── PyPDF2 3.0 (PDF manipulation)
```

## File Structure

```
pitp-certificate/
├── backend/                    # Node.js backend
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   ├── Exam.js
│   │   ├── GeneratedPaper.js
│   │   ├── PageImage.js
│   │   ├── RubricItem.js
│   │   ├── MarkRecord.js
│   │   └── FinalResult.js
│   ├── routes/                # API endpoints
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── subjects.js
│   │   ├── exams.js
│   │   ├── answerSheets.js   # ⭐ Answer Sheet Creator
│   │   ├── rubrics.js
│   │   ├── marking.js
│   │   └── results.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── server.js              # Main Express app
│   └── package.json
│
├── python-service/             # Python microservice
│   ├── app.py                 # Flask app
│   ├── requirements.txt
│   └── output/                # Generated PDFs
│
├── src/                       # React frontend
│   ├── components/            # Reusable components
│   ├── pages/                 # Page components
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   └── AnswerSheetCreator.js  # ⭐ Wizard UI
│   ├── services/
│   │   └── api.js            # Axios API client
│   ├── context/
│   │   └── AuthContext.js    # Auth state
│   └── App.js                # Main app + routing
│
├── public/                    # Static assets
├── setup.sh                   # Automated setup
├── README.md                  # Full documentation
├── QUICKSTART.md             # Quick start guide
└── package.json              # Frontend dependencies
```

## Deployment Considerations

### Development
- Frontend: `npm start` (port 3000)
- Backend: `cd backend && npm start` (port 5000)
- Python: `cd python-service && python3 app.py` (port 5001)

### Production
1. **Frontend**: Build with `npm run build`, serve from nginx/CDN
2. **Backend**: Deploy on Node.js server (PM2, Docker)
3. **Python**: Deploy as separate service (Docker, systemd)
4. **MongoDB**: Hosted (MongoDB Atlas) or self-hosted
5. **Files**: Store in S3/MinIO instead of local disk

### Environment Variables
- Backend: MongoDB URI, JWT secret
- Frontend: API base URL
- Python: Output directory path

## Scaling Strategy

```
Load Balancer
    │
    ├─────> Frontend Instances (multiple)
    │       (static React build)
    │
    ├─────> Backend API Instances (multiple)
    │       (stateless Node.js)
    │       │
    │       └──> Shared MongoDB Cluster
    │
    └─────> Python Service Instances (multiple)
            (PDF generation workers)
            │
            └──> Shared File Storage (S3)
```

---

This architecture provides:
✅ Separation of concerns
✅ Independent scaling of services
✅ Clear data flow
✅ Security at every layer
✅ Modern, maintainable codebase
