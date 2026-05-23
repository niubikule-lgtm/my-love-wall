// artifacts/api-server/api/index.ts
import app from '../src/app'; // 指向你原来的 Express App
import { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function 必须 export default
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
