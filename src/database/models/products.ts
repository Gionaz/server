import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    lowestResellPrice: {
        stockX: Number,
        goat: Number,
        flightClub: Number
    },
    shoeName: String,
    brand: String,
    silhoutte: String,
    styleID: String,
    make: String,
    colorway: String,
    retailPrice: Number,
    thumbnail: String,
    releaseDate: String,
    description: String,
    imageLinks: [String],
    urlKey: String,
    resellLinks: {
        stockX: String,
        stadiumGoods: String,
        goat: String,
        flightClub: String
    },
    goatProductId: Number,
    resellPrices: {
        stockX: {},
        goat: {},
        stadiumGoods: {},
        flightClub: {}
    },
    createdAt: { type: Date, default: new Date() }
});
export default mongoose.model('products', schema);
