// ── Sample schedule data ──────────────────────────────────────────────────────
// Each event: { title, member, hour (0-23), duration (hours), color }
// Days are keyed as ISO date strings "YYYY-MM-DD".
// Edit this object to add your family's real schedule.

const MEMBERS = {
  dad:  { label: 'Dad',  color: '#4f6ef7' },
  mom:  { label: 'Mom',  color: '#f7834f' },
  kid1: { label: 'Alex', color: '#4fcf8a' },
  kid2: { label: 'Mia',  color: '#f74f8a' },
};

// Helper: get the ISO date string for a day offset from today
function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Generate a simple repeating weekly template (Mon–Sun)
// dayOfWeek: 0=Sun, 1=Mon … 6=Sat
const WEEKLY_TEMPLATE = {
  1: [ // Monday
    { title: 'School drop-off', member: 'dad',  hour: 8,  duration: 0.5 },
    { title: 'Work',            member: 'mom',  hour: 9,  duration: 8   },
    { title: 'Work',            member: 'dad',  hour: 9,  duration: 8   },
    { title: 'School',          member: 'kid1', hour: 8,  duration: 7   },
    { title: 'School',          member: 'kid2', hour: 8,  duration: 7   },
    { title: 'Football',        member: 'kid1', hour: 16, duration: 1.5 },
  ],
  2: [ // Tuesday
    { title: 'School drop-off', member: 'mom',  hour: 8,  duration: 0.5 },
    { title: 'Work',            member: 'dad',  hour: 9,  duration: 8   },
    { title: 'Work',            member: 'mom',  hour: 9,  duration: 8   },
    { title: 'School',          member: 'kid1', hour: 8,  duration: 7   },
    { title: 'School',          member: 'kid2', hour: 8,  duration: 7   },
    { title: 'Dance class',     member: 'kid2', hour: 17, duration: 1   },
  ],
  3: [ // Wednesday
    { title: 'Work',            member: 'dad',  hour: 9,  duration: 8   },
    { title: 'Work',            member: 'mom',  hour: 9,  duration: 6   },
    { title: 'School',          member: 'kid1', hour: 8,  duration: 7   },
    { title: 'School',          member: 'kid2', hour: 8,  duration: 7   },
    { title: 'Piano lesson',    member: 'kid1', hour: 16, duration: 1   },
    { title: 'Grocery run',     member: 'mom',  hour: 17, duration: 1   },
  ],
  4: [ // Thursday
    { title: 'Work',            member: 'dad',  hour: 9,  duration: 8   },
    { title: 'Work',            member: 'mom',  hour: 9,  duration: 8   },
    { title: 'School',          member: 'kid1', hour: 8,  duration: 7   },
    { title: 'School',          member: 'kid2', hour: 8,  duration: 7   },
    { title: 'Football',        member: 'kid1', hour: 16, duration: 1.5 },
    { title: 'Dance class',     member: 'kid2', hour: 17, duration: 1   },
  ],
  5: [ // Friday
    { title: 'Work',            member: 'dad',  hour: 9,  duration: 6   },
    { title: 'Work',            member: 'mom',  hour: 9,  duration: 6   },
    { title: 'School',          member: 'kid1', hour: 8,  duration: 6   },
    { title: 'School',          member: 'kid2', hour: 8,  duration: 6   },
    { title: 'Family dinner',   member: 'dad',  hour: 19, duration: 1.5 },
  ],
  6: [ // Saturday
    { title: 'Football match',  member: 'kid1', hour: 10, duration: 2   },
    { title: 'Gym',             member: 'mom',  hour: 9,  duration: 1.5 },
    { title: 'Gym',             member: 'dad',  hour: 9,  duration: 1.5 },
    { title: 'Playdate',        member: 'kid2', hour: 14, duration: 2   },
    { title: 'Movie night',     member: 'dad',  hour: 20, duration: 2   },
  ],
  0: [ // Sunday
    { title: 'Church',          member: 'dad',  hour: 10, duration: 1.5 },
    { title: 'Church',          member: 'mom',  hour: 10, duration: 1.5 },
    { title: 'Church',          member: 'kid1', hour: 10, duration: 1.5 },
    { title: 'Church',          member: 'kid2', hour: 10, duration: 1.5 },
    { title: 'Lunch prep',      member: 'mom',  hour: 12, duration: 1   },
    { title: 'Family walk',     member: 'dad',  hour: 15, duration: 1   },
  ],
};

