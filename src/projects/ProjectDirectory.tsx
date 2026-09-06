import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  PROJECT_MEDIA_REVEAL_MS,
  PROJECT_SWITCH_LOADING_MS,
  resolveProjectNameEmphasis,
  shouldStartProjectSwitch,
} from '../lib/project-directory-state';
import {
  resolveProjectMediaGalleryOffset,
  resolveProjectMediaReferenceTravel,
  resolveProjectMediaRollFromViewportTop,
  usesProjectMediaRoll,
} from '../lib/project-media-motion';
import DecryptedHeading from './DecryptedHeading';
import ProjectMediaGlitch from './ProjectMediaGlitch';
import ProjectMediaLoader from './ProjectMediaLoader';

type Project = {
  id: 'homepage' | 'ai-name' | 'trending-digest' | 'educanvas' | 'forge-sight';
  number: string;
  title: string;
  label: string;
  href: string;
  liveUrl?: string;
  stack: string[];
  notes: string[];
  mediaSrcs?: string[];
};

const PROJECTS: Project[] = [
  {
    id: 'homepage',
    number: '01',
    title: 'Homepage',
    label: 'Personal web experience',
    href: 'https://github.com/sky-k111/homepage',
    liveUrl: 'https://cyk-personal.xyz',
    stack: ['React 19', 'TypeScript', 'Vite', 'GSAP', 'Three.js'],
    notes: [
      '它诞生在期末周密不透风的间隙里，却一路从草稿走到了真正上线——这是我第一次独立完成从视觉构思、前端开发到部署的完整闭环，如今仍运行在 cyk-personal.xyz。',
      '现在回看，它还保留着初次创作的青涩：技术选择不够丰富，视觉语汇也显得克制甚至单一。但它像一枚起点坐标，让我第一次知道，React、TypeScript、GSAP 与 Three.js 可以被编排成一段关于自己的叙事。',
    ],
    mediaSrcs: [
      '/projects/homepage-01.mp4',
      '/projects/homepage-02.mp4',
      '/projects/homepage-03.mp4',
      '/projects/homepage-04.mp4',
      '/projects/homepage-05.mp4',
      '/projects/homepage-06.mp4',
      '/projects/homepage-07.mp4',
      '/projects/homepage-08.mp4',
      '/projects/homepage-09.mp4',
    ],
  },
  {
    id: 'ai-name',
    number: '02',
    title: 'AI Name',
    label: 'AI naming tool',
    href: 'https://github.com/sky-k111/ai-name',
    stack: ['Vue 3', 'Vite', 'Tailwind CSS', 'FastAPI', 'SQLAlchemy', 'DeepSeek', 'SQLite', 'JWT'],
    notes: [
      '它不只是“让 AI 吐出一个名字”。基础取名从姓氏、偏好与风格中生成候选；AI 名字分析继续拆解寓意、音律与文化联想；名字对比把模糊的喜欢变成可以权衡的判断；精品取名则给出更完整、更具方向感的方案。',
      'Vue 3、Vite 与 Tailwind CSS 塑造交互表层，FastAPI 和 SQLAlchemy 承接业务与数据，DeepSeek 负责生成与分析，JWT 与 bcrypt 守住身份边界。这个项目让我意识到，模型只是灵感的火种，真正的产品来自前后端、数据、安全与部署共同构成的闭环。',
    ],
    mediaSrcs: [
      '/projects/ai-name-01.mp4',
      '/projects/ai-name-02.mp4',
      '/projects/ai-name-03.mp4',
      '/projects/ai-name-04.mp4',
      '/projects/ai-name-05.mp4',
      '/projects/ai-name-06.mp4',
    ],
  },
  {
    id: 'trending-digest',
    number: '03',
    title: 'GitHub Trending Digest',
    label: 'Developer intelligence tool',
    href: 'https://github.com/sky-k111/gh-trending-digest',
    stack: ['Python', 'GitHub Actions', 'GitHub Search API', 'DeepSeek', 'QQ SMTP'],
    notes: [
      'GitHub 每天都在涌现值得收藏的工具，可真正有价值的内容常常淹没在信息流里。我想把“偶然发现”变成一种稳定抵达：日报送来 5–10 个新项目，周报留下本周 Top 10，月报再从语言分布与趋势中勾勒更长的脉络，它们都会准时抵达我的 QQ 邮箱。',
      'GitHub Actions 像一枚定时发条，唤醒 GitHub Search API 搜集候选；Python 完成整理与编排，DeepSeek 负责打分、筛选和摘要，最终由 QQ SMTP 把结果送出。原本需要反复搜索的日常动作，被折叠成一条安静、自主、持续运转的内容管线。',
    ],
    mediaSrcs: [
      '/projects/trending-digest-01.mp4',
      '/projects/trending-digest-02.mp4',
      '/projects/trending-digest-03.mp4',
    ],
  },
  {
    id: 'educanvas',
    number: '04',
    title: 'EduCanvas',
    label: 'Education agent platform',
    href: 'https://github.com/Timcai06/EduCanvas',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'pgvector', 'RAG', 'Agent Runtime'],
    notes: [
      '我们的起点，是不满足于再做一个只会回答问题的机器人。我们希望一个长期个人 Agent 能真正陪伴学习：Notebook 沉淀资料与上下文，RAG 在清晰边界内寻找依据，Canvas 接住阅读、创作与互动，而可信服务则让判分、掌握度与下一步建议不被模型的想象左右。',
      'Next.js 与 TypeScript 构成交互骨架，PostgreSQL、pgvector 和单一 Agent Runtime 承载长期状态与能力。更珍贵的是共同创造的过程：我们一起争论、推翻、验证，再把彼此尚未成形的念头接续下去。不同视角相撞时产生的灵感火花，最终也成为 EduCanvas 最鲜活的一部分。',
    ],
    mediaSrcs: [
      '/projects/educanvas-01.mp4',
      '/projects/educanvas-02.mp4',
      '/projects/educanvas-03.mp4',
      '/projects/educanvas-04.mp4',
      '/projects/educanvas-05.mp4',
      '/projects/educanvas-06.mp4',
      '/projects/educanvas-07.mp4',
      '/projects/educanvas-08.mp4',
    ],
  },
  {
    id: 'forge-sight',
    number: '05',
    title: 'ForgeSight',
    label: 'Enterprise data analysis agent',
    href: 'https://github.com/sky-k111/forge-sight',
    stack: ['React 19', 'Vite', 'Tailwind CSS', 'Recharts', 'FastAPI', 'LangGraph', 'MySQL', 'PostgreSQL'],
    notes: [
      'ForgeSight 想缩短的，是业务问题与可信答案之间那段漫长而专业的距离。使用者只需以自然语言发问，Agent 便沿着数据定位、SQL 生成、安全校验、只读执行、图表呈现与结论提炼逐层推进；每一步证据都被保留下来，让答案不仅可读，也可核对、可回溯。',
      'React 19、Vite、Tailwind CSS 与 Recharts 构成分析工作台，FastAPI、SQLAlchemy 和 LangGraph 编排澄清、分支与检查点，MySQL 承载只读业务数据，PostgreSQL 沉淀知识、会话和审计。这个项目让我更在意 AI 的边界：真正进入企业场景的智能，不只要敏锐，更要透明、克制并经得起追问。',
    ],
  },
];

