import mongoose, { Schema, Model, Document, SchemaType } from "mongoose";

const applicationSchema = new Schema({
  key: { type: String, required: true },

  domain: { type: String, required: true },
});

export interface IApplication extends Document {
  key: string;
  domain: string;
}

export const ApplicationModel: Model<IApplication> = mongoose.model(
  "Application",
  applicationSchema
);
