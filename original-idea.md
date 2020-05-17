# Ideas

```javascript
const gtAge = (age, body, params, schema) => {
  // If `retirementAge` isn't passed, we don't call this filter.
  if (toAge(body.dob) >= age) {
    throw new Error("Retirement age must be greater than current age.");
  }
};

const onlyIf = (value, body, params, schema) => {
  // params: ['address.line1']
  if (!getDeep(body, params[0])) {
    throw new Error("Address line 1 must also be filled out.");
  }
};

const toNamed = (params, props) => {
  return props.reduce((accum, current, idx) => {
    // TODO: Also account for array length if we're falling back to an array index.
    accum[current] = params[current] || params[idx];

    return accum;
  }, {});
};

// Params will be an array of arguments, or an object of named props.
const name = (value, body, params, schema) => {
  // TODO: Necessary to support both named and list? Or pick one? Maybe 1 item can be without a name, but if you need multiple props, it has to be named?
  // Use special `toNamed` function to map array props if you want to support both. (name:"Last name" OR name:(prop="Last name"))
  const props = toNamed(params, ["formatted"]);

  if (!value) {
    // TODO: Custom error types? We'll let the wrapper grab the name and stuff and add additional context.
    throw new JValidRequired(props.formatted + " is required.");
  }

  if (typeof value !== "string") {
    throw new JValidType(props.formatted + " must be a string.");
  }

  if (value.length > 30) {
    throw new JValidMaxLength(
      props.formatted + " cannot be greater than 30 characters."
    );
  }
};

const addressLine1Error = "Address line 1 is required please.";

// Valid types are [any, string, int, dec, date].
// Any type can be used as an array (any[], string[]).
// `Pipes` (dob: 'date|toAge|>max:60') will transform the value and pass it down the chain.
// `Type` filters (string, string[], int, date, etc.) are special and will transform and pass it down automatically (with `typeCoercion: true` in options, otherwise it will fail right away if the type doesn't match).
// Filters get called in order (left -> right).

const schema = {
  firstName: "string|required|max:30",
  lastName: 'name:(formatted="Last name")', // One custom filter for all name rules.
  dob: "date|required",
  retirementAge: "int|gtAge",
  address: {
    line1: `string|required:${addressLine1Error}|max:60`,
    line2: "string|onlyIf:address.line1|max:60",
  },
};

const request = {
  firstName: "Bobby",
  lastName: "Newport",
  dob: "03/01/1990",
  retirementAge: "18", // Will work with `typeCoercion: true` in options b/c Number('18') === 18.
  address: {
    line1: null,
    line2: "Apt. 206",
  },
};

const options = {
  additionalProperties: false,
  typeCoercion: true,
  failFast: false, // If `true`, will fail after the first validation fails.
};

const validation = await jvalid.isValid(schema, request, options); // (see result below)
const validation = {
  valid: false,
  errors: [
    {
      field: "retirementAge",
      filter: "gtAge",
      message: "Retirement age must be greater than current age.",
    }, // TODO: What other pieces of info do we want? errorType?
    {
      field: "address.line1",
      filter: "required",
      message: "Address line 1 is required please.",
    },
    {
      field: "address.line2",
      filter: "onlyIf:address.line1",
      message: "Address line 1 must also be filled out.",
    },
  ],
  output: {
    firstName: "Bobby",
    lastName: "Newport",
    dob: "[Object date]", // Notice the coercion that happened here.
    retirementAge: 18, // Notice the coercion that happed here.
    address: {
      line1: null,
      line2: "Apt. 206",
    },
  },
};
```
