"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_forge_1 = require("node-forge");
const helpers_1 = __importDefault(require("./helpers"));
const consts_1 = require("./consts");
var MessageDigestType;
(function (MessageDigestType) {
    MessageDigestType["sha1"] = "sha1";
    MessageDigestType["sha256"] = "sha256";
    MessageDigestType["sha384"] = "sha384";
    MessageDigestType["sha512"] = "sha512";
    MessageDigestType["md5"] = "md5";
})(MessageDigestType || (MessageDigestType = {}));
class Crypt {
    constructor(options) {
        this._options = {
            md: consts_1.DEFAULT_MESSAGE_DIGEST,
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
    getMessageDigest(messageDigest) {
        if (!Object.values(MessageDigestType).includes(messageDigest)) {
            throw new Error('invalid argument passed to Message Digest');
        }
        return node_forge_1.md[messageDigest.toString()].create();
    }
    parseSignature(_signature) {
        try {
            return JSON.parse(_signature);
        }
        catch (e) {
            return {
                signature: _signature,
                md: 'sha1',
                v: helpers_1.default.version(),
            };
        }
    }
    validate(encrypted) {
        const obj = JSON.parse(encrypted);
        const validProps = ['v', 'iv', 'keys', 'cipher'];
        if (!validProps.every((v) => v in obj)) {
            throw new Error('invalid encrypted');
        }
    }
    fingerprint(publicKey) {
        return node_forge_1.pki.getPublicKeyFingerprint(publicKey, {
            encoding: 'hex',
            delimiter: ':',
        });
    }
    sign(privateKey, message) {
        const checkSum = this.getMessageDigest(MessageDigestType[this._options.md]);
        checkSum.update(message, 'utf8');
        if (!helpers_1.default.isPrivateKeyObject(privateKey)) {
            privateKey = node_forge_1.pki.privateKeyFromPem(privateKey);
        }
        const signature = privateKey.sign(checkSum);
        const signature64 = node_forge_1.util.encode64(signature);
        return JSON.stringify({
            signature: signature64,
            md: this._options.md,
        });
    }
    verify(publicKey, _signature, decrypted) {
        if (!_signature)
            return false;
        let { signature, md: _md } = this.parseSignature(_signature);
        const checkSum = this.getMessageDigest(MessageDigestType[_md]);
        checkSum.update(decrypted, 'utf8');
        signature = node_forge_1.util.decode64(signature);
        if (typeof publicKey === 'string') {
            publicKey = node_forge_1.pki.publicKeyFromPem(publicKey);
        }
        return publicKey.verify(checkSum.digest().getBytes(), signature);
    }
    encrypt(publicKeys, message, signature) {
        publicKeys = helpers_1.default.toArray(publicKeys);
        publicKeys = publicKeys.map((_key) => typeof _key === 'string' ? node_forge_1.pki.publicKeyFromPem(_key) : _key);
        const iv = node_forge_1.random.getBytesSync(32);
        const key = node_forge_1.random.getBytesSync(32);
        const encryptedKeys = publicKeys.reduce((prevKeys, publicKey) => {
            const encryptedKey = publicKey.encrypt(key, 'RSA-OAEP');
            const fingerprint = this.fingerprint(publicKey);
            return {
                ...prevKeys,
                [fingerprint]: node_forge_1.util.encode64(encryptedKey)
            };
        }, {});
        const buffer = node_forge_1.util.createBuffer(message, 'utf8');
        const _cipher = node_forge_1.cipher.createCipher(consts_1.AES_STANDARD, key);
        _cipher.start({ iv });
        _cipher.update(buffer);
        _cipher.finish();
        const payload = {
            v: helpers_1.default.version(),
            iv: node_forge_1.util.encode64(iv),
            keys: encryptedKeys,
            cipher: node_forge_1.util.encode64(_cipher.output.data),
            signature,
        };
        return JSON.stringify(payload);
    }
    decrypt(privateKey, encrypted) {
        this.validate(encrypted);
        const payload = JSON.parse(encrypted);
        if (typeof privateKey === 'string') {
            privateKey = node_forge_1.pki.privateKeyFromPem(privateKey);
        }
        const fingerprint = this.fingerprint(privateKey);
        const encryptedKey = payload.keys[fingerprint];
        if (!encryptedKey) {
            throw new Error('cannot decrypt, private key fingerprint is not included in the payload');
        }
        const keyBytes = node_forge_1.util.decode64(encryptedKey);
        const iv = node_forge_1.util.decode64(payload.iv);
        const _cipher = node_forge_1.util.decode64(payload.cipher);
        const key = privateKey.decrypt(keyBytes, 'RSA-OAEP');
        const buffer = node_forge_1.util.createBuffer(_cipher);
        const decipher = node_forge_1.cipher.createDecipher(consts_1.AES_STANDARD, key);
        decipher.start({ iv });
        decipher.update(buffer);
        decipher.finish();
        const bytes = decipher.output.getBytes();
        const decrypted = node_forge_1.util.decodeUtf8(bytes);
        return {
            message: decrypted,
            signature: payload.signature
        };
    }
    entropy(input) {
        const inputString = String(input);
        const bytes = node_forge_1.util.encodeUtf8(inputString);
        node_forge_1.random.collect(bytes);
    }
}
exports.Crypt = Crypt;
