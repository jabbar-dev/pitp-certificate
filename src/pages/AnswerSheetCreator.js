import React, { useState, useEffect } from 'react';
import { examService, studentService, answerSheetService } from '../services/api';

const AnswerSheetCreator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    examId: '',
    examTitle: '',
    subjectName: '',
    subjectCode: '',
    teacherName: '',
    department: '',
    session: '',
    totalMarks: '',
    passingMarks: '',
    duration: '',
    numAnswerPages: 10,
    includeGraphPaper: false
  });

  useEffect(() => {
    loadExams();
    loadStudents();
  }, []);

  const loadExams = async () => {
    try {
      const response = await examService.getAll();
      setExams(response.data.data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleExamChange = (examId) => {
    const exam = exams.find(e => e._id === examId);
    if (exam) {
      setFormData({
        ...formData,
        examId,
        examTitle: exam.title,
        subjectName: exam.subject?.name || '',
        subjectCode: exam.subject?.code || '',
        department: exam.subject?.department || '',
        duration: exam.durationMinutes || ''
      });
    }
  };

  const toggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s._id));
  };

  const deselectAll = () => {
    setSelectedStudents([]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await answerSheetService.generate({
        ...formData,
        studentIds: selectedStudents
      });

      setSuccess(`Successfully generated ${response.data.count} answer sheets! ${response.data.downloadUrl ? 'Check the download link.' : ''}`);
      
      if (response.data.downloadUrl) {
        // In production, this would be the full URL to download
        alert(`Download URL: ${response.data.downloadUrl}\n\nNote: Python service must be running to download files.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to generate answer sheets');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Answer Sheet Creator Wizard</h2>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Exam Details</span>
          <span>Select Students</span>
          <span>Configuration</span>
          <span>Generate</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      {/* Step 1: Exam Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 1: Exam Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Exam
            </label>
            <select
              value={formData.examId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Choose an exam...</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.examCode} - {exam.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                value={formData.examTitle}
                onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Name
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session
              </label>
              <input
                type="text"
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                placeholder="e.g., Morning / Evening"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={nextStep}
              disabled={!formData.examId}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Students */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 2: Select Students</h3>
          
          <div className="flex gap-2">
            <button
              onClick={selectAllStudents}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
            >
              Deselect All
            </button>
            <div className="ml-auto text-sm text-gray-600">
              Selected: {selectedStudents.length} / {students.length}
            </div>
          </div>

          <div className="border rounded max-h-96 overflow-y-auto">
            {students.map((student) => (
              <div
                key={student._id}
                className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedStudents.includes(student._id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleStudent(student._id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => {}}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{student.fullName}</div>
                    <div className="text-sm text-gray-600">
                      ID: {student.studentId} | {student.program} | Batch: {student.batch}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={selectedStudents.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configuration */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 3: Answer Sheet Configuration</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Answer Pages
            </label>
            <input
              type="number"
              value={formData.numAnswerPages}
              onChange={(e) => setFormData({ ...formData, numAnswerPages: parseInt(e.target.value) })}
              min="1"
              max="50"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Number of ruled pages after the front cover (typically 6-14 pages)
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.includeGraphPaper}
                onChange={(e) => setFormData({ ...formData, includeGraphPaper: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Include Graph Paper Pages
              </span>
            </label>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-medium mb-2">Summary</h4>
            <ul className="text-sm space-y-1">
              <li>• Exam: {formData.examTitle}</li>
              <li>• Subject: {formData.subjectName} ({formData.subjectCode})</li>
              <li>• Students: {selectedStudents.length}</li>
              <li>• Pages per booklet: {formData.numAnswerPages + 1} (1 cover + {formData.numAnswerPages} answer pages)</li>
              <li>• Total PDFs to generate: {selectedStudents.length}</li>
            </ul>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Generate */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 4: Generate Answer Sheets</h3>
          
          <div className="bg-green-50 p-6 rounded text-center">
            <p className="text-lg mb-4">Ready to generate {selectedStudents.length} answer sheet booklets!</p>
            <p className="text-sm text-gray-600 mb-6">
              Each booklet will include a front cover with student details and QR code, 
              followed by {formData.numAnswerPages} ruled answer pages.
            </p>
            
            {!loading && !success && (
              <button
                onClick={handleGenerate}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-medium"
              >
                Generate Answer Sheets
              </button>
            )}

            {loading && (
              <div className="text-blue-600">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Generating PDF files... This may take a minute.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={loading}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Back
            </button>
            {success && (
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedStudents([]);
                  setSuccess('');
                  setFormData({
                    ...formData,
                    examId: '',
                    numAnswerPages: 10
                  });
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Create More
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerSheetCreator;
