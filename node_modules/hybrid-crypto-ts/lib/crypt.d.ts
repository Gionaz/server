import { pki } from 'node-forge';
interface CryptConstructorParams {
    md?: 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5';
    entropy?: string | number;
}
export declare class Crypt {
    private _options;
    constructor(options?: CryptConstructorParams);
    private getMessageDigest;
    private parseSignature;
    private validate;
    private fingerprint;
    sign(privateKey: string | pki.PrivateKey, message: string): string;
    verify(publicKey: string | pki.PublicKey, _signature: string, decrypted: string): boolean;
    encrypt(publicKeys: string | pki.PublicKey | string[] | pki.PublicKey[], message: string, signature?: string): string;
    decrypt(privateKey: string | pki.PrivateKey, encrypted: string): {
        message: string;
        signature: any;
    };
    private entropy;
}
export {};
