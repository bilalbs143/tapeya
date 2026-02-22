<?php

namespace Database\Seeders;

use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use App\Models\Shop\ProductImage;
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
        foreach ($this->products() as $row) {
            $attributes = [
                'name' => $row['name'],
                'description' => $row['description'] ?? null,
                'sku' => $row['sku'] ?? null,
                'price' => $row['price'],
                'stock_quantity' => $row['stock_quantity'] ?? 0,
                'low_stock_threshold' => $row['low_stock_threshold'] ?? 5,
                'is_active' => $row['is_active'] ?? true,
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
            Product::updateOrCreate(['slug' => $row['slug']], $attributes);
        }
    }

    protected function seedProductImages(): void
    {
        foreach ($this->productImages() as $row) {
            $productId = Product::where('slug', $row['product_slug'])->value('id');
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
  0 => 
  [
    'name' => 'TM Sports',
    'slug' => 'tm-sports',
    'logo' => 'shop/brands/gtQfuBuQQVxjMTq4eAX8VgewypCaTbxHTPS6mhrv.png',
    'is_active' => true,
    'sort_order' => 1,
  ],
  1 => 
  [
    'name' => 'F plus',
    'slug' => 'f-plus',
    'logo' => 'shop/brands/gPfTpy6n4qIpTFptOmHw9xfTUJRbrUrdkSIMowSf.png',
    'is_active' => true,
    'sort_order' => 1,
  ],
  2 => 
  [
    'name' => 'JD sports',
    'slug' => 'jd-sports',
    'logo' => NULL,
    'is_active' => true,
    'sort_order' => 3,
  ],
];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function categories(): array
    {
        return [
  0 => 
  [
    'name' => 'Bats',
    'slug' => 'bats',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 1,
    'is_active' => true,
  ],
  1 => 
  [
    'name' => 'Grips',
    'slug' => 'grips',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 2,
    'is_active' => true,
  ],
  2 => 
  [
    'name' => 'Gloves',
    'slug' => 'gloves',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 3,
    'is_active' => true,
  ],
  3 => 
  [
    'name' => 'Shirts',
    'slug' => 'shirts',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 4,
    'is_active' => true,
  ],
  4 => 
  [
    'name' => 'Bat Cover',
    'slug' => 'bat-cover',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 5,
    'is_active' => true,
  ],
  5 => 
  [
    'name' => 'Balls',
    'slug' => 'balls',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 6,
    'is_active' => true,
  ],
  6 => 
  [
    'name' => 'Shoes',
    'slug' => 'shoes',
    'parent_slug' => NULL,
    'image' => NULL,
    'sort_order' => 7,
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
  0 => 
  [
    'name' => 'TM KING EDITION - RED',
    'slug' => 'tm-king-edition-red',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your full potential with the </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports King Edition Bat</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, the crown jewel of our collection. Crafted for serious tape ball players who demand elite performance, this bat stands out with its lightweight build of just 850 grams, giving you faster swing speed without sacrificing power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">What sets the King Edition apart?</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Lighter than the Player Edition for unmatched control and speed.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Wider bottom profile for explosive hitting and powerful strokes.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Exclusive premium sticker design, making it visually superior on the field.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Designed with precision for those who want to dominate every match.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Perfect for professionals and passionate players alike, the King Edition Bat combines innovation, design, and performance into one iconic weapon.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-001',
    'price' => '17000.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 10,
    'is_active' => true,
    'is_featured' => true,
    'is_popular' => true,
    'is_special_offer' => true,
    'discount_type' => 'fixed',
    'discount_value' => '14999.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  1 => 
  [
    'name' => 'TM KING EDITION - WHITE',
    'slug' => 'tm-king-edition-white',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your full potential with the </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports King Edition Bat</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, the crown jewel of our collection. Crafted for serious tape ball players who demand elite performance, this bat stands out with its </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">lightweight build of just 850 grams</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, giving you faster swing speed without sacrificing power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">What sets the </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">King Edition</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"> apart?</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Lighter than the Player Edition</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"> for unmatched control and speed.</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Wider bottom profile</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"> for explosive hitting and powerful strokes.</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Exclusive premium sticker design</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, making it visually superior on the field.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Designed with precision for those who want to dominate every match.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Perfect for professionals and passionate players alike, the </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">King Edition Bat</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"> combines innovation, design, and performance into one iconic weapon.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-002',
    'price' => '14999.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 10,
    'is_active' => true,
    'is_featured' => true,
    'is_popular' => false,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '14999.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  2 => 
  [
    'name' => 'TM KING EDITION - GREEN',
    'slug' => 'tm-king-edition-green',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your full potential with the TM Sports King Edition Bat, the crown jewel of our collection. Crafted for serious tape ball players who demand elite performance, this bat stands out with its lightweight build of just 850 grams, giving you faster swing speed without sacrificing power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">What sets the King Edition apart?</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Lighter than the Player Edition for unmatched control and speed.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Wider bottom profile for explosive hitting and powerful strokes.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Exclusive premium sticker design, making it visually superior on the field.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Designed with precision for those who want to dominate every match.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Perfect for professionals and passionate players alike, the King Edition Bat combines innovation, design, and performance into one iconic weapon.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-003',
    'price' => '14999.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 10,
    'is_active' => true,
    'is_featured' => true,
    'is_popular' => false,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  3 => 
  [
    'name' => 'TM KING EDITION - BLACK',
    'slug' => 'tm-king-edition-black',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your full potential with the TM Sports King Edition Bat, the crown jewel of our collection. Crafted for serious tape ball players who demand elite performance, this bat stands out with its lightweight build of just 850 grams, giving you faster swing speed without sacrificing power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">What sets the King Edition apart?</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Lighter than the Player Edition for unmatched control and speed.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Wider bottom profile for explosive hitting and powerful strokes.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Exclusive premium sticker design, making it visually superior on the field.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Designed with precision for those who want to dominate every match.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Perfect for professionals and passionate players alike, the King Edition Bat combines innovation, design, and performance into one iconic weapon.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-004',
    'price' => '14999.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  4 => 
  [
    'name' => 'TM KING EDITION - BLUE',
    'slug' => 'tm-king-edition-blue',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your full potential with the TM Sports King Edition Bat, the crown jewel of our collection. Crafted for serious tape ball players who demand elite performance, this bat stands out with its lightweight build of just 850 grams, giving you faster swing speed without sacrificing power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">What sets the King Edition apart?</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Lighter than the Player Edition for unmatched control and speed.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Wider bottom profile for explosive hitting and powerful strokes.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Exclusive premium sticker design, making it visually superior on the field.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Designed with precision for those who want to dominate every match.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Perfect for professionals and passionate players alike, the King Edition Bat combines innovation, design, and performance into one iconic weapon.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-005',
    'price' => '14999.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 10,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => false,
    'is_special_offer' => true,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  5 => 
  [
    'name' => 'TM BOSS EDITION - BLACK',
    'slug' => 'tm-boss-edition-black',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🏏 TM BOSS EDITION – The Bat of Champions</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your power with the TM Boss Edition by TM Sports — crafted for players who love dominance at the crease. Made from premium Sri Lankan wood, this bat delivers an unbeatable blend of lightweight design and power-packed performance.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🔹 Key Features:</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🌲 Premium Sri Lankan wood – known for durability and solid stroke play.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">⚖ Perfectly balanced bottom – ensures smooth pickup and controlled shots.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">💪 Powerful hitting zone – designed to maximize your hitting power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🌀 Beautiful natural curve – gives you that professional feel and swing.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">✨ Premium-grade sticker design – bold, stylish, and built to stand out.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🪶 Lightweight construction – perfect for fast reflexes and long innings.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"><br>Step onto the pitch with confidence — TM Boss Edition isn’t just a bat, it’s a statement of power, balance, and style.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-006',
    'price' => '18000.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 300,
    'low_stock_threshold' => 30,
    'is_active' => true,
    'is_featured' => true,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '3000.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  6 => 
  [
    'name' => 'TM BOSS EDITION - RED',
    'slug' => 'tm-boss-edition-red',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🏏 TM BOSS EDITION – The Bat of Champions</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Unleash your power with the TM Boss Edition by TM Sports — crafted for players who love dominance at the crease. Made from premium Sri Lankan wood, this bat delivers an unbeatable blend of lightweight design and power-packed performance.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🔹 Key Features:</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🌲 Premium Sri Lankan wood – known for durability and solid stroke play.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">⚖ Perfectly balanced bottom – ensures smooth pickup and controlled shots.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">💪 Powerful hitting zone – designed to maximize your hitting power.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🌀 Beautiful natural curve – gives you that professional feel and swing.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">✨ Premium-grade sticker design – bold, stylish, and built to stand out.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🪶 Lightweight construction – perfect for fast reflexes and long innings.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"><br>Step onto the pitch with confidence — TM Boss Edition isn’t just a bat, it’s a statement of power, balance, and style.</span></span></p>',
    'sku' => 'TMSPORTS-BATS-007',
    'price' => '18000.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 300,
    'low_stock_threshold' => 10,
    'is_active' => true,
    'is_featured' => true,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '2000.00',
    'discount_starts_at' => '2026-02-20 05:10:00',
    'discount_ends_at' => '2031-02-19 05:10:00',
  ],
  7 => 
  [
    'name' => 'TM Sports Premium Cricket Bat Grips -Black',
    'slug' => 'tm-sports-premium-cricket-bat-grips-black',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Upgrade your game with&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports Premium Cricket Bat Grips</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, crafted for players who demand&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">better grip, more control, and lasting comfort</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">. Whether you’re playing tape ball or hardball cricket, our grips are engineered to boost your confidence at the crease.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🛡️&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Key Features:</span></span></strong></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">High-Quality Rubber:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Durable and long-lasting for all weather conditions</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Anti-Slip Texture:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Designed to reduce slippage and hand fatigue</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Enhanced Comfort:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Soft cushioning absorbs shock and reduces vibration</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Easy to Apply:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Fits all standard cricket bat handles</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Variety of Colors &amp; Patterns:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Match your style or team colors</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Ideal for both professional and street cricketers, TM Sports bat grips help you maintain control in every shot – from powerful drives to sneaky singles.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🎯&nbsp;</span></span><em><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Feel the difference in every swing – with TM Sports bat grips, performance is in your hands.</span></span></em></p>',
    'sku' => 'TMSPORTS-GRIPS-001',
    'price' => '300.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'grips',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => false,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '100.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  8 => 
  [
    'name' => 'TM Sports Premium Cricket Bat Grips - White',
    'slug' => 'tm-sports-premium-cricket-bat-grips-white',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Upgrade your game with&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports Premium Cricket Bat Grips</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, crafted for players who demand&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">better grip, more control, and lasting comfort</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">. Whether you’re playing tape ball or hardball cricket, our grips are engineered to boost your confidence at the crease.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🛡️&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Key Features:</span></span></strong></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">High-Quality Rubber:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Durable and long-lasting for all weather conditions</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Anti-Slip Texture:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Designed to reduce slippage and hand fatigue</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Enhanced Comfort:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Soft cushioning absorbs shock and reduces vibration</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Easy to Apply:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Fits all standard cricket bat handles</span></span></p><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Variety of Colors &amp; Patterns:</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;Match your style or team colors</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Ideal for both professional and street cricketers, TM Sports bat grips help you maintain control in every shot – from powerful drives to sneaky singles.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🎯&nbsp;</span></span><em><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Feel the difference in every swing – with TM Sports bat grips, performance is in your hands.</span></span></em></p>',
    'sku' => 'TMSPORTS-GRIPS-002',
    'price' => '300.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'grips',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 10,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => false,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '100.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  9 => 
  [
    'name' => 'TM Sports Signature T-Shirts',
    'slug' => 'tm-sports-signature-t-shirts',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Step up your cricket style with the&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports Signature T-Shirts</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">, designed for fans and players who love to represent the game in comfort and class. Made from breathable, high-quality fabric, these shirts deliver both performance and street-ready style.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">🔥&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Available in Two Variants:</span></span></strong></p><ol><li><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Chrome Sticker Edition</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;– Features a bold, reflective chrome TM Sports logo that pops under light. Perfect for standout style and sporty vibes.</span></span></p></li><li><p><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Simple Sticker Edition</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">&nbsp;– A clean, minimal design with the classic TM Sports logo. Ideal for a casual and comfortable everyday look.</span></span></p></li></ol><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">✅&nbsp;</span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Features:</span></span></strong></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Soft, sweat-wicking cotton blend</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Athletic fit for easy movement</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Durable print that lasts through washes</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Available in multiple sizes</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Perfect for casual wear, practice sessions, or match day support</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Wear your passion with pride – TM Sports t-shirts bring comfort and cricket together in one iconic piece.</span></span></p>',
    'sku' => 'TMSPORTS-SHIRTS-001',
    'price' => '2500.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'shirts',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  10 => 
  [
    'name' => 'TM Sports Premium Bat Cover',
    'slug' => 'tm-sports-premium-bat-cover',
    'description' => '<p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Protect your bat in style with the </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports Premium Bat Cover</span></span></strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);"> – designed for durability, convenience, and a professional look. Crafted from high-quality material, this cover safeguards your bat from dust, moisture, and scratches during travel or storage.</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">✅ </span></span><strong><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Features:</span></span></strong></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Heavy-duty, tear-resistant fabric</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Comfortable carry strap for easy transport</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Smooth zipper closure</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Suitable for all standard-size cricket bats</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Lightweight yet tough for everyday use</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">TM Sports branding for an official, sporty finish</span></span></p><p><span style="color: rgba(0, 0, 0, 0.81);"><span style="background-color: rgb(255, 255, 255);">Whether you’re heading to practice or storing your bat off-season, this bat cover keeps your gear safe and ready to perform. A must-have for any serious cricketer.</span></span></p>',
    'sku' => 'TMSPORTS-BATCOVER-001',
    'price' => '1300.00',
    'brand_slug' => 'tm-sports',
    'category_slug' => 'bat-cover',
    'stock_quantity' => 0,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  11 => 
  [
    'name' => 'Fplus TM Edition - White',
    'slug' => 'fplus-tm-edition-white',
    'description' => '<p>Step onto the crease with confidence using the <strong>FPlus King Edition Bat</strong> — engineered for players who play to win. Built specifically for competitive tape ball cricket, this bat delivers the perfect balance of speed, control, and raw hitting power.</p><p>Weighing only 850 grams, the FPlus King Edition allows lightning-fast swings while maintaining solid impact for powerful shots. Its carefully crafted profile ensures better grip, improved balance, and maximum performance in every match.</p><h3>Why choose the FPlus King Edition?</h3><ul><li><p>Ultra-lightweight design for quicker bat speed and effortless control.</p></li><li><p>Thick and wide sweet spot for clean, powerful strikes.</p></li><li><p>Enhanced bottom profile for strong boundary hitting.</p></li><li><p>Premium FPlus branding for a bold and professional look.</p></li><li><p>Designed for both tournament players and serious tape ball competitors.</p></li></ul><p>The <strong>FPlus King Edition Bat</strong> is not just equipment — it’s your statement on the field.</p>',
    'sku' => 'FPLUS-BATS-001',
    'price' => '15000.00',
    'brand_slug' => 'f-plus',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 100,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  12 => 
  [
    'name' => 'Fplus TM Edition - Black',
    'slug' => 'fplus-tm-edition-black',
    'description' => '<p>Step onto the crease with confidence using the <strong>FPlus King Edition Bat</strong> — engineered for players who play to win. Built specifically for competitive tape ball cricket, this bat delivers the perfect balance of speed, control, and raw hitting power.</p><p>Weighing only 850 grams, the FPlus King Edition allows lightning-fast swings while maintaining solid impact for powerful shots. Its carefully crafted profile ensures better grip, improved balance, and maximum performance in every match.</p><h3>Why choose the FPlus King Edition?</h3><ul><li><p>Ultra-lightweight design for quicker bat speed and effortless control.</p></li><li><p>Thick and wide sweet spot for clean, powerful strikes.</p></li><li><p>Enhanced bottom profile for strong boundary hitting.</p></li><li><p>Premium FPlus branding for a bold and professional look.</p></li><li><p>Designed for both tournament players and serious tape ball competitors.</p></li></ul><p>The <strong>FPlus King Edition Bat</strong> is not just equipment — it’s your statement on the field.</p>',
    'sku' => 'FPLUS-BATS-002',
    'price' => '15000.00',
    'brand_slug' => 'f-plus',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  13 => 
  [
    'name' => 'Fplus Gloves',
    'slug' => 'fplus-gloves',
    'description' => '<p>Play longer and stay comfortable with <strong>FPlus Inner Gloves</strong>, specially designed to keep your hands cool, dry, and protected inside your batting or wicketkeeping gloves. A must-have for serious players, FPlus inner gloves deliver superior comfort, a perfect fit, and improved hygiene during intense matches and practice sessions.</p><h3>Key Features:</h3><ul><li><p><strong>Sweat-Absorbing Fabric:</strong> Keeps hands dry and helps prevent odor build-up</p></li><li><p><strong>Soft &amp; Stretchable Material:</strong> Provides a snug, flexible, and comfortable fit</p></li><li><p><strong>Breathable Design:</strong> Promotes airflow to reduce heat and moisture</p></li><li><p><strong>Reduced Friction:</strong> Minimizes blisters and discomfort inside outer gloves</p></li><li><p><strong>Universal Fit:</strong> Ideal for both batting and wicketkeeping gloves</p></li></ul><p>Whether you\'re playing a full-day tournament or a fast-paced tape ball match, <strong>FPlus Inner Gloves</strong> give you the comfort, protection, and confidence to focus entirely on your performance.</p>',
    'sku' => 'FPLUS-GLOVES-001',
    'price' => '200.00',
    'brand_slug' => 'f-plus',
    'category_slug' => 'gloves',
    'stock_quantity' => 5000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => false,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  14 => 
  [
    'name' => 'Fplus Tenis Balls',
    'slug' => 'fplus-tenis-balls',
    'description' => '<p>Dominate every match with the <strong>FPlus Tennis Ball</strong>, engineered for consistent bounce, durability, and high performance. Whether you’re playing tape ball cricket, street cricket, or practice sessions, this ball is designed to deliver reliable speed and control on every surface.</p><p>Crafted with premium-quality rubber and a strong outer felt layer, the FPlus Tennis Ball maintains its shape and performance even after extended play. Its balanced weight ensures better swing, accurate bowling, and powerful hitting.</p><h3>Key Features:</h3><ul><li><p><strong>Consistent Bounce:</strong> Reliable performance on hard and rough surfaces</p></li><li><p><strong>Durable Construction:</strong> Long-lasting rubber core for extended use</p></li><li><p><strong>Premium Felt Finish:</strong> Smooth grip and controlled movement</p></li><li><p><strong>Perfect Weight Balance:</strong> Ideal for tape ball and casual cricket matches</p></li><li><p><strong>High Visibility Color:</strong> Easy to track during day or evening games</p></li></ul><p>The <strong>FPlus Tennis Ball</strong> is built for players who demand quality, performance, and durability in every game.</p>',
    'sku' => 'FPLUS-BALLS-001',
    'price' => '500.00',
    'brand_slug' => 'f-plus',
    'category_slug' => 'balls',
    'stock_quantity' => 10000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => false,
    'is_special_offer' => false,
    'discount_type' => NULL,
    'discount_value' => NULL,
    'discount_starts_at' => NULL,
    'discount_ends_at' => NULL,
  ],
  15 => 
  [
    'name' => 'JD sport - Diamond 17 Edition',
    'slug' => 'jd-sport-diamond-17-edition',
    'description' => '<p><span style="color: rgb(44, 43, 43);"><span style="background-color: rgb(255, 255, 255);">Diamond Player Edition Bat, meticulously crafted from premium Coconut Wood, is built for players who demand top-tier performance. It offers superior durability, precision, and explosive power, making it perfect for intense competitive matches. The bat’s balanced design ensures excellent control and shot accuracy. Ideal for professional-level gameplay where every stroke counts.</span></span></p>',
    'sku' => 'JDSPORTS-BATS-001',
    'price' => '13500.00',
    'brand_slug' => 'jd-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '2000.00',
    'discount_starts_at' => '2026-02-19 06:10:00',
    'discount_ends_at' => '2030-02-20 05:10:00',
  ],
  16 => 
  [
    'name' => 'JD sport - King Player Edition',
    'slug' => 'jd-sport-king-player-edition',
    'description' => '<p><span style="color: rgb(44, 43, 43);"><span style="background-color: rgb(255, 255, 255);">King Player Edition Bat, expertly crafted from premium Coconut Wood, redefines professional-grade performance with its unmatched strength and precision. Engineered for elite players, it offers exceptional balance, control, and power at the crease. Its dense coconut wood core ensures long-lasting durability even in intense gameplay. A true choice for champions striving for peak performance.</span></span></p>',
    'sku' => 'JDSPORTS-BATS-002',
    'price' => '17500.00',
    'brand_slug' => 'jd-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '4000.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  17 => 
  [
    'name' => 'JD sports - KC Player Edition',
    'slug' => 'jd-sports-kc-player-edition',
    'description' => '<p><span style="color: rgb(44, 43, 43);"><span style="background-color: rgb(255, 255, 255);">KC Player Edition Bat, expertly crafted from premium Coconut Wood, is engineered for serious cricketers seeking elite performance. With exceptional durability, precision, and power, it thrives under the pressure of high-level competition. Its well-balanced structure enhances shot control and timing. Perfectly suited for professional and competitive gameplay.</span></span></p>',
    'sku' => 'JDSPORTS-BATS-003',
    'price' => '14500.00',
    'brand_slug' => 'jd-sports',
    'category_slug' => 'bats',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '2000.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
  18 => 
  [
    'name' => 'JD sports -  Shoes King',
    'slug' => 'jd-sports-shoes-king',
    'description' => '<p><span style="color: rgb(44, 43, 43);"><span style="background-color: rgb(255, 255, 255);">JD King cricket shoes are engineered for serious performance, offering superior grip, lightweight comfort, and durable support. Designed for professionals and aspiring players alike, they ensure stability during quick movements, powerful shots, and long matches.</span></span></p>',
    'sku' => 'JDSPORTS-SHOES-001',
    'price' => '10000.00',
    'brand_slug' => 'jd-sports',
    'category_slug' => 'shoes',
    'stock_quantity' => 1000,
    'low_stock_threshold' => 5,
    'is_active' => true,
    'is_featured' => false,
    'is_popular' => true,
    'is_special_offer' => false,
    'discount_type' => 'fixed',
    'discount_value' => '2000.00',
    'discount_starts_at' => '2026-02-19 05:10:00',
    'discount_ends_at' => '2030-02-19 05:10:00',
  ],
];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function productImages(): array
    {
        return [
  0 => 
  [
    'product_slug' => 'tm-king-edition-red',
    'path' => 'shop/products/wC88U7OLxeRZuVesLpCSYHFsfiCJqW5wWNynfytT.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  1 => 
  [
    'product_slug' => 'tm-king-edition-red',
    'path' => 'shop/products/Tdpvx1eLsVCdCy1GE6lGGGURFSffgxgUsFmitrrF.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  2 => 
  [
    'product_slug' => 'tm-king-edition-red',
    'path' => 'shop/products/kXLDrQqXb7rUPBsLoP1eIEZ0gbFzdDdoFEnbkzwG.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  3 => 
  [
    'product_slug' => 'tm-king-edition-white',
    'path' => 'shop/products/jn2UqJUR7Mu4uBEHQ0suR0G8cfz3bf8EotyyEkJB.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  4 => 
  [
    'product_slug' => 'tm-king-edition-white',
    'path' => 'shop/products/9RKbk3JKWe3zAB3Faq8hkYCu1TZ56PBKW5IOZ7aD.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  5 => 
  [
    'product_slug' => 'tm-king-edition-green',
    'path' => 'shop/products/1wDJOAx6AayZDG9pImaWJakQmPdCeHQFnPuXIXKo.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  6 => 
  [
    'product_slug' => 'tm-king-edition-green',
    'path' => 'shop/products/eeyi0Ji3jbhWwBrQ8lpGXDMxYAN121zfTQ331wXa.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  7 => 
  [
    'product_slug' => 'tm-king-edition-green',
    'path' => 'shop/products/xQ1xBcuet8mBqdgFCs1MrtwRhT6XKMz3IWoJlAfl.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  8 => 
  [
    'product_slug' => 'tm-king-edition-black',
    'path' => 'shop/products/DaOFQHOzLI0MGUeZMt1GMJk4e7XUcXRmi9nU5Itz.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  9 => 
  [
    'product_slug' => 'tm-king-edition-black',
    'path' => 'shop/products/ybDNWW5ZrAh8SkedhIrmPKhHxyARZTfffDVeZ4B3.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  10 => 
  [
    'product_slug' => 'tm-king-edition-black',
    'path' => 'shop/products/h8IoHbE6RYul3oNKiKopWNRXqxX5TKyoUXgZkIXS.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  11 => 
  [
    'product_slug' => 'tm-king-edition-blue',
    'path' => 'shop/products/QfCAFpu2UcRaZ9d0RHf85nz3y87fLXfHA6xd2yGm.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  12 => 
  [
    'product_slug' => 'tm-king-edition-blue',
    'path' => 'shop/products/aBEOSs4y5biRe7wqdghhbQY09fCiXszt5TjNP6sW.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  13 => 
  [
    'product_slug' => 'tm-boss-edition-black',
    'path' => 'shop/products/cTfXD1aA7cwhVJQaqzzYlIqV1NBAgiZl5jaq4J7z.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  14 => 
  [
    'product_slug' => 'tm-boss-edition-black',
    'path' => 'shop/products/RiAZnltDNIJ74mZj5GnxVwhjTqpCBNRVjZktWlso.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  15 => 
  [
    'product_slug' => 'tm-boss-edition-black',
    'path' => 'shop/products/MylntwW7SB1tno9Y805Dxj4DuVX84Rsp66IWFX19.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  16 => 
  [
    'product_slug' => 'tm-boss-edition-red',
    'path' => 'shop/products/MJ3ZI9fN1xXeYWXiZO8xxZ0zbjj0W9qlkw9VGqrs.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  17 => 
  [
    'product_slug' => 'tm-boss-edition-red',
    'path' => 'shop/products/cw7ERSIzCSjZ49JxqDcuZpj68jX8jI5XXqkinUIt.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  18 => 
  [
    'product_slug' => 'tm-boss-edition-red',
    'path' => 'shop/products/VtoyGJ4UyPFIQwEimoCMuCHOfqCnoMsScXMOwOcq.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  19 => 
  [
    'product_slug' => 'tm-sports-premium-cricket-bat-grips-black',
    'path' => 'shop/products/6qwxvz0rPSYF23gjPpMCcQpOI4kANSXi8UzSLZFz.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  20 => 
  [
    'product_slug' => 'tm-sports-premium-cricket-bat-grips-white',
    'path' => 'shop/products/BYgaTQs5Vxkea7XodpPucehycpL0aDgF0OEBaWdJ.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  21 => 
  [
    'product_slug' => 'tm-sports-signature-t-shirts',
    'path' => 'shop/products/MFSVhqNTzJLSnd3giXPyopzQJSlMNaPH90ZQSilL.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  22 => 
  [
    'product_slug' => 'tm-sports-premium-bat-cover',
    'path' => 'shop/products/JQ9EtfJ1jyisy7glCPW3y3rw1lokFqDujdOC1VwA.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  23 => 
  [
    'product_slug' => 'fplus-tm-edition-white',
    'path' => 'shop/products/4OzUG9VyEtuzEtVxq6NsQ9U4mdMu1Wpbb6e2RqvS.jpg',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  24 => 
  [
    'product_slug' => 'fplus-tm-edition-white',
    'path' => 'shop/products/HgrBTaWtgGKg471kXPmFcmPBsZULMcsIFIpi0bZA.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  25 => 
  [
    'product_slug' => 'fplus-tm-edition-white',
    'path' => 'shop/products/5U9deTYNccPkaR1haU698lQsPaFQyOYmJQAmh5T2.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  26 => 
  [
    'product_slug' => 'fplus-tm-edition-black',
    'path' => 'shop/products/tF9k7SGQWEWtTWVCwm5WrkSjxIMEAL2ERB67Lrbs.webp',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  27 => 
  [
    'product_slug' => 'fplus-tm-edition-black',
    'path' => 'shop/products/mdSLpWTCbiKbE7T4bn6WRbXMryyWPlPgQutDyAQL.webp',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  28 => 
  [
    'product_slug' => 'fplus-tm-edition-black',
    'path' => 'shop/products/Fz5oTvqPZa01ZgYyjV7IzQSE7DHzkaHXTPB2HLHx.webp',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  29 => 
  [
    'product_slug' => 'fplus-gloves',
    'path' => 'shop/products/SqYu6NsQqJde3zdogY9XqZWKlqQBiEwzb2r6dfMt.jpg',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  30 => 
  [
    'product_slug' => 'fplus-gloves',
    'path' => 'shop/products/Udn8ZEwNIqZ3Fs8fSV7cuGk5ihp2A79U9qbYxEqK.jpg',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  31 => 
  [
    'product_slug' => 'fplus-tenis-balls',
    'path' => 'shop/products/LWzsNzMv5AdaZPWgedPpR5A24zOdIozMAiYpBOQj.jpg',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  32 => 
  [
    'product_slug' => 'fplus-tenis-balls',
    'path' => 'shop/products/FkUSQ9KcADEZRePxilTbKnmEAnoO9r30Fb8SIvhT.jpg',
    'alt' => NULL,
    'sort_order' => 1,
  ],
  33 => 
  [
    'product_slug' => 'fplus-tenis-balls',
    'path' => 'shop/products/6bQfpAHwgUkQwLxGfVztoRgXSkuuKc2JeQPJDmTf.jpg',
    'alt' => NULL,
    'sort_order' => 2,
  ],
  34 => 
  [
    'product_slug' => 'jd-sport-diamond-17-edition',
    'path' => 'shop/products/iwQH134Fv6GBuubjxPXLynEc1tXBQM8YcJX8MGtF.png',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  35 => 
  [
    'product_slug' => 'jd-sport-king-player-edition',
    'path' => 'shop/products/C5tbgQbmDiYY2dbEzzjaKmtFknwALPIJOQoGFoVo.png',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  36 => 
  [
    'product_slug' => 'jd-sports-kc-player-edition',
    'path' => 'shop/products/di3tILLicxbYGSlAvmWPmyFLBDdp3LxL3F5ydEQj.png',
    'alt' => NULL,
    'sort_order' => 0,
  ],
  37 => 
  [
    'product_slug' => 'jd-sports-shoes-king',
    'path' => 'shop/products/fY1b2TSWYRlQbUegon1b6UTlIMX9DoXgjB6pq8b8.png',
    'alt' => NULL,
    'sort_order' => 0,
  ],
];
    }
}