import fs from 'fs';
import path from 'path';
import { PrismaClient, BlogStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

loadEnvFile('.env');
loadEnvFile('.env.local');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Create a .env file in the project root (for example by copying .env.example to .env) and set it to your MongoDB URI before running `npm run seed`.',
  );
}

const prisma = new PrismaClient();

function loadEnvFile(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10);
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@sportsblog.com' },
    update: {},
    create: {
      name: 'Site Admin',
      email: process.env.ADMIN_EMAIL || 'admin@sportsblog.com',
      password,
    },
  });

  const football = await prisma.category.upsert({
    where: { slug: 'football' },
    update: {},
    create: { name: 'Football', slug: 'football' },
  });

  const cricket = await prisma.category.upsert({
    where: { slug: 'cricket' },
    update: {},
    create: { name: 'Cricket', slug: 'cricket' },
  });

  const posts = [
    {
      title: 'Premier League Run-in: Who Controls the Title Race?',
      slug: 'premier-league-run-in-title-race',
      categoryId: football.id,
      summary: 'A tactical and scheduling look at how the title contenders are shaping up for the final stretch.',
      outline: '1. Form guide\n2. Remaining fixtures\n3. Tactical strengths\n4. Key players\n5. Prediction',
      content: '# Premier League Run-in\n\nThe final weeks of the season always compress pressure and opportunity. This sample published article shows how the public site renders long-form sports analysis with headings, metadata, and feature imagery.\n\n## Scheduling pressure\nTop teams are balancing league football, cups, and injuries. Squad depth now matters as much as starting quality.\n\n## Midfield control\nMatches between direct rivals are often decided by who can control transitions and protect the half-spaces.\n\n## Final word\nExpect momentum swings, but defensive consistency should define the champion.',
      featureImage: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1200&q=80',
      tags: 'football,premier-league,title-race',
      metaTitle: 'Premier League title race analysis',
      metaDescription: 'A sample football blog post covering the Premier League title race.',
      status: BlogStatus.published,
      generatedByAI: false,
      approvedById: admin.id,
      publishedAt: new Date(),
      authorName: 'Editorial Team',
    },
    {
      title: 'India vs Australia ODI Analysis: Why Middle Overs Matter',
      slug: 'india-vs-australia-odi-middle-overs-analysis',
      categoryId: cricket.id,
      summary: 'Breaking down tempo shifts, bowling plans, and batting risk during the decisive middle overs.',
      outline: '1. Match context\n2. Powerplay recap\n3. Middle overs squeeze\n4. Death overs setup\n5. Lessons learned',
      content: '# India vs Australia ODI Analysis\n\nThis sample cricket article demonstrates category pages, search, and filters.\n\n## Spin versus strike rotation\nThe best ODI batting units avoid stagnation by rotating strike and attacking the right matchup.\n\n## Bowling discipline\nContainment in overs 15 to 40 often forces the risky shot that changes the innings.\n\n## Takeaway\nThe middle overs remain the tactical heartbeat of modern ODI cricket.',
      featureImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      tags: 'cricket,odi,india,australia',
      metaTitle: 'India vs Australia ODI middle overs analysis',
      metaDescription: 'A sample cricket blog post focused on ODI strategy.',
      status: BlogStatus.published,
      generatedByAI: false,
      approvedById: admin.id,
      publishedAt: new Date(),
      authorName: 'Editorial Team',
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
}

main()
  .then(() => console.log('Seed completed successfully.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
