import { JValid } from "../src/index";
import { JValidFilterConflictError } from "../src/errors";

describe("Built-in validations", () => {
	test("Single property - passing", () => {
		const schema = {
			name: "string",
		};

		const body = {
			name: "Michael Scott",
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("Single property - failing", () => {
		const schema = {
			name: "number",
		};

		const body = {
			name: "Michael Scott",
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		// TODO: Assert errors?
		expect(result.errors).toHaveLength(1);
		expect(result.output).toStrictEqual(body);
	});

	test("Multiple properties, multiple filters - passing", () => {
		const schema = {
			name: "string|required|max(15)",
			age: "number|required|max(99)",
			retirementAge: "number|max(75)",
		};

		const body = {
			name: "Michael Scott",
			age: 50,
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("Multiple properties, multiple filters - failing", () => {
		const schema = {
			name: "string|required|max(15)",
			age: "number|required|max(99)",
			retirementAge: "number|max(75)",
		};

		const body = {
			name: "Michael Gary Scott",
			retirementAge: 88,
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		// TODO: Assert errors?
		expect(result.errors).toHaveLength(3);
		expect(result.output).toStrictEqual(body);
	});

	test("Additional properties fails validation, not included in output", () => {
		const schema = {
			name: "string|required",
		};

		const body = {
			name: "Michael Gary Scott",
			age: 50,
		};

		const validator = new JValid(schema, { additionalProperties: false });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		// TODO: Assert errors?
		expect(result.errors).toHaveLength(1);
		expect(result.output).toStrictEqual({ name: body.name });
	});

	test("Additional properties allowed, included in output", () => {
		const schema = {
			name: "string|required",
		};

		const body = {
			name: "Michael Gary Scott",
			age: 50,
		};

		const validator = new JValid(schema, { additionalProperties: true });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("Type coercion - off fails validation", () => {
		const schema = {
			age: "number|required",
		};

		const body = {
			age: "50",
		};

		const validator = new JValid(schema, { typeCoercion: false });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		// TODO: Assert errors?
		expect(result.errors).toHaveLength(1);
		expect(result.output).toStrictEqual(body);
	});

	test("Type coercion - on coerces values", () => {
		const schema = {
			age: "number|required",
		};

		const body = {
			age: "50",
		};

		const validator = new JValid(schema, { typeCoercion: true });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual({ age: 50 });
	});

	test("custom filter", () => {
		const options = {
			typeCoercion: false,
			additionalProperties: false,
		};

		const schema = {
			nested: {
				passing: "passing",
				failing: "failing",
			},
		};

		const body = {
			nested: { passing: 50, failing: 60 },
		};

		const passingFilter = (
			value,
			filterBody,
			params,
			field,
			validatorSchema,
			validatorOptions
		) => {
			expect(value).toStrictEqual(body.nested.passing);
			expect(filterBody).toStrictEqual(body);
			expect(params).toStrictEqual([]);
			expect(field).toStrictEqual("nested.passing");
			expect(validatorSchema).toStrictEqual(schema);
			expect(validatorOptions).toStrictEqual(options);
		};

		const failingFilter = (value, body, params, field, schema, options) => {
			throw new Error("failed");
		};

		const validator = new JValid(schema, options);

		validator.registerFilters([
			{ name: "passing", filter: passingFilter },
			{ name: "failing", filter: failingFilter },
		]);

		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		// TODO: Assert errors?
		expect(result.errors).toHaveLength(1);
		expect(result.output).toStrictEqual(body);
	});

	test("Custom filter conflict", () => {
		const validator = new JValid({});

		expect(() => validator.registerFilter("required")).toThrow(
			JValidFilterConflictError
		);
	});

	test("Simple validation, nested object, passing", () => {
		const schema = {
			name: {
				first: "string",
			},
		};

		const body = {
			name: {
				first: "Michael",
			},
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("Simple validation, deeply nested object, passing", () => {
		const schema = {
			request: {
				name: {
					first: "string",
				},
			},
		};

		const body = {
			request: {
				name: {
					first: "Michael",
				},
			},
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("Simple validation, nested object, failing", () => {
		const schema = {
			name: {
				first: "number",
			},
		};

		const body = {
			name: {
				first: "Michael",
			},
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toStrictEqual({
			field: "name.first",
			filter: "number",
			message: "Could not coerce name.first value into a number.",
		});
		expect(result.output).toStrictEqual(body);
	});

	test("Simple validation, deeply nested object, failing", () => {
		const schema = {
			request: {
				name: {
					first: "number",
				},
			},
		};

		const body = {
			request: {
				name: {
					first: "Michael",
				},
			},
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toStrictEqual({
			field: "request.name.first",
			filter: "number",
			message: "Could not coerce request.name.first value into a number.",
		});
		expect(result.output).toStrictEqual(body);
	});

	test("Simple validation, deeply nested object, additonal properties, failing", () => {
		const schema = {
			request: {
				name: {
					first: "string",
				},
			},
		};

		const body = {
			request: {
				name: {
					first: "Michael",
					last: "Scott",
				},
				age: "50",
			},
			extra: "prop",
		};

		const validator = new JValid(schema, { additionalProperties: false });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		expect(result.errors).toHaveLength(3);
		expect(result.errors[2]).toStrictEqual({
			field: "request.name.last",
			message:
				"Field 'request.name.last' does not exist in schema and additional properties are not allowed.",
		});
		expect(result.output).toStrictEqual({
			request: { name: { first: body.request.name.first } },
		});
	});

	test("simple validation, array, passing", () => {
		const schema = {
			numbers: "number[]",
		};

		const body = {
			numbers: [1, 2, 3],
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("simple validation, array, failing, item value type", () => {
		const schema = {
			numbers: "number[]",
		};

		const body = {
			numbers: [1, 2, "three"],
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toStrictEqual({
			field: "numbers",
			filter: "number",
			message: "Could not coerce numbers[2] value into a number.",
		});
		expect(result.output).toStrictEqual(body);
	});

	test("Array item value type coercion", () => {
		const schema = {
			numbers: "number[]",
		};

		const body = {
			numbers: [1, 2, "3"],
		};

		const validator = new JValid(schema, { typeCoercion: true });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual({ numbers: [1, 2, 3] });
	});

	test("Non-type validation, array, passing", () => {
		const schema = {
			// TODO: Document potential gotcha. If you omit the [], you're checking length of the array and not each item.
			// TODO: It's pretty sweet though that you can apply the [] syntax to any filter.
			numbers: "max[](30)",
		};

		const body = {
			numbers: [1, 2, 3],
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual(body);
	});

	test("Non-type validation, array, failing", () => {
		const schema = {
			numbers: "max[](30)",
		};

		const body = {
			numbers: [1, 2, 33],
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toStrictEqual({
			field: "numbers",
			filter: "max",
			message: "numbers[2] must be less than 30.",
		});
		expect(result.output).toStrictEqual(body);
	});

	test("simple validation, array, failing, value type is not array", () => {
		const schema = {
			numbers: "number[]",
		};

		const body = {
			numbers: 1,
		};

		const validator = new JValid(schema);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toStrictEqual({
			field: "numbers",
			filter: "number",
			message: "Field numbers must be an array.",
		});
		expect(result.output).toStrictEqual(body);
	});

	test("Nested array value coercion", () => {
		const schema = {
			nested: {
				numbers: "number[]",
			},
		};

		const body = {
			nested: {
				numbers: [1, 2, "3"],
			},
		};

		const validator = new JValid(schema, { typeCoercion: true });
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual({ nested: { numbers: [1, 2, 3] } });
	});

	test("Custom pipe filter - multiple", () => {
		const double = (value) => {
			return value * 2;
		};

		const schema = {
			numbers: "double[]|>number[]",
		};

		const body = {
			numbers: [1, 2, 3],
		};

		const validator = new JValid(schema, { typeCoercion: true });
		validator.registerFilter("double", double);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual({ numbers: [2, 4, 6] });
	});

	test("Custom pipe filter - single", () => {
		const multiply = (value, body, params) => {
			return value * params[0];
		};

		const schema = {
			numbers: "multiply[](2)|>",
		};

		const body = {
			numbers: [1, 2, 3],
		};

		const validator = new JValid(schema, { typeCoercion: true });
		validator.registerFilter("multiply", multiply);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual({ numbers: [2, 4, 6] });
	});

	test("Multiple params", () => {
		const multiply = (value, body, params) => {
			return params.reduce((accum, num) => accum * num, value);
		};

		const schema = {
			numbers: "multiply[](2, 2, 2)|>",
		};

		const body = {
			numbers: [1, 2, 3],
		};

		const validator = new JValid(schema, { typeCoercion: true });
		validator.registerFilter("multiply", multiply);
		const result = validator.validate(body);

		expect(result.valid).toStrictEqual(true);
		expect(result.errors).toHaveLength(0);
		expect(result.output).toStrictEqual({ numbers: [8, 16, 24] });
	});
});
