import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const DEFAULT_SCHOOL_ID = '8aa1d331-e470-4191-85d7-1310bc767a36';

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error('Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.');
}

// A chave service role fica somente no servidor; o navegador usa a API Express.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
  global: { headers: { 'X-Client-Info': 'supabase-js-server' } }
});
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
  global: { headers: { 'X-Client-Info': 'supabase-js-auth' } }
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Mapeamento de colunas do banco para camelCase
const columnMap: {[key: string]: string} = {
  starttime: 'startTime',
  endtime: 'endTime',
  teacherid: 'teacherId',
  teachername: 'teacherName',
  classgroup: 'classGroup',
  labid: 'labId',
  displayname: 'displayName',
  school_id: 'school_id',
  createdat: 'createdAt',
  updatedat: 'updatedAt'
};

const transformKeys = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      const newKey = columnMap[key] || key;
      acc[newKey] = obj[key];
      return acc;
    }, {});
  }
  return obj;
};

// Security: Sanitização de entrada
const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str.trim().replace(/[<>\"']/g, '').substring(0, 255);
};

const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

const normalizeSubjects = (subject: unknown): string[] => {
  const entries = Array.isArray(subject) ? subject : [subject];
  const subjects = entries
    .filter((entry): entry is string => typeof entry === 'string')
    .flatMap(entry => entry.split(/[,;\n]/))
    .map(entry => sanitizeString(entry))
    .filter(Boolean);
  return [...new Map(subjects.map(entry => [entry.toLocaleLowerCase(), entry])).values()];
};

const getOrCreateSchoolSubject = async (schoolId: string, subject: string) => {
  const { data: existingSubjects, error: findError } = await supabase
    .from('school_subjects')
    .select('id,subject')
    .eq('school_id', schoolId);
  if (findError) return { data: null, error: findError };

  const existing = (existingSubjects || []).find(item => item.subject.toLocaleLowerCase() === subject.toLocaleLowerCase());
  if (existing) return { data: existing, error: null };

  const { data, error } = await supabase
    .from('school_subjects')
    .insert({ school_id: schoolId, subject })
    .select('id,subject')
    .single();
  return { data, error };
};

const saveTeacherSubjects = async (teacherId: string, schoolId: string | null, subjects: string[]) => {
  if (subjects.length === 0) return null;
  if (!schoolId) return new Error('O professor precisa estar associado a uma escola para cadastrar matérias.');

  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id')
    .eq('id', schoolId)
    .maybeSingle();

  if (schoolError || !school) {
    return new Error('Escola inválida. Crie ou selecione uma escola antes de cadastrar matérias.');
  }

  for (const subject of subjects) {
    const { data: catalogSubject, error: subjectError } = await getOrCreateSchoolSubject(schoolId, subject);
    if (subjectError || !catalogSubject) return subjectError || new Error('Não foi possível cadastrar a matéria.');

    const { error } = await supabase
      .from('teacher_subjects')
      .upsert(
        { teacher_id: teacherId, subject_id: catalogSubject.id },
        { onConflict: 'teacher_id,subject_id', ignoreDuplicates: true }
      );
    if (error) return error;
  }
  return null;
};

// Security: Rate-limiting em-memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
};

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json({ limit: '10mb' }));

app.use('/api', (req, res, next) => {
  res.once('finish', () => {
    const route = `${req.baseUrl}${req.route?.path || req.path}`.slice(0, 255);
    const method = req.method;

    if (res.statusCode >= 500) {
      void supabase.from('dev_error_logs').insert({
        method,
        route,
        status_code: res.statusCode
      }).then(({ error }) => {
        if (error) console.error('[DEV_LOG] Could not store API error:', error);
      }, error => console.error('[DEV_LOG] Could not store API error:', error));
    }

    const isDataExport = method === 'GET' && req.path.startsWith('/api/dev/export/');
    if ((!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !isDataExport) || res.statusCode < 200 || res.statusCode >= 300) return;
    const authorization = req.headers.authorization as string | undefined;
    const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!accessToken) return;

    void (async () => {
      const { data: authData, error: authError } = await supabaseAuth.auth.getUser(accessToken);
      if (authError || !authData.user) return;

      const actor = await getUserFromDB(authData.user.id);
      if (!actor) return;

      const { error } = await supabase.from('dev_audit_logs').insert({
        actor_uid: actor.uid,
        actor_role: actor.role,
        method,
        route,
        status_code: res.statusCode
      });
      if (error) console.error('[DEV_AUDIT] Could not store API activity:', error);
    })().catch(error => console.error('[DEV_AUDIT] Could not store API activity:', error));
  });
  next();
});

