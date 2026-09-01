<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class OpenFactsProductLookup
{
    /**
     * Return only the catalog fields that can safely be suggested in the
     * product form. Pricing, stock, and variants are shop-specific and are
     * deliberately not sourced from an external catalog.
     */
    public function find(string $barcode): ?array
    {
        return Cache::remember(
            "open-facts-product:{$barcode}",
            now()->addDays(7),
            fn (): ?array => $this->fetch($barcode),
        );
    }

    private function fetch(string $barcode): ?array
    {
        $response = Http::baseUrl(config('services.open_food_facts.base_url'))
            ->acceptJson()
            ->withUserAgent(config('services.open_food_facts.user_agent'))
            // An explicit empty proxy bypasses host-level HTTP(S)_PROXY values.
            ->withOptions(['proxy' => config('services.open_food_facts.proxy')])
            ->timeout(5)
            ->retry(2, 200, throw: false)
            ->get("/api/v3/product/{$barcode}", ['product_type' => 'all']);

        if (! $response->successful() || ! is_array($response->json('product'))) {
            return null;
        }

        $product = $response->json('product');
        $name = $this->firstPresent($product, ['product_name', 'generic_name', 'brands']);

        if ($name === null) {
            return null;
        }

        return array_filter([
            'name' => $name,
            'description' => $this->firstPresent($product, ['generic_name']),
            'image' => $this->validImageUrl($this->firstPresent($product, ['image_front_url', 'image_url'])),
            'brand' => $this->firstPresent($product, ['brands']),
        ], static fn (mixed $value): bool => $value !== null);
    }

    private function firstPresent(array $product, array $keys): ?string
    {
        foreach ($keys as $key) {
            $value = $product[$key] ?? null;

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    private function validImageUrl(?string $url): ?string
    {
        if (! $url || ! filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        return in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true) ? $url : null;
    }
}
