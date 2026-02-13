 // Data
  let tasks = [];
  let selectedSubject = '';
  let selectedTime = '';
  let editingTaskId = null;

  const SUBJECTS = [
    { name: 'Math', class: 'subject-math' },
    { name: 'Science', class: 'subject-science' },
    { name: 'English', class: 'subject-english' },
    { name: 'History', class: 'subject-history' },
    { name: 'Art', class: 'subject-art' },
    { name: 'CS', class: 'subject-cs' },
  ];

  const TIME_OPTIONS = ['15m', '30m', '45m', '1h', '1.5h', '2h', '3h'];

  // Persistence - using a simple in-memory store since localStorage is blocked
  let dataStore = null;

  function loadTasks() {
    try {
      const stored = localStorage.getItem('studyflow_tasks');
      if (stored) {
        tasks = JSON.parse(stored);
      }
    } catch(e) {
      if (dataStore) {
        tasks = JSON.parse(dataStore);
      }
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
    } catch(e) {
      dataStore = JSON.stringify(tasks);
    }
  }

  // Date utils
  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const todayStr = getTodayStr();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatHeaderDate() {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // Get subject class
  function getSubjectClass(subject) {
    const found = SUBJECTS.find(s => s.name.toLowerCase() === subject.toLowerCase());
    return found ? found.class : 'subject-default';
  }

  // Toast
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Modal
  function openModal() {
    selectedSubject = '';
    selectedTime = '30m';
    editingTaskId = null;
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDate').value = getTodayStr();
    document.getElementById('customSubject').value = '';
    renderSubjectChips();
    renderTimeChips();
    document.getElementById('modalOverlay').classList.add('active');
    setTimeout(() => document.getElementById('taskTitle').focus(), 350);
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  }

  function renderSubjectChips() {
    const container = document.getElementById('subjectOptions');
    container.innerHTML = SUBJECTS.map(s =>
      `<button class="subject-chip ${s.class} ${selectedSubject === s.name ? 'selected' : ''}"
              onclick="selectSubject('${s.name}')">${s.name}</button>`
    ).join('');
  }

  function selectSubject(name) {
    selectedSubject = name;
    document.getElementById('customSubject').value = '';
    renderSubjectChips();
  }

  function renderTimeChips() {
    const container = document.getElementById('timeOptions');
    container.innerHTML = TIME_OPTIONS.map(t =>
      `<button class="time-chip ${selectedTime === t ? 'selected' : ''}"
              onclick="selectTime('${t}')">${t}</button>`
    ).join('');
  }

  function selectTime(time) {
    selectedTime = time;
    renderTimeChips();
  }

  function saveTask() {
    const titleEl = document.getElementById('taskTitle');
    const dateEl = document.getElementById('taskDate');
    const customEl = document.getElementById('customSubject');

    const subject = customEl.value.trim() || selectedSubject;
    const title = titleEl.value.trim();
    const date = dateEl.value;

    if (!subject) { showToast('⚠️ Please select or type a subject'); return; }
    if (!title) { showToast('⚠️ Please enter a task name'); titleEl.focus(); return; }
    if (!date) { showToast('⚠️ Please select a date'); return; }

    const task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      subject,
      title,
      date,
      time: selectedTime || '30m',
      completed: false,
      createdAt: Date.now()
    };

    tasks.unshift(task);
    saveTasks();
    closeModal();
    render();
    showToast('✅ Task added!');
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? Date.now() : null;
      saveTasks();
      render();
      if (task.completed) showToast('🎉 Great job! Task completed!');
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
    showToast('🗑️ Task removed');
  }

  // Render
  function render() {
    document.getElementById('headerDate').innerHTML = formatHeaderDate();

    const todayStr = getTodayStr();
    const todayTasks = tasks.filter(t => t.date === todayStr && !t.completed);
    const upcomingTasks = tasks.filter(t => t.date > todayStr && !t.completed).sort((a,b) => a.date.localeCompare(b.date));
    const overdueTasks = tasks.filter(t => t.date < todayStr && !t.completed).sort((a,b) => a.date.localeCompare(b.date));
    const completedTasks = tasks.filter(t => t.completed).sort((a,b) => (b.completedAt || 0) - (a.completedAt || 0));

    // Today progress
    const todayAll = tasks.filter(t => t.date === todayStr);
    const todayDone = todayAll.filter(t => t.completed).length;
    const todayTotal = todayAll.length;
    const pct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    let emoji = '📖';
    let message = "Let's get started!";
    if (todayTotal === 0) { emoji = '☀️'; message = 'No tasks for today'; }
    else if (pct === 100) { emoji = '🏆'; message = 'All done! Amazing!'; }
    else if (pct >= 75) { emoji = '🔥'; message = 'Almost there!'; }
    else if (pct >= 50) { emoji = '💪'; message = 'Halfway through!'; }
    else if (pct >= 25) { emoji = '📖'; message = 'Good progress!'; }

    // Total study time today
    const todayTimeMin = todayAll.reduce((sum, t) => sum + parseTime(t.time), 0);
    const completedTimeMin = todayAll.filter(t=>t.completed).reduce((sum, t) => sum + parseTime(t.time), 0);

    let html = `
      <div class="progress-card">
        <div class="progress-header">
          <div>
            <div class="progress-title">Today's Progress</div>
            <div class="progress-stats">${todayDone}<span> / ${todayTotal} tasks</span></div>
          </div>
          <div class="progress-emoji">${emoji}</div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div class="progress-label">
            <span>${message}</span>
            <span>${pct}%</span>
          </div>
        </div>
        <div class="progress-detail-row">
          <div class="progress-detail">⏱️ ${formatMinutes(completedTimeMin)} / ${formatMinutes(todayTimeMin)} studied</div>
          <div class="progress-detail">📋 ${tasks.filter(t=>!t.completed).length} pending total</div>
        </div>
      </div>

      <button class="add-task-btn" onclick="openModal()">
        <span class="icon">＋</span> Add Study Task
      </button>
    `;

    // Overdue
    if (overdueTasks.length > 0) {
      html += renderSection('⚠️', 'Overdue', overdueTasks, 'today');
    }

    // Today
    html += renderSection('📌', 'Today', todayTasks, 'today');

    // Upcoming
    html += renderSection('📅', 'Upcoming', upcomingTasks, '');

    // Completed
    html += renderSection('✅', 'Completed', completedTasks, 'completed');

    document.getElementById('mainContent').innerHTML = html;
  }

  function renderSection(icon, title, taskList, countClass) {
    const emptyMessages = {
      'Today': { icon: '☀️', title: 'No tasks for today', desc: 'Add a task to start planning your study day' },
      'Upcoming': { icon: '📅', title: 'No upcoming tasks', desc: 'Plan ahead by adding future study sessions' },
      'Completed': { icon: '🎯', title: 'No completed tasks yet', desc: 'Check off tasks as you complete them' },
      'Overdue': { icon: '⚠️', title: 'No overdue tasks', desc: '' },
    };

    let content = '';
    if (taskList.length === 0) {
      const em = emptyMessages[title] || emptyMessages['Today'];
      content = `<div class="empty-state">
        <span class="empty-icon">${em.icon}</span>
        <div class="empty-title">${em.title}</div>
        <div class="empty-desc">${em.desc}</div>
      </div>`;
    } else {
      content = taskList.map(t => renderTask(t)).join('');
    }

    return `
      <div class="section">
        <div class="section-header" onclick="toggleSection(this)">
          <span class="section-icon">${icon}</span>
          <span class="section-title">${title}</span>
          <span class="section-count ${countClass}">${taskList.length}</span>
          <span class="section-chevron">▼</span>
        </div>
        <div class="section-content">
          ${content}
        </div>
      </div>
    `;
  }

  function renderTask(task) {
    const subjectClass = getSubjectClass(task.subject);
    const isCompleted = task.completed;

    return `
      <div class="task-card ${isCompleted ? 'completed-task' : ''}">
        <div class="task-check" onclick="toggleTask('${task.id}')">
          ${isCompleted ? '✓' : ''}
        </div>
        <div class="task-body">
          <span class="task-subject-tag ${subjectClass}">${escapeHtml(task.subject)}</span>
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="task-meta-item">📅 ${formatDate(task.date)}</span>
            <span class="task-meta-item">⏱️ ${task.time}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-delete" onclick="deleteTask('${task.id}')" title="Delete task">🗑️</button>
        </div>
      </div>
    `;
  }

  function toggleSection(header) {
    header.classList.toggle('collapsed');
    const content = header.nextElementSibling;
    content.classList.toggle('hidden');
  }

  function parseTime(timeStr) {
    if (!timeStr) return 30;
    if (timeStr.includes('h')) {
      const h = parseFloat(timeStr.replace('h', ''));
      return h * 60;
    }
    return parseInt(timeStr.replace('m', '')) || 30;
  }

  function formatMinutes(mins) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('modalOverlay').classList.contains('active')) {
      const active = document.activeElement;
      if (active && active.tagName !== 'BUTTON') {
        saveTask();
      }
    }
  });

  // Set default date
  document.getElementById('taskDate').min = '2020-01-01';

  // Init
  loadTasks();

  // Demo data if empty
  if (tasks.length === 0) {
    const today = getTodayStr();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    tasks = [
      { id: 'd1', subject: 'Math', title: 'Chapter 5: Derivatives & Integration', date: today, time: '1h', completed: false, createdAt: Date.now() },
      { id: 'd2', subject: 'CS', title: 'Binary Search Trees Practice', date: today, time: '45m', completed: true, completedAt: Date.now() - 3600000, createdAt: Date.now() },
      { id: 'd3', subject: 'English', title: 'Essay Draft: Modern Literature', date: today, time: '1.5h', completed: false, createdAt: Date.now() },
      { id: 'd4', subject: 'Science', title: 'Lab Report: Chemical Reactions', date: tomorrowStr, time: '1h', completed: false, createdAt: Date.now() },
      { id: 'd5', subject: 'History', title: 'Review: World War II Timeline', date: dayAfterStr, time: '30m', completed: false, createdAt: Date.now() },
      { id: 'd6', subject: 'Art', title: 'Sketch: Perspective Drawing', date: tomorrowStr, time: '45m', completed: false, createdAt: Date.now() },
    ];
    saveTasks();
  }

  render();