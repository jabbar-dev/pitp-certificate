import React, { useState, useEffect } from 'react';
import { markingService, examService, rubricService } from '../services/api';

const MarkingInterface = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [tasks, setTasks] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [marks, setMarks] = useState({
    questionLabel: '',
    provisionalScore: 0,
    comments: [],
    finalized: false
  });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      loadRubrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam]);

  const loadExams = async () => {
    try {
      const response = await examService.getAll({ status: 'scanned' });
      setExams(response.data.data);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await markingService.getTasks();
      setTasks(response.data.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const loadRubrics = async () => {
    try {
      const response = await rubricService.getByExam(selectedExam);
      setRubrics(response.data.data);
    } catch (err) {
      console.error('Failed to load rubrics:', err);
    }
  };

  const applyRubric = (rubric) => {
    setMarks({
      ...marks,
      comments: [
        ...marks.comments,
        {
          text: rubric.description,
          rubricItem: rubric._id,
          deltaMarks: rubric.deltaMarks
        }
      ],
      provisionalScore: marks.provisionalScore + rubric.deltaMarks
    });
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    setMarks({
      ...marks,
      comments: [
        ...marks.comments,
        {
          text: newComment,
          deltaMarks: 0
        }
      ]
    });
    setNewComment('');
  };

  const removeComment = (index) => {
    const comment = marks.comments[index];
    setMarks({
      ...marks,
      comments: marks.comments.filter((_, i) => i !== index),
      provisionalScore: marks.provisionalScore - (comment.deltaMarks || 0)
    });
  };

  const handleSubmit = async () => {
    if (!selectedExam || !marks.questionLabel) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await markingService.submit({
        exam: selectedExam,
        student: tasks[0]?.student?._id, // Use first task student for demo
        questionLabel: marks.questionLabel,
        comments: marks.comments,
        provisionalScore: marks.provisionalScore,
        finalized: marks.finalized
      });

      setSuccess('Marks submitted successfully!');
      setMarks({
        questionLabel: '',
        provisionalScore: 0,
        comments: [],
        finalized: false
      });
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Digital Marking Workspace</h2>
        <p className="text-green-100">Mark student answers with rubrics and annotations</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg text-green-800 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Student Answer View */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Student Answer
          </h3>

          {/* Exam Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exam
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose an exam...</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.examCode} - {exam.title}
                </option>
              ))}
            </select>
          </div>

          {/* Answer Display Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 min-h-[500px] bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">Student answer will appear here</p>
              <p className="text-sm mt-2">Select an exam and question to begin marking</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Marking Tools */}
        <div className="space-y-6">
          {/* Rubrics */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Rubric Items
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rubrics.length > 0 ? (
                rubrics.map((rubric) => (
                  <button
                    key={rubric._id}
                    onClick={() => applyRubric(rubric)}
                    className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{rubric.shortCode}</div>
                        <div className="text-xs text-gray-600 mt-1">{rubric.description}</div>
                      </div>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                        rubric.deltaMarks >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rubric.deltaMarks > 0 ? '+' : ''}{rubric.deltaMarks}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No rubrics available for this exam
                </p>
              )}
            </div>
          </div>

          {/* Question & Score */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Scoring</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Label
                </label>
                <input
                  type="text"
                  value={marks.questionLabel}
                  onChange={(e) => setMarks({ ...marks, questionLabel: e.target.value })}
                  placeholder="e.g., Q1(a)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score
                </label>
                <input
                  type="number"
                  value={marks.provisionalScore}
                  onChange={(e) => setMarks({ ...marks, provisionalScore: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-2xl font-bold text-center"
                />
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
                  {marks.comments.map((comment, index) => (
                    <div key={index} className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                      <div className="flex-1 text-sm text-gray-700">{comment.text}</div>
                      {comment.deltaMarks !== 0 && (
                        <span className={`text-xs font-bold ${
                          comment.deltaMarks > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comment.deltaMarks > 0 ? '+' : ''}{comment.deltaMarks}
                        </span>
                      )}
                      <button
                        onClick={() => removeComment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <button
                    onClick={addComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Finalize checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marks.finalized}
                  onChange={(e) => setMarks({ ...marks, finalized: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Finalize marking</span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 font-medium shadow-lg transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Marks'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkingInterface;
