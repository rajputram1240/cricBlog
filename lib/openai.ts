import OpenAI from 'openai';
import { slugify } from '@/lib/utils';

const schemaHint = `Return JSON only with keys: title, slug, category, summary, outline, content, tags, metaTitle, metaDescription.`;

export async function generateBlogDraft(params: { category: 'football' | 'cricket'; topic: string }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackDraft(params.category, params.topic);
  }

  const client = new OpenAI({ apiKey });
  const prompt = `You are a professional sports editor. Create a ${params.category} blog draft about "${params.topic}".
${schemaHint}
Rules: professional journalism tone, SEO-friendly, 800-1500 words, include headings/subheadings, tags as comma-separated string, keep category exactly ${params.category}, create a concise slug suggestion, content must remain a draft and should not mention it is AI-generated.`;

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
  });

  const text = response.output_text;
  const parsed = JSON.parse(text);
  return {
    ...parsed,
    slug: slugify(parsed.slug || parsed.title),
    category: params.category,
  };
}

function fallbackDraft(category: 'football' | 'cricket', topic: string) {
  const title = `${topic}: Key storylines to watch`;
  return {
    title,
    slug: slugify(title),
    category,
    summary: `A concise, SEO-friendly ${category} summary covering the latest angles around ${topic}.`,
    outline: `1. Why ${topic} matters now\n2. Tactical themes to monitor\n3. Players and matchups to watch\n4. Statistical trends\n5. Big-picture implications`,
    content: `# ${title}\n\n${topic} has become a major talking point in ${category} coverage, with coaches, players, and supporters all focusing on how the story could shape the next stage of the season. This fallback draft exists so the project works even before an OpenAI API key is configured.\n\n## Why the topic matters\nThe current landscape rewards teams that adapt quickly, manage fatigue, and execute specific tactical plans under pressure. That is why ${topic} deserves a closer look from both a performance and results perspective.\n\n## Tactical themes\nOne of the biggest factors is game-state control. Teams that can dictate tempo, win second balls, and create repeatable chances usually turn narrative momentum into results. In ${category}, these small swings often define headlines.\n\n## Key players and pressure points\nEvery major storyline comes down to execution from influential performers. Decision-making in transitions, composure in critical moments, and consistency across the full contest remain central to outcomes.\n\n## Statistical clues\nAnalysts increasingly use shot quality, territory control, strike rotation, expected threat, or phase efficiency to explain whether results are sustainable. Those metrics add useful context to the eye test and often support what coaches already suspect.\n\n## Final takeaway\n${topic} should stay prominent because it connects short-term performance with bigger strategic questions. This draft is ready for an admin editor to refine, add reporting context, upload a feature image, and move through approval before publication.`,
    tags: `${category},sports,analysis,${slugify(topic).replace(/-/g, ',')}`,
    metaTitle: `${topic} | ${category[0].toUpperCase() + category.slice(1)} analysis`,
    metaDescription: `Read a detailed ${category} analysis on ${topic}, including tactical angles, major storylines, and what it means next.`,
  };
}
