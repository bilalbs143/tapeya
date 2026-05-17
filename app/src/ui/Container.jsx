/**
 * Page container - handles safe areas and max width
 */

export function Container({ children, className = '', fullWidth = false }) {
  return (
    <div className={`mx-auto px-4 py-4 ${fullWidth ? 'w-full' : 'max-w-2xl lg:w-full lg:max-w-none'} ${className}`}>
      {children}
    </div>
  );
}
