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
    expect(result.output).toStrictEqual(body);
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
      expect(filterBody).toStrictEqual(body);
      expect(params).toStrictEqual([]);
      expect(field).toStrictEqual("passing");
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

  test.todo("arrays, everything");
  test.todo("individual test for each built-in filter");
  test.todo("error types");
});