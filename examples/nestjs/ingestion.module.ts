import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import {
  TelegramPost,
  TelegramPostSchema,
} from "./ingestion.schema.js";
import { TelegramIngestionService } from "./ingestion.service.js";

@Module({
  imports: [
    // Register the TelegramPost model so @InjectModel(TelegramPost.name) works.
    MongooseModule.forFeature([
      {
        name: TelegramPost.name,
        schema: TelegramPostSchema,
      },
    ]),
  ],
  providers: [TelegramIngestionService],
  exports: [TelegramIngestionService],
})
export class TelegramIngestionModule {}
