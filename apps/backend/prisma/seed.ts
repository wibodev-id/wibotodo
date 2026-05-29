import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@wibotodo.app';
const DEMO_PASSWORD = 'demo12345';
const DEMO_NAME = 'Demo User';

const dayOffset = (days: number, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Unsplash photos — workspace / objects, no humans. License: free for any use.
const IMG = {
  laptop: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  meetingRoom: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  coffee: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  notebook: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
  serverRack:
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  airplaneWing:
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
  whiteboard:
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
};

async function main() {
  console.log('→ Seeding demo user…');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demo = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash, name: DEMO_NAME },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: DEMO_NAME,
    },
  });

  console.log(`✓ Demo user: ${demo.email} (password: ${DEMO_PASSWORD})`);

  await prisma.todo.deleteMany({ where: { userId: demo.id } });

  const sampleTodos = [
    // Overdue
    {
      title: 'Submit Q1 client report',
      description: 'Final review and send to stakeholders',
      dueDate: dayOffset(-3, 17, 0),
      isCompleted: false,
      imagePath: IMG.notebook,
    },
    {
      title: 'Review pull request #142',
      description: 'Auth refactor — left review yesterday',
      dueDate: dayOffset(-1, 14, 0),
      isCompleted: false,
      imagePath: IMG.laptop,
    },
    // Due today
    {
      title: 'Team standup at 10am',
      description: 'Daily sync with the engineering team',
      dueDate: dayOffset(0, 10, 0),
      isCompleted: false,
      imagePath: IMG.meetingRoom,
    },
    {
      title: 'Lunch meeting with Sarah',
      description: 'Discuss the new design system rollout',
      dueDate: dayOffset(0, 12, 30),
      isCompleted: false,
      imagePath: IMG.coffee,
    },
    {
      title: 'Deploy hotfix to production',
      description: 'Critical CORS fix for payment flow',
      dueDate: dayOffset(0, 16, 0),
      isCompleted: false,
      imagePath: IMG.serverRack,
    },
    // Due this week
    {
      title: 'Prepare onboarding docs for new hire',
      description: 'Walkthrough of repo structure + dev setup',
      dueDate: dayOffset(2, 11, 0),
      isCompleted: false,
    },
    {
      title: 'Plan next sprint',
      description: 'Estimate tickets and assign owners',
      dueDate: dayOffset(4, 9, 0),
      isCompleted: false,
      imagePath: IMG.whiteboard,
    },
    {
      title: 'Book flight for conference',
      description: 'Munich, July 14-16',
      dueDate: dayOffset(5, 18, 0),
      isCompleted: false,
      imagePath: IMG.airplaneWing,
    },
    // No due date
    {
      title: 'Read "Designing Data-Intensive Applications"',
      description: 'Chapter 7 — Transactions',
      dueDate: null,
      isCompleted: false,
      imagePath: IMG.books,
    },
    // Completed today
    {
      title: 'Reply to client follow-ups',
      description: '5 emails cleared from inbox',
      dueDate: dayOffset(0, 9, 0),
      isCompleted: true,
      completedAt: dayOffset(0, 8, 30),
    },
    {
      title: 'Morning workout',
      description: '30 min cardio + stretching',
      dueDate: dayOffset(0, 7, 0),
      isCompleted: true,
      completedAt: dayOffset(0, 7, 45),
    },
    // Completed earlier in the week
    {
      title: 'Refactor user service tests',
      description: 'Moved from mocks to real DB integration tests',
      dueDate: dayOffset(-1, 17, 0),
      isCompleted: true,
      completedAt: dayOffset(-1, 16, 0),
    },
    {
      title: 'Migrate auth to JWT',
      description: 'Replaced session-based auth across all services',
      dueDate: dayOffset(-2, 17, 0),
      isCompleted: true,
      completedAt: dayOffset(-2, 15, 30),
    },
    {
      title: 'Write release notes for v1.4',
      description: 'Highlights: new dashboard, faster sync, fewer bugs',
      dueDate: dayOffset(-4, 12, 0),
      isCompleted: true,
      completedAt: dayOffset(-4, 11, 0),
    },
    {
      title: 'Pair on database migration',
      description: 'Helped Andi debug the foreign key issue',
      dueDate: null,
      isCompleted: true,
      completedAt: dayOffset(-5, 14, 0),
    },
    {
      title: 'Review hiring candidates',
      description: 'Shortlisted 4 from the latest round',
      dueDate: dayOffset(-6, 17, 0),
      isCompleted: true,
      completedAt: dayOffset(-6, 16, 0),
    },
  ] as const;

  for (const todo of sampleTodos) {
    await prisma.todo.create({
      data: {
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        isCompleted: todo.isCompleted,
        completedAt: 'completedAt' in todo ? (todo.completedAt as Date) : null,
        imagePath: 'imagePath' in todo ? (todo.imagePath as string) : null,
        userId: demo.id,
      },
    });
  }

  console.log(`✓ Seeded ${sampleTodos.length} sample todos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
