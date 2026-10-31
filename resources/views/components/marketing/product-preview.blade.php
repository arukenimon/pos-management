@props(['mode' => 'overview'])
<div class="product-preview" role="img" aria-label="Illustrative TindaHub {{ $mode }} screen with sample data">
    <div class="preview-top"><span class="preview-brand"><img src="{{ asset('favicon.svg') }}" alt="" width="21" height="21">TindaHub.</span><span class="preview-shop">The neighborhood shop <span>⌄</span></span><span class="preview-avatar">M</span></div>
    <div class="preview-body">
        <div class="preview-nav" aria-hidden="true">
            @foreach(['overview' => ['chart', 'Overview'], 'checkout' => ['scan', 'Point of sale'], 'inventory' => ['box', 'Inventory'], 'sales' => ['chart', 'Sales'], 'team' => ['team', 'Team']] as $key => $item)
                <span class="{{ $mode === $key ? 'is-current' : '' }}"><x-marketing.icon :name="$item[0]" />{{ $item[1] }}</span>
            @endforeach
            <span class="preview-nav-bottom"><span class="preview-avatar">M</span>Maria Santos</span>
        </div>
        <div class="preview-workspace">
            @if($mode === 'checkout')
                <div class="preview-heading"><div><strong>A good day starts here.</strong><small>Your products. Ready to go.</small></div><x-marketing.icon name="scan" /></div>
                <div class="preview-checkout"><div><div class="preview-search">Search products or scan a barcode</div><div class="preview-products">
                    @foreach([['Coffee beans', '180.00', 'coffee'], ['Oat milk', '125.00', 'milk'], ['Sourdough', '95.00', 'bread'], ['Matcha latte', '145.00', 'matcha']] as $product)
                        <div class="preview-product"><div class="product-object {{ $product[2] }}" aria-hidden="true"><span></span></div><strong>{{ $product[0] }}</strong><small>₱{{ $product[1] }}</small></div>
                    @endforeach
                </div></div><div class="preview-cart"><strong>Current sale</strong><small>Ready when you are</small><div class="preview-cart-line"><span>Coffee beans × 1</span><b>₱180</b></div><div class="preview-cart-line"><span>Oat milk × 2</span><b>₱250</b></div><div class="preview-cart-total"><span>Total</span><b>₱430.00</b></div><div class="preview-payment"><span>Cash</span><span>Card</span></div><div class="preview-pay">Complete sale <x-marketing.icon /></div></div></div>
            @elseif($mode === 'inventory')
                <div class="preview-heading"><div><strong>Everything in its place.</strong><small>Know what you have. And what you need.</small></div><x-marketing.icon name="box" /></div>
                <div class="preview-search">Search your inventory</div>
                <div class="preview-stock-table"><div class="preview-stock-row table-heading"><span>Product</span><span>Available</span><span>Status</span></div>
                    @foreach([['Coffee beans', '42', 'In stock', 'coffee'], ['Oat milk', '8', 'Low stock', 'milk'], ['Sourdough', '24', 'In stock', 'bread'], ['Matcha latte', '32', 'In stock', 'matcha']] as $product)
                        <div class="preview-stock-row"><span><i class="stock-swatch {{ $product[3] }}"></i>{{ $product[0] }}</span><span>{{ $product[1] }} units</span><span class="{{ $product[2] === 'Low stock' ? 'stock-low' : 'stock-good' }}">{{ $product[2] }}</span></div>
                    @endforeach
                </div>
            @else
                <div class="preview-heading"><div><strong>Good morning, Maria.</strong><small>A clear view of your shop.</small></div><span class="preview-period">Last 7 days</span></div>
                <div class="preview-metrics"><div><small>Revenue</small><strong>₱12,450<span>.00</span></strong></div><div><small>Completed sales</small><strong>48</strong></div><div><small>Average sale</small><strong>₱259<span>.38</span></strong></div></div>
                <div class="preview-chart"><div><strong>Sales at a glance</strong><span><i></i>Revenue</span></div><svg viewBox="0 0 500 150" fill="none" role="presentation"><defs><linearGradient id="preview-fill-{{ $attributes->get('id', $mode) }}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a779f4" stop-opacity=".23"/><stop offset="1" stop-color="#a779f4" stop-opacity="0"/></linearGradient></defs><path d="M0 30H500M0 75H500M0 120H500" stroke="currentColor" stroke-dasharray="3 6" opacity=".16"/><path d="M0 125C25 125 20 95 55 100S95 130 125 90 165 100 190 70 225 110 255 60 300 100 330 55 370 70 395 25 440 55 465 15 485 30 500 5V150H0Z" fill="url(#preview-fill-{{ $attributes->get('id', $mode) }})"/><path d="M0 125C25 125 20 95 55 100S95 130 125 90 165 100 190 70 225 110 255 60 300 100 330 55 370 70 395 25 440 55 465 15 485 30 500 5" stroke="#b58af9" stroke-width="2.5"/></svg><div class="preview-chart-axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div>
                <div class="preview-activity"><span class="preview-activity-icon"><x-marketing.icon name="check" /></span><div><strong>Everything is up to date</strong><small>Sales, stock, and your team. Together.</small></div><x-marketing.icon name="up-right" /></div>
            @endif
        </div>
    </div>
</div>
