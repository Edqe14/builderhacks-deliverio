/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
import { NextApiResponse } from 'next';
import { AnySchema } from 'yup';

export const runValidator = async (res: NextApiResponse, validator: AnySchema, body: any) => {
  try {
    await validator.validate(body);

    return true;
  } catch (error: any) {
    res.status(422).json({ message: 'Invalid request', error: { path: error?.path, errors: error?.errors } });

    return false;
  }
};

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export const prepareData = (data: any) => JSON.parse(JSON.stringify(data, getCircularReplacer()));