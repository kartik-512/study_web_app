// ==================== STATE ====================
let state = {
    goals: [],
    saved: [],
    searchHistory: [],
    theme: 'light',
    timer: { time: 25 * 60, active: false, interval: null }
};

// ==================== LOCAL STORAGE ====================
const STORAGE_KEY = 'studyhub_data';

function saveToStorage() {
    try {
        const dataToSave = {
            goals: state.goals,
            saved: state.saved,
            searchHistory: state.searchHistory,
            theme: document.body.getAttribute('data-theme'),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.log('Storage not available');
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            state.goals = data.goals || [];
            state.saved = data.saved || [];
            state.searchHistory = data.searchHistory || [];
            if (data.theme) {
                document.body.setAttribute('data-theme', data.theme);
                updateThemeIcon();
            }
            return true;
        }
    } catch (e) {
        console.log('Error loading from storage');
    }
    return false;
}

function updateThemeIcon() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const icon = document.getElementById('theme-icon');
    if (isDark) {
        icon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
    } else {
        icon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
    }
}

// ==================== VIEW SWITCHING ====================
function switchView(viewId, btn) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    if (viewId === 'saved') renderSaved();
    if (viewId === 'planner') renderGoals();
}

// ==================== THEME ====================
function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    body.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    updateThemeIcon();
    saveToStorage();
}

// ==================== TOAST ====================
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== SEARCH HISTORY ====================
function addToSearchHistory(term) {
    if (!term) return;

    // Remove if already exists (to move to front)
    state.searchHistory = state.searchHistory.filter(t => t.toLowerCase() !== term.toLowerCase());

    // Add to front
    state.searchHistory.unshift(term);

    // Keep only last 8
    state.searchHistory = state.searchHistory.slice(0, 8);

    renderSearchHistory();
    saveToStorage();
}

function renderSearchHistory() {
    const container = document.getElementById('search-history-container');
    const tagsContainer = document.getElementById('history-tags');

    if (state.searchHistory.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    tagsContainer.innerHTML = state.searchHistory.map(term => `
                <button class="history-tag" onclick="searchFromHistory('${term}')">
                    <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
                    ${term}
                </button>
            `).join('');
}

function searchFromHistory(term) {
    document.getElementById('subject-input').value = term;
    handleSearch(new Event('submit'));
}

function clearSearchHistory() {
    state.searchHistory = [];
    renderSearchHistory();
    saveToStorage();
    showToast('Search history cleared');
}

// ==================== SEARCH ====================
function handleSearch(e) {
    e.preventDefault();
    const subject = document.getElementById('subject-input').value.trim();
    const level = document.getElementById('level-select').value;
    if (!subject) return;

    // Add to history
    addToSearchHistory(subject);

    const container = document.getElementById('results-container');
    container.innerHTML = `
                <div class="loading-state" style="grid-column: 1/-1;">
                    <div class="loader"></div>
                    <p style="color: var(--text-secondary);">Finding the best resources for "${subject}"...</p>
                </div>
            `;

    setTimeout(() => {
        const results = generateResults(subject, level);
        renderResults(results);
    }, 800);
}

function generateResults(query, level) {
    const q = encodeURIComponent(query);
    const lvl = level === 'beginner' ? 'tutorial' : level === 'advanced' ? 'advanced' : '';

    return [
        {
            title: `${query} Video Course`,
            type: 'Video',
            icon: 'video',
            desc: 'Complete video playlist with lectures, explanations, and worked examples from top educators.',
            link: `https://www.youtube.com/results?search_query=${q}+${lvl}+full+course+playlist`
        },
        {
            title: 'Lecture Notes & PDFs',
            type: 'PDF',
            icon: 'pdf',
            desc: 'Download comprehensive lecture notes, study guides, and cheat sheets in PDF format.',
            link: `https://www.google.com/search?q=${q}+${lvl}+notes+filetype:pdf`
        },
        {
            title: 'Practice Questions',
            type: 'Practice',
            icon: 'practice',
            desc: 'Test your knowledge with flashcards, quizzes, and practice problems with solutions.',
            link: `https://quizlet.com/search?query=${q}`
        },
        {
            title: 'Free Textbooks',
            type: 'Book',
            icon: 'book',
            desc: 'Access free, peer-reviewed textbooks from OpenStax and other open educational resources.',
            link: `https://openstax.org/subjects`
        },
        {
            title: 'Community Discussions',
            type: 'Community',
            icon: 'community',
            desc: 'Join discussions, get help from peers, and find additional resources shared by students.',
            link: `https://www.reddit.com/search/?q=${q}+study+resources`
        }
    ];
}

function renderResults(items) {
    const container = document.getElementById('results-container');
    const icons = {
        video: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zM10 8v6l5-3z"/></svg>',
        pdf: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
        practice: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
        book: '<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
        community: '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'
    };

    container.innerHTML = items.map(item => `
                <div class="resource-card">
                    <div class="card-header">
                        <div class="card-icon ${item.icon}">${icons[item.icon]}</div>
                        <div class="card-meta">
                            <div class="card-type">${item.type}</div>
                            <h3 class="card-title">${item.title}</h3>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-desc">${item.desc}</p>
                    </div>
                    <div class="card-footer">
                        <a href="${item.link}" target="_blank" class="btn-card btn-card-primary">
                            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                            Open
                        </a>
                        <button onclick="saveItem('${item.title}', '${item.link}', '${item.desc}', '${item.icon}')" class="btn-card btn-card-outline">
                            <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                            Save
                        </button>
                    </div>
                </div>
            `).join('');
}

// ==================== SAVED ====================
function saveItem(title, link, desc, icon) {
    if (state.saved.some(i => i.link === link)) {
        showToast('Already in library');
        return;
    }
    state.saved.push({ title, link, desc, icon, savedAt: new Date().toISOString() });
    showToast('Saved to Library');
    document.getElementById('saved-count').textContent = `${state.saved.length} resources`;
    saveToStorage();
}

function renderSaved() {
    const container = document.getElementById('saved-grid');
    document.getElementById('saved-count').textContent = `${state.saved.length} resources`;

    if (state.saved.length === 0) {
        container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <div class="empty-icon">
                            <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                        </div>
                        <h3 class="empty-title">No Saved Resources</h3>
                        <p class="empty-desc">Resources you save will appear here for quick access.</p>
                    </div>
                `;
        return;
    }

    const icons = {
        video: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zM10 8v6l5-3z"/></svg>',
        pdf: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
        practice: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
        book: '<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
        community: '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'
    };

    container.innerHTML = state.saved.map((item, idx) => `
                <div class="resource-card">
                    <div class="card-header">
                        <div class="card-icon ${item.icon}">${icons[item.icon]}</div>
                        <div class="card-meta">
                            <div class="card-type">Saved</div>
                            <h3 class="card-title">${item.title}</h3>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-desc">${item.desc}</p>
                    </div>
                    <div class="card-footer">
                        <a href="${item.link}" target="_blank" class="btn-card btn-card-primary">
                            <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                            Open
                        </a>
                        <button onclick="removeItem(${idx})" class="btn-card btn-card-outline" style="color: var(--danger);">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            Remove
                        </button>
                    </div>
                </div>
            `).join('');
}

function removeItem(idx) {
    state.saved.splice(idx, 1);
    renderSaved();
    saveToStorage();
    showToast('Removed from library');
}

// ==================== PLANNER ====================
function addGoal(e) {
    e.preventDefault();
    const title = document.getElementById('goal-title').value;
    const date = document.getElementById('goal-date').value;

    state.goals.push({
        id: Date.now(),
        title,
        date,
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString()
    });

    document.getElementById('goal-title').value = '';
    renderGoals();
    saveToStorage();
    showToast('Goal added');
}

function renderGoals() {
    const container = document.getElementById('goals-list');
    const sorted = [...state.goals].sort((a, b) => new Date(a.date) - new Date(b.date));
    const completed = sorted.filter(g => g.completed).length;

    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-streak').textContent = completed > 0 ? Math.ceil(completed / 2) : 0;

    if (sorted.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>
                        </div>
                        <h3 class="empty-title">No Goals Yet</h3>
                        <p class="empty-desc">Add your first study goal to get started.</p>
                    </div>
                `;
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    container.innerHTML = sorted.map(g => {
        const isOverdue = g.date < today && !g.completed;
        const itemClass = g.completed ? 'completed' : isOverdue ? 'overdue' : '';

        return `
                    <div class="goal-item ${itemClass}">
                        <div class="goal-top">
                            <span class="goal-title ${g.completed ? 'done' : ''}">${g.title}</span>
                            <span class="goal-badge ${g.completed ? 'done' : 'pending'}">${g.completed ? 'Completed' : g.date}</span>
                        </div>
                        ${!g.completed ? `
                            <div class="goal-progress">
                                <div class="progress-track">
                                    <div class="progress-bar" style="width: ${g.progress}%"></div>
                                </div>
                            </div>
                            <div class="goal-controls">
                                <input type="range" value="${g.progress}" min="0" max="100" oninput="updateProgress(${g.id}, this.value)">
                                <span class="progress-label">${g.progress}%</span>
                            </div>
                        ` : ''}
                    </div>
                `;
    }).join('');
}

function updateProgress(id, val) {
    const goal = state.goals.find(g => g.id === id);
    goal.progress = parseInt(val);
    if (val == 100) {
        goal.completed = true;
        goal.completedAt = new Date().toISOString();
        showToast('Goal completed!');
    }
    renderGoals();
    saveToStorage();
}

// ==================== TIMER ====================
function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

function setTimer(mins, btn) {
    clearInterval(state.timer.interval);
    state.timer.active = false;
    state.timer.time = mins * 60;
    document.getElementById('timer').textContent = formatTime(state.timer.time);
    document.getElementById('timer-toggle').innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    document.getElementById('timer-toggle').classList.remove('pause');
    document.getElementById('timer-toggle').classList.add('play');

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

function toggleTimer() {
    const btn = document.getElementById('timer-toggle');
    if (state.timer.active) {
        clearInterval(state.timer.interval);
        state.timer.active = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        btn.classList.remove('pause');
        btn.classList.add('play');
    } else {
        state.timer.active = true;
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        btn.classList.remove('play');
        btn.classList.add('pause');

        state.timer.interval = setInterval(() => {
            if (state.timer.time > 0) {
                state.timer.time--;
                document.getElementById('timer').textContent = formatTime(state.timer.time);
            } else {
                clearInterval(state.timer.interval);
                state.timer.active = false;
                showToast('Time is up!');
                btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
                btn.classList.remove('pause');
                btn.classList.add('play');
            }
        }, 1000);
    }
}

function resetTimer() {
    setTimer(25, document.querySelector('.preset-btn'));
}

// ==================== INIT ====================
function init() {
    // Set minimum date for deadline input
    document.getElementById('goal-date').min = new Date().toISOString().split('T')[0];

    // Load from storage
    loadFromStorage();

    // Render UI
    renderGoals();
    renderSaved();
    renderSearchHistory();

    // Update saved count
    document.getElementById('saved-count').textContent = `${state.saved.length} resources`;
}

init();