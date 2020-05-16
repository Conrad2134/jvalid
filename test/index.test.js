const { JValid } = require("../src/index");
const { JValidFilterConflictError } = require("../src/errors");

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
    expect(result.output).toEqual(body);
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
    expect(result.output).toEqual(body);
  });

  test("Multiple properties, multiple filters - passing", () => {
    const schema = {
      name: "string|required|max:15",
      age: "number|required|max:99",
      retirementAge: "number|max:75",
    };

    const body = {
      name: "Michael Scott",
      age: 50,
    };

    const validator = new JValid(schema);
    const result = validator.validate(body);

    expect(result.valid).toStrictEqual(true);
    expect(result.errors).toHaveLength(0);
    expect(result.output).toEqual(body);
  });

  test("Multiple properties, multiple filters - failing", () => {
    const schema = {
      name: "string|required|max:15",
      age: "number|required|max:99",
      retirementAge: "number|max:75",
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
    expect(result.output).toEqual(body);
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
    expect(result.output).toEqual({ name: body.name });
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
    expect(result.output).toEqual(body);
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
    expect(result.output).toEqual(body);
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
    expect(result.output).toEqual({ age: 50 });
  });

  test("custom filter", () => {
    const options = {
      typeCoercion: false,
      additionalProperties: false,
    };

    const schema = {
      passing: "passing",
      failing: "failing",
    };

    const body = {
      passing: 50,
      failing: 60,
    };

    const passingFilter = (
      value,
      filterBody,
      params,
      field,
      validatorSchema,
      validatorOptions
    ) => {
      expect(value).toStrictEqual(body.passing);
      expect(filterBody).toEqual(body);
      expect(params).toEqual([]);
      expect(field).toStrictEqual("passing");
      expect(validatorSchema).toEqual(schema);
      expect(validatorOptions).toEqual(options);
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
    expect(result.output).toEqual(body);
  });

  test("Custom filter conflict", () => {
    const validator = new JValid({});

    expect(() => validator.registerFilter("required")).toThrow(
      JValidFilterConflictError
    );
  });

  test.todo("individual test for each built-in filter");
  test.todo("error types");
});
