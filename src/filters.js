import { JValidRequiredError, JValidTypeError } from "./errors";

export const filters = {
	required: (value, body, params, field, schema, options) => {
		if (!value && value !== 0) {
			throw new JValidRequiredError(field);
		}
	},

	string: (value, body, params, field, schema, options) => {
		// TODO: Should we handle NaN here?
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

	array: (value, body, params, field, schema, options) => {
		// TODO: Should we handle NaN here?
		if (!value && value !== 0 && !Number.isNaN(value)) return;

		// TODO: Could we handle CSV, single values if type coercion?
		// TODO: ex. value: '1,2,3' or value: '1' -> auto coerce into an array?

		if (!Array.isArray(value)) {
			throw new JValidTypeError("array", `${field} must be an array.`);
		}
	},

	number: (value, body, params, field, schema, options) => {
		if (!value && !Number.isNaN(value)) return;

		if (Number.isNaN(value)) {
			throw new JValidTypeError(
				"number",
				`${field} must be a number but is NaN.`
			);
		}

		if (options.typeCoercion) {
			try {
				const result = parseFloat(value, 10);

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

		if (typeof value !== "number") {
			throw new JValidTypeError(
				"number",
				`${field} must be a number but is ${typeof value}.`
			);
		}
	},

	max: (value, body, params, field, schema, options) => {
		// TODO: How should we handle everything else (null, undefined, NaN, other types?)

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

	min: (value, body, params, field, schema, options) => {
		// TODO: How should we handle everything else (null, undefined, NaN, other types?)

		if (typeof value === "string" && value.length < params[0]) {
			throw new Error(
				`${field} must be greater than than ${params[0]} characters in length.`
			);
		}

		if (typeof value === "number" && value < params[0]) {
			throw new Error(`${field} must be greater than than ${params[0]}.`);
		}

		if (Array.isArray(value) && value.length < params[0]) {
			throw new Error(
				`${field} must be greater than than ${params[0]} items in length.`
			);
		}
	},
};

export const typeFilters = ["string", "number"];

export const processFilters = (filters) => {
	const processed = [];

	filters.split("|").forEach((filter, index, filterList) => {
		const filterRegex = /(>)?([a-z]*)(\[\])?(\((.*)\))?/i;
		const isQuotedRegex = /['`"](.*)['`"]/i;

		let [
			raw,
			previousIsPipe,
			name,
			isArray,
			rawParamArgument,
			rawParams,
		] = filter.match(filterRegex);

		if (previousIsPipe) {
			// Previous filter should pipe to this one.
			processed[index - 1].pipe = true;

			// If we don't find a name and this is the end of the filter list,
			// pipe the last filter to output and exit.
			// Ex. number: "double|>"
			if (!name && index === filterList.length - 1) {
				return;
			}
		}

		let params = rawParams ? rawParams.split(",") : [];

		// TODO: This is kind of a messy way of doing this.
		params = params.map((param) => {
			if (isQuotedRegex.test(param)) {
				return param.slice(1, param.length - 1);
			}

			try {
				return parseFloat(param, 10);
			} catch {
				// TODO: debug statements.
				return param;
			}
		});

		let pipe = false;
		let array = false;

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
