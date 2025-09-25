import React from 'react';
import { usePoll } from '../contexts/PollContext';
import { BarChart3 } from 'lucide-react';

interface PollResultsProps {
  showTitle?: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({ showTitle = false }) => {
  const { currentPoll, pollResults } = usePoll();

  if (!currentPoll || !pollResults) {
    return null;
  }

  const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {showTitle && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Poll Results</h2>
            <p className="text-sm text-gray-500">{totalVotes} total responses</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{currentPoll.question}</h3>
      </div>

      <div className="space-y-4">
        {currentPoll.options.map((option, index) => {
          const votes = pollResults[index] || 0;
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-medium text-gray-900">{option}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{votes} votes</span>
                  <span>({percentage}%)</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {totalVotes === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No responses yet. Waiting for students to answer...</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
