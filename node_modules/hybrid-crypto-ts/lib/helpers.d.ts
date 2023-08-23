import { pki } from 'node-forge';
declare function isPrivateKeyObject(object: any): object is pki.PrivateKey;
declare const _default: {
    version: () => string;
    toArray: (obj: any) => any[];
    isPrivateKeyObject: typeof isPrivateKeyObject;
};
export default _default;
