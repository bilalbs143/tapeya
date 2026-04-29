const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

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

const stats = [
  { label: 'Dots', value: '366' },
  { label: 'Fours', value: '366' },
  { label: 'Sixes', value: '05' },
  { label: 'Wickets', value: '0' },
  { label: 'Runs', value: '50' },
];

export default function BatsmanCurrentStats() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D1E22]">
      <section className="absolute right-0 bottom-0 left-0 text-white">
        <div
          className="relative w-full overflow-hidden px-3 py-2 sm:px-10 sm:py-4"
          style={panelStyle}
        >
          <div className="flex items-start justify-between gap-2 sm:gap-6">
            <p className="text-[15px] leading-none font-extrabold uppercase tracking-wide text-[#DA9811] sm:text-[28px]">
              TAMOUR MIRZA
            </p>

            <div className="flex items-baseline gap-1.5 sm:gap-3">
              <p className="text-[15px] leading-none font-extrabold sm:text-[28px]">36*</p>
              <p className="text-[8px] leading-none font-bold sm:text-[16px]">21</p>
            </div>
          </div>
          <div className="mt-2 h-px w-full sm:mt-3" style={bottomBorderStyle} />

          <div className="mt-2 flex items-start justify-center gap-8 text-center sm:mt-5 sm:gap-20">
            {stats.map((item) => (
              <div key={item.label} className="min-w-0">
                <p className="text-[8px] leading-none font-medium text-[#EDEDED] sm:text-[16px]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-none font-medium text-white sm:mt-2 sm:text-[16px]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
