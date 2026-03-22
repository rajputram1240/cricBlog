import { BlogStatus, PredictionPurchaseStatus, TicketStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { serializeTicketForViewer } from '@/lib/tickets';
import { getAdminChatData } from '@/lib/chat';
import { blogInputSchema } from '@/lib/validators';

const siteContentDefaults: Record<string, { title: string; description: string; body: string }> = {
  about: {
    title: 'About SportsDraft Daily',
    description: 'Learn how SportsDraft Daily publishes football and cricket coverage with an AI-assisted, admin-reviewed workflow.',
    body: 'SportsDraft Daily is built for football and cricket fans who want fast, readable, and trustworthy updates. Every article starts with a strong newsroom workflow: draft generation, admin editing, image upload, quality review, and final publication. We combine speed and consistency so fans can discover breaking stories, match previews, analysis, and community-focused content in one place.',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Understand how SportsDraft Daily handles reader privacy, contact information, and site security.',
    body: 'We only collect the information needed to improve site performance, manage contact requests, and secure the platform. Draft content remains private inside the admin workflow until it is reviewed and published. We do not expose unpublished newsroom material to public readers, and we aim to keep data handling simple, clear, and responsible.',
  },
  partner: {
    title: 'Partner With Us',
    description: 'Explore sponsorship, branded content, and sports media collaboration opportunities with SportsDraft Daily.',
    body: 'SportsDraft Daily works with brands, clubs, organizers, and media partners who want to reach passionate football and cricket audiences. Our admin workflow supports campaign planning, content uploads, review cycles, and final approval before launch. If you want to collaborate on branded stories, sponsored coverage, or fan community activations, this is the place to start.',
  },
};

export async function getPublishedPosts(params?: { category?: string; query?: string; date?: string }) {
  const where = {
    status: BlogStatus.published,
    ...(params?.category ? { category: { slug: params.category } } : {}),
    ...(params?.query
      ? {
          OR: [
            { title: { contains: params.query } },
            { summary: { contains: params.query } },
            { content: { contains: params.query } },
            { tags: { contains: params.query } },
          ],
        }
      : {}),
    ...(params?.date
      ? {
          publishedAt: {
            gte: new Date(`${params.date}T00:00:00.000Z`),
            lte: new Date(`${params.date}T23:59:59.999Z`),
          },
        }
      : {}),
  };

  return prisma.blogPost.findMany({
    where,
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getTicketMarketplace(fanId?: string) {
  const tickets = await prisma.matchTicket.findMany({
    include: {
      seller: true,
      soldBid: { include: { bidder: true } },
      bids: { include: { bidder: true }, orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }] },
    },
    orderBy: [{ status: 'asc' }, { matchDate: 'asc' }, { createdAt: 'desc' }],
  });

  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

  const activeSale = fanId
    ? await prisma.matchTicket.findFirst({
        where: {
          sellerId: fanId,
          status: TicketStatus.open,
        },
      })
    : null;

  const dailyTicket = fanId
    ? await prisma.matchTicket.findFirst({
        where: {
          sellerId: fanId,
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: 'desc' },
      })
    : null;

  return { tickets: tickets.map((ticket) => serializeTicketForViewer(ticket, fanId)), activeSale, dailyTicket };
}

export async function getPredictionHubData(fanId?: string, masterId?: string) {
  const [posts, myPurchases, masterPurchases] = await Promise.all([
    prisma.predictionPost.findMany({
      include: {
        master: true,
        purchases: fanId ? { where: { buyerId: fanId } } : false,
      },
      orderBy: { createdAt: 'desc' },
    }),
    fanId
      ? prisma.predictionPurchase.findMany({
          where: { buyerId: fanId },
          include: { post: { include: { master: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    masterId
      ? prisma.predictionPurchase.findMany({
          where: { masterId },
          include: { buyer: true, post: true },
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        })
      : Promise.resolve([]),
  ]);

  return {
    posts: posts.map((post) => {
      const myPurchase = Array.isArray(post.purchases) ? post.purchases[0] ?? null : null;
      return {
        id: post.id,
        matchTitle: post.matchTitle,
        title: post.title,
        content: post.content,
        fee: post.fee,
        chanceToWin: post.chanceToWin,
        createdAt: post.createdAt,
        master: {
          id: post.master.id,
          name: post.master.name,
          upiId: post.master.upiId,
        },
        reveal: myPurchase?.status === PredictionPurchaseStatus.approved ? {
          slipId: post.slipId,
          platform: post.platform,
        } : null,
        myPurchase: myPurchase ? {
          id: myPurchase.id,
          status: myPurchase.status,
          buyerPhone: myPurchase.buyerPhone,
          buyerEmail: myPurchase.buyerEmail,
          utr: myPurchase.utr,
          requestedAt: myPurchase.requestedAt,
          approvedAt: myPurchase.approvedAt,
          masterNote: myPurchase.masterNote,
        } : null,
      };
    }),
    myPurchases,
    masterPurchases,
  };
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug }, include: { category: true, approvedBy: true } });
}

export async function getSiteContent(slug: keyof typeof siteContentDefaults | string) {
  const entry = await prisma.siteContent.findUnique({ where: { slug } });
  const fallback = siteContentDefaults[slug] || siteContentDefaults.about;

  return entry || {
    slug,
    title: fallback.title,
    description: fallback.description,
    body: fallback.body,
  };
}

export async function getAllSiteContent() {
  const entries = await prisma.siteContent.findMany({ orderBy: { slug: 'asc' } });

  return Object.entries(siteContentDefaults).map(([slug, fallback]) => {
    const entry = entries.find((item) => item.slug === slug);
    return entry || { slug, ...fallback };
  });
}

export async function saveSiteContent(input: { slug: string; title: string; description: string; body: string }) {
  const fallback = siteContentDefaults[input.slug] || siteContentDefaults.about;

  return prisma.siteContent.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title || fallback.title,
      description: input.description || fallback.description,
      body: input.body || fallback.body,
    },
    create: {
      slug: input.slug,
      title: input.title || fallback.title,
      description: input.description || fallback.description,
      body: input.body || fallback.body,
    },
  });
}

export async function getAdminDashboardData() {
  const [categories, posts, siteContent, chat] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.blogPost.findMany({ include: { category: true }, orderBy: { updatedAt: 'desc' } }),
    getAllSiteContent(),
    getAdminChatData(),
  ]);

  return {
    categories,
    posts,
    siteContent,
    chat,
    stats: {
      total: posts.length,
      football: posts.filter((post) => post.category.slug === 'football').length,
      cricket: posts.filter((post) => post.category.slug === 'cricket').length,
      pending: posts.filter((post) => ['draft', 'pending_review'].includes(post.status)).length,
      approved: posts.filter((post) => post.status === 'approved').length,
      published: posts.filter((post) => post.status === 'published').length,
    },
  };
}

export async function saveBlogPost(input: unknown, id?: string, approvedById?: string) {
  const parsed = blogInputSchema.parse(input);
  const payload = {
    ...parsed,
    slug: slugify(parsed.slug || parsed.title),
    featureImage: parsed.featureImage || null,
    approvedById: ['approved', 'published'].includes(parsed.status) ? approvedById : null,
    publishedAt: parsed.status === 'published' ? new Date(parsed.publishedAt || new Date().toISOString()) : null,
  };

  if (id) {
    return prisma.blogPost.update({ where: { id }, data: payload, include: { category: true } });
  }

  return prisma.blogPost.create({ data: payload, include: { category: true } });
}
