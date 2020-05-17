const { filters } = require("../src/filters");

describe("Filter validations", () => {
	test("required", () => {
		expect(() =>
			filters.required(null, null, null, "nullField", null, null)
		).toThrowErrorMatchingInlineSnapshot(`"nullField is required."`);

		expect(() =>
			filters.required(undefined, null, null, "undefField", null, null)
		).toThrowErrorMatchingInlineSnapshot(`"undefField is required."`);

		expect(() =>
			filters.required(NaN, null, null, "NaNField", null, null)
		).toThrowErrorMatchingInlineSnapshot(`"NaNField is required."`);

		expect(() =>
			filters.required("", null, null, "emptyStringField", null, null)
		).toThrowErrorMatchingInlineSnapshot(`"emptyStringField is required."`);

		expect(() =>
			filters.required(0, null, null, "zeroField", null, null)
		).not.toThrow();

		expect(() =>
			filters.required(55, null, null, "numberField", null, null)
		).not.toThrow();

		expect(() =>
			filters.required("hello", null, null, "stringField", null, null)
		).not.toThrow();
	});

	test("string", () => {
		expect(
			filters.string(null, null, null, "nullField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.string(undefined, null, null, "undefField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.string("", null, null, "emptyStringField", null, {
				typeCoercion: false,
			})
		).toStrictEqual(undefined);

		expect(() =>
			filters.string(0, null, null, "zeroField", null, { typeCoercion: false })
		).toThrowErrorMatchingInlineSnapshot(`"zeroField must be a string."`);

		expect(() =>
			filters.string(50, null, null, "numberStrField", null, {
				typeCoercion: false,
			})
		).toThrowErrorMatchingInlineSnapshot(`"numberStrField must be a string."`);

		expect(
			filters.string(50, null, null, "numberStrField", null, {
				typeCoercion: true,
			})
		).toStrictEqual("50");

		expect(
			filters.string("string", null, null, "stringField", null, {
				typeCoercion: true,
			})
		).toStrictEqual("string");

		expect(
			filters.string("string", null, null, "stringField", null, {
				typeCoercion: false,
			})
		).toStrictEqual(undefined);

		expect(() =>
			filters.string(
				{
					// Hacky way of emulating a truthy value that can't be converted to a string (can this happen?)
					toString: () => {
						throw new Error("can't convert");
					},
				},
				null,
				null,
				"numberTextField",
				null,
				{
					typeCoercion: true,
				}
			)
		).toThrowErrorMatchingInlineSnapshot(
			`"Could not coerce numberTextField value into a string."`
		);
	});

	test("max - falsy and numbers", () => {
		expect(() =>
			filters.max(null, null, [1], "nullField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max(undefined, null, [1], "undefField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max(0, null, [0], "matchingNumField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max(NaN, null, [0], "NaNField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max(0, null, [1], "lessNumField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max(1, null, [0], "exceedNumField", null, null)
		).toThrowErrorMatchingInlineSnapshot(
			`"exceedNumField must be less than 0."`
		);
	});

	test("max - strings", () => {
		expect(() =>
			filters.max("hello", null, [5], "matchingStrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max("hello", null, [10], "lessStrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max("longstring", null, [5], "exceedStrField", null, null)
		).toThrowErrorMatchingInlineSnapshot(
			`"exceedStrField must be less than 5 characters in length."`
		);
	});

	test("max - arrays", () => {
		expect(() =>
			filters.max([1, 1], null, [2], "matchingArrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max([1], null, [2], "lessArrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.max([1, 1, 1], null, [2], "exceedArrField", null, null)
		).toThrowErrorMatchingInlineSnapshot(
			`"exceedArrField must be less than 2 items in length."`
		);
	});

	test("min - falsy and numbers", () => {
		expect(() =>
			filters.min(null, null, [1], "nullField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min(undefined, null, [1], "undefField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min(0, null, [0], "matchingNumField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min(NaN, null, [0], "NaNField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min(1, null, [0], "moreNumField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min(-1, null, [0], "lessNumField", null, null)
		).toThrowErrorMatchingInlineSnapshot(
			`"lessNumField must be greater than than 0."`
		);
	});

	test("min - strings", () => {
		expect(() =>
			filters.min("hello", null, [5], "matchingStrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min("longstring", null, [5], "aboveStrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min("hi", null, [5], "lessStrField", null, null)
		).toThrowErrorMatchingInlineSnapshot(
			`"lessStrField must be greater than than 5 characters in length."`
		);
	});

	test("min - arrays", () => {
		expect(() =>
			filters.min([1, 1], null, [2], "matchingArrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min([1, 1, 1], null, [2], "aboveArrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.min([1], null, [2], "lessArrField", null, null)
		).toThrowErrorMatchingInlineSnapshot(
			`"lessArrField must be greater than than 2 items in length."`
		);
	});

	test("number", () => {
		expect(
			filters.number(null, null, null, "nullField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.number(undefined, null, null, "undefField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.number("", null, null, "emptyStringField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.number(0, null, null, "zeroField", null, { typeCoercion: false })
		).toStrictEqual(undefined);

		expect(() =>
			filters.number(NaN, null, null, "NaNField", null)
		).toThrowErrorMatchingInlineSnapshot(
			`"NaNField must be a number but is NaN."`
		);

		expect(
			filters.number(50, null, null, "numberField", null, {
				typeCoercion: false,
			})
		).toStrictEqual(undefined);

		expect(
			filters.number(50, null, null, "numberField", null, {
				typeCoercion: true,
			})
		).toStrictEqual(50);

		expect(() =>
			filters.number("50", null, null, "strNumberField", null, {
				typeCoercion: false,
			})
		).toThrowErrorMatchingInlineSnapshot(
			`"strNumberField must be a number but is string."`
		);

		expect(
			filters.number("50", null, null, "strNumberField", null, {
				typeCoercion: true,
			})
		).toStrictEqual(50);

		expect(
			filters.number("50.5", null, null, "strDecimalField", null, {
				typeCoercion: true,
			})
		).toStrictEqual(50.5);

		expect(() =>
			filters.number("fifty", null, null, "strField", null, {
				typeCoercion: false,
			})
		).toThrowErrorMatchingInlineSnapshot(
			`"strField must be a number but is string."`
		);

		expect(() =>
			filters.number("fifty", null, null, "strField", null, {
				typeCoercion: true,
			})
		).toThrowErrorMatchingInlineSnapshot(
			`"Could not coerce strField value into a number."`
		);
	});

	test("array", () => {
		expect(
			filters.array(null, null, null, "nullField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.array(undefined, null, null, "undefField", null, null)
		).toStrictEqual(undefined);

		expect(
			filters.array("", null, null, "emptyStringField", null, null)
		).toStrictEqual(undefined);

		expect(() =>
			filters.array(0, null, null, "zeroField", null, { typeCoercion: false })
		).toThrowErrorMatchingInlineSnapshot(`"zeroField must be an array."`);

		expect(() =>
			filters.array(NaN, null, null, "NaNField", null)
		).toThrowErrorMatchingInlineSnapshot(`"NaNField must be an array."`);

		expect(() =>
			filters.array([], null, null, "emptyArrField", null, null)
		).not.toThrow();

		expect(() =>
			filters.array([1, 2, 3], null, null, "numArrField", null, null)
		).not.toThrow();
	});

	test.todo("processFilters");
});
