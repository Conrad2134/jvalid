const debug = require("debug")("jvalid");
const set = require("lodash/set");
const get = require("lodash/get");
const {
	JValidTypeError,
	JValidRequiredError,
	JValidFilterConflictError,
} = require("./errors");
const { filters: jValidFilters, processFilters } = require("./filters");

const buildPath = (path, key, isIndex) =>
	path ? `${path}${isIndex ? `[${key}]` : `.${key}`}` : key;

const defaultOptions = {
	additionalProperties: false,
	typeCoercion: true,
};

class JValid {
	constructor(schema, options = {}) {
		this.schema = schema;
		this.options = { ...defaultOptions, ...options };
		this.filters = { ...jValidFilters };
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

	_validate(schema, request, originalRequest, originalSchema, path = "") {
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
				set(output, key, value);
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
				const result = this._validate(
					value,
					requestValue,
					originalRequest,
					originalSchema,
					keyPath
				);

				isValid = isValid && result.valid;
				errors = errors.concat(result.errors);
				set(output, key, result.output);

				// Move on to the next one.
				return;
			}

			debug("Validating:", `[${keyPath}, ${requestValue}]`);

			if (get(originalRequest, keyPath)) {
				// Only set the value if it exists in the request.
				set(output, key, requestValue);
			}

			try {
				const fieldFilters = processFilters(value);
				debug("processing", fieldFilters);
				const fieldResult = fieldFilters.reduce((passedValue, filter) => {
					try {
						debug("filter:", filter.name + ", params:", filter.params);

						if (filter.array) {
							if (!Array.isArray(passedValue)) {
								throw new JValidTypeError(
									`${filter.name}[]`,
									`Field ${keyPath} must be an array.`
								);
							}

							// Apply the filter to each item in the array.
							const result = passedValue.reduce((accum, val, index) => {
								const arrayKeyPath = buildPath(keyPath, index, true);
								const arrayItemResult = this.filters[filter.name](
									val,
									originalRequest,
									filter.params,
									arrayKeyPath,
									originalSchema,
									this.options
								);

								if (filter.pipe && arrayItemResult) {
									accum.push(arrayItemResult);
								} else {
									accum.push(val);
								}

								return accum;
							}, []);

							return filter.pipe && result.length ? result : passedValue;
						}

						const result = this.filters[filter.name](
							passedValue,
							originalRequest,
							filter.params,
							keyPath,
							originalSchema,
							this.options
						);

						return filter.pipe && result ? result : passedValue;
					} catch (err) {
						err.filter = filter.name;
						throw err;
					}
				}, requestValue);

				if (get(originalRequest, keyPath)) {
					// Only set the value if it exists in the request.
					set(output, key, fieldResult);
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
		return this._validate(this.schema, request, request, this.schema);
	}
}

// TODO: Need a better way to format error messages from built-in filters, custom error messages.
// TODO: Could we 'precompile' schemas for better performance / bundle size?
// TODO: Would love to make a wrapper for different frameworks. Vue, for example.
// TODO: Node 12+ only right now. Once we figure out how to package it, we can do browsers.
// TODO: `failFast` option.
// TODO: Enhance the filter api - maybe object parameter rather than a long list?
// TODO: Make it async.
// TODO: Refactor.
// TODO: Would have to store them as objects with properties and a filter prop (which is the actual function).
// TODO: Maybe a v2 thing.
// TODO: Would we want to pipe but not save the output?
// TODO: What else do we want to throw in the errors that might be helpful? A filter stack trace?
// TODO: Update the debug statements to be more helpful.

module.exports = {
	JValid,
	JValidTypeError,
	JValidRequiredError,
};
