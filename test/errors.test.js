import {
	JValidRequiredError,
	JValidTypeError,
	JValidFilterConflictError,
} from "../src/errors";

describe("Custom errors", () => {
	test("JValidRequiredError", () => {
		const result = new JValidRequiredError("customField");

		expect(result.message).toStrictEqual(`customField is required.`);
	});

	test("JValidTypeError", () => {
		const result = new JValidTypeError("customType", "customMessage");

		expect(result.type).toStrictEqual("customType");
		expect(result.message).toStrictEqual("customMessage");
	});

	test("JValidFilterConflictError", () => {
		const result = new JValidFilterConflictError("customFilterName");

		expect(result.message).toStrictEqual(
			"Filter with name 'customFilterName' is already registered."
		);
	});
});
