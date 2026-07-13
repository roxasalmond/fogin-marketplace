/* ============================================
   CART PRODUCT MAPPER
   js/utils/cart-product.js

   Maps a raw marketplace API product-detail response (from
   fetchProductById) into the minimal shape cart.js and checkout.js
   need to render a line item: id, name, category, vendor, price, image.

   Pricing logic mirrors shop/product.js's mapApiProduct() (first
   in-stock variant, sale-price fallback) - kept in sync deliberately
   since both derive price the same way from the same API shape.
============================================ */

export function mapCartProduct(data) {
  const firstInStock = data.variants?.find(v => v.in_stock);
  const firstVariant = firstInStock || data.variants?.[0];

  const price = firstVariant?.on_sale && firstVariant?.sale_price
    ? parseFloat(firstVariant.sale_price)
    : parseFloat(firstVariant?.price) || 0;

  return {
    id:       data.id,
    name:     data.name,
    category: data.category_name || 'Product',
    vendor:   data.vendor_name || '',
    vendorId: data.vendor_slug || data.vendor_name || 'vendor',
    price,
    image:    data.image_url || null,
  };
}