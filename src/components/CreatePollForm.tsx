import React, { useState } from 'react';
import { usePoll } from '../contexts/PollContext';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreatePollFormProps {
  onPollCreated: () => void;
  canCreate: boolean;
}

const CreatePollForm: React.FC<CreatePollFormProps> = ({ onPollCreated, canCreate }) => {
  const { createPoll } = usePoll();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && options.every(opt => opt.trim()) && canCreate) {
      createPoll(question.trim(), options.map(opt => opt.trim()));
      setQuestion('');
      setOptions(['', '']);
      onPollCreated();
    }
  };

  if (!canCreate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">Cannot Create Poll</h3>
            <p className="text-yellow-700">Wait for all students to answer the current question before creating a new poll.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
          Poll Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your poll question here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Answer Options
          </label>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add Option</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                {String.fromCharCode(65 + index)}
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Create Poll
        </button>
      </div>
    </form>
  );
};

export default CreatePollForm;
