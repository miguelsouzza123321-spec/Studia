// --- DOM HELPERS ---
const $ = (selector) => document.querySelector(selector);
window.$ = $;
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
let schools = [];
let stats = { total: 0, confirmed: 0, absent: 0, pending: 0 };
let currentTab = 'horarios';
let authMode = 'closed'; // 'login', 'register' or 'closed'
let labBookings = [];
let certificates = [];
let reportWeek = 'all';
let reportTurno = 'matutino';
let reportTeacher = 'all';
let schoolName = 'COLÉGIO ESTADUAL PROF. JÚLIO SZYMANSKI - MATUTINO';
let currentRelatorioSubTab = 'urania';
let reportModel = 'prof_turma'; // 'prof_turma', 'prof_subject', 'turma_grid'
let reportCardSize = localStorage.getItem('reportCardSize') || 'medium'; // 'small', 'medium', 'large'
let teacherSchedulesTab = 'grid'; // 'grid' or 'list'
let mobileMenuOpen = false;
let createUserModalVisible = false;
let isRefreshingData = false; // Flag para evitar múltiplas requisições simultâneas

// --- API ---
let apiBaseUrl = (localStorage.getItem('api_base_url') || '').trim();

if (apiBaseUrl === 'undefined' || apiBaseUrl === 'null' || apiBaseUrl === '/') {
  apiBaseUrl = '';
}

const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
if (isLocalHost) {
  apiBaseUrl = 'http://localhost:3000';
  localStorage.removeItem('api_base_url');
}

// If we are running on github.io or another external static host, use the deployed API.
const isStaticHost = !isLocalHost && !window.location.hostname.endsWith('run.app') && !window.location.hostname.endsWith('railway.app');
if (isStaticHost) {
  if (!apiBaseUrl || !apiBaseUrl.startsWith('http') || apiBaseUrl.includes('github.io') || apiBaseUrl.includes('run.app')) {
    apiBaseUrl = 'https://studia-production-3255.up.railway.app';
    localStorage.setItem('api_base_url', apiBaseUrl);
  }
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

function showApiConfigModal(explanation = '') {
  if (document.getElementById('api-config-modal')) {
    const expEl = document.getElementById('api-config-explanation');
    if (expEl && explanation) {
      expEl.innerHTML = explanation;
    }
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'api-config-modal';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
  modal.style.backdropFilter = 'blur(4px)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '16px';
  modal.style.zIndex = '99999';
  
  modal.innerHTML = `
    <div style="background-color: #ffffff; border-radius: 24px; max-width: 440px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #f1f5f9; padding: 32px; display: flex; flex-direction: column; gap: 24px; font-family: system-ui, sans-serif;">
      <div style="display: flex; align-items: center; gap: 12px; color: #d97706;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0;">Configuração de API do Servidor</h3>
      </div>
      
      <p id="api-config-explanation" style="color: #64748b; font-size: 0.875rem; line-height: 1.6; margin: 0;">
        ${explanation || 'Este site necessita se conectar a um servidor de banco de dados (API) para salvar e sincronizar os horários.'}
      </p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">URL do Servidor (API Base URL)</label>
        <input
          type="text"
          id="api-config-input"
          placeholder="https://sua-api.run.app"
          value="${localStorage.getItem('api_base_url') || ''}"
          style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 0.875rem; font-weight: 500; outline: none; box-sizing: border-box; transition: all 0.2s;"
        />
        <p style="font-size: 0.75rem; color: #94a3b8; margin: 0;">
          Insira a URL do seu app no Cloud Run (ex: <code>https://ais-pre-...run.app</code>).
        </p>
      </div>

      <div id="api-config-status" style="font-size: 0.75rem; font-weight: 600; display: none;"></div>

      <div style="display: flex; gap: 12px;">
        <button
          id="api-config-test"
          type="button"
          style="flex: 1; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 11px; font-size: 0.875rem; font-weight: 700; color: #334155; cursor: pointer; transition: all 0.2s;"
          onmouseover="this.style.backgroundColor='#e2e8f0'"
          onmouseout="this.style.backgroundColor='#f1f5f9'"
        >
          Testar
        </button>
        <button
          id="api-config-save"
          type="button"
          style="flex: 1; background-color: #2563eb; border: none; border-radius: 10px; padding: 11px; font-size: 0.875rem; font-weight: 700; color: #ffffff; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.25);"
          onmouseover="this.style.backgroundColor='#1d4ed8'"
          onmouseout="this.style.backgroundColor='#2563eb'"
        >
          Salvar e Fechar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const testBtn = modal.querySelector('#api-config-test');
  const saveBtn = modal.querySelector('#api-config-save');
  const input = modal.querySelector('#api-config-input');
  const statusDiv = modal.querySelector('#api-config-status');

  testBtn.addEventListener('click', async () => {
    const val = input.value.trim();
    if (!val) {
      statusDiv.textContent = 'Por favor, insira uma URL.';
      statusDiv.style.color = '#e11d48';
      statusDiv.style.display = 'block';
      return;
    }
    
    statusDiv.textContent = 'Testando conexão...';
    statusDiv.style.color = '#2563eb';
    statusDiv.style.display = 'block';
    
    try {
      const base = val.endsWith('/') ? val.slice(0, -1) : val;
      const res = await fetch(`${base}/api/stats`, { method: 'GET' });
      if (res.ok) {
        statusDiv.textContent = 'Conectado com sucesso! A API respondeu perfeitamente.';
        statusDiv.style.color = '#059669';
      } else {
        statusDiv.textContent = `Erro do servidor: Código ${res.status}`;
        statusDiv.style.color = '#d97706';
      }
    } catch (e) {
      statusDiv.textContent = 'Falha ao conectar. Verifique se a URL está correta e se o CORS está ativo no servidor.';
      statusDiv.style.color = '#e11d48';
    }
  });

  saveBtn.addEventListener('click', () => {
    const val = input.value.trim();
    localStorage.setItem('api_base_url', val);
    apiBaseUrl = val;
    document.body.removeChild(modal);
    window.location.reload();
  });
}

const api = {
  async request(url, options = {}) {
    let fullUrl = getApiUrl(url);
    let res;
    try {
      res = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
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

const getDetectedSlots = () => {
  const slots = new Set();
  schedules.forEach(s => {
    if (s.startTime) slots.add(s.startTime);
  });
  return Array.from(slots).sort();
};

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

// Helper function to determine if a start time belongs to a specific turno
const isSlotsMatchTurno = (startTime, turno) => {
  if (turno === 'matutino') {
    return startTime >= '07:00' && startTime < '12:00';
  } else if (turno === 'vespertino') {
    return startTime >= '12:00' && startTime < '18:00';
  } else if (turno === 'noturno') {
    return startTime >= '18:00' && startTime < '23:00';
  }
  return true; // 'auto' or unknown
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
      // Show on the grid if the schedule is confirmed or pending, OR if it's already a vacant slot (vaga) or HAF
      if (s.status !== 'confirmed' && s.status !== 'pending' && s.status !== 'vaga' && s.subject?.toUpperCase() !== 'HAF') {
        return;
      }
      const isHAF = s.subject?.toUpperCase() === 'HAF';
      const isVaga = s.status === 'vaga';
      let cellText = '------';
      if (isVaga) {
        cellText = 'VAGA';
      } else if (isHAF) {
        cellText = 'HAF';
      } else if (model === 'prof_turma') {
        cellText = s.classGroup || '------';
      } else if (model === 'prof_subject') {
        cellText = s.subject || '------';
      } else {
        const isDifferentSubject = s.subject && teacher.subject && s.subject.trim().toLowerCase() !== teacher.subject.trim().toLowerCase();
        cellText = (s.classGroup && isDifferentSubject) ? `${s.classGroup} - ${s.subject}` : (s.classGroup || s.subject || '------');
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
  let rowClass = "h-8";

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
    <div class="bg-white border border-slate-300 rounded-lg text-slate-800 shadow-sm flex flex-col justify-between break-inside-avoid text-xs w-full" style="${cardStyle}">
      <div class="border-b border-slate-300 pb-1 mb-1.5 flex justify-between items-center bg-slate-100 px-2 py-1 rounded">
        <span class="font-extrabold uppercase text-slate-900 ${headerSize}">${teacher.displayName}${anosSuffix}</span>
        <span class="${subTitleSize} text-[#5B99C2] font-extrabold uppercase tracking-tight">${teacher.subject || 'Professor'}</span>
      </div>
      <table class="w-full text-center border-collapse table-fixed">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="font-semibold text-slate-400 ${thSize} py-0.5 text-left w-[40px]">Hor</th>
            ${days.map(day => `<th class="font-bold text-slate-700 ${thSize} py-0.5">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${slots.map(slot => `
            <tr class="${rowClass}">
              <td class="font-extrabold text-[#2E5077] ${thSize} text-left py-0.5">${slot}</td>
              ${days.map(day => {
                const val = grid[slot][day];
                const isClass = val !== '------';
                const isHAF = val === 'HAF';
                const isVaga = val === 'VAGA';
                const cellClass = isVaga ? 'text-rose-600 font-black' : (isHAF ? 'text-[#5B99C2] font-black' : (isClass ? 'text-slate-900 font-black' : 'text-slate-400'));
                return `<td class="${tdSize} py-0.5 truncate ${cellClass}">${val}</td>`;
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
      // Show on the grid if the schedule is confirmed or pending, OR if it's already a vacant slot (vaga) or HAF
      if (s.status !== 'confirmed' && s.status !== 'pending' && s.status !== 'vaga' && s.subject?.toUpperCase() !== 'HAF') {
        return;
      }
      grid[startTimeKey][dayName] = {
        teacherName: s.teacherName || '------',
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
    <div class="bg-white border border-slate-300 rounded-lg text-slate-800 shadow-sm flex flex-col justify-between break-inside-avoid text-xs w-full" style="${cardStyle}">
      <div class="border-b border-slate-300 pb-1 mb-1.5 flex justify-between items-center bg-slate-100 px-2 py-1 rounded">
        <span class="font-extrabold uppercase text-slate-900 truncate ${headerSize}">Turma: ${turmaName}</span>
        <span class="${subTitleSize} text-[#5B99C2] font-extrabold uppercase tracking-tight">GRADE HORÁRIA</span>
      </div>
      <table class="w-full text-center border-collapse table-fixed">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="font-semibold text-slate-400 ${thSize} py-0.5 text-left w-[40px]">Hor</th>
            ${days.map(day => `<th class="font-bold text-slate-700 ${thSize} py-0.5">${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${slots.map(slot => `
            <tr class="${rowClass}">
              <td class="font-extrabold text-[#2E5077] ${thSize} text-left py-0.5 align-middle">${slot}</td>
              ${days.map(day => {
                const cell = grid[slot][day];
                if (!cell) {
                  return `<td class="text-slate-300 ${tdTitleSize} py-0.5 align-middle">------</td>`;
                }
                if (cell.status === 'vaga') {
                  return `
                    <td class="py-0.5 align-middle leading-tight truncate">
                      <div class="font-black text-rose-600 ${tdTitleSize} truncate font-black">VAGA</div>
                    </td>
                  `;
                }
                const isHAF = cell.subject?.toUpperCase() === 'HAF';
                if (isHAF) {
                  return `
                    <td class="py-0.5 align-middle leading-tight truncate">
                      <div class="font-black text-[#5B99C2] ${tdTitleSize} truncate">HAF</div>
                    </td>
                  `;
                }
                return `
                  <td class="py-0.5 align-middle leading-tight truncate">
                    <div class="font-black text-slate-900 ${tdTitleSize} truncate">${cell.teacherName}</div>
                    <div class="text-slate-400 font-extrabold truncate uppercase mt-0.5 ${tdSubSize}">${cell.subject}</div>
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
  <div style="margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); color: #e0e7ff; overflow-x: hidden; position: relative;">
    <div class="landing-grid-bg"></div>
    <style>
      .landing-grid-bg { position: fixed; inset: 0; z-index: 0; opacity: 0.1; background-image: linear-gradient(0deg, transparent 24%, rgba(91, 153, 194, 0.3) 25%, rgba(91, 153, 194, 0.3) 26%, transparent 27%, transparent 74%, rgba(91, 153, 194, 0.3) 75%, rgba(91, 153, 194, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(91, 153, 194, 0.3) 25%, rgba(91, 153, 194, 0.3) 26%, transparent 27%, transparent 74%, rgba(91, 153, 194, 0.3) 75%, rgba(91, 153, 194, 0.3) 76%, transparent 77%, transparent); background-size: 50px 50px; animation: gridShift 20s linear infinite; }
      @keyframes gridShift { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
      .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; background: rgba(10, 14, 39, 0.95); backdrop-filter: blur(15px); position: fixed; width: 100%; top: 0; z-index: 1000; border-bottom: 1px solid rgba(91, 153, 194, 0.25); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
      .landing-logo { font-size: 0; font-weight: 900; color: #5B99C2; display: flex; align-items: center; gap: 0.5rem; }
      .landing-nav-links { display: flex; gap: 2.5rem; list-style: none; }
      .landing-nav-links a { text-decoration: none; color: #e0e7ff; font-weight: 500; transition: all 0.3s; cursor: pointer; font-size: 0.95rem; }
      .landing-nav-links a:hover { color: #5B99C2; text-shadow: 0 0 10px rgba(91, 153, 194, 0.5); }
      .landing-cta-btn { background: linear-gradient(135deg, #3b82f6, #5B99C2); color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.3s; border: 1px solid rgba(91, 153, 194, 0.5); cursor: pointer; }
      .landing-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(91, 153, 194, 0.4); border-color: #5B99C2; }
      .landing-hero { margin-top: 80px; padding: 80px 5% 60px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem; position: relative; z-index: 1; }
      .landing-hero-content h1 { font-size: 3.5rem; line-height: 1.2; margin-bottom: 1.5rem; background: linear-gradient(135deg, #ffffff 0%, #5B99C2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: slideInLeft 0.8s ease-out; font-weight: 900; }
      .landing-hero-content h1 em { font-style: italic; color: #5B99C2; }
      .landing-hero-content p { font-size: 1.2rem; color: #e0e7ff; margin-bottom: 2rem; line-height: 1.6; animation: slideInLeft 0.8s ease-out 0.2s backwards; }
      .landing-hero-buttons { display: flex; gap: 1.5rem; animation: slideInLeft 0.8s ease-out 0.4s backwards; }
      .landing-hero-buttons .landing-cta-btn { padding: 1rem 2rem; font-size: 1.1rem; }
      .landing-secondary-btn { background: transparent; color: #cbd5e1; border: 2px solid rgba(91, 153, 194, 0.5); }
      .landing-secondary-btn:hover { background: rgba(91, 153, 194, 0.1); color: #5B99C2; border-color: #5B99C2; }
      .landing-hero-visual { position: relative; height: 400px; perspective: 1000px; }
      .landing-school-system { position: relative; width: 350px; height: 350px; margin: 0 auto; }
      .landing-school-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; text-align: center; animation: pulseSchool 2s ease-in-out infinite; }
      .landing-school { font-size: 4rem; margin-bottom: 0.5rem; filter: drop-shadow(0 4px 12px rgba(46, 80, 119, 0.3)); }
      .landing-school-label { font-size: 0.9rem; font-weight: 700; color: #2E5077; letter-spacing: 1px; }
      .landing-orbit-item { position: absolute; width: 70px; height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .landing-module { font-size: 2rem; margin-bottom: 0.5rem; filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15)); }
      .landing-module-label { font-size: 0.75rem; font-weight: 600; color: #2E5077; text-align: center; white-space: nowrap; }
      .landing-orbit-1 { animation: orbitCircle 12s linear infinite; }
      .landing-orbit-2 { animation: orbitCircle 12s linear infinite; }
      .landing-orbit-3 { animation: orbitCircle 12s linear infinite; }
      .landing-orbit-4 { animation: orbitCircle 12s linear infinite; }
      .landing-orbit-5 { animation: orbitCircle 12s linear infinite; }
      .landing-orbit-6 { animation: orbitCircle 12s linear infinite; }
      @keyframes orbitCircle {
        0% { transform: translate(140px, 0); }
        16.66% { transform: translate(70px, 121px); }
        33.33% { transform: translate(-70px, 121px); }
        50% { transform: translate(-140px, 0); }
        66.66% { transform: translate(-70px, -121px); }
        83.33% { transform: translate(70px, -121px); }
        100% { transform: translate(140px, 0); }
      }
      @keyframes pulseSchool { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.08); } }
      .landing-features { padding: 100px 5%; background: linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(26, 31, 58, 0.5)); position: relative; z-index: 1; }
      .landing-section-title { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; animation: fadeInUp 0.8s ease-out; color: #ffffff; font-weight: 800; }
      .landing-section-title::before { content: "Funcionalidades "; display: block; font-size: 0.9rem; color: #5B99C2; font-weight: 600; letter-spacing: 1px; margin-bottom: 1rem; }
      .landing-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
      .landing-feature-card { padding: 2rem; background: linear-gradient(135deg, rgba(91, 153, 194, 0.15), rgba(46, 80, 119, 0.12)); border-radius: 12px; border: 1px solid rgba(91, 153, 194, 0.3); transition: all 0.4s ease; animation: fadeInUp 0.8s ease-out; opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
      .landing-feature-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 50px rgba(91, 153, 194, 0.25); border-color: #5B99C2; background: linear-gradient(135deg, rgba(91, 153, 194, 0.2), rgba(46, 80, 119, 0.18)); }
      .landing-feature-icon { width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #5B99C2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 1rem; color: white; box-shadow: 0 4px 15px rgba(91, 153, 194, 0.3); }
      .landing-feature-card h3 { color: #ffffff; margin-bottom: 1rem; font-size: 1.3rem; font-weight: 700; }
      .landing-feature-card p { color: #cbd5e1; line-height: 1.6; }
      .landing-benefits { padding: 100px 5%; background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(26, 31, 58, 0.8)); position: relative; z-index: 1; }
      .landing-benefits-content { max-width: 900px; margin: 0 auto; }
      .landing-benefits h2 { font-size: 2.5rem; margin-bottom: 2rem; animation: fadeInUp 0.8s ease-out; color: #ffffff; font-weight: 800; }
      .landing-benefits h2::before { content: "Benefícios "; display: block; font-size: 0.9rem; color: #5B99C2; font-weight: 600; letter-spacing: 1px; margin-bottom: 1rem; }
      .landing-benefit-item { display: flex; gap: 1.5rem; margin-bottom: 2rem; animation: fadeInUp 0.8s ease-out; opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
      .landing-benefit-check { width: 40px; height: 40px; background: linear-gradient(135deg, rgba(91, 153, 194, 0.3), rgba(59, 130, 246, 0.3)); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.5rem; border: 1px solid rgba(91, 153, 194, 0.4); }
      .landing-benefit-item p { font-size: 1.1rem; line-height: 1.6; color: #e0e7ff; }
      .landing-contact { padding: 100px 5%; background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(26, 31, 58, 0.9)); text-align: center; position: relative; z-index: 1; }
      .landing-contact h2 { font-size: 2.5rem; margin-bottom: 1rem; animation: fadeInUp 0.8s ease-out; color: #ffffff; font-weight: 800; }
      .landing-contact h2::before { content: "Contato "; display: block; font-size: 0.9rem; color: #5B99C2; font-weight: 600; letter-spacing: 1px; margin-bottom: 1rem; }
      .landing-contact p { font-size: 1.2rem; color: #e0e7ff; margin-bottom: 2rem; animation: fadeInUp 0.8s ease-out 0.2s backwards; }
      .landing-footer { padding: 2rem 5%; background: rgba(10, 14, 39, 0.8); color: #cbd5e1; text-align: center; position: relative; z-index: 1; border-top: 1px solid rgba(91, 153, 194, 0.1); }
      @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 768px) {
        .landing-nav-links { display: none; }
        .landing-hero { grid-template-columns: 1fr; padding: 60px 5% 40px; }
        .landing-hero-content h1 { font-size: 2rem; }
        .landing-hero-visual { height: 300px; }
        .landing-school-system { width: 280px; height: 280px; }
        .landing-school { font-size: 3rem; }
        .landing-module { font-size: 1.5rem; }
        .landing-module-label { font-size: 0.65rem; }
        .landing-orbit-1, .landing-orbit-2, .landing-orbit-3, .landing-orbit-4, .landing-orbit-5, .landing-orbit-6 { width: 50px; height: 50px; }
        .landing-section-title::before, .landing-benefits h2::before, .landing-contact h2::before { display: none; }
      }
    </style>

    <nav class="landing-nav">
      <div class="landing-logo" style="font-size: 0;">
        ${Logo(120, 35)}
      </div>
      <ul class="landing-nav-links">
        <li><a onclick="document.getElementById('features-section').scrollIntoView({behavior:'smooth'})">Funcionalidades</a></li>
        <li><a onclick="document.getElementById('benefits-section').scrollIntoView({behavior:'smooth'})">Benefícios</a></li>
        <li><a onclick="document.getElementById('contact-section').scrollIntoView({behavior:'smooth'})">Contato</a></li>
      </ul>
      <button onclick="actions.showLoginModal('login')" class="landing-cta-btn">Entrar</button>
    </nav>

    <section class="landing-hero">
      <div class="landing-hero-content">
        <h1>Gestão Escolar<br><em>Inteligente</em> & <em>Integrada</em></h1>
        <p>Sistema digital que centraliza horários, laboratórios e presença em uma plataforma segura e profissional para sua escola.</p>
        <div class="landing-hero-buttons">
          <button onclick="actions.showLoginModal('login')" class="landing-cta-btn">Agende uma Demo</button>
          <button onclick="actions.showLoginModal('login')" class="landing-cta-btn landing-secondary-btn">Testar Agora</button>
        </div>
      </div>
      <div class="landing-hero-visual">
        <div class="landing-school-system">
          <!-- Centro: Escola -->
          <div class="landing-school-center">
            <div class="landing-school">🏫</div>
            <div class="landing-school-label">STUDIA</div>
          </div>

          <!-- Módulos orbitando -->
          <div class="landing-orbit-item landing-orbit-1" style="animation-delay: 0s;">
            <div class="landing-module">📅</div>
            <div class="landing-module-label">Horários</div>
          </div>
          <div class="landing-orbit-item landing-orbit-2" style="animation-delay: -2s;">
            <div class="landing-module">👥</div>
            <div class="landing-module-label">Alunos</div>
          </div>
          <div class="landing-orbit-item landing-orbit-3" style="animation-delay: -4s;">
            <div class="landing-module">📊</div>
            <div class="landing-module-label">Desempenho</div>
          </div>
          <div class="landing-orbit-item landing-orbit-4" style="animation-delay: -6s;">
            <div class="landing-module">🧪</div>
            <div class="landing-module-label">Laboratórios</div>
          </div>
          <div class="landing-orbit-item landing-orbit-5" style="animation-delay: -8s;">
            <div class="landing-module">📢</div>
            <div class="landing-module-label">Avisos</div>
          </div>
          <div class="landing-orbit-item landing-orbit-6" style="animation-delay: -10s;">
            <div class="landing-module">👨‍🏫</div>
            <div class="landing-module-label">Professores</div>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-features" id="features-section">
      <h2 class="landing-section-title">Funcionalidades Principais</h2>
      <div class="landing-features-grid">
        <div class="landing-feature-card">
          <div class="landing-feature-icon">📅</div>
          <h3>Grade Horária Digital</h3>
          <p>Organize e compartilhe horários de aulas com professores e alunos em tempo real.</p>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon">🔬</div>
          <h3>Gerenciamento de Laboratórios</h3>
          <p>Reserve e controle o uso dos laboratórios de forma simples e eficiente.</p>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon">📋</div>
          <h3>Atestados Médicos</h3>
          <p>Receba e aprove atestados de forma digital, reduzindo burocracias.</p>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon">👥</div>
          <h3>Gestão de Usuários</h3>
          <p>Crie e gerencie contas de professores, diretores e alunos facilmente.</p>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon">📊</div>
          <h3>Relatórios Detalhados</h3>
          <p>Gere relatórios completos sobre frequência e atividades escolares.</p>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon">🔒</div>
          <h3>Segurança em Primeiro Lugar</h3>
          <p>Dados criptografados e acesso controlado por função e escola.</p>
        </div>
      </div>
    </section>

    <section class="landing-benefits" id="benefits-section">
      <div class="landing-benefits-content">
        <h2>Por que escolher Studia?</h2>
        <div class="landing-benefit-item">
          <div class="landing-benefit-check">✓</div>
          <p><strong>Aumenta Eficiência:</strong> Reduz tarefas administrativas em até 70%, liberando tempo para o que importa.</p>
        </div>
        <div class="landing-benefit-item">
          <div class="landing-benefit-check">✓</div>
          <p><strong>Melhora Comunicação:</strong> Mantém professores, diretores e pais na mesma página com atualizações em tempo real.</p>
        </div>
        <div class="landing-benefit-item">
          <div class="landing-benefit-check">✓</div>
          <p><strong>Reduz Custos:</strong> Elimina papel, telefones e reuniões desnecessárias com um sistema centralizado.</p>
        </div>
        <div class="landing-benefit-item">
          <div class="landing-benefit-check">✓</div>
          <p><strong>Segurança de Dados:</strong> Protege informações sensíveis com criptografia de nível empresarial.</p>
        </div>
        <div class="landing-benefit-item">
          <div class="landing-benefit-check">✓</div>
          <p><strong>Suporte Dedicado:</strong> Equipe técnica pronta para ajudar sua escola 24/7.</p>
        </div>
      </div>
    </section>

    <section class="landing-contact" id="contact-section">
      <h2>Pronto para transformar sua escola?</h2>
      <p style="margin-bottom: 2rem;">Fale conosco pelo WhatsApp e conheça como Studia pode ajudar sua instituição.</p>
      <a href="https://wa.me/5541987654321?text=Olá! Gostaria de conhecer mais sobre o Studia" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; transition: all 0.3s; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);" onmouseover="this.style.background='#20BA5A'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='#25D366'; this.style.transform='translateY(0)';">
        💬 Fale conosco no WhatsApp
      </a>
    </section>

    <footer class="landing-footer">
      <p>&copy; ${new Date().getFullYear()} Studia - Sistema de Gestão Escolar Digital. Todos os direitos reservados.</p>
    </footer>

    <script>
      // Animações fluidas ao scroll com Intersection Observer
      const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -60px 0px' };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 80);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      setTimeout(() => {
        document.querySelectorAll('.landing-feature-card, .landing-benefit-item').forEach((el, index) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(40px)';
          el.style.transition = 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
          observer.observe(el);
        });
      }, 150);
    </script>

    <!-- Login/Register Modal -->
    <div id="login-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 ${authMode === 'closed' ? 'hidden' : ''}">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideLoginModal()"></div>
      <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
        <div class="flex justify-center mb-6">
          ${Logo(160, 44)}
        </div>
        <div class="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl">
            <button onclick="actions.toggleAuthMode('login')" class="flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}">Entrar</button>
            <button onclick="actions.toggleAuthMode('register')" class="flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}">Criar Conta</button>
        </div>

        <h3 class="text-2xl font-bold mb-2">${authMode === 'login' ? 'Bem-vindo de volta' : 'Nova conta Studia'}</h3>
        <p class="text-slate-500 text-sm mb-6 font-medium">${authMode === 'login' ? 'Acesse seu painel administrativo.' : 'Crie sua conta de professor.'}</p>

        <div class="space-y-4">
          ${authMode === 'register' ? `
            <input type="text" id="auth-name" placeholder="Seu nome completo" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm">
            <input type="text" id="auth-subject" placeholder="Sua Matéria (ex: Português)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm">
          ` : ''}
          <input type="email" id="auth-email" placeholder="nome@escola.pr.gov.br" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm">
          <input type="password" id="auth-password" placeholder="Sua senha" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm">

          <button onclick="${authMode === 'login' ? 'actions.login()' : 'actions.register()'}" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md shadow-blue-500/15 mt-2 transition-all">
            ${authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  </div>
`;

const TeacherView = () => {
  const detectedSlots = getDetectedSlots();
  let slots = [];
  if (reportTurno === 'matutino') {
    slots = ['07:30', '08:20', '09:10', '10:15', '11:00', '11:45'];
  } else if (reportTurno === 'vespertino') {
    slots = ['13:00', '13:50', '14:40', '15:45', '16:30', '17:15'];
  } else if (reportTurno === 'noturno') {
    slots = ['18:45', '19:30', '20:30', '21:15', '22:00'];
  } else {
    slots = detectedSlots.length > 0 ? detectedSlots : ['07:30', '08:20', '09:10', '10:15', '11:00', '11:45'];
  }

  const teacherNavItems = [
    { id: 'horarios', icon: 'calendar', label: 'Meus Horários' },
    { id: 'labs', icon: 'test-tube', label: 'Laboratórios' },
    { id: 'atestados', icon: 'file-text', label: 'Meus Atestados' },
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
          <h2 class="font-bold text-base md:text-lg capitalize">${currentTab === 'horarios' ? 'Meus Horários' : (currentTab === 'labs' ? 'Laboratórios' : 'Meus Atestados')}</h2>
        </div>
        <div class="flex gap-2">
          ${currentTab === 'atestados' ? `
            <button onclick="actions.showCertModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-md transition-all" id="btn-new-cert">
                <i data-lucide="file-plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo <span class="hidden sm:inline">Atestado</span></span>
            </button>
          ` : ''}
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
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Turno / Períodos</label>
                  <select onchange="actions.setReportTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="matutino" ${reportTurno === 'matutino' ? 'selected' : ''}>Manhã (07:30 - 11:45)</option>
                    <option value="vespertino" ${reportTurno === 'vespertino' ? 'selected' : ''}>Tarde (13:00 - 17:15)</option>
                    <option value="noturno" ${reportTurno === 'noturno' ? 'selected' : ''}>Noite (18:45 - 22:45)</option>
                    <option value="auto" ${reportTurno === 'auto' ? 'selected' : ''}>Auto-detecção</option>
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
                    ${TeacherScheduleCard(user, schedules.filter(s => s.teacherId === user.uid), slots)}
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
                      s.status === 'confirmed' ? 'text-blue-600' : s.status === 'absent' ? 'text-rose-500' : s.status === 'vaga' ? 'text-rose-600 font-black' : 'text-amber-500'
                    }">
                      ${s.status === 'vaga' ? 'AULA VAGA' : (s.status === 'confirmed' ? 'Confirmado' : s.status === 'absent' ? 'Ausente' : 'Pendente')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        ` : ''}
        ${currentTab === 'atestados' ? `
          <div class="space-y-8 animate-fade-in">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 class="text-xl md:text-2xl font-black text-slate-900">Seus Atestados Médicos</h3>
                <p class="text-xs text-slate-500 font-bold">Acompanhe seus atestados enviados e o status de homologação.</p>
              </div>
              <button onclick="actions.showCertModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
                <i data-lucide="plus" class="w-4 h-4"></i> Enviar Novo Atestado
              </button>
            </div>
            
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div class="overflow-x-auto pr-2">
                <table class="w-full text-left min-w-[700px]">
                  <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                    <tr>
                      <th class="px-8 py-5">Data da Falta</th>
                      <th class="px-8 py-4">Motivo</th>
                      <th class="px-8 py-4">Imagem do Atestado</th>
                      <th class="px-8 py-4">Status de Aprovação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    ${(() => {
                      const myCerts = certificates.filter(c => c.teacherId === user.uid);
                      if (myCerts.length === 0) {
                        return `
                          <tr>
                            <td colspan="4" class="px-8 py-16 text-center text-slate-400 font-bold text-sm">
                              Você ainda não enviou nenhum atestado médico.
                            </td>
                          </tr>
                        `;
                      }
                      return myCerts.map(c => `
                        <tr class="hover:bg-slate-50/50 transition-all">
                          <td class="px-8 py-5 font-bold text-slate-800">${c.date}</td>
                          <td class="px-8 py-5 text-sm text-slate-600 font-medium">${c.reason}</td>
                          <td class="px-8 py-5">
                            ${c.id ? `
                              <button onclick="actions.viewImageById(${c.id})" class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 transition-all cursor-pointer">
                                <i data-lucide="eye" class="w-4 h-4"></i> Visualizar Foto
                              </button>
                            ` : `
                              <span class="text-slate-400 font-bold text-[10px] uppercase">Sem imagem</span>
                            `}
                          </td>
                          <td class="px-8 py-5">
                            <span class="text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                              c.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }">
                              ${c.status === 'approved' ? 'Aprovado' : 'Aguardando Aprovação'}
                            </span>
                          </td>
                        </tr>
                      `).join('');
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ` : ''}
        ${currentTab === 'labs' ? LabsTab() : ''}
      </div>
    </main>
    
    ${CertModal()}
  </div>
  `;
};

const CreateModal = () => `
  <!-- Same Create Modal logic but with current state -->
  <div id="create-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
      <h3 class="text-2xl font-bold mb-8">Novo Agendamento</h3>
      <form onsubmit="actions.createSchedule(event)" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <input type="text" id="form-subject" placeholder="Matéria" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <input type="text" id="form-class-group" placeholder="Turma (ex: 9A, 3BI)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <input type="date" id="form-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <input type="text" id="form-room" placeholder="Sala" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <input type="time" id="form-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="18:45" required>
          <input type="time" id="form-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="22:45" required>
        </div>
        <select id="form-teacher" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <option value="">Selecione o Professor</option>
          ${teachers.map(t => `<option value="${t.uid}">${t.displayName}</option>`).join('')}
        </select>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar Horário</button>
        </div>
      </form>
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
            <input type="text" id="edit-form-subject" placeholder="Matéria" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Turma</label>
            <input type="text" id="edit-form-class-group" placeholder="Turma (ex: 9A, 3BI)" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data</label>
            <input type="date" id="edit-form-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sala / Local</label>
            <input type="text" id="edit-form-room" placeholder="Sala" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora Início</label>
            <input type="time" id="edit-form-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora Término</label>
            <input type="time" id="edit-form-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Professor</label>
          <select id="edit-form-teacher" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
            <option value="">Selecione o Professor</option>
            ${teachers.map(t => `<option value="${t.uid}">${t.displayName}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
          <select id="edit-form-status" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="absent">Falta / Ausente</option>
            <option value="vaga">Aula Vaga</option>
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
        <select id="lab-type" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <option value="info">Informática</option>
          <option value="chem">Química</option>
        </select>
        <input type="date" id="lab-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        <div class="grid grid-cols-2 gap-4">
          <input type="time" id="lab-start" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <input type="time" id="lab-end" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideLabModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Reservar</button>
        </div>
      </form>
    </div>
  </div>
`;

const CertModal = () => `
  <div id="cert-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCertModal()"></div>
    <div class="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
      <h3 class="text-2xl font-bold mb-8">Incluir Atestado Médico</h3>
      <form onsubmit="actions.submitCert(event)" class="space-y-4">
        <p class="text-xs text-slate-500 font-bold uppercase mb-2">Atenção: Ao aprovar este atestado, as aulas do dia serão marcadas automaticamente como "Aulas Vagas".</p>
        <input type="date" id="cert-date" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        <textarea id="cert-reason" placeholder="Motivo da ausência" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]" required></textarea>

        <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase">Anexar Foto do Atestado</label>
            <div class="relative group">
                <input type="file" id="cert-image" accept="image/*" capture="environment" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onchange="actions.previewCertImage(event)">
                <div id="cert-upload-placeholder" class="w-full border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center gap-2 group-hover:border-blue-400 transition-all">
                    <i data-lucide="camera" class="text-slate-400 group-hover:text-blue-600 transition-all"></i>
                    <p class="text-sm font-bold text-slate-500">Toque para tirar foto ou selecionar</p>
                </div>
            </div>
            <div id="cert-preview-container" class="hidden relative mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-2">
                <img id="cert-preview-img" class="w-full max-h-64 object-contain rounded-lg mx-auto" />
                <button type="button" onclick="actions.clearCertImage()" class="absolute top-4 right-4 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg shadow-lg transition-all flex items-center justify-center" title="Remover Imagem">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCertModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Enviar</button>
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
          <input type="text" id="escola-name" placeholder="Ex: Colégio Estadual..." class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="button" onclick="actions.hideCreateEscolaModal()" class="flex-1 py-2.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all text-slate-700">Cancelar</button>
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md transition-all">Criar</button>
        </div>
      </form>
    </div>
  </div>
`;

const CreateUserModal = ({ viewerRole = 'admin' } = {}) => `
  <div id="create-user-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="actions.hideCreateUserModal()"></div>
    <div class="bg-white w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl border border-slate-200">
      <h3 class="text-2xl font-bold mb-6">Criar Novo Usuário</h3>
      <form onsubmit="actions.createUser(event)" class="space-y-4">
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Nome</label>
          <input type="text" id="user-displayname" placeholder="Ex: João Silva" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">E-mail</label>
          <input type="email" id="user-email" placeholder="Ex: joao@example.com" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Senha</label>
          <input type="password" id="user-password" placeholder="Mínimo 8 caracteres" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required minlength="8">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Matéria</label>
          <input type="text" id="user-subject" placeholder="Ex: Matemática" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-500 uppercase block mb-2">Cargo</label>
          <select id="user-role" class="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
            ${viewerRole === 'admin'
              ? `
                <option value="">Selecione um cargo</option>
                <option value="teacher">Professor</option>
                <option value="diretor">Diretor</option>
                <option value="admin">Administrador</option>
              `
              : `
                <option value="">Selecione um cargo</option>
                <option value="teacher">Professor</option>
                <option value="diretor">Diretor</option>
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

const AdminOverviewTab = () => {
  const connected = !!apiBaseUrl;
  const totalSchedules = schedules.length;
  const totalUsers = allUsers.length;
  const totalLabs = labBookings.length;
  const totalCertificates = certificates.length;

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
          <p class="mt-2 text-sm text-slate-500">Reservas ativas</p>
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
            <div class="flex justify-between items-center pb-1">
              <span class="text-sm font-semibold text-slate-500">Atestados</span>
              <span class="text-sm font-black text-slate-900">${totalCertificates}</span>
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

const ADMIN_NAV_ITEMS = [
  { id: 'overview', icon: 'activity', label: 'Visão geral' },
  { id: 'escolas', icon: 'building', label: 'Escolas' },
  { id: 'horarios', icon: 'calendar', label: 'Horários' },
  { id: 'labs', icon: 'test-tube', label: 'Laboratórios' },
  { id: 'atestados', icon: 'file-text', label: 'Atestados' },
  { id: 'usuarios', icon: 'users', label: 'Usuários' },
  { id: 'relatorios', icon: 'bar-chart', label: 'Relatórios' },
];

const DIRETOR_NAV_ITEMS = ADMIN_NAV_ITEMS.filter(item => item.id !== 'overview' && item.id !== 'escolas');

const AdminView = () => `
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${Sidebar({ theme: 'dark', sectionLabel: 'Administrador', navItems: ADMIN_NAV_ITEMS })}
    ${MobileDrawer({ theme: 'dark', sectionLabel: 'Administrador', navItems: ADMIN_NAV_ITEMS, drawerId: 'admin-mobile-sidebar-drawer' })}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-admin-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Área administrativa</p>
            <h2 class="font-black text-base md:text-lg text-slate-900">Console Studia</h2>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${currentTab === 'horarios' ? `
            <button onclick="actions.showCreateModal()" class="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-blue-700 transition-all" id="btn-admin-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo Horário</span>
            </button>
          ` : ''}
          ${currentTab === 'labs' ? `
            <button onclick="actions.showLabModal()" class="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-800 transition-all" id="btn-admin-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          ` : ''}
          <span class="hidden md:inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]"><i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Administrador</span>
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${currentTab === 'overview' ? AdminOverviewTab() : ''}
        ${currentTab === 'escolas' ? EscolasTab() : ''}
        ${currentTab === 'horarios' ? HorariosTab() : ''}
        ${currentTab === 'labs' ? LabsTab() : ''}
        ${currentTab === 'atestados' ? AtestadosTab() : ''}
        ${currentTab === 'usuarios' ? UsersTab({ viewerRole: 'admin' }) : ''}
        ${currentTab === 'relatorios' ? RelatoriosTab() : ''}
      </div>
    </main>

    ${CreateModal()}
    ${CertModal()}
    ${EditModal()}
    ${DeleteConfirmModal()}
    ${CreateEscolaModal()}
    ${CreateUserModal({ viewerRole: 'admin' })}
  </div>
`;

const DiretorView = () => `
  <div class="flex h-screen overflow-hidden print:overflow-visible flex-col md:flex-row">
    ${Sidebar({ theme: 'light', sectionLabel: 'Diretor', navItems: DIRETOR_NAV_ITEMS })}
    ${MobileDrawer({ theme: 'light', sectionLabel: 'Diretor', navItems: DIRETOR_NAV_ITEMS, drawerId: 'diretor-mobile-sidebar-drawer' })}

    <main class="flex-1 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:overflow-visible">
      <header class="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 print:hidden">
        <div class="flex items-center gap-3">
          <button onclick="actions.toggleMobileMenu(true)" class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg" id="btn-diretor-toggle-menu">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Direção</p>
            <h2 class="font-black text-base md:text-lg text-slate-900">Console Studia</h2>
          </div>
        </div>
        <div class="flex gap-2">
          ${currentTab === 'horarios' ? `
            <button onclick="actions.showCreateModal()" class="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-blue-700 transition-all" id="btn-admin-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Novo Horário</span>
            </button>
          ` : ''}
          ${currentTab === 'labs' ? `
            <button onclick="actions.showLabModal()" class="bg-slate-900 text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-md flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-800 transition-all" id="btn-admin-lab-new">
              <i data-lucide="plus" class="w-4 h-4 md:w-5 md:h-5"></i> <span>Reservar Lab</span>
            </button>
          ` : ''}
        </div>
      </header>

      <div class="p-4 md:p-10 flex-1 overflow-y-auto space-y-6 md:space-y-8 print:p-0">
        ${currentTab === 'horarios' ? HorariosTab() : ''}
        ${currentTab === 'labs' ? LabsTab() : ''}
        ${currentTab === 'atestados' ? AtestadosTab() : ''}
        ${currentTab === 'usuarios' ? UsersTab({ viewerRole: 'diretor' }) : ''}
        ${currentTab === 'relatorios' ? RelatoriosTab() : ''}
      </div>
    </main>

    ${CreateModal()}
    ${CertModal()}
    ${EditModal()}
    ${DeleteConfirmModal()}
    ${CreateUserModal({ viewerRole: 'diretor' })}
  </div>
`;

const ROLE_META = {
  admin: { badge: 'bg-violet-100 text-violet-700', label: 'Administrador' },
  diretor: { badge: 'bg-amber-100 text-amber-700', label: 'Diretor' },
  teacher: { badge: 'bg-blue-100 text-blue-700', label: 'Professor' },
};

const UsersTab = ({ viewerRole = 'diretor' } = {}) => {
  const users = [...allUsers]
    .filter(account => viewerRole === 'admin' || account.role !== 'admin')
    .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));

  const roleOptions = viewerRole === 'admin'
    ? ['teacher', 'diretor', 'admin']
    : ['teacher', 'diretor'];

  return `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-2xl font-black text-slate-900">Gestão de usuários</h3>
          <p class="text-sm text-slate-500 font-medium">${viewerRole === 'admin' ? 'Todas as contas cadastradas no sistema.' : 'Diretores e professores cadastrados no sistema.'}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          ${(viewerRole === 'admin' || viewerRole === 'diretor') ? `
            <button onclick="actions.showCreateUserModal('${viewerRole}')" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
              <i data-lucide="plus" class="w-4 h-4"></i> Criar Usuário
            </button>
          ` : ''}
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
            <i data-lucide="users" class="w-3.5 h-3.5"></i> ${users.length} usuários
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[820px] text-left">
            <thead class="bg-slate-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 border-b border-slate-200">
              <tr>
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
                  <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500 font-medium">Nenhum usuário encontrado.</td>
                </tr>
              ` : users.map(u => `
                <tr class="hover:bg-slate-50 transition-colors">
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
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">${u.subject || '—'}</td>
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
  <h3 class="text-2xl font-black text-slate-900 print:mb-4">Grade de Horários</h3>
  <div class="bg-white rounded-3xl border overflow-hidden shadow-sm print:border-none print:shadow-none">
    <div class="overflow-x-auto pr-2">
      <table class="w-full text-left min-w-[700px]">
      <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
        <tr>
          <th class="px-8 py-5">Matéria</th>
          <th class="px-8 py-5">Horário / Data</th>
          <th class="px-8 py-5">Professor</th>
          <th class="px-8 py-5 text-center">Status</th>
          <th class="px-8 py-5 print:hidden"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        ${schedules.map(s => `
          <tr class="${s.status === 'vaga' ? 'bg-rose-50' : 'hover:bg-slate-50'} transition-all">
            <td class="px-8 py-5 font-bold">${s.subject}</td>
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
                  s.status === 'vaga' ? 'bg-rose-600 text-white' : 
                  s.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                  'bg-slate-100 text-slate-500'
                }">${s.status === 'vaga' ? 'AULA VAGA' : s.status}</span>
              </div>
            </td>
            <td class="px-8 py-5 text-right print:hidden">
              <div class="flex items-center justify-end gap-3">
                <button onclick="actions.showEditModalById(${s.id})" class="text-slate-300 hover:text-blue-600 transition-all cursor-pointer" title="Editar">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button onclick="actions.showDeleteModal(${s.id})" class="text-slate-300 hover:text-rose-500 transition-all cursor-pointer" title="Excluir">
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

const LabsTab = () => `
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="text-xl md:text-2xl font-black text-slate-900">Agendamento de Laboratórios</h3>
        <p class="text-xs md:text-sm text-slate-500 font-bold font-sans">Consulte a disponibilidade e reserve os laboratórios do colégio para as suas aulas.</p>
      </div>
      <button onclick="actions.showLabModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Reservar Laboratório
      </button>
    </div>

    <!-- Quick view of active labs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      ${['info', 'chem'].map(type => {
        const typeBookings = labBookings.filter(b => b.labId === type);
        return `
          <div class="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
            <h4 class="text-lg font-black mb-6 flex items-center gap-2 text-blue-600 uppercase tracking-tighter">
              <i data-lucide="${type === 'info' ? 'monitor' : 'beaker'}"></i>
              ${type === 'info' ? 'Informática' : 'Química'}
            </h4>
            <div class="space-y-4">
              ${typeBookings.slice(0, 3).map(b => `
                <div class="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
                  <div>
                    <p class="font-bold text-sm text-slate-800">${b.teacherName}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">${b.date} • ${b.startTime}${b.endTime ? ` - ${b.endTime}` : ''}</p>
                  </div>
                </div>
              `).join('') || '<p class="text-center text-slate-400 font-bold py-8 text-xs">Nenhuma reserva recente</p>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Detailed reservation schema table -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 class="text-lg font-black text-slate-800">Tabela Geral do Cronograma das Reservas</h4>
          <p class="text-xs text-slate-500 font-bold">Acompanhe todos os agendamentos cadastrados no sistema.</p>
        </div>
        ${labBookings.length > 0 ? `
          <button onclick="actions.clearAllLabBookings()" class="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all shadow-sm">
            <i data-lucide="trash-2" class="w-4 h-4"></i> Limpar Tabela
          </button>
        ` : ''}
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto pr-2">
          <table class="w-full text-left min-w-[700px]">
            <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
              <tr>
                <th class="px-8 py-5">Laboratório</th>
                <th class="px-8 py-5">Professor Responsável</th>
                <th class="px-8 py-5">Data da Reserva</th>
                <th class="px-8 py-5">Horário (Início - Fim)</th>
                <th class="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${labBookings.map(b => `
                <tr class="hover:bg-slate-50/50 transition-all">
                  <td class="px-8 py-5">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${b.labId === 'info' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}">
                      <i data-lucide="${b.labId === 'info' ? 'monitor' : 'beaker'}" class="w-3 h-3"></i>
                      ${b.labId === 'info' ? 'Informática' : 'Química'}
                    </span>
                  </td>
                  <td class="px-8 py-5 font-bold text-slate-800">${b.teacherName}</td>
                  <td class="px-8 py-5 font-medium text-slate-600">${b.date}</td>
                  <td class="px-8 py-5">
                    <span class="bg-slate-100 font-mono text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg">
                      ${b.startTime} - ${b.endTime || '---'}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-center">
                    ${(user.role === 'admin' || user.role === 'diretor' || b.teacherId === user.uid) ? `
                      <button onclick="actions.deleteLabBooking(${b.id})" class="text-slate-300 hover:text-rose-500 transition-all cursor-pointer inline-flex items-center" title="Cancelar Reserva">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    ` : `<span class="text-slate-300 text-xs">-</span>`}
                  </td>
                </tr>
              `).join('')}
              ${labBookings.length === 0 ? `
                <tr>
                  <td colspan="5" class="px-8 py-10 text-center text-slate-400 font-bold text-sm">Nenhum agendamento de laboratório cadastrado até o momento</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
`;

const AtestadosTab = () => `
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h3 class="text-xl md:text-2xl font-black text-slate-900">Atestados Médicos</h3>
      <button onclick="actions.showCertModal()" class="bg-blue-600 hover:bg-blue-700 transition-all text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md">
        <i data-lucide="plus" class="w-4 h-4"></i> Incluir Atestado Médico
      </button>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto pr-2">
        <table class="w-full text-left min-w-[700px]">
          <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
            <tr>
              <th class="px-8 py-5">Professor</th>
              <th class="px-8 py-4">Data da Falta</th>
              <th class="px-8 py-4">Motivo</th>
              <th class="px-8 py-4">Imagem</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${certificates.map(c => `
              <tr class="hover:bg-slate-50/50 transition-all">
                <td class="px-8 py-5 font-bold">${c.teacherName}</td>
                <td class="px-8 py-5 font-bold">${c.date}</td>
                <td class="px-8 py-5 text-sm">${c.reason}</td>
                <td class="px-8 py-5">
                  ${c.id ? `<button onclick="actions.viewImageById(${c.id})" class="bg-blue-50 text-blue-600 p-2 rounded-lg"><i data-lucide="eye" size="16"></i></button>` : '<span class="text-slate-300 text-[10px]">SEM IMAGEM</span>'}
                </td>
                <td class="px-8 py-5">
                  <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }">${c.status === 'approved' ? 'Aprovado' : 'Pendente'}</span>
                </td>
                <td class="px-8 py-5 text-right">
                  ${c.status === 'pending' ? `<button onclick="actions.approveCert(${c.id})" class="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Aprovar e Gerar Aula Vaga</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;



const RelatoriosTab = () => {
  // DEBUG LOGS
  console.log('[DEBUG RELATÓRIO]', {
    reportTurno,
    reportWeek,
    schedulesCount: schedules.length,
    teachersCount: teachers.length,
  });

  const weeks = getWeeksList();
  const detectedSlots = getDetectedSlots();

  let slots = [];
  if (reportTurno === 'matutino') {
    slots = ['07:30', '08:20', '09:10', '10:15', '11:00', '11:45'];
  } else if (reportTurno === 'vespertino') {
    slots = ['13:00', '13:50', '14:40', '15:45', '16:30', '17:15'];
  } else if (reportTurno === 'noturno') {
    slots = ['18:45', '19:30', '20:30', '21:15', '22:00'];
  } else {
    slots = detectedSlots.length > 0 ? detectedSlots : ['07:30', '08:20', '09:10', '10:15', '11:00', '11:45'];
  }

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
  let gridColsClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2 justify-center";
  if (reportCardSize === 'small') {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 print:grid-cols-5 print:gap-1 justify-center";
  } else if (reportCardSize === 'medium') {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2 justify-center";
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
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Turno / Períodos</label>
            <select onchange="actions.setReportTurno(this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="matutino" ${reportTurno === 'matutino' ? 'selected' : ''}>Manhã (07:30 - 11:45)</option>
              <option value="vespertino" ${reportTurno === 'vespertino' ? 'selected' : ''}>Tarde (13:00 - 17:15)</option>
              <option value="noturno" ${reportTurno === 'noturno' ? 'selected' : ''}>Noite (18:45 - 22:45)</option>
              <option value="auto" ${reportTurno === 'auto' ? 'selected' : ''}>Auto-detecção de horários</option>
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
              ${reportModel === 'turma_grid' ? 'Relatório de Turmas (Individual)' : 'Relatório de Professores (Individual)'} - ${reportWeek === 'all' ? 'Grade Geral Acumulada' : getWeekRangeLabel(reportWeek)}
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

            console.log('=== DEBUG RELATÓRIO TURMAS ===');
            console.log('schedules total:', schedules.length);
            console.log('filteredSchedules:', filteredSchedules.length);
            console.log('reportWeek:', reportWeek);
            console.log('reportTurno:', reportTurno);
            if (filteredSchedules.length > 0) {
              console.log('Sample schedule:', filteredSchedules[0]);
              console.log('classGroup values:', filteredSchedules.map(s => s.classGroup).filter(Boolean));
            }
            console.log('[DEBUG TURMAS GRID]', {
              filteredSchedulesCount: filteredSchedules.length,
              allTurmasCount: allTurmas.length,
              allTurmas,
              reportTurno,
              sampleSchedules: filteredSchedules.slice(0, 2).map(s => ({ classGroup: s.classGroup, startTime: s.startTime, status: s.status }))
            });

            // Filter turmas to only show those that have schedules for the selected turno
            const turmas = reportTurno !== 'auto'
              ? allTurmas.filter(turmaName => {
                  const turmaSchedules = filteredSchedules.filter(s => s.classGroup === turmaName);
                  const hasMatch = turmaSchedules.some(s => isSlotsMatchTurno(s.startTime, reportTurno));
                  console.log(`[DEBUG] Turma "${turmaName}": ${turmaSchedules.length} schedules, matches=${hasMatch}`);
                  return hasMatch;
                })
              : allTurmas;

            if (turmas.length === 0) {
              return `
                <div class="text-center py-20 text-slate-400 font-bold space-y-2 col-span-full">
                  <i data-lucide="info" class="w-12 h-12 mx-auto text-slate-300 col-span-full"></i>
                  <p>Nenhuma turma cadastrada ou detectada nos horários selecionados para o turno "${reportTurno === 'matutino' ? 'Manhã' : reportTurno === 'vespertino' ? 'Tarde' : 'Noite'}". Certifique-se de preencher o campo 'Turma' ao criar novos horários.</p>
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
        subtitle: "Gestão Escolar Inteligente",
        content: "Uma plataforma completa para controle de horários, laboratórios e frequência docente.",
        icon: "book-open"
    },
    {
        title: "O Problema",
        subtitle: "Desafios na Gestão de Horários",
        content: "Aulas vagas imprevistas, dificuldade no controle de laboratórios e burocracia no envio de atestados médicos.",
        icon: "alert-circle"
    },
    {
        title: "Nossa Solução",
        subtitle: "Automatização e Transparência",
        content: "Sistema centralizado onde professores confirmam presença e diretores gerenciam a grade em tempo real.",
        icon: "check-circle"
    },
    {
        title: "Funcionalidades",
        subtitle: "O que o Studia faz?",
        content: "• Grade de horários dinâmica\n• Reserva de laboratórios\n• Envio digital de atestados\n• Relatórios automáticos de frequência",
        icon: "layers"
    },
    {
        title: "Tecnologia",
        subtitle: "Stack Robusta",
        content: "Backend robusto para persistência sólida e Frontend moderno com Tailwind CSS.",
        icon: "cpu"
    }
];

const SlidesTab = () => `
    <div class="max-w-4xl mx-auto h-full flex flex-col items-center justify-center space-y-12 py-10">
        <div class="bg-white w-full aspect-video rounded-[3rem] shadow-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-all"></div>
            <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl group-hover:bg-slate-100 transition-all"></div>
            
            <div class="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl mb-10 transform group-hover:scale-110 transition-all duration-500">
                <i data-lucide="${slidesContent[currentSlide].icon}" size="48"></i>
            </div>
            
            <h1 class="text-5xl font-black text-slate-900 tracking-tighter mb-4">${slidesContent[currentSlide].title}</h1>
            <h3 class="text-xl font-bold text-blue-600 mb-8 uppercase tracking-widest text-sm">${slidesContent[currentSlide].subtitle}</h3>
            
            <div class="max-w-xl mx-auto">
                <p class="text-lg text-slate-500 font-medium leading-relaxed whitespace-pre-line">
                    ${slidesContent[currentSlide].content}
                </p>
            </div>
            
            <div class="absolute bottom-10 left-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Slide ${currentSlide + 1} de ${slidesContent.length}
            </div>
        </div>
        
        <div class="flex items-center gap-6">
            <button onclick="actions.prevSlide()" class="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" ${currentSlide === 0 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" class="text-blue-600"></i>
            </button>
            <div class="flex gap-2">
                ${slidesContent.map((_, i) => `
                    <div class="w-3 h-3 rounded-full ${i === currentSlide ? 'bg-blue-600 scale-125' : 'bg-slate-200'} transition-all duration-300"></div>
                `).join('')}
            </div>
            <button onclick="actions.nextSlide()" class="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" ${currentSlide === slidesContent.length - 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-right" class="text-blue-600"></i>
            </button>
        </div>
    </div>
`;

// --- ACTIONS ---
const TAB_ACCESS = {
  admin: ['overview', 'escolas', 'horarios', 'labs', 'atestados', 'usuarios', 'relatorios'],
  diretor: ['horarios', 'labs', 'atestados', 'usuarios', 'relatorios'],
  teacher: ['horarios', 'labs', 'atestados'],
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

  switchTabMobile(tab) {
    if (!TAB_ACCESS[user?.role]?.includes(tab)) return;
    currentTab = tab;
    mobileMenuOpen = false;
    this.init();
  },

  renderCurrentView() {
    // Re-render apenas a view atual sem recarregar dados (otimização de performance)
    try {
      if (!user) {
        render(LandingView());
      } else {
        if (user.role === 'admin') {
          render(AdminView());
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
          currentTab = 'horarios';
        }
        await this.refreshData();
        this.renderCurrentView();
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } catch (err) {
      console.error('Init error:', err);
    }
  },

  showLoginModal(mode = 'login') {
    authMode = mode;
    this.init();
  },

  hideLoginModal() {
    authMode = 'closed';
    this.init();
  },

  toggleAuthMode(mode) {
    authMode = mode;
    this.init();
  },

  submitContact(event) {
    event.preventDefault();
    const name = document.getElementById('landing-name')?.value;
    const contact = document.getElementById('landing-contact')?.value;
    const phone = document.getElementById('landing-phone')?.value;
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
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  hideCreateModal() {
    const modal = $('#create-modal');
    if (modal) modal.classList.add('hidden');
  },

  showEditModalById(id) {
    const s = schedules.find(sched => sched.id === id);
    if (!s) return;
    
    const modal = $('#edit-modal');
    if (modal) {
      $('#edit-form-id').value = s.id || '';
      $('#edit-form-subject').value = s.subject || '';
      $('#edit-form-class-group').value = s.classGroup || '';
      $('#edit-form-date').value = s.date || '';
      $('#edit-form-room').value = s.room || '';
      $('#edit-form-start').value = s.startTime || '18:45';
      $('#edit-form-end').value = s.endTime || '22:45';
      $('#edit-form-teacher').value = s.teacherId || '';
      $('#edit-form-status').value = s.status || 'pending';
      modal.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
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
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  hideLabModal() {
    const modal = $('#lab-modal');
    if (modal) modal.remove();
  },

  showCertModal() {
    const modal = $('#cert-modal');
    if (modal) modal.classList.remove('hidden');
  },

  hideCertModal() {
    const modal = $('#cert-modal');
    if (modal) {
      modal.classList.add('hidden');
      this.clearCertImage();
      const dateInput = $('#cert-date');
      if (dateInput) dateInput.value = '';
      const reasonInput = $('#cert-reason');
      if (reasonInput) reasonInput.value = '';
    }
  },

  previewCertImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewImg = $('#cert-preview-img');
        const previewContainer = $('#cert-preview-container');
        const placeholder = $('#cert-upload-placeholder');
        if (previewImg && previewContainer && placeholder) {
          previewImg.src = e.target.result;
          previewContainer.classList.remove('hidden');
          placeholder.classList.add('hidden');
        }
      };
      reader.readAsDataURL(file);
    }
  },

  clearCertImage() {
    const fileInput = $('#cert-image');
    if (fileInput) fileInput.value = '';
    const previewImg = $('#cert-preview-img');
    const previewContainer = $('#cert-preview-container');
    const placeholder = $('#cert-upload-placeholder');
    if (previewImg && previewContainer && placeholder) {
      previewImg.src = '';
      previewContainer.classList.add('hidden');
      placeholder.classList.remove('hidden');
    }
  },

  switchTab(tab) {
    if (!TAB_ACCESS[user?.role]?.includes(tab)) return;
    currentTab = tab;
    this.init();
  },

  async login() {
    const emailInput = $('#auth-email');
    const passwordInput = $('#auth-password');
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) return showDialog('Por favor, preencha todos os campos.');
    
    try {
      user = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(user));
      authMode = 'closed';
      this.init();
    } catch (err) {
      showDialog(err.message);
    }
  },

  async register() {
    const emailInput = $('#auth-email');
    const passwordInput = $('#auth-password');
    const nameInput = $('#auth-name');
    const subjectInput = $('#auth-subject');

    if (!emailInput || !passwordInput || !nameInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;
    const displayName = nameInput.value;
    const subject = subjectInput ? subjectInput.value : null;

    if (!email || !password || !displayName) return showDialog('Por favor, preencha todos os campos.');
    if (!subject) return showDialog('Por favor, informe sua matéria.');

    try {
      user = await api.post('/api/auth/register', { email, password, displayName, subject });
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
      if (user.role === 'admin') {
        const results = await Promise.allSettled([
          api.get(`/api/schedules?schoolId=${user.school_id}`),
          api.get('/api/teachers'),
          api.get('/api/users'),
          api.get('/api/labs/bookings'),
          api.get('/api/certificates'),
          api.get('/api/schools')
        ]);
        const [s, t, u, lb, c, sc] = results.map((r, i) => r.status === 'fulfilled' ? r.value : (console.error(`Data fetch #${i} failed:`, r.reason), []));
        schedules = this.normalizeSchedules(s || []);
        teachers = t || [];
        allUsers = u || [];
        schools = sc || [];
        stats = {
          total: schedules.length,
          confirmed: schedules.filter(item => item.status === 'confirmed').length,
          absent: schedules.filter(item => item.status === 'absent').length,
          pending: schedules.filter(item => item.status === 'pending').length,
        };
        labBookings = lb || [];
        certificates = c || [];
      } else if (user.role === 'diretor') {
        const results = await Promise.allSettled([
          api.get(`/api/schedules?schoolId=${user.school_id}`),
          api.get('/api/teachers'),
          api.get(`/api/users?schoolId=${user.school_id}`),
          api.get('/api/labs/bookings'),
          api.get('/api/certificates')
        ]);
        const [s, t, u, lb, c] = results.map((r, i) => r.status === 'fulfilled' ? r.value : (console.error(`Data fetch #${i} failed:`, r.reason), []));
        schedules = this.normalizeSchedules(s || []);
        teachers = t || [];
        allUsers = u || [];
        stats = {
          total: schedules.length,
          confirmed: schedules.filter(item => item.status === 'confirmed').length,
          absent: schedules.filter(item => item.status === 'absent').length,
          pending: schedules.filter(item => item.status === 'pending').length,
        };
        labBookings = lb || [];
        certificates = c || [];
      } else {
        const results = await Promise.allSettled([
          api.get(`/api/schedules?teacherId=${user.uid}`),
          api.get('/api/labs/bookings'),
          api.get('/api/certificates')
        ]);
        const [s, lb, c] = results.map((r, i) => r.status === 'fulfilled' ? r.value : (console.error(`Data fetch #${i} failed:`, r.reason), []));
        schedules = this.normalizeSchedules(s || []);
        allUsers = [];
        labBookings = lb || [];
        certificates = c || [];
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

  async deleteUser(uid, name, email) {
    if (!uid) return;
    const confirmed = await showDialog(`Deseja excluir ${name} (${email}) do sistema? Essa ação remove o acesso do usuário e sua conta de autenticação.`, { confirm: true, title: 'Excluir usuário' });
    if (!confirmed) return;

    try {
      await api.delete(`/api/users/${uid}`);
      await this.refreshData();
      this.init();
      showDialog('Usuário excluído com sucesso.');
    } catch (err) {
      showDialog(err.message || 'Erro ao excluir usuário.');
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
    const data = {
      subject: $('#form-subject').value,
      classGroup: $('#form-class-group').value,
      date: $('#form-date').value,
      room: $('#form-room').value,
      startTime: $('#form-start').value,
      endTime: $('#form-end').value,
      teacherId: teacherSelect.value,
      teacherName: teacherSelect.options[teacherSelect.selectedIndex].text,
      school_id: user.school_id
    };

    try {
      await api.post('/api/schedules', data);
      this.hideCreateModal();
      this.init();
    } catch (err) {
      showDialog('Erro ao criar horário.');
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
      startTime: $('#edit-form-start').value,
      endTime: $('#edit-form-end').value,
      teacherId: teacherSelect.value,
      teacherName: teacherSelect.options[teacherSelect.selectedIndex].text,
      status: $('#edit-form-status').value
    };
    
    try {
      await api.patch(`/api/schedules/${id}`, data);
      this.hideEditModal();
      this.init();
    } catch (err) {
      showDialog('Erro ao editar horário.');
    }
  },

  async deleteSchedule(id) {
    if (await showDialog('Deseja excluir este horário?', { confirm: true, title: 'Excluir horário' })) {
      try {
        await api.delete(`/api/schedules/${id}`);
        this.init();
      } catch (err) {
        showDialog('Erro ao excluir.');
      }
    }
  },

  async createLabBooking(e) {
    e.preventDefault();
    const data = {
      labId: $('#lab-type').value,
      teacherId: user.uid,
      teacherName: user.displayName,
      date: $('#lab-date').value,
      startTime: $('#lab-start').value,
      endTime: $('#lab-end').value
    };
    try {
      await api.post('/api/labs/bookings', data);
      this.hideLabModal();
      this.init();
    } catch (err) {
      showDialog('Erro ao reservar.');
    }
  },

  async deleteLabBooking(id) {
    if (await showDialog('Deseja realmente cancelar esta reserva de laboratório?', { confirm: true, title: 'Cancelar reserva' })) {
      try {
        await api.delete(`/api/labs/bookings/${id}`);
        await this.refreshData();
        this.init();
      } catch (err) {
        showDialog('Erro ao excluir reserva.');
      }
    }
  },

  async clearAllLabBookings() {
    if (await showDialog('Deseja realmente apagar todos os agendamentos de laboratórios? Esta ação limpará a tabela por completo.', { confirm: true, title: 'Limpar reservas' })) {
      try {
        await api.delete('/api/labs/bookings-clear-all');
        await this.refreshData();
        this.init();
      } catch (err) {
        showDialog('Erro ao apagar agendamentos da tabela.');
      }
    }
  },

  async submitCert(e) {
    e.preventDefault();
    const fileInput = $('#cert-image');
    let imageUrl = null;

    if (fileInput && fileInput.files[0]) {
        try {
            imageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(fileInput.files[0]);
            });
        } catch (err) {
            console.error("File upload error:", err);
        }
    }

    const data = {
      teacherId: user.uid,
      teacherName: user.displayName,
      date: $('#cert-date').value,
      reason: $('#cert-reason').value,
      imageUrl: imageUrl
    };

    try {
      await api.post('/api/certificates', data);
      this.hideCertModal();
      showDialog('Atestado enviado com sucesso.');
      this.init();
    } catch (err) {
      showDialog('Erro ao enviar atestado.');
    }
  },

  viewImage(url) {
    const modalId = 'image-viewer-modal';
    let modal = $(`#${modalId}`);
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="${modalId}" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onclick="this.classList.add('hidden')">
                <div class="relative bg-white p-2 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-auto" onclick="event.stopPropagation()">
                    <img id="viewer-img" src="" class="w-full h-auto rounded-xl">
                    <button class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md" onclick="document.getElementById('${modalId}').classList.add('hidden')">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            </div>
        `);
        modal = $(`#${modalId}`);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    const img = modal.querySelector('#viewer-img');
    img.src = url;
    modal.classList.remove('hidden');
  },

  async viewImageById(id) {
    try {
      const cert = await api.get(`/api/certificates/${id}/image`);
      this.viewImage(cert.imageUrl);
    } catch (error) {
      showDialog('Este certificado não possui uma imagem disponível.');
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

  async approveCert(id) {
    if (await showDialog('Deseja aprovar este atestado? Isso converterá automaticamente os horários deste dia em AULA VAGA.', { confirm: true, title: 'Aprovar atestado' })) {
      try {
        await api.patch(`/api/certificates/${id}/approve`, {});
        this.init();
      } catch (err) {
        showDialog('Erro ao aprovar atestado.');
      }
    }
  },

  setReportWeek(val) {
    reportWeek = val;
    this.renderCurrentView();
  },

  setReportTurno(val) {
    reportTurno = val;
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

    let slots = [];
    if (reportTurno === 'matutino') {
      slots = ['07:30', '08:20', '09:10', '10:15', '11:00', '11:45'];
    } else if (reportTurno === 'vespertino') {
      slots = ['13:00', '13:50', '14:40', '15:45', '16:30', '17:15'];
    } else if (reportTurno === 'noturno') {
      slots = ['18:45', '19:30', '20:30', '21:15', '22:00'];
    } else {
      const detectedSlots = getDetectedSlots();
      slots = detectedSlots.length > 0 ? detectedSlots : ['07:30', '08:20', '09:10', '10:15', '11:00', '11:45'];
    }

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
              ${isTurma ? 'Relatório de Turmas (Individual)' : 'Relatório de Professores (Individual)'} - ${reportWeek === 'all' ? 'Grade Geral Acumulada' : getWeekRangeLabel(reportWeek)}
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

  showCreateUserModal(viewerRole = 'admin') {
    const modal = document.getElementById('create-user-modal');
    if (modal) modal.classList.remove('hidden');
    createUserModalVisible = true;
  },

  hideCreateUserModal() {
    const modal = document.getElementById('create-user-modal');
    if (modal) modal.classList.add('hidden');
    createUserModalVisible = false;
    // Clear form fields
    document.getElementById('user-displayname')?.value && (document.getElementById('user-displayname').value = '');
    document.getElementById('user-email')?.value && (document.getElementById('user-email').value = '');
    document.getElementById('user-password')?.value && (document.getElementById('user-password').value = '');
    document.getElementById('user-subject')?.value && (document.getElementById('user-subject').value = '');
    document.getElementById('user-role')?.value && (document.getElementById('user-role').value = '');
  },

  async createUser(event) {
    if (event) event.preventDefault();

    const displayName = document.getElementById('user-displayname')?.value?.trim();
    const email = document.getElementById('user-email')?.value?.trim();
    const password = document.getElementById('user-password')?.value;
    const subject = document.getElementById('user-subject')?.value?.trim();
    const role = document.getElementById('user-role')?.value;

    // Validações básicas
    if (!displayName) return showDialog('Nome é obrigatório.');
    if (!email) return showDialog('E-mail é obrigatório.');
    if (!password) return showDialog('Senha é obrigatória.');
    if (password.length < 8) return showDialog('Senha deve ter no mínimo 8 caracteres.');
    if (!role) return showDialog('Cargo é obrigatório.');

    // Validação de e-mail simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showDialog('E-mail inválido.');

    try {
      const payload = {
        displayName,
        email,
        password,
        role,
        userRole: user?.role,
        userSchoolId: user?.school_id
      };
      if (subject) payload.subject = subject;

      const response = await api.post('/api/users/create', payload);
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