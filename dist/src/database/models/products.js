"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    lowestResellPrice: {
        stockX: Number,
        goat: Number,
        flightClub: Number,
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
        flightClub: String,
    },
    goatProductId: Number,
    resellPrices: {
        stockX: {},
        goat: {},
        stadiumGoods: {},
        flightClub: {},
    },
    createdAt: { type: Date, default: new Date() },
});
exports.default = mongoose_1.default.model("products", schema);
