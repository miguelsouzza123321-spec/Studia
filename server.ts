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

app.post('/api/auth/register', async (req, res) => {
  try {
    let { email, password, displayName, subject, school_id } = req.body;

    // Sanitizar entrada
    email = sanitizeEmail(email);
    displayName = sanitizeString(displayName);
    subject = sanitizeString(subject);

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
  subject = sanitizeString(subject);
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
  // Admin pode criar qualquer um
  if (userRole === 'admin' || userRole === 'dev') {
    // OK - criar qualquer role
  }
  // Diretor pode criar diretor/professor da mesma escola
  else if (userRole === 'diretor') {
    if (role === 'admin' || role === 'dev') {
      return res.status(403).json({ error: 'Diretor não pode criar administradores ou desenvolvedores' });
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
    const finalSchoolId = userRole === 'diretor' ? userSchoolId : (schoolId || DEFAULT_SCHOOL_ID);

    // Inserir na tabela users (sem school_id primeiro)
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
        role,
        subject: subject || null
      })
    });

    if (!insertResponse.ok) {
      console.error('[CREATE_USER] Insert failed');
      await supabase.auth.admin.deleteUser(uid);
      return res.status(500).json({ error: 'Erro ao criar perfil no banco' });
    }

    // Atualizar com school_id
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({ school_id: finalSchoolId })
      .eq('uid', uid)
      .select('uid,email,displayname,role,subject,school_id')
      .single();

    if (updateError) {
      console.error('[CREATE_USER] Update school_id failed:', updateError);
      // Não falha - continua sem school_id
    }

    res.json(transformKeys(userData || { uid, email, displayname: displayName, role, school_id: finalSchoolId }));
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
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
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
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
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
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
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
  const userInfo = await requireRole(req, res, ['admin', 'dev']);
  if (!userInfo) return;
  const { data, error } = await supabase.from('schedules').select('status');
  if (error) return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  res.json({ total: data.length, confirmed: data.filter(item => item.status === 'confirmed').length, absent: data.filter(item => item.status === 'absent').length, pending: data.filter(item => item.status === 'pending').length });
});

app.get('/api/teachers', async (req, res) => {
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
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
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
  if (!userInfo) return;

  let query = supabase.from('users').select('*').order('displayname', { ascending: true });

  if (userInfo.role === 'diretor') {
    if (req.query.schoolId && req.query.schoolId !== userInfo.school_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    query = query.eq('school_id', userInfo.school_id);
    query = query.not('role', 'in', '("admin","dev")');
  } else if (req.query.schoolId) {
    query = query.eq('school_id', req.query.schoolId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Erro ao buscar usuários' });
  res.json(transformKeys(data));
});

app.delete('/api/users/:uid', async (req, res) => {
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
  if (!userInfo) return;
  if (req.params.uid === userInfo.uid) return res.status(400).json({ error: 'Não é possível excluir sua própria conta' });
  if (userInfo.role === 'diretor') {
    const target = await getUserFromDB(req.params.uid);
    if (!target || target.school_id !== userInfo.school_id || ['admin', 'dev'].includes(target.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
  }

  const uid = req.params.uid;

  const { error: authError } = await supabase.auth.admin.deleteUser(uid);
  if (authError) {
    return res.status(500).json({ error: 'Erro ao remover usuário do sistema de autenticação' });
  }

  const { error: dbError } = await supabase.from('users').delete().eq('uid', uid);
  if (dbError) {
    return res.status(500).json({ error: 'Erro ao remover usuário do banco de dados' });
  }

  res.json({ status: 'success' });
});

// Server-side permission validation
type AppRole = 'teacher' | 'diretor' | 'admin' | 'dev';

interface UserInfo {
  uid: string;
  role: AppRole;
  school_id?: string;
}

const VALID_ROLES: AppRole[] = ['teacher', 'diretor', 'admin', 'dev'];

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
    if (target.school_id !== userInfo.school_id || ['admin', 'dev'].includes(target.role) || ['admin', 'dev'].includes(role)) {
      return res.status(403).json({ error: 'Diretores só podem gerenciar perfis da própria escola' });
    }
  } else if (userInfo.role !== 'admin' && userInfo.role !== 'dev') {
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
  const userInfo = await requireRole(req, res, ['admin', 'dev']);
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
  const userInfo = await requireRole(req, res, ['admin', 'dev', 'diretor']);
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
  const userInfo = await requireRole(req, res, ['admin', 'dev']);
  if (!userInfo) return;
  const { data, error } = await supabase.from('schools').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ error: 'Erro ao buscar escolas' });
  res.json(data);
});

app.post('/api/schools', async (req, res) => {
  const userInfo = await requireRole(req, res, ['admin', 'dev']);
  if (!userInfo) return;
  const { name, createdBy } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da escola é obrigatório' });
  const { data, error } = await supabase.from('schools').insert({ name, createdBy }).select('*').single();
  if (error) return res.status(500).json({ error: `Erro ao criar escola: ${error.message}` });
  res.json(data);
});

app.patch('/api/schools/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['admin', 'dev']);
  if (!userInfo) return;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  const { data, error } = await supabase.from('schools').update({ name }).eq('id', req.params.id).select('*').single();
  if (error) return res.status(500).json({ error: 'Erro ao atualizar escola' });
  res.json(data);
});

app.delete('/api/schools/:id', async (req, res) => {
  const userInfo = await requireRole(req, res, ['admin', 'dev']);
  if (!userInfo) return;
  const { error } = await supabase.from('schools').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Erro ao deletar escola' });
  res.json({ status: 'success' });
});

// Teacher Subjects endpoints
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
  if (!['teacher', 'diretor', 'admin', 'dev'].includes(userInfo.role)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { data, error } = await supabase
    .from('teacher_subjects')
    .select('id,subject')
    .eq('teacher_id', req.params.uid)
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

  let { subject } = req.body;
  subject = sanitizeString(subject);

  if (!subject) {
    return res.status(400).json({ error: 'Matéria é obrigatória' });
  }

  const { data, error } = await supabase
    .from('teacher_subjects')
    .insert({ teacher_id: req.params.uid, subject })
    .select();

  if (error) {
    if (error.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Matéria já existe' });
    }
    return res.status(500).json({ error: 'Erro ao adicionar matéria' });
  }

  res.json(data[0]);
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

  const { error } = await supabase
    .from('teacher_subjects')
    .delete()
    .eq('teacher_id', req.params.uid)
    .eq('subject', req.params.subject);

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
