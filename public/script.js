document.addEventListener('DOMContentLoaded', () => {
   const socket = io();
   
   let currentUser = { name: '', color: '' };
   let state = { boards: [], lists: [], tasks: [] };
   let onlineUsers = [];
   
   let currentBoardId = null;
   let isDragging = false;
   let searchQuery = '';
   let priorityFilter = '';
   let activeTaskId = null;
   
   const joinModal = document.getElementById('join-modal');
   const usernameInput = document.getElementById('username-input');
   const joinBtn = document.getElementById('join-btn');
   const appContainer = document.getElementById('app');
   
   const boardsListEl = document.getElementById('boards-list');
   const addBoardBtn = document.getElementById('add-board-btn');
   const currentBoardTitle = document.getElementById('current-board-title');
   const boardTypeBadge = document.getElementById('board-type');
   const boardCanvas = document.getElementById('board-canvas');
   const searchInput = document.getElementById('search-input');
   const filterPriority = document.getElementById('filter-priority');
   const presenceStack = document.getElementById('presence-stack');
   const themeBtn = document.getElementById('theme-btn');
   const exportBtn = document.getElementById('export-btn');
   
   const taskModalInfo = document.getElementById('task-modal');
   const closeTaskModal = document.getElementById('close-task-modal');
   
   const htmlEncode = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

   const savedName = localStorage.getItem('collab_username');
   if (savedName) usernameInput.value = savedName;

   joinBtn.addEventListener('click', () => {
      const name = usernameInput.value.trim();
      if (!name) return;
      const colors = ['#f85149', '#58a6ff', '#3fb950', '#a371f7', '#d29922', '#e34c26'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      currentUser = { name, color };
      localStorage.setItem('collab_username', name);
      socket.emit('join', currentUser);
      joinModal.classList.remove('active');
      joinModal.classList.add('hidden');
      appContainer.classList.remove('hidden');
   });

   // Setup Theme
   let isDark = true;
   themeBtn.addEventListener('click', () => {
       isDark = !isDark;
       document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
   });

   socket.on('presence', (users) => {
       onlineUsers = users;
       renderPresence();
   });

   socket.on('init', (initialState) => {
       state = initialState;
       if (!currentBoardId && state.boards.length > 0) currentBoardId = state.boards[0].id;
       renderAll();
   });

   socket.on('stateUpdate', (newState) => {
       state = newState;
       if (!state.boards.find(b => b.id === currentBoardId) && state.boards.length > 0) currentBoardId = state.boards[0].id;
       if (!isDragging) renderAll();
   });

   function renderAll() {
       renderSidebar();
       renderHeader();
       renderBoard();
       if (activeTaskId) updateTaskModalValues();
   }

   function renderPresence() {
       presenceStack.innerHTML = onlineUsers.map(u => {
           const initials = u.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
           return `<div class="avatar" style="background-color: ${u.color};" title="${htmlEncode(u.name)}">${initials}</div>`;
       }).join('');
   }

   function renderSidebar() {
      boardsListEl.innerHTML = state.boards.map(b => `
         <li class="board-item ${b.id === currentBoardId ? 'active' : ''}" data-id="${b.id}">
            <span class="board-icon" style="background: ${b.id === currentBoardId ? 'var(--accent)' : 'var(--text-secondary)'};"></span>
            ${htmlEncode(b.name)}
         </li>
      `).join('');

      document.querySelectorAll('.board-item').forEach(el => {
         el.addEventListener('click', (e) => {
             currentBoardId = e.currentTarget.getAttribute('data-id');
             renderAll();
         });
      });
   }

   function renderHeader() {
       const board = state.boards.find(b => b.id === currentBoardId);
       if (board) {
           currentBoardTitle.innerHTML = `${htmlEncode(board.name)} <span class="badge" id="board-type">${board.isPrivate ? 'Private Space' : 'Public Workspace'}</span>`;
       }
   }

   function renderBoard() {
      const boardLists = state.lists.filter(l => l.boardId === currentBoardId).sort((a,b)=> a.order - b.order);
      
      boardCanvas.innerHTML = boardLists.map(list => {
          let listTasks = state.tasks.filter(t => t.listId === list.id);
          
          if (searchQuery) {
              const q = searchQuery.toLowerCase();
              listTasks = listTasks.filter(t => (t.text || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
          }
          if (priorityFilter) {
              listTasks = listTasks.filter(t => t.priority === priorityFilter);
          }
          listTasks.sort((a,b) => (a.order || 0) - (b.order || 0));

          const tasksHtml = listTasks.map(task => {
              const cc = task.comments ? task.comments.length : 0;
              const hasDueDate = !!task.dueDate;
              return `
              <div class="card" data-id="${task.id}">
                  <div class="card-badges">
                      ${task.priority ? `<span class="tag tag-${task.priority}">${task.priority}</span>` : ''}
                  </div>
                  <div class="card-title">${htmlEncode(task.text)}</div>
                  <div class="card-footer">
                     ${hasDueDate ? `<div class="card-footer-item">📅 ${task.dueDate}</div>` : '<div></div>'}
                     <div style="display:flex; gap: 8px;">
                         ${cc > 0 ? `<div class="card-footer-item">💬 ${cc}</div>` : ''}
                         ${task.assignee ? `<div class="c-avatar" title="${htmlEncode(task.assignee)}">${task.assignee.substring(0,1).toUpperCase()}</div>` : ''}
                     </div>
                  </div>
              </div>`;
          }).join('');

          return `
          <div class="list" data-id="${list.id}">
             <div class="list-header">${htmlEncode(list.name)} <span>${listTasks.length}</span></div>
             <div class="list-cards" data-list-id="${list.id}">${tasksHtml}</div>
             <div class="list-footer">
                 <button class="add-card-btn" data-list-id="${list.id}">
                    <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> 
                    Add a card
                 </button>
             </div>
          </div>`;
      }).join('');

      boardCanvas.innerHTML += `
        <div class="list" style="background: transparent; border: 1px dashed var(--border-color); cursor: pointer; justify-content:center; align-items:center; opacity:0.6; min-height: 100px; box-shadow:none;" id="inline-add-list-btn">
             <div style="font-weight:600;">+ Add Another List</div>
        </div>
      `;

      document.querySelectorAll('.add-card-btn').forEach(btn => {
         btn.addEventListener('click', (e) => {
             const listId = e.currentTarget.getAttribute('data-list-id');
             const text = prompt('Task title:');
             if(text) {
                 socket.emit('action', { type: 'CREATE_TASK', payload: {
                     id: 't_'+Date.now(), listId, text, priority: 'Medium', description: '', dueDate: '', assignee: '', comments: [], order: Date.now()
                 }});
             }
         });
      });

      const inlineListBtn = document.getElementById('inline-add-list-btn');
      if (inlineListBtn) {
          inlineListBtn.addEventListener('click', () => {
             const name = prompt('New list name:');
             if (name) {
                 socket.emit('action', { type: 'CREATE_LIST', payload: { id: 'l_'+Date.now(), boardId: currentBoardId, name, order: boardLists.length } });
             }
          });
      }

      document.querySelectorAll('.card').forEach(card => card.addEventListener('click', (e) => {
             activeTaskId = e.currentTarget.getAttribute('data-id');
             openTaskModal(activeTaskId);
      }));

      initSortable();
   }

   function initSortable() {
       document.querySelectorAll('.list-cards').forEach(container => {
           new Sortable(container, {
               group: 'shared',
               animation: 150,
               ghostClass: 'sortable-ghost',
               dragClass: 'sortable-drag',
               onStart: () => isDragging = true,
               onEnd: (evt) => {
                   isDragging = false;
                   const toListId = evt.to.getAttribute('data-list-id');
                   const siblings = Array.from(evt.to.children);
                   const updates = siblings.map((el, index) => ({ id: el.getAttribute('data-id'), listId: toListId, order: index }));
                   socket.emit('action', { type: 'REORDER', payload: { tasksOrder: updates } });
               }
           });
       });
   }

   searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderBoard(); });
   filterPriority.addEventListener('change', (e) => { priorityFilter = e.target.value; renderBoard(); });

   addBoardBtn.addEventListener('click', () => {
       const boardName = prompt('Enter new board name:');
       if (boardName) socket.emit('action', { type: 'CREATE_BOARD', payload: { id: 'b_'+Date.now(), name: boardName, isPrivate: false } });
   });

   document.getElementById('undo-btn').addEventListener('click', () => socket.emit('action', {type:'UNDO'}));
   document.getElementById('redo-btn').addEventListener('click', () => socket.emit('action', {type:'REDO'}));
   exportBtn.addEventListener('click', () => {
       const boardTasks = state.tasks.filter(t => state.lists.find(l => l.id === t.listId && l.boardId === currentBoardId));
       const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boardTasks, null, 2));
       const downloadAnchorNode = document.createElement('a');
       downloadAnchorNode.setAttribute("href", dataStr);
       downloadAnchorNode.setAttribute("download", `collab_board_${currentBoardId}_export.json`);
       document.body.appendChild(downloadAnchorNode);
       downloadAnchorNode.click();
       downloadAnchorNode.remove();
   });

   // Modal
   const mTitle = document.getElementById('modal-task-title');
   const mDesc = document.getElementById('modal-task-desc');
   const mPriority = document.getElementById('modal-task-priority');
   const mAssignee = document.getElementById('modal-task-assignee');
   const mDueDate = document.getElementById('modal-task-dueDate');
   const mComments = document.getElementById('modal-comments-list');
   const mCommentInput = document.getElementById('modal-comment-input');

   function openTaskModal() {
       updateTaskModalValues();
       taskModalInfo.classList.remove('hidden');
       taskModalInfo.classList.add('active');
   }

   function updateTaskModalValues() {
       if(!activeTaskId) return;
       const task = state.tasks.find(x => x.id === activeTaskId);
       if(!task) { closeTaskModalFn(); return; }
       
       mTitle.value = task.text || '';
       mDesc.value = task.description || '';
       mPriority.value = task.priority || 'Medium';
       mAssignee.value = task.assignee || '';
       mDueDate.value = task.dueDate || '';
       
       mComments.innerHTML = (task.comments || []).map(c => `
         <div class="comment">
            <span class="comment-author">${htmlEncode(c.author)}</span><span class="comment-time">${c.time}</span>
            <div style="margin-top: 4px; color: var(--text-primary); line-height: 1.4;">${htmlEncode(c.text)}</div>
         </div>
       `).join('');
   }

   function saveModalChanges() {
       if(!activeTaskId) return;
       const task = state.tasks.find(x => x.id === activeTaskId);
       if(!task) return;
       if (task.text !== mTitle.value || task.description !== mDesc.value || task.priority !== mPriority.value || task.assignee !== mAssignee.value || task.dueDate !== mDueDate.value) {
           socket.emit('action', { type: 'UPDATE_TASK', payload: {
               id: activeTaskId, updates: { text: mTitle.value, description: mDesc.value, priority: mPriority.value, assignee: mAssignee.value, dueDate: mDueDate.value }
           }});
       }
   }

   function closeTaskModalFn() {
       saveModalChanges();
       taskModalInfo.classList.remove('active');
       setTimeout(() => { taskModalInfo.classList.add('hidden'); activeTaskId = null; }, 300);
   }

   closeTaskModal.addEventListener('click', closeTaskModalFn);
   
   document.getElementById('add-comment-btn').addEventListener('click', () => {
       const text = mCommentInput.value.trim();
       if (text && activeTaskId) {
           socket.emit('action', { type: 'ADD_COMMENT', payload: { taskId: activeTaskId, comment: { text, author: currentUser.name, time: new Date().toLocaleTimeString() } } });
           mCommentInput.value = '';
       }
   });

   document.getElementById('modal-task-delete').addEventListener('click', () => {
       if (confirm('Are you sure you want to delete this task?')) {
           socket.emit('action', { type: 'DELETE_TASK', payload: { id: activeTaskId } });
           activeTaskId = null; // Prevent saveModalChanges from running
           taskModalInfo.classList.remove('active');
           setTimeout(() => taskModalInfo.classList.add('hidden'), 300);
       }
   });
});
