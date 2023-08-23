"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../database");
const helper_1 = require("../helper");
const sentry_1 = require("../sentry");
const table = "Categories";
exports.default = ({ apiData, res }) => __awaiter(void 0, void 0, void 0, function* () {
    const { action } = apiData;
    const superUser = yield (0, helper_1.getSuperUser)();
    switch (action) {
        case "addCategory":
            (0, database_1.find)({
                table,
                qty: "findOne",
                query: {
                    text: new RegExp(`^${apiData.text}$`, "i"),
                    $or: [{ createdBy: superUser === null || superUser === void 0 ? void 0 : superUser._id }, { createdBy: apiData.userId }],
                },
                project: {
                    text: 1,
                    _id: 0,
                },
            })
                .then((category) => __awaiter(void 0, void 0, void 0, function* () {
                if (category) {
                    (0, helper_1.Api)(res, {
                        field: "text",
                        error: "The category already exists.",
                    });
                }
                else {
                    let image;
                    if (apiData.image)
                        image = yield (0, helper_1.saveImage)({
                            _id: apiData.userId,
                            base64: apiData.image,
                            folder: "category",
                        });
                    (0, database_1.save)({
                        table,
                        data: Object.assign(Object.assign({}, apiData), { createdBy: new mongoose_1.default.Types.ObjectId(apiData.userId), image }),
                    }).then((category) => {
                        (0, helper_1.Api)(res, category);
                    });
                }
            }))
                .catch((e) => {
                (0, sentry_1.sendTosentry)("addCategory", e);
            });
            break;
        case "getCategories":
            (0, database_1.find)({
                table,
                qty: "find",
                query: {
                    createdBy: { $in: [apiData.userId, superUser._id] },
                },
                sort: {
                    text: 1,
                },
            })
                .then((categories) => {
                (0, helper_1.Api)(res, categories);
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("getCategories", e);
            });
            break;
        case "deleteCategory":
            (0, database_1.remove)({
                table,
                qty: "findOneAndDelete",
                query: {
                    $or: [
                        {
                            _id: apiData._id,
                        },
                        {
                            text: apiData.text,
                        },
                    ],
                },
            })
                .then((delCat) => {
                (0, helper_1.Api)(res, delCat);
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("deleteCategory", e);
            });
        default:
            break;
    }
});
