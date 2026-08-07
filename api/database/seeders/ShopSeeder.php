<?php

namespace Database\Seeders;

use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use App\Models\Shop\ProductImage;
use App\Models\Shop\Vendor;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Uses updateOrCreate so this seeder is idempotent and safe to run multiple times.
     * Regenerate from current DB with: php artisan shop:export-seeder
     */
    public function run(): void
    {
        Vendor::ensureHouse();
        $this->seedBrands();
        $this->seedCategories();
        $this->seedProducts();
        $this->seedProductImages();
    }

    protected function seedBrands(): void
    {
        foreach ($this->brands() as $row) {
            Brand::updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'name' => $row['name'],
                    'logo' => $row['logo'] ?? null,
                    'is_active' => $row['is_active'] ?? true,
                    'sort_order' => $row['sort_order'] ?? 0,
                ]
            );
        }
    }

    protected function seedCategories(): void
    {
        foreach ($this->categories() as $row) {
            $attributes = [
                'name' => $row['name'],
                'image' => $row['image'] ?? null,
                'sort_order' => $row['sort_order'] ?? 0,
                'is_active' => $row['is_active'] ?? true,
            ];
            if (! empty($row['parent_slug'])) {
                $attributes['parent_id'] = Category::where('slug', $row['parent_slug'])->value('id');
            } else {
                $attributes['parent_id'] = null;
            }
            Category::updateOrCreate(['slug' => $row['slug']], $attributes);
        }
    }

    protected function seedProducts(): void
    {
        $houseVendorId = Vendor::ensureHouse()->id;

        foreach ($this->products() as $row) {
            $isActive = $row['is_active'] ?? true;
            $attributes = [
                'vendor_id' => $houseVendorId,
                'name' => $row['name'],
                'description' => $row['description'] ?? null,
                'sku' => $row['sku'] ?? null,
                'price' => $row['price'],
                'stock_quantity' => $row['stock_quantity'] ?? 0,
                'low_stock_threshold' => $row['low_stock_threshold'] ?? 5,
                'is_active' => $isActive,
                'is_featured' => $row['is_featured'] ?? false,
                'is_popular' => $row['is_popular'] ?? false,
                'is_special_offer' => $row['is_special_offer'] ?? false,
                'discount_type' => $row['discount_type'] ?? null,
                'discount_value' => $row['discount_value'] ?? null,
                'discount_starts_at' => $row['discount_starts_at'] ?? null,
                'discount_ends_at' => $row['discount_ends_at'] ?? null,
            ];
            if (! empty($row['brand_slug'])) {
                $attributes['brand_id'] = Brand::where('slug', $row['brand_slug'])->value('id');
            } else {
                $attributes['brand_id'] = null;
            }
            if (! empty($row['category_slug'])) {
                $attributes['category_id'] = Category::where('slug', $row['category_slug'])->value('id');
            } else {
                $attributes['category_id'] = null;
            }
            Product::updateOrCreate(
                ['vendor_id' => $houseVendorId, 'slug' => $row['slug']],
                $attributes
            );
        }
    }

    protected function seedProductImages(): void
    {
        foreach ($this->productImages() as $row) {
            $productId = Product::query()
                ->where('slug', $row['product_slug'])
                ->where('vendor_id', Vendor::ensureHouse()->id)
                ->value('id');
            if (! $productId) {
                continue;
            }
            ProductImage::updateOrCreate(
                [
                    'product_id' => $productId,
                    'path' => $row['path'],
                ],
                [
                    'alt' => $row['alt'] ?? null,
                    'sort_order' => $row['sort_order'] ?? 0,
                ]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function brands(): array
    {
        return [
            0 => [
                'name' => 'TM Sports',
                'slug' => 'tm-sports',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 0,
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function categories(): array
    {
        return [
            0 => [
                'name' => 'Bat',
                'slug' => 'bat',
                'parent_slug' => null,
                'image' => null,
                'sort_order' => 0,
                'is_active' => true,
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function products(): array
    {
        return [
            0 => [
                'name' => 'TM Legacy - Blue Edition',
                'slug' => 'tm-legacy-blue-edition',
                'description' => '<p><strong>Tapeya Ravalakot Bat – Built for Everyday Cricket</strong></p><p>The Tapeya Ravalakot Bat is designed for players who want a reliable option for practice sessions, street matches, and regular gameplay. Made using solid wood, it is built to handle long hours of play while helping you focus on improving your shots and timing.</p><p>With a lightweight feel and stable structure, this bat allows smooth swings and better control, making it suitable for players developing their skills. Whether you\'re playing in the street or practicing with friends, it delivers consistent performance in different playing conditions.</p><p>Priced at <strong>PKR 5,499,</strong> the Tapeya Ravalakot Bat is a practical choice for players looking for a dependable bat for daily cricket without stretching their budget.</p>',
                'sku' => 'TMSPORTS-BAT-001',
                'price' => '5499.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 5,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            1 => [
                'name' => 'TM Boss Edition – Black',
                'slug' => 'tm-boss-edition-black',
                'description' => '<p><strong>TM Boss Edition – Black | Available at Tapeya</strong></p><p>The TM Boss Edition is built for players who like to play aggressive cricket and stay in control at the crease. Known for its strong hitting profile and balanced feel, this bat supports powerful shots while maintaining smooth pickup during fast-paced matches.</p><p>Its structure allows players to swing freely and time the ball effectively, making it suitable for tape ball cricket and regular street matches. Whether you are playing in tight spaces or open grounds, it adapts well to different playing conditions.</p><p>Selected by Tapeya for its on-field performance and player demand, the TM Boss Edition offers a solid option for those who want consistent results in daily matches.</p><h3>Key Highlights:</h3><ul><li><p>Strong hitting area for impactful shots</p></li><li><p>Balanced pickup for better control</p></li><li><p>Suitable for tape ball and street cricket</p></li><li><p>Comfortable feel for extended play</p></li><li><p>Trusted choice among regular players</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-002',
                'price' => '15999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => true,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            2 => [
                'name' => 'TM Boss Edition – Blue',
                'slug' => 'tm-boss-edition-blue',
                'description' => '<p><strong>TM Boss Edition – Black | Available at Tapeya</strong></p><p>The TM Boss Edition is a solid choice for players who prefer strong hitting and confident stroke play in tape ball cricket. Known for its balanced feel and smooth pickup, this bat supports clean shots and controlled performance during fast-paced matches.</p><p>Crafted with Sri Lankan wood, it offers a stable structure that performs well in regular street cricket sessions. The natural curve and weight distribution allow players to swing comfortably, making it easier to time the ball and play aggressive shots when needed.</p><p>Carefully selected by Tapeya based on player demand and on-ground performance, the TM Boss Edition fits well for daily matches, whether you are playing in tight street areas or open grounds.</p><h3>Key Highlights:</h3><ul><li><p>Strong hitting profile for impactful shots</p></li><li><p>Balanced pickup for better swing control</p></li><li><p>Suitable for tape ball and street cricket</p></li><li><p>Comfortable handling for extended play</p></li><li><p>Popular choice among regular players</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-003',
                'price' => '15999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => true,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            3 => [
                'name' => 'TM Boss Edition – Gold',
                'slug' => 'tm-boss-edition-gold',
                'description' => '<p><strong>TM Gold Edition – Gold | Available at Tapeya</strong></p><p>The TM Gold Edition stands out as a refined choice for players who want a balance of power, control, and consistency in tape ball cricket. Known for its strong build and smooth pickup, this bat supports confident stroke play and helps players maintain rhythm during fast-paced matches.</p><p>Crafted from Sri Lankan wood, the TM Gold Edition offers a dependable structure that performs reliably across street cricket and practice sessions. Its carefully designed weight distribution enhances swing control, allowing players to execute both aggressive and controlled shots with ease.</p><p>With a clean profile and performance-driven design, the TM Gold Edition is widely preferred by regular players who expect consistency in every game. Whether you\'re playing in tight street conditions or open grounds, it delivers a steady and responsive experience at the crease.</p><hr><h3>Key Highlights:</h3><ul><li><p>Optimized for controlled power and consistent hitting</p></li><li><p>Smooth pickup for quick response in gameplay</p></li><li><p>Reliable performance for tape ball cricket formats</p></li><li><p>Balanced structure supporting timing and placement</p></li><li><p>Suitable for daily matches, practice, and competitive play</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-004',
                'price' => '15999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => true,
                'is_popular' => true,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            4 => [
                'name' => 'TM Boss Edition – Green',
                'slug' => 'tm-boss-edition-green',
                'description' => '<p><strong>TM Boss Edition – Green | Available at Tapeya</strong></p><p>The TM Boss Edition in Green is a strong choice for players who prefer aggressive stroke play with reliable control in tape ball cricket. Recognized for its balanced pickup and solid feel, this bat supports confident hitting while maintaining stability throughout the innings.</p><p>Crafted from Sri Lankan wood, it offers a dependable structure suited for street matches, practice sessions, and competitive play. The weight distribution and natural curve contribute to smooth swing motion, helping players execute both attacking and controlled shots with consistency.</p><p>The green edition adds a distinct visual identity while maintaining the same performance-driven profile that players expect from the Boss series. Selected by Tapeya for its on-ground performance and player preference, this bat is well-suited for regular use in varied playing conditions.</p><h3>Key Highlights:</h3><ul><li><p>Strong hitting profile designed for aggressive gameplay</p></li><li><p>Balanced pickup supporting smooth swing and control</p></li><li><p>Suitable for tape ball and street cricket formats</p></li><li><p>Stable handling for consistent shot execution</p></li><li><p>Distinct green edition design with standout appearance</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-005',
                'price' => '15999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => true,
                'is_popular' => true,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            5 => [
                'name' => 'TM Boss Edition – Red',
                'slug' => 'tm-boss-edition-red',
                'description' => '<p>The TM Boss Edition in Red is designed for players who want a strong, responsive bat for tape ball cricket with consistent performance at the crease. Known for its balanced pickup and solid structure, it supports confident stroke play in both casual and competitive matches.</p><p>Crafted from Sri Lankan wood, this bat offers a stable feel that performs well in street cricket environments as well as practice sessions. Its weight distribution and natural curve allow smooth swing movement, helping players maintain timing while executing both controlled and attacking shots.</p><p>The red edition brings a bold visual identity while maintaining the same performance characteristics trusted by players who prefer the Boss series. Selected by Tapeya for its on-ground reliability and demand among regular players, this bat is suited for everyday gameplay across different match conditions.</p>',
                'sku' => 'TMSPORTS-BAT-006',
                'price' => '15999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            6 => [
                'name' => 'TM King Edition – Black',
                'slug' => 'tm-king-edition-black',
                'description' => '<p><strong>TM King Edition – Black | Available at Tapeya</strong></p><p>The TM King Edition in Black is built for players who want speed, control, and strong hitting performance in tape ball cricket. With its lightweight feel and balanced structure, this bat allows quicker swings while maintaining the ability to play confident, powerful shots.</p><p>Weighing around 850 grams, it supports fast reaction play, making it ideal for high-tempo street matches. The wider bottom profile enhances the hitting area, helping players connect cleanly and generate impactful strokes with better timing.</p><p>Crafted for regular and competitive players, the King Edition stands out for its smooth pickup and responsive handling. Selected by Tapeya based on performance and player demand, this bat is well-suited for those who want consistency across every match situation.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight design for faster swing and quick response</p></li><li><p>Wider bottom profile for strong and clean hitting</p></li><li><p>Balanced pickup for improved control and timing</p></li><li><p>Suitable for tape ball and street cricket formats</p></li><li><p>Distinct black edition with bold, standout design</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-007',
                'price' => '14999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            7 => [
                'name' => 'TM King Edition- Blue',
                'slug' => 'tm-king-edition-blue',
                'description' => '<p><strong>TM King Edition – Blue | Available at Tapeya</strong></p><p>The TM King Edition in Blue is designed for players who prefer a fast, responsive bat with strong hitting support in tape ball cricket. Its lightweight build, around 850 grams, allows quicker swing speed while maintaining the control needed for confident stroke play.</p><p>The wider bottom profile enhances the hitting zone, helping players connect cleanly and generate powerful shots with better timing. Combined with a balanced pickup, it offers smooth handling during fast-paced street matches and regular gameplay.</p><p>Built for players who value both control and performance, the King Edition is well-suited for competitive and daily cricket sessions. Selected by Tapeya based on player preference and on-ground performance, this bat delivers a consistent playing experience across different match conditions.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight structure for faster swing and quick response</p></li><li><p>Wider bottom profile for strong and impactful hitting</p></li><li><p>Balanced pickup supporting control and timing</p></li><li><p>Suitable for tape ball and street cricket formats</p></li><li><p>Distinct blue edition with clean and standout design</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-008',
                'price' => '14999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            8 => [
                'name' => 'TM King Edition – Green',
                'slug' => 'tm-king-edition-green',
                'description' => '<p><strong>TM King Edition – Green | Available at Tapeya</strong></p><p>The TM King Edition in Green is built for players who rely on quick reactions, smooth control, and strong shot execution in tape ball cricket. With its lightweight build of around 850 grams, this bat supports faster swing speed, allowing you to respond quickly during high-paced matches.</p><p>Its wider bottom profile enhances the hitting area, helping players generate powerful shots while maintaining control and timing. The balanced pickup ensures smooth handling, making it suitable for both aggressive and controlled gameplay across street and ground matches.</p><p>The green edition adds a sharp, standout look while maintaining the same performance-driven design trusted by regular players. Selected by Tapeya for its on-ground reliability and player demand, the King Edition is a dependable choice for consistent performance in every game.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight design for faster swing and quick response</p></li><li><p>Wider bottom profile for strong and clean hitting</p></li><li><p>Balanced pickup supporting better control and timing</p></li><li><p>Suitable for tape ball and street cricket formats</p></li><li><p>Distinct green edition with bold visual appeal</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-009',
                'price' => '14999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            9 => [
                'name' => 'TM King Edition – Red',
                'slug' => 'tm-king-edition-red',
                'description' => '<p><strong>TM King Edition – Red | Available at Tapeya</strong></p><p>The TM King Edition in Red is designed for players who want quick bat speed, controlled handling, and strong shot execution in tape ball cricket. With its lightweight build of around 850 grams, it allows faster swings while maintaining the stability needed for confident stroke play.</p><p>The wider bottom profile increases the hitting area, helping players connect cleanly and play powerful shots with better timing. Its balanced pickup ensures smooth handling, making it suitable for fast-paced street matches as well as regular practice sessions.</p><p>The red edition brings a bold and eye-catching look while delivering the same performance-focused design trusted by players. Selected by Tapeya based on demand and on-ground performance, the King Edition is a reliable choice for consistent gameplay in different match conditions.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight structure for faster swing and quick response</p></li><li><p>Wider bottom profile for strong and impactful hitting</p></li><li><p>Balanced pickup supporting control and timing</p></li><li><p>Suitable for tape ball and street cricket formats</p></li><li><p>Distinct red edition with bold visual appearance</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-010',
                'price' => '14999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            10 => [
                'name' => 'TM King Edition – White',
                'slug' => 'tm-king-edition-white',
                'description' => '<p><strong>TM King Edition – White | Available at Tapeya</strong></p><p>The TM King Edition in White is designed for players who want fast bat speed, controlled handling, and reliable shot execution in tape ball cricket. With its lightweight build of around 850 grams, it allows quicker swings while maintaining the balance needed for confident and consistent stroke play.</p><p>The wider bottom profile enhances the hitting area, helping players generate strong, clean shots with improved timing. Its balanced pickup ensures smooth handling, making it suitable for high-tempo street matches as well as regular practice sessions.</p><p>The white edition offers a clean and standout look while delivering the same performance-focused design trusted by players. Selected by Tapeya based on player demand and on-ground performance, the King Edition is a dependable option for consistent results in every match.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight structure for faster swing and quick response</p></li><li><p>Wider bottom profile for strong and clean hitting</p></li><li><p>Balanced pickup supporting control and timing</p></li><li><p>Suitable for tape ball and street cricket formats</p></li><li><p>Clean white edition with standout visual appeal</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-011',
                'price' => '14999.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            11 => [
                'name' => 'TM Legacy – Black',
                'slug' => 'tm-legacy-black',
                'description' => '<p><strong>TM Legacy – Black | Available at Tapeya</strong></p><p>The TM Legacy in Black is a practical choice for players who are starting out or looking for a reliable bat for regular tape ball cricket. Designed for practice sessions and casual matches, it offers a comfortable feel with a structure that supports consistent shot development.</p><p>Crafted from Pakistani wood, this bat is built to handle extended play, making it suitable for daily use in street cricket environments. Its lightweight design allows easy handling, helping players improve their timing and control without feeling heavy during long sessions.</p><p>Selected by Tapeya for its value and usability, the TM Legacy is well-suited for beginners and developing players who want a dependable bat for everyday cricket.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight design for easy handling and control</p></li><li><p>Suitable for beginners and practice sessions</p></li><li><p>Reliable structure for regular tape ball cricket</p></li><li><p>Comfortable pickup for longer playtime</p></li><li><p>Ideal for street matches and skill development</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-012',
                'price' => '5499.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
            12 => [
                'name' => 'TM Legacy – Green',
                'slug' => 'tm-legacy-green',
                'description' => '<p><strong>TM Legacy – Green | Available at Tapeya</strong></p><p>The TM Legacy in Green is a suitable option for players who are developing their game and need a reliable bat for regular tape ball cricket. Designed for practice sessions and casual matches, it offers a balanced feel that helps improve shot control and timing over time.</p><p>Crafted from Pakistani wood, this bat is built to handle frequent use, making it ideal for daily street cricket. Its lightweight structure allows easy pickup and smooth swings, supporting players during longer playing sessions without discomfort.</p><p>The green edition adds a fresh and standout look while maintaining the same practical performance. Selected by Tapeya for its value and usability, the TM Legacy is a dependable choice for beginners and regular players.</p><h3>Key Highlights:</h3><ul><li><p>Lightweight design for easy handling and control</p></li><li><p>Suitable for beginners and practice sessions</p></li><li><p>Reliable structure for regular tape ball cricket</p></li><li><p>Smooth pickup for better shot development</p></li><li><p>Distinct green edition with clean appearance</p></li></ul>',
                'sku' => 'TMSPORTS-BAT-013',
                'price' => '5499.00',
                'brand_slug' => 'tm-sports',
                'category_slug' => 'bat',
                'stock_quantity' => 100,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => false,
                'is_popular' => false,
                'is_special_offer' => false,
                'discount_type' => null,
                'discount_value' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function productImages(): array
    {
        return [
            0 => [
                'product_slug' => 'tm-legacy-blue-edition',
                'path' => 'shop/products/eYyLIz0q69VQxastgxml3OE1l5wV4weRpThm7NEy.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            1 => [
                'product_slug' => 'tm-boss-edition-black',
                'path' => 'shop/products/SBuw0gO22aRy0t3tl5XEqVdfCh1pKf204uR3atsl.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            2 => [
                'product_slug' => 'tm-boss-edition-blue',
                'path' => 'shop/products/fpwGWCRTvaADDa55Tbhqf19mfBgNiBpa5dMWl0D0.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            3 => [
                'product_slug' => 'tm-boss-edition-gold',
                'path' => 'shop/products/xlC5EwCRlWlNWr9JyJGXw6rnHv1HYrAPeB7cfjwH.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            4 => [
                'product_slug' => 'tm-boss-edition-green',
                'path' => 'shop/products/IGkaK8n429eDBANsicLQu8YIaWn6JBbse9wt7TFt.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            5 => [
                'product_slug' => 'tm-boss-edition-red',
                'path' => 'shop/products/P6ivt2yCSII7hL7nGifA8pcdeFKQEZJbfBsCld9L.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            6 => [
                'product_slug' => 'tm-king-edition-black',
                'path' => 'shop/products/snoInQSGRbrMfc8IXLfvgfdJcoaY43PALaiurzDF.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            7 => [
                'product_slug' => 'tm-king-edition-blue',
                'path' => 'shop/products/55WPkAKqU2ScIVT8unxKUdQkV3JknQG0v4WXBiQP.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            8 => [
                'product_slug' => 'tm-king-edition-green',
                'path' => 'shop/products/ieLI0sAwAd7kkxiNpr1yGtoDcJ1M6edBV8GsWo7P.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            9 => [
                'product_slug' => 'tm-king-edition-red',
                'path' => 'shop/products/0r1FraTpZ5mQwyIercvPWMRCxdhtMJKpsqOs1UV3.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            10 => [
                'product_slug' => 'tm-king-edition-white',
                'path' => 'shop/products/L2XbzGen2rK9xTN2WJAMpUSvvLI0VtwPRnK8HAqi.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            11 => [
                'product_slug' => 'tm-legacy-black',
                'path' => 'shop/products/opjdBXMvNu21auW1d6Odxgkkiufa1SgW1iWypE2Y.png',
                'alt' => null,
                'sort_order' => 0,
            ],
            12 => [
                'product_slug' => 'tm-legacy-green',
                'path' => 'shop/products/OJu1CVAMxUOnou2BMR8djNTTsF5tQjsOkDvT0Kp1.png',
                'alt' => null,
                'sort_order' => 0,
            ],
        ];
    }
}
