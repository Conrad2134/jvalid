const { filters } = require('../src/filters');

describe('Filter validations', () => {
	test('required', () => {
		expect(() =>
			filters.required(null, null, null, 'nullField', null, null)
		).toThrowErrorMatchingInlineSnapshot(`"nullField is required."`);

		expect(() =>
			filters.required(undefined, null, null, 'undefField', null, null)
		).toThrowErrorMatchingInlineSnapshot(`"undefField is required."`);

		expect(() =>
			filters.required(NaN, null, null, 'NaNField', null, null)
		).toThrowErrorMatchingInlineSnapshot(`"NaNField is required."`);

		expect(() =>
			filters.required('', null, null, 'emptyStringField', null, null)
		).toThrowErrorMatchingInlineSnapshot(`"emptyStringField is required."`);

		expect(() =>
			filters.required(0, null, null, 'zeroField', null, null)
		).not.toThrow();

		expect(() =>
			filters.required(55, null, null, 'numberField', null, null)
		).not.toThrow();

		expect(() =>
			filters.required('hello', null, null, 'stringField', null, null)
		).not.toThrow();
	});

	test('string', () => {
		expect(
			filters.string(null, null, null, 'nullField', null, null)
		).toStrictEqual(undefined);

		expect(
			filters.string(undefined, null, null, 'undefField', null, null)
		).toStrictEqual(undefined);

		expect(
			filters.string('', null, null, 'emptyStringField', null, {
				typeCoercion: false,
			})
		).toStrictEqual(undefined);

		expect(() =>
			filters.string(0, null, null, 'zeroField', null, { typeCoercion: false })
		).toThrowErrorMatchingInlineSnapshot(`"zeroField must be a string."`);

		expect(() =>
			filters.string(50, null, null, 'numberStrField', null, {
				typeCoercion: false,
			})
		).toThrowErrorMatchingInlineSnapshot(`"numberStrField must be a string."`);

		expect(
			filters.string(50, null, null, 'numberStrField', null, {
				typeCoercion: true,
			})
		).toStrictEqual('50');

		expect(
			filters.string('string', null, null, 'stringField', null, {
				typeCoercion: true,
			})
		).toStrictEqual('string');

		expect(
			filters.string('string', null, null, 'stringField', null, {
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
				'numberTextField',
				null,
				{
					typeCoercion: true,
				}
			)
		).toThrowErrorMatchingInlineSnapshot(
			`"Could not coerce numberTextField value into a string."`
		);
	});
});
