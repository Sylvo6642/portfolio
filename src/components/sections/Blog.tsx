import { motion } from 'framer-motion';
import { useState } from 'react';
import { SectionHeader } from '../shared/SectionHeader';
import { BlogModal } from '../shared/BlogModal';
import { BLOG_POSTS, type BlogPost } from '../../data/courses';

export function Blog() {
  const [active, setActive] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="relative py-32 hairline-b">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          index="07"
          label={`Notes — ${BLOG_POSTS.filter(p => p.content).length} published`}
          title="Notes & writing"
          sub="Learning in public. Notes from the rabbit hole."
        />

        <div
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.15 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className={`shimmer p-6 hairline bg-bg/40 backdrop-blur-sm group ${post.content ? 'cursor-pointer hover:bg-fg/[0.04] transition-colors' : ''}`}
              data-cursor={post.content ? 'hover' : undefined}
              onClick={() => post.content && setActive(post)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fg/70 border border-fg/20 px-2 py-0.5">
                  {post.tag}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {post.date ?? `/${String(i + 1).padStart(2, '0')}`}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-normal tracking-[-0.02em] leading-snug">{post.title}</h3>
              <div className="mt-8 flex items-center justify-between text-xs text-muted">
                <span className="font-mono uppercase tracking-[0.15em]">{post.content ? 'published' : 'draft'}</span>
                {post.content && (
                  <span className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.15em] transition-transform group-hover:translate-x-1">
                    read ↗
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
