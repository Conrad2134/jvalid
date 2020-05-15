class JValidRequiredError extends Error {
  constructor(fieldName) {
    super(`${fieldName} is required.`);
  }
}

class JValidTypeError extends Error {
  constructor(type, ...params) {
    super(...params);
    this.type = type;
  }
}

class JValidFilterConflictError extends Error {
  constructor(name) {
    super(`Filter with name '${name}' is already registered.`);
  }
}

const jValidFilters = {
  required: (value, body, params, field, schema, options) => {
    if (!value) {
      throw new JValidRequiredError(field);
    }
  },

  string: (value, body, params, field, schema, options) => {
    if (!value && value !== 0) return;

    if (options.typeCoercion) {
      try {
        return value.toString();
      } catch (ex) {
        throw new JValidTypeError(
          "string",
          `Could not coerce ${field} value into a string.`
        );
      }
    }

    if (typeof value !== "string") {
      throw new JValidTypeError("string", `${field} must be a string.`);
    }
  },

  number: (value, body, params, field, schema, options) => {
    if (!value && !Number.isNaN(value)) return;

    if (options.typeCoercion) {
      try {
        return parseInt(value, 10);
      } catch (ex) {
        throw new JValidTypeError(
          "number",
          `Could not coerce ${field} value into a number.`
        );
      }
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new JValidTypeError("number", `${field} must be a number.`);
    }
  },

  max: (value, body, params, field, schema, options) => {
    if (typeof value === "string" && value.length > params[0]) {
      throw new Error(
        `${field} must be less than ${params[0]} characters in length.`
      );
    }

    if (typeof value === "number" && value > params[0]) {
      throw new Error(`${field} must be less than ${params[0]}.`);
    }
  },
};

const defaultOptions = {
  additionalProperties: false,
  typeCoercion: true,
};

class JValid {
  filters = jValidFilters;

  constructor(schema, options) {
    this.schema = schema;
    this.options = { ...defaultOptions, ...options };
  }

  registerFilters(filters) {
    filters.forEach(({ name, filter }) => this.registerFilter(name, filter));
  }

  registerFilter(name, filter) {
    if (this.filters[name]) {
      throw new JValidFilterConflictError(name);
    }

    this.filters[name] = filter;
  }

  isValid(request) {
    let isValid = true;
    let errors = [];

    Object.entries(request).forEach(([key, value]) => {
      console.log("Validating:", `[${key}, ${value}]`);

      const schemaField = this.schema[key];

      // TODO: Support nesting objects.
      if (!this.options.additionalProperties && !schemaField) {
        isValid = false;

        errors.push({
          field: key,
          message: `Field '${key}' does not exist in schema and additional properties are not allowed.`,
        });
      }

      if (schemaField) {
        const fieldFilters = schemaField.split("|");

        try {
          console.log("processing", fieldFilters);
          fieldFilters.reduce((passedValue, filter) => {
            try {
              const [filterName, filterParams] = filter.split(":");

              console.log("filter:", filterName + ", params:", filterParams);

              return (
                // TODO: If filter returns a value, we continue to pass that value along. Should we make it explicit (pipes?) or options?
                this.filters[filterName](
                  passedValue,
                  request,
                  filterParams ? filterParams.split(",") : [],
                  key,
                  schema,
                  options
                ) || passedValue
              );
            } catch (err) {
              err.filter = filter;
              throw err;
            }
          }, value);
        } catch (err) {
          isValid = false;
          errors.push({ field: key, filter: err.filter, message: err.message });
        }
      }
    });

    return { valid: isValid, errors };
  }
}

// TODO: Need a better way to format error messages from built-in filters.

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

const options = {
  typeCoercion: false,
};

const validator = new JValid(schema, options);

validator.registerFilter("name", nameFilter);

const result = validator.isValid(request);

console.log(result.valid ? "Hooray!" : result);
