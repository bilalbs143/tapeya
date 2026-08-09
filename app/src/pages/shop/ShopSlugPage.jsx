import { useNavigate, useParams } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useGetBrandsQuery, useGetVendorBySlugQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

import ShopCategory from './ShopCategory';
import ShopVendorStore from './ShopVendorStore';

/**
 * `/shop/:slug` is either a vendor store or a brand catalog.
 * Vendor wins when both exist; brand pages stay at the same short URL otherwise.
 */
export default function ShopSlugPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: vendor, isLoading: vendorLoading } = useGetVendorBySlugQuery(slug, { skip: !slug });
  const { data: brandsResponse, isLoading: brandsLoading } = useGetBrandsQuery({ all: true }, { skip: !slug });
  const brand = slug ? (brandsResponse?.data ?? []).find((row) => row.slug === slug || String(row.id) === slug) : null;

  if (!slug) return null;

  if (vendor) {
    return <ShopVendorStore />;
  }

  if (vendorLoading || brandsLoading) {
    return (
      <div className="bg-black">
        <AppSubpageHeader title="SHOP" onBack={() => navigate('/shop')} />
        <Container>
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
          </div>
        </Container>
      </div>
    );
  }

  if (brand) {
    return <ShopCategory />;
  }

  return (
    <div className="bg-black">
      <AppSubpageHeader title="SHOP" onBack={() => navigate('/shop')} />
      <Container>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="text-muted text-[14px]">Page not found.</p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="bg-brand rounded-full px-6 py-2.5 text-[14px] font-bold text-black"
          >
            Back to Shop
          </button>
        </div>
      </Container>
    </div>
  );
}
