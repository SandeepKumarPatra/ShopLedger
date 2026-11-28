var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('CURRENT BEHAVIOUR: #1001 5% and 18% items with no coupon', function () {
  var items = [
    { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', hsn: '0902', gstRate: 18, price: 140, qty: 2 },
    { id: 2, sku: 'GRN-002', name: 'Unpolished Toor Dal 1kg', hsn: '0713', gstRate: 5, price: 165, qty: 2 }
  ];
  var order = { id: 1001, items: items, coupon: '' };

  var actualInvoice = invoice.computeInvoiceFigures(order);
  var actualPricing = pricing.computeTotals(items, '');

  assert.equal(actualInvoice.subtotal, 610);
  assert.equal(actualInvoice.discount, 0);
  assert.equal(actualInvoice.tax, 66.9);
  assert.equal(actualInvoice.cgst, 33.45);
  assert.equal(actualInvoice.sgst, 33.45);
  assert.equal(actualInvoice.total, 676.9);
  assert.deepEqual(actualInvoice.rows.map(function (row) {
    return { gstPercent: row.gstPercent, lineTax: row.lineTax };
  }), [
    { gstPercent: 18, lineTax: 50.4 },
    { gstPercent: 5, lineTax: 16.5 }
  ]);
  assert.equal(actualPricing.tax, 66.9);
  assert.equal(actualPricing.total, 676.9);
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 matches checkout invoice totals', function () {
  var items = [
    { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
    { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
  ];
  var order = { id: 1002, items: items, coupon: 'SAVE10' };

  var actualInvoice = invoice.computeInvoiceFigures(order);
  var actualPricing = pricing.computeTotals(items, 'SAVE10');

  assert.equal(actualInvoice.subtotal, 1020);
  assert.equal(actualInvoice.discount, 102);
  assert.equal(actualInvoice.tax, 45.9);
  assert.equal(actualInvoice.cgst, 22.95);
  assert.equal(actualInvoice.sgst, 22.95);
  assert.equal(actualInvoice.total, 963.9);
  assert.deepEqual(actualInvoice.rows.map(function (row) {
    return { gstPercent: row.gstPercent, lineTax: row.lineTax };
  }), [
    { gstPercent: 5, lineTax: 28.8 },
    { gstPercent: 5, lineTax: 17.1 }
  ]);
  assert.equal(actualPricing.discount, 102);
  assert.equal(actualPricing.tax, 45.9);
  assert.equal(actualPricing.total, 963.9);
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 applies the ₹150 cap to the invoice', function () {
  var items = [
    { id: 5, sku: 'OIL-002', name: 'Cold-Pressed Groundnut Oil 5L', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
  ];
  var order = { id: 1004, items: items, coupon: 'SAVE10' };

  var actualInvoice = invoice.computeInvoiceFigures(order);
  var actualPricing = pricing.computeTotals(items, 'SAVE10');

  assert.equal(actualInvoice.subtotal, 2240);
  assert.equal(actualInvoice.discount, 150);
  assert.equal(actualInvoice.tax, 104.5);
  assert.equal(actualInvoice.cgst, 52.25);
  assert.equal(actualInvoice.sgst, 52.25);
  assert.equal(actualInvoice.total, 2194.5);
  assert.deepEqual(actualInvoice.rows, [
    {
      name: 'Cold-Pressed Groundnut Oil 5L',
      sku: 'OIL-002',
      hsn: '1508',
      qty: 2,
      price: 1120,
      gstPercent: 5,
      line: 2240,
      lineTax: 104.5
    }
  ]);
  assert.equal(actualPricing.discount, 150);
  assert.equal(actualPricing.tax, 104.5);
  assert.equal(actualPricing.total, 2194.5);
});

test('CURRENT BEHAVIOUR: #1008 all 18% items with no coupon', function () {
  var items = [
    { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
    { id: 12, sku: 'BEV-003', name: 'Kokum Sherbet Concentrate 750ml', hsn: '2106', gstRate: 18, price: 180, qty: 2 }
  ];
  var order = { id: 1008, items: items, coupon: '' };

  var actualInvoice = invoice.computeInvoiceFigures(order);
  var actualPricing = pricing.computeTotals(items, '');

  assert.equal(actualInvoice.subtotal, 500);
  assert.equal(actualInvoice.discount, 0);
  assert.equal(actualInvoice.tax, 90);
  assert.equal(actualInvoice.cgst, 45);
  assert.equal(actualInvoice.sgst, 45);
  assert.equal(actualInvoice.total, 590);
  assert.deepEqual(actualInvoice.rows.map(function (row) {
    return { gstPercent: row.gstPercent, lineTax: row.lineTax };
  }), [
    { gstPercent: 18, lineTax: 25.2 },
    { gstPercent: 18, lineTax: 64.8 }
  ]);
  assert.equal(actualPricing.tax, 90);
  assert.equal(actualPricing.total, 590);
});

test('CORRECT BEHAVIOUR: invoice matches checkout for HSN GST and capped coupons', function () {
  var save10Items = [
    { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
    { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
  ];
  var save10Invoice = invoice.computeInvoiceFigures({ id: 1002, items: save10Items, coupon: 'SAVE10' });
  var save10Pricing = pricing.computeTotals(save10Items, 'SAVE10');

  assert.equal(save10Invoice.subtotal, save10Pricing.subtotal);
  assert.equal(save10Invoice.discount, save10Pricing.discount);
  assert.equal(save10Invoice.tax, save10Pricing.tax);
  assert.equal(save10Invoice.cgst, save10Pricing.cgst);
  assert.equal(save10Invoice.sgst, save10Pricing.sgst);
  assert.equal(save10Invoice.total, save10Pricing.total);
  assert.deepEqual(save10Invoice.rows.map(function (row) {
    return { gstPercent: row.gstPercent, lineTax: row.lineTax };
  }), [
    { gstPercent: 5, lineTax: 28.8 },
    { gstPercent: 5, lineTax: 17.1 }
  ]);

  var cappedItems = [
    { id: 5, sku: 'OIL-002', name: 'Cold-Pressed Groundnut Oil 5L', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
  ];
  var cappedInvoice = invoice.computeInvoiceFigures({ id: 1004, items: cappedItems, coupon: 'SAVE10' });
  var cappedPricing = pricing.computeTotals(cappedItems, 'SAVE10');

  assert.equal(cappedInvoice.subtotal, cappedPricing.subtotal);
  assert.equal(cappedInvoice.discount, cappedPricing.discount);
  assert.equal(cappedInvoice.tax, cappedPricing.tax);
  assert.equal(cappedInvoice.cgst, cappedPricing.cgst);
  assert.equal(cappedInvoice.sgst, cappedPricing.sgst);
  assert.equal(cappedInvoice.total, cappedPricing.total);
  assert.deepEqual(cappedInvoice.rows.map(function (row) {
    return { gstPercent: row.gstPercent, lineTax: row.lineTax };
  }), [
    { gstPercent: 5, lineTax: 104.5 }
  ]);
});