app.post('/api/auth/register', async (req, res) => {
  try {
    let { email, password, displayName, subject, school_id } = req.body;

    // Sanitizar entrada
    email = sanitizeEmail(email);
    displayName = sanitizeString(displayName);
    const subjects = normalizeSubjects(subject);
    subject = subjects.join(', ');

    // Rate-limit: máx 3 registros por minuto por IP
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`register:${ip}`, 3, 60000)) {
      return res.status(429).json({ error: 'Muitos registros. Tente novamente mais tarde.' });
    }

    // Validação de campos obrigatórios
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { displayName, role: 'teacher', subject },
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return res.status(authError?.status === 422 ? 400 : 500).json({
        error: authError?.status === 422 ? 'Email já cadastrado' : `Erro ao registrar: ${authError?.message || 'Desconhecido'}`
      });
    }

    const uid = authData.user.id;
    const finalRole = 'teacher';
    const finalSchoolId = school_id || DEFAULT_SCHOOL_ID;

    console.log('[REGISTER] Step 2: Creating user (without school_id)...');

    // Insert SEM school_id para evitar cache
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        uid,
        email,
        displayname: displayName,
        role: finalRole,
        subject: subject || null
      })
    });

    const insertText = await insertResponse.text();
    console.log('[REGISTER] Insert status:', insertResponse.status, 'body:', insertText);

    if (!insertResponse.ok) {
      console.error('[REGISTER] Insert failed');
      await supabase.auth.admin.deleteUser(uid);
      return res.status(500).json({ error: `Erro ao registrar: ${insertText}` });
    }

    console.log('[REGISTER] Step 3: Updating with school_id via client...');
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({ school_id: finalSchoolId })
      .eq('uid', uid)
      .select('uid,email,displayname,role,subject,school_id')
      .single();

    console.log('[REGISTER] Update result:', { userData, updateError });

    if (updateError) {
      console.error('[REGISTER] Update error:', updateError);
      return res.status(500).json({ error: `Erro ao atualizar escola: ${updateError.message}` });
    }

    const subjectError = await saveTeacherSubjects(uid, finalSchoolId, subjects);
    if (subjectError) {
      console.error('[REGISTER] Could not save teacher subjects:', subjectError);
      const friendlyMessage = subjectError.message?.includes('foreign key') || subjectError.message?.includes('school_id')
        ? 'Escola inválida. Crie ou selecione uma escola antes de continuar.'
        : `Erro ao salvar matérias: ${subjectError.message}`;
      return res.status(400).json({ error: friendlyMessage });
    }

    const { data: sessionData, error: sessionError } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (sessionError || !sessionData.session) {
      console.error('[REGISTER] Could not create authenticated session:', sessionError);
      return res.status(500).json({ error: 'Conta criada, mas não foi possível iniciar a sessão. Faça login.' });
    }

    res.json({
      ...transformKeys(userData),
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno ao registrar' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  let { email, password } = req.body;
  email = sanitizeEmail(email);

  // Rate-limit: máx 5 tentativas por minuto por email
  if (!checkRateLimit(`login:${email}`, 5, 60000)) {
    return res.status(429).json({ error: 'Muitas tentativas de login. Tente novamente em 1 minuto.' });
  }

  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (authError || !authData.user) return res.status(401).json({ error: 'Credenciais inválidas' });

  // Buscar usuário com SQL direto (evita cache do REST API)
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('uid,email,displayname,role,subject,school_id')
      .eq('uid', authData.user.id)
      .maybeSingle();

    if (userError) {
      console.log('[LOGIN] Query error (retrying with RPC):', userError);
      // Fallback: usar RPC ou SQL direto
      throw new Error(userError.message);
    }

    if (!userData) {
      console.log('[LOGIN] User not found in DB');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('[LOGIN] User found, role:', userData.role);
    res.json({
      ...transformKeys(userData),
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token
    });
  } catch (err) {
    console.error('[LOGIN] Fallback to fetch:', err.message);
    // Fallback: usar fetch direto sem select=*
    const response = await fetch(`${supabaseUrl}/rest/v1/users?uid=eq.${authData.user.id}`, {
      headers: {
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    if (!response.ok) {
      console.error('[LOGIN] Fallback fetch failed:', response.status);
      return res.status(500).json({ error: 'Erro ao realizar login' });
    }

    const data = await response.json();
    if (!data || data.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });
    res.json({
      ...transformKeys(data[0]),
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token
    });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (typeof refreshToken !== 'string' || !refreshToken) {
    return res.status(400).json({ error: 'Token de atualização obrigatório' });
  }

  const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token
  });
});

app.post('/api/users/create', async (req, res) => {
  let { email, password, displayName, subject, role, schoolId } = req.body;
  const creator = await validateUserPermission(req);
  if (!creator) return res.status(401).json({ error: 'Não autorizado' });
  const { role: userRole, school_id: userSchoolId } = creator;

  // Sanitizar entrada
  email = sanitizeEmail(email);
  displayName = sanitizeString(displayName);
  const subjects = normalizeSubjects(subject);
  subject = subjects.join(', ');
  role = sanitizeString(role);

  // Rate-limit: máx 10 criações por minuto por IP
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(`createUser:${ip}`, 10, 60000)) {
    return res.status(429).json({ error: 'Muitas criações de usuário. Tente novamente mais tarde.' });
  }

  if (!email || !password || !displayName || !role) {
    return res.status(400).json({ error: 'Email, senha, nome e cargo são obrigatórios' });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Cargo inválido' });
  }

  // VALIDAÇÕES DE PERMISSÃO
  // Desenvolvedor pode criar qualquer perfil.
  if (userRole === 'dev') {
    // OK - criar qualquer role
  }
  // Diretor pode criar diretor/professor da mesma escola
  else if (userRole === 'diretor') {
    if (role === 'dev') {
      return res.status(403).json({ error: 'Diretores não podem criar desenvolvedores' });
    }
    if (schoolId && schoolId !== userSchoolId) {
      return res.status(403).json({ error: 'Diretor só pode criar usuários da mesma escola' });
    }
  }
  // Professor não pode criar ninguém
  else {
    return res.status(403).json({ error: 'Você não tem permissão para criar usuários' });
  }

  try {
    const finalSchoolId = userRole === 'diretor' ? userSchoolId : (schoolId || userSchoolId);
    if (!finalSchoolId) {
      return res.status(400).json({ error: 'Selecione uma escola válida para este usuário.' });
    }

    const { data: validSchool, error: schoolValidationError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', finalSchoolId)
      .maybeSingle();
    if (schoolValidationError || !validSchool) {
      return res.status(400).json({ error: 'A escola selecionada não foi encontrada. Escolha uma escola cadastrada.' });
    }

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { displayName, role, subject }
    });

    if (authError) {
      console.error('[CREATE_USER] Auth error:', authError);
      return res.status(400).json({
        error: authError.message === 'A user with this email address has already been registered'
          ? 'Email já cadastrado'
          : `Erro ao criar usuário: ${authError.message}`
      });
    }

    const uid = authData.user.id;

    const { data: userData, error: insertError } = await supabase
      .from('users')
      .insert({
        uid,
        email,
        displayname: displayName,
        role,
        subject: subject || null,
        school_id: finalSchoolId
      })
      .select('uid,email,displayname,role,subject,school_id')
      .single();

    if (insertError) {
      console.error('[CREATE_USER] Profile insert failed:', insertError);
      await supabase.auth.admin.deleteUser(uid);
      return res.status(500).json({ error: 'Não foi possível criar o perfil associado à escola. Nenhuma conta foi criada.' });
    }

    if (role === 'teacher') {
      const subjectError = role === 'teacher'
        ? await saveTeacherSubjects(uid, finalSchoolId, subjects)
        : null;
      if (subjectError) {
        console.error('[CREATE_USER] Could not save teacher subjects:', subjectError);
        const friendlyMessage = subjectError.message?.includes('Escola inválida') || subjectError.message?.includes('school_id')
          ? 'Escola inválida. Crie ou selecione uma escola antes de continuar.'
          : `Usuário criado, mas não foi possível salvar as matérias: ${subjectError.message}`;
        return res.status(400).json({ error: friendlyMessage });
      }
    }

    res.json(transformKeys(userData));
  } catch (err) {
    console.error('[CREATE_USER] Error:', err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.get('/api/schedules', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  let query = supabase.from('schedules').select('*');

  if (userInfo.role === 'teacher') {
    if (req.query.teacherId && req.query.teacherId !== userInfo.uid) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    query = query.eq('teacherid', userInfo.uid);
  } else if (userInfo.role === 'diretor') {
    if (req.query.schoolId && req.query.schoolId !== userInfo.school_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    query = query.eq('school_id', userInfo.school_id);
  } else if (req.query.teacherId) {
    query = query.eq('teacherid', req.query.teacherId);
  } else if (req.query.schoolId) {
    query = query.eq('school_id', req.query.schoolId);
  }

  query = query.order('date', { ascending: true }).order('starttime', { ascending: true });
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Erro ao buscar horários' });
  res.json(transformKeys(data));
});

app.post('/api/schedules', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;
  const { date, startTime, endTime, subject, room, teacherId, teacherName, classGroup, school_id } = req.body;
  if (userInfo.role === 'diretor' && school_id && school_id !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'diretor') {
    const teacher = teacherId ? await getUserFromDB(teacherId) : null;
    if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
      return res.status(403).json({ error: 'O horário deve pertencer a um professor da sua escola' });
    }
  }
  const { data, error } = await supabase.from('schedules').insert({
    date,
    starttime: startTime,
    endtime: endTime,
    subject,
    room,
    teacherid: teacherId,
    teachername: teacherName,
    classgroup: classGroup,
    status: 'pending',
    school_id: userInfo.role === 'diretor' ? userInfo.school_id : (school_id || DEFAULT_SCHOOL_ID)
  }).select('id').single();
  if (error) return res.status(500).json({ error: 'Erro ao criar horário' });
  res.json({ id: data.id, status: 'success' });
});

app.patch('/api/schedules/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;
  if (userInfo.role === 'diretor') {
    const { data: schedule, error: findError } = await supabase.from('schedules').select('school_id').eq('id', req.params.id).maybeSingle();
    if (findError) return res.status(500).json({ error: 'Erro ao verificar horário' });
    if (!schedule || schedule.school_id !== userInfo.school_id) return res.status(403).json({ error: 'Acesso negado' });
    if (req.body.teacherId) {
      const teacher = await getUserFromDB(req.body.teacherId);
      if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
        return res.status(403).json({ error: 'O horário deve pertencer a um professor da sua escola' });
      }
    }
  }
  const { status, date, startTime, endTime, subject, room, teacherId, teacherName, classGroup } = req.body;
  const onlyStatus = status !== undefined && date === undefined && startTime === undefined && endTime === undefined && subject === undefined && room === undefined && teacherId === undefined && teacherName === undefined && classGroup === undefined;
  const updates = onlyStatus
    ? { status, updatedAt: new Date().toISOString() }
    : {
        status,
        date,
        starttime: startTime,
        endtime: endTime,
        subject,
        room,
        teacherid: teacherId,
        teachername: teacherName,
        classgroup: classGroup,
        updatedAt: new Date().toISOString()
      };
  const { error } = await supabase.from('schedules').update(updates).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erro ao atualizar horário' });
  res.json({ status: 'success' });
});

