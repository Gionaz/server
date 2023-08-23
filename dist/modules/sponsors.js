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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const helper_1 = require("../helper");
const sentry_1 = require("../sentry");
exports.default = ({ res, apiData }) => __awaiter(void 0, void 0, void 0, function* () {
    const table = "Sponsors";
    const { action } = apiData;
    switch (action) {
        case "createSponsor":
            (0, database_1.save)({
                table,
                data: {
                    apiData,
                },
            })
                .then(() => {
                (0, helper_1.Api)(res, {
                    message: "Sponsor saved successfully!",
                });
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("createSponsor", e);
            });
            break;
        case "getSponsor":
            try {
                (0, database_1.find)({
                    table,
                    qty: "findOne",
                    query: {
                        _id: apiData.sponsorId,
                    },
                })
                    .then((sponsor) => {
                    if (sponsor) {
                        (0, helper_1.Api)(res, {
                            message: "Sponsor found",
                            sponsor,
                        });
                    }
                    else {
                        (0, helper_1.Api)(res, {
                            message: "Sponsor not found",
                        });
                    }
                })
                    .catch((e) => {
                    (0, sentry_1.sendTosentry)("getSponsor", e);
                });
            }
            catch (e) {
                (0, sentry_1.sendTosentry)("getSponsor", e);
            }
            break;
        case "updateSponsor":
            (0, database_1.update)({
                table,
                qty: "findOneAndUpdate",
                query: {
                    _id: apiData.sponsorId,
                },
                update: {
                    $set: { apiData },
                },
            })
                .then(() => {
                (0, helper_1.Api)(res, {
                    message: "Sponsor has been updated.",
                });
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("updateSponsor", e);
            });
            break;
        case "deleteSponsor":
            (0, database_1.remove)({
                table,
                qty: "findOneAndDelete",
                query: {
                    _id: apiData.sponsorId,
                },
            })
                .then(() => {
                (0, helper_1.Api)(res, {
                    message: "Sponsor deleted successfully!",
                });
            })
                .catch((e) => {
                (0, sentry_1.sendTosentry)("deleteSponsor", e);
            });
            break;
        default:
            break;
    }
});
