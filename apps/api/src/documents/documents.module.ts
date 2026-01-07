import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentProcessor } from './document.processor';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '../ai/ai.module';
import { DocumentsController } from './documents.controller';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'documents',
        }),
        AiModule,
    ],
    providers: [DocumentsService, DocumentProcessor],
    controllers: [DocumentsController],
    exports: [DocumentsService],
})
export class DocumentsModule { }