app.delete('/api/schedules/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;
  if (userInfo.role === 'diretor') {
    const { data: schedule, error: findError } = await supabase.from('schedules').select('school_id').eq('id', req.params.id).maybeSingle();
    if (findError) return res.status(500).json({ error: 'Erro ao verificar horário' });
    if (!schedule || schedule.school_id !== userInfo.school_id) return res.status(403).json({ error: 'Acesso negado' });
  }
  const { error } = await supabase.from('schedules').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erro ao excluir horário' });
  res.json({ status: 'success' });
});

app.get('/api/stats', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;
  const { data, error } = await supabase.from('schedules').select('status');
  if (error) return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  res.json({ total: data.length, confirmed: data.filter(item => item.status === 'confirmed').length, absent: data.filter(item => item.status === 'absent').length, pending: data.filter(item => item.status === 'pending').length });
});

app.get('/api/teachers', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;

  let query = supabase.from('users').select('*').eq('role', 'teacher');

  // Diretor só vê professores da sua escola
  if (userInfo.role === 'diretor') {
    query = query.eq('school_id', userInfo.school_id);
  }

  query = query.order('displayname', { ascending: true });
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Erro ao buscar professores' });
  res.json(transformKeys(data));
});

app.get('/api/users', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;

  let query = supabase.from('users').select('*').order('displayname', { ascending: true });

  if (userInfo.role === 'diretor') {
    if (req.query.schoolId && req.query.schoolId !== userInfo.school_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    query = query.eq('school_id', userInfo.school_id);
    query = query.neq('role', 'dev');
  } else if (req.query.schoolId) {
    query = query.eq('school_id', req.query.schoolId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Erro ao buscar usuários' });
  res.json(transformKeys(data));
});

app.patch('/api/users/:uid/school', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;

  const schoolId = typeof req.body.schoolId === 'string' ? req.body.schoolId : '';
  if (!schoolId) return res.status(400).json({ error: 'Selecione uma escola.' });

  const { data: target, error: targetError } = await supabase
    .from('users')
    .select('uid,role')
    .eq('uid', req.params.uid)
    .maybeSingle();
  if (targetError) return res.status(500).json({ error: 'Erro ao verificar usuário' });
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (target.role !== 'teacher') return res.status(400).json({ error: 'Esta ação só pode associar professores a uma escola.' });

  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id')
    .eq('id', schoolId)
    .maybeSingle();
  if (schoolError || !school) return res.status(400).json({ error: 'A escola selecionada não foi encontrada.' });

  const { data, error } = await supabase
    .from('users')
    .update({ school_id: schoolId })
    .eq('uid', req.params.uid)
    .select('uid,email,displayname,role,school_id')
    .single();
  if (error) return res.status(500).json({ error: 'Não foi possível associar o professor à escola.' });
  res.json(transformKeys(data));
});

app.delete('/api/users/:uid', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;
  if (req.params.uid === userInfo.uid) return res.status(400).json({ error: 'Não é possível excluir sua própria conta' });

  const uid = req.params.uid;
  const { data: target, error: targetError } = await supabase
    .from('users')
    .select('uid,school_id,role')
    .eq('uid', uid)
    .maybeSingle();
  if (targetError) return res.status(500).json({ error: 'Erro ao verificar usuário' });
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (userInfo.role === 'diretor' && (target.school_id !== userInfo.school_id || target.role === 'dev')) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { data: authData, error: authLookupError } = await supabase.auth.admin.getUserById(uid);
  const authUserNotFound = authLookupError?.status === 404 || authLookupError?.code === 'user_not_found';
  if (authLookupError && !authUserNotFound) {
    return res.status(500).json({ error: 'Erro ao remover usuário do sistema de autenticação' });
  }
  if (authData.user) {
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(uid);
    if (authDeleteError) {
      return res.status(500).json({ error: 'Erro ao remover usuário do sistema de autenticação' });
    }
  } else if (!authUserNotFound) {
    return res.status(500).json({ error: 'Não foi possível confirmar a conta no sistema de autenticação' });
  }

  const { error: dbError } = await supabase.from('users').delete().eq('uid', uid);
  if (dbError) {
    return res.status(500).json({ error: 'Erro ao remover usuário do banco de dados' });
  }

  res.json({ status: 'success' });
});

