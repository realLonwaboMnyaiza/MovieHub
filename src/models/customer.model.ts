import Joi from 'joi';
import { Schema, model, Model } from 'mongoose';

interface CustomerPayload {
  name: string;
  surname: string;
  isPremium: boolean;
}

interface CustomerExtendedMethods {
  getFullName(): string;
}

type CustomerModel = Model<CustomerPayload, {}, CustomerExtendedMethods>;

const modelName = 'Customer';
const schema = new Schema<
  CustomerPayload,
  CustomerModel,
  CustomerExtendedMethods
>({
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

schema.methods.getFullName = function (): string {
  return `${this.name} ${this.surname}`;
};

export const Customer = model<CustomerPayload, CustomerModel>(
  modelName,
  schema,
);

function validateWithJoi(input: CustomerPayload) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    isPremium: Joi.boolean(),
  });

  return schema.validate(input);
}

export { schema as customerSchema };
export { validateWithJoi as validate };
