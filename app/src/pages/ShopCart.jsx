import { useNavigate } from 'react-router-dom';
import { Container } from '@/ui/Container';

import helmetImage from '@/assets/images/standard/shop-helmet.png';

const CART_ITEMS = [
  { name: 'SG Armour Lite Helmet (Limited Edition)', price: '1,499', quantity: 1, image: helmetImage },
  { name: 'SG Armour Lite Helmet (Limited Edition)', price: '1,499', quantity: 3, image: helmetImage },
  { name: 'SG Armour Lite Helmet (Limited Edition)', price: '1,499', quantity: 2, image: helmetImage },
];

const GRAND_TOTAL = '3,599';
const DELIVERED_TEXT = 'Delivered on 08 Jan, 2025';

function CartItemCard({ name, price, quantity, image }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#1A1A1A] p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        <img src={image} alt="" className="h-full w-full object-contain p-1.5" />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
        <p className="text-[14px] font-normal text-white">{name}</p>
        <p className="text-[14px] font-bold text-[#DA9811]">
          PKR {price} <span className="font-normal text-white">x {quantity}</span>
        </p>
        <p className="flex items-center gap-1.5 text-[12px] font-normal text-[#A2A6AB]">
          <span className="text-green-500">✓</span> {DELIVERED_TEXT}
        </p>
      </div>
    </div>
  );
}

export default function ShopCart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Container className="!px-4 !py-0">
        {/* In-page header (same pattern as My Orders) */}
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
            SELECTED ITEMS
          </h1>
        </header>

        {/* Scrollable list */}
        <div className="flex flex-col gap-3 pt-2">
          {CART_ITEMS.map((item, i) => (
            <CartItemCard key={i} {...item} />
          ))}
          {/* Spacer so footer doesn't cover last item */}
          <div className="h-24" />
        </div>
      </Container>

      {/* Footer: Grand Total + Checkout (above bottom nav) */}
      <footer className="fixed bottom-20 left-0 right-0 z-30 px-4 pb-4 pt-4 bg-black">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 rounded-2xl bg-[#1A1A1A] p-4">
          <div>
            <p className="text-[12px] font-normal text-white">Grand Total:</p>
            <p className="text-[18px] font-bold text-[#DA9811]">PKR {GRAND_TOTAL}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/shop-checkout')}
            className="shrink-0 rounded-full bg-[#DA9811] px-8 py-3.5 text-[14px] font-bold uppercase tracking-wide text-black transition-opacity active:opacity-90"
          >
            Checkout
          </button>
        </div>
      </footer>
    </div>
  );
}
