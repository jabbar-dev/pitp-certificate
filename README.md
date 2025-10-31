# Exam Management System

A comprehensive full-stack web application for university exam management and digital marking, built with MERN stack + Python microservice.

## Features

### Core Functionality
- **Complete Exam Lifecycle Management** - From creation to result export
- **Answer Sheet Creator Wizard** ⭐ - Auto-generate standardized answer booklets with QR codes
- **Student & Subject Management** - Bulk import via CSV, full CRUD operations
- **QR-Coded Paper Generation** - Unique identification for each student's papers
- **Digital Marking System** - Browser-based marking with rubrics and annotations
- **Scan & Auto-Matching** - Upload scanned papers and auto-identify via QR
- **Results Export** - CSV and annotated PDF generation

### User Roles
- **Admin** - Full system access, exam creation, student management
- **Marker/Teacher** - Digital marking and rubric management
- **Viewer/HOD** - Read-only access to marks and reports

## Technology Stack

### Frontend
- React 18 with React Router
- Tailwind CSS for styling
- Axios for API communication
- Context API for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication with bcrypt
- Multer for file uploads

### Python Microservice
- Flask web server
- ReportLab for PDF generation
- qrcode library for QR generation
- pyzbar for QR decoding

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB 5.0+

## Installation

### 1. Clone and Install Frontend
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
cd ..
```

### 3. Install Python Service
```bash
cd python-service
pip install -r requirements.txt
cd ..
```

## Running the Application

You need to run three services:

### Terminal 1: Frontend (Port 3000)
```bash
npm start
```

### Terminal 2: Backend API (Port 5000)
```bash
cd backend
npm start
```

### Terminal 3: Python Service (Port 5001)
```bash
cd python-service
python app.py
```

## Quick Start

1. **Start MongoDB** - Ensure MongoDB is running locally or configure remote URI
2. **Create Admin User** - See Initial Setup section below
3. **Login** at http://localhost:3000/login
4. **Use the Answer Sheet Creator Wizard** at Dashboard → Answer Sheet Creator

## Initial Setup

Create an admin user in MongoDB:

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

**Login:** admin@example.com / admin123

## Usage Workflow

1. Login as admin
2. Import/add students
3. Create subjects and exams
4. **Use Answer Sheet Creator Wizard** to generate QR-coded booklets
5. Download PDFs and print
6. Conduct exam
7. Upload scanned copies
8. Mark digitally
9. Export results

## Project Structure

```
pitp-certificate/
├── backend/                 # Node.js Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── middleware/         # Authentication
├── python-service/         # PDF generation service
│   └── app.py              # Flask app
├── src/                    # React frontend
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── context/            # Auth context
└── public/                 # Static assets
```

## Key API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/students` - List students
- `POST /api/students/bulk-import` - CSV import
- `POST /api/exams` - Create exam
- `POST /api/answer-sheets/generate` - Generate answer sheets
- `GET /api/results/:examId/csv` - Export results

## CSV Import Format

```csv
studentId,fullName,program,batch,section
21CS001,John Doe,BS CS,2021,A
21CS002,Jane Smith,BS CS,2021,A
```

## Security

- JWT authentication
- bcrypt password hashing
- Role-based access control
- QR signature verification
- CORS protection

## Legacy Features

This system also includes the original certificate viewing functionality:
- View certificates at `/certificate/:id`
- Download bulk certificates at `/download`

## Troubleshooting

- **MongoDB not connecting**: Check MONGODB_URI in backend/.env
- **Python service error**: Install dependencies with `pip install -r requirements.txt`
- **Port conflicts**: Ensure ports 3000, 5000, 5001 are available

## Future Enhancements

- Full scan upload processing
- Interactive marking canvas
- Student result portal
- Analytics dashboard
- Email notifications

## License

Part of PITP Certificate System
