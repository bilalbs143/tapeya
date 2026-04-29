const CLOUDFRONT_APP_BASE = 'https://d1nmw2vhka3zp0.cloudfront.net/app';

const controllerFrameBg = `${CLOUDFRONT_APP_BASE}/images/background/controller-frame.png`;
const playerAvatar = `${CLOUDFRONT_APP_BASE}/images/standard/avatar-controlls.png`;

const avatarPanelStyle = {
  backgroundImage: `url(${controllerFrameBg})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

const stats = [
  { label: 'Runs', value: '366' },
  { label: 'Balls', value: '366' },
  { label: 'Fours', value: '16' },
  { label: 'Sixes', value: '6' },
  { label: 'S-Rate', value: '171.1' },
];

export default function PlayerCareerStats() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1D1E22] p-3 sm:p-5">
      <section className="relative w-full max-w-[677px] overflow-hidden bg-black px-4 py-6 text-white sm:px-7 sm:py-8">
        <div className="relative z-10">
          <h2 className="text-[16px] leading-none font-bold text-[#DA9811] uppercase sm:text-[21px]">
            Career Stats
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-[1fr_114px_0.7fr] sm:items-end sm:gap-2">
            <div
              className="relative h-[290px] overflow-hidden rounded-tl-[140px] rounded-tr-[20px] bg-black sm:h-[300px] sm:rounded-tr-[24px]"
              style={avatarPanelStyle}
            >
              <img
                src={playerAvatar}
                alt="Player illustration"
                className="absolute right-1/2 bottom-0 w-[55%] translate-x-1/2 object-contain sm:w-[60%]"
              />
            </div>

            <div className="rounded-[10px] bg-[#0C0601] px-3 py-4 text-white sm:py-5">
              {stats.map((item, index) => (
                <div key={item.label} className="text-center">
                  <p className="text-[11px] leading-none font-medium sm:text-[12px]">{item.label}</p>
                  <p className="mt-2 text-[13px] leading-none font-medium sm:text-[14px]">
                    {item.value}
                  </p>
                  {index < stats.length - 1 && (
                    <div className="mx-auto my-3 h-px w-full bg-gradient-to-r from-[#080807] via-[#FFFFFF] to-[#080807]" />
                  )}
                </div>
              ))}
            </div>

            <div className="self-center">
              <div className="rounded-[10px] bg-[#0C0601] px-4 py-4 text-[#DA9811] sm:px-5 sm:py-5">
                <p className="text-[15px] leading-none font-bold uppercase sm:text-[16px]">
                  Qaderr
                </p>
                <div className="mt-3 h-px w-full bg-gradient-to-r from-[#FFFFFF30] to-[#FFFFFF00]" />
                <p className="mt-3 text-[13px] leading-none font-medium sm:text-[14px]">KKR</p>
                <p className="mt-2 text-[13px] leading-none font-medium sm:text-[14px]">
                  Right Hand Batsman
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
