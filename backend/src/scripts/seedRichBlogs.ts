import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_blog';

async function seedRichBlogs() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  const usersCollection = db.collection('users');
  const postsCollection = db.collection('posts');
  const commentsCollection = db.collection('comments');

  // Password for all seeded demo authors: Password123!
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  const demoAuthors = [
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@techfrontier.io',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Principal Distributed Systems Architect & Rust Evangelist. Writing about cloud scalability and low-latency design.',
      password: defaultPasswordHash,
      provider: 'local',
      tokenVersion: 0,
      createdAt: new Date(Date.now() - 15 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@designsystem.co',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Design Director & UI/UX Specialist. Exploring spatial computing, micro-interactions, and brutalist digital typography.',
      password: defaultPasswordHash,
      provider: 'local',
      tokenVersion: 0,
      createdAt: new Date(Date.now() - 20 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Sophia Chen',
      email: 'sophia.chen@aiinsights.dev',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'AI Research Scientist & Neuromorphic Computing enthusiast. Demystifying Transformer models and LLM agent architectures.',
      password: defaultPasswordHash,
      provider: 'local',
      tokenVersion: 0,
      createdAt: new Date(Date.now() - 25 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Liam Gallagher',
      email: 'liam.g@devsecops.tech',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Offensive Security Researcher & Infrastructure Engineer. Specializing in container security, eBPF, and zero-trust networks.',
      password: defaultPasswordHash,
      provider: 'local',
      tokenVersion: 0,
      createdAt: new Date(Date.now() - 30 * 86400000),
      updatedAt: new Date(),
    },
  ];

  const authorIds = [];

  for (const author of demoAuthors) {
    const existing = await usersCollection.findOne({ email: author.email });
    if (existing) {
      authorIds.push({ id: existing._id, name: existing.name, avatar: existing.avatar });
      console.log(`Author exists: ${author.name}`);
    } else {
      const res = await usersCollection.insertOne(author);
      authorIds.push({ id: res.insertedId, name: author.name, avatar: author.avatar });
      console.log(`Created author: ${author.name}`);
    }
  }

  const blogs = [
    {
      title: 'Architecting for Zero-Downtime: Resilient Microservices in 2026',
      slug: 'architecting-zero-downtime-resilient-microservices-2026',
      excerpt: 'How leading engineering teams design self-healing cloud architectures with circuit breakers, graceful degradation, and distributed tracing.',
      content: `### The Myth of 100% Uptime

In distributed cloud architectures, node failures, network partitions, and cascading outages are inevitable laws of physics. High availability isn't about avoiding failures—it is about orchestrating resilience when subsystems fail.

#### 1. The Circuit Breaker Pattern
When downstream payment gateways or inventory services stall, continuous retry storms exacerbate latency. Implementing an adaptive breaker allows services to fail fast and serve stale read-replicas or graceful fallbacks.

\`\`\`typescript
const breaker = new CircuitBreaker(paymentGatewayFetch, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});
\`\`\`

#### 2. Graceful Degradation
When load spikes beyond 500,000 req/min, non-essential operations like real-time analytics pipelines and recommendation feeds are dialed down asynchronously, keeping transaction-critical checkout pathways crystal clear.

#### 3. Ephemeral Canary Deployments
With modern Kubernetes service meshes, traffic splitting allows rolling out micro-updates to 2% of real traffic while anomaly detection monitors p99 latency spikes in real-time.`,
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
      tags: ['Architecture', 'DevOps', 'Cloud', 'Microservices'],
      status: 'published',
      author: authorIds[0].id,
      views: 1420,
      likes: 89,
      deletedAt: null,
      createdAt: new Date(Date.now() - 5 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      title: 'The Renaissance of Minimalist UI & Spatial Typography',
      slug: 'renaissance-minimalist-ui-spatial-typography',
      excerpt: 'Why modern interface design is abandoning chaotic gradients in favor of high-contrast Swiss typography, tactile feedback, and generative layouts.',
      content: `### The Return to Intentionality

Over the last decade, interfaces became noisy playgrounds of competing neon gradients, heavy drop shadows, and visual clutter. In 2026, we are witnessing a return to clarity: typographic hierarchy, crisp grid alignment, and micro-interactions that feel as physical as mechanical switches.

#### The Power of Whitespace
Whitespace is not empty space; it is structural breathing room. Giving elements rhythm allows users to consume data-dense dashboards without cognitive overload.

#### Tactile Micro-Animations
Spring physics and low-latency easing give interfaces weight. When a card expands or a drawer slides, it should respect velocity rather than arbitrary linear duration curves.

> "Good design is as little design as possible." — Dieter Rams

#### Contrast & Accessibility First
Aesthetic elegance does not require sacrificing readability. High-contrast typography paired with subtle ambient shadows produces timeless, accessible software.`,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      tags: ['Design', 'UI/UX', 'Typography', 'Frontend'],
      status: 'published',
      author: authorIds[1].id,
      views: 2890,
      likes: 215,
      deletedAt: null,
      createdAt: new Date(Date.now() - 4 * 86400000),
      updatedAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      title: 'Autonomous Agents & Multi-Modal Intelligence: Beyond Chatbots',
      slug: 'autonomous-agents-multimodal-intelligence-beyond-chatbots',
      excerpt: 'Exploring the transition from conversational prompts to self-correcting autonomous multi-agent swarms that plan, test, and execute complex workflows.',
      content: `### The Shift from Dialogue to Execution

The first wave of AI introduced conversational assistants. The current wave is about **agency**—systems endowed with tool execution, stateful memory graphs, and self-reflective iteration loops.

#### Multi-Agent Orchestration
Instead of relying on a single monolithic prompt, tasks are split across specialized subagents:
- **Architect Agent:** Breaks high-level requirements into verifiable subgoals.
- **Coder Agent:** Writes modular, typed functions.
- **Reviewer Agent:** Formulates unit tests, executes them against edge-cases, and triggers self-correction loops.

\`\`\`mermaid
graph TD
  User((User Goal)) --> Planner[Planner Agent]
  Planner --> Exec[Execution Subagent]
  Exec --> Test[Test & Verification]
  Test -- Failure --> Exec
  Test -- Success --> Complete[Validated Artifact]
\`\`\`

#### Context Compression & Reasoning Trees
Through speculative decoding and retrieval-augmented reasoning, agents can inspect gigabyte-sized codebases without losing context or hallucinating interfaces.`,
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80',
      tags: ['AI', 'Machine Learning', 'Future Tech'],
      status: 'published',
      author: authorIds[2].id,
      views: 3410,
      likes: 312,
      deletedAt: null,
      createdAt: new Date(Date.now() - 3 * 86400000),
      updatedAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      title: 'Hardening Cloud Infrastructure: An Offensive Security Field Guide',
      slug: 'hardening-cloud-infrastructure-offensive-security-field-guide',
      excerpt: 'Practical penetration testing insights into IAM privilege escalation, supply chain vulnerabilities, and container runtime breakouts.',
      content: `### Think Like an Adversary

Defenders focus on checklist compliance; attackers focus on dependency graphs. The easiest route into a hardened cluster is rarely an unpatched zero-day—it is almost always an over-permissioned service account or a misconfigured metadata service.

#### 1. The IAM Blast Radius
Never grant wildcard \`*\` actions. If a lambda function only requires read access to an S3 bucket prefix, enforce strict scoped ARN permissions with conditions on IP origin and TLS versions.

#### 2. eBPF-Powered Kernel Telemetry
Traditional host agents that poll \`/proc\` miss rapid container escapes. By attaching eBPF probes directly into syscall entry points, anomalous socket connections and unauthorized privilege escalations are caught in milliseconds.

\`\`\`bash
# Real-time monitoring of unexpected process spawning in worker pods
sudo trace -e execve 'name=="kubelet"'
\`\`\`

#### 3. Immutable Ephemeral Infrastructure
Servers should be cattle, not pets. If a suspicious binary is detected on an EC2 instance or pod, do not attempt manual forensics in-place—terminate the instance and rebuild from a cryptographically signed golden image.`,
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
      tags: ['Cybersecurity', 'DevSecOps', 'Cloud', 'Linux'],
      status: 'published',
      author: authorIds[3].id,
      views: 1980,
      likes: 144,
      deletedAt: null,
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      title: 'Building Real-time Collaborative Engines in Modern Web Apps',
      slug: 'building-realtime-collaborative-engines-modern-web-apps',
      excerpt: 'Deep-dive into Conflict-Free Replicated Data Types (CRDTs), optimistic state updates, and distributed WebSocket state sync.',
      content: `### Multiplayer Software is the New Standard

From Figma and Notion to Linear and modern code editors, users expect instantaneous live collaboration with zero lag and zero data loss.

#### CRDTs vs Operational Transformation (OT)
While Operational Transformation requires a centralized coordinator to arbitrate concurrent edits, CRDTs allow distributed peers to converge on identical state deterministically without lock contention.

- **State-based CRDTs:** Exchange full summaries of local mutation vectors.
- **Operation-based CRDTs:** Broadcast immutable atomic delta operations across WebSocket channels.

#### Local-First Optimistic Feedback
Users should never wait for network roundtrips to see their own keystrokes. Update local state immediately, apply transient rollback buffers, and resolve incoming network patches seamlessly in the background.`,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      tags: ['Web Development', 'React', 'Distributed Systems'],
      status: 'published',
      author: authorIds[0].id,
      views: 2150,
      likes: 178,
      deletedAt: null,
      createdAt: new Date(Date.now() - 1 * 86400000),
      updatedAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      title: 'Mastering Full-Stack TypeScript: From Database to Design Token',
      slug: 'mastering-fullstack-typescript-database-to-design-token',
      excerpt: 'End-to-end type safety across MERN applications: sharing schemas with Joi, strict DTO mappings, and resilient React state boundaries.',
      content: `### The Power of Single-Language Codebases

When the backend database models, REST contracts, and frontend state stores speak the exact same language, entire classes of runtime errors vanish.

#### 1. Boundary Validation
Never trust client inputs without sanitization. Joi and Zod schemas act as border guards, stripping unexpected properties before they ever reach business logic:

\`\`\`typescript
export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  excerpt: Joi.string().max(500).required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).max(10),
});
\`\`\`

#### 2. DTO Projections
Prevent database schema leaks by transforming internal Mongoose documents into clean Data Transfer Objects before serialization. Exclude passwords, internal salt hashes, and internal flags.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',
      tags: ['TypeScript', 'Fullstack', 'NodeJS', 'React'],
      status: 'published',
      author: authorIds[1].id,
      views: 3100,
      likes: 240,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const blog of blogs) {
    const existing = await postsCollection.findOne({ slug: blog.slug });
    if (existing) {
      await postsCollection.updateOne({ slug: blog.slug }, { $set: blog });
      console.log(`Updated blog: "${blog.title}"`);
    } else {
      const res = await postsCollection.insertOne(blog);
      console.log(`Created blog: "${blog.title}"`);

      // Add a couple of realistic comments to the blog
      await commentsCollection.insertMany([
        {
          post: res.insertedId,
          author: authorIds[2].id,
          content: 'Tremendous write-up! The section on circuit breakers and fault tolerance is especially well articulated.',
          status: 'visible',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          post: res.insertedId,
          author: authorIds[3].id,
          content: 'Great insights. We applied a similar strategy in our production cluster last quarter and saw p99 latency cut by 45%.',
          status: 'visible',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  }

  console.log('\n--- SEED COMPLETE ---');
  console.log(`Seeded ${demoAuthors.length} distinct authors with custom avatars.`);
  console.log(`Seeded ${blogs.length} rich articles with high-resolution Unsplash covers and engaging content.`);
  console.log('All demo accounts have password: Password123!');
  
  await mongoose.disconnect();
}

seedRichBlogs().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
