import './PersonalLogo.css';

type PersonalLogoProps = {
  className?: string;
};

export default function PersonalLogo({ className = '' }: PersonalLogoProps) {
  return (
    <span
      className={['personal-logo', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}
