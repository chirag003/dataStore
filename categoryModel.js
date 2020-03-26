const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    parentCategory: { type: String, required: false, unique: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
