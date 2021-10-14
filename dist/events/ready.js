"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        var _a;
        console.log(`Ready! Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
    },
};
