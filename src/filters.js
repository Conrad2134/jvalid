const { JValidRequiredError, JValidTypeError } = require("./errors");

module.exports.filters = {
	required: (value, body, params, field, schema, options) => {
		if (!value && value !== 0) {
			throw new JValidRequiredError(field);
		}
	},

	string: (value, body, params, field, schema, options) => {
		// TODO: Should we return empty string here since this filter auto-pipes or is this fine?
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
				const result = parseInt(value, 10);

				if (Number.isNaN(result)) {
					// Will get caught below.
					throw result;
				}

				return result;
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

		if (Array.isArray(value) && value.length > params[0]) {
			throw new Error(
				`${field} must be less than ${params[0]} items in length.`
			);
		}
	},
};

const typeFilters = ["string", "number"];

module.exports.typeFilters = typeFilters;

module.exports.processFilters = (filters) => {
	const processed = [];

	filters.split("|").forEach((filter, index) => {
		const filterRegex = /(>)?([a-z]*)(\[\])?(\((.*)\))?/i;
		let [
			raw,
			previousIsPipe,
			name,
			isArray,
			rawParamArgument,
			rawParams,
		] = filter.match(filterRegex);

		const params = rawParams ? rawParams.split(",") : [];
		let pipe = false;
		let array = false;

		if (previousIsPipe) {
			// Previous filter should pipe to this one.
			processed[index - 1].pipe = true;
		}

		if (isArray) {
			array = true;
		}

		if (typeFilters.includes(name)) {
			pipe = true;
		}

		processed.push({ name, params, pipe, array });
	});

	return processed;
};
