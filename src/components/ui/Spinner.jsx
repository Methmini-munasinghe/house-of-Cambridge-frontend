const SIZE_MAP = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md' }) {
  const cls = SIZE_MAP[size] ?? SIZE_MAP.md;
  return (
    <div
      className={`${cls} border-gray-200 border-t-[#FFB700] rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}