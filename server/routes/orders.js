const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Create a new order
router.post("/", auth, async (req, res) => {
  const { items, address } = req.body;

  if (!items || !address) {
    return res.status(400).json({ message: "Please include all required fields" });
  }

  try {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = new Order({
      user: req.user._id,
      items,
      total,
      address,
      status: 'Pending'
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: "Failed to create order. Please try again." });
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: "Failed to fetch orders. Please try again." });
  }
});

// Get a specific order
router.get("/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id })
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ message: "Failed to fetch order details. Please try again." });
  }
});

// Update order status (admin only)
router.put("/:orderId", adminAuth, async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Please include a status" });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: "Failed to update order status. Please try again." });
  }
});

// Cancel an order (user)
router.delete("/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: "Cannot cancel order that is not pending" });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: "Failed to cancel order. Please try again." });
  }
});

// Get all orders (admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: "Failed to fetch orders. Please try again." });
  }
});

module.exports = router;