// --- DOM HELPERS ---
const $ = (selector) => document.querySelector(selector);
window.$ = $;
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);
const Logo = (width = 180, height = 50) => `
  <svg width="${width}" height="${height}" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
    <!-- Light Blue Ribbon/Swoosh flourishes around the text -->
    <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
    <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
    
    <!-- Subtle glow on the outer swoosh -->
    <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>

    <!-- Book icon matching the user logo -->
    <g transform="translate(68, 2)">
      <!-- Left half -->
      <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
      <!-- Right half -->
      <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
      <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
      <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
    </g>

    <!-- Main Title: Studia -->
    <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
    <!-- Subtitle: GRADE ESCOLAR DIGITAL -->
    <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
  </svg>
`;
const render = (template) => {
  const app = $('#app');
  if (app) {
    app.innerHTML = template;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
};

const showDialog = (message, { confirm = false, title = 'Studia' } = {}) => new Promise((resolve) => {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.55);backdrop-filter:blur(5px);font-family:system-ui,sans-serif;';
  overlay.innerHTML = `
    <div style="width:min(100%,440px);background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,.25);padding:28px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;color:#2563eb;">
        <div style="width:40px;height:40px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;">S</div>
        <h3 style="margin:0;color:#0f172a;font-size:18px;font-weight:800;">${title}</h3>
      </div>
      <p data-dialog-message style="margin:0;color:#475569;font-size:14px;line-height:1.6;white-space:pre-line;"></p>
      <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;">
        ${confirm ? '<button data-dialog-cancel type="button" style="border:1px solid #e2e8f0;background:#fff;color:#475569;border-radius:10px;padding:11px 20px;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:14px;">Cancelar</button>' : ''}
        <button data-dialog-ok type="button" style="border:0;background:#2563eb;color:#fff;border-radius:10px;padding:11px 22px;font-weight:700;cursor:pointer;transition:all 0.2s;font-size:14px;box-shadow:0 4px 12px rgba(37,99,235,0.25);">${confirm ? 'Confirmar' : 'Entendi'}</button>
      </div>
    </div>`;
  overlay.querySelector('[data-dialog-message]').textContent = message;
  const close = (result) => { overlay.remove(); resolve(result); };
  overlay.querySelector('[data-dialog-ok]').addEventListener('click', () => close(true));
  overlay.querySelector('[data-dialog-cancel]')?.addEventListener('click', () => close(false));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(false); });
  document.body.appendChild(overlay);
  overlay.querySelector('[data-dialog-ok]').focus();
});

// --- STATE ---
let user = null;
try {
  const savedUser = localStorage.getItem('user');
  if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
    user = JSON.parse(savedUser);
  }
} catch (e) {
  console.error("Error parsing user from localStorage:", e);
}
let schedules = [];
let teachers = [];
let allUsers = [];
let selectedUserIds = new Set();
let editingTeacherSubjectsId = null;
let schools = [];
let schoolSubjects = [];
let schoolPeriods = [];
let schoolPeriodsError = '';
let periodAdminTurno = 'manha';
let subjectSchoolId = '';
let devDiagnostics = null;
let devAuditLogs = [];
let devErrorLogs = [];
let devPanelErrors = {};
let stats = { total: 0, confirmed: 0, absent: 0, pending: 0 };
let currentTab = 'horarios';
let authMode = 'closed'; // 'login' or 'closed'
let loginSchools = [];
let loginSchoolsState = 'idle';
let loginSchoolsError = '';
let labBookings = [];
let labFilters = { date: '', labId: 'all', teacher: '' };
let reportWeek = 'all';
let reportTurno = 'todos';
let scheduleListTurno = 'todos';
let teacherTurno = 'todos';
let teacherSubjectSearch = '';
let expandedTeacherSubjectCards = new Set();
let reportTeacher = 'all';
let schoolName = 'COLÉGIO ESTADUAL PROF. JÚLIO SZYMANSKI - MATUTINO';
let currentRelatorioSubTab = 'urania';
let reportModel = 'prof_turma'; // 'prof_turma', 'prof_subject', 'turma_grid'
let reportCardSize = localStorage.getItem('reportCardSize') || 'medium'; // 'small', 'medium', 'large'
let teacherSchedulesTab = 'grid'; // 'grid' or 'list'
let mobileMenuOpen = false;
let isRefreshingData = false; // Flag para evitar múltiplas requisições simultâneas

// --- API ---
let apiBaseUrl = (localStorage.getItem('api_base_url') || '').trim();

if (apiBaseUrl === 'undefined' || apiBaseUrl === 'null' || apiBaseUrl === '/') {
  apiBaseUrl = '';
}

const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const isRenderHost = window.location.hostname.endsWith('.onrender.com');
if (isLocalHost) {
  apiBaseUrl = 'http://localhost:3000';
  localStorage.removeItem('api_base_url');
}

if (isRenderHost) {
  apiBaseUrl = '';
  localStorage.removeItem('api_base_url');
}

// External hosts use the deployed Render API.
const isExternalHost = !isLocalHost && !isRenderHost;
if (isExternalHost) {
  apiBaseUrl = 'https://studia-8st9.onrender.com';
  localStorage.setItem('api_base_url', apiBaseUrl);
}

const getApiUrl = (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  if (apiBaseUrl) {
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    return `${base}${cleanUrl}`;
  }
  return cleanUrl;
};

