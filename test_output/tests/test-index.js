"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const index_1 = require("../src/index");
describe('', () => {
    mocha_1.it('test', () => {
        const test = new index_1.Test();
        console.log(test);
    });
});
