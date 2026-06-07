/**
 * Round profile photo — gold frame, dark mat, optional overlap for the profile header banner.
 *
 * @param {object} props
 * @param {string} props.src
 * @param {string} props.name — `alt` text for the image
 * @param {boolean} [props.overlap=true] — when true, shifts down so ~25% sits below the cover edge (header layout); use false for centered dialogs
 */
export function ProfileAvatar({ src, name, overlap = true }) {
  return (
    <div className={overlap ? 'shrink-0 translate-y-[25%]' : 'shrink-0'}>
      <div className="rounded-full border-[3px] border-brand bg-surface p-1 shadow-[0_10px_36px_rgba(0,0,0,0.55),0_0_28px_rgba(218,152,17,0.18)]">
        <div className="overflow-hidden rounded-full ring-1 ring-white/10">
          <img
            src={src}
            alt={name}
            width={100}
            height={100}
            className="aspect-square h-[100px] w-[100px] object-cover object-center sm:h-[100px] sm:w-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
