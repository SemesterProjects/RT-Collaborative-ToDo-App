const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Application State
let state = {
  boards: [
    { id: 'b1', name: 'General Workspace', isPrivate: false },
    { id: 'b2', name: 'Personal Tasks', isPrivate: false }
  ],
  lists: [
    { id: 'l1', boardId: 'b1', name: 'Open Issues', order: 0 },
    { id: 'l2', boardId: 'b1', name: 'In Progress', order: 1 },
    { id: 'l3', boardId: 'b1', name: 'Resolved', order: 2 },
    { id: 'l4', boardId: 'b2', name: 'To Do', order: 0 },
    { id: 'l5', boardId: 'b2', name: 'Done', order: 1 }
  ],
  tasks: [
    { id: 't1', listId: 'l1', text: 'Define real-time architecture', description: 'Investigate socket.io vs websockets', assignee: 'John', priority: 'High', dueDate: '2026-03-20', comments: [] }
  ]
};

let historyStack = [];
let redoStack = [];

function saveToHistory() {
  historyStack.push(JSON.parse(JSON.stringify(state)));
  if (historyStack.length > 50) historyStack.shift();
  redoStack = []; 
}

let connectedUsers = {};

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    connectedUsers[socket.id] = { id: socket.id, name: user.name, color: user.color };
    io.emit('presence', Object.values(connectedUsers));
    socket.emit('init', state);
  });

  socket.on('action', (action) => {
    if (['CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK', 'MOVE_TASK', 'ADD_COMMENT', 'REORDER', 'CREATE_BOARD', 'CREATE_LIST'].includes(action.type)) {
      saveToHistory();
    }

    switch(action.type) {
      case 'CREATE_TASK':
        state.tasks.push(action.payload);
        break;
      case 'UPDATE_TASK':
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = { ...state.tasks[idx], ...action.payload.updates };
        break;
      case 'DELETE_TASK':
        state.tasks = state.tasks.filter(t => t.id !== action.payload.id);
        break;
      case 'MOVE_TASK':
        const task = state.tasks.find(x => x.id === action.payload.taskId);
        if (task) {
           task.listId = action.payload.newListId;
        }
        break;
      case 'REORDER':
        if (action.payload && action.payload.tasksOrder) {
           action.payload.tasksOrder.forEach(item => {
              const t = state.tasks.find(x => x.id === item.id);
              if (t) { t.listId = item.listId; t.order = item.order; }
           });
        }
        break;
      case 'ADD_COMMENT':
        const tc = state.tasks.find(x => x.id === action.payload.taskId);
        if (tc) {
            tc.comments = tc.comments || [];
            tc.comments.push(action.payload.comment);
        }
        break;
      case 'CREATE_BOARD':
        state.boards.push(action.payload);
        state.lists.push({ id: 'l1_'+action.payload.id, boardId: action.payload.id, name: 'To Do', order: 0 });
        state.lists.push({ id: 'l2_'+action.payload.id, boardId: action.payload.id, name: 'In Progress', order: 1 });
        state.lists.push({ id: 'l3_'+action.payload.id, boardId: action.payload.id, name: 'Done', order: 2 });
        break;
      case 'CREATE_LIST':
        state.lists.push(action.payload);
        break;
      case 'UNDO':
        if (historyStack.length > 0) {
          redoStack.push(JSON.parse(JSON.stringify(state)));
          state = historyStack.pop();
        }
        break;
      case 'REDO':
        if (redoStack.length > 0) {
          historyStack.push(JSON.parse(JSON.stringify(state)));
          state = redoStack.pop();
        }
        break;
    }
    
    io.emit('stateUpdate', state);
  });

  socket.on('disconnect', () => {
    delete connectedUsers[socket.id];
    io.emit('presence', Object.values(connectedUsers));
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
