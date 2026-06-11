function calculateOrderTotals(items, shippingFee = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal + shippingFee;

  return {
    subtotal,
    shippingFee,
    totalAmount
  };
}

function getShippingOption(deliveryMethod = "standard") {
  const shippingOptions = {
    standard: {
      deliveryMethod: "standard",
      label: "Standard Delivery",
      shippingFee: 79,
      minDays: 4,
      maxDays: 6
    },
    express: {
      deliveryMethod: "express",
      label: "Express Delivery",
      shippingFee: 149,
      minDays: 2,
      maxDays: 3
    },
    priority: {
      deliveryMethod: "priority",
      label: "Priority Delivery",
      shippingFee: 249,
      minDays: 1,
      maxDays: 2
    }
  };

  return shippingOptions[deliveryMethod] || shippingOptions.standard;
}

module.exports = {
  calculateOrderTotals,
  getShippingOption
};
