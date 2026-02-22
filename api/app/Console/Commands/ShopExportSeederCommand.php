<?php

namespace App\Console\Commands;

use App\Models\Shop\Brand;
use App\Models\Shop\Category;
use App\Models\Shop\Product;
use App\Models\Shop\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class ShopExportSeederCommand extends Command
{
    protected $signature = 'shop:export-seeder
                            {--force : Overwrite ShopSeeder without confirmation}';

    protected $description = 'Export existing shop data (brands, categories, products, images) from DB into ShopSeeder';

    public function handle(): int
    {
        if (! $this->tablesExist()) {
            $this->error('Shop tables do not exist. Run migrations first.');

            return self::FAILURE;
        }

        $brands = $this->exportBrands();
        $categories = $this->exportCategories();
        $products = $this->exportProducts();
        $productImages = $this->exportProductImages();

        $path = database_path('seeders/ShopSeeder.php');
        if (! $this->option('force') && file_exists($path)) {
            if (! $this->confirm('Overwrite existing ShopSeeder.php?')) {
                return self::SUCCESS;
            }
        }

        $content = $this->buildSeederContent($brands, $categories, $products, $productImages);
        file_put_contents($path, $content);

        $this->info('ShopSeeder written to database/seeders/ShopSeeder.php');
        $this->info('Brands: '.count($brands).', Categories: '.count($categories).', Products: '.count($products).', Product images: '.count($productImages));

        return self::SUCCESS;
    }

    protected function tablesExist(): bool
    {
        return Schema::hasTable('shop_brands')
            && Schema::hasTable('shop_categories')
            && Schema::hasTable('shop_products')
            && Schema::hasTable('shop_product_images');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function exportBrands(): array
    {
        $out = [];
        foreach (Brand::orderBy('id')->get() as $brand) {
            $out[] = [
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo' => $brand->logo,
                'is_active' => $brand->is_active,
                'sort_order' => (int) $brand->sort_order,
            ];
        }

        return $out;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function exportCategories(): array
    {
        $out = [];
        $categories = Category::with('parent')->orderByRaw('parent_id is null desc')->orderBy('parent_id')->orderBy('id')->get();
        foreach ($categories as $cat) {
            $row = [
                'name' => $cat->name,
                'slug' => $cat->slug,
                'parent_slug' => $cat->parent_id ? ($cat->parent->slug ?? null) : null,
                'image' => $cat->image,
                'sort_order' => (int) $cat->sort_order,
                'is_active' => $cat->is_active,
            ];
            $out[] = $row;
        }

        return $out;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function exportProducts(): array
    {
        $out = [];
        foreach (Product::with(['brand', 'category'])->orderBy('id')->get() as $product) {
            $out[] = [
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'sku' => $product->sku,
                'price' => (string) $product->price,
                'brand_slug' => $product->brand_id ? ($product->brand->slug ?? null) : null,
                'category_slug' => $product->category_id ? ($product->category->slug ?? null) : null,
                'stock_quantity' => (int) $product->stock_quantity,
                'low_stock_threshold' => (int) $product->low_stock_threshold,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'is_popular' => $product->is_popular,
                'is_special_offer' => $product->is_special_offer,
                'discount_type' => $product->discount_type?->value ?? null,
                'discount_value' => $product->discount_value !== null ? (string) $product->discount_value : null,
                'discount_starts_at' => $product->discount_starts_at?->format('Y-m-d H:i:s'),
                'discount_ends_at' => $product->discount_ends_at?->format('Y-m-d H:i:s'),
            ];
        }

        return $out;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function exportProductImages(): array
    {
        $out = [];
        foreach (ProductImage::with('product')->orderBy('id')->get() as $img) {
            $out[] = [
                'product_slug' => $img->product->slug ?? null,
                'path' => $img->path,
                'alt' => $img->alt,
                'sort_order' => (int) $img->sort_order,
            ];
        }

        return $out;
    }

    /**
     * @param  array<int, array<string, mixed>>  $brands
     * @param  array<int, array<string, mixed>>  $categories
     * @param  array<int, array<string, mixed>>  $products
     * @param  array<int, array<string, mixed>>  $productImages
     */
    protected function buildSeederContent(array $brands, array $categories, array $products, array $productImages): string
    {
        $brandsExport = $this->varExportShort($brands);
        $categoriesExport = $this->varExportShort($categories);
        $productsExport = $this->varExportShort($products);
        $productImagesExport = $this->varExportShort($productImages);

        return <<<PHP
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
        \$this->seedBrands();
        \$this->seedCategories();
        \$this->seedProducts();
        \$this->seedProductImages();
    }

    protected function seedBrands(): void
    {
        foreach (\$this->brands() as \$row) {
            Brand::updateOrCreate(
                ['slug' => \$row['slug']],
                [
                    'name' => \$row['name'],
                    'logo' => \$row['logo'] ?? null,
                    'is_active' => \$row['is_active'] ?? true,
                    'sort_order' => \$row['sort_order'] ?? 0,
                ]
            );
        }
    }

    protected function seedCategories(): void
    {
        foreach (\$this->categories() as \$row) {
            \$attributes = [
                'name' => \$row['name'],
                'image' => \$row['image'] ?? null,
                'sort_order' => \$row['sort_order'] ?? 0,
                'is_active' => \$row['is_active'] ?? true,
            ];
            if (! empty(\$row['parent_slug'])) {
                \$attributes['parent_id'] = Category::where('slug', \$row['parent_slug'])->value('id');
            } else {
                \$attributes['parent_id'] = null;
            }
            Category::updateOrCreate(['slug' => \$row['slug']], \$attributes);
        }
    }

    protected function seedProducts(): void
    {
        foreach (\$this->products() as \$row) {
            \$attributes = [
                'name' => \$row['name'],
                'description' => \$row['description'] ?? null,
                'sku' => \$row['sku'] ?? null,
                'price' => \$row['price'],
                'stock_quantity' => \$row['stock_quantity'] ?? 0,
                'low_stock_threshold' => \$row['low_stock_threshold'] ?? 5,
                'is_active' => \$row['is_active'] ?? true,
                'is_featured' => \$row['is_featured'] ?? false,
                'is_popular' => \$row['is_popular'] ?? false,
                'is_special_offer' => \$row['is_special_offer'] ?? false,
                'discount_type' => \$row['discount_type'] ?? null,
                'discount_value' => \$row['discount_value'] ?? null,
                'discount_starts_at' => \$row['discount_starts_at'] ?? null,
                'discount_ends_at' => \$row['discount_ends_at'] ?? null,
            ];
            if (! empty(\$row['brand_slug'])) {
                \$attributes['brand_id'] = Brand::where('slug', \$row['brand_slug'])->value('id');
            } else {
                \$attributes['brand_id'] = null;
            }
            if (! empty(\$row['category_slug'])) {
                \$attributes['category_id'] = Category::where('slug', \$row['category_slug'])->value('id');
            } else {
                \$attributes['category_id'] = null;
            }
            Product::updateOrCreate(['slug' => \$row['slug']], \$attributes);
        }
    }

    protected function seedProductImages(): void
    {
        foreach (\$this->productImages() as \$row) {
            \$productId = Product::where('slug', \$row['product_slug'])->value('id');
            if (! \$productId) {
                continue;
            }
            ProductImage::updateOrCreate(
                [
                    'product_id' => \$productId,
                    'path' => \$row['path'],
                ],
                [
                    'alt' => \$row['alt'] ?? null,
                    'sort_order' => \$row['sort_order'] ?? 0,
                ]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function brands(): array
    {
        return {$brandsExport};
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function categories(): array
    {
        return {$categoriesExport};
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function products(): array
    {
        return {$productsExport};
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function productImages(): array
    {
        return {$productImagesExport};
    }
}
PHP;
    }

    /**
     * Converts a PHP array to short bracket syntax suitable for embedding in generated code.
     *
     * The original version had three bugs, all in the closing-paren replacement regexes:
     *
     *  1. `/\)$/s`  — the `s` (DOTALL) flag makes `.` match newlines, so `$` no longer
     *     anchors to the end of each *line*; it anchors to the end of the entire *string*.
     *     This caused the last regex to swallow everything from the first `)` to the very
     *     end of the exported string, completely mangling the output.
     *
     *  2. `/\),\s*$/m` — only matched `)` followed by a comma, so the outermost closing
     *     `)` (no trailing comma) was never converted, leaving mixed `)`/`]` syntax.
     *
     *  3. `/\),\s*\)/s` — again with the DOTALL bug, and emitted `]]` without a comma,
     *     breaking any inner array that needed `],`.
     *
     * The fix: two simple passes, both using the multiline (`m`) flag WITHOUT `s`,
     * so `$` correctly anchors to the end of each individual line.
     *
     * @param  array<int, mixed>  $data
     */
    protected function varExportShort(array $data): string
    {
        $export = var_export($data, true);

        // Convert all "array (" openings to "["
        $export = preg_replace('/array \(/', '[', $export);

        // Convert every line-ending ")" or ")," to "]" or "],"
        // - Multiline (m): $ matches end of each line, not end of the whole string.
        // - No DOTALL (s): keeps correct per-line anchoring.
        $export = preg_replace('/\)(,?)$/m', ']$1', $export);

        return $export;
    }
}