// Server-side permission validation
type AppRole = 'teacher' | 'diretor' | 'dev';

interface UserInfo {
  uid: string;
  role: AppRole;
  school_id?: string;
}

const VALID_ROLES: AppRole[] = ['teacher', 'diretor', 'dev'];

const getUserFromDB = async (uid: string): Promise<UserInfo | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('uid,role,school_id')
    .eq('uid', uid)
    .maybeSingle();

  if (error) {
    console.error('[PERMISSION] Error fetching user:', error);
    return null;
  }

  return data as UserInfo | null;
};

const validateUserPermission = async (req: any, requiredRole?: string[]): Promise<UserInfo | null> => {
  const authorization = req.headers.authorization as string | undefined;
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!accessToken) return null;

  const { data: authData, error: authError } = await supabaseAuth.auth.getUser(accessToken);
  if (authError || !authData.user) return null;

  const userInfo = await getUserFromDB(authData.user.id);

  if (!userInfo) return null;

  if (requiredRole && !requiredRole.includes(userInfo.role)) return null;

  return userInfo;
};

const requireRole = async (req: any, res: any, allowedRoles: AppRole[]): Promise<UserInfo | null> => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) {
    res.status(401).json({ error: 'Não autorizado' });
    return null;
  }
  if (!allowedRoles.includes(userInfo.role)) {
    res.status(403).json({ error: 'Acesso negado' });
    return null;
  }
  return userInfo;
};

app.get('/api/dev/diagnostics', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;

  const tables = ['users', 'schools', 'schedules', 'lab_bookings', 'certificates', 'school_subjects', 'teacher_subjects'] as const;
  const probes = await Promise.all(tables.map(async table => {
    const startedAt = Date.now();
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return {
      table,
      ok: !error,
      records: error ? null : count,
      latencyMs: Date.now() - startedAt
    };
  }));

  const integrityChecks = await Promise.all([
    supabase.from('users').select('uid', { count: 'exact', head: true }).eq('role', 'teacher').is('school_id', null),
    supabase.from('schedules').select('id', { count: 'exact', head: true }).is('school_id', null)
  ]);
  const dbProbe = probes.find(probe => probe.table === 'users');

  res.json({
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    api: { ok: true },
    database: { ok: dbProbe?.ok || false, latencyMs: dbProbe?.latencyMs ?? null },
    probes,
    integrity: [
      { name: 'Professores sem escola', count: integrityChecks[0].error ? null : integrityChecks[0].count, ok: !integrityChecks[0].error },
      { name: 'Horários sem escola', count: integrityChecks[1].error ? null : integrityChecks[1].count, ok: !integrityChecks[1].error }
    ]
  });
});

