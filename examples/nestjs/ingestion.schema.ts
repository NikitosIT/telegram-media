import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Schema as MongooseSchema } from "mongoose";

import type { Message } from "telegram-media";

export type TelegramPostDocument = HydratedDocument<TelegramPost>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class TelegramPost {
  _id!: string;

  // We store media as an array and normalize text-only posts to [] in the service.
  @Prop({
    type: [MongooseSchema.Types.Mixed],
    required: true,
  })
  media!: unknown[];

  @Prop({
    type: String,
    default: null,
  })
  caption!: Message["caption"] | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TelegramPostSchema = SchemaFactory.createForClass(TelegramPost);
