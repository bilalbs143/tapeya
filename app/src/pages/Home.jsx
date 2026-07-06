import 'swiper/css';

import { useMemo } from 'react';

import { Link } from 'react-router-dom';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ExploreCategories } from '@/components/ExploreCategories';
import { HeroSlider } from '@/components/HeroSlider';
import { HighlightSlider } from '@/components/HighlightSlider';
import { LiveMatchSlider } from '@/components/LiveMatchSlider';
import { ListingProductCard } from '@/components/shop/ListingProductCard';
import { normaliseLiveStreams } from '@/lib/utils/liveStreamUtils';
import { useGetLiveStreamsQuery } from '@/store/api/liveApi';
import { useGetBrandsQuery, useGetProductsQuery } from '@/store/api/shopApi';
import { Container } from '@/ui/Container';

function ShopSlider({ title, viewMorePath, products, brands, reverseDirection = false }) {
  if (products.length === 0) return null;

  return (
    <section className="mb-10 space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-muted text-[13px] font-bold tracking-wide uppercase">{title}</h2>
        <Link to={viewMorePath} className="text-brand text-[12px] font-bold uppercase transition-opacity active:opacity-80">
          View More
        </Link>
      </header>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{ 1024: { slidesPerView: 3.5 } }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          reverseDirection,
        }}
        loop
        grabCursor
        className="shop-swiper -mx-4 px-4 [&_.swiper-wrapper]:items-stretch"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ListingProductCard product={product} brandSlug={brands.find((b) => b.id === product.brand_id)?.slug} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default function Home() {
  const { data: liveStreamsRaw } = useGetLiveStreamsQuery(undefined, {
    pollingInterval: 60_000,
  });
  const liveStreams = useMemo(() => normaliseLiveStreams(liveStreamsRaw), [liveStreamsRaw]);

  const { data: brandsResponse } = useGetBrandsQuery({ all: true });
  const brands = brandsResponse?.data ?? [];

  const { data: popularResponse } = useGetProductsQuery({
    is_popular: true,
    all: true,
  });
  const { data: specialOfferResponse } = useGetProductsQuery({
    is_special_offer: true,
    all: true,
  });

  const popularProducts = popularResponse?.data ?? [];
  const specialOfferProducts = specialOfferResponse?.data ?? [];

  return (
    <Container>
      <div className="space-y-6">
        <HeroSlider />
        <ExploreCategories />
        <LiveMatchSlider streams={liveStreams} />
        <HighlightSlider />
        <ShopSlider title="Most popular" viewMorePath="/shop/filter/popular" products={popularProducts} brands={brands} />
        <ShopSlider
          title="Special offer"
          viewMorePath="/shop/filter/special-offer"
          products={specialOfferProducts}
          brands={brands}
          reverseDirection
        />
      </div>
    </Container>
  );
}