app.get('/api/dev/logs', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;

  const { data, error } = await supabase
    .from('dev_error_logs')
    .select('id,created_at,method,route,status_code')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: 'Não foi possível carregar os logs do sistema.' });
  res.json(data || []);
});

app.get('/api/dev/audit', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;

  const { data, error } = await supabase
    .from('dev_audit_logs')
    .select('id,created_at,actor_uid,actor_role,method,route,status_code')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: 'Não foi possível carregar a auditoria.' });
  res.json(data || []);
});

app.get('/api/dev/export/:resource', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;

  const exportFields = {
    users: 'uid,email,displayname,role,school_id,subject',
    schools: 'id,name,createdat',
    schedules: 'id,date,starttime,endtime,subject,room,teacherid,teachername,classgroup,status,school_id',
    lab_bookings: 'id,labid,teacherid,teachername,date,starttime,endtime',
    certificates: 'id,teacherid,teachername,date,reason,status,createdat',
    school_subjects: 'id,school_id,subject',
    teacher_subjects: 'id,teacher_id,subject_id'
  } as const;
  const resource = req.params.resource as keyof typeof exportFields;
  if (!Object.prototype.hasOwnProperty.call(exportFields, resource)) {
    return res.status(400).json({ error: 'Tipo de exportação inválido.' });
  }
  const fields = exportFields[resource];
  const { count, error: countError } = await supabase
    .from(resource)
    .select(fields, { count: 'exact', head: true });
  if (countError) return res.status(500).json({ error: 'Não foi possível exportar esta tabela.' });
  if ((count || 0) > 5000) {
    return res.status(413).json({ error: 'A tabela excede o limite de 5.000 registros por exportação.' });
  }

  const rows = [];
  for (let offset = 0; offset < (count || 0); offset += 1000) {
    const { data, error } = await supabase
      .from(resource)
      .select(fields)
      .range(offset, Math.min(offset + 999, (count || 0) - 1));
    if (error) return res.status(500).json({ error: 'Não foi possível exportar esta tabela.' });
    rows.push(...(data || []));
  }
  res.json({ resource, count: rows.length, rows: transformKeys(rows) });
});

app.patch('/api/users/:uid/role', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  if (req.params.uid === userInfo.uid) return res.status(400).json({ error: 'Não é possível alterar seu próprio perfil' });

  const { role } = req.body;
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido' });
  }

  const target = await getUserFromDB(req.params.uid);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (userInfo.role === 'diretor') {
    if (target.school_id !== userInfo.school_id || target.role === 'dev' || role === 'dev') {
      return res.status(403).json({ error: 'Diretores só podem gerenciar perfis da própria escola' });
    }
  } else if (userInfo.role !== 'dev') {
    return res.status(403).json({ error: 'Professores não podem mudar perfis' });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('uid', req.params.uid)
    .select('uid,email,displayname,role,subject')
    .single();

  if (error) return res.status(500).json({ error: 'Erro ao atualizar perfil do usuário' });
  res.json(transformKeys(data));
});

app.get('/api/labs/bookings', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  let query = supabase.from('lab_bookings').select('*');
  if (userInfo.role === 'teacher') query = query.eq('teacherid', userInfo.uid);
  if (userInfo.role === 'diretor') {
    const { data: schoolTeachers, error: teacherError } = await supabase.from('users').select('uid').eq('role', 'teacher').eq('school_id', userInfo.school_id);
    if (teacherError) return res.status(500).json({ error: 'Erro ao buscar professores da escola' });
    query = query.in('teacherid', (schoolTeachers || []).map(teacher => teacher.uid));
  }
  const { data, error } = await query.order('date', { ascending: false }).order('starttime', { ascending: true });
  if (error) return res.status(500).json({ error: 'Erro ao buscar reservas' });
  res.json(transformKeys(data));
});

app.post('/api/labs/bookings', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  const booking = req.body;
  if (userInfo.role === 'teacher' && booking.teacherId !== userInfo.uid && booking.teacherid !== userInfo.uid) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'diretor') {
    const teacherId = booking.teacherId || booking.teacherid;
    const teacher = teacherId ? await getUserFromDB(teacherId) : null;
    if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
      return res.status(403).json({ error: 'A reserva deve pertencer a um professor da sua escola' });
    }
  }
  const { error } = await supabase.from('lab_bookings').insert(booking);
  if (error) return res.status(500).json({ error: 'Erro ao criar reserva' });
  res.json({ status: 'success' });
});

app.delete('/api/labs/bookings/:id', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  if (userInfo.role === 'teacher') {
    const { data: booking, error: findError } = await supabase.from('lab_bookings').select('teacherid').eq('id', req.params.id).maybeSingle();
    if (findError) return res.status(500).json({ error: 'Erro ao verificar reserva' });
    if (!booking || booking.teacherid !== userInfo.uid) return res.status(403).json({ error: 'Acesso negado' });
  } else if (userInfo.role === 'diretor') {
    const { data: booking, error: findError } = await supabase.from('lab_bookings').select('teacherid').eq('id', req.params.id).maybeSingle();
    if (findError) return res.status(500).json({ error: 'Erro ao verificar reserva' });
    const teacher = booking?.teacherid ? await getUserFromDB(booking.teacherid) : null;
    if (!teacher || teacher.school_id !== userInfo.school_id) return res.status(403).json({ error: 'Acesso negado' });
  }
  const { error } = await supabase.from('lab_bookings').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erro ao excluir reserva' });
  res.json({ status: 'success' });
});

app.delete('/api/labs/bookings-clear-all', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;
  const { error } = await supabase.from('lab_bookings').delete().not('id', 'is', null);
  if (error) return res.status(500).json({ error: 'Erro ao limpar reservas' });
  res.json({ status: 'success' });
});

app.get('/api/certificates', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  let query = supabase.from('certificates').select('*');
  if (userInfo.role === 'teacher') query = query.eq('teacherid', userInfo.uid);
  if (userInfo.role === 'diretor') {
    const { data: schoolTeachers, error: teacherError } = await supabase.from('users').select('uid').eq('role', 'teacher').eq('school_id', userInfo.school_id);
    if (teacherError) return res.status(500).json({ error: 'Erro ao buscar professores da escola' });
    query = query.in('teacherid', (schoolTeachers || []).map(teacher => teacher.uid));
  }
  const { data, error } = await query.order('createdat', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erro ao buscar certificados' });
  res.json(transformKeys(data));
});

app.get('/api/certificates/:id/image', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  const { data, error } = await supabase.from('certificates').select('teacherid,imageUrl').eq('id', req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: 'Erro ao buscar imagem' });
  if (!data) return res.status(404).json({ error: 'Atestado não encontrado' });
  if (userInfo.role === 'teacher' || userInfo.role === 'diretor') {
    if (userInfo.role === 'teacher' && data.teacherid !== userInfo.uid) return res.status(403).json({ error: 'Acesso negado' });
    if (userInfo.role === 'diretor') {
      const teacher = data.teacherid ? await getUserFromDB(data.teacherid) : null;
      if (!teacher || teacher.school_id !== userInfo.school_id) return res.status(403).json({ error: 'Acesso negado' });
    }
  }
  if (!data.imageUrl) return res.status(404).json({ error: 'Imagem não encontrada' });
  res.json({ imageUrl: data.imageUrl });
});

app.post('/api/certificates', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  const certificate = req.body;
  const teacherId = certificate.teacherId || certificate.teacherid;
  if (userInfo.role === 'teacher' && teacherId !== userInfo.uid) return res.status(403).json({ error: 'Acesso negado' });
  if (userInfo.role === 'diretor') {
    const teacher = teacherId ? await getUserFromDB(teacherId) : null;
    if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
      return res.status(403).json({ error: 'O atestado deve pertencer a um professor da sua escola' });
    }
  }
  const { error } = await supabase.from('certificates').insert(req.body);
  if (error) return res.status(500).json({ error: 'Erro ao criar certificado' });
  res.json({ status: 'success' });
});

app.patch('/api/certificates/:id/approve', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;
  const { data: certificate, error: findError } = await supabase.from('certificates').select('teacherid,date').eq('id', req.params.id).maybeSingle();
  if (findError) return res.status(500).json({ error: 'Erro ao buscar certificado' });
  if (!certificate) return res.status(404).json({ error: 'Certificado não encontrado' });
  if (userInfo.role === 'diretor') {
    const teacher = await getUserFromDB(certificate.teacherid);
    if (!teacher || teacher.school_id !== userInfo.school_id) return res.status(403).json({ error: 'Acesso negado' });
  }

  // Aprovar atestado
  const { error: certError } = await supabase.from('certificates').update({ status: 'approved' }).eq('id', req.params.id);
  if (certError) return res.status(500).json({ error: 'Erro ao aprovar certificado' });

  // Buscar aula do professor no dia do atestado
  let teacherScheduleQuery = supabase
    .from('schedules')
    .select('*')
    .eq('teacherid', certificate.teacherid)
    .eq('date', certificate.date);
  if (userInfo.role === 'diretor') teacherScheduleQuery = teacherScheduleQuery.eq('school_id', userInfo.school_id);
  const { data: teacherSchedule, error: schedFindError } = await teacherScheduleQuery.single();

  if (schedFindError && schedFindError.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Erro ao buscar aula do professor' });
  }

  if (teacherSchedule) {
    // Buscar último horário do dia (maior startTime)
    let lastScheduleQuery = supabase
      .from('schedules')
      .select('*')
      .eq('date', certificate.date)
      .order('starttime', { ascending: false })
      .limit(1);
    if (userInfo.role === 'diretor') lastScheduleQuery = lastScheduleQuery.eq('school_id', userInfo.school_id);
    const { data: lastSchedule, error: lastError } = await lastScheduleQuery.single();

    if (!lastError && lastSchedule && lastSchedule.id !== teacherSchedule.id) {
      // Fazer swap: trocar aulas de lugar
      const tempTeacher = teacherSchedule.teacherid;
      const tempSubject = teacherSchedule.subject;
      const tempClassGroup = teacherSchedule.classgroup;

      // Atualizar aula do professor com dados da última aula
      await supabase.from('schedules').update({
        teacherid: lastSchedule.teacherid,
        subject: lastSchedule.subject,
        classgroup: lastSchedule.classgroup,
      }).eq('id', teacherSchedule.id);

      // Atualizar última aula com dados do professor
      await supabase.from('schedules').update({
        teacherid: tempTeacher,
        subject: tempSubject,
        classgroup: tempClassGroup,
        status: 'vaga',
      }).eq('id', lastSchedule.id);
    } else {
      // Se não houver outra aula ou é a única, apenas marcar como vaga
      await supabase.from('schedules').update({ status: 'vaga' }).eq('id', teacherSchedule.id);
    }
  }

  res.json({ status: 'success' });
});

