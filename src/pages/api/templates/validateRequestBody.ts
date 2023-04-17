import { ITemplate } from '../../../models/templates/ITemplate';

const isString = (value: unknown): value is string => typeof value === 'string';

const isValidIdentifier = (value: string): boolean => {
  // Regular expression to check if the value contains only letters and numbers
  const lettersAndNumbers = /^[A-Za-z0-9]+$/;

  // Check if the value matches the regular expression and has a length of no more than 11
  return lettersAndNumbers.test(value) && value.length <= 11;
};

const validateRequestBody = (body: ITemplate): body is ITemplate => {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const { id, name, smsText, senderIdFieldName } = body as Partial<ITemplate>;

  if (typeof id !== "number") {
    throw new Error('Invalid ID, should be a number');
  }

  if (!isString(name)) {
    throw new Error('Invalid name, should be a string');
  }

  if (!isString(smsText)) {
    throw new Error('Invalid SMS text, should be a string');
  }

  if (!isString(senderIdFieldName)) {
    throw new Error('Invalid sender ID field name, should be a string');
  }

  if (!isValidIdentifier(senderIdFieldName)) {
    throw new Error('Invalid sender ID field name: should contain only letters and numbers and have a length of no more than 11');
  }

  return true;
};

export default validateRequestBody;
