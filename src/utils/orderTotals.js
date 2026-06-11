function calculateOrderTotals(items, shippingFee = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal + shippingFee;

  return {
    subtotal,
    shippingFee,
    totalAmount
  };
}

module.exports = {
  calculateOrderTotals
};
