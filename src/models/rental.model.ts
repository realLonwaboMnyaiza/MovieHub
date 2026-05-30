import Joi from "joi";
import mongoose from "mongoose";
import { customerSchema } from "./customer.model";
import { movieDto } from "./movie.model";
import { validGuidRegex } from "../middleware/guid-validation.middleware";

interface CompositePayload {
  customerId: string;
  movieId: string;
};

const modelName = 'Rental';
const schema = new mongoose.Schema({
  customer: {
    type: customerSchema,
    required: true,
  },
  movie: {
    type: movieDto,
    required: true,
  },
  checkoutDate: {
    type: Date,
    default: Date.now,
  },
  returnedDate: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 1,
  },
});
const model = mongoose.model(modelName, schema);
const validGuid = validGuidRegex();

function validateUsingJoi(input: CompositePayload) {
  const schema = Joi.object({
    customerId: Joi.string().pattern(validGuid).required(),
    movieId: Joi.string().pattern(validGuid).required(),
  });

  return schema.validate(input);
}

export { model as Rental };
export { validateUsingJoi as validate };
export { type CompositePayload };
