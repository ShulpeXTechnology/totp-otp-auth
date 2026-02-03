/// <reference types="node" />


declare module 'crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHmac(algorithm: string, key: Buffer): {
    update(data: Buffer): void;
    digest(): Buffer;
  };
}

declare global {
  function require(module: string): any;
  
  interface BufferConstructor {
    alloc(size: number): Buffer;
    from(data: string | ArrayBuffer | Buffer, encoding?: BufferEncoding): Buffer;
  }

  interface Buffer {
    [index: number]: number;
    length: number;
    readUInt8(offset: number): number;
    toString(encoding?: BufferEncoding): string;
    slice(start: number, end?: number): Buffer;
  }

  const Buffer: BufferConstructor;
  
  type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';
}

export {};
