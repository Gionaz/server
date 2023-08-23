"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_forge_1 = require("node-forge");
const { rsa } = node_forge_1.pki;
class Rsa {
    constructor(options) {
        this._options = {
            keySize: 4096,
            rsaStandard: 'RSA-OAEP',
            entropy: undefined,
        };
        if (options) {
            this._options = {
                ...this._options,
                ...options
            };
            if (options.entropy) {
                this.entropy(options.entropy);
            }
        }
    }
    generateKeyPair(keySize) {
        const generationOptions = {
            bits: keySize || this._options.keySize,
            workers: -1
        };
        return new Promise((res, rej) => {
            rsa.generateKeyPair(generationOptions, (err, keyPair) => {
                if (err) {
                    rej(err);
                }
                res({
                    privateKey: node_forge_1.pki.privateKeyToPem(keyPair.privateKey),
                    publicKey: node_forge_1.pki.publicKeyToPem(keyPair.publicKey)
                });
            });
        });
    }
    entropy(input) {
        const inputString = String(input);
        const bytes = node_forge_1.util.encodeUtf8(inputString);
        node_forge_1.random.collect(bytes);
    }
}
exports.Rsa = Rsa;
