const debug = require("debug")("jvalid");
const {
  JValidTypeError,
  JValidRequiredError,
  JValidFilterConflictError,
} = require("./errors");
const { filters: jValidFilters, processFilters } = require("./filters");
const setValue = require("set-value");
const getValue = require("get-value");

const buildPath = (path, key) => (path ? `${path}.${key}` : key);

const defaultOptions = {
  additionalProperties: false,
  typeCoercion: true,
};

class JValid {
  filters = jValidFilters;

  constructor(schema, options = {}) {
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

  _validate(schema, request, path = "") {
    let isValid = true;
    let errors = [];
    let output = {};

    // TODO: Ideally we wouldn't have to look twice through - can we combine the schema and request body?

    // First check for additional properties if they're not allowed
    Object.entries(request).forEach(([key, value]) => {
      const keyPath = buildPath(path, key);

      if (!this.options.additionalProperties && !schema[key]) {
        isValid = false;

        errors.push({
          field: keyPath,
          message: `Field '${keyPath}' does not exist in schema and additional properties are not allowed.`,
        });
      } else {
        setValue(output, key, value);
      }
    });

    // Iterate through the schema and validate everything.
    Object.entries(schema).forEach(([key, value]) => {
      const requestValue = request[key];
      const keyPath = buildPath(path, key);

      // If it's an object, we're nested.
      if (
        typeof requestValue === "object" &&
        requestValue !== null &&
        typeof requestValue.length === "undefined"
      ) {
        const result = this._validate(value, requestValue, keyPath);

        isValid = isValid && result.valid;
        errors = errors.concat(result.errors);
        setValue(output, key, result.output);

        // Move on to the next one.
        return;
      }

      debug("Validating:", `[${keyPath}, ${requestValue}]`);

      if (getValue(request, keyPath)) {
        // Only set the value if it exists in the request.
        setValue(output, key, requestValue);
      }

      try {
        const fieldFilters = processFilters(value);
        debug("processing", fieldFilters);
        const fieldResult = fieldFilters.reduce((passedValue, filter) => {
          try {
            debug("filter:", filter.name + ", params:", filter.params);

            const result = this.filters[filter.name](
              passedValue,
              request,
              filter.params,
              keyPath,
              schema,
              this.options
            );

            return filter.pipe && result ? result : passedValue;
          } catch (err) {
            err.filter = filter.name;
            throw err;
          }
        }, requestValue);

        if (getValue(request, keyPath)) {
          // Only set the value if it exists in the request.
          setValue(output, key, fieldResult);
        }
      } catch (err) {
        isValid = false;
        errors.push({
          field: keyPath,
          filter: err.filter,
          message: err.message,
        });
      }
    });

    return { valid: isValid, errors, output };
  }

  validate(request) {
    return this._validate(this.schema, request);
  }
}

// TODO: Need a better way to format error messages from built-in filters.

module.exports = {
  JValid,
  JValidTypeError,
  JValidRequiredError,
};
