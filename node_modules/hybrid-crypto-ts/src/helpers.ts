import { pki } from 'node-forge';
import pkg from '../package.json';

if (!Array.prototype.every) {
    Array.prototype.every = function(fun /*, thisp */) {
      'use strict';
      let t;
      let len;
      let i;
      let thisp;

      if (this == null) {
        throw new TypeError();
      }

      t = Object(this);
      // tslint:disable-next-line: no-bitwise
      len = t.length >>> 0;
      if (typeof fun !== 'function') {
          throw new TypeError();
      }

      thisp = arguments[1];
      for (i = 0; i < len; i++) {
        if (i in t && !fun.call(thisp, t[i], i, t)) {
          return false;
        }
      }

      return true;
    };
  }

function isPrivateKeyObject(object: any): object is pki.PrivateKey {
    if (typeof object === 'string') {
      return false;
    };
    return 'sign' in object;
}

export default {
    version: () => `${pkg.name}_${pkg.version}`,
    toArray: (obj: any) => (Array.isArray(obj) ? obj : [obj]),
    isPrivateKeyObject,
}
