const express = require("express");
const router = express.Router();
const MenuItem = require("../server/models/MenuItem");

// Get all menu items
router.get("/", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add a new menu item (admin only)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    const newItem = new MenuItem({ name, description, price, image });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
