import { useRef, type CSSProperties } from 'react';
import SectionMarks from '@/components/SectionMarks';
import ProjectsCanvasField from './ProjectsCanvasField';
import ProjectDirectory from './ProjectDirectory';
import ProjectsSnowField from './ProjectsSnowField';
import { useProjectsTransitionCursor } from './useProjectsTransitionCursor';
import { useProjectsTransitionMotion } from './useProjectsTransitionMotion';
import './projects-transition.css';

const TITLE_TEXT = 'YIKAI CHEN / PROJECTS';
const titleSlices = Array.from({ length: 32 }, (_, index) => index);
const STATEMENT_COPY = [
  'Below is a selection of work and experiments. I enjoy taking an idea from its first spark to a real experience—through design, code, and the work of making it useful.',
  'Some pieces are still early, but each marks a stage of learning, testing, and moving forward. I hope you find a little of my curiosity, momentum, and care for making ideas real.',
];
const STATEMENT_COPY_ZH = '我把一些走过的路留在这里。它们从零散的念头开始，经过反复的构思、屏幕前的深夜，以及一次次推翻重来，才慢慢有了今天的模样。有些已经完成，有些仍在途中；但无论成熟或青涩，都藏着我在某个时刻认真相信过的东西。作品不会替人解释一切，却会留下选择、犹豫与坚持的痕迹。愿你翻看这些页面时，恰好读到其中一点未被说尽的心意。';

function sliceStyle(index: number): CSSProperties {
  const sliceWidth = 100 / titleSlices.length;
  return {
    '--slice-left': `${index * sliceWidth}%`,
    '--slice-width': `${sliceWidth + 0.08}%`,
    '--slice-offset': `${(index / titleSlices.length) * 100}cqw`,
  } as CSSProperties;
}

function SlicedMasthead() {
  return (
    <span className="projects-transition__title-line" aria-hidden="true">
      {titleSlices.map(index => (
        <span
          className="projects-transition__title-slice"
          data-transition-letter
          data-transition-title-slice
          key={index}
          style={sliceStyle(index)}
        >
          <span data-transition-title-copy>{TITLE_TEXT}</span>
        </span>
      ))}
    </span>
  );
}

function SplitStatement({ copy }: { copy: string }) {
  const words = copy.split(' ');

  return (
    <p className="projects-transition__statement-paragraph">
      {words.map((word, index) => (
        <span className="projects-transition__statement-word" data-transition-body-word key={`${word}-${index}`}>
          <span data-transition-body-copy>{word}{index < words.length - 1 ? ' ' : ''}</span>
        </span>
      ))}
    </p>
  );
}

export default function ProjectsTransition() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);

  useProjectsTransitionMotion(rootRef);
  useProjectsTransitionCursor(rootRef, canvasRef, crosshairRef);

  return (
    <section ref={rootRef} id="projects" className="projects-transition" aria-labelledby="projects-transition-title">
      <div className="projects-transition__stage">
        <SectionMarks />
        <div className="projects-transition__veil" data-transition-veil aria-hidden="true" />
        <div className="projects-transition__paper-grid" aria-hidden="true" />
        <div className="projects-transition__noise" aria-hidden="true"><ProjectsSnowField /></div>
        <ProjectsCanvasField />
        <canvas ref={canvasRef} className="projects-transition__ink" aria-hidden="true" />
        <div ref={crosshairRef} className="projects-transition__crosshair" aria-hidden="true">
          <i className="projects-transition__crosshair-line projects-transition__crosshair-line--x" />
          <i className="projects-transition__crosshair-line projects-transition__crosshair-line--y" />
        </div>

        <h2 id="projects-transition-title" className="projects-transition__title" aria-label="Yikai Chen projects">
          <SlicedMasthead />
        </h2>

        <p className="projects-transition__index" data-transition-copy>03 / PROLOGUE</p>

        <div className="projects-transition__statement">
          <div className="projects-transition__statement-language" lang="en">
            {STATEMENT_COPY.map(copy => <SplitStatement copy={copy} key={copy} />)}
          </div>
          <div className="projects-transition__statement-language projects-transition__statement-language--zh" lang="zh-CN">
            <p className="projects-transition__statement-paragraph" data-transition-copy>{STATEMENT_COPY_ZH}</p>
          </div>
          <p className="projects-transition__next">NEXT / SELECTED WORK</p>
        </div>

        <ProjectDirectory />

        <div className="projects-transition__footer" data-transition-copy>
          <span>FROM CURIOSITY TO CRAFT</span>
          <span>SCROLL INTO THE ARCHIVE</span>
          <svg className="projects-transition__archive-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
