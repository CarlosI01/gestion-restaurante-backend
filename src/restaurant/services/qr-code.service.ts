import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';

@Injectable()
export class QrCodeService {
  async generateQrImage(content: string, outputPath: string, width = 300): Promise<void> {
    try {
      await mkdir(dirname(outputPath), { recursive: true });
      await QRCode.toFile(outputPath, content, { width, type: 'png' });
    } catch (error) {
      throw new InternalServerErrorException('Error generando código QR', { cause: error as Error });
    }
  }
}
