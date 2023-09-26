"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Clients {
    constructor() {
        this.saveClient = (userId, client) => {
            this.list[userId] = client;
        };
        this.deleteClient = (userId) => {
            delete this.list[userId];
        };
        this.list = {};
        this.saveClient = this.saveClient.bind(this);
    }
}
exports.default = Clients;
