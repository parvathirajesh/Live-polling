import React from 'react';
import { usePoll } from '../contexts/PollContext';
import { Users, CheckCircle, Clock, UserX } from 'lucide-react';

interface ActiveStudentsProps {
  userType?: 'teacher' | 'student';
}

const ActiveStudents: React.FC<ActiveStudentsProps> = ({ userType = 'student' }) => {
  const { students, currentPoll, removeStudent } = usePoll();

  const handleRemoveStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      removeStudent(studentId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Students</h2>
          <p className="text-sm text-gray-500">{students.length} online</p>
        </div>
      </div>

      <div className="space-y-3">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No students online</p>
        ) : (
          students.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{student.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {currentPoll && (
                  student.hasAnswered ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )
                )}
                
                {userType === 'teacher' && (
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Remove student"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {currentPoll && students.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Response Rate</span>
              <span>{students.filter(s => s.hasAnswered).length}/{students.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(students.filter(s => s.hasAnswered).length / students.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveStudents;