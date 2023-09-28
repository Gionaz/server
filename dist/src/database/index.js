"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = exports.save = exports.aggregate = exports.remove = exports.update = exports.find = void 0;
const models_1 = __importDefault(require("./models"));
const response = (props) => {
    const { err, result, resolve } = props;
    if (err)
        console.log(err);
    else if (resolve)
        resolve(result);
}, save = (props) => new Promise((resolve) => {
    const { table, data } = props;
    const Table = new models_1.default[table](data);
    Table.save().then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
}), count = (props) => new Promise((resolve) => {
    const { table, query } = props;
    if (table)
        models_1.default[table]['countDocuments'](query).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
}), find = (props) => new Promise((resolve) => {
    const { table, qty, query, project, sort, limit, skip } = props;
    if (qty) {
        if (sort && limit && skip)
            models_1.default[table][qty](query, project).sort(sort).skip(skip * limit).limit(limit).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
        else if (sort && !limit)
            models_1.default[table][qty](query, project).sort(sort).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
        else if (limit && !sort)
            models_1.default[table][qty](query, project).limit(limit).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
        else if (sort && limit)
            models_1.default[table][qty](query, project).sort(sort).limit(limit).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
        else
            models_1.default[table][qty](query, project).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
    }
}), update = (props) => new Promise((resolve) => {
    const { table, qty, query, update, options } = props;
    if (qty) {
        if (qty === 'findOneAndUpdate')
            models_1.default[table][qty](query, update, options).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
        else
            models_1.default[table][qty](query, update, options).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
    }
}), remove = (props) => new Promise((resolve) => {
    const { table, qty, query, projection } = props;
    if (qty) {
        if (qty === 'findOneAndDelete')
            //db.col.findOneAndDelete({}, {})
            models_1.default[table][qty](query, projection).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
        else
            models_1.default[table][qty](query).then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
    }
}), aggregate = (props) => new Promise((resolve) => {
    const { table, array } = props;
    if (table)
        models_1.default[table].aggregate(array).exec().then((result) => response({ result, resolve })).catch((err) => response({ err, resolve }));
});
exports.save = save;
exports.count = count;
exports.find = find;
exports.update = update;
exports.remove = remove;
exports.aggregate = aggregate;
