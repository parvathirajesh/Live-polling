// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect } from 'react';
import { usePoll } from '../contexts/PollContext';
import PollResults from './PollResults';
import { User, Clock, CheckCircle } from 'lucide-react';

interface StudentInterfaceProps {
  studentName: string;
  onNameSubmit: (name: string) => void;
}

const StudentInterface: React.FC<StudentInterfaceProps> = ({ studentName, onNameSubmit }) => {
  const { currentPoll, hasAnswered, timeLeft, submitAnswer } = usePoll();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [name, setName] = useState(studentName);

  if (!studentName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join the Poll</h1>
            <p className="text-gray-600">Enter your name to participate in live polling</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) {
              onNameSubmit(name.trim());
            }
          }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-6"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Join Polling Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null && currentPoll) {
      submitAnswer(selectedAnswer);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {studentName}</h1>
                <p className="text-sm text-gray-500">Student Dashboard</p>
              </div>
            </div>

            {currentPoll && timeLeft > 0 && !hasAnswered && (
              <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                <Clock size={16} />
                <span>{timeLeft}s to answer</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentPoll ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Poll</h2>
            <p className="text-gray-600">Your teacher will start a poll soon. Stay tuned!</p>
          </div>
        ) : hasAnswered || timeLeft === 0 ? (
          <div className="space-y-6">
            {hasAnswered && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Answer Submitted!</h3>
                    <p className="text-green-700">Thank you for participating. View the results below.</p>
                  </div>
                </div>
              </div>
            )}
            <PollResults showTitle />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentPoll.question}</h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-orange-800">
                  <Clock size={16} />
                  <span className="font-medium">Time remaining: {timeLeft} seconds</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {currentPoll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index 
                        ? 'border-green-500 bg-green-500 text-white' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                selectedAnswer !== null
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;
