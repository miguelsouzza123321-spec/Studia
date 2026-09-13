#!/usr/bin/env node

/**
 * Main script to insert complete school schedule
 * 1. Creates teacher users
 * 2. Inserts schedule records via API
 */

import { schedules, scheduleData } from './process_schedule.js';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Extract unique teachers
const uniqueTeachers = [...new Set(schedules.map(s => s.teacherName))];
console.log(`\nProfessores únicos encontrados (${uniqueTeachers.length}):`);
uniqueTeachers.forEach(t => console.log(`  - ${t}`));

// Map to store teacher names -> IDs
const teacherMap = {};

async function createTeacher(teacherName) {
  if (teacherMap[teacherName]) {
    return teacherMap[teacherName];
  }

  // Check if teacher already exists
  const sanitizedName = teacherName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9]/gi, '') // Keep only alphanumeric
    .toLowerCase();
  const email = `prof.${sanitizedName}.${Math.random().toString(36).substring(2, 9)}@escola.com`;

  console.log(`\nCriando professor: ${teacherName} (${email})`);

  try {
    // Create user via Express API
    const authResponse = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: 'pass123',
          displayName: teacherName,
          subject: '',
          role: 'teacher',
          school_id: '8aa1d331-e470-4191-85d7-1310bc767a36'
        })
      }
    );

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error(`  Erro ao criar professor: ${error}`);
      // Use a placeholder ID if creation fails
      const placeholderId = `teacher_${sanitizedName}`;
      teacherMap[teacherName] = placeholderId;
      return placeholderId;
    }

    const authData = await authResponse.json();
    const teacherId = authData.uid;
    console.log(`  ✓ Professor criado com ID: ${teacherId}`);

    teacherMap[teacherName] = teacherId;
    return teacherId;
  } catch (error) {
    console.error(`  Erro: ${error.message}`);
    const placeholderId = `teacher_${sanitizedName}`;
    teacherMap[teacherName] = placeholderId;
    return placeholderId;
  }
}

async function insertSchedules() {
  console.log(`\nInserindo ${schedules.length} horários...`);

  let inserted = 0;
  let failed = 0;

  for (const schedule of schedules) {
    const teacherId = teacherMap[schedule.teacherName];
    const payload = {
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      subject: schedule.subject,
      teacherId: teacherId,
      teacherName: schedule.teacherName,
      classGroup: schedule.classGroup,
      room: schedule.room || '',
      status: 'confirmed',
      school_id: schedule.school_id
    };

    try {
      const response = await fetch(`${API_URL}/api/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        inserted++;
        if (inserted % 20 === 0) {
          console.log(`  ${inserted}/${schedules.length} inseridos...`);
        }
      } else {
        const error = await response.text();
        console.error(`  Erro ao inserir ${schedule.classGroup} ${schedule.date} ${schedule.startTime}: ${error}`);
        failed++;
      }
    } catch (error) {
      console.error(`  Erro de rede: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✓ Inserção concluída: ${inserted} sucesso, ${failed} falhas`);
  return inserted;
}

async function main() {
  console.log('=== Inserir Grade Horária Completa do Colégio ===\n');

  // Create all teachers first
  console.log('Etapa 1: Criar professores...');
  for (const teacher of uniqueTeachers) {
    await createTeacher(teacher);
  }

  console.log(`\n✓ ${uniqueTeachers.length} professores processados`);

  // Insert schedules
  console.log('\nEtapa 2: Inserir horários...');
  await insertSchedules();

  console.log('\n=== Processo Concluído ===');
}

main().catch(console.error);
