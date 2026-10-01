import type { User, Post, Comment } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Founder & editor-in-chief. Passionate about web technology and clean design.',
    joinedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'u2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Full-stack developer writing about JavaScript, TypeScript, and best practices.',
    joinedAt: '2024-03-22T10:30:00Z',
  },
  {
    id: 'u3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'UI/UX designer sharing tips on creating beautiful, accessible interfaces.',
    joinedAt: '2024-05-10T14:00:00Z',
  },
  {
    id: 'u4',
    name: 'David Kim',
    email: 'david@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=7',
    bio: 'DevOps engineer exploring cloud architecture and CI/CD pipelines.',
    joinedAt: '2024-07-01T09:15:00Z',
  },
  {
    id: 'u5',
    name: 'Lisa Wang',
    email: 'lisa@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: 'Product manager writing about agile methodologies and team productivity.',
    joinedAt: '2024-08-20T11:45:00Z',
  },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    title: 'Getting Started with React Server Components',
    slug: 'getting-started-with-react-server-components',
    excerpt: 'A practical guide to understanding and adopting React Server Components in your next project.',
    content: `React Server Components (RSC) represent a fundamental shift in how we think about React applications. Unlike traditional client-side React, Server Components render entirely on the server, sending zero JavaScript to the client.

## Why Server Components?

The biggest advantage is the reduction in client-side JavaScript. By moving rendering to the server, we can:

- Reduce bundle size significantly
- Access backend resources directly
- Keep large dependencies server-side
- Improve initial page load times

## How They Work

Server Components can fetch data directly from databases or APIs without needing API routes. They serialize their output and send it to the client, where Client Components hydrate the interactive parts.

\`\`\`jsx
// Server Component — no "use client" directive
async function BlogList() {
  const posts = await db.posts.findAll();
  return posts.map(post => <Article key={post.id} {...post} />);
}
\`\`\`

## Mixing Server and Client Components

The real power comes from mixing both types. Use Server Components for data-heavy, non-interactive parts, and Client Components for anything that needs state, effects, or event handlers.

The key rule: Client Components can't import Server Components directly, but Server Components can pass Server Components as children to Client Components.`,
    coverImage: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['React', 'JavaScript', 'Frontend'],
    status: 'published',
    authorId: 'u2',
    authorName: 'Marcus Johnson',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-09-15T10:00:00Z',
    views: 3421,
    likes: 87,
  },
  {
    id: 'p2',
    title: 'Designing Accessible Color Systems',
    slug: 'designing-accessible-color-systems',
    excerpt: 'Learn how to build color palettes that look great and meet WCAG accessibility standards.',
    content: `Accessibility in design isn't just about meeting legal requirements — it's about making your product usable for everyone. Color is one of the most impactful areas to get right.

## Understanding WCAG Contrast Requirements

WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text.

## Building a Token System

Start by defining semantic tokens rather than raw hex values:

- \`text-primary\` — main text color
- \`text-secondary\` — muted text
- \`bg-surface\` — card backgrounds
- \`bg-base\` — page background

This approach lets you swap entire themes while maintaining contrast ratios.

## Testing Your Palette

Always test with real content, not just color swatches. A color that passes contrast against white might fail against a light gray card background. Use automated tools like axe DevTools alongside manual review.`,
    coverImage: 'https://images.pexels.com/photos/6059383/pexels-photo-6059383.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Design', 'Accessibility', 'CSS'],
    status: 'published',
    authorId: 'u3',
    authorName: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    createdAt: '2024-09-20T14:30:00Z',
    updatedAt: '2024-09-22T09:00:00Z',
    views: 2156,
    likes: 64,
  },
  {
    id: 'p3',
    title: 'CI/CD Pipelines with GitHub Actions',
    slug: 'ci-cd-pipelines-with-github-actions',
    excerpt: 'Streamline your deployment workflow with automated testing and continuous delivery using GitHub Actions.',
    content: `Continuous Integration and Continuous Deployment (CI/CD) are essential practices for modern development teams. GitHub Actions provides a powerful, flexible way to automate your workflow.

## Key Concepts

A workflow is a configurable automated process made up of one or more jobs. Workflows are defined in YAML files stored in the \`.github/workflows\` directory.

## A Basic Workflow

Here's a workflow that runs tests on every push:

\`\`\`yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
\`\`\`

## Caching for Speed

Caching dependencies can dramatically reduce build times. Use \`actions/cache\` or the built-in caching in \`setup-node\` to persist \`node_modules\` between runs.`,
    coverImage: 'https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['DevOps', 'CI/CD', 'GitHub'],
    status: 'published',
    authorId: 'u4',
    authorName: 'David Kim',
    authorAvatar: 'https://i.pravatar.cc/150?img=7',
    createdAt: '2024-09-25T08:00:00Z',
    updatedAt: '2024-09-25T08:00:00Z',
    views: 1893,
    likes: 52,
  },
  {
    id: 'p4',
    title: 'Agile Retrospectives That Actually Work',
    slug: 'agile-retrospectives-that-actually-work',
    excerpt: "Transform your team's retros from boring meetings into powerful improvement engines.",
    content: `Retrospectives are the heartbeat of an agile team. Yet too many teams treat them as a box-ticking exercise. Here's how to make them count.

## Set the Stage

Start with a quick icebreaker. This helps team members transition from their individual work into a collaborative mindset.

## What Went Well, What Didn't, What Can We Improve?

The classic format works, but don't be afraid to experiment:

- **Start/Stop/Continue** — great for new teams
- **4Ls (Liked, Learned, Lacked, Longed For)** — deeper insights
- **Sailboat** — visual and engaging

## Action Items

Every retro should end with concrete, actionable items. Assign owners and due dates. Review them at the start of the next retro.`,
    coverImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Agile', 'Productivity', 'Management'],
    status: 'published',
    authorId: 'u5',
    authorName: 'Lisa Wang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    createdAt: '2024-09-28T15:00:00Z',
    updatedAt: '2024-09-28T15:00:00Z',
    views: 987,
    likes: 38,
  },
  {
    id: 'p5',
    title: 'TypeScript Generics: A Deep Dive',
    slug: 'typescript-generics-a-deep-dive',
    excerpt: 'Master TypeScript generics with practical examples, from basic to advanced patterns.',
    content: `Generics are one of TypeScript's most powerful features. They let you write reusable, type-safe code that works with any data type.

## The Basics

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}
\`\`\`

## Constraints

Use the \`extends\` keyword to constrain what types are allowed:

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
\`\`\`

## Conditional Types

Conditional types let you express type logic:

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
\`\`\`

## Practical Example: API Response Wrapper

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
\`\`\``,
    coverImage: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['TypeScript', 'JavaScript', 'Frontend'],
    status: 'published',
    authorId: 'u2',
    authorName: 'Marcus Johnson',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: '2024-09-29T10:00:00Z',
    updatedAt: '2024-09-29T10:00:00Z',
    views: 542,
    likes: 29,
  },
  {
    id: 'p6',
    title: 'Building a Design System from Scratch',
    slug: 'building-a-design-system-from-scratch',
    excerpt: 'A step-by-step guide to creating a scalable design system that your whole team will love using.',
    content: `A design system is more than a component library — it's a shared language for your team.

## Start with Tokens

Define your design tokens first: colors, typography, spacing, shadows. These are the atomic units everything else builds on.

## Component Library

Build components in tiers:
1. **Primitives** — buttons, inputs, badges
2. **Patterns** — forms, cards, navigation
3. **Templates** — page layouts

## Documentation

Good documentation is what makes a design system usable. Every component should have:
- A live preview
- Props/API documentation
- Usage guidelines
- Do/Don't examples`,
    coverImage: 'https://images.pexels.com/photos/1966452/pexels-photo-1966452.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Design', 'CSS', 'Frontend'],
    status: 'draft',
    authorId: 'u3',
    authorName: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    createdAt: '2024-09-27T12:00:00Z',
    updatedAt: '2024-09-28T16:00:00Z',
    views: 0,
    likes: 0,
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    authorId: 'u3',
    authorName: 'Emily Rodriguez',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Great breakdown! The part about mixing Server and Client components finally made it click for me.',
    createdAt: '2024-09-16T08:30:00Z',
    status: 'visible',
  },
  {
    id: 'c2',
    postId: 'p1',
    authorId: 'u4',
    authorName: 'David Kim',
    authorAvatar: 'https://i.pravatar.cc/150?img=7',
    content: 'Would love a follow-up post about data fetching patterns with RSC.',
    createdAt: '2024-09-17T11:00:00Z',
    status: 'visible',
  },
  {
    id: 'c3',
    postId: 'p2',
    authorId: 'u2',
    authorName: 'Marcus Johnson',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    content: 'The semantic token approach saved my team so much time when we switched to dark mode.',
    createdAt: '2024-09-21T09:45:00Z',
    status: 'visible',
  },
  {
    id: 'c4',
    postId: 'p3',
    authorId: 'u5',
    authorName: 'Lisa Wang',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    content: 'We just migrated from Jenkins to GitHub Actions and the caching tips here are gold.',
    createdAt: '2024-09-26T10:15:00Z',
    status: 'visible',
  },
  {
    id: 'c5',
    postId: 'p2',
    authorId: 'u4',
    authorName: 'David Kim',
    authorAvatar: 'https://i.pravatar.cc/150?img=7',
    content: 'Any recommended tools for automated contrast checking in CI?',
    createdAt: '2024-09-23T14:20:00Z',
    status: 'hidden',
  },
];
