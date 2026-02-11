import { useParams, Link } from 'react-router-dom';
import { Container } from '@/ui/Container';

const BRAND_LABELS = {
  jd: 'JD',
  fplus: 'FPLUS',
  saki: 'SAKI',
  'tm-spor': 'TM SPOR',
};

/** Placeholder for a brand's product category; extend with product list later */
export default function ShopCategory() {
  const { brandId } = useParams();
  const brandLabel = (brandId && BRAND_LABELS[brandId]) ?? brandId ?? '';

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <Link
          to="/shop"
          className="text-sm text-[#A2A6AB] underline hover:text-white"
        >
          ← Back to Shop
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
          {brandLabel}
        </h1>
        <p className="text-[#A2A6AB]">Products for this brand will go here.</p>
      </div>
    </Container>
  );
}
