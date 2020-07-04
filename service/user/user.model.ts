import mongoose, { Schema, Model, Document } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  
  email: { type: String, required: true },
  
  passwordHash: { type: String, required: true },
  passwordSale: { type: String, required: true },
  
  createAt: { type: Date, required: true },
  updateAt: { type: Date, required: true },

  deleted: { type: String, required: true },

  applications: [{ type: Schema.Types.ObjectId, required: true }],
});

export interface IUser extends Document {
  username: string;

  email: string;

  passwordHash: string;
  passwordSale: string;

  createAt: number;
  updateAt: number;

  deleted: boolean;

  applications: Array<Schema.Types.ObjectId>;
}

export const UserModel: Model<IUser> = mongoose.model("User", userSchema);
