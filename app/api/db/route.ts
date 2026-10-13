import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  MOCK_USERS,
  INITIAL_EVENTS,
  INITIAL_SOCIETIES,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
} from '@/utils/mockData';

// File path for server-side persistence
const DATA_DIR = path.join(process.cwd(), 'database-vault', 'vault-data');
const DB_FILE = path.join(DATA_DIR, 'live_campus_db.json');

// In-memory fallback (for read/write in serverless environments like Vercel)
let inMemoryDB = {
  users: MOCK_USERS,
  events: INITIAL_EVENTS,
  societies: INITIAL_SOCIETIES,
  channels: INITIAL_CHANNELS,
  messages: INITIAL_MESSAGES,
  auditLogs: INITIAL_AUDIT_LOGS,
  lastUpdated: new Date().toISOString(),
};

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryDB = { ...inMemoryDB, ...parsed };
      return inMemoryDB;
    }
  } catch (err) {
    console.warn('DB file read warning, using in-memory state:', err);
  }
  return inMemoryDB;
}

function writeDB(data: any) {
  inMemoryDB = { ...inMemoryDB, ...data, lastUpdated: new Date().toISOString() };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.warn('DB file write warning (expected in read-only serverless):', err);
  }
  return inMemoryDB;
}

// GET: Fetch latest centralized campus database
export async function GET() {
  const current = readDB();
  return NextResponse.json({
    success: true,
    data: current,
  });
}

// POST: Execute atomic database action (Registration, Event Post, Approval, etc.)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = readDB();

    switch (action) {
      // 1. Student Registration
      case 'REGISTER_USER': {
        const { user } = payload;
        const exists = db.users.find(
          (u: any) => u.enrollment_id.toLowerCase() === user.enrollment_id.toLowerCase()
        );
        if (exists) {
          return NextResponse.json({ success: false, message: 'Enrollment ID already registered.' }, { status: 400 });
        }
        db.users.push(user);
        writeDB({ users: db.users });
        return NextResponse.json({ success: true, user, data: db });
      }

      // 2. Admin Verifies Student
      case 'VERIFY_USER': {
        const { userId } = payload;
        db.users = db.users.map((u: any) => (u.id === userId ? { ...u, is_verified: true } : u));
        writeDB({ users: db.users });
        return NextResponse.json({ success: true, data: db });
      }

      // 3. Admin Promotes User (Society Head, HOD, Developer)
      case 'PROMOTE_USER': {
        const { userId, role, societyName } = payload;
        let createdSocId: string | undefined;

        if (role === 'society_admin' && societyName?.trim()) {
          createdSocId = `soc-${Date.now()}`;
          const targetUser = db.users.find((u: any) => u.id === userId);
          const newSociety = {
            id: createdSocId,
            name: societyName.trim(),
            code: societyName.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 5) || 'SOC',
            description: `Official society chartered at BU H-11 under ${targetUser?.department || 'Directorate'}.`,
            logo_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&q=80',
            is_recruiting: true,
            department: targetUser?.department || 'Software Engineering',
            lead_enrollment: targetUser?.enrollment_id || '',
            lead_name: targetUser?.full_name || 'Society Head',
            created_at: new Date().toISOString(),
          };
          db.societies.push(newSociety);
        }

        db.users = db.users.map((u: any) =>
          u.id === userId
            ? {
                ...u,
                role,
                is_verified: true,
                society_name: societyName || u.society_name,
                society_id: createdSocId || u.society_id,
              }
            : u
        );

        writeDB({ users: db.users, societies: db.societies });
        return NextResponse.json({ success: true, data: db });
      }

      // 4. Society Head Drafts Event (Defaults to approved_by_hod: false)
      case 'CREATE_EVENT': {
        const { event } = payload;
        db.events = [event, ...db.events];
        writeDB({ events: db.events });
        return NextResponse.json({ success: true, event, data: db });
      }

      // 5. Admin Approves Event Post
      case 'APPROVE_EVENT': {
        const { eventId } = payload;
        db.events = db.events.map((e: any) =>
          e.id === eventId ? { ...e, approved_by_hod: true, rejection_reason: undefined } : e
        );
        writeDB({ events: db.events });
        return NextResponse.json({ success: true, data: db });
      }

      // 6. Admin Rejects Event Post
      case 'REJECT_EVENT': {
        const { eventId, reason } = payload;
        db.events = db.events.map((e: any) =>
          e.id === eventId ? { ...e, approved_by_hod: false, rejection_reason: reason } : e
        );
        writeDB({ events: db.events });
        return NextResponse.json({ success: true, data: db });
      }

      // 7. Student Registers for an Event
      case 'REGISTER_FOR_EVENT': {
        const { eventId, student } = payload;
        db.events = db.events.map((e: any) => {
          if (e.id === eventId) {
            const list = e.registered_students || [];
            if (!list.some((s: any) => s.enrollment_id === student.enrollment_id)) {
              const nextList = [...list, student];
              return { ...e, registered_students: nextList, attendee_count: nextList.length };
            }
          }
          return e;
        });
        writeDB({ events: db.events });
        return NextResponse.json({ success: true, data: db });
      }

      // 8. Send Chat Message
      case 'SEND_MESSAGE': {
        const { message } = payload;
        db.messages.push(message);
        writeDB({ messages: db.messages });
        return NextResponse.json({ success: true, message, data: db });
      }

      // 9. Delete Event
      case 'DELETE_EVENT': {
        const { eventId } = payload;
        db.events = db.events.filter((e: any) => e.id !== eventId);
        writeDB({ events: db.events });
        return NextResponse.json({ success: true, data: db });
      }

      // 10. Delete User
      case 'DELETE_USER': {
        const { userId } = payload;
        db.users = db.users.filter((u: any) => u.id !== userId);
        writeDB({ users: db.users });
        return NextResponse.json({ success: true, data: db });
      }

      // Full Database Overwrite (from sync engine)
      case 'SYNC_ALL': {
        writeDB(payload);
        return NextResponse.json({ success: true, data: inMemoryDB });
      }

      default:
        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
