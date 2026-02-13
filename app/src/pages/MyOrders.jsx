import { useNavigate } from 'react-router-dom';
import { Container } from '@/ui/Container';

import helmetImage from '@/assets/images/standard/shop-helmet.png';

const ORDER_CARD = {
  name: 'SG Armour Lite Helmet',
  edition: 'Limited Edition',
  price: '1,499',
  quantity: 1,
  image: helmetImage,
  deliveredOn: '08 Jan, 2025',
};

function OrderCard({ name, edition, price, quantity, image, deliveredOn }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#1A1A1A] p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        <img src={image} alt="" className="h-full w-full object-contain p-1.5" />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
        <p className="text-[13px] font-normal text-white">{name}</p>
        <p className="text-[13px] font-normal text-white">({edition})</p>
        <p className="text-[16px] font-bold text-[#DA9811]">
          PKR {price} <span className="font-normal text-white">x {quantity}</span>
        </p>
        <p className="flex items-center gap-1.5 text-[12px] font-normal text-[#A2A6AB]">
          <span className="text-green-500">✓</span> Delivered on {deliveredOn}
        </p>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();

  const currentOrders = [ORDER_CARD];
  const previousOrders = [ORDER_CARD, ORDER_CARD];

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        {/* Header */}
        <header className="flex -mx-4 -mt-6 px-4 pt-6 pb-6 items-center gap-3 bg-black">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 text-[16px] font-bold uppercase tracking-wide text-center text-white pr-[27px]">
            MY ORDERS
          </h1>
        </header>

        <div className="flex flex-col gap-8 pt-2">
          {/* Current Orders */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB] mb-4">
              CURRENT ORDERS
            </h2>
            <div className="flex flex-col gap-3">
              {currentOrders.map((order, i) => (
                <OrderCard key={`current-${i}`} {...order} />
              ))}
            </div>
          </section>

          {/* Previous Orders */}
          <section>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB] mb-4">
              PREVIOUS ORDERS
            </h2>
            <div className="flex flex-col gap-3">
              {previousOrders.map((order, i) => (
                <OrderCard key={`prev-${i}`} {...order} />
              ))}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
