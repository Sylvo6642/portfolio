import { motion } from 'framer-motion';
import { useState } from 'react';
import { SectionReveal } from '../shared/SectionReveal';
import { BlogModal } from '../shared/BlogModal';
import { BLOG_POSTS, type BlogPost } from '../../data/courses';

export function Blog() {
  const [active, setActive] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-6">
            06 / notes
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Notes & writing.
            </h2>
            <p className="font-mono text-xs text-muted">{BLOG_POSTS.filter(p => p.content).length} notes</p>
          </div>
        </SectionReveal>

        <div
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ perspective: 1200 }}
        >
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ rotateX: 90, opacity: 0, y: 20 }}
              whileInView={{ rotateX: 0, opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'top center' }}
              className={`shimmer rounded-2xl p-6 hairline bg-bg/40 backdrop-blur-sm group ${post.content ? 'cursor-pointer' : ''}`}
              data-cursor={post.content ? 'hover' : undefined}
              onClick={() => post.content && setActive(post)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent">
                  {post.tag}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {post.date ?? `/${String(i + 1).padStart(2, '0')}`}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-medium leading-snug">{post.title}</h3>
              <div className="mt-8 flex items-center justify-between text-xs text-muted">
                <span className="font-mono">{post.content ? 'published' : 'draft'}</span>
                {post.content && (
                  <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
                    read →
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <BlogModal post={active} onClose={() => setActive(null)} />
    </section>
  );
}