function useVisibleVideo(videoRef: RefObject<HTMLVideoElement | null>, mediaSrc?: string) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaSrc || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: .08 });

    observer.observe(video);
    return () => observer.disconnect();
  }, [mediaSrc, videoRef]);
}

function ProjectMediaItem({ project, mediaSrc, index }: { project: Project; mediaSrc?: string; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRolled = usesProjectMediaRoll(index);
  useVisibleVideo(videoRef, mediaSrc);

  return (
    <article className="projects-transition__project-media-item" data-project-media-item>
      {mediaSrc ? (
        <video
          ref={videoRef}
          className="projects-transition__project-preview-video projects-transition__project-preview-surface"
          src={mediaSrc}
          muted
          loop
          playsInline
          preload={isRolled ? 'auto' : 'metadata'}
          aria-label={`${project.title} project preview ${index + 1}`}
        />
      ) : (
        <div className="projects-transition__project-preview-placeholder projects-transition__project-preview-surface" aria-label={`${project.title} media placeholder`}>
          <span>{project.number}</span>
          <strong>{project.title}</strong>
          <small>{project.label}</small>
        </div>
      )}
      {isRolled ? (
        <ProjectMediaGlitch
          itemIndex={index}
          number={project.number}
          title={project.title}
          label={project.label}
          videoRef={videoRef}
        />
      ) : null}
    </article>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  const renderNote = (note: string) => {
    if (!project.liveUrl || !note.includes('cyk-personal.xyz')) return note;
    const [before, after] = note.split('cyk-personal.xyz');
    return (
      <>
        {before}
        <a className="projects-transition__project-live-link" href={project.liveUrl} target="_blank" rel="noreferrer">cyk-personal.xyz</a>
        {after}
      </>
    );
  };

  return (
    <aside className="projects-transition__project-details" data-project-details aria-live="polite">
      <div className="projects-transition__project-detail-block">
        <p className="projects-transition__project-detail-label">STACK / {project.number}</p>
        <ul className="projects-transition__project-stack" aria-label={`${project.title} technology stack`}>
          {project.stack.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="projects-transition__project-detail-block">
        <p className="projects-transition__project-detail-label">NOTES / 一些想法</p>
        <div className="projects-transition__project-notes">
          {project.notes.map(note => <p className="projects-transition__project-note" key={note}>{renderNote(note)}</p>)}
        </div>
      </div>
    </aside>
  );
}

function ProjectMediaGallery({ project }: { project: Project }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    const rail = railRef.current;
    if (!media || !rail) return;

    const items = Array.from(rail.querySelectorAll<HTMLElement>('[data-project-media-item]'));
    let progress = Number(media.style.getPropertyValue('--project-media-gallery')) || 0;
    let travel = 0;
    let referenceTravel = 0;
    let viewportHeight = 0;
    let animationFrame = 0;
    const previousRollProgress = new Array<number>(items.length).fill(Number.NaN);

    const render = () => {
      animationFrame = 0;
      const offset = resolveProjectMediaGalleryOffset(travel, referenceTravel, progress);
      rail.style.transform = `translate3d(0, ${(-offset).toFixed(2)}px, 0)`;
      items.forEach((item, index) => {
        if (index === 0 || !usesProjectMediaRoll(index)) return;
        const itemRollProgress = resolveProjectMediaRollFromViewportTop(item.getBoundingClientRect().top, viewportHeight);
        if (Math.abs(itemRollProgress - previousRollProgress[index]) < 0.001) return;
        previousRollProgress[index] = itemRollProgress;
        item.dispatchEvent(new CustomEvent('projects-media-item-roll-progress', { detail: itemRollProgress }));
      });
    };
    const scheduleRender = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    };
    const measure = () => {
      viewportHeight = window.innerHeight;
      travel = Math.max(0, rail.scrollHeight - media.clientHeight);
      const itemPitch = items.length > 1
        ? Math.max(0, items[1].offsetTop - items[0].offsetTop)
        : items[0]?.offsetHeight ?? 0;
      referenceTravel = resolveProjectMediaReferenceTravel(travel, items.length, itemPitch);
      scheduleRender();
    };
    const handleProgress = (event: Event) => {
      const nextProgress = (event as CustomEvent<number>).detail;
      if (typeof nextProgress !== 'number') return;
      progress = Math.min(1, Math.max(0, nextProgress));
      scheduleRender();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(media);
    resizeObserver.observe(rail);
    window.addEventListener('projects-media-gallery-progress', handleProgress);
    measure();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('projects-media-gallery-progress', handleProgress);
    };
  }, [project.id]);

  const mediaItems = project.mediaSrcs?.length ? project.mediaSrcs : [undefined];

  return (
    <div ref={mediaRef} className="projects-transition__project-media" data-project-media>
      <div className="projects-transition__project-media-reveal-shell">
        <div ref={railRef} className="projects-transition__project-media-rail" data-project-media-rail>
          {mediaItems.map((mediaSrc, index) => (
            <ProjectMediaItem project={project} mediaSrc={mediaSrc} index={index} key={`${project.id}-${mediaSrc ?? 'placeholder'}-${index}`} />
          ))}
          <a href={project.href} target="_blank" rel="noreferrer" className="projects-transition__project-repository">
            View repository <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function ProjectCounter({ project, total }: { project: Project; total: string }) {
  return (
    <div
      className="projects-transition__project-counter"
      data-project-counter
      aria-label={`Project ${project.number} of ${total}`}
    >
      <span>{project.number}</span>
      <span>/{total}</span>
    </div>
  );
}

export default function ProjectDirectory() {
  const [activeId, setActiveId] = useState<Project['id']>('homepage');
  const [hoveredId, setHoveredId] = useState<Project['id'] | null>(null);
  const [pendingId, setPendingId] = useState<Project['id'] | null>(null);
  const [revealingId, setRevealingId] = useState<Project['id'] | null>(null);
  const switchTimeoutRef = useRef<number | undefined>(undefined);
  const revealTimeoutRef = useRef<number | undefined>(undefined);
  const pendingIdRef = useRef<Project['id'] | null>(null);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const activeProject = PROJECTS.find(project => project.id === activeId) ?? PROJECTS[0];
  const pendingProject = PROJECTS.find(project => project.id === pendingId);
  const revealingProject = PROJECTS.find(project => project.id === revealingId);
  const galleryProject = pendingProject ?? activeProject;
  const loaderProject = pendingProject ?? revealingProject;
  const projectTotal = String(PROJECTS.length).padStart(2, '0');

  const queueProjectSwitch = useCallback((nextId: Project['id']) => {
    if (pendingIdRef.current === nextId) return;
    window.clearTimeout(switchTimeoutRef.current);
    window.clearTimeout(revealTimeoutRef.current);
    setRevealingId(null);

    if (!shouldStartProjectSwitch(activeId, nextId)) {
      pendingIdRef.current = null;
      setPendingId(null);
      return;
    }

    pendingIdRef.current = nextId;
    setPendingId(nextId);
    switchTimeoutRef.current = window.setTimeout(() => {
      setActiveId(nextId);
      pendingIdRef.current = null;
      setPendingId(null);
      setRevealingId(nextId);
      revealTimeoutRef.current = window.setTimeout(() => {
        setRevealingId(null);
      }, PROJECT_MEDIA_REVEAL_MS);
    }, PROJECT_SWITCH_LOADING_MS);
  }, [activeId]);

  useEffect(() => () => {
    window.clearTimeout(switchTimeoutRef.current);
    window.clearTimeout(revealTimeoutRef.current);
  }, []);

  return (
    <section
      className="projects-transition__project-directory"
      data-project-directory
      data-project-switching={pendingProject ? '' : undefined}
      data-project-revealing={revealingProject ? '' : undefined}
      aria-label="Selected projects"
      aria-busy={loaderProject ? 'true' : undefined}
    >
      <h3 className="projects-transition__project-heading" data-project-directory-heading>
        <DecryptedHeading text="SELECTED WORKS" />
      </h3>

      <ProjectCounter project={activeProject} total={projectTotal} />

      <ul
        className="projects-transition__project-list"
      >
        {PROJECTS.map(project => {
          const isActive = project.id === activeId;
          const isSelected = project.id === (hoveredId ?? activeId);
          const emphasis = resolveProjectNameEmphasis(project.id, hoveredId);
          const selectProject = () => {
            setHoveredId(project.id);
            queueProjectSwitch(project.id);
          };

          return (
            <li key={project.id}>
              <button
                className="projects-transition__project-name"
                data-project-name
                data-project-id={project.id}
                data-project-emphasis={emphasis}
                type="button"
                onPointerEnter={event => {
                  pointerPositionRef.current = { x: event.clientX, y: event.clientY };
                }}
                onPointerMove={event => {
                  const previous = pointerPositionRef.current;
                  pointerPositionRef.current = { x: event.clientX, y: event.clientY };
                  if (event.pointerType !== 'touch' && previous &&
                    Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 0) selectProject();
                }}
                onFocus={event => {
                  if (event.currentTarget.matches(':focus-visible')) selectProject();
                }}
                onClick={() => {
                  queueProjectSwitch(project.id);
                  setHoveredId(project.id);
                }}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="projects-transition__project-name-main">
                  <span>{project.number}.</span> {project.title}
                </span>
                <small className="projects-transition__project-name-status" aria-hidden="true">
                  {isSelected ? 'SELECTED' : 'PREVIEW'} <span>{isSelected ? '•' : '→'}</span>
                </small>
              </button>
            </li>
          );
        })}
      </ul>

      <ProjectDetails project={activeProject} key={`details-${activeProject.id}`} />
      <ProjectMediaGallery project={galleryProject} />
      {loaderProject ? <ProjectMediaLoader projectTitle={loaderProject.title} /> : null}
    </section>
  );
}
