import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const rowStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function RowTextBanner({
  text,
  mobileCount = 3,
  desktopCount = 5,
  mobileTextClass = 'text-[20px]',
  mobileShadowClass = 'text-[32px]',
}) {
  const mobileItems = Array.from({ length: mobileCount });
  const desktopItems = Array.from({ length: desktopCount });

  return (
    <div className="bg-page relative min-h-screen overflow-hidden">
      <section className="absolute right-0 bottom-0 left-0 h-[56px] overflow-hidden text-white sm:h-[80px]" style={rowStyle}>
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 h-full overflow-hidden px-2 py-1 sm:hidden">
          <div className="row-marquee-right flex h-full">
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className="flex h-full w-full shrink-0 gap-1">
                {mobileItems.map((_, itemIndex) => (
                  <div
                    key={`${copyIndex}-${itemIndex}`}
                    className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden"
                  >
                    <span
                      className={`font-moul pointer-events-none absolute inset-0 flex items-center justify-center leading-none text-[#FFFFFF0A] uppercase ${mobileShadowClass}`}
                    >
                      {text}
                    </span>
                    <span className={`font-moul relative leading-none text-white uppercase ${mobileTextClass}`}>{text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 hidden h-full overflow-hidden px-6 py-4 sm:block">
          <div className="row-marquee-right flex h-full">
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className="flex h-full w-full shrink-0 gap-3">
                {desktopItems.map((_, itemIndex) => (
                  <div
                    key={`${copyIndex}-${itemIndex}`}
                    className="relative flex h-[62px] min-w-0 flex-1 items-center justify-center overflow-hidden"
                  >
                    <span className="font-moul pointer-events-none absolute inset-0 flex items-center justify-center text-[54px] leading-none text-[#FFFFFF0A] uppercase">
                      {text}
                    </span>
                    <span className="font-moul relative text-[36px] leading-none text-white uppercase">{text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
