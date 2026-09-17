import { neon } from '@neondatabase/serverless';

export interface DBMedicineReminder {
  id: string;
  name: string;
  dosage: string;
  form: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  scheduledTime: string;
  mealRelation: string;
  isTakenToday: boolean;
  takenAt?: string | null;
  streakDays: number;
  instructions?: string;
  createdAt: string;
}

export function getNeonSQL(dbUrl: string) {
  if (!dbUrl || dbUrl.trim() === '' || dbUrl.includes('YOUR_NEON_DATABASE_URL')) {
    return null;
  }
  try {
    return neon(dbUrl.trim());
  } catch (err) {
    console.warn('Failed to initialize Neon client:', err);
    return null;
  }
}

export async function fetchRemindersFromNeon(dbUrl: string): Promise<DBMedicineReminder[] | null> {
  const sql = getNeonSQL(dbUrl);
  if (!sql) return null;

  try {
    const rows = await sql`
      SELECT 
        id, name, dosage, form, time_slot as "timeSlot", 
        scheduled_time as "scheduledTime", meal_relation as "mealRelation", 
        is_taken_today as "isTakenToday", taken_at as "takenAt", 
        streak_days as "streakDays", instructions, created_at as "createdAt"
      FROM medicine_reminders
      ORDER BY scheduled_time ASC
    `;
    return rows as unknown as DBMedicineReminder[];
  } catch (error) {
    console.error('Failed to query reminders from Neon:', error);
    return null;
  }
}

export async function saveReminderToNeon(dbUrl: string, reminder: DBMedicineReminder): Promise<boolean> {
  const sql = getNeonSQL(dbUrl);
  if (!sql) return false;

  try {
    await sql`
      INSERT INTO medicine_reminders (
        id, name, dosage, form, time_slot, scheduled_time, meal_relation, is_taken_today, taken_at, streak_days, instructions
      ) VALUES (
        ${reminder.id},
        ${reminder.name},
        ${reminder.dosage},
        ${reminder.form},
        ${reminder.timeSlot},
        ${reminder.scheduledTime},
        ${reminder.mealRelation},
        ${reminder.isTakenToday},
        ${reminder.takenAt ? new Date(reminder.takenAt).toISOString() : null},
        ${reminder.streakDays},
        ${reminder.instructions || ''}
      )
      ON CONFLICT (id) DO UPDATE SET
        is_taken_today = EXCLUDED.is_taken_today,
        taken_at = EXCLUDED.taken_at,
        streak_days = EXCLUDED.streak_days,
        scheduled_time = EXCLUDED.scheduled_time;
    `;
    return true;
  } catch (error) {
    console.error('Failed to save reminder in Neon:', error);
    return false;
  }
}

export async function initializeNeonSchema(dbUrl: string) {
  const sql = getNeonSQL(dbUrl);
  if (!sql) {
    return { success: false, message: 'No DATABASE_URL configured' };
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS medicine_reminders (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        form VARCHAR(50) DEFAULT 'tablet',
        time_slot VARCHAR(50) NOT NULL,
        scheduled_time VARCHAR(20) NOT NULL,
        meal_relation VARCHAR(100) DEFAULT 'After Food',
        is_taken_today BOOLEAN DEFAULT FALSE,
        taken_at TIMESTAMP WITH TIME ZONE,
        streak_days INTEGER DEFAULT 0,
        instructions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return { success: true, message: 'Neon connected' };
  } catch (error: any) {
    return { success: false, message: `DB Error: ${error.message}` };
  }
}
