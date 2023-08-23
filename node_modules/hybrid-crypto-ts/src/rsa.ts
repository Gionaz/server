import { pki, random, util } from 'node-forge';
const { rsa } = pki;

interface RSAOptions {
    keySize: number;
    rsaStandard: 'RSA-OAEP' | 'RSAES-PKCS1-V1_5';
    entropy?: string | number;
}

interface RSAConstructorParams {
    keySize?: number;
    rsaStandard?: 'RSA-OAEP' | 'RSAES-PKCS1-V1_5';
    entropy?: string | number;
}

interface KeyPair {
    privateKey: string;
    publicKey: string;
}

export class Rsa {
    private _options: RSAOptions = {
        keySize: 4096,
        rsaStandard: 'RSA-OAEP',
        entropy: undefined,
    };

    constructor(options?: RSAConstructorParams) {
        if (options) {
            this._options = {
                ...this._options,
                ...options
            }
            if (options.entropy) {
                this.entropy(options.entropy);
            }
        }
    }

    /**
     * Generate new RSA key pair
     * @param keySize RSA key size (optional, default: 4096)
     */
    public generateKeyPair(keySize?: number): Promise<KeyPair> {
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
                    privateKey: pki.privateKeyToPem(keyPair.privateKey),
                    publicKey: pki.publicKeyToPem(keyPair.publicKey)
                });
            })
        });
    }

    private entropy(input: any): void {
		const inputString = String(input);
		const bytes = util.encodeUtf8(inputString);

		random.collect(bytes);
	}
}