interface RSAConstructorParams {
    keySize?: number;
    rsaStandard?: 'RSA-OAEP' | 'RSAES-PKCS1-V1_5';
    entropy?: string | number;
}
interface KeyPair {
    privateKey: string;
    publicKey: string;
}
export declare class Rsa {
    private _options;
    constructor(options?: RSAConstructorParams);
    generateKeyPair(keySize?: number): Promise<KeyPair>;
    private entropy;
}
export {};
