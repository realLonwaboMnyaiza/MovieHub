import Joi from "joi";
import mongoose from "mongoose";
import { genreSchema } from "./genre.model"; 
import type { GenrePayload } from "./genre.model";
import { validGuidRegex } from "../middleware/guid-validation.middleware";

interface MoviePayload {
  title: string;
  genre: GenrePayload;
  numberInStock: number;
  dailyRentalRate: number;
}

const modelName = 'Movie';
const schema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 255,
    required: true,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    min: 0,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    min: 1,
    required: true,
  },
});

const dto = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 255,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    min: 1,
    required: true,
  },
});

const model = mongoose.model(modelName, schema);
const validGuid = validGuidRegex();

function validateWithJoi(input: MoviePayload) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    genreId: Joi.string().pattern(validGuid).required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(1).required(),
  });

  return schema.validate(input);
}

export { model as Movie };
export { schema as movieSchema };
export { dto as movieDto };
export { validateWithJoi as validate };
export type { MoviePayload };
