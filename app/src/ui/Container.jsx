/**
 * Page container - handles safe areas and max width
 */

export function Container({ children, className = '', fullWidth = false }) {
  return (
    <div
      className={`mx-auto px-4 py-6 ${fullWidth ? 'w-full' : 'max-w-2xl'} ${className}`}
    >
      {children}
    </div>
  );
}