function getEventsForDate(dateStr) {
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  return (WEEKLY_TEMPLATE[dow] || []).map(e => ({ ...e, color: MEMBERS[e.member].color, memberLabel: MEMBERS[e.member].label }));
}

// ── State ─────────────────────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);

let currentView = 'week';
let weekOffset = 0;   // weeks from today's week
let dayDate = new Date(today);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function fmt(date, opts) {
  return date.toLocaleDateString(undefined, opts);
}

function fmtHour(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:00 ${ampm}`;
}

// ── Render: Week View ─────────────────────────────────────────────────────────
function renderWeek() {
  const monday = getMondayOf(addDays(today, weekOffset * 7));
  const sunday = addDays(monday, 6);

  document.getElementById('week-label').textContent =
    `${fmt(monday, { month: 'short', day: 'numeric' })} – ${fmt(sunday, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const grid = document.getElementById('week-grid');
  grid.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const isToday = formatDate(d) === formatDate(today);
    const events = getEventsForDate(formatDate(d));

    const col = document.createElement('div');
    col.className = 'day-col' + (isToday ? ' today' : '');
    col.title = 'Click to view day';
    col.addEventListener('click', () => {
      dayDate = new Date(d);
      switchView('day');
    });

    col.innerHTML = `
      <div class="day-header">
        ${fmt(d, { weekday: 'short' })}
        <div class="day-date">${fmt(d, { month: 'short', day: 'numeric' })}</div>
      </div>
      <div class="day-events">
        ${events.length
          ? events.map(e => `
              <div class="event-chip" style="background:${e.color}">
                <div class="event-time">${fmtHour(e.hour)}</div>
                ${e.title}
              </div>`).join('')
          : '<div class="empty-day">Free day</div>'
        }
      </div>`;

    grid.appendChild(col);
  }
}

// ── Render: Day View ──────────────────────────────────────────────────────────
function renderDay() {
  document.getElementById('day-label').textContent =
    fmt(dayDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const events = getEventsForDate(formatDate(dayDate));
  const schedule = document.getElementById('day-schedule');
  schedule.innerHTML = '';

  // Show hours 6 AM – 10 PM
  for (let h = 6; h <= 22; h++) {
    const slotEvents = events.filter(e => Math.floor(e.hour) === h);

    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.innerHTML = `
      <div class="slot-time">${fmtHour(h)}</div>
      <div class="slot-events">
        ${slotEvents.map(e => `
          <div class="slot-event" style="background:${e.color}">
            ${e.title}
            <div class="slot-member">${e.memberLabel}</div>
          </div>`).join('')}
      </div>`;

    schedule.appendChild(slot);
  }
}

// ── View switching ────────────────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  document.getElementById('week-view').classList.toggle('hidden', view !== 'week');
  document.getElementById('day-view').classList.toggle('hidden', view !== 'day');
  document.getElementById('btn-week').classList.toggle('active', view === 'week');
  document.getElementById('btn-day').classList.toggle('active', view === 'day');
  document.body.classList.toggle('view-day', view === 'day');
  document.body.classList.toggle('view-week', view === 'week');
  if (view === 'week') renderWeek();
  else renderDay();
}

// ── Events ────────────────────────────────────────────────────────────────────
document.getElementById('btn-week').addEventListener('click', () => switchView('week'));
document.getElementById('btn-day').addEventListener('click', () => switchView('day'));

document.getElementById('prev-week').addEventListener('click', () => { weekOffset--; renderWeek(); });
document.getElementById('next-week').addEventListener('click', () => { weekOffset++; renderWeek(); });

document.getElementById('prev-day').addEventListener('click', () => { dayDate = addDays(dayDate, -1); renderDay(); });
document.getElementById('next-day').addEventListener('click', () => { dayDate = addDays(dayDate, 1); renderDay(); });

// ── Init ──────────────────────────────────────────────────────────────────────
document.body.classList.add('view-week');
renderWeek();
