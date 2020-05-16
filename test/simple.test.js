const { JValid } = require("../src/index");

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
    expect(result.errors).toHaveLength(3);
    expect(result.output).toEqual(body);
  });

  test.todo("additional properties");
  test.todo("type coercion");
  test.todo("individual test for each built-in filter");
});
