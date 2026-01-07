import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocumentsService {
    constructor(@InjectQueue('documents') private documentsQueue: Queue) { }

    async addDocumentProcessingJob(file: Express.Multer.File, userId: string) {
        await this.documentsQueue.add('process-document', {
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            userId,
        });
    }
}