const api = {
  async request(url, options = {}) {
    let fullUrl = getApiUrl(url);
    let res;
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (user?.accessToken) headers.Authorization = `Bearer ${user.accessToken}`;

      res = await fetch(fullUrl, {
        ...options,
        headers,
      });
    } catch (fetchErr) {
      console.error("Fetch error on primary URL:", fetchErr);
      
      // Fallback mechanism: if pre/shared URL fails, try dev URL, or vice-versa.
      let fallbackUrl = null;
      if (fullUrl.includes('ais-pre-')) {
        fallbackUrl = fullUrl.replace('ais-pre-', 'ais-dev-');
      } else if (fullUrl.includes('ais-dev-')) {
        fallbackUrl = fullUrl.replace('ais-dev-', 'ais-pre-');
      }

      if (fallbackUrl) {
        console.log("Trying fallback API URL:", fallbackUrl);
        try {
          res = await fetch(fallbackUrl, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
              ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
            },
          });
          // Update base url so future requests are faster
          const parsedUrl = new URL(fallbackUrl);
          const newBase = parsedUrl.origin;
          apiBaseUrl = newBase;
          localStorage.setItem('api_base_url', newBase);
          fullUrl = fallbackUrl;
        } catch (fallbackErr) {
          console.error("Fetch error on fallback URL:", fallbackErr);
          throw new Error(`Erro de conexão com o servidor de API.\n\nTentamos:\n1. ${fullUrl}\n2. ${fallbackUrl}\n\nVerifique se o seu servidor Cloud Run está ativo.`);
        }
      } else {
        throw new Error(`Erro de conexão com o servidor de API (${fullUrl}).`);
      }
    }

    if (res.status === 401 && user?.refreshToken && !url.startsWith('/api/auth/')) {
      try {
        const refreshResponse = await fetch(getApiUrl('/api/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: user.refreshToken })
        });
        const refreshed = await refreshResponse.json();
        if (refreshResponse.ok) {
          user = { ...user, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
          localStorage.setItem('user', JSON.stringify(user));
          const retryHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${user.accessToken}`
          };
          res = await fetch(fullUrl, { ...options, headers: retryHeaders });
        }
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
      }
    }

    if (res.status === 401 && user && !url.startsWith('/api/auth/')) {
      localStorage.removeItem('user');
      user = null;
      currentTab = 'horarios';
      render(LandingView());
      throw new Error('Sua sessão não é mais válida. Entre novamente com uma conta ativa para continuar.');
    }

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      console.error("Parse error:", parseErr);
      throw new Error(`Resposta inválida do servidor de API (${fullUrl}).`);
    }

    if (!res.ok) throw new Error(result.error || `Erro ${res.status}`);
    return result;
  },
  async post(url, data) {
    return this.request(url, { method: 'POST', body: JSON.stringify(data) });
  },
  async get(url) {
    return this.request(url, { method: 'GET' });
  },
  async patch(url, data) {
    return this.request(url, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
};

// --- WEEK & DATE CALCULATIONS FOR INDIVIDUAL REPORT GRIDS ---
const parseLocalDate = (dateStr) => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
};

const getMondayDateStr = (dateStr) => {
  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getWeekRangeLabel = (mondayStr) => {
  const monday = parseLocalDate(mondayStr);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const formatDatePart = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${m}`;
  };
  return `Semana de ${formatDatePart(monday)} a ${formatDatePart(friday)}`;
};

const getWeeksList = () => {
  const weeks = new Set();
  schedules.forEach(s => {
    if (s.date) {
      try {
        weeks.add(getMondayDateStr(s.date));
      } catch (e) {
        console.error("Error formatting week:", e);
      }
    }
  });
  return Array.from(weeks).sort().reverse();
};

const getDetectedSlots = (scheduleList = schedules) => {
  const slots = new Set();
  scheduleList.forEach(s => {
    if (s.startTime) slots.add(String(s.startTime).slice(0, 5));
  });
  return Array.from(slots).sort();
};

const getScheduleTurno = schedule => {
  if (['manha', 'tarde', 'noite'].includes(schedule.turno)) return schedule.turno;
  const startTime = String(schedule.startTime || '').slice(0, 5);
  if (startTime >= '05:00' && startTime < '12:00') return 'manha';
  if (startTime >= '12:00' && startTime < '18:00') return 'tarde';
  return 'noite';
};

const filterSchedulesByTurno = (scheduleList, turno) =>
  turno === 'todos' ? scheduleList : scheduleList.filter(schedule => getScheduleTurno(schedule) === turno);

const TURNO_LABELS = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

const getDetectedTurmas = (filteredSchedules) => {
  const turmas = new Set();
  filteredSchedules.forEach(s => {
    if (s.classGroup) turmas.add(s.classGroup);
  });
  return Array.from(turmas).sort();
};

const getDayOfWeek = (dateObj) => {
  const day = dateObj.getDay();
  return day === 0 ? 7 : day;
};

const REPORT_SUBJECT_ABBREVIATIONS = new Map([
  ['programacao front-end', 'Prog. Front-End'],
  ['programacao back-end', 'Prog. Back-End'],
  ['programacao back-end i', 'Prog. Back-End I'],
  ['programacao back-end ii', 'Prog. Back-End II'],
  ['programacao mobile', 'Prog. Mobile'],
  ['programacao de desenvolvimento de sistemas', 'Prog. de Desenv. de Sistemas'],
  ['analise e projeto de sistemas', 'Análise e Proj. de Sistemas'],
  ['educacao fisica', 'Ed. Física'],
  ['educacao financeira', 'Ed. Financeira'],
  ['lingua portuguesa', 'Língua Port.'],
]);

const abbreviateReportSubject = subject => {
  const value = String(subject || '').trim();
  if (!value) return value;
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ');
  return REPORT_SUBJECT_ABBREVIATIONS.get(normalized) || value
    .replace(/\bprogramação\b/gi, 'Prog.')
    .replace(/\bdesenvolvimento\b/gi, 'Desenv.')
    .replace(/\beducação\b/gi, 'Ed.')
    .replace(/\bportuguesa\b/gi, 'Port.')
    .replace(/\bprojeto\b/gi, 'Proj.');
};

const formatCompactClassGroup = value => {
  if (!value) return value;

  const raw = String(value).trim();
  if (!raw || raw === '------') return raw;

  if (raw.includes('/')) {
    return raw.split('/').map(item => formatCompactClassGroup(item)).join(' / ');
  }

  return raw
    .replace(/\s+/g, ' ')
    .replace(/^(\d+)([A-Za-zÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ]+)/u, '$1 $2');
};

const abbreviateReportEntry = entry => {
  const formattedEntry = formatCompactClassGroup(entry);
  return formattedEntry.split(' - ').map((part, index) => (
    index === 0 && formattedEntry.includes(' - ') ? part : abbreviateReportSubject(part)
  )).join(' - ');
};

const TeacherScheduleCard = (teacher, weekSchedules, slots, model = 'prof_turma') => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const grid = {};
  slots.forEach(slot => {
    grid[slot] = {};
    days.forEach(day => {
      grid[slot][day] = '------';
    });
  });

  weekSchedules.forEach(s => {
    const d = parseLocalDate(s.date);
    const dayNum = getDayOfWeek(d);
    const dayName = dayNum >= 1 && dayNum <= 5 ? days[dayNum - 1] : null;
    // Remove seconds from startTime for grid key lookup (API returns HH:MM:SS but grid keys are HH:MM)
    const startTimeKey = s.startTime?.substring(0, 5) || s.startTime;
    if (dayName && grid[startTimeKey]) {
      if (s.status !== 'confirmed' && s.status !== 'pending' && s.subject?.toUpperCase() !== 'HAF') {
        return;
      }
      const isHAF = s.subject?.toUpperCase() === 'HAF';
      let cellText = '------';
      if (isHAF) {
        cellText = 'HAF';
      } else if (model === 'prof_turma') {
        cellText = formatCompactClassGroup(s.classGroup || '------');
      } else if (model === 'prof_subject') {
        cellText = s.subject || '------';
      } else {
        const isDifferentSubject = s.subject && teacher.subject && s.subject.trim().toLowerCase() !== teacher.subject.trim().toLowerCase();
        cellText = (s.classGroup && isDifferentSubject) ? `${formatCompactClassGroup(s.classGroup)} - ${s.subject}` : (formatCompactClassGroup(s.classGroup || s.subject || '------'));
      }

      if (grid[startTimeKey][dayName] === '------') {
        grid[startTimeKey][dayName] = cellText;
      } else {
        if (!grid[startTimeKey][dayName].split('/').includes(cellText)) {
          grid[startTimeKey][dayName] += '/' + cellText;
        }
      }
    }
  });
  
  // Calculate sizes based on reportCardSize
  let cardStyle = "font-size: 11px; padding: 0.75rem;";
  let headerSize = "text-[12px]";
  let subTitleSize = "text-[9.5px]";
  let thSize = "text-[9px]";
  let tdSize = "text-[10px]";
  let rowClass = "h-9";

  if (reportCardSize === 'small') {
    cardStyle = "font-size: 8.5px; padding: 0.5rem;";
    headerSize = "text-[9px]";
    subTitleSize = "text-[7.5px]";
    thSize = "text-[7px]";
    tdSize = "text-[7.5px]";
    rowClass = "h-5";
  } else if (reportCardSize === 'large') {
    cardStyle = "font-size: 13.5px; padding: 1rem;";
    headerSize = "text-[14px]";
    subTitleSize = "text-[11px]";
    thSize = "text-[11px]";
    tdSize = "text-[12.5px]";
    rowClass = "h-11";
  } else if (reportCardSize === 'esticado') {
    cardStyle = "font-size: 15px; padding: 1.25rem;";
    headerSize = "text-[16px]";
    subTitleSize = "text-[12px]";
    thSize = "text-[12px]";
    tdSize = "text-[13.5px]";
    rowClass = "h-12";
  } else if (reportCardSize === 'super_esticado') {
    cardStyle = "font-size: 18px; padding: 1.75rem;";
    headerSize = "text-[20px]";
    subTitleSize = "text-[14px]";
    thSize = "text-[14px]";
    tdSize = "text-[16.5px]";
    rowClass = "h-16";
  }
  
  const distinctAnos = [...new Set(weekSchedules.map(s => s.classGroup).filter(Boolean))];
  const anosSuffix = distinctAnos.length ? ` (${distinctAnos.join(', ')})` : '';

  return `
    <div class="bg-white border border-[#cbd5e1] rounded-md text-slate-800 shadow-none flex flex-col justify-between break-inside-avoid text-xs w-full min-h-[285px]" style="${cardStyle}">
      <div class="mb-1.5 flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 bg-slate-100 px-2 py-1.5 rounded-sm">
        <span class="min-w-0 flex-1 font-extrabold uppercase text-slate-900 whitespace-normal break-words ${headerSize}">${teacher.displayName}${anosSuffix}</span>
        <span title="${teacher.subject || 'Professor'}" class="shrink-0 ${subTitleSize} text-[#5B99C2] font-extrabold uppercase tracking-tight whitespace-normal break-words">${abbreviateReportSubject(teacher.subject || 'Professor')}</span>
      </div>
      <table class="w-full text-center border-collapse table-fixed">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="border border-slate-300 font-semibold text-[#5B99C2] ${thSize} py-0.5 px-1 text-left w-[48px]">Hor</th>
            ${days.map(day => `<th class="border border-slate-300 font-bold text-slate-700 ${thSize} py-0.5 px-1">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${slots.map(slot => `
            <tr class="${rowClass}">
              <td class="border border-slate-300 font-extrabold text-[#2E5077] ${thSize} text-left py-0.5 px-1">${slot}</td>
              ${days.map(day => {
                const val = grid[slot][day];
                const isClass = val !== '------';
                const isHAF = val === 'HAF';
                const cellClass = isHAF ? 'text-[#5B99C2] font-black' : (isClass ? 'text-slate-900 font-black' : 'text-slate-400');
                return `<td title="${val}" class="border border-slate-300 ${tdSize} py-0.5 px-1 whitespace-normal break-words ${cellClass}">${val.split('/').map(abbreviateReportEntry).join(' / ')}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const TurmaScheduleCard = (turmaName, weekSchedules, slots) => {
  console.log(`[DEBUG TurmaScheduleCard] turmaName="${turmaName}", weekSchedules count=${weekSchedules.length}, slots=${slots.join(', ')}`);

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const grid = {};
  slots.forEach(slot => {
    grid[slot] = {};
    days.forEach(day => {
      grid[slot][day] = null;
    });
  });

  weekSchedules.forEach(s => {
    const d = parseLocalDate(s.date);
    const dayNum = getDayOfWeek(d);
    const dayName = days[dayNum - 1];
    // Remove seconds from startTime for grid key lookup (API returns HH:MM:SS but grid keys are HH:MM)
    const startTimeKey = s.startTime?.substring(0, 5) || s.startTime;
    if (dayName && grid[startTimeKey]) {
      if (s.status !== 'confirmed' && s.status !== 'pending' && s.subject?.toUpperCase() !== 'HAF') {
        return;
      }
      const teacher = teachers.find(item => item.uid === s.teacherId);
      grid[startTimeKey][dayName] = {
        teacherName: teacher?.displayName || s.teacherName || '------',
        subject: s.subject || '------',
        status: s.status
      };
    }
  });

  // Calculate sizes based on reportCardSize
  let cardStyle = "font-size: 11px; padding: 0.75rem;";
  let headerSize = "text-[12px]";
  let subTitleSize = "text-[9.5px]";
  let thSize = "text-[9px]";
  let tdTitleSize = "text-[10px]";
  let tdSubSize = "text-[8.5px]";
  let rowClass = "h-11";

  if (reportCardSize === 'small') {
    cardStyle = "font-size: 8.5px; padding: 0.5rem;";
    headerSize = "text-[9px]";
    subTitleSize = "text-[7.5px]";
    thSize = "text-[7px]";
    tdTitleSize = "text-[8.5px]";
    tdSubSize = "text-[7.5px]";
    rowClass = "h-8";
  } else if (reportCardSize === 'large') {
    cardStyle = "font-size: 13.5px; padding: 1rem;";
    headerSize = "text-[14px]";
    subTitleSize = "text-[11px]";
    thSize = "text-[11px]";
    tdTitleSize = "text-[12.5px]";
    tdSubSize = "text-[11px]";
    rowClass = "h-16";
  } else if (reportCardSize === 'esticado') {
    cardStyle = "font-size: 15px; padding: 1.25rem;";
    headerSize = "text-[16px]";
    subTitleSize = "text-[12px]";
    thSize = "text-[12px]";
    tdTitleSize = "text-[14px]";
    tdSubSize = "text-[12px]";
    rowClass = "h-14";
  } else if (reportCardSize === 'super_esticado') {
    cardStyle = "font-size: 18px; padding: 1.75rem;";
    headerSize = "text-[20px]";
    subTitleSize = "text-[14px]";
    thSize = "text-[14px]";
    tdTitleSize = "text-[17px]";
    tdSubSize = "text-[14px]";
    rowClass = "h-20";
  }
  
  return `
    <div class="bg-white border border-[#cbd5e1] rounded-md text-slate-800 shadow-none flex flex-col justify-between break-inside-avoid text-xs w-full min-h-[285px]" style="${cardStyle}">
      <div class="mb-1.5 flex flex-wrap justify-between items-center gap-x-2 bg-slate-100 px-2 py-1.5 rounded-sm">
        <span class="font-extrabold uppercase text-slate-900 truncate ${headerSize}">Turma: ${turmaName}</span>
        <span class="${subTitleSize} text-[#5B99C2] font-extrabold uppercase tracking-tight">GRADE HORÁRIA</span>
      </div>
      <table class="w-full text-center border-collapse table-fixed">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="border border-slate-300 font-semibold text-[#5B99C2] ${thSize} py-0.5 px-1 text-left w-[48px]">Hor</th>
            ${days.map(day => `<th class="border border-slate-300 font-bold text-slate-700 ${thSize} py-0.5 px-1">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${slots.map(slot => `
            <tr class="${rowClass}">
              <td class="border border-slate-300 font-extrabold text-[#2E5077] ${thSize} text-left py-0.5 px-1 align-middle">${slot}</td>
              ${days.map(day => {
                const cell = grid[slot][day];
                if (!cell) {
                  return `<td class="border border-slate-300 text-slate-300 ${tdTitleSize} py-0.5 px-1 align-middle">------</td>`;
                }
                const isHAF = cell.subject?.toUpperCase() === 'HAF';
                if (isHAF) {
                  return `
                    <td class="border border-slate-300 py-0.5 px-1 align-middle leading-tight whitespace-normal break-words">
                      <div class="font-black text-[#5B99C2] ${tdTitleSize}">HAF</div>
                    </td>
                  `;
                }
                return `
                  <td class="border border-slate-300 py-0.5 px-1 align-middle leading-tight whitespace-normal break-words">
                    <div class="font-black text-slate-900 whitespace-normal break-words ${tdTitleSize}">${cell.teacherName}</div>
                    <div title="${cell.subject}" class="text-slate-400 font-extrabold whitespace-normal break-words uppercase mt-0.5 ${tdSubSize}">${abbreviateReportSubject(cell.subject)}</div>
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

// --- VIEWS ---

const LandingView = () => `
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%); min-height: 100vh; color: #fff; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden;">
    <style>
      @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeInUp { from { opacity: 0; } to { opacity: 1; } }
      details summary:hover { color: #2563eb !important; }
      @media (max-width: 768px) {
        h1 { font-size: 1.75rem !important; }
        nav > div:nth-child(2) { display: none; }
      }
    </style>

    <!-- Navbar -->
    <nav style="position: fixed; top: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(37, 99, 235, 0.1); padding: 1.5rem 2rem; z-index: 40; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        ${Logo(140, 40)}
      </div>
      <div style="display: flex; gap: 2rem; align-items: center;">
        <a onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="color: #94a3b8; text-decoration: none; font-weight: 500; cursor: pointer; transition: all 0.3s; font-size: 0.95rem;">Como Funciona</a>
        <a onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="color: #94a3b8; text-decoration: none; font-weight: 500; cursor: pointer; transition: all 0.3s; font-size: 0.95rem;">Recursos</a>
        <a onclick="document.getElementById('faq').scrollIntoView({behavior:'smooth'})" style="color: #94a3b8; text-decoration: none; font-weight: 500; cursor: pointer; transition: all 0.3s; font-size: 0.95rem;">FAQ</a>
        <button onclick="actions.showLoginModal()" style="background: #2563eb; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">Acessar Portal</button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section style="padding-top: 8rem; padding-bottom: 4rem; text-align: center; animation: slideInDown 0.8s ease-out;">
      <div style="max-width: 900px; margin: 0 auto; padding: 0 1rem;">
        <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 2rem; padding: 0.5rem 1.5rem; display: inline-block; margin-bottom: 2rem;">
          <span style="color: #06b6d4; font-weight: 600; font-size: 0.85rem;">Organização escolar em um só lugar</span>
        </div>
        <h1 style="font-size: 3.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;">A rotina da escola<br><span style="background: linear-gradient(135deg, #2563eb, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">mais organizada</span><br>e fácil de acompanhar.</h1>
        <p style="font-size: 1.25rem; color: #cbd5e1; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">Consulte horários, acompanhe as turmas e organize o uso dos laboratórios em uma plataforma simples para professores e direção.</p>
        <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="actions.showLoginModal()" style="background: #2563eb; color: white; border: none; padding: 1.2rem 2.5rem; border-radius: 0.7rem; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 30px rgba(37, 99, 235, 0.3);">🎓 Entrar no Portal da Escola</button>
          <button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="background: transparent; color: white; border: 2px solid rgba(255, 255, 255, 0.2); padding: 1.2rem 2.5rem; border-radius: 0.7rem; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s;">Conhecer recursos</button>
        </div>
        <div style="display: flex; gap: 3rem; justify-content: center; margin-top: 3rem; flex-wrap: wrap; font-weight: 600; font-size: 0.9rem;">
          <div style="color: #cbd5e1;"><span style="color: #06b6d4; font-size: 1.5rem; font-weight: 900;">✓</span> Grade de horários por professor e turma</div>
          <div style="color: #cbd5e1;"><span style="color: #06b6d4; font-size: 1.5rem; font-weight: 900;">✓</span> Reservas de laboratório consultáveis</div>
          <div style="color: #cbd5e1;"><span style="color: #06b6d4; font-size: 1.5rem; font-weight: 900;">✓</span> Acesso pelo navegador</div>
        </div>
      </div>
    </section>

    <!-- Main resources -->
    <section style="background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(37, 99, 235, 0.1); border-bottom: 1px solid rgba(37, 99, 235, 0.1); padding: 4rem 2rem; animation: fadeInUp 1s ease-out 0.3s both;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; text-align: center;">
        <div><div style="font-size: 1.25rem; font-weight: 900; color: #2563eb;">Horários</div><div style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem;">Organizados por professor, turma e período</div></div>
        <div><div style="font-size: 1.25rem; font-weight: 900; color: #06b6d4;">Laboratórios</div><div style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem;">Reservas em uma agenda compartilhada da escola</div></div>
        <div><div style="font-size: 1.25rem; font-weight: 900; color: #2563eb;">Relatórios</div><div style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem;">Grades para consulta e impressão</div></div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" style="padding: 6rem 2rem; max-width: 1200px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <div style="color: #06b6d4; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">RECURSOS PARA A ROTINA ESCOLAR</div>
        <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem;">Informações claras para cada pessoa da escola</h2>
        <p style="color: #cbd5e1; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">A direção organiza os dados da escola e cada professor acompanha seus horários e reservas.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.4s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #2563eb, #1e40af); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">⚡</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Grade de horários</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Consulte e organize os horários de aula com professor, matéria, turma, sala e período.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(37, 99, 235, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Visões por professor e turma</div>
        </div>

        <div style="background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.5s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #06b6d4, #0891b2); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">🛡️</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Espaços Otimizados</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Consulte reservas por data e laboratório e confira os horários já agendados antes de reservar.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(6, 182, 212, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Consulta de disponibilidade</div>
        </div>

        <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.6s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #a855f7, #9333ea); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">📊</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Acesso por perfil</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Direção e professores encontram ferramentas adequadas às suas atividades e permissões.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(168, 85, 247, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Cada perfil vê suas ferramentas</div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; animation: slideInUp 0.8s ease-out 0.7s both;">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem;">📄</div>
          <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.75rem;">Relatórios e impressão</h3>
          <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">Gere grades de horários para consultar ou imprimir, com opções de visualização por professor e turma.</p>
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(239, 68, 68, 0.2); color: #06b6d4; font-size: 0.85rem; font-weight: 600;">✓ Exportação de grades em PDF</div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" style="padding: 6rem 2rem; max-width: 900px; margin: 0 auto; border-top: 1px solid rgba(37, 99, 235, 0.1);">
      <div style="text-align: center; margin-bottom: 4rem;">
        <div style="color: #06b6d4; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">PERGUNTAS FREQUENTES</div>
        <h2 style="font-size: 2.5rem; font-weight: 900;">Tire suas dúvidas sobre o Studia</h2>
      </div>
      <div style="space-y: 2rem;">
        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Como consultar os horários da escola?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">Depois de entrar no portal, professores consultam seus horários e a direção pode organizar e visualizar a grade da escola.</p>
        </details>

        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Os dados da minha escola são seguros e privados?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">As telas e os dados disponíveis dependem do perfil da conta: professor ou direção pedagógica.</p>
        </details>

        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Os professores precisam instalar algum aplicativo pesado?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">Não. O portal pode ser acessado pelo navegador do computador ou celular.</p>
        </details>

        <details style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;">
          <summary style="font-weight: 700; cursor: pointer; color: #fff;">Como reservar um laboratório?</summary>
          <p style="color: #cbd5e1; margin-top: 1rem; line-height: 1.6;">Na aba Laboratórios, consulte as reservas da escola por data e espaço. Ao reservar, o sistema verifica se o horário já está ocupado.</p>
        </details>
      </div>
    </section>

    <!-- Footer -->
    <footer style="background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(37, 99, 235, 0.1); padding: 3rem 2rem; text-align: center; color: #94a3b8;">
      <p>© 2026 Studia SaaS — Todos os direitos reservados.</p>
      <p style="margin-top: 1rem; font-size: 0.9rem;">Horários, reservas de laboratório e relatórios para a rotina escolar.</p>
    </footer>

    <!-- Login Modal -->
    <div id="login-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 ${authMode === 'closed' ? 'hidden' : ''}">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideLoginModal()"></div>
      <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
        <div class="flex justify-center mb-6">
          ${Logo(160, 44)}
        </div>
        <h3 class="text-2xl font-bold mb-5 text-slate-900">Bem-vindo de volta</h3>
        <div class="space-y-4">
          <label class="block text-xs font-bold text-slate-500">
            Escola
            <select id="auth-school" class="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900" ${loginSchoolsState === 'loading' || loginSchoolsState === 'error' || loginSchoolsState === 'empty' ? 'disabled' : ''}>
              <option value="">Selecione sua escola</option>
              ${loginSchoolsState === 'loading' ? '<option disabled>Carregando escolas...</option>' : ''}
              ${loginSchoolsState === 'empty' ? '<option disabled>Nenhuma escola cadastrada ainda</option>' : ''}
              ${loginSchoolsState === 'error' ? '<option disabled>Não foi possível carregar as escolas</option>' : ''}
              ${loginSchools.map(school => `<option value="${escapeHtml(school.id)}">${escapeHtml(school.name)}</option>`).join('')}
            </select>
          </label>
          ${loginSchoolsState === 'error' ? `
            <div class="flex items-center justify-between gap-3 rounded-lg bg-rose-50 p-3">
              <p class="text-xs font-medium text-rose-700">${escapeHtml(loginSchoolsError || 'Não foi possível carregar as escolas.')}</p>
              <button type="button" onclick="actions.loadLoginSchools()" class="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100">Tentar novamente</button>
            </div>
          ` : ''}
          <input type="email" id="auth-email" placeholder="nome@escola.pr.gov.br" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900">
          <input type="password" id="auth-password" placeholder="Sua senha" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm text-slate-900">

          <button onclick="actions.login()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md shadow-blue-500/15 mt-2 transition-all">
            Entrar
          </button>
        </div>
      </div>
    </div>
  </div>
`;

const TeacherView = () => {
  const teacherSchedules = filterSchedulesByTurno(
    schedules.filter(s => s.teacherId === user.uid),
    teacherTurno
  );
  const slots = getDetectedSlots(teacherSchedules);

  const teacherNavItems = [
    { id: 'horarios', icon: 'calendar', label: 'Meus Horários' },
    { id: 'labs', icon: 'test-tube', label: 'Laboratórios' },
    { id: 'materias', icon: 'book', label: 'Minhas Matérias' },
  ];
  const teacherProfile = {
    initials: user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'PR',
    name: user.displayName,
    subtitle: user.subject || 'Professor',
  };

  return `
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${Sidebar({ theme: 'light', sectionLabel: 'Principal', navItems: teacherNavItems, profile: teacherProfile })}
    ${MobileDrawer({ theme: 'light', sectionLabel: 'Principal', navItems: teacherNavItems, profile: teacherProfile, drawerId: 'mobile-sidebar-drawer' })}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-toggle-mobile-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div>
            <h2 class="font-bold text-base md:text-lg capitalize">${currentTab === 'horarios' ? 'Meus Horários' : (currentTab === 'labs' ? 'Laboratórios' : 'Minhas Matérias')}</h2>
            ${currentTab === 'materias' ? '<p class="hidden text-xs font-medium text-slate-500 sm:block">Veja suas matérias e as turmas de cada uma.</p>' : ''}
          </div>
        </div>
        <div class="flex gap-2">
          ${currentTab === 'labs' ? `
            <button onclick="actions.showLabModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md transition-all" id="btn-teacher-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          ` : ''}
          <button onclick="actions.refreshSchedules()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm transition-all" id="btn-refresh-teacher-schedules">
            <i data-lucide="refresh-cw" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Atualizar</span>
          </button>
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${currentTab === 'horarios' ? `
          <!-- Switch between sub-tabs with counts -->
          <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit mb-6 print:hidden overflow-x-auto scrollbar-none select-none shrink-0">
            <button onclick="actions.setTeacherSchedulesTab('grid')" class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              teacherSchedulesTab === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }">
              <i data-lucide="grid-3x3" class="w-4 h-4 text-slate-500"></i> Grade de Horários Completa
            </button>
          </div>

          ${teacherSchedulesTab === 'grid' ? `
            <!-- Grid Control Box -->
            <div class="bg-white p-6 rounded-3xl border shadow-sm space-y-4 print:hidden">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Turno da grade</label>
                  <select onchange="actions.setTeacherTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="todos" ${teacherTurno === 'todos' ? 'selected' : ''}>Todos os turnos</option>
                    <option value="manha" ${teacherTurno === 'manha' ? 'selected' : ''}>Manhã</option>
                    <option value="tarde" ${teacherTurno === 'tarde' ? 'selected' : ''}>Tarde</option>
                    <option value="noite" ${teacherTurno === 'noite' ? 'selected' : ''}>Noite</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tamanho da Grade</label>
                  <select onchange="actions.setReportCardSize(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="small" ${reportCardSize === 'small' ? 'selected' : ''}>Pequeno (Compacto)</option>
                    <option value="medium" ${reportCardSize === 'medium' ? 'selected' : ''}>Médio (Recomendado)</option>
                    <option value="large" ${reportCardSize === 'large' ? 'selected' : ''}>Grande</option>
                    <option value="esticado" ${reportCardSize === 'esticado' ? 'selected' : ''}>Descrição Larga</option>
                    <option value="super_esticado" ${reportCardSize === 'super_esticado' ? 'selected' : ''}>Página Inteira</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Opções Rápidas</label>
                  <button id="btn-download-pdf-teacher" onclick="actions.downloadTeacherPDF()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all">
                    <i data-lucide="download" class="w-4 h-4"></i> Baixar PDF
                  </button>
                </div>
              </div>
            </div>

            <!-- Beautiful Grid Sheet Preview -->
            <div class="printable-sheet bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div class="flex flex-col md:flex-row justify-between items-center border-b border-blue-100 pb-6 mb-8 gap-4">
                <div class="flex items-center gap-4">
                  <svg width="240" height="65" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                    <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
                    <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
                    <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>
                    <g transform="translate(68, 2)">
                      <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
                      <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
                      <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                      <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                    </g>
                    <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
                    <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
                  </svg>
                </div>
                
                <div class="text-center md:text-right">
                  <h4 class="text-sm font-black text-slate-800 uppercase tracking-wide">${schoolName}</h4>
                  <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                    Grade de Horários Individual do Professor
                  </p>
                </div>
              </div>

              <!-- Center wrapper -->
              <div class="flex justify-center">
                <div class="w-full max-w-2xl overflow-x-auto pb-4 scrollbar-none">
                  <div class="min-w-[550px]">
                    ${TeacherScheduleCard(user, teacherSchedules, slots)}
                  </div>
                </div>
              </div>

              <div class="border-t border-slate-100 mt-12 pt-4 flex justify-end text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
                <span>Data de emissão: ${new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ` : `
            <!-- Sched List -->
            <div class="grid gap-6">
              ${schedules.map(s => `
                <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 print:shadow-none print:border-slate-300">
                  <div class="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                    <div class="w-16 text-center border-r pr-4 md:pr-6 shrink-0">
                        <p class="text-lg font-black text-slate-800">${s.startTime}</p>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="text-base md:text-xl font-black text-slate-900 truncate flex items-center gap-2">
                        ${s.subject}
                        ${s.classGroup ? `<span class="bg-blue-100 text-[#2E5077] text-[10px] uppercase font-black px-2 py-0.5 rounded">${s.classGroup}</span>` : ''}
                      </h3>
                      <div class="flex flex-wrap items-center gap-3 md:gap-4 mt-1">
                        <span class="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${s.room}</span>
                        <span class="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${s.date}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-3 w-full sm:w-auto sm:min-w-[200px] shrink-0 print:hidden">
                    <div class="text-center py-2 bg-slate-50 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                      s.status === 'confirmed' ? 'text-blue-600' : s.status === 'absent' ? 'text-rose-500' : 'text-amber-500'
                    }">
                      ${s.status === 'confirmed' ? 'Confirmado' : s.status === 'absent' ? 'Ausente' : 'Pendente'}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        ` : ''}
        ${currentTab === 'materias' ? MateriasTab() : ''}
        ${currentTab === 'labs' ? LabsTab() : ''}
      </div>
    </main>
    
  </div>
  `;
};

const getAssignedSubjectsForTeacher = (teacherId) => {
  const teacher = teachers.find(item => item.uid === teacherId);
  if (!teacher) return [];
  return schoolSubjects
    .filter(subject => subject.school_id === teacher.school_id && (subject.teacherIds || []).includes(teacherId))
    .map(subject => subject.subject);
};

const SchedulePeriodOptions = turno => {
  const periods = schoolPeriods.filter(period => period.turno === turno);
  return periods.length ? `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      ${periods.map(period => `
        <label class="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-sm font-semibold text-slate-700">
          <input type="checkbox" name="form-period" value="${period.periodNumber}" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
          <span>${period.name} (${String(period.startTime).slice(0, 5)}–${String(period.endTime).slice(0, 5)})</span>
        </label>
      `).join('')}
    </div>
  ` : '<p class="text-sm font-medium text-amber-700">Cadastre os períodos deste turno em Horários → Períodos.</p>';
};

const CreateModal = () => `
  <div id="create-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateModal()"></div>
    <div class="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto">
      <h3 class="text-2xl font-bold mb-6">Montar horário</h3>
      <form onsubmit="actions.createSchedule(event)" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase text-slate-500">Matéria</span>
            <input type="text" id="form-subject" list="form-subject-options" placeholder="Selecione ou digite a matéria" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <datalist id="form-subject-options"></datalist>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase text-slate-500">Turma</span>
            <input type="text" id="form-class-group" placeholder="Ex: 9A, 3BI" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </label>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase text-slate-500">Sala</span>
            <input type="text" id="form-room" placeholder="Sala" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </label>
          <label class="space-y-1">
            <span class="text-xs font-bold uppercase text-slate-500">Professor</span>
            <select id="form-teacher" onchange="actions.updateScheduleSubjectOptions(this.value)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
              <option value="">Selecione o Professor</option>
              ${teachers.map(t => `<option value="${t.uid}">${t.displayName}</option>`).join('')}
            </select>
          </label>
        </div>
        <label class="block space-y-1">
          <span class="text-xs font-bold uppercase text-slate-500">Tipo de agendamento</span>
          <select id="form-schedule-mode" onchange="actions.setScheduleCreateMode(this.value)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm text-slate-900">
            <option value="weekly" selected>Repetir semanalmente no período</option>
            <option value="single">Somente uma data</option>
          </select>
        </label>
        <div id="form-weekly-fields" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="space-y-1">
              <span class="text-xs font-bold uppercase text-slate-500">Data inicial</span>
              <input type="date" id="form-start-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm text-slate-900" required>
            </label>
            <label class="space-y-1">
              <span class="text-xs font-bold uppercase text-slate-500">Data final</span>
              <input type="date" id="form-end-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm text-slate-900" required>
            </label>
          </div>
          <fieldset class="rounded-xl border border-slate-200 p-3">
            <legend class="px-1 text-xs font-bold uppercase text-slate-500">Dias da semana</legend>
            <div class="flex flex-wrap gap-3">
              ${[['1', 'Segunda'], ['2', 'Terça'], ['3', 'Quarta'], ['4', 'Quinta'], ['5', 'Sexta']].map(([value, label]) => `
                <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" name="form-weekday" value="${value}" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"> ${label}
                </label>
              `).join('')}
            </div>
          </fieldset>
        </div>
        <div id="form-single-date-field" class="hidden">
          <label class="block space-y-1">
            <span class="text-xs font-bold uppercase text-slate-500">Data da aula</span>
            <input type="date" id="form-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm text-slate-900">
          </label>
        </div>
        <label class="block space-y-1">
          <span class="text-xs font-bold uppercase text-slate-500">Turno</span>
          <select id="form-turno" onchange="actions.setScheduleTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm text-slate-900">
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
        </label>
        <fieldset class="rounded-xl border border-slate-200 p-3">
          <legend class="px-1 text-xs font-bold uppercase text-slate-500">Períodos da aula</legend>
          <div id="form-period-options">${SchedulePeriodOptions('manha')}</div>
          <p class="mt-2 text-xs text-slate-500">A 6ª aula será criada somente nos dias da semana que você selecionar acima.</p>
        </fieldset>
        <div class="flex gap-4 pt-2">
          <button type="button" onclick="actions.hideCreateModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" ${schoolPeriods.length ? '' : 'disabled'} class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Gerar horários</button>
        </div>
      </form>
    </div>
  </div>
`;

const SchoolPeriodsModal = () => `
  <div id="school-periods-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideSchoolPeriodsModal()"></div>
    <div class="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl max-h-[92vh] overflow-y-auto">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 class="text-2xl font-bold">Períodos da escola</h3>
          <p class="mt-1 text-sm text-slate-500">Configure uma vez os horários que serão usados nas grades.</p>
        </div>
        <button type="button" onclick="actions.hideSchoolPeriodsModal()" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar">✕</button>
      </div>
      ${schoolPeriodsError ? `<p class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">${schoolPeriodsError}</p>` : ''}
      <form onsubmit="actions.saveSchoolPeriod(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 p-4">
        <select id="period-turno" onchange="actions.setPeriodAdminTurno(this.value)" class="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" aria-label="Turno do período">
          <option value="manha" ${periodAdminTurno === 'manha' ? 'selected' : ''}>Manhã</option>
          <option value="tarde" ${periodAdminTurno === 'tarde' ? 'selected' : ''}>Tarde</option>
          <option value="noite" ${periodAdminTurno === 'noite' ? 'selected' : ''}>Noite</option>
        </select>
        <input id="period-name" type="text" placeholder="Nome (ex.: 1ª aula)" class="sm:col-span-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" required>
        <input id="period-start" type="time" class="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" required>
        <input id="period-end" type="time" class="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" required>
        <button type="submit" class="sm:col-span-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Adicionar ao turno selecionado</button>
      </form>
      <div class="mt-5 space-y-6">
        ${['manha', 'tarde', 'noite'].map(turno => {
          const periods = schoolPeriods.filter(period => period.turno === turno);
          return `
            <section class="space-y-3">
              <h4 class="text-sm font-black uppercase tracking-wide text-slate-700">${TURNO_LABELS[turno]} <span class="font-medium normal-case text-slate-400">${turno !== 'noite' ? '(até 6 aulas)' : '(até 5 aulas)'}</span></h4>
              ${periods.map(period => `
                <form onsubmit="actions.updateSchoolPeriod(event, ${period.id})" class="grid grid-cols-1 sm:grid-cols-[1fr_125px_125px_auto_auto] items-center gap-2 rounded-xl border border-slate-200 p-3">
                  <input id="period-name-${period.id}" type="text" value="${period.name}" class="w-full rounded-lg border border-slate-200 p-2 text-sm" aria-label="Nome do período" required>
                  <input id="period-start-${period.id}" type="time" value="${String(period.startTime).slice(0, 5)}" class="w-full rounded-lg border border-slate-200 p-2 text-sm" aria-label="Início" required>
                  <input id="period-end-${period.id}" type="time" value="${String(period.endTime).slice(0, 5)}" class="w-full rounded-lg border border-slate-200 p-2 text-sm" aria-label="Término" required>
                  <button type="submit" class="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Salvar</button>
                  <button type="button" onclick="actions.deleteSchoolPeriod(${period.id})" class="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600">Excluir</button>
                </form>
              `).join('') || '<p class="rounded-lg bg-slate-50 p-3 text-sm text-slate-400">Nenhum período cadastrado neste turno.</p>'}
            </section>
          `;
        }).join('')}
      </div>
    </div>
  </div>
`;

const EditModal = () => `
  <div id="edit-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideEditModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
      <h3 class="text-2xl font-bold mb-6 text-slate-800">Editar Horário</h3>
      <form onsubmit="actions.updateSchedule(event)" class="space-y-4">
        <input type="hidden" id="edit-form-id">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Matéria</label>
            <input type="text" id="edit-form-subject" list="edit-form-subject-options" placeholder="Selecione ou digite a matéria" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <datalist id="edit-form-subject-options"></datalist>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Turma</label>
            <input type="text" id="edit-form-class-group" placeholder="Turma (ex: 9A, 3BI)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data</label>
            <input type="date" id="edit-form-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sala / Local</label>
            <input type="text" id="edit-form-room" placeholder="Sala" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
        </div>
        <label class="block">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Turno</span>
          <select id="edit-form-turno" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm text-slate-900" required>
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
          </select>
        </label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora Início</label>
            <input type="time" id="edit-form-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora Término</label>
            <input type="time" id="edit-form-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Professor</label>
          <select id="edit-form-teacher" onchange="actions.updateScheduleSubjectOptions(this.value, '', 'edit-form')" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <option value="">Selecione o Professor</option>
            ${teachers.map(t => `<option value="${t.uid}">${t.displayName}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
          <select id="edit-form-status" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="absent">Falta / Ausente</option>
          </select>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideEditModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Salvar</button>
        </div>
      </form>
    </div>
  </div>
`;

const DeleteConfirmModal = () => `
  <div id="delete-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideDeleteModal()"></div>
    <div class="bg-white w-full max-w-sm rounded-[2rem] p-6 relative z-10 shadow-2xl border border-slate-100">
      <div class="flex items-center gap-3 mb-4 text-rose-600">
        <div class="bg-rose-50 p-2.5 rounded-2xl">
          <i data-lucide="alert-triangle" class="w-6 h-6"></i>
        </div>
        <h3 class="text-lg font-black text-slate-800">Confirmar Exclusão</h3>
      </div>
      <p class="text-xs text-slate-500 mb-6 leading-relaxed">Você tem certeza de que deseja excluir este horário? Esta ação não poderá ser desfeita.</p>
      <input type="hidden" id="delete-schedule-id">
      <div class="flex gap-3">
        <button onclick="actions.hideDeleteModal()" class="flex-1 py-3 text-xs font-bold text-slate-600 border rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        <button onclick="actions.confirmDeleteSchedule()" class="flex-1 py-3 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/10 transition-all">Excluir</button>
      </div>
    </div>
  </div>
`;

const LabModal = () => `
  <div id="lab-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideLabModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
      <h3 class="text-2xl font-bold mb-8">Reservar Laboratório</h3>
      <form onsubmit="actions.createLabBooking(event)" class="space-y-4">
        <p class="text-sm text-slate-500">Confira as reservas da escola na agenda para escolher um horário disponível.</p>
        <label class="block">
          <span class="mb-1.5 block text-xs font-bold uppercase text-slate-500">Laboratório</span>
          <select id="lab-type" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            <option value="info">Informática</option>
            <option value="chem">Química</option>
          </select>
        </label>
        <label class="block">
          <span class="mb-1.5 block text-xs font-bold uppercase text-slate-500">Data</span>
          <input type="date" id="lab-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </label>
        <div class="grid grid-cols-2 gap-4">
          <label class="block">
            <span class="mb-1.5 block text-xs font-bold uppercase text-slate-500">Início</span>
            <input type="time" id="lab-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </label>
          <label class="block">
            <span class="mb-1.5 block text-xs font-bold uppercase text-slate-500">Término</span>
            <input type="time" id="lab-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
          </label>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideLabModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Reservar</button>
        </div>
      </form>
    </div>
  </div>
`;

const CreateEscolaModal = () => `
  <div id="create-escola-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateEscolaModal()"></div>
    <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
      <h3 class="text-2xl font-bold mb-6">Criar Nova Escola</h3>
      <form onsubmit="actions.createSchool(event)" class="space-y-4">
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Nome da Escola</label>
          <input type="text" id="escola-name" placeholder="Ex: Colégio Estadual..." class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateEscolaModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar</button>
        </div>
      </form>
    </div>
  </div>
`;

const CreateUserModal = ({ viewerRole = 'dev' } = {}) => `
  <div id="create-user-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateUserModal()"></div>
    <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
      <h3 class="text-2xl font-bold mb-6">Criar Novo Usuário</h3>
      <form onsubmit="actions.createUser(event)" class="space-y-4">
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Nome</label>
          <input type="text" id="user-displayname" placeholder="Ex: João Silva" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">E-mail</label>
          <input type="email" id="user-email" placeholder="Ex: joao@example.com" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Senha</label>
          <input type="password" id="user-password" placeholder="Mínimo 8 caracteres" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required minlength="8">
        </div>
        ${viewerRole === 'dev' ? `
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Escola</label>
            <select id="user-school" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
              <option value="">Selecione uma escola</option>
              ${schools.map(school => `<option value="${school.id}">${school.name}</option>`).join('')}
            </select>
          </div>
        ` : ''}
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Matérias</label>
          <input type="text" id="user-subject" placeholder="Ex: Matemática, Física, Química" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Cargo</label>
          <select id="user-role" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900" required>
            ${viewerRole === 'dev'
              ? `
                <option value="">Selecione um cargo</option>
                <option value="teacher">Professor</option>
                <option value="diretor">Diretor / Direção Pedagógica</option>
                <option value="dev">Desenvolvedor</option>
              `
              : `
                <option value="">Selecione um cargo</option>
                <option value="teacher">Professor</option>
                <option value="diretor">Diretor / Direção Pedagógica</option>
              `
            }
          </select>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateUserModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar</button>
        </div>
      </form>
    </div>
  </div>
`;

const DeveloperOverviewTab = () => {
  const connected = !!devDiagnostics?.api.ok && !!devDiagnostics?.database.ok;
  const totalSchedules = schedules.length;
  const totalUsers = allUsers.length;
  const totalLabs = labBookings.length;

  return `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Visão geral da plataforma</h3>
          <p class="text-sm text-slate-500 font-medium">Monitoramento da API, usuários e dados operacionais do site.</p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-full ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
          <i data-lucide="database" class="w-3.5 h-3.5"></i> ${connected ? 'Supabase online' : 'Modo local'}
        </div>
      </div>

      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Status</p>
            <span class="w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400'}"></span>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${connected ? 'OK' : 'Local'}</p>
          <p class="mt-2 text-sm text-slate-500">Conexão com a API express</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Usuários</p>
            <i data-lucide="users" class="w-4 h-4 text-blue-600"></i>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${totalUsers}</p>
          <p class="mt-2 text-sm text-slate-500">Contas cadastradas</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Horários</p>
            <i data-lucide="calendar" class="w-4 h-4 text-violet-600"></i>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${totalSchedules}</p>
          <p class="mt-2 text-sm text-slate-500">Registros no banco</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Labs</p>
            <i data-lucide="beaker" class="w-4 h-4 text-emerald-600"></i>
          </div>
          <p class="mt-5 text-3xl font-black text-slate-900">${totalLabs}</p>
          <p class="mt-2 text-sm text-slate-500">Reservas registradas</p>
        </div>
      </div>

      <div class="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h4 class="text-lg font-black text-slate-900">Infraestrutura do projeto</h4>
          <div class="mt-5 space-y-4">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <span class="text-sm font-semibold text-slate-500">Banco de dados</span>
              <span class="text-sm font-black text-slate-900">Supabase Postgres</span>
            </div>
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <span class="text-sm font-semibold text-slate-500">Autenticação</span>
              <span class="text-sm font-black text-slate-900">Auth + RLS</span>
            </div>
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <span class="text-sm font-semibold text-slate-500">API</span>
              <span class="text-sm font-black text-slate-900">Express + Vite</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 rounded-3xl p-6 shadow-lg text-white">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-black">Environment</h4>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-200">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Seguro
            </span>
          </div>
          <div class="mt-5 space-y-4 text-sm text-slate-300">
            <div class="rounded-2xl bg-white/5 p-3">
              <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">API base</p>
              <p class="mt-1 font-semibold break-all">${apiBaseUrl || 'http://localhost:3000'}</p>
            </div>
            <div class="rounded-2xl bg-white/5 p-3">
              <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">Proteção</p>
              <p class="mt-1 font-semibold">Service role no backend apenas</p>
            </div>
            <div class="rounded-2xl bg-white/5 p-3">
              <p class="text-[10px] uppercase tracking-[0.18em] text-slate-400">Armazenamento</p>
              <p class="mt-1 font-semibold">Usuários, horários, laboratórios e certificados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const escapeDeveloperHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const developerRefreshButton = () => `
  <button onclick="actions.refreshDeveloperPanel()" class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
    <i data-lucide="refresh-cw" class="h-4 w-4"></i> Atualizar
  </button>
`;

const developerErrorNotice = key => devPanelErrors[key] ? `
  <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">${escapeDeveloperHtml(devPanelErrors[key])}</div>
` : '';

const DeveloperHealthTab = () => {
  const diagnostics = devDiagnostics;
  const apiOk = diagnostics?.api.ok;
  const databaseOk = diagnostics?.database.ok;
  return `
    <div class="space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Saúde do sistema</h3>
          <p class="mt-1 text-sm font-medium text-slate-500">Estado atual da API e conexão com o banco de dados.</p>
        </div>
        ${developerRefreshButton()}
      </header>
      ${developerErrorNotice('diagnostics')}
      <div class="grid gap-4 md:grid-cols-3">
        ${[
          { title: 'API', ok: apiOk, detail: apiOk === undefined ? 'Aguardando verificação' : apiOk ? 'Respondendo normalmente' : 'Indisponível' },
          { title: 'Banco de dados', ok: databaseOk, detail: databaseOk === undefined ? 'Aguardando verificação' : databaseOk ? `${diagnostics.database.latencyMs} ms de resposta` : 'Falha ao consultar o banco' },
          { title: 'Tempo ativo', ok: apiOk, detail: diagnostics ? `${Math.floor(diagnostics.uptimeSeconds / 60)} min` : 'Aguardando verificação' }
        ].map(item => `
          <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="font-black text-slate-800">${item.title}</h4>
              <span class="rounded-full px-3 py-1 text-xs font-black ${item.ok === undefined ? 'bg-slate-100 text-slate-500' : item.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${item.ok === undefined ? 'PENDENTE' : item.ok ? 'OK' : 'FALHA'}</span>
            </div>
            <p class="mt-4 text-sm font-semibold text-slate-500">${item.detail}</p>
          </article>
        `).join('')}
      </div>
      ${diagnostics ? `<p class="text-xs font-medium text-slate-400">Verificado em ${new Date(diagnostics.checkedAt).toLocaleString('pt-BR')}.</p>` : ''}
    </div>
  `;
};

const DeveloperDiagnosticsTab = () => `
  <div class="space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-2xl font-black text-slate-900">Diagnóstico</h3>
        <p class="mt-1 text-sm font-medium text-slate-500">Testes de leitura nas tabelas e verificações básicas de integridade.</p>
      </div>
      ${developerRefreshButton()}
    </header>
    ${developerErrorNotice('diagnostics')}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h4 class="border-b border-slate-100 p-5 font-black text-slate-800">Conexão e latência por tabela</h4>
      ${devDiagnostics ? `
        <div class="overflow-x-auto">
          <table class="w-full min-w-[560px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-400"><tr><th class="px-5 py-3">Tabela</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Registros</th><th class="px-5 py-3">Resposta</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              ${devDiagnostics.probes.map(probe => `
                <tr>
                  <td class="px-5 py-3 font-semibold text-slate-700">${escapeDeveloperHtml(probe.table)}</td>
                  <td class="px-5 py-3 font-bold ${probe.ok ? 'text-emerald-700' : 'text-rose-700'}">${probe.ok ? 'OK' : 'Falha'}</td>
                  <td class="px-5 py-3 text-slate-600">${probe.records ?? '—'}</td>
                  <td class="px-5 py-3 text-slate-600">${probe.latencyMs} ms</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="p-5 text-sm font-medium text-slate-500">Atualize para executar os testes.</p>'}
    </section>
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 class="font-black text-slate-800">Integridade básica</h4>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        ${(devDiagnostics?.integrity || []).map(check => `
          <div class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
            <span class="text-sm font-semibold text-slate-600">${escapeDeveloperHtml(check.name)}</span>
            <span class="text-sm font-black ${check.ok && check.count === 0 ? 'text-emerald-700' : 'text-amber-700'}">${check.ok ? check.count : 'Erro na consulta'}</span>
          </div>
        `).join('')}
        ${!devDiagnostics ? '<p class="text-sm text-slate-500">Os resultados aparecerão após a verificação.</p>' : ''}
      </div>
    </section>
  </div>
`;

const DeveloperLogsTab = () => `
  <div class="space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-2xl font-black text-slate-900">Logs de erros</h3>
        <p class="mt-1 text-sm font-medium text-slate-500">Últimos 100 erros HTTP 5xx registrados pela API. O conteúdo dos pedidos não é armazenado.</p>
      </div>
      ${developerRefreshButton()}
    </header>
    ${developerErrorNotice('logs')}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      ${devErrorLogs.length ? `
        <div class="overflow-x-auto">
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-400"><tr><th class="px-5 py-3">Data</th><th class="px-5 py-3">Método</th><th class="px-5 py-3">Rota</th><th class="px-5 py-3">Código</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              ${devErrorLogs.map(log => `
                <tr><td class="px-5 py-3 text-slate-600">${new Date(log.created_at).toLocaleString('pt-BR')}</td><td class="px-5 py-3 font-bold text-slate-700">${escapeDeveloperHtml(log.method)}</td><td class="px-5 py-3 font-mono text-xs text-slate-600">${escapeDeveloperHtml(log.route)}</td><td class="px-5 py-3 font-black text-rose-700">${escapeDeveloperHtml(log.status_code)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="p-5 text-sm font-medium text-slate-500">Nenhum erro registrado ou ainda não há logs disponíveis.</p>'}
    </section>
  </div>
`;

const DeveloperAuditTab = () => `
  <div class="space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-2xl font-black text-slate-900">Auditoria</h3>
        <p class="mt-1 text-sm font-medium text-slate-500">Últimas 100 alterações concluídas, com usuário, rota e horário.</p>
      </div>
      ${developerRefreshButton()}
    </header>
    ${developerErrorNotice('audit')}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      ${devAuditLogs.length ? `
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-400"><tr><th class="px-5 py-3">Data</th><th class="px-5 py-3">Usuário</th><th class="px-5 py-3">Ação</th><th class="px-5 py-3">Rota</th><th class="px-5 py-3">Resultado</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              ${devAuditLogs.map(entry => `
                <tr><td class="px-5 py-3 text-slate-600">${new Date(entry.created_at).toLocaleString('pt-BR')}</td><td class="px-5 py-3 font-mono text-xs text-slate-600">${escapeDeveloperHtml(entry.actor_uid)} <span class="font-sans">(${escapeDeveloperHtml(entry.actor_role)})</span></td><td class="px-5 py-3 font-bold text-slate-700">${escapeDeveloperHtml(entry.method)}</td><td class="px-5 py-3 font-mono text-xs text-slate-600">${escapeDeveloperHtml(entry.route)}</td><td class="px-5 py-3 font-semibold text-emerald-700">${escapeDeveloperHtml(entry.status_code)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="p-5 text-sm font-medium text-slate-500">Nenhuma alteração registrada ou ainda não há eventos disponíveis.</p>'}
    </section>
  </div>
`;

const DeveloperDataTab = () => `
  <div class="space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-2xl font-black text-slate-900">Dados e backups</h3>
        <p class="mt-1 text-sm font-medium text-slate-500">Consulte volumes e exporte dados selecionados da plataforma.</p>
      </div>
      ${developerRefreshButton()}
    </header>
    ${developerErrorNotice('diagnostics')}
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 class="font-black text-slate-800">Registros por tabela</h4>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        ${(devDiagnostics?.probes || []).map(probe => `
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase text-slate-400">${escapeDeveloperHtml(probe.table)}</p>
            <p class="mt-2 text-2xl font-black text-slate-800">${probe.ok ? probe.records : 'Consulta falhou'}</p>
          </div>
        `).join('')}
        ${!devDiagnostics ? '<p class="text-sm text-slate-500">Atualize para consultar as tabelas.</p>' : ''}
      </div>
    </section>
    <section class="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h4 class="font-black text-amber-900">Exportação CSV</h4>
      <p class="mt-1 text-sm text-amber-800">Os arquivos podem conter dados pessoais. Escolha uma tabela e confirme antes de baixar; cada exportação tem limite de 5.000 registros.</p>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <select id="dev-export-resource" class="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <option value="users">Usuários</option>
          <option value="schools">Escolas</option>
          <option value="schedules">Horários</option>
          <option value="school_periods">Períodos escolares</option>
          <option value="lab_bookings">Reservas de laboratório</option>
          <option value="school_subjects">Matérias da escola</option>
          <option value="teacher_subjects">Vínculos de matérias</option>
        </select>
        <button onclick="actions.exportDeveloperData()" class="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-800">Exportar CSV</button>
      </div>
    </section>
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 class="font-black text-slate-800">Backup e restauração</h4>
      <p class="mt-2 text-sm leading-6 text-slate-600">Backups completos devem ser criados e restaurados pelo painel do Supabase, que controla a retenção e os snapshots do projeto. Antes de uma alteração estrutural, confira o backup mais recente e teste a restauração em um ambiente separado.</p>
      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-800">Abrir painel do Supabase <i data-lucide="external-link" class="h-4 w-4"></i></a>
    </section>
  </div>
`;

const DeveloperSidebarBtn = (id, icon, label) => `
  <button onclick="actions.switchTab('${id}')"
    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentTab === id ? 'bg-white/10 text-white font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
    <i data-lucide="${icon}"></i> ${label}
  </button>
`;

const SidebarBtn = (id, icon, label) => `
  <button onclick="actions.switchTab('${id}')"
    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentTab === id ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}">
    <i data-lucide="${icon}"></i> ${label}
  </button>
`;

const Sidebar = ({ theme = 'light', sectionLabel, navItems, profile }) => {
  const isDark = theme === 'dark';
  const btn = isDark ? DeveloperSidebarBtn : SidebarBtn;
  return `
    <aside class="w-64 border-r ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-500'} hidden md:flex flex-col p-6 print:hidden shrink-0">
      <div class="flex items-center mb-10 px-2 shrink-0">${Logo(170, 46)}</div>
      <p class="text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-4 px-4">${sectionLabel}</p>
      <nav class="space-y-1 flex-1">
        ${navItems.map(item => btn(item.id, item.icon, item.label)).join('')}
      </nav>
      ${profile ? `
      <div class="mt-auto pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} mb-6 px-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 border border-slate-200 text-slate-600'} shadow-sm flex items-center justify-center font-bold uppercase shrink-0">
            ${profile.initials}
          </div>
          <div class="overflow-hidden">
            <p class="${isDark ? 'text-white' : 'text-slate-800'} text-sm font-semibold truncate">${profile.name}</p>
            <p class="text-[10px] text-slate-400 font-medium">${profile.subtitle}</p>
          </div>
        </div>
      </div>
      ` : ''}
      <button onclick="actions.logout()" class="flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'} transition-all font-semibold">
        <i data-lucide="log-out"></i> Sair
      </button>
    </aside>
  `;
};

const MobileDrawer = ({ theme = 'light', sectionLabel, navItems, profile, drawerId }) => {
  if (!mobileMenuOpen) return '';
  const isDark = theme === 'dark';
  return `
    <div class="fixed inset-0 z-50 flex md:hidden" id="${drawerId}">
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm shadow-sm" onclick="actions.toggleMobileMenu(false)"></div>
      <div class="relative flex flex-col w-72 max-w-[80vw] h-full ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white'} p-6 shadow-2xl transition-all duration-300 ease-in-out">
        <div class="flex items-center justify-between mb-8 px-2">
          <div class="flex items-center">${Logo(140, 38)}</div>
          <button onclick="actions.toggleMobileMenu(false)" class="p-2 -mr-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <p class="text-[10px] font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mb-4 px-2">${sectionLabel}</p>
        <nav class="space-y-1.5 flex-1">
          ${navItems.map(item => `
            <button onclick="actions.switchTabMobile('${item.id}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${currentTab === item.id ? (isDark ? 'bg-white/10 text-white font-bold' : 'bg-blue-50 text-blue-700 font-bold') : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50')}">
              <i data-lucide="${item.icon}"></i> ${item.label}
            </button>
          `).join('')}
        </nav>

        <div class="mt-auto pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} px-2 flex flex-col gap-4">
          ${profile ? `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 border border-slate-200 text-slate-600'} shadow-sm flex items-center justify-center font-bold uppercase shrink-0">
              ${profile.initials}
            </div>
            <div class="overflow-hidden">
              <p class="${isDark ? 'text-white' : 'text-slate-800'} text-sm font-semibold truncate">${profile.name}</p>
              <p class="text-[10px] text-slate-400 font-medium">${profile.subtitle}</p>
            </div>
          </div>
          ` : ''}
          <button onclick="actions.logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-all font-semibold justify-center border border-rose-100 bg-rose-50/30">
            <i data-lucide="log-out"></i> Sair
          </button>
        </div>
      </div>
    </div>
  `;
};

const DEVELOPER_NAV_ITEMS = [
  { id: 'overview', icon: 'activity', label: 'Visão geral' },
  { id: 'dev_health', icon: 'activity', label: 'Saúde do sistema' },
  { id: 'dev_diagnostics', icon: 'search', label: 'Diagnóstico' },
  { id: 'dev_logs', icon: 'file-text', label: 'Logs de erros' },
  { id: 'dev_audit', icon: 'clipboard', label: 'Auditoria' },
  { id: 'dev_data', icon: 'database', label: 'Dados e backups' },
  { id: 'escolas', icon: 'building', label: 'Escolas' },
  { id: 'materias', icon: 'book-open', label: 'Matérias' },
  { id: 'usuarios', icon: 'users', label: 'Usuários' },
];

const DIRETOR_NAV_ITEMS = [
  { id: 'horarios', icon: 'calendar', label: 'Horários' },
  { id: 'labs', icon: 'test-tube', label: 'Laboratórios' },
  { id: 'materias', icon: 'book-open', label: 'Matérias' },
  { id: 'usuarios', icon: 'users', label: 'Usuários' },
  { id: 'relatorios', icon: 'bar-chart', label: 'Relatórios' },
];

const DeveloperView = () => `
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${Sidebar({ theme: 'dark', sectionLabel: 'Desenvolvedor', navItems: DEVELOPER_NAV_ITEMS })}
    ${MobileDrawer({ theme: 'dark', sectionLabel: 'Desenvolvedor', navItems: DEVELOPER_NAV_ITEMS, drawerId: 'dev-mobile-sidebar-drawer' })}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-dev-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 truncate">Área do desenvolvedor</p>
            <h2 class="font-black text-base md:text-lg text-slate-900 truncate">Console Studia</h2>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="hidden md:inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]"><i data-lucide="code-2" class="w-3.5 h-3.5"></i> Desenvolvedor</span>
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${currentTab === 'overview' ? DeveloperOverviewTab() : ''}
        ${currentTab === 'dev_health' ? DeveloperHealthTab() : ''}
        ${currentTab === 'dev_diagnostics' ? DeveloperDiagnosticsTab() : ''}
        ${currentTab === 'dev_logs' ? DeveloperLogsTab() : ''}
        ${currentTab === 'dev_audit' ? DeveloperAuditTab() : ''}
        ${currentTab === 'dev_data' ? DeveloperDataTab() : ''}
        ${currentTab === 'escolas' ? EscolasTab() : ''}
        ${currentTab === 'materias' ? MateriasEscolaTab({ viewerRole: 'dev' }) : ''}
        ${currentTab === 'usuarios' ? UsersTab({ viewerRole: 'dev' }) : ''}
      </div>
    </main>

    ${CreateModal()}
    ${EditModal()}
    ${DeleteConfirmModal()}
    ${CreateEscolaModal()}
    ${CreateUserModal({ viewerRole: 'dev' })}
  </div>
`;

const DiretorView = () => `
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${Sidebar({ theme: 'light', sectionLabel: 'Direção Pedagógica', navItems: DIRETOR_NAV_ITEMS })}
    ${MobileDrawer({ theme: 'light', sectionLabel: 'Direção Pedagógica', navItems: DIRETOR_NAV_ITEMS, drawerId: 'diretor-mobile-sidebar-drawer' })}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-diretor-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 truncate">Direção Pedagógica</p>
            <h2 class="font-black text-base md:text-lg text-slate-900 truncate">Console Studia</h2>
          </div>
        </div>
        <div class="flex gap-2">
          ${currentTab === 'horarios' ? `
            <button onclick="actions.showSchoolPeriodsModal()" class="bg-slate-100 text-slate-700 px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-1.5 text-xs md:text-sm hover:bg-slate-200 transition-all" id="btn-diretor-periods">
              <i data-lucide="clock-3" class="w-4 h-4"></i> <span>Períodos</span>
            </button>
            <button onclick="actions.showCreateModal()" class="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-blue-700 transition-all" id="btn-diretor-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo Horário</span>
            </button>
          ` : ''}
          ${currentTab === 'labs' ? `
            <button onclick="actions.showLabModal()" class="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-800 transition-all" id="btn-diretor-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          ` : ''}
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${currentTab === 'horarios' ? HorariosTab() : ''}
        ${currentTab === 'labs' ? LabsTab() : ''}
        ${currentTab === 'materias' ? MateriasEscolaTab({ viewerRole: 'diretor' }) : ''}
        ${currentTab === 'usuarios' ? UsersTab({ viewerRole: 'diretor' }) : ''}
        ${currentTab === 'relatorios' ? RelatoriosTab() : ''}
      </div>
    </main>

    ${CreateModal()}
    ${SchoolPeriodsModal()}
    ${EditModal()}
    ${DeleteConfirmModal()}
    ${CreateUserModal({ viewerRole: 'diretor' })}
  </div>
`;

const ROLE_META = {
  dev: { badge: 'bg-emerald-100 text-emerald-700', label: 'Desenvolvedor' },
  diretor: { badge: 'bg-amber-100 text-amber-700', label: 'Diretor / Direção Pedagógica' },
  teacher: { badge: 'bg-blue-100 text-blue-700', label: 'Professor' },
};

const TeacherSubjectAssignments = ({ viewerRole }) => {
  const canChooseSchool = viewerRole === 'dev';
  const activeSchoolId = viewerRole === 'diretor'
    ? user?.school_id
    : (subjectSchoolId || user?.school_id || schools[0]?.id || '');
  const subjects = schoolSubjects.filter(item => item.school_id === activeSchoolId);

  return `
    <section class="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 class="text-xl font-black text-slate-900">Matérias da escola</h4>
          <p class="mt-1 text-sm font-medium text-slate-500">Gerencie o catálogo de matérias desta escola.</p>
        </div>
        ${canChooseSchool ? `
          <select onchange="actions.selectSubjectSchool(this.value)" class="w-full md:w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700" aria-label="Escola do catálogo de matérias">
            <option value="">Selecione uma escola</option>
            ${schools.map(school => `<option value="${school.id}" ${school.id === activeSchoolId ? 'selected' : ''}>${school.name}</option>`).join('')}
          </select>
        ` : `<span class="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase text-blue-700">${schools.find(school => school.id === activeSchoolId)?.name || 'Minha escola'}</span>`}
      </div>

      <form onsubmit="actions.createSchoolSubject(event)" class="flex flex-col gap-3 sm:flex-row">
        <input id="school-subject-name" type="text" maxlength="255" placeholder="Adicionar matéria ao checklist" class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800" required ${activeSchoolId ? '' : 'disabled'}>
        <button type="submit" class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" ${activeSchoolId ? '' : 'disabled'}>Adicionar matéria</button>
      </form>

      ${!activeSchoolId ? `
        <p class="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Cadastre uma escola para gerenciar o catálogo de matérias.</p>
      ` : subjects.length === 0 ? `
        <p class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">O checklist está vazio. Adicione as matérias usadas nesta escola.</p>
      ` : `
        <div class="space-y-3">
          ${subjects.map(subject => `
            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="flex items-center justify-between gap-3">
                <h5 class="font-black text-slate-800">${subject.subject}</h5>
                <button type="button" onclick="actions.deleteSchoolSubject(${subject.id})" class="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500" aria-label="Excluir matéria ${subject.subject}" title="Excluir matéria">
                  <i data-lucide="trash-2" class="h-4 w-4"></i>
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </section>
  `;
};

const MateriasEscolaTab = ({ viewerRole }) => `
  <div class="space-y-5">
    <div>
      <h3 class="text-2xl font-black text-slate-900">Matérias</h3>
      <p class="mt-1 text-sm font-medium text-slate-500">Gerencie o catálogo de matérias e as matérias disponíveis para os professores.</p>
    </div>
    ${TeacherSubjectAssignments({ viewerRole })}
  </div>
`;

const UsersTab = ({ viewerRole = 'diretor' } = {}) => {
  const canManageAllRoles = viewerRole === 'dev';
  const users = [...allUsers]
    .filter(account => canManageAllRoles || account.role !== 'dev')
    .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
  const editingTeacher = users.find(account => account.uid === editingTeacherSubjectsId && account.role === 'teacher');
  const editingTeacherSubjects = editingTeacher
    ? schoolSubjects.filter(subject => subject.school_id === editingTeacher.school_id)
    : [];
  const selectableUserIds = users.filter(account => account.uid !== user?.uid).map(account => account.uid);
  const selectedCount = selectableUserIds.filter(uid => selectedUserIds.has(uid)).length;
  const allUsersSelected = selectableUserIds.length > 0 && selectedCount === selectableUserIds.length;

  const roleOptions = canManageAllRoles
    ? ['teacher', 'diretor', 'dev']
    : ['teacher', 'diretor'];

  return `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Gestão de usuários</h3>
          <p class="text-sm text-slate-500 font-medium">${canManageAllRoles ? 'Todas as contas cadastradas no sistema.' : 'Direção pedagógica e professores cadastrados na sua escola.'}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          ${(canManageAllRoles || viewerRole === 'diretor') ? `
            <button onclick="actions.showCreateUserModal('${viewerRole}')" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
              <i data-lucide="plus" class="w-4 h-4"></i> Criar Usuário
            </button>
          ` : ''}
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
            <i data-lucide="users" class="w-3.5 h-3.5"></i> ${users.length} usuários
          </div>
        </div>
      </div>

      ${selectedCount > 0 ? `
        <div class="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm font-bold text-rose-800">${selectedCount} conta${selectedCount === 1 ? '' : 's'} selecionada${selectedCount === 1 ? '' : 's'} para exclusão.</p>
          <button type="button" onclick="actions.deleteSelectedUsers()" class="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700">
            <i data-lucide="trash-2" class="h-4 w-4"></i> Excluir selecionados
          </button>
        </div>
      ` : ''}

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[820px] text-left">
            <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 border-b border-slate-200">
              <tr>
                <th class="w-12 px-4 py-4">
                  <input type="checkbox" aria-label="Selecionar todos os usuários" ${allUsersSelected ? 'checked' : ''} ${selectableUserIds.length ? '' : 'disabled'} onchange="actions.toggleAllUsers(this.checked)" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                </th>
                <th class="px-6 py-4">Nome</th>
                <th class="px-6 py-4">E-mail</th>
                <th class="px-6 py-4">Perfil</th>
                <th class="px-6 py-4">Matéria</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${users.length === 0 ? `
                <tr>
                  <td colspan="6" class="px-6 py-10 text-center text-sm text-slate-500 font-medium">Nenhum usuário encontrado.</td>
                </tr>
              ` : users.map(u => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-6">
                    <input type="checkbox" aria-label="Selecionar ${u.email || u.displayName || 'usuário'}" ${selectedUserIds.has(u.uid) ? 'checked' : ''} ${u.uid === user?.uid ? 'disabled' : ''} onchange="actions.toggleUserSelection('${u.uid}', this.checked)" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40">
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center uppercase">
                        ${(u.displayName || 'U').slice(0, 2)}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900">${u.displayName || 'Usuário sem nome'}</div>
                        <div class="text-[10px] uppercase tracking-[0.18em] text-slate-400">${u.uid === user?.uid ? 'Você' : 'Conta ativa'}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">${u.email || '—'}</td>
                  <td class="px-6 py-4">
                    ${u.uid === user?.uid ? `
                      <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${(ROLE_META[u.role] || ROLE_META.teacher).badge}">
                        ${(ROLE_META[u.role] || ROLE_META.teacher).label}
                      </span>
                    ` : `
                      <select
                        onchange="actions.changeUserRole('${u.uid}', this.value)"
                        class="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${(ROLE_META[u.role] || ROLE_META.teacher).badge} cursor-pointer"
                      >
                        ${roleOptions.map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${ROLE_META[r].label}</option>`).join('')}
                      </select>
                    `}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                    ${u.role === 'teacher' ? `
                      <div class="flex min-w-40 flex-col items-start gap-2">
                        <span>${schoolSubjects.filter(subject => subject.school_id === u.school_id && (subject.teacherIds || []).includes(u.uid)).map(subject => subject.subject).join(', ') || '—'}</span>
                        <button type="button" onclick="actions.toggleTeacherSubjectsEditor('${u.uid}')" class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">
                          <i data-lucide="pencil" class="h-3.5 w-3.5"></i> Editar matérias
                        </button>
                      </div>
                    ` : '—'}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      onclick="actions.deleteUser('${u.uid}', '${(u.displayName || 'Usuário').replace(/'/g, "\\'")}', '${u.email || 'usuário'}')"
                      class="inline-flex items-center gap-2 rounded-xl border ${u.uid === user?.uid ? 'border-slate-200 text-slate-400 cursor-not-allowed' : 'border-rose-200 text-rose-600 hover:bg-rose-50'} px-3 py-2 text-xs font-bold disabled:opacity-60"
                      ${u.uid === user?.uid ? 'disabled' : ''}
                    >
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      ${u.uid === user?.uid ? 'Você' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${editingTeacher ? `
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <section class="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="teacher-subjects-title">
            <header class="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h4 id="teacher-subjects-title" class="text-lg font-black text-slate-900">Matérias de ${editingTeacher.displayName || editingTeacher.email}</h4>
                <p class="mt-1 text-sm font-medium text-slate-500">Marque ou desmarque as matérias deste professor.</p>
              </div>
              <button type="button" onclick="actions.closeTeacherSubjectsEditor()" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar edição de matérias">
                <i data-lucide="x" class="h-5 w-5"></i>
              </button>
            </header>
            <div class="max-h-[60vh] space-y-2 overflow-y-auto p-5">
              ${!editingTeacher.school_id ? `
                ${canManageAllRoles ? `
                  <div class="space-y-3 rounded-xl bg-amber-50 p-4">
                    <p class="text-sm font-semibold text-amber-800">Este professor ainda não está associado a uma escola. Selecione a escola para continuar.</p>
                    <select id="teacher-school-${editingTeacher.uid}" class="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                      <option value="">Selecione uma escola</option>
                      ${schools.map(school => `<option value="${school.id}">${school.name}</option>`).join('')}
                    </select>
                    <button type="button" onclick="actions.assignTeacherSchool('${editingTeacher.uid}')" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Associar escola</button>
                  </div>
                ` : '<p class="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Este professor ainda não está associado a uma escola. Peça à direção pedagógica para vinculá-lo.</p>'}
              ` : editingTeacherSubjects.length ? editingTeacherSubjects.map(subject => {
                const isAssigned = (subject.teacherIds || []).includes(editingTeacher.uid);
                return `
                  <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <input type="checkbox" ${isAssigned ? 'checked' : ''} onchange="actions.setTeacherSubject('${subject.id}', '${editingTeacher.uid}', this.checked)" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                    ${subject.subject}
                  </label>
                `;
              }).join('') : `
                <p class="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Não há matérias cadastradas para a escola deste professor.</p>
              `}
            </div>
            <footer class="flex justify-end border-t border-slate-200 p-4">
              <button type="button" onclick="actions.closeTeacherSubjectsEditor()" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Concluir</button>
            </footer>
          </section>
        </div>
      ` : ''}
    </div>
  `;
};

const EscolasTab = () => `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-xl md:text-2xl font-black text-slate-900">Gerenciar Escolas</h3>
        <p class="text-xs md:text-sm text-slate-500 font-bold">Crie escolas e associe diretores</p>
      </div>
      <button onclick="actions.showCreateEscolaModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Nova Escola
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto pr-2">
        <table class="w-full text-left min-w-[500px]">
          <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
            <tr>
              <th class="px-8 py-5">Nome da Escola</th>
              <th class="px-8 py-5">Criado por</th>
              <th class="px-8 py-5">Data</th>
              <th class="px-8 py-5">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${schools && schools.length > 0 ? schools.map(s => `
              <tr class="hover:bg-slate-50 transition-all">
                <td class="px-8 py-5 font-bold">${s.name}</td>
                <td class="px-8 py-5 text-sm">
                  ${allUsers.find(u => u.uid === s.createdBy)?.displayName || '—'}
                </td>
                <td class="px-8 py-5 text-sm text-slate-500">
                  ${new Date(s.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td class="px-8 py-5 text-right">
                  <button onclick="actions.deleteSchool('${s.id}')" class="text-slate-300 hover:text-rose-500 transition-all cursor-pointer" title="Deletar">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="px-8 py-8 text-center text-slate-400 text-sm">Nenhuma escola criada ainda</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

const HorariosTab = () => `
  <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:mb-4">
    <h3 class="text-2xl font-black text-slate-900">Grade de Horários</h3>
    <div class="flex flex-wrap items-center gap-3 print:hidden">
      <label class="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
        Turno
        <select onchange="actions.setScheduleListTurno(this.value)" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case text-slate-700">
          <option value="todos" ${scheduleListTurno === 'todos' ? 'selected' : ''}>Todos</option>
          <option value="manha" ${scheduleListTurno === 'manha' ? 'selected' : ''}>Manhã</option>
          <option value="tarde" ${scheduleListTurno === 'tarde' ? 'selected' : ''}>Tarde</option>
          <option value="noite" ${scheduleListTurno === 'noite' ? 'selected' : ''}>Noite</option>
        </select>
      </label>
      ${user?.role === 'diretor' ? `
        <button onclick="actions.deleteAllSchedules()" class="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50" ${filterSchedulesByTurno(schedules, scheduleListTurno).length ? '' : 'disabled'}>
        <i data-lucide="trash-2" class="h-4 w-4"></i>
        Remover ${scheduleListTurno === 'todos' ? 'todos' : `do turno da ${TURNO_LABELS[scheduleListTurno]}`}
        </button>
      ` : ''}
    </div>
  </div>
  <div class="bg-white rounded-3xl border overflow-hidden shadow-sm print:border-none print:shadow-none">
    <div class="overflow-x-auto pr-2">
      <table class="w-full text-left min-w-[800px]">
      <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
        <tr>
          <th class="px-8 py-5">Matéria</th>
          <th class="px-8 py-5">Turno</th>
          <th class="px-8 py-5">Horário / Data</th>
          <th class="px-8 py-5">Professor</th>
          <th class="px-8 py-5 text-center">Status</th>
          <th class="px-8 py-5 print:hidden"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        ${filterSchedulesByTurno(schedules, scheduleListTurno).map(s => `
          <tr class="hover:bg-slate-50 transition-all">
            <td class="px-8 py-5 font-bold">${s.subject}</td>
            <td class="px-8 py-5 text-xs font-black uppercase text-slate-500">${TURNO_LABELS[getScheduleTurno(s)]}</td>
            <td class="px-8 py-5">
              <div class="text-sm font-bold">${s.startTime}</div>
              <div class="text-[10px] text-slate-400 uppercase font-bold">${s.date}</div>
            </td>
            <td class="px-8 py-5 text-sm">
              <span class="font-bold text-slate-800">${s.teacherName}</span>
              ${s.classGroup ? `<span class="block text-xs font-semibold text-blue-600 mt-0.5">${s.classGroup}</span>` : ''}
            </td>
            <td class="px-8 py-5">
              <div class="flex justify-center">
                <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                  s.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                  s.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                  'bg-slate-100 text-slate-500'
                }">${s.status === 'confirmed' ? 'Confirmado' : s.status === 'absent' ? 'Ausente' : 'Pendente'}</span>
              </div>
            </td>
            <td class="px-8 py-5 text-right print:hidden">
              <div class="flex items-center justify-end gap-3">
                <button type="button" onclick="window.actions.showEditModalById('${s.id}')" class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500" title="Editar horário">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                  <span>Editar</span>
                </button>
                <button onclick="actions.showDeleteModal(${s.id})" class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500" title="Excluir horário" aria-label="Excluir horário">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
   </div>
  </div>
`;

const MateriasTab = () => `
  <div class="space-y-6 animate-fade-in">
    <div>
      <h3 class="text-xl md:text-2xl font-black text-slate-900">Minhas Matérias</h3>
      <p class="text-xs md:text-sm text-slate-500 font-medium">Consulte suas matérias, turmas e quantidade de aulas semanais.</p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <label class="text-xs font-bold text-slate-500">
        Buscar matéria ou turma
        <input id="teacher-subject-search" type="search" value="${escapeHtml(teacherSubjectSearch)}" oninput="actions.setTeacherSubjectSearch(this.value)" placeholder="Ex.: Matemática, 7º A" class="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
      </label>
      <label class="text-xs font-bold text-slate-500">
        Turno
        <select onchange="actions.setTeacherTurno(this.value)" class="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
          <option value="todos" ${teacherTurno === 'todos' ? 'selected' : ''}>Todos</option>
          <option value="manha" ${teacherTurno === 'manha' ? 'selected' : ''}>Manhã</option>
          <option value="tarde" ${teacherTurno === 'tarde' ? 'selected' : ''}>Tarde</option>
          <option value="noite" ${teacherTurno === 'noite' ? 'selected' : ''}>Noite</option>
        </select>
      </label>
    </div>

    ${(() => {
      const normalize = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
      const search = normalize(teacherSubjectSearch);
      const assignedSubjects = window.teacherSubjects || [];
      const teacherSchedules = schedules.filter(schedule =>
        schedule.teacherId === user?.uid &&
        ['confirmed', 'pending'].includes(schedule.status) &&
        (teacherTurno === 'todos' || getScheduleTurno(schedule) === teacherTurno)
      );
      const assignedNames = new Set(assignedSubjects.map(item => normalize(item.subject)));

      const buildClasses = subjectSchedules => {
        const classGroups = new Map();
        subjectSchedules.forEach(schedule => {
          const className = String(schedule.classGroup || '').trim();
          const normalizedClass = normalize(className);
          if (!normalizedClass || normalizedClass === 'sem_turma') return;

          const turno = getScheduleTurno(schedule);
          const key = `${normalizedClass}|${turno}`;
          if (!classGroups.has(key)) {
            classGroups.set(key, { name: className, turno, lessons: new Set() });
          }

          const date = parseLocalDate(schedule.date);
          if (!Number.isNaN(date.getTime())) {
            const lessonTime = `${String(schedule.startTime || '').slice(0, 5)}-${String(schedule.endTime || '').slice(0, 5)}`;
            classGroups.get(key).lessons.add(`${getDayOfWeek(date)}|${lessonTime}`);
          }
        });

        return [...classGroups.values()].sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR') || a.turno.localeCompare(b.turno)
        );
      };

      const renderClassList = classGroups => classGroups.length ? `
        <div class="grid gap-3 sm:grid-cols-2">
          ${classGroups.map(group => `
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h5 class="font-bold text-slate-800">${escapeHtml(formatCompactClassGroup(group.name))}</h5>
                <span class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">${TURNO_LABELS[group.turno]}</span>
              </div>
              <p class="mt-2 text-xs font-medium text-slate-500">${group.lessons.size} ${group.lessons.size === 1 ? 'aula' : 'aulas'} na semana</p>
            </div>
          `).join('')}
        </div>
      ` : '<p class="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-500">Nenhuma turma cadastrada.</p>';

      const subjectCards = assignedSubjects.map((subject, index) => {
        const normalizedSubject = normalize(subject.subject);
        const schedulesForSubject = teacherSchedules.filter(schedule => normalize(schedule.subject) === normalizedSubject);
        const classGroups = buildClasses(schedulesForSubject);
        const subjectMatches = normalizedSubject.includes(search);
        const visibleClasses = !search || subjectMatches
          ? classGroups
          : classGroups.filter(group => normalize(group.name).includes(search));
        if (search && !subjectMatches && visibleClasses.length === 0) return '';

        const expanded = expandedTeacherSubjectCards.has(index);
        return `
          <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button type="button" onclick="actions.toggleTeacherSubjectCard(${index})" aria-expanded="${expanded}" class="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50 sm:p-5">
              <span class="flex min-w-0 items-center gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><i data-lucide="book-open" class="h-5 w-5"></i></span>
                <span class="min-w-0">
                  <span class="block truncate font-black text-slate-900">${escapeHtml(subject.subject)}</span>
                  <span class="mt-1 block text-xs font-medium text-slate-500">${visibleClasses.length} ${visibleClasses.length === 1 ? 'turma' : 'turmas'}</span>
                </span>
              </span>
              <i data-lucide="${expanded ? 'chevron-up' : 'chevron-down'}" class="h-5 w-5 shrink-0 text-slate-400"></i>
            </button>
            ${expanded ? `<div class="border-t border-slate-100 p-4 sm:p-5">${renderClassList(visibleClasses)}</div>` : ''}
          </article>
        `;
      }).join('');

      const otherSchedulesBySubject = new Map();
      teacherSchedules.forEach(schedule => {
        if (assignedNames.has(normalize(schedule.subject))) return;
        const name = String(schedule.subject || '').trim() || 'Matéria não identificada';
        const key = normalize(name);
        if (!otherSchedulesBySubject.has(key)) otherSchedulesBySubject.set(key, { name, schedules: [] });
        otherSchedulesBySubject.get(key).schedules.push(schedule);
      });

      const otherSubjects = [...otherSchedulesBySubject.values()]
        .map(subject => ({ ...subject, classes: buildClasses(subject.schedules) }))
        .filter(subject => !search || normalize(subject.name).includes(search) || subject.classes.some(group => normalize(group.name).includes(search)))
        .map(subject => ({
          ...subject,
          classes: !search || normalize(subject.name).includes(search)
            ? subject.classes
            : subject.classes.filter(group => normalize(group.name).includes(search))
        }));
      const showOtherSubjects = otherSubjects.length > 0;
      const otherExpanded = expandedTeacherSubjectCards.has(-1);
      const noAssignedSubjects = assignedSubjects.length === 0;

      return `
        ${noAssignedSubjects ? `
          <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
            Você ainda não tem matérias vinculadas. Peça à direção pedagógica para associar suas matérias.
          </div>
        ` : ''}
        <div class="space-y-3">
          ${subjectCards}
          ${showOtherSubjects ? `
            <article class="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
              <button type="button" onclick="actions.toggleTeacherSubjectCard(-1)" aria-expanded="${otherExpanded}" class="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-amber-50 sm:p-5">
                <span class="flex min-w-0 items-center gap-3">
                  <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><i data-lucide="book-open" class="h-5 w-5"></i></span>
                  <span class="min-w-0">
                    <span class="block font-black text-slate-900">Outras matérias nos meus horários</span>
                    <span class="mt-1 block text-xs font-medium text-slate-500">Aulas sem vínculo na lista de matérias</span>
                  </span>
                </span>
                <i data-lucide="${otherExpanded ? 'chevron-up' : 'chevron-down'}" class="h-5 w-5 shrink-0 text-slate-400"></i>
              </button>
              ${otherExpanded ? `
                <div class="space-y-5 border-t border-slate-100 p-4 sm:p-5">
                  ${otherSubjects.map(subject => `
                    <section>
                      <h5 class="mb-3 font-black text-slate-800">${escapeHtml(subject.name)}</h5>
                      ${renderClassList(subject.classes)}
                    </section>
                  `).join('')}
                </div>
              ` : ''}
            </article>
          ` : ''}
          ${!subjectCards && !showOtherSubjects && !noAssignedSubjects ? '<p class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-500">Nenhuma matéria ou turma corresponde à busca e ao turno selecionados.</p>' : ''}
          ${subjectCards === '' && !showOtherSubjects && noAssignedSubjects ? '<p class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-medium text-slate-500">Não há horários para exibir com esses filtros.</p>' : ''}
        </div>
      `;
    })()}
  </div>
`;

const LabsTab = () => {
  const sortedBookings = [...labBookings].sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  );
  const filteredBookings = sortedBookings.filter(booking =>
    (!labFilters.date || booking.date === labFilters.date) &&
    (labFilters.labId === 'all' || booking.labId === labFilters.labId) &&
    booking.teacherName.toLocaleLowerCase().includes(labFilters.teacher.toLocaleLowerCase())
  );
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const formatDate = date => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };
  const upcomingBookings = sortedBookings.filter(booking => booking.date >= todayString);

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-xl md:text-2xl font-black text-slate-900">Agenda dos Laboratórios</h3>
          <p class="text-xs md:text-sm text-slate-500 font-medium">Consulte as reservas da escola, filtre a agenda e escolha um horário livre.</p>
        </div>
        <button onclick="actions.showLabModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
          <i data-lucide="plus" class="w-4 h-4"></i> Nova reserva
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${['info', 'chem'].map(type => {
          const typeBookings = upcomingBookings.filter(booking => booking.labId === type).slice(0, 3);
          return `
            <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 class="font-black text-slate-800 flex items-center gap-2">
                <i data-lucide="${type === 'info' ? 'monitor' : 'beaker'}" class="w-5 h-5 text-blue-600"></i>
                ${type === 'info' ? 'Informática' : 'Química'}
              </h4>
              <div class="mt-4 space-y-2">
                ${typeBookings.map(booking => `
                  <div class="flex justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span class="min-w-0 truncate text-sm font-semibold text-slate-700">${booking.teacherName}</span>
                    <span class="shrink-0 text-xs font-bold text-slate-500">${formatDate(booking.date)} · ${booking.startTime.slice(0, 5)}–${booking.endTime.slice(0, 5)}</span>
                  </div>
                `).join('') || '<p class="py-3 text-sm text-slate-400">Sem reservas futuras.</p>'}
              </div>
            </section>
          `;
        }).join('')}
      </div>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 p-5">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 class="font-black text-slate-900">Reservas da escola</h4>
              <p class="text-sm text-slate-500">${filteredBookings.length} de ${labBookings.length} reservas</p>
            </div>
            <div class="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3 sm:pt-0">
              <label class="text-xs font-bold text-slate-500">
                Data
                <input type="date" value="${labFilters.date}" onchange="actions.setLabFilter('date', this.value)" class="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              </label>
              <label class="text-xs font-bold text-slate-500">
                Laboratório
                <select onchange="actions.setLabFilter('labId', this.value)" class="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <option value="all" ${labFilters.labId === 'all' ? 'selected' : ''}>Todos</option>
                  <option value="info" ${labFilters.labId === 'info' ? 'selected' : ''}>Informática</option>
                  <option value="chem" ${labFilters.labId === 'chem' ? 'selected' : ''}>Química</option>
                </select>
              </label>
              <label class="text-xs font-bold text-slate-500">
                Professor
                <input type="search" value="${labFilters.teacher}" onchange="actions.setLabFilter('teacher', this.value)" placeholder="Buscar nome" class="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              </label>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[650px] text-left">
            <thead class="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th class="px-5 py-4">Data</th>
                <th class="px-5 py-4">Horário</th>
                <th class="px-5 py-4">Laboratório</th>
                <th class="px-5 py-4">Responsável</th>
                <th class="px-5 py-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredBookings.map(booking => `
                <tr class="hover:bg-slate-50">
                  <td class="px-5 py-4 font-semibold text-slate-700">${formatDate(booking.date)}</td>
                  <td class="px-5 py-4 font-mono text-sm text-slate-600">${booking.startTime.slice(0, 5)}–${booking.endTime.slice(0, 5)}</td>
                  <td class="px-5 py-4 text-sm font-semibold text-slate-700">${booking.labId === 'info' ? 'Informática' : 'Química'}</td>
                  <td class="px-5 py-4 text-sm font-semibold text-slate-700">${booking.teacherName}</td>
                  <td class="px-5 py-4 text-center">
                    ${user.role === 'dev' || user.role === 'diretor' || booking.teacherId === user.uid ? `
                      <button onclick="actions.deleteLabBooking('${booking.id}')" class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500" title="Cancelar reserva" aria-label="Cancelar reserva">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                      </button>
                    ` : '<span class="text-slate-300">-</span>'}
                  </td>
                </tr>
              `).join('') || `
                <tr><td colspan="5" class="px-5 py-10 text-center text-sm font-medium text-slate-400">
                  ${labBookings.length ? 'Nenhuma reserva corresponde aos filtros.' : 'Ainda não há reservas para esta escola.'}
                </td></tr>
              `}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
};

const RelatoriosTab = () => {
  const weeks = getWeeksList();
  let filteredSchedules = schedules;
  if (reportWeek !== 'all') {
    filteredSchedules = schedules.filter(s => {
      try {
        return getMondayDateStr(s.date) === reportWeek;
      } catch (e) {
        return false;
      }
    });
  }
  filteredSchedules = filterSchedulesByTurno(filteredSchedules, reportTurno);
  const slots = getDetectedSlots(filteredSchedules);

  let displayTeachers = teachers;
  if (reportTeacher !== 'all') {
    displayTeachers = teachers.filter(t => t.uid === reportTeacher);
  }

  // Fallback to extract teachers on current selection if display teachers list is empty but we have schedules
  if (displayTeachers.length === 0 && filteredSchedules.length > 0) {
    const seen = new Set();
    const extracted = [];
    filteredSchedules.forEach(s => {
      if (s.teacherId && !seen.has(s.teacherId)) {
        seen.add(s.teacherId);
        extracted.push({ uid: s.teacherId, displayName: s.teacherName, subject: s.subject });
      }
    });
    displayTeachers = extracted;
  }

  // Dynamic Grid classes based on card size selection
  let gridColsClass = "grid grid-cols-1 sm:grid-cols-2 gap-3.5 print:grid-cols-2 print:gap-3 justify-center";
  if (reportCardSize === 'small') {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 print:grid-cols-5 print:gap-1 justify-center";
  } else if (reportCardSize === 'medium') {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 gap-3.5 print:grid-cols-2 print:gap-3 justify-center";
  } else if (reportCardSize === 'large') {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 print:grid-cols-3 print:gap-3 justify-center";
  } else if (reportCardSize === 'esticado') {
    gridColsClass = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 justify-center";
  } else if (reportCardSize === 'super_esticado') {
    gridColsClass = "grid grid-cols-1 gap-8 print:grid-cols-1 print:gap-6 justify-center";
  }

  const subTabHeader = `
    <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit mb-8 print:hidden overflow-x-auto scrollbar-none select-none shrink-0">
      <button onclick="actions.setRelatorioSubTab('urania')" class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
        currentRelatorioSubTab === 'urania' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }">
        <i data-lucide="grid-3x3" class="w-4 h-4 text-slate-500"></i> Grade de Professores (Individual)
      </button>
      <button onclick="actions.setRelatorioSubTab('frequent')" class="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
        currentRelatorioSubTab === 'frequent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }">
        <i data-lucide="bar-chart-3" class="w-4 h-4 text-slate-500"></i> Gráfico de Frequência
      </button>
    </div>
  `;

  if (currentRelatorioSubTab === 'frequent') {
    return `
      <div class="space-y-4">
        <h3 class="text-2xl font-black text-slate-900 print:hidden">Relatório de Frequência</h3>
        ${subTabHeader}
        <div class="bg-white p-10 rounded-[2.5rem] border shadow-sm flex flex-col items-center">
          <div class="flex items-end gap-6 h-64 mb-10">
            <div class="w-20 bg-blue-500 rounded-t-2xl" style="height: ${stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0}%"></div>
            <div class="w-20 bg-rose-500 rounded-t-2xl" style="height: ${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%"></div>
            <div class="w-20 bg-amber-400 rounded-t-2xl" style="height: ${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%"></div>
          </div>
          <div class="grid grid-cols-3 gap-10 text-center uppercase font-black text-xs">
            <div class="text-blue-600">Presentes: ${stats.confirmed}</div>
            <div class="text-rose-500">Ausentes: ${stats.absent}</div>
            <div class="text-amber-500">Pendentes: ${stats.pending}</div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Grades Escolares</h3>
          <p class="text-xs text-slate-400 mt-1">Baixe a grade escolar em PDF ou visualize instantaneamente para impressão.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Button 1: Download Direct PDF with html2pdf -->
          <button id="btn-download-pdf" onclick="actions.downloadPDF()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all">
            <i data-lucide="download"></i> Baixar Arquivo PDF
          </button>
        </div>
      </div>

      ${subTabHeader}

      <!-- Modelo Selector Tab -->
      <div class="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit mb-2 print:hidden overflow-x-auto scrollbar-none select-none shrink-0" id="report-model-tabs">
        <button onclick="actions.setReportModel('prof_turma')" class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
          reportModel === 'prof_turma' ? 'bg-white text-[#2E5077] shadow-sm' : 'text-slate-500 hover:text-slate-800'
        }">
          <i data-lucide="user" class="w-3.5 h-3.5 text-slate-500"></i> Professor (por Turma)
        </button>
        <button onclick="actions.setReportModel('prof_subject')" class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
          reportModel === 'prof_subject' ? 'bg-white text-[#2E5077] shadow-sm' : 'text-slate-500 hover:text-slate-800'
        }">
          <i data-lucide="book" class="w-3.5 h-3.5 text-slate-500"></i> Professor (por Matéria)
        </button>
        <button onclick="actions.setReportModel('turma_grid')" class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
          reportModel === 'turma_grid' ? 'bg-white text-[#2E5077] shadow-sm' : 'text-slate-500 hover:text-slate-800'
        }">
          <i data-lucide="users" class="w-3.5 h-3.5 text-slate-500"></i> Todas as Turmas
        </button>
      </div>

      <!-- Control Box -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nome do Colégio</label>
            <input type="text" value="${schoolName}" oninput="actions.setSchoolName(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Selecione a Semana</label>
            <select onchange="actions.setReportWeek(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all" ${reportWeek === 'all' ? 'selected' : ''}>Todas as semanas (Geral Acumulada)</option>
              ${weeks.map(w => `<option value="${w}" ${reportWeek === w ? 'selected' : ''}>${getWeekRangeLabel(w)}</option>`).join('')}
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Turno</label>
            <select onchange="actions.setReportTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="todos" ${reportTurno === 'todos' ? 'selected' : ''}>Todos</option>
              <option value="manha" ${reportTurno === 'manha' ? 'selected' : ''}>Manhã</option>
              <option value="tarde" ${reportTurno === 'tarde' ? 'selected' : ''}>Tarde</option>
              <option value="noite" ${reportTurno === 'noite' ? 'selected' : ''}>Noite</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filtro de Professor</label>
            <select onchange="actions.setReportTeacher(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all" ${reportTeacher === 'all' ? 'selected' : ''}>Todos os professores (${displayTeachers.length})</option>
              ${teachers.map(t => `<option value="${t.uid}" ${reportTeacher === t.uid ? 'selected' : ''}>${t.displayName}</option>`).join('')}
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tamanho dos Cards</label>
            <select onchange="actions.setReportCardSize(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="small" ${reportCardSize === 'small' ? 'selected' : ''}>Pequeno (Compacto)</option>
              <option value="medium" ${reportCardSize === 'medium' ? 'selected' : ''}>Médio (Recomendado)</option>
              <option value="large" ${reportCardSize === 'large' ? 'selected' : ''}>Grande (Mais Legível)</option>
              <option value="esticado" ${reportCardSize === 'esticado' ? 'selected' : ''}>Esticado (Largo - 2 por linha)</option>
              <option value="super_esticado" ${reportCardSize === 'super_esticado' ? 'selected' : ''}>Super Esticado (Página Inteira - 1 por linha)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Live Printable Preview (Mimicking A4 Sheet) -->
      <div class="w-full overflow-x-auto pb-4 scrollbar-none">
        <div class="printable-sheet bg-white border border-slate-200 rounded-[2rem] p-6 md:p-12 shadow-xl relative overflow-hidden min-w-[750px] md:min-w-0">
        <!-- Sheet Header -->
        <div class="flex flex-col md:flex-row justify-between items-center border-b border-blue-100 pb-6 mb-8 gap-4">
          <div class="flex items-center gap-4">
            <!-- Studia Logo matching user image with book and orbital swoosh -->
            <svg width="240" height="65" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <!-- Light Blue Ribbon/Swoosh flourishes around the text -->
              <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
              <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
              
              <!-- Subtle glow on the outer swoosh -->
              <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>

              <!-- Open Book icon centered above "Stu" -->
              <g transform="translate(68, 2)">
                <!-- Left half -->
                <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
                <!-- Right half -->
                <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
                <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
              </g>

              <!-- Main Title: Studia -->
              <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
              <!-- Subtitle: GRADE ESCOLAR DIGITAL -->
              <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
            </svg>
          </div>
          
          <div class="text-center md:text-right">
            <h4 class="text-sm font-black text-slate-800 uppercase tracking-wide">${schoolName}</h4>
            <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
              ${reportModel === 'turma_grid' ? 'Relatório de Turmas (Individual)' : 'Relatório de Professores (Individual)'} - ${reportWeek === 'all' ? 'Grade Geral Acumulada' : getWeekRangeLabel(reportWeek)} - ${reportTurno === 'todos' ? 'Todos os turnos' : TURNO_LABELS[reportTurno]}
            </p>
          </div>
        </div>

        ${reportModel === 'turma_grid' ? `
          <!-- Turmas Cards Grid -->
          ${(() => {
            // Extract unique turmas from filtered schedules
            const allTurmas = [...new Set(filteredSchedules
              .filter(s => s.classGroup && s.classGroup.trim() !== '')
              .map(s => s.classGroup)
            )].sort();

            const turmas = allTurmas;

            if (turmas.length === 0) {
              return `
                <div class="text-center py-20 text-slate-400 font-bold space-y-2 col-span-full">
                  <i data-lucide="info" class="w-12 h-12 mx-auto text-slate-300 col-span-full"></i>
                  <p>Nenhuma turma encontrada nos horários selecionados. Confira a semana ou cadastre aulas para a escola.</p>
                </div>
              `;
            }
            return `
              <div class="${gridColsClass}">
                ${turmas.map(turmaName => {
                  // Filter schedules by turma (all schedules, not filtered by turno)
                  const turmaSchedules = filteredSchedules.filter(s => s.classGroup === turmaName);
                  return TurmaScheduleCard(turmaName, turmaSchedules, slots);
                }).join('')}
              </div>
            `;
          })()}
        ` : `
          <!-- Teachers Cards Grid -->
          ${displayTeachers.length === 0 ? `
            <div class="text-center py-20 text-slate-400 font-bold space-y-2 col-span-full">
              <i data-lucide="info" class="w-12 h-12 mx-auto text-slate-300"></i>
              <p>Nenhum horário cadastrado para exibição na grade individual</p>
            </div>
          ` : `
            <div class="${gridColsClass}">
              ${displayTeachers.map(teacher => {
                const teacherSchedules = filteredSchedules.filter(s => s.teacherId === teacher.uid);
                return TeacherScheduleCard(teacher, teacherSchedules, slots, reportModel);
              }).join('')}
            </div>
          `}
        `}

        <div class="border-t border-slate-100 mt-12 pt-4 flex justify-end text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
          <span>Data de emissão: ${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        </div>
      </div>
    </div>
  `;
};

let currentSlide = 0;
const slidesContent = [
    {
        title: "Studia",
        subtitle: "Organização da rotina escolar",
        content: "Uma plataforma para consultar horários, organizar laboratórios e acompanhar informações da escola.",
        icon: "book-open"
    },
    {
        title: "Organização",
        subtitle: "Informações em um só lugar",
        content: "Horários difíceis de consultar e reservas de espaços sem uma agenda compartilhada.",
        icon: "alert-circle"
    },
    {
        title: "Acesso simples",
        subtitle: "Cada perfil com suas ferramentas",
        content: "Professores consultam seus horários e a direção organiza as informações da escola.",
        icon: "check-circle"
    },
    {
        title: "Funcionalidades",
        subtitle: "O que o Studia faz?",
        content: "• Grades por professor e turma\n• Reservas de laboratórios\n• Relatórios para consulta e impressão",
        icon: "layers"
    },
    {
        title: "Tecnologia",
        subtitle: "Stack Robusta",
        content: "Backend robusto para persistência sólida e Frontend moderno com Tailwind CSS.",
        icon: "cpu"
    }
];

// --- ACTIONS ---
const TAB_ACCESS = {
  dev: ['overview', 'dev_health', 'dev_diagnostics', 'dev_logs', 'dev_audit', 'dev_data', 'escolas', 'materias', 'usuarios'],
  diretor: ['horarios', 'labs', 'materias', 'usuarios', 'relatorios'],
  teacher: ['horarios', 'labs', 'materias'],
};

const actions = {
  toggleMobileMenu(isOpen) {
    mobileMenuOpen = isOpen;
    // Para apenas atualizar o menu mobile sem recarregar dados
    const mobileDrawer = $('#mobile-drawer');
    if (mobileDrawer) {
      mobileDrawer.classList.toggle('hidden', !isOpen);
    }
  },

  setScheduleTurno(turno) {
    const periodOptions = $('#form-period-options');
    if (periodOptions) periodOptions.innerHTML = SchedulePeriodOptions(turno);
  },

  setPeriodAdminTurno(turno) {
    periodAdminTurno = turno;
  },

  setScheduleListTurno(turno) {
    scheduleListTurno = turno;
    this.renderCurrentView();
  },

  setTeacherTurno(turno) {
    teacherTurno = turno;
    this.renderCurrentView();
  },

  setTeacherSubjectSearch(value) {
    teacherSubjectSearch = value;
    const searchInput = $('#teacher-subject-search');
    const cursorPosition = searchInput?.selectionStart ?? value.length;
    this.renderCurrentView();
    const updatedSearchInput = $('#teacher-subject-search');
    updatedSearchInput?.focus();
    updatedSearchInput?.setSelectionRange(cursorPosition, cursorPosition);
  },

  toggleTeacherSubjectCard(cardId) {
    if (expandedTeacherSubjectCards.has(cardId)) expandedTeacherSubjectCards.delete(cardId);
    else expandedTeacherSubjectCards.add(cardId);
    this.renderCurrentView();
  },

  switchTabMobile(tab) {
    if (!TAB_ACCESS[user?.role]?.includes(tab)) return;
    currentTab = tab;
    mobileMenuOpen = false;
    this.init();
  },

  setReportTurno(val) {
    reportTurno = val;
    this.renderCurrentView();
  },

  renderCurrentView() {
    // Re-render apenas a view atual sem recarregar dados (otimização de performance)
    try {
      if (user && !user.accessToken) {
        localStorage.removeItem('user');
        user = null;
      }
      if (!user) {
        render(LandingView());
      } else {
        if (user.role === 'dev') {
          render(DeveloperView());
        } else if (user.role === 'diretor') {
          render(DiretorView());
        } else {
          render(TeacherView());
        }
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } catch (err) {
      console.error('Render error:', err);
    }
  },

  async init() {
    try {
      if (!user) {
        render(LandingView());
      } else {
        if (!TAB_ACCESS[user.role]?.includes(currentTab)) {
          currentTab = TAB_ACCESS[user.role]?.[0] || 'horarios';
        }
        await this.refreshData();
        if (user.role === 'dev') await this.loadDeveloperPanel(currentTab);
        this.renderCurrentView();
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } catch (err) {
      console.error('Init error:', err);
    }
  },

  showLoginModal() {
    authMode = 'login';
    loginSchoolsState = 'loading';
    loginSchoolsError = '';
    this.init();
    this.loadLoginSchools();
  },

  async loadLoginSchools() {
    loginSchoolsState = 'loading';
    loginSchoolsError = '';
    if (authMode === 'login') this.renderCurrentView();

    try {
      const result = await api.get('/api/public/schools');
      if (!Array.isArray(result)) throw new Error('Resposta inválida ao carregar escolas.');
      loginSchools = result.filter(school =>
        school && typeof school.id === 'string' && typeof school.name === 'string'
      );
      loginSchoolsState = loginSchools.length ? 'loaded' : 'empty';
    } catch (err) {
      loginSchools = [];
      loginSchoolsState = 'error';
      loginSchoolsError = err.message || 'Não foi possível carregar as escolas.';
    }

    if (authMode === 'login') this.renderCurrentView();
  },

  hideLoginModal() {
    authMode = 'closed';
    this.init();
  },

  submitContact(event) {
    event.preventDefault();
    const name = document.getElementById('landing-name')?.value;
    const contact = document.getElementById('landing-contact')?.value;
    const message = document.getElementById('landing-message')?.value;

    if (name && contact && message) {
      showDialog(`Obrigado ${name}! Recebemos sua mensagem. Entraremos em contato em breve!`);
      event.target.reset();
    }
  },

  showCreateModal() {
    const modal = $('#create-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.setScheduleCreateMode($('#form-schedule-mode')?.value || 'weekly');
      this.updateScheduleSubjectOptions($('#form-teacher')?.value || '');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  setScheduleCreateMode(mode) {
    const isWeekly = mode === 'weekly';
    $('#form-weekly-fields')?.classList.toggle('hidden', !isWeekly);
    $('#form-single-date-field')?.classList.toggle('hidden', isWeekly);
    const startDate = $('#form-start-date');
    const endDate = $('#form-end-date');
    const singleDate = $('#form-date');
    if (startDate) startDate.required = isWeekly;
    if (endDate) endDate.required = isWeekly;
    if (singleDate) singleDate.required = !isWeekly;
  },

  hideCreateModal() {
    const modal = $('#create-modal');
    if (modal) modal.classList.add('hidden');
  },

  showSchoolPeriodsModal() {
    if (user?.role !== 'diretor') return;
    $('#school-periods-modal')?.classList.remove('hidden');
  },

  hideSchoolPeriodsModal() {
    $('#school-periods-modal')?.classList.add('hidden');
  },

  async saveSchoolPeriod(event) {
    event.preventDefault();
    const turno = $('#period-turno')?.value || periodAdminTurno;
    periodAdminTurno = turno;
    const maximumPeriods = turno === 'noite' ? 5 : 6;
    const usedNumbers = new Set(schoolPeriods
      .filter(period => period.turno === turno)
      .map(period => Number(period.periodNumber)));
    let periodNumber = 1;
    while (usedNumbers.has(periodNumber) && periodNumber <= maximumPeriods) periodNumber += 1;
    if (periodNumber > maximumPeriods) return showDialog(`O turno da ${TURNO_LABELS[turno].toLowerCase()} já possui o limite de ${maximumPeriods} aulas.`);

    try {
      await api.post('/api/school-periods', {
        periodNumber,
        turno,
        name: $('#period-name')?.value?.trim(),
        startTime: $('#period-start')?.value,
        endTime: $('#period-end')?.value
      });
      await this.refreshData();
      this.renderCurrentView();
      this.showSchoolPeriodsModal();
    } catch (err) {
      showDialog(err.message || 'Não foi possível salvar o período.');
    }
  },

  async updateSchoolPeriod(event, periodId) {
    event.preventDefault();
    try {
      await api.patch(`/api/school-periods/${periodId}`, {
        turno: schoolPeriods.find(period => period.id === periodId)?.turno,
        name: $(`#period-name-${periodId}`)?.value?.trim(),
        startTime: $(`#period-start-${periodId}`)?.value,
        endTime: $(`#period-end-${periodId}`)?.value
      });
      await this.refreshData();
      this.renderCurrentView();
      this.showSchoolPeriodsModal();
    } catch (err) {
      showDialog(err.message || 'Não foi possível atualizar o período.');
    }
  },

  async deleteSchoolPeriod(periodId) {
    const period = schoolPeriods.find(item => item.id === periodId);
    const confirmed = await showDialog(
      `Excluir o período "${period?.name || ''}"? Os horários já cadastrados não serão alterados.`,
      { confirm: true, title: 'Excluir período' }
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/school-periods/${periodId}`);
      await this.refreshData();
      this.renderCurrentView();
      this.showSchoolPeriodsModal();
    } catch (err) {
      showDialog(err.message || 'Não foi possível excluir o período.');
    }
  },

  showEditModalById(id) {
    const s = schedules.find(sched => String(sched.id) === String(id));
    if (!s) {
      showDialog('Não foi possível localizar este horário. Atualize a página e tente novamente.');
      return;
    }
    
    const modal = $('#edit-modal');
    if (!modal) {
      showDialog('O formulário de edição não está disponível nesta tela.');
      return;
    }

    const formFields = {
      id: $('#edit-form-id'),
      subject: $('#edit-form-subject'),
      classGroup: $('#edit-form-class-group'),
      date: $('#edit-form-date'),
      room: $('#edit-form-room'),
      turno: $('#edit-form-turno'),
      start: $('#edit-form-start'),
      end: $('#edit-form-end'),
      teacher: $('#edit-form-teacher'),
      status: $('#edit-form-status')
    };
    if (Object.values(formFields).some(field => !field)) {
      showDialog('O formulário de edição está incompleto. Atualize a página e tente novamente.');
      return;
    }

    formFields.id.value = s.id || '';
    formFields.subject.value = s.subject || '';
    formFields.classGroup.value = s.classGroup || '';
    formFields.date.value = s.date || '';
    formFields.room.value = s.room || '';
    formFields.turno.value = getScheduleTurno(s);
    formFields.start.value = s.startTime ? String(s.startTime).slice(0, 5) : '';
    formFields.end.value = s.endTime ? String(s.endTime).slice(0, 5) : '';
    formFields.teacher.value = s.teacherId || '';
    formFields.status.value = s.status || 'pending';
    this.updateScheduleSubjectOptions(s.teacherId || '', s.subject || '', 'edit-form');
    modal.classList.remove('hidden');
    formFields.subject.focus();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  hideEditModal() {
    const modal = $('#edit-modal');
    if (modal) modal.classList.add('hidden');
  },

  showDeleteModal(id) {
    const modal = $('#delete-modal');
    if (modal) {
      $('#delete-schedule-id').value = id;
      modal.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  hideDeleteModal() {
    const modal = $('#delete-modal');
    if (modal) modal.classList.add('hidden');
  },

  updateScheduleSubjectOptions(teacherId, selectedSubject = '', prefix = 'form') {
    const subjectInput = $(`#${prefix}-subject`);
    const subjectOptions = $(`#${prefix}-subject-options`);
    if (!subjectInput || !subjectOptions) return;

    const options = getAssignedSubjectsForTeacher(teacherId);
    subjectOptions.innerHTML = options.map(subject => `<option value="${subject}"></option>`).join('');
    subjectInput.value = selectedSubject || '';
  },

  async confirmDeleteSchedule() {
    const id = $('#delete-schedule-id').value;
    try {
      await api.delete(`/api/schedules/${id}`);
      this.hideDeleteModal();
      this.init();
    } catch (err) {
      showDialog('Erro ao excluir.');
    }
  },


  showLabModal() {
    document.body.insertAdjacentHTML('beforeend', LabModal());
    const modal = $('#lab-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const dateInput = $('#lab-date');
      if (dateInput) {
        dateInput.min = todayString;
        dateInput.value = todayString;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  hideLabModal() {
    const modal = $('#lab-modal');
    if (modal) modal.remove();
  },

  switchTab(tab) {
    if (!TAB_ACCESS[user?.role]?.includes(tab)) return;
    currentTab = tab;
    this.init();
  },

  async loadDeveloperPanel(tab = currentTab) {
    try {
      if (['overview', 'dev_health', 'dev_diagnostics', 'dev_data'].includes(tab)) {
        devDiagnostics = await api.get('/api/dev/diagnostics');
        delete devPanelErrors.diagnostics;
      } else if (tab === 'dev_logs') {
        devErrorLogs = await api.get('/api/dev/logs');
        delete devPanelErrors.logs;
      } else if (tab === 'dev_audit') {
        devAuditLogs = await api.get('/api/dev/audit');
        delete devPanelErrors.audit;
      }
    } catch (err) {
      const errorKey = ['overview', 'dev_health', 'dev_diagnostics', 'dev_data'].includes(tab) ? 'diagnostics' : tab === 'dev_logs' ? 'logs' : 'audit';
      devPanelErrors[errorKey] = err.message || 'Não foi possível carregar os dados desta aba.';
    }
  },

  async refreshDeveloperPanel() {
    if (user?.role !== 'dev') return;
    await this.loadDeveloperPanel(currentTab);
    this.renderCurrentView();
  },

  async exportDeveloperData() {
    if (user?.role !== 'dev') return;
    const resource = document.getElementById('dev-export-resource')?.value;
    if (!resource) return showDialog('Selecione uma tabela para exportar.');

    const confirmed = await showDialog(
      'O CSV pode conter informações pessoais. Guarde o arquivo em local seguro e compartilhe apenas com pessoas autorizadas. Deseja continuar?',
      { confirm: true, title: 'Confirmar exportação' }
    );
    if (!confirmed) return;

    try {
      const result = await api.get(`/api/dev/export/${encodeURIComponent(resource)}`);
      const columnsByResource = {
        users: ['uid', 'email', 'displayName', 'role', 'school_id', 'subject'],
        schools: ['id', 'name', 'createdAt'],
        schedules: ['id', 'date', 'startTime', 'endTime', 'subject', 'room', 'teacherId', 'teacherName', 'classGroup', 'turno', 'status', 'school_id'],
        school_periods: ['id', 'school_id', 'turno', 'periodNumber', 'name', 'startTime', 'endTime'],
        lab_bookings: ['id', 'labId', 'teacherId', 'teacherName', 'date', 'startTime', 'endTime'],
        school_subjects: ['id', 'school_id', 'subject'],
        teacher_subjects: ['id', 'teacher_id', 'subject_id']
      };
      const columns = columnsByResource[resource];
      const csvCell = value => {
        const text = value === null || value === undefined
          ? ''
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
        const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
        return `"${safeText.replace(/"/g, '""')}"`;
      };
      const csv = [
        columns.map(csvCell).join(','),
        ...result.rows.map(row => columns.map(column => csvCell(row[column])).join(','))
      ].join('\r\n');
      const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studia-${resource}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showDialog(`Exportação concluída: ${result.count} registros.`);
    } catch (err) {
      showDialog(err.message || 'Não foi possível exportar os dados.');
    }
  },

  async login() {
    const schoolInput = $('#auth-school');
    const emailInput = $('#auth-email');
    const passwordInput = $('#auth-password');
    if (!schoolInput || !emailInput || !passwordInput) return;

    const schoolId = schoolInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!schoolId) return showDialog('Selecione sua escola para continuar.');
    if (loginSchoolsState !== 'loaded') return showDialog('A lista de escolas ainda não está disponível. Tente novamente.');
    if (!email || !password) return showDialog('Por favor, preencha todos os campos.');
    
    try {
      user = await api.post('/api/auth/login', { email, password, schoolId });
      localStorage.setItem('user', JSON.stringify(user));
      authMode = 'closed';
      this.init();
    } catch (err) {
      showDialog(err.message);
    }
  },

  logout() {
    localStorage.removeItem('user');
    user = null;
    currentTab = 'horarios';
    authMode = 'closed';
    this.init();
  },

  normalizeSchedules(schedules) {
    // Convert snake_case from API to camelCase for frontend
    return schedules.map(s => {
      const classGroup = s.classgroup || s.classGroup || 'SEM_TURMA';
      if (!classGroup || classGroup.trim() === '') {
        console.warn('[WARN] Schedule sem classGroup:', s);
      }
      return {
        id: s.id,
        date: s.date,
        startTime: s.starttime || s.startTime,
        endTime: s.endtime || s.endTime,
        subject: s.subject,
        room: s.room,
        turno: s.turno,
        teacherId: s.teacherid || s.teacherId,
        teacherName: s.teachername || s.teacherName,
        classGroup: classGroup,
        status: s.status,
        school_id: s.school_id,
        createdAt: s.createdat || s.createdAt
      };
    });
  },

  async refreshData() {
    if (!user || isRefreshingData) return;
    isRefreshingData = true;
    try {
      if (user.role === 'dev') {
        schoolPeriods = [];
        schoolPeriodsError = '';
        const results = await Promise.allSettled([
          api.get(user.school_id ? `/api/schedules?schoolId=${user.school_id}` : '/api/schedules'),
          api.get('/api/teachers'),
          api.get('/api/users'),
          api.get('/api/labs/bookings'),
          api.get('/api/schools'),
          api.get('/api/school-subjects')
        ]);
        const [s, t, u, lb, sc, subs] = results.map((r, i) => r.status === 'fulfilled' ? r.value : (console.error(`Data fetch #${i} failed:`, r.reason), []));
        schedules = this.normalizeSchedules(s || []);
        teachers = t || [];
        allUsers = u || [];
        schools = sc || [];
        schoolSubjects = subs || [];
        if (!schools.some(school => school.id === subjectSchoolId)) {
          subjectSchoolId = user.school_id || schools[0]?.id || '';
        }
        stats = {
          total: schedules.length,
          confirmed: schedules.filter(item => item.status === 'confirmed').length,
          absent: schedules.filter(item => item.status === 'absent').length,
          pending: schedules.filter(item => item.status === 'pending').length,
        };
        labBookings = lb || [];
      } else if (user.role === 'diretor') {
        const results = await Promise.allSettled([
          api.get(`/api/schedules?schoolId=${user.school_id}`),
          api.get('/api/teachers'),
          api.get(`/api/users?schoolId=${user.school_id}`),
          api.get('/api/labs/bookings'),
          api.get('/api/school-subjects'),
          api.get('/api/school-periods')
        ]);
        const [s, t, u, lb, subs] = results.slice(0, 5).map((r, i) => r.status === 'fulfilled' ? r.value : (console.error(`Data fetch #${i} failed:`, r.reason), []));
        const periodResult = results[5];
        schoolPeriods = periodResult.status === 'fulfilled' ? periodResult.value : [];
        if (periodResult.status === 'rejected') {
          console.error('School periods fetch failed:', periodResult.reason);
          schoolPeriodsError = periodResult.reason?.message || 'Não foi possível carregar os períodos.';
        } else {
          schoolPeriodsError = '';
        }
        schedules = this.normalizeSchedules(s || []);
        teachers = t || [];
        allUsers = u || [];
        schoolSubjects = subs || [];
        stats = {
          total: schedules.length,
          confirmed: schedules.filter(item => item.status === 'confirmed').length,
          absent: schedules.filter(item => item.status === 'absent').length,
          pending: schedules.filter(item => item.status === 'pending').length,
        };
        labBookings = lb || [];
      } else {
        schoolPeriods = [];
        schoolPeriodsError = '';
        const results = await Promise.allSettled([
          api.get(`/api/schedules?teacherId=${user.uid}`),
          api.get('/api/labs/bookings'),
          api.get(`/api/teachers/${user.uid}/subjects`),
          api.get('/api/school-subjects')
        ]);
        const [s, lb, m, subs] = results.map((r, i) => r.status === 'fulfilled' ? r.value : (console.error(`Data fetch #${i} failed:`, r.reason), []));
        schedules = this.normalizeSchedules(s || []);
        allUsers = [];
        schoolSubjects = subs || [];
        labBookings = lb || [];
        window.teacherSubjects = m || [];
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      isRefreshingData = false;
    }
  },

  async refreshSchedules() {
    await this.refreshData();
    this.init();
  },

  toggleUserSelection(uid, checked) {
    if (!uid || uid === user?.uid || !allUsers.some(account => account.uid === uid)) return;
    if (checked) selectedUserIds.add(uid);
    else selectedUserIds.delete(uid);
    this.renderCurrentView();
  },

  toggleAllUsers(checked) {
    const selectableUsers = allUsers.filter(account => account.uid !== user?.uid);
    if (checked) selectableUsers.forEach(account => selectedUserIds.add(account.uid));
    else selectableUsers.forEach(account => selectedUserIds.delete(account.uid));
    this.renderCurrentView();
  },

  toggleTeacherSubjectsEditor(teacherId) {
    editingTeacherSubjectsId = editingTeacherSubjectsId === teacherId ? null : teacherId;
    this.renderCurrentView();
  },

  async assignTeacherSchool(teacherId) {
    const schoolId = document.getElementById(`teacher-school-${teacherId}`)?.value;
    if (!schoolId) return showDialog('Selecione uma escola para continuar.');

    try {
      await api.patch(`/api/users/${teacherId}/school`, { schoolId });
      await this.refreshData();
      this.renderCurrentView();
    } catch (err) {
      showDialog(err.message || 'Não foi possível associar o professor à escola.');
    }
  },

  closeTeacherSubjectsEditor() {
    editingTeacherSubjectsId = null;
    this.renderCurrentView();
  },

  async deleteUser(uid, name, email) {
    if (!uid) return;
    const confirmed = await showDialog(`Deseja excluir ${name} (${email}) do sistema? Essa ação remove o acesso do usuário e sua conta de autenticação.`, { confirm: true, title: 'Excluir usuário' });
    if (!confirmed) return;

    try {
      await api.delete(`/api/users/${uid}`);
      selectedUserIds.delete(uid);
      await this.refreshData();
      this.init();
      showDialog('Usuário excluído com sucesso.');
    } catch (err) {
      showDialog(err.message || 'Erro ao excluir usuário.');
    }
  },

  async deleteSelectedUsers() {
    const selectedUsers = allUsers.filter(account => selectedUserIds.has(account.uid) && account.uid !== user?.uid);
    if (selectedUsers.length === 0) return;

    const emails = selectedUsers.map(account => account.email || account.displayName || account.uid).join('\n');
    const confirmed = await showDialog(
      `Confirma excluir ${selectedUsers.length} conta${selectedUsers.length === 1 ? '' : 's'}? Esta ação não pode ser desfeita.\n\n${emails}`,
      { confirm: true, title: 'Excluir contas selecionadas' }
    );
    if (!confirmed) return;

    const failed = [];
    for (const account of selectedUsers) {
      try {
        await api.delete(`/api/users/${account.uid}`);
        selectedUserIds.delete(account.uid);
      } catch (err) {
        failed.push(`${account.email || account.displayName || account.uid}: ${err.message || 'falha ao excluir'}`);
      }
    }

    await this.refreshData();
    this.renderCurrentView();
    if (failed.length > 0) {
      showDialog(`Não foi possível excluir todas as contas. As contas com erro continuam selecionadas para você tentar novamente:\n\n${failed.join('\n')}`, { title: 'Exclusão parcial' });
    } else {
      showDialog(`${selectedUsers.length} conta${selectedUsers.length === 1 ? '' : 's'} excluída${selectedUsers.length === 1 ? '' : 's'} com sucesso.`);
    }
  },

  selectSubjectSchool(schoolId) {
    subjectSchoolId = schoolId;
    this.renderCurrentView();
  },

  async createSchoolSubject(event) {
    event.preventDefault();
    const subjectInput = $('#school-subject-name');
    const schoolId = user?.role === 'diretor' ? user.school_id : (subjectSchoolId || user?.school_id);
    const subject = subjectInput?.value?.trim();
    if (!schoolId || !subject) return showDialog('Selecione uma escola e informe a matéria.');

    try {
      await api.post('/api/school-subjects', { schoolId, subject });
      await this.refreshData();
      this.renderCurrentView();
    } catch (err) {
      showDialog(err.message || 'Erro ao adicionar matéria.');
    }
  },

  async deleteSchoolSubject(subjectId) {
    const subject = schoolSubjects.find(item => String(item.id) === String(subjectId));
    if (!subject) {
      showDialog('Não foi possível localizar essa matéria. Atualize a página e tente novamente.');
      return;
    }

    const confirmed = await showDialog(
      `Excluir "${subject.subject}" do catálogo? Os horários antigos serão mantidos, mas os vínculos com professores serão removidos.`,
      { confirm: true, title: 'Excluir matéria' }
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/school-subjects/${subjectId}`);
      await this.refreshData();
      this.renderCurrentView();
    } catch (err) {
      showDialog(err.message || 'Erro ao excluir matéria.');
    }
  },

  async setTeacherSubject(subjectId, teacherId, isAssigned) {
    try {
      if (isAssigned) {
        await api.post(`/api/school-subjects/${subjectId}/teachers`, { teacherId });
      } else {
        await api.delete(`/api/school-subjects/${subjectId}/teachers/${teacherId}`);
      }
      await this.refreshData();
      this.renderCurrentView();
    } catch (err) {
      await this.refreshData();
      this.renderCurrentView();
      showDialog(err.message || 'Erro ao atualizar vínculo da matéria.');
    }
  },

  async changeUserRole(uid, role) {
    if (!uid || uid === user?.uid) return;
    try {
      await api.patch(`/api/users/${uid}/role`, { role });
      allUsers = allUsers.map(u => u.uid === uid ? { ...u, role } : u);
      this.init();
    } catch (err) {
      showDialog(err.message || 'Erro ao atualizar perfil do usuário.');
      this.init();
    }
  },

  async updateStatus(id, status) {
    try {
      await api.patch(`/api/schedules/${id}`, { status });
      this.init();
    } catch (err) {
      showDialog('Erro ao atualizar status.');
    }
  },

  async createSchedule(e) {
    e.preventDefault();
    const teacherSelect = $('#form-teacher');
    const mode = $('#form-schedule-mode')?.value || 'weekly';
    const turno = $('#form-turno')?.value || 'manha';
    const periodNumbers = Array.from(document.querySelectorAll('input[name="form-period"]:checked'))
      .map(input => Number(input.value));
    if (periodNumbers.length === 0) return showDialog('Selecione pelo menos um período.');

    let startDate;
    let endDate;
    let weekdayNumbers;
    if (mode === 'single') {
      startDate = $('#form-date')?.value;
      endDate = startDate;
      if (!startDate) return showDialog('Informe a data da aula.');
      const weekday = parseLocalDate(startDate).getDay();
      if (weekday < 1 || weekday > 5) return showDialog('A data selecionada precisa ser de segunda a sexta-feira.');
      weekdayNumbers = [weekday];
    } else {
      startDate = $('#form-start-date')?.value;
      endDate = $('#form-end-date')?.value;
      weekdayNumbers = Array.from(document.querySelectorAll('input[name="form-weekday"]:checked'))
        .map(input => Number(input.value));
      if (!startDate || !endDate || startDate > endDate) return showDialog('Informe um intervalo de datas válido.');
      if (weekdayNumbers.length === 0) return showDialog('Selecione pelo menos um dia da semana.');
    }

    const data = {
      subject: $('#form-subject').value.trim(),
      classGroup: $('#form-class-group').value.trim(),
      room: $('#form-room').value.trim(),
      teacherId: teacherSelect.value,
      turno,
      startDate,
      endDate,
      weekdayNumbers,
      periodNumbers
    };

    try {
      const result = await api.post('/api/schedules/recurring', data);
      this.hideCreateModal();
      await this.init();
      showDialog(`${result.created} horário${result.created === 1 ? '' : 's'} criado${result.created === 1 ? '' : 's'} com sucesso.`);
    } catch (err) {
      showDialog(err.message || 'Erro ao criar horário.');
    }
  },

  async updateSchedule(e) {
    e.preventDefault();
    const id = $('#edit-form-id').value;
    const teacherSelect = $('#edit-form-teacher');
    const data = {
      subject: $('#edit-form-subject').value,
      classGroup: $('#edit-form-class-group').value,
      date: $('#edit-form-date').value,
      room: $('#edit-form-room').value,
      turno: $('#edit-form-turno').value,
      startTime: $('#edit-form-start').value,
      endTime: $('#edit-form-end').value,
      teacherId: teacherSelect.value,
      teacherName: teacherSelect.options[teacherSelect.selectedIndex].text,
      status: $('#edit-form-status').value
    };
    
    try {
      await api.patch(`/api/schedules/${id}`, data);
      this.hideEditModal();
      await this.init();
      showDialog('Horário atualizado com sucesso.');
    } catch (err) {
      showDialog(err.message || 'Erro ao editar horário.');
    }
  },

  async deleteAllSchedules() {
    const visibleSchedules = filterSchedulesByTurno(schedules, scheduleListTurno);
    if (visibleSchedules.length === 0) return;

    const scope = scheduleListTurno === 'todos'
      ? 'todos os horários da escola, de todos os turnos'
      : `todos os horários da escola no turno da ${TURNO_LABELS[scheduleListTurno]}`;
    const confirmed = await showDialog(
      `Esta ação excluirá ${visibleSchedules.length} horário${visibleSchedules.length === 1 ? '' : 's'} (${scope}) e não poderá ser desfeita. Deseja continuar?`,
      { confirm: true, title: 'Remover horários' }
    );
    if (!confirmed) return;

    const query = scheduleListTurno === 'todos' ? '' : `?turno=${encodeURIComponent(scheduleListTurno)}`;
    try {
      const result = await api.delete(`/api/schedules${query}`);
      await this.init();
      showDialog(`${result.deleted} horário${result.deleted === 1 ? '' : 's'} removido${result.deleted === 1 ? '' : 's'}.`);
    } catch (err) {
      showDialog(err.message || 'Não foi possível remover os horários.');
    }
  },

  async deleteSchedule(id) {
    if (await showDialog('Deseja excluir este horário?', { confirm: true, title: 'Excluir horário' })) {
      try {
        await api.delete(`/api/schedules/${id}`);
        this.init();
      } catch (err) {
        showDialog(err.message || 'Erro ao excluir.');
      }
    }
  },

  async createLabBooking(e) {
    e.preventDefault();
    const data = {
      labId: $('#lab-type').value,
      date: $('#lab-date').value,
      startTime: $('#lab-start').value,
      endTime: $('#lab-end').value
    };
    if (data.startTime >= data.endTime) {
      showDialog('O horário de término precisa ser depois do horário de início.');
      return;
    }
    const hasConflict = labBookings.some(booking =>
      booking.labId === data.labId &&
      booking.date === data.date &&
      data.startTime < booking.endTime.slice(0, 5) &&
      data.endTime > booking.startTime.slice(0, 5)
    );
    if (hasConflict) {
      showDialog('Este laboratório já está reservado em parte ou em todo esse horário.');
      return;
    }
    try {
      await api.post('/api/labs/bookings', data);
      this.hideLabModal();
      this.init();
    } catch (err) {
      showDialog(err.message || 'Não foi possível criar a reserva.');
    }
  },

  setLabFilter(filter, value) {
    labFilters = { ...labFilters, [filter]: value };
    this.renderCurrentView();
  },

  async deleteLabBooking(id) {
    if (await showDialog('Deseja realmente cancelar esta reserva de laboratório?', { confirm: true, title: 'Cancelar reserva' })) {
      try {
        await api.delete(`/api/labs/bookings/${id}`);
        labBookings = labBookings.filter(booking => String(booking.id) !== String(id));
        await this.refreshData();
        this.init();
      } catch (err) {
        showDialog(err.message || 'Não foi possível cancelar a reserva.');
      }
    }
  },

  nextSlide() {
    if (currentSlide < slidesContent.length - 1) {
        currentSlide++;
        this.init();
    }
  },

  prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        this.init();
    }
  },

  setReportWeek(val) {
    reportWeek = val;
    this.renderCurrentView();
  },

  setReportTeacher(val) {
    reportTeacher = val;
    this.renderCurrentView();
  },

  setReportCardSize(val) {
    reportCardSize = val;
    localStorage.setItem('reportCardSize', val);
    this.renderCurrentView();
  },

  setSchoolName(val) {
    schoolName = val;
    // Don't call init on every keystroke to avoid losing focus of input
    const headerTitle = $('.printable-sheet h4');
    if (headerTitle) {
      headerTitle.textContent = val;
    }
  },

  setRelatorioSubTab(val) {
    currentRelatorioSubTab = val;
    this.renderCurrentView();
  },

  setReportModel(val) {
    reportModel = val;
    this.renderCurrentView();
  },

  setTeacherSchedulesTab(val) {
    if (val !== 'grid') return;
    teacherSchedulesTab = 'grid';
    this.renderCurrentView();
  },

  async downloadTeacherPDF() {
    const originalElement = document.querySelector('.printable-sheet');
    if (!originalElement) return;
    
    const btn = document.querySelector('#btn-download-pdf-teacher');
    const originalContent = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Gerando PDF...`;
      btn.disabled = true;
    }
    
    const pdfContainer = originalElement.cloneNode(true);
    pdfContainer.id = 'temp-pdf-teacher-container';
    pdfContainer.className = 'printable-sheet bg-white';
    pdfContainer.style.width = '1020px'; // fixed landscape width
    pdfContainer.style.boxSizing = 'border-box';
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.padding = '30px';
    document.body.appendChild(pdfContainer);
    
    // Ensure icons inside clone are compiled/cloned cleanly
    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ node: pdfContainer });
    }

    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     `Grade_Professor_${user ? user.displayName.replace(/\s+/g, '_') : 'Individual'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    const restoreOklch = prepareOklchForPrint(pdfContainer);
    let restoreStylesheets = () => {};
    try {
      restoreStylesheets = await cleanOklchFromStylesheets();
    } catch (e) {
      console.warn('Could not clean stylesheets:', e);
    }
    
    html2pdf().set(opt).from(pdfContainer).save().then(() => {
      restoreOklch();
      restoreStylesheets();
      document.body.removeChild(pdfContainer);
      if (btn) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }).catch(err => {
      restoreOklch();
      restoreStylesheets();
      if (document.getElementById('temp-pdf-teacher-container')) {
        document.body.removeChild(pdfContainer);
      }
      console.error('Error generating PDF:', err);
      if (btn) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      showDialog('Houve um erro ao gerar o PDF.');
    });
  },

  async downloadPDF() {
    const listContainer = document.querySelector('.printable-sheet');
    if (!listContainer) return;
    
    const btn = document.querySelector('#btn-download-pdf');
    const originalContent = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Gerando PDF...`;
      btn.disabled = true;
    }

    // Prepare active context
    let filteredSchedules = schedules;
    if (reportWeek !== 'all') {
      filteredSchedules = schedules.filter(s => {
        try {
          return getMondayDateStr(s.date) === reportWeek;
        } catch (e) {
          return false;
        }
      });
    }
    filteredSchedules = filterSchedulesByTurno(filteredSchedules, reportTurno);

    let currentDisplayTeachers = teachers;
    if (reportTeacher !== 'all') {
      currentDisplayTeachers = teachers.filter(t => t.uid === reportTeacher);
    }
    // Fallback if empty but schedules exist
    if (currentDisplayTeachers.length === 0 && filteredSchedules.length > 0) {
      const seen = new Set();
      const extracted = [];
      filteredSchedules.forEach(s => {
        if (s.teacherId && !seen.has(s.teacherId)) {
          seen.add(s.teacherId);
          extracted.push({ uid: s.teacherId, displayName: s.teacherName, subject: s.subject });
        }
      });
      currentDisplayTeachers = extracted;
    }

    const slots = getDetectedSlots(filteredSchedules);

    let items = [];
    const isTurma = reportModel === 'turma_grid';
    if (isTurma) {
      items = getDetectedTurmas(filteredSchedules);
    } else {
      items = currentDisplayTeachers;
    }

    // Determine how many items per page
    const itemsPerPageMap = {
      small: 8,
      medium: 4,
      large: 3,
      esticado: 2,
      super_esticado: 1
    };
    const itemsPerPage = itemsPerPageMap[reportCardSize] || 4;

    const chunks = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      chunks.push(items.slice(i, i + itemsPerPage));
    }

    // Build the dynamic PDF layout container
    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'temp-pdf-container';
    pdfContainer.className = 'printable-sheet bg-white';
    pdfContainer.style.width = '1020px'; // optimal A4 landscape desktop width
    pdfContainer.style.padding = '10px';
    pdfContainer.style.boxSizing = 'border-box';
    pdfContainer.style.backgroundColor = '#ffffff';

    let gridColsClass = "grid grid-cols-2 gap-4 justify-center w-full";
    if (reportCardSize === 'small') {
      gridColsClass = "grid grid-cols-4 gap-2 justify-center w-full";
    } else if (reportCardSize === 'medium') {
      gridColsClass = "grid grid-cols-2 gap-4 justify-center w-full";
    } else if (reportCardSize === 'large') {
      gridColsClass = "grid grid-cols-3 gap-4 justify-center w-full";
    } else if (reportCardSize === 'esticado') {
      gridColsClass = "grid grid-cols-2 gap-4 justify-center w-full";
    } else if (reportCardSize === 'super_esticado') {
      gridColsClass = "grid grid-cols-1 gap-6 justify-center w-full";
    }

    let pagesHtml = '';
    chunks.forEach((chunk, chunkIndex) => {
      const pageHeader = `
        <div class="flex justify-between items-center border-b border-blue-100 pb-4 mb-6 gap-4">
          <div class="flex items-center gap-4">
            <svg width="240" height="65" viewBox="0 0 240 65" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <path d="M10 24C45 6, 85 45, 128 35C155 28, 175 14, 235 22" stroke="#7ec2f2" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.8"/>
              <path d="M124 35C136 43, 155 35, 150 24C145 15, 132 18, 126 27" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
              <path d="M175 14C195 6, 215 16, 235 22" stroke="#7ec2f2" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>
              <g transform="translate(68, 2)">
                <path d="M15 14C15 6, 25 3, 30 7.5L30 23C25 18, 15 19, 15 22Z" fill="#5B99C2" />
                <path d="M45 14C45 6, 35 3, 30 7.5L30 23C35 18, 45 19, 45 22Z" fill="#2E5077" />
                <path d="M18 16C18 13, 24 10, 27 12L27 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
                <path d="M42 16C42 13, 36 10, 33 12L33 21" stroke="white" stroke-width="0.8" opacity="0.4" fill="none"/>
              </g>
              <text x="18" y="47" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#2E5077" letter-spacing="-1.5">Studia</text>
              <text x="21" y="58" font-family="'Inter', sans-serif" font-weight="700" font-size="8.5" fill="#5B99C2" letter-spacing="1.2">GRADE ESCOLAR DIGITAL</text>
            </svg>
          </div>
          <div class="text-right">
            <h4 class="text-xs font-black text-slate-800 uppercase tracking-wide">${schoolName}</h4>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
              ${isTurma ? 'Relatório de Turmas (Individual)' : 'Relatório de Professores (Individual)'} - ${reportWeek === 'all' ? 'Grade Geral Acumulada' : getWeekRangeLabel(reportWeek)} - ${reportTurno === 'todos' ? 'Todos os turnos' : TURNO_LABELS[reportTurno]}
            </p>
          </div>
        </div>
      `;

      const cardsHtml = chunk.map(item => {
        if (isTurma) {
          const turmaSchedules = filteredSchedules.filter(s => s.classGroup === item);
          return TurmaScheduleCard(item, turmaSchedules, slots);
        } else {
          const teacherSchedules = filteredSchedules.filter(s => s.teacherId === item.uid);
          return TeacherScheduleCard(item, teacherSchedules, slots, reportModel);
        }
      }).join('');

      const pageFooter = `
        <div class="border-t border-slate-100 mt-6 pt-3 flex justify-between text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
          <span>Página ${chunkIndex + 1} de ${chunks.length}</span>
          <span>Data de emissão: ${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      `;

      const breakStyle = chunkIndex === chunks.length - 1 ? '' : 'page-break-after: always;';

      pagesHtml += `
        <div class="pdf-page bg-white" style="${breakStyle} width: 100%; box-sizing: border-box; padding-bottom: 20px;">
          ${pageHeader}
          <div class="${gridColsClass}">
            ${cardsHtml}
          </div>
          ${pageFooter}
        </div>
      `;
    });

    pdfContainer.innerHTML = pagesHtml;
    document.body.appendChild(pdfContainer);

    // Render lucide icons in the temporary container to replace tags with SVGs
    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ node: pdfContainer });
    }

    const opt = {
      margin:       [0.2, 0.2, 0.2, 0.2],
      filename:     `Grade_Escolar_${reportWeek}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const restoreOklch = prepareOklchForPrint(pdfContainer);
    let restoreStylesheets = () => {};
    try {
      restoreStylesheets = await cleanOklchFromStylesheets();
    } catch (e) {
      console.warn('Could not clean stylesheets:', e);
    }

    html2pdf().set(opt).from(pdfContainer).save().then(() => {
      restoreOklch();
      restoreStylesheets();
      document.body.removeChild(pdfContainer);
      if (btn) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }).catch(err => {
      restoreOklch();
      restoreStylesheets();
      if (document.getElementById('temp-pdf-container')) {
        document.body.removeChild(pdfContainer);
      }
      console.error('Error generating PDF:', err);
      if (btn) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      showDialog('Houve um erro ao gerar o PDF.');
    });
  },

  showCreateEscolaModal() {
    const modal = document.getElementById('create-escola-modal');
    if (modal) modal.classList.remove('hidden');
  },

  hideCreateEscolaModal() {
    const modal = document.getElementById('create-escola-modal');
    if (modal) modal.classList.add('hidden');
    document.getElementById('escola-name')?.value && (document.getElementById('escola-name').value = '');
  },

  async createSchool(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('escola-name')?.value;
    if (!name) return showDialog('Nome da escola é obrigatório.');
    try {
      await api.post('/api/schools', { name, createdBy: user.uid });
      this.hideCreateEscolaModal();
      await this.refreshData();
      this.init();
      showDialog('Escola criada com sucesso!');
    } catch (err) {
      showDialog(err.message || 'Erro ao criar escola.');
    }
  },

  async deleteSchool(id) {
    if (!id) return;
    const escola = schools.find(s => s.id === id);
    const confirmed = await showDialog(`Deseja excluir a escola "${escola?.name}"? Esta ação não pode ser desfeita.`, { confirm: true, title: 'Excluir escola' });
    if (!confirmed) return;
    try {
      await api.delete(`/api/schools/${id}`);
      await this.refreshData();
      this.init();
      showDialog('Escola excluída com sucesso.');
    } catch (err) {
      showDialog(err.message || 'Erro ao excluir escola.');
    }
  },

  showCreateUserModal(viewerRole = 'dev') {
    const modal = document.getElementById('create-user-modal');
    if (modal) modal.classList.remove('hidden');
  },

  hideCreateUserModal() {
    const modal = document.getElementById('create-user-modal');
    if (modal) modal.classList.add('hidden');
    // Clear form fields
    document.getElementById('user-displayname')?.value && (document.getElementById('user-displayname').value = '');
    document.getElementById('user-email')?.value && (document.getElementById('user-email').value = '');
    document.getElementById('user-password')?.value && (document.getElementById('user-password').value = '');
    document.getElementById('user-subject')?.value && (document.getElementById('user-subject').value = '');
    document.getElementById('user-school')?.value && (document.getElementById('user-school').value = '');
    document.getElementById('user-role')?.value && (document.getElementById('user-role').value = '');
  },

  async createUser(event) {
    if (event) event.preventDefault();

    const displayName = document.getElementById('user-displayname')?.value?.trim();
    const email = document.getElementById('user-email')?.value?.trim();
    const password = document.getElementById('user-password')?.value;
    const subject = document.getElementById('user-subject')?.value?.trim();
    const role = document.getElementById('user-role')?.value;
    const schoolId = document.getElementById('user-school')?.value;

    // Validações básicas
    if (!displayName) return showDialog('Nome é obrigatório.');
    if (!email) return showDialog('E-mail é obrigatório.');
    if (!password) return showDialog('Senha é obrigatória.');
    if (password.length < 8) return showDialog('Senha deve ter no mínimo 8 caracteres.');
    if (!role) return showDialog('Cargo é obrigatório.');
    if (user?.role === 'dev' && !schoolId) return showDialog('Selecione a escola do usuário.');

    // Validação de e-mail simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showDialog('E-mail inválido. Use um endereço válido.');

    try {
      const payload = {
        displayName,
        email,
        password,
        role,
        schoolId,
        userRole: user?.role,
        userSchoolId: user?.school_id
      };
      if (subject) payload.subject = subject;

      await api.post('/api/users/create', payload);
      this.hideCreateUserModal();
      await this.refreshData();
      this.init();
      showDialog('Usuário criado com sucesso!');
    } catch (err) {
      const errorMsg = err.message || 'Erro ao criar usuário.';
      showDialog(errorMsg);
    }
  }
};

// --- OKLCH to RGB color polyfill for html2pdf/html2canvas compatibility with Tailwind 4 ---
function oklchToRgbFallback(oklchStr) {
  try {
    const inner = oklchStr.match(/oklch\(([^)]+)\)/i);
    if (!inner) return 'rgb(0, 0, 0)';
    
    const parts = inner[1].trim().split(/[\s,+/]+/);
    if (parts.length < 3) return 'rgb(0, 0, 0)';
    
    let L = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
    let C = parts[1].endsWith('%') ? parseFloat(parts[1]) / 100 * 0.4 : parseFloat(parts[1]);
    let H = 0;
    if (parts[2] !== 'none') {
      if (parts[2].endsWith('deg')) H = parseFloat(parts[2]);
      else if (parts[2].endsWith('rad')) H = parseFloat(parts[2]) * 180 / Math.PI;
      else if (parts[2].endsWith('turn')) H = parseFloat(parts[2]) * 360;
      else H = parseFloat(parts[2]);
    }
    
    let A = 1;
    if (parts[3] !== undefined) {
      A = parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    }
    
    const a_ = C * Math.cos(H * Math.PI / 180);
    const b_ = C * Math.sin(H * Math.PI / 180);
    
    const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
    const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
    const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
    
    const l = Math.pow(Math.max(0, l_), 3);
    const m = Math.pow(Math.max(0, m_), 3);
    const s = Math.pow(Math.max(0, s_), 3);
    
    let r_lin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    
    const r = r_lin <= 0.0031308 ? 12.92 * r_lin : 1.055 * Math.pow(r_lin, 1 / 2.4) - 0.055;
    const g = g_lin <= 0.0031308 ? 12.92 * g_lin : 1.055 * Math.pow(g_lin, 1 / 2.4) - 0.055;
    const b = b_lin <= 0.0031308 ? 12.92 * b_lin : 1.055 * Math.pow(b_lin, 1 / 2.4) - 0.055;
    
    const clamp = (val) => Math.min(255, Math.max(0, Math.round(val * 255)));
    
    if (A === 1) {
      return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
    } else {
      return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${A})`;
    }
  } catch (e) {
    return 'rgb(0, 0, 0)';
  }
}

function resolveOklchToRgb(colorStr) {
  if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }
  return colorStr.replace(/oklch\([^)]+\)/gi, (match) => {
    let tempDiv = document.getElementById('temp-color-resolver');
    if (!tempDiv) {
      tempDiv = document.createElement('div');
      tempDiv.id = 'temp-color-resolver';
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = '0';
      tempDiv.style.height = '0';
      document.body.appendChild(tempDiv);
    }
    try {
      tempDiv.style.color = match;
      const computed = window.getComputedStyle(tempDiv, null).getPropertyValue('color');
      if (computed && !computed.includes('oklch')) {
        return computed;
      }
    } catch (e) {
      // ignore
    }
    return oklchToRgbFallback(match);
  });
}

async function cleanOklchFromStylesheets() {
  const backups = [];
  const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
  
  let combinedCss = '';
  
  for (const node of styleNodes) {
    try {
      if (node.tagName === 'STYLE') {
        combinedCss += '\n' + node.innerHTML;
        backups.push({ node, originalDisabled: node.disabled, type: 'style' });
      } else if (node.tagName === 'LINK') {
        let rulesText = '';
        try {
          if (node.sheet) {
            const rules = node.sheet.cssRules || node.sheet.rules;
            for (let i = 0; i < rules.length; i++) {
              rulesText += rules[i].cssText + '\n';
            }
          }
        } catch (e) {
          // ignore Rules cross-origin error
        }
        
        if (!rulesText) {
          const href = node.getAttribute('href');
          if (href && (href.startsWith('/') || href.startsWith('./') || href.startsWith('src/') || href.startsWith(window.location.origin))) {
            const res = await fetch(href);
            rulesText = await res.text();
          }
        }
        
        if (rulesText) {
          combinedCss += '\n' + rulesText;
          backups.push({ node, originalDisabled: node.disabled, type: 'link' });
        }
      }
    } catch (err) {
      console.warn('Could not backup or read stylesheet:', node, err);
    }
  }
  
  const cleanedCss = combinedCss.replace(/oklch\([^)]+\)/gi, (match) => {
    return oklchToRgbFallback(match);
  });
  
  const tempStyle = document.createElement('style');
  tempStyle.id = 'temp-cleaned-stylesheets';
  tempStyle.innerHTML = cleanedCss;
  document.head.appendChild(tempStyle);
  
  for (const b of backups) {
    b.node.disabled = true;
  }
  
  return function restore() {
    for (const b of backups) {
      b.node.disabled = b.originalDisabled;
    }
    if (tempStyle.parentNode) {
      tempStyle.parentNode.removeChild(tempStyle);
    }
  };
}

function prepareOklchForPrint(container) {
  const disablePolyfill = enableOklchPolyfill();
  const elements = [container, ...container.querySelectorAll('*')];
  const originalStyles = [];
  
  for (const el of elements) {
    if (!el || !el.style) continue;
    
    const originalInlineStyle = el.getAttribute('style') || '';
    originalStyles.push({ el, originalInlineStyle });
    
    try {
      const computed = window.getComputedStyle(el);
      const props = [
        'color', 
        'backgroundColor', 
        'borderColor', 
        'borderTopColor', 
        'borderBottomColor', 
        'borderLeftColor', 
        'borderRightColor', 
        'stroke', 
        'fill'
      ];
      
      for (const prop of props) {
        let val = '';
        try {
          val = computed.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
        } catch (e) {
          val = computed[prop];
        }
        
        if (val && typeof val === 'string' && val.includes('oklch')) {
          const resolved = resolveOklchToRgb(val);
          el.style[prop] = resolved;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  
  return function restore() {
    disablePolyfill();
    for (const item of originalStyles) {
      if (item.originalInlineStyle) {
        item.el.setAttribute('style', item.originalInlineStyle);
      } else {
        item.el.removeAttribute('style');
      }
    }
  };
}

function enableOklchPolyfill() {
  const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
  CSSStyleDeclaration.prototype.getPropertyValue = function(property) {
    const val = originalGetPropertyValue.call(this, property);
    if (val && typeof val === 'string' && val.includes('oklch')) {
      return resolveOklchToRgb(val);
    }
    return val;
  };

  const cssProperties = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'stroke', 'fill'];
  const originalDescriptors = {};

  for (const prop of cssProperties) {
    const desc = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, prop);
    if (desc && desc.get) {
      originalDescriptors[prop] = desc;
      Object.defineProperty(CSSStyleDeclaration.prototype, prop, {
        configurable: true,
        enumerable: true,
        get() {
          const val = desc.get.call(this);
          if (val && typeof val === 'string' && val.includes('oklch')) {
            return resolveOklchToRgb(val);
          }
          return val;
        },
        set(v) {
          desc.set.call(this, v);
        }
      });
    }
  }

  return function restore() {
    CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;
    for (const prop in originalDescriptors) {
      Object.defineProperty(CSSStyleDeclaration.prototype, prop, originalDescriptors[prop]);
    }
  };
}

window.actions = actions;

// Start
actions.init();
