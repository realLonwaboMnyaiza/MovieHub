import mongoose from "mongoose";
import Joi, { ValidationError } from "joi";

interface GenrePayload {
  name: string;
};

const modelName = 'Genre';
const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 50,
    required: true,
  },
});
const Model = mongoose.model(modelName, schema);

function validateUsingJoi(input: GenrePayload) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(input);
}

export { Model as Genre };
export { schema as genreSchema };
export { validateUsingJoi as validate};
export type { ValidationError, GenrePayload };
