import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';
import { PollProvider } from './contexts/PollContext';

const socket: Socket = io('http://localhost:3001');

function App() {
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(null);
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRoleSelection = (role: 'teacher' | 'student') => {
    setUserType(role);
    if (role === 'teacher') {
      socket.emit('join-as-teacher');
    }
  };

  const handleStudentNameSubmit = (name: string) => {
    setStudentName(name);
    socket.emit('join-as-student', { name });
  };

  if (!userType) {
    return <LandingPage onSelectRole={handleRoleSelection} />;
  }

  return (
    <PollProvider socket={socket}>
      {userType === 'teacher' ? (
        <TeacherDashboard />
      ) : (
        <StudentInterface 
          studentName={studentName}
          onNameSubmit={handleStudentNameSubmit}
        />
      )}
    </PollProvider>
  );
}

export default App;