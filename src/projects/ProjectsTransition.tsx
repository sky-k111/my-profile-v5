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
const STATEMENT_COPY_ZH = '这些作品散落在不同的时间里，彼此陌生，又暗自相连。它们记录着不同阶段的目光，也保留着一路走来未曾完全褪去的痕迹——有最初的试探与青涩，也有后来逐渐形成的笃定与分寸。回头看，成长并不是某一个瞬间突然发生的，它更像是一条缓慢显现的路径：一次尝试，一次推翻，一次重新开始，一步一步，才有了今天的轮廓。于是我把它们收拢在这里，不只是为了呈现已经完成的作品，也想留下那些尚未成熟的判断、反复靠近的过程，以及时间如何悄悄改变了我观看和表达的方式。它们停留在各自的时刻，而我仍沿着那些未完的线索，继续向前。';

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
