import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;

const panelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};
const bottomBorderStyle = {
  background: 'linear-gradient(90deg, #080807 0%, #FFFFFF 50%, #080807 100%)',
};

export default function BatsmanInningsStats({ playerName = '', headline = 'This Tournament', stats = [] }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-page">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div className="relative w-full overflow-hidden px-3 py-2 sm:px-10 sm:py-4" style={panelStyle}>
          <div className="flex items-start justify-between gap-2 sm:gap-6">
            <p className="text-[15px] leading-none font-extrabold tracking-wide text-brand uppercase sm:text-[28px]">
              {playerName}
            </p>

            <p className="text-[15px] leading-none font-semibold sm:text-[24px]">{headline}</p>
          </div>
          <div className="mt-2 h-px w-full sm:mt-3" style={bottomBorderStyle} />

          <div className="mt-2 flex items-start justify-center gap-8 text-center sm:mt-5 sm:gap-20">
            {stats.map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-[8px] leading-none font-medium text-[#EDEDED] sm:text-[16px]">{item.label}</p>
                <p className="mt-0.5 text-[10px] leading-none font-medium text-white sm:mt-2 sm:text-[16px]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
