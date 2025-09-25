import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';

interface Poll {
  id: string;
  question: string;
  options: string[];
  createdAt: number;
}

interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  joinedAt?: number;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  senderType: 'teacher' | 'student' | 'ai' | 'system';
  timestamp: number;
}

interface PollHistory {
  id: string;
  question: string;
  options: string[];
  results: Record<number, number>;
  createdAt: number;
  endedAt: number;
  totalVotes: number;
}

interface PollContextType {
  currentPoll: Poll | null;
  pollResults: Record<number, number> | null;
  students: Student[];
  hasAnswered: boolean;
  timeLeft: number;
  canCreateNewPoll: boolean;
  chatMessages: ChatMessage[];
  pollHistory: PollHistory[];
  createPoll: (question: string, options: string[]) => void;
  submitAnswer: (answerIndex: number) => void;
  sendChatMessage: (message: string, senderName: string, senderType: 'teacher' | 'student') => void;
  removeStudent: (studentId: string) => void;
  getPollHistory: () => void;
}

const PollContext = createContext<PollContextType | null>(null);

export const usePoll = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};

interface PollProviderProps {
  children: ReactNode;
  socket: Socket;
}

export const PollProvider: React.FC<PollProviderProps> = ({ children, socket }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<Record<number, number> | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canCreateNewPoll, setCanCreateNewPoll] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pollHistory, setPollHistory] = useState<PollHistory[]>([]);

  useEffect(() => {
    socket.on('poll-created', (poll: Poll) => {
      console.log('Poll created received:', poll);
      setCurrentPoll(poll);
      // Initialize results with zeros for each option
      const initialResults: Record<number, number> = {};
      poll.options.forEach((_, index) => {
        initialResults[index] = 0;
      });
      setPollResults(initialResults);
      setHasAnswered(false);
      setTimeLeft(60);
    });

    socket.on('poll-results', (results: Record<number, number>) => {
      console.log('Poll results received:', results);
      setPollResults(results);
    });

    socket.on('students-updated', (updatedStudents: Student[]) => {
      console.log('Students updated:', updatedStudents);
      setStudents(updatedStudents);
    });

    socket.on('timer-update', (time: number) => {
      setTimeLeft(time);
    });

    socket.on('poll-ended', () => {
      console.log('Poll ended');
      setTimeLeft(0);
      setCanCreateNewPoll(true);
    });

    socket.on('can-create-new-poll', (canCreate: boolean) => {
      console.log('Can create new poll:', canCreate);
      setCanCreateNewPoll(canCreate);
    });

    socket.on('answer-submitted', () => {
      console.log('Answer submitted successfully');
      setHasAnswered(true);
    });

    socket.on('chat-messages', (messages: ChatMessage[]) => {
      console.log('Received chat messages:', messages);
      setChatMessages(messages);
    });

    socket.on('poll-history', (history: PollHistory[]) => {
      console.log('Received poll history:', history);
      setPollHistory(history);
    });

    socket.on('removed-by-teacher', () => {
      alert('You have been removed from the session by the teacher.');
      window.location.reload();
    });

    socket.on('error', (error: string) => {
      console.error('Socket error:', error);
      alert(error);
    });

    return () => {
      socket.off('poll-created');
      socket.off('poll-results');
      socket.off('students-updated');
      socket.off('timer-update');
      socket.off('poll-ended');
      socket.off('can-create-new-poll');
      socket.off('answer-submitted');
      socket.off('chat-messages');
      socket.off('poll-history');
      socket.off('removed-by-teacher');
      socket.off('error');
    };
  }, [socket]);

  const createPoll = (question: string, options: string[]) => {
    console.log('Creating poll:', question, options);
    socket.emit('create-poll', { question, options });
  };

  const submitAnswer = (answerIndex: number) => {
    console.log('Submitting answer:', answerIndex);
    socket.emit('submit-answer', { answerIndex });
  };

  const sendChatMessage = (message: string, senderName: string, senderType: 'teacher' | 'student') => {
    console.log('Sending chat message:', { message, senderName, senderType });
    socket.emit('send-chat-message', { message, senderName, senderType });
  };

  const removeStudent = (studentId: string) => {
    socket.emit('remove-student', { studentId });
  };

  const getPollHistory = () => {
    socket.emit('get-poll-history');
  };

  return (
    <PollContext.Provider value={{
      currentPoll,
      pollResults,
      students,
      hasAnswered,
      timeLeft,
      canCreateNewPoll,
      chatMessages,
      pollHistory,
      createPoll,
      submitAnswer,
      sendChatMessage,
      removeStudent,
      getPollHistory
    }}>
      {children}
    </PollContext.Provider>
  );
};