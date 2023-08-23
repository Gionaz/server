declare module 'hybrid-crypto-js' {
    interface RSAConstructorParams {
        keySize?: number;
        rsaStandard?: 'RSA-OAEP' | 'RSAES-PKCS1-V1_5';
        entropy?: string | number;
    }
    interface CryptConstructorParams {
        md?: 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5';
        entropy?: string | number;
    }
    interface KeyPair {
        privateKey: string;
        publicKey: string;
    }
    interface DecryptReturnType {
        message: string | number;
        signature?: string;
    }
    class RSA {
        constructor(options?: RSAConstructorParams);
        generateKeyPair(callback: (pair: string) => void, keySize?: number): void;
        generateKeyPairAsync(keySize?: number): Promise<KeyPair>;
    }
    class Crypt {
        constructor(options?: CryptConstructorParams);
        fingerprint(publicKey: object): string;
        signature(privateKey: string | Object, message: string): string;
        verify(publicKey: string | Object, _signature: string, decrypted: string | number): boolean;
        encrypt(publicKeys: string | string[] | Object[], message: string, signature?: string): string;
        decrypt(privateKey: string | Object, encrypted: string): DecryptReturnType;
    }
    export { RSA, Crypt };
}
