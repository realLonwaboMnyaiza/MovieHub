import Joi from "joi";
import mongoose from "mongoose";

interface CustomerPayload {
  name: string;
  surname: string;
  isPremium: boolean;
};

const modelName = 'Customer';
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  surname: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
});

const model = mongoose.model(modelName, schema);

function validateWithJoi(input: CustomerPayload) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    isPremium: Joi.boolean().required(),
  });

  return schema.validate(input);
}

export { model as Customer };
export { schema as customerSchema };
export {validateWithJoi as validate }; 
