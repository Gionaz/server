"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
if (!Array.prototype.every) {
    Array.prototype.every = function (fun) {
        'use strict';
        let t;
        let len;
        let i;
        let thisp;
        if (this == null) {
            throw new TypeError();
        }
        t = Object(this);
        len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }
        thisp = arguments[1];
        for (i = 0; i < len; i++) {
            if (i in t && !fun.call(thisp, t[i], i, t)) {
                return false;
            }
        }
        return true;
    };
}
function isPrivateKeyObject(object) {
    if (typeof object === 'string') {
        return false;
    }
    ;
    return 'sign' in object;
}
exports.default = {
    version: () => `${package_json_1.default.name}_${package_json_1.default.version}`,
    toArray: (obj) => (Array.isArray(obj) ? obj : [obj]),
    isPrivateKeyObject,
};
