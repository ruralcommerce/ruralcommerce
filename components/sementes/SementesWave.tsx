export function SementesStage({ className = '' }: { className?: string }) {
  return (
    <div className={`sementes-stage ${className}`} aria-hidden>
      <div className="sementes-stage-grid" />
      <div className="sementes-stage-blob sementes-stage-blob-teal" />
      <div className="sementes-stage-blob sementes-stage-blob-blue" />
      <img className="sementes-stage-mark" src="/images/icone-branco.png" alt="" />
    </div>
  );
}

export function SementesHud() {
  return (
    <div className="sem-hud" aria-hidden>
      <span className="sem-hud-corner is-tl" />
      <span className="sem-hud-corner is-tr" />
      <span className="sem-hud-corner is-bl" />
      <span className="sem-hud-corner is-br" />
    </div>
  );
}

export function SementesLogo({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const height = size === 'lg' ? 'h-12 sm:h-14' : size === 'sm' ? 'h-8' : 'h-10';
  return (
    <img
      src="/images/logo-branco.png"
      alt="Rural Commerce"
      className={`${height} w-auto object-contain ${className}`}
    />
  );
}
