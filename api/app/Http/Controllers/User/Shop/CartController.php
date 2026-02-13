<?php

namespace App\Http\Controllers\User\Shop;

use App\Http\Controllers\BaseControllerTrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Shop\AddToCartRequest;
use App\Http\Requests\User\Shop\UpdateCartItemRequest;
use App\Http\Resources\User\Shop\CartResource;
use App\Models\Shop\Cart;
use App\Models\Shop\CartItem;
use App\Models\Shop\Product;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    use BaseControllerTrait;

    /** Get the authenticated user's cart. */
    public function show(): JsonResponse
    {
        $cart = $this->getOrCreateCart();

        $cart->load(['items.product']);

        return $this->success(new CartResource($cart));
    }

    /** Add a product to cart or update quantity if already in cart. */
    public function addItem(AddToCartRequest $request): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        $product = Product::query()->active()->findOrFail($request->validated('product_id'));
        $quantity = (int) $request->validated('quantity');

        $available = max(0, $product->stock_quantity ?? 0);
        if ($quantity > $available) {
            return $this->failure("Quantity exceeds available stock ({$available}).", 'VALIDATION_ERROR');
        }

        $price = $product->getSalePrice() ?? (float) $product->price;

        $item = $cart->items()->where('product_id', $product->id)->first();
        if ($item) {
            $newQty = $item->quantity + $quantity;
            if ($newQty > $available) {
                return $this->failure("Total quantity would exceed available stock ({$available}).", 'VALIDATION_ERROR');
            }
            $item->update(['quantity' => $newQty, 'price_snapshot' => $price]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price_snapshot' => $price,
            ]);
        }

        $cart->load(['items.product']);

        return $this->success(new CartResource($cart), 'Cart updated.');
    }

    /** Update cart item quantity. */
    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        if ($cartItem->cart_id !== $cart->id) {
            return $this->failure('Cart item not found.', 'NOT_FOUND');
        }

        $quantity = (int) $request->validated('quantity');
        $product = $cartItem->product;
        $available = max(0, $product->stock_quantity ?? 0);
        if ($quantity > $available) {
            return $this->failure("Quantity exceeds available stock ({$available}).", 'VALIDATION_ERROR');
        }

        $cartItem->update([
            'quantity' => $quantity,
            'price_snapshot' => $product->getSalePrice() ?? (float) $product->price,
        ]);

        $cart->load(['items.product']);

        return $this->success(new CartResource($cart), 'Cart updated.');
    }

    /** Remove an item from cart. */
    public function removeItem(CartItem $cartItem): JsonResponse
    {
        $cart = $this->getOrCreateCart();
        if ($cartItem->cart_id !== $cart->id) {
            return $this->failure('Cart item not found.', 'NOT_FOUND');
        }

        $cartItem->delete();
        $cart->load(['items.product']);

        return $this->success(new CartResource($cart), 'Item removed.');
    }

    private function getOrCreateCart(): Cart
    {
        $user = request()->user();

        return Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['user_id' => $user->id]
        );
    }
}
