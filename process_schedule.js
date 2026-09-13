/**
 * Script para processar e extrair a grade horária do colégio
 */

// School ID from the request
export const SCHOOL_ID = '8aa1d331-e470-4191-85d7-1310bc767a36';

// Schedule data extracted from PDF (OCR)
// With manual completion for missing values
export const scheduleData = {
  "1EI": {
    "18:45": [
      { subject: "MATEMÁTICA", teacher: "ELAINE", day: "seg" },
      { subject: "HISTÓRIA", teacher: "MARLI", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "ADEVAIR", day: "qua" },
      { subject: "CIÊNCIAS", teacher: "FABIO F", day: "qui" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "SHEYLA", day: "sex" }
    ],
    "19:30": [
      { subject: "HISTÓRIA", teacher: "ALVARO", day: "seg" },
      { subject: "QUÍMICA", teacher: "TEIDER", day: "ter" },
      { subject: "INGLÊS", teacher: "ANNY", day: "qua" },
      { subject: "BIOLOGIA", teacher: "JOÃO M.", day: "qui" },
      { subject: "ARTE", teacher: "KEVIN", day: "sex" }
    ],
    "20:30": [
      { subject: "SOCIOLOGIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "GEOGRAFIA", teacher: "ELAINE", day: "ter" },
      { subject: "FILOSOFIA", teacher: "RAFAELA", day: "qua" },
      { subject: "PORTUGUÊS", teacher: "JEAN", day: "qui" },
      { subject: "MATEMÁTICA", teacher: "MARLI", day: "sex" }
    ],
    "21:15": [
      { subject: "FILOSOFIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "INGLÊS", teacher: "TEIDER", day: "ter" },
      { subject: "ADMINISTRAÇÃO", teacher: "LUCIVANA", day: "qua" },
      { subject: "ECONOMIA", teacher: "LUCIVANA", day: "qui" },
      { subject: "ESTATÍSTICA", teacher: "GILSO", day: "sex" }
    ],
    "22:00": [
      { subject: "FILOSOFIA", teacher: "ALVARO", day: "seg" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "NELSON", day: "ter" },
      { subject: "COMUNICAÇÃO", teacher: "JOÃO IVO", day: "qua" },
      { subject: "FÍSICA", teacher: "RENATA", day: "qui" },
      { subject: "FINANÇAS", teacher: "SHEYLA", day: "sex" }
    ]
  },
  "2EI": {
    "18:45": [
      { subject: "HISTÓRIA", teacher: "ELAINE", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "MARLI", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "ADEVAIR", day: "qua" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "FABIO F", day: "qui" },
      { subject: "RECURSOS HUMANOS", teacher: "SHEYLA", day: "sex" }
    ],
    "19:30": [
      { subject: "HISTÓRIA", teacher: "ALVARO", day: "seg" },
      { subject: "FINANÇAS EMPRESARIAIS", teacher: "TEIDER", day: "ter" },
      { subject: "INGLÊS", teacher: "ANNY", day: "qua" },
      { subject: "FÍSICA", teacher: "JOÃO M.", day: "qui" },
      { subject: "TÉCNICAS INTEGRADAS", teacher: "KEVIN", day: "sex" }
    ],
    "20:30": [
      { subject: "SOCIOLOGIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "SOCIOLOGIA", teacher: "ELAINE", day: "ter" },
      { subject: "MARKETING", teacher: "RAFAELA", day: "qua" },
      { subject: "PORTUGUÊS", teacher: "JEAN", day: "qui" },
      { subject: "MATEMÁTICA", teacher: "MARLI", day: "sex" }
    ],
    "21:15": [
      { subject: "FILOSOFIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "INGLÊS", teacher: "TEIDER", day: "ter" },
      { subject: "GESTÃO EMPRESARIAL", teacher: "LUCIVANA", day: "qua" },
      { subject: "ECONOMIA", teacher: "LUCIVANA", day: "qui" },
      { subject: "MATEMÁTICA", teacher: "GILSO", day: "sex" }
    ],
    "22:00": [
      { subject: "FILOSOFIA", teacher: "ALVARO", day: "seg" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "NELSON", day: "ter" },
      { subject: "VENDAS", teacher: "JOÃO IVO", day: "qua" },
      { subject: "FÍSICA", teacher: "RENATA", day: "qui" },
      { subject: "FINANÇAS", teacher: "SHEYLA", day: "sex" }
    ]
  },
  "3EI": {
    "18:45": [
      { subject: "MATEMÁTICA", teacher: "CLAUDIA", day: "seg" },
      { subject: "HISTÓRIA", teacher: "ADEVAIR", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "JOSUÉ", day: "qua" },
      { subject: "CIÊNCIAS", teacher: "FABIO F", day: "qui" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "FABIO F", day: "sex" }
    ],
    "19:30": [
      { subject: "HISTÓRIA", teacher: "ELAINE", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "LUCIVANA", day: "ter" },
      { subject: "QUÍMICA", teacher: "JOSUÉ", day: "qua" },
      { subject: "BIOLOGIA", teacher: "JOÃO C.", day: "qui" },
      { subject: "ARTE", teacher: "FABIO F", day: "sex" }
    ],
    "20:30": [
      { subject: "SOCIOLOGIA", teacher: "ELAINE", day: "seg" },
      { subject: "GEOGRAFIA", teacher: "LUCIVANA", day: "ter" },
      { subject: "FILOSOFIA", teacher: "JUSSARA", day: "qua" },
      { subject: "PORTUGUÊS", teacher: "LUCIMARA", day: "qui" },
      { subject: "MATEMÁTICA", teacher: "JOÃO C.", day: "sex" }
    ],
    "21:15": [
      { subject: "FILOSOFIA", teacher: "JUSSARA", day: "seg" },
      { subject: "INGLÊS", teacher: "ADEVAIR", day: "ter" },
      { subject: "ADMINISTRAÇÃO", teacher: "JUSSARA", day: "qua" },
      { subject: "ECONOMIA", teacher: "LUCIMARA", day: "qui" },
      { subject: "ESTATÍSTICA", teacher: "LUCIVANA", day: "sex" }
    ],
    "22:00": [
      { subject: "FILOSOFIA", teacher: "JUSSARA", day: "seg" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "JOÃO", day: "ter" },
      { subject: "COMUNICAÇÃO", teacher: "IVO", day: "qua" },
      { subject: "GESTÃO", teacher: "LUCIVANA", day: "qui" },
      { subject: "FINANÇAS", teacher: "LUCIMARA", day: "sex" }
    ]
  },
  "1DDS": {
    "18:45": [
      { subject: "BANCO DE DADOS", teacher: "ELAINE", day: "seg" },
      { subject: "QUÍMICA", teacher: "FABIO F", day: "ter" },
      { subject: "GEOGRAFIA", teacher: "ADEVAIR", day: "qua" },
      { subject: "INGLÊS", teacher: "FABIO F", day: "qui" },
      { subject: "BIOLOGIA", teacher: "PAULO", day: "sex" }
    ],
    "19:30": [
      { subject: "BANCO DE DADOS", teacher: "CLAUDIA", day: "seg" },
      { subject: "ANÁLISE DE SISTEMAS", teacher: "ALEXANDRE", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "LUCIVANA", day: "qua" },
      { subject: "INGLÊS", teacher: "FABIO F", day: "qui" },
      { subject: "MATEMÁTICA", teacher: "NELSON", day: "sex" }
    ],
    "20:30": [
      { subject: "GEOGRAFIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "COMPUTAÇÃO", teacher: "ALEXANDRE", day: "ter" },
      { subject: "PROGRAMAÇÃO", teacher: "JUSSARA", day: "qua" },
      { subject: "LÓGICA COMPUTACIONAL", teacher: "JUSSARA", day: "qui" },
      { subject: "BIOLOGIA", teacher: "ADEVAIR", day: "sex" }
    ],
    "21:15": [
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ALVARO", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "JOÃO", day: "ter" },
      { subject: "COMPUTAÇÃO", teacher: "IVO", day: "qua" },
      { subject: "MATEMÁTICA", teacher: "LUCIVANA", day: "qui" },
      { subject: "ARTE", teacher: "LUCIMARA", day: "sex" }
    ],
    "22:00": [
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ALVARO", day: "seg" },
      { subject: "QUÍMICA", teacher: "NELSON", day: "ter" },
      { subject: "ANÁLISE DE SISTEMAS", teacher: "GILSO", day: "qua" },
      { subject: "MATEMÁTICA", teacher: "RENATA", day: "qui" },
      { subject: "ARTE", teacher: "LUCIVANA", day: "sex" }
    ]
  },
  "2DDS": {
    "18:45": [
      { subject: "HISTÓRIA", teacher: "FELIPE", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "TEIDER", day: "ter" },
      { subject: "GEOGRAFIA", teacher: "RAFAELA", day: "qua" },
      { subject: "MATEMÁTICA", teacher: "ANTÔNIO", day: "qui" },
      { subject: "CIÊNCIAS", teacher: "JEAN", day: "sex" }
    ],
    "19:30": [
      { subject: "HISTÓRIA", teacher: "FELIPE", day: "seg" },
      { subject: "QUÍMICA", teacher: "TEIDER", day: "ter" },
      { subject: "HISTÓRIA", teacher: "ANNY", day: "qua" },
      { subject: "PORTUGUÊS", teacher: "CAROLINI", day: "qui" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ELAINE", day: "sex" }
    ],
    "20:30": [
      { subject: "EDUCAÇÃO FÍSICA", teacher: "JOÃO M.", day: "seg" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ELAINE", day: "ter" },
      { subject: "INGLÊS", teacher: "ANNY", day: "qua" },
      { subject: "SOCIOLOGIA", teacher: "CAROLINI", day: "qui" },
      { subject: "FILOSOFIA", teacher: "JEAN", day: "sex" }
    ],
    "21:15": [
      { subject: "MATEMÁTICA", teacher: "RAFAELA", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "JEAN", day: "ter" },
      { subject: "BIOLOGIA", teacher: "LUCIVANA", day: "qua" },
      { subject: "PORTUGUÊS", teacher: "LUCIVANA", day: "qui" },
      { subject: "ARTE", teacher: "GILSO", day: "sex" }
    ],
    "22:00": [
      { subject: "GEOGRAFIA", teacher: "JOÃO M.", day: "seg" },
      { subject: "HISTÓRIA", teacher: "MARLI", day: "ter" },
      { subject: "INGLÊS", teacher: "JOÃO IVO", day: "qua" },
      { subject: "QUÍMICA", teacher: "LUCIVANA", day: "qui" },
      { subject: "MATEMÁTICA", teacher: "GILSO", day: "sex" }
    ]
  },
  "3DDS": {
    "18:45": [
      { subject: "HISTÓRIA", teacher: "JUSSARA", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "LINDEMBERG", day: "ter" },
      { subject: "GEOGRAFIA", teacher: "JUSSARA", day: "qua" },
      { subject: "MATEMÁTICA", teacher: "JOÃO C.", day: "qui" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "JOÃO IVO", day: "sex" }
    ],
    "19:30": [
      { subject: "HISTÓRIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ELAINE", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "JUSSARA", day: "qua" },
      { subject: "BIOLOGIA", teacher: "LUCIVANA", day: "qui" },
      { subject: "QUÍMICA", teacher: "LUCIVANA", day: "sex" }
    ],
    "20:30": [
      { subject: "SOCIOLOGIA", teacher: "JUSSARA", day: "seg" },
      { subject: "HISTÓRIA", teacher: "JEAN", day: "ter" },
      { subject: "INGLÊS", teacher: "ANTÔNIO", day: "qua" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ELAINE", day: "qui" },
      { subject: "FILOSOFIA", teacher: "LUCIVANA", day: "sex" }
    ],
    "21:15": [
      { subject: "MATEMÁTICA", teacher: "SAVIO", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "LINDEMBERG", day: "ter" },
      { subject: "CIÊNCIAS", teacher: "ANTÔNIO", day: "qua" },
      { subject: "SOCIOLOGIA", teacher: "GILSO", day: "qui" },
      { subject: "HISTÓRIA", teacher: "JOÃO C.", day: "sex" }
    ],
    "22:00": [
      { subject: "EDUCAÇÃO FÍSICA", teacher: "SAVIO", day: "seg" },
      { subject: "QUÍMICA", teacher: "LUCIVANA", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "JEAN", day: "qua" },
      { subject: "MATEMÁTICA", teacher: "GILSO", day: "qui" },
      { subject: "HISTÓRIA", teacher: "JEAN", day: "sex" }
    ]
  },
  "2ASA": {
    "18:45": [
      { subject: "MARKETING", teacher: "ELAINE", day: "seg" },
      { subject: "ECONOMIA", teacher: "MARLI", day: "ter" },
      { subject: "VENDAS", teacher: "ADEVAIR", day: "qua" },
      { subject: "LOGÍSTICA", teacher: "FABIO F", day: "qui" },
      { subject: "INTEGRADOR", teacher: "SHEYLA", day: "sex" }
    ],
    "19:30": [
      { subject: "ECONOMIA", teacher: "ALVARO", day: "seg" },
      { subject: "LOGÍSTICA", teacher: "TEIDER", day: "ter" },
      { subject: "MARKETING", teacher: "ANNY", day: "qua" },
      { subject: "VENDAS", teacher: "JOÃO M.", day: "qui" },
      { subject: "INTEGRADOR", teacher: "KEVIN", day: "sex" }
    ],
    "20:30": [
      { subject: "VENDAS", teacher: "CLAUDIA", day: "seg" },
      { subject: "LOGÍSTICA", teacher: "ELAINE", day: "ter" },
      { subject: "FINANÇAS", teacher: "RAFAELA", day: "qua" },
      { subject: "LOGÍSTICA", teacher: "JEAN", day: "qui" },
      { subject: "FINANÇAS", teacher: "MARLI", day: "sex" }
    ],
    "21:15": [
      { subject: "MARKETING", teacher: "CLAUDIA", day: "seg" },
      { subject: "ECONOMIA", teacher: "TEIDER", day: "ter" },
      { subject: "FINANÇAS", teacher: "LUCIVANA", day: "qua" },
      { subject: "LOGÍSTICA", teacher: "LUCIVANA", day: "qui" },
      { subject: "FINANÇAS", teacher: "GILSO", day: "sex" }
    ],
    "22:00": [
      { subject: "VENDAS", teacher: "ALVARO", day: "seg" },
      { subject: "INTEGRADOR", teacher: "NELSON", day: "ter" },
      { subject: "MARKETING", teacher: "JOÃO IVO", day: "qua" },
      { subject: "ECONOMIA", teacher: "RENATA", day: "qui" },
      { subject: "FINANÇAS", teacher: "SHEYLA", day: "sex" }
    ]
  },
  "3D": {
    "18:45": [
      { subject: "HISTÓRIA", teacher: "MÔNICA", day: "seg" },
      { subject: "PORTUGUÊS", teacher: "PAULO MAT.", day: "ter" },
      { subject: "GEOGRAFIA", teacher: "IARA", day: "qua" },
      { subject: "MATEMÁTICA", teacher: "IARA", day: "qui" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "MARY", day: "sex" }
    ],
    "19:30": [
      { subject: "HISTÓRIA", teacher: "MÔNICA", day: "seg" },
      { subject: "QUÍMICA", teacher: "RAFAELA", day: "ter" },
      { subject: "BIOLOGIA", teacher: "IARA", day: "qua" },
      { subject: "PORTUGUÊS", teacher: "IARA", day: "qui" },
      { subject: "FILOSOFIA", teacher: "MARY", day: "sex" }
    ],
    "20:30": [
      { subject: "EDUCAÇÃO FÍSICA", teacher: "PAULO MAT.", day: "seg" },
      { subject: "HISTÓRIA", teacher: "JOÃO M.", day: "ter" },
      { subject: "SOCIOLOGIA", teacher: "ALVARO", day: "qua" },
      { subject: "INGLÊS", teacher: "JOÃO C.", day: "qui" },
      { subject: "ARTE", teacher: "JOÃO IVO", day: "sex" }
    ],
    "21:15": [
      { subject: "MATEMÁTICA", teacher: "PAULO MAT.", day: "seg" },
      { subject: "QUÍMICA", teacher: "RAFAELA", day: "ter" },
      { subject: "GEOGRAFIA", teacher: "JOÃO IVO", day: "qua" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ELAINE", day: "qui" },
      { subject: "HISTÓRIA", teacher: "JOÃO IVO", day: "sex" }
    ],
    "22:00": [
      { subject: "SOCIOLOGIA", teacher: "CLAUDIA", day: "seg" },
      { subject: "HISTÓRIA", teacher: "ANNY CAROLINI", day: "ter" },
      { subject: "PORTUGUÊS", teacher: "ANNY CAROLINI", day: "qua" },
      { subject: "EDUCAÇÃO FÍSICA", teacher: "ELAINE", day: "qui" },
      { subject: "ARTE", teacher: "JOÃO C.", day: "sex" }
    ]
  }
};

// Helper: Convert day name to date
export function dayToDate(day) {
  const daysMap = {
    'seg': '2026-09-14',
    'ter': '2026-09-15',
    'qua': '2026-09-16',
    'qui': '2026-09-17',
    'sex': '2026-09-18'
  };
  return daysMap[day];
}

// Helper: Convert start time to end time (+45 minutes)
export function getEndTime(startTime) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + 45;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// Build schedule records
export function buildSchedules() {
  const schedules = [];
  for (const [classGroup, timeSlots] of Object.entries(scheduleData)) {
    for (const [startTime, sessions] of Object.entries(timeSlots)) {
      const endTime = getEndTime(startTime);
      for (const session of sessions) {
        schedules.push({
          date: dayToDate(session.day),
          startTime: startTime,
          endTime: endTime,
          subject: session.subject,
          teacherId: null, // Will be filled after creating teachers
          teacherName: session.teacher,
          classGroup: classGroup,
          room: "",
          status: "confirmed",
          school_id: SCHOOL_ID
        });
      }
    }
  }
  return schedules;
}

export const schedules = buildSchedules();
