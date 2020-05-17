const { JValid, JValidRequiredError, JValidTypeError } = require("./src/index");

const nameFilter = (value, body, params, field, schema, options) => {
  if (!value) {
    throw new JValidRequiredError(field);
  }

  if (typeof value !== "string") {
    throw new JValidTypeError("string", `${field} must be a string.`);
  }

  if (value.length > 30) {
    throw new Error(`${field} cannot be greater than 30 characters.`);
  }
};

const schema = {
  firstName: "string|required|max:30",
  lastName: "name",
  age: "number|required",
};

const request = {
  firstName: "Bobbyreallylongnamewhichisover30characters",
  lastName: "Newport",
  age: "33",
  additionalProp: "fake",
};

// const request = {
//   firstName: "Bobby",
//   lastName: "Newport",
//   age: 33,
// };

const options = {
  typeCoercion: false,
};

const validator = new JValid(schema, options);

// TODO: Could we add options (like `autoPipe`) to our filters when they are initialized?
// TODO: Would have to store them as objects with properties and a filter prop (which is the actual function).
// TODO: Maybe a v2 thing.
validator.registerFilter("name", nameFilter);

const result = validator.validate(request);

console.log(result.valid ? "Hooray!" : result);
