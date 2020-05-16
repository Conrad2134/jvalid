const { JValid } = require("../src/index");

describe("Simple validations", () => {
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
});
