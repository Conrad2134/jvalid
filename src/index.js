const debug = require("debug")("jvalid");
const {
  JValidTypeError,
  JValidRequiredError,
  JValidFilterConflictError,
} = require("./errors");
const { filters: jValidFilters, processFilters } = require("./filters");

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

  validate(request) {
    let isValid = true;
    let errors = [];
    let output = {};

    Object.entries(this.schema).forEach(([key, value]) => {
      const requestValue = request[key];

      debug("Validating:", `[${key}, ${requestValue}]`);

      // TODO: If the value doesn't exist in the request, should we put it in the output?
      output[key] = requestValue;

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
              key,
              this.schema,
              this.options
            );

            return filter.pipe && result ? result : passedValue;
          } catch (err) {
            err.filter = filter.name;
            throw err;
          }
        }, requestValue);

        // TODO: Support nesting objects.
        output[key] = fieldResult;
      } catch (err) {
        isValid = false;
        errors.push({ field: key, filter: err.filter, message: err.message });
      }
    });

    // TODO: Additional props
    // Object.entries(request).forEach(([key, value]) => {
    //   // TODO: If additionalProps is false and we don't have a schema for it, should we include it in the output?
    //   output[key] = value;

    //   const schemaField = this.schema[key];

    //   // TODO: Support nesting objects.
    //   if (!this.options.additionalProperties && !schemaField) {
    //     isValid = false;

    //     errors.push({
    //       field: key,
    //       message: `Field '${key}' does not exist in schema and additional properties are not allowed.`,
    //     });
    //   }

    //   if (schemaField) {
    //   }
    // });

    return { valid: isValid, errors, output };
  }
}

// TODO: Need a better way to format error messages from built-in filters.

module.exports = {
  JValid,
  JValidTypeError,
  JValidRequiredError,
};