// ========== SCHOOLS (Multi-tenant) ==========

app.get('/api/schools', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;
  const { data, error } = await supabase.from('schools').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ error: 'Erro ao buscar escolas' });
  res.json(data);
});

app.post('/api/schools', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;
  const { name, createdBy } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da escola é obrigatório' });
  const { data, error } = await supabase.from('schools').insert({ name, createdBy }).select('*').single();
  if (error) return res.status(500).json({ error: `Erro ao criar escola: ${error.message}` });
  res.json(data);
});

app.patch('/api/schools/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  const { data, error } = await supabase.from('schools').update({ name }).eq('id', req.params.id).select('*').single();
  if (error) return res.status(500).json({ error: 'Erro ao atualizar escola' });
  res.json(data);
});

app.delete('/api/schools/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev']);
  if (!userInfo) return;
  const { error } = await supabase.from('schools').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erro ao deletar escola' });
  res.json({ status: 'success' });
});

// School subject catalog and teacher assignments
app.get('/api/school-subjects', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor', 'teacher']);
  if (!userInfo) return;

  const requestedSchoolId = typeof req.query.schoolId === 'string' ? req.query.schoolId : undefined;
  if (userInfo.role === 'diretor' && !userInfo.school_id) {
    return res.status(403).json({ error: 'Sua conta não está associada a uma escola' });
  }
  if (userInfo.role === 'teacher' && !userInfo.school_id) {
    return res.status(403).json({ error: 'Sua conta não está associada a uma escola' });
  }
  if (userInfo.role === 'diretor' && requestedSchoolId && requestedSchoolId !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'teacher' && requestedSchoolId && requestedSchoolId !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  let query = supabase.from('school_subjects').select('id,school_id,subject').order('subject', { ascending: true });
  const schoolId = userInfo.role === 'teacher' ? userInfo.school_id : (userInfo.role === 'diretor' ? userInfo.school_id : requestedSchoolId);
  if (schoolId) query = query.eq('school_id', schoolId);
  const { data: subjects, error } = await query;
  if (error) return res.status(500).json({ error: 'Erro ao buscar matérias da escola' });

  const subjectIds = (subjects || []).map(subject => subject.id);
  const { data: assignments, error: assignmentError } = subjectIds.length
    ? await supabase.from('teacher_subjects').select('subject_id,teacher_id').in('subject_id', subjectIds)
    : { data: [], error: null };
  if (assignmentError) return res.status(500).json({ error: 'Erro ao buscar professores das matérias' });

  const teacherIdsBySubject = new Map<number, string[]>();
  for (const assignment of assignments || []) {
    const assigned = teacherIdsBySubject.get(assignment.subject_id) || [];
    assigned.push(assignment.teacher_id);
    teacherIdsBySubject.set(assignment.subject_id, assigned);
  }

  res.json((subjects || []).map(subject => ({
    ...transformKeys(subject),
    teacherIds: teacherIdsBySubject.get(subject.id) || []
  })));
});

app.post('/api/school-subjects', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;

  const subject = sanitizeString(req.body.subject);
  const requestedSchoolId = typeof req.body.schoolId === 'string' ? req.body.schoolId : '';
  if (userInfo.role === 'diretor' && !userInfo.school_id) {
    return res.status(403).json({ error: 'Sua conta não está associada a uma escola' });
  }
  const schoolId = userInfo.role === 'diretor' ? userInfo.school_id : requestedSchoolId;
  if (!subject || !schoolId) return res.status(400).json({ error: 'Escola e matéria são obrigatórias' });

  const { data: existingSubjects, error: findError } = await supabase
    .from('school_subjects')
    .select('id,school_id,subject')
    .eq('school_id', schoolId);
  if (findError) return res.status(500).json({ error: 'Erro ao verificar matéria' });
  const existing = (existingSubjects || []).find(item => item.subject.toLocaleLowerCase() === subject.toLocaleLowerCase());
  if (existing) return res.status(409).json({ error: 'Essa matéria já está cadastrada na escola' });

  const { data, error } = await supabase
    .from('school_subjects')
    .insert({ school_id: schoolId, subject })
    .select('id,school_id,subject')
    .single();
  if (error) return res.status(500).json({ error: `Erro ao cadastrar matéria: ${error.message}` });
  res.json(transformKeys({ ...data, teacherIds: [] }));
});

app.delete('/api/school-subjects/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor']);
  if (!userInfo) return;

  const { data: subject, error: findError } = await supabase
    .from('school_subjects')
    .select('id,school_id')
    .eq('id', req.params.id)
    .maybeSingle();
  if (findError) return res.status(500).json({ error: 'Erro ao verificar matéria' });
  if (!subject) return res.status(404).json({ error: 'Matéria não encontrada' });
  if (userInfo.role === 'diretor' && subject.school_id !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { error } = await supabase.from('school_subjects').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erro ao excluir matéria' });
  res.json({ status: 'success' });
});

