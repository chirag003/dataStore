const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: String,
    price: Number,
    categories: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
