import { Controller, Post, Body, Sse, MessageEvent } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Observable, interval, map } from 'rxjs';

@Controller('chat')
export class ChatController {
    constructor(private readonly aiService: AiService) { }

    @Sse('stream')
    stream(@Body() body: { message: string }): Observable<MessageEvent> {
        // In a real implementation, we would hook into LangChain's streaming callbacks.
        // For now, let's pretend we stream the response.
        // We can't easily stream from a standard Promise-based method without some changes.
        // This is a placeholder to show the SSE structure.

        return new Observable((observer) => {
            (async () => {
                try {
                    const response = await this.aiService.ask(body.message);
                    // Simulate streaming by splitting words (very naive)
                    const words = response.split(' ');
                    for (const word of words) {
                        observer.next({ data: { type: 'chunk', content: word + ' ' } });
                        // emulate delay
                        await new Promise(r => setTimeout(r, 50));
                    }
                    observer.next({ data: { type: 'done' } });
                    observer.complete();
                } catch (e: any) {
                    observer.error(e);
                }
            })();
        });
    }

    @Post()
    async chat(@Body() body: { message: string }) {
        return this.aiService.ask(body.message);
    }
}
