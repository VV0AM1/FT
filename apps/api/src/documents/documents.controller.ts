import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CurrentUserId } from '../auth/current-user-id.decorator';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        dest: './uploads'
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUserId() userId: string
    ) {
        if (!file) {
            return { message: 'No file uploaded' };
        }
        await this.documentsService.addDocumentProcessingJob(file, userId);
        return { message: 'File uploaded and processing started', filename: file.originalname };
    }
}
