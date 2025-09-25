import React, { useState } from 'react';
import { usePoll } from '../contexts/PollContext';
import CreatePollForm from './CreatePollForm';
import PollResults from './PollResults';
import ActiveStudents from './ActiveStudents';
import { Users, BarChart3, Plus, Timer } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { currentPoll, students, timeLeft, canCreateNewPoll } = usePoll();
  const [showCreateForm, setShowCreateForm] = useState(!currentPoll);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your live polls</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{students.length} students online</span>
              </div>
              
              {currentPoll && timeLeft > 0 && (
                <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Timer size={16} />
                  <span>{timeLeft}s remaining</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {!currentPoll || showCreateForm ? (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center mb-8">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Poll</h2>
                  <p className="text-gray-600">Ask a question and get instant feedback from your students</p>
                </div>
                
                <CreatePollForm 
                  onPollCreated={() => setShowCreateForm(false)}
                  canCreate={canCreateNewPoll}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Poll */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Current Poll</h2>
                    {canCreateNewPoll && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>New Poll</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {currentPoll.question}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentPoll.options.map((option, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border text-gray-700">
                          {String.fromCharCode(65 + index)}. {option}
                        </div>
                      ))}
                    </div>
                  </div>

                  {timeLeft === 0 && <PollResults />}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActiveStudents />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;