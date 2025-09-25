import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// Enhanced in-memory storage
let currentPoll = null;
let pollResults = {};
let students = new Map();
let teachers = new Set();
let pollTimer = null;
let timeLeft = 60;
let pollHistory = [];
let chatMessages = [];

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const broadcastStudentsUpdate = () => {
  const studentsArray = Array.from(students.values());
  io.emit('students-updated', studentsArray);
  console.log('Broadcasting students update:', studentsArray.length, 'students');
};

const broadcastPollResults = () => {
  io.emit('poll-results', pollResults);
  console.log('Broadcasting poll results:', pollResults);
};

const broadcastChatMessages = () => {
  io.emit('chat-messages', chatMessages);
};

const startPollTimer = () => {
  timeLeft = 60;
  io.emit('timer-update', timeLeft);
  
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  console.log('Starting poll timer for 60 seconds');
  
  pollTimer = setInterval(() => {
    timeLeft--;
    io.emit('timer-update', timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(pollTimer);
      pollTimer = null;
      console.log('Poll timer ended');
      
      // Save poll to history
      if (currentPoll) {
        pollHistory.push({
          ...currentPoll,
          results: { ...pollResults },
          endedAt: Date.now(),
          totalVotes: Object.values(pollResults).reduce((sum, count) => sum + count, 0)
        });
      }
      
      io.emit('poll-ended');
      checkCanCreateNewPoll();
    }
  }, 1000);
};

const checkCanCreateNewPoll = () => {
  const allStudentsAnswered = Array.from(students.values()).every(student => student.hasAnswered);
  const noCurrentPoll = !currentPoll;
  const pollEnded = timeLeft <= 0;
  
  const canCreate = noCurrentPoll || pollEnded || allStudentsAnswered;
  console.log('Can create new poll:', canCreate, {
    noCurrentPoll,
    pollEnded,
    allStudentsAnswered,
    studentsCount: students.size
  });
  
  io.emit('can-create-new-poll', canCreate);
  return canCreate;
};

// AI Chat responses (simple rule-based for demo)
const generateAIResponse = (message, senderName, senderType) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return "I'm here to help! Teachers can create polls and view results. Students can join by entering their name and answering questions within 60 seconds.";
  } else if (lowerMessage.includes('poll') || lowerMessage.includes('question')) {
    return "Polls are great for getting instant feedback! Teachers can create multiple choice questions, and everyone can see live results.";
  } else if (lowerMessage.includes('time') || lowerMessage.includes('timer')) {
    return "Each poll has a 60-second timer. Make sure to answer quickly! Results are shown after time runs out or everyone answers.";
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello ${senderName}! Welcome to the Live Polling System. How can I assist you today?`;
  } else if (lowerMessage.includes('thank')) {
    return "You're welcome! I'm always here to help make your polling experience better.";
  } else {
    return "That's an interesting point! Feel free to ask me about polls, timers, or how to use the system effectively.";
  }
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current state to new connection
  socket.emit('poll-history', pollHistory);
  socket.emit('chat-messages', chatMessages);

  // Send current state to new connection
  socket.emit('poll-history', pollHistory);
  socket.emit('chat-messages', chatMessages);

  socket.on('join-as-teacher', () => {
    teachers.add(socket.id);
    console.log('Teacher joined:', socket.id);
    
    // Send current state to teacher
    if (currentPoll) {
      socket.emit('poll-created', currentPoll);
      socket.emit('poll-results', pollResults);
      socket.emit('timer-update', timeLeft);
    }
    
    socket.emit('poll-history', pollHistory);
    socket.emit('poll-history', pollHistory);
    broadcastStudentsUpdate();
    socket.emit('can-create-new-poll', checkCanCreateNewPoll());
  });

  socket.on('join-as-student', ({ name }) => {
    if (!name || name.trim() === '') {
      socket.emit('error', 'Name is required');
      return;
    }

    const student = {
      id: socket.id,
      name: name.trim(),
      hasAnswered: false,
      joinedAt: Date.now()
    };
    
    students.set(socket.id, student);
    console.log('Student joined:', name, 'Total students:', students.size);
    
    // Send current state to student
    if (currentPoll) {
      socket.emit('poll-created', currentPoll);
      socket.emit('poll-results', pollResults);
      socket.emit('timer-update', timeLeft);
    }
    
    broadcastStudentsUpdate();
    socket.emit('can-create-new-poll', checkCanCreateNewPoll());
  });

  socket.on('create-poll', ({ question, options }) => {
    if (!teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can create polls');
      return;
    }

    if (!question || !options || options.length < 2) {
      socket.emit('error', 'Invalid poll data');
      return;
    }

    if (!checkCanCreateNewPoll()) {
      socket.emit('error', 'Cannot create poll at this time');
      return;
    }

    console.log('Creating new poll:', question, options);
    
    // Reset poll state
    currentPoll = {
      id: generateId(),
      question: question.trim(),
      options: options.map(opt => opt.trim()).filter(opt => opt !== ''),
      createdAt: Date.now()
    };
    
    // Initialize results
    pollResults = {};
    currentPoll.options.forEach((_, index) => {
      pollResults[index] = 0;
    });
    
    // Reset student answered status
    students.forEach(student => {
      student.hasAnswered = false;
    });
    
    console.log('Poll created successfully:', currentPoll);
    console.log('Initial results:', pollResults);
    
    // Start timer and broadcast
    startPollTimer();
    io.emit('poll-created', currentPoll);
    io.emit('poll-results', pollResults);
    broadcastStudentsUpdate();
    io.emit('can-create-new-poll', false);
    
    // Add system message to chat
    chatMessages.push({
      id: generateId(),
      message: `New poll created: "${question}"`,
      sender: 'System',
      senderType: 'system',
      timestamp: Date.now()
    });
    broadcastChatMessages();
  });

  socket.on('submit-answer', ({ answerIndex }) => {
    const student = students.get(socket.id);
    if (!student) {
      socket.emit('error', 'Student not found');
      return;
    }

    if (student.hasAnswered) {
      socket.emit('error', 'You have already answered this poll');
      return;
    }

    if (timeLeft <= 0) {
      socket.emit('error', 'Time is up for this poll');
      return;
    }

    if (!currentPoll) {
      socket.emit('error', 'No active poll');
      return;
    }

    if (answerIndex < 0 || answerIndex >= currentPoll.options.length) {
      socket.emit('error', 'Invalid answer');
      return;
    }
    
    console.log(`Student ${student.name} submitting answer:`, answerIndex);
    
    // Mark student as answered
    student.hasAnswered = true;
    students.set(socket.id, student);
    
    // Update results
    pollResults[answerIndex] = (pollResults[answerIndex] || 0) + 1;
    
    console.log('Updated poll results:', pollResults);
    
    // Notify student that answer was submitted
    socket.emit('answer-submitted');
    
    // Broadcast updates
    broadcastPollResults();
    broadcastStudentsUpdate();
    
    // Check if all students have answered
    const allAnswered = Array.from(students.values()).every(s => s.hasAnswered);
    if (allAnswered && students.size > 0) {
      console.log('All students have answered, ending poll early');
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      timeLeft = 0;
      io.emit('timer-update', 0);
      io.emit('poll-ended');
      
      // Save to history
      if (currentPoll) {
        pollHistory.push({
          ...currentPoll,
          results: { ...pollResults },
          endedAt: Date.now(),
          totalVotes: Object.values(pollResults).reduce((sum, count) => sum + count, 0)
        });
        
        // Add system message
        chatMessages.push({
          id: generateId(),
          message: `Poll ended: "${currentPoll.question}" - ${Object.values(pollResults).reduce((sum, count) => sum + count, 0)} total responses`,
          sender: 'System',
          senderType: 'system',
          timestamp: Date.now()
        });
        broadcastChatMessages();
      }
    }
    
    checkCanCreateNewPoll();
  });

  socket.on('send-chat-message', ({ message, senderName, senderType }) => {
    if (!message || message.trim() === '') return;

    console.log('Received chat message:', { message, senderName, senderType });

    const chatMessage = {
      id: generateId(),
      message: message.trim(),
      sender: senderName || 'Anonymous',
      senderType: senderType || 'student',
      timestamp: Date.now()
    };

    chatMessages.push(chatMessage);
    console.log('Broadcasting chat message:', chatMessage);
    broadcastChatMessages();

    // Generate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: generateId(),
        message: generateAIResponse(message, senderName, senderType),
        sender: 'AI Assistant',
        senderType: 'ai',
        timestamp: Date.now()
      };

      console.log('Sending AI response:', aiResponse);
      chatMessages.push(aiResponse);
      broadcastChatMessages();
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  });

  socket.on('remove-student', ({ studentId }) => {
    if (!teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can remove students');
      return;
    }

    const student = students.get(studentId);
    if (student) {
      students.delete(studentId);
      console.log('Student removed:', student.name);
      
      // Disconnect the student
      const studentSocket = io.sockets.sockets.get(studentId);
      if (studentSocket) {
        studentSocket.emit('removed-by-teacher');
        studentSocket.disconnect();
      }
      
      broadcastStudentsUpdate();
      checkCanCreateNewPoll();
    }
  });

  socket.on('get-poll-history', () => {
    if (teachers.has(socket.id)) {
      socket.emit('poll-history', pollHistory);
    }
  });

  socket.on('get-poll-history', () => {
    if (teachers.has(socket.id)) {
      socket.emit('poll-history', pollHistory);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from teachers or students
    const wasTeacher = teachers.has(socket.id);
    const wasStudent = students.has(socket.id);
    
    teachers.delete(socket.id);
    
    if (wasStudent) {
      const student = students.get(socket.id);
      if (student) {
        console.log('Student disconnected:', student.name);
      }
      students.delete(socket.id);
    }
    
    if (wasStudent || wasTeacher) {
      broadcastStudentsUpdate();
      checkCanCreateNewPoll();
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeStudents: students.size,
    activeTeachers: teachers.size,
    currentPoll: currentPoll ? currentPoll.question : null
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Live Polling System Backend Started`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (pollTimer) {
    clearInterval(pollTimer);
  }
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (pollTimer) {
    clearInterval(pollTimer);
  }
  server.close(() => {
    console.log('Process terminated');
  });
});