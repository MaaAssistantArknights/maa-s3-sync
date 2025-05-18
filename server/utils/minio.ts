import type { Client, BucketStream, BucketItem } from "minio";
import { Readable } from 'stream';

export function ListObjectsV2(mc: Client, bucketName: string, prefix: string) {
  return new Promise<BucketItem[]>((resolve, reject) => {
    const stream = mc.listObjectsV2(bucketName, prefix);
    const objects: BucketItem[] = [];

    stream.on('data', (obj) => {
      objects.push(obj);
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('end', () => {
      resolve(objects);
    });
  });
}
