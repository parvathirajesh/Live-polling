import React from 'react';
import { Users, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'teacher' | 'student') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Live Polling System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create interactive polls and get real-time responses from your audience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div 
            onClick={() => onSelectRole('teacher')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
          >
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <GraduationCap size={48} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Teacher</h2>
              <p className="text-gray-600 mb-6">
                Create polls, ask questions, and view live results from your students
              </p>
              <div className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Teaching
              </div>
            </div>
          </div>

          <div 
            onClick={() => onSelectRole('student')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
          >
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Users size={48} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Student</h2>
              <p className="text-gray-600 mb-6">
                Join live polls, submit your answers, and see results in real-time
              </p>
              <div className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Join Polling
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
