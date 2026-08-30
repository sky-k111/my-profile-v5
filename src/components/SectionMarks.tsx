import './SectionMarks.css';

export default function SectionMarks() {
  return (
    <div className="section-marks" aria-hidden="true">
      <i className="section-marks__corner section-marks__corner--top-left" />
      <i className="section-marks__corner section-marks__corner--bottom-right" />
    </div>
  );
}