app.post('/api/school-subjects/:id/teachers', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor', 'teacher']);
  if (!userInfo) return;
  const teacherId = typeof req.body.teacherId === 'string' ? req.body.teacherId : '';
  if (!teacherId) return res.status(400).json({ error: 'Professor obrigatório' });

  const { data: subject, error: subjectError } = await supabase
    .from('school_subjects')
    .select('id,school_id')
    .eq('id', req.params.id)
    .maybeSingle();
  if (subjectError) return res.status(500).json({ error: 'Erro ao verificar matéria' });
  if (!subject) return res.status(404).json({ error: 'Matéria não encontrada' });
  if (userInfo.role === 'diretor' && !userInfo.school_id) {
    return res.status(403).json({ error: 'Sua conta não está associada a uma escola' });
  }
  if (userInfo.role === 'teacher' && !userInfo.school_id) {
    return res.status(403).json({ error: 'Sua conta não está associada a uma escola' });
  }
  if (userInfo.role === 'diretor' && subject.school_id !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'teacher' && subject.school_id !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'teacher' && teacherId !== userInfo.uid) {
    return res.status(403).json({ error: 'Você só pode vincular suas próprias matérias' });
  }

  const teacher = await getUserFromDB(teacherId);
  if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== subject.school_id) {
    return res.status(400).json({ error: 'Selecione um professor da mesma escola' });
  }

  const { error } = await supabase.from('teacher_subjects').upsert(
    { teacher_id: teacherId, subject_id: subject.id },
    { onConflict: 'teacher_id,subject_id', ignoreDuplicates: true }
  );
  if (error) return res.status(500).json({ error: 'Erro ao vincular professor à matéria' });
  res.json({ status: 'success' });
});

app.delete('/api/school-subjects/:id/teachers/:teacherId', async (req, res) => {
  const userInfo = await requireRole(req, res, ['dev', 'diretor', 'teacher']);
  if (!userInfo) return;

  const { data: subject, error: subjectError } = await supabase
    .from('school_subjects')
    .select('id,school_id')
    .eq('id', req.params.id)
    .maybeSingle();
  if (subjectError) return res.status(500).json({ error: 'Erro ao verificar matéria' });
  if (!subject) return res.status(404).json({ error: 'Matéria não encontrada' });
  if (userInfo.role === 'diretor' && subject.school_id !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'teacher' && subject.school_id !== userInfo.school_id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'teacher' && req.params.teacherId !== userInfo.uid) {
    return res.status(403).json({ error: 'Você só pode remover suas próprias matérias' });
  }

  const { error } = await supabase.from('teacher_subjects')
    .delete()
    .eq('subject_id', subject.id)
    .eq('teacher_id', req.params.teacherId);
  if (error) return res.status(500).json({ error: 'Erro ao desvincular professor da matéria' });
  res.json({ status: 'success' });
});

// Teacher subject endpoints retained for the teacher's "Minhas Matérias" view.
app.get('/api/teachers/:uid/subjects', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });
  if (userInfo.role === 'teacher' && req.params.uid !== userInfo.uid) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'diretor') {
    const teacher = await getUserFromDB(req.params.uid);
    if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  }
  if (!['teacher', 'diretor', 'dev'].includes(userInfo.role)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from('teacher_subjects')
    .select('subject_id')
    .eq('teacher_id', req.params.uid);

  if (assignmentError) return res.status(500).json({ error: 'Erro ao buscar matérias' });
  const subjectIds = (assignments || []).map(assignment => assignment.subject_id);
  if (subjectIds.length === 0) return res.json([]);
  const { data, error } = await supabase
    .from('school_subjects')
    .select('id,subject')
    .in('id', subjectIds)
    .order('subject', { ascending: true });
  if (error) return res.status(500).json({ error: 'Erro ao buscar matérias' });
  res.json(data);
});

app.post('/api/teachers/:uid/subjects', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });

  if (userInfo.role === 'teacher' && req.params.uid !== userInfo.uid) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'diretor') {
    const teacher = await getUserFromDB(req.params.uid);
    if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  }

  const subject = sanitizeString(req.body.subject);

  if (!subject) {
    return res.status(400).json({ error: 'Matéria é obrigatória' });
  }

  const teacher = await getUserFromDB(req.params.uid);
  if (!teacher?.school_id) return res.status(400).json({ error: 'Professor não está associado a uma escola' });
  const { data: catalogSubject, error: subjectError } = await getOrCreateSchoolSubject(teacher.school_id, subject);
  if (subjectError || !catalogSubject) return res.status(500).json({ error: 'Erro ao cadastrar matéria da escola' });

  const { error } = await supabase.from('teacher_subjects').upsert(
    { teacher_id: req.params.uid, subject_id: catalogSubject.id },
    { onConflict: 'teacher_id,subject_id', ignoreDuplicates: true }
  );
  if (error) return res.status(500).json({ error: 'Erro ao vincular matéria ao professor' });
  res.json(catalogSubject);
});

app.delete('/api/teachers/:uid/subjects/:subject', async (req, res) => {
  const userInfo = await validateUserPermission(req);
  if (!userInfo) return res.status(401).json({ error: 'Não autorizado' });

  if (userInfo.role === 'teacher' && req.params.uid !== userInfo.uid) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (userInfo.role === 'diretor') {
    const teacher = await getUserFromDB(req.params.uid);
    if (!teacher || teacher.role !== 'teacher' || teacher.school_id !== userInfo.school_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  }

  const teacher = await getUserFromDB(req.params.uid);
  if (!teacher?.school_id) return res.status(400).json({ error: 'Professor não está associado a uma escola' });
  const { data: catalogSubjects, error: findError } = await supabase
    .from('school_subjects')
    .select('id')
    .eq('school_id', teacher.school_id)
    .eq('subject', req.params.subject);
  if (findError) return res.status(500).json({ error: 'Erro ao buscar matéria' });
  const subjectIds = (catalogSubjects || []).map(subject => subject.id);
  if (subjectIds.length === 0) return res.json({ status: 'success' });
  const { error } = await supabase
    .from('teacher_subjects')
    .delete()
    .eq('teacher_id', req.params.uid)
    .in('subject_id', subjectIds);

  if (error) return res.status(500).json({ error: 'Erro ao deletar matéria' });
  res.json({ status: 'success' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://localhost:${PORT}`));
}

startServer();
export default app;
