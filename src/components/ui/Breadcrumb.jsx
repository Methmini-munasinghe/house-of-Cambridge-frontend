import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 py-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <FiChevronRight size={14} className="text-gray-300" aria-hidden="true" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-[#FFB700] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1A1A1A] font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}