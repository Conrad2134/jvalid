Filter configuration:

```javascript
// AutoPipe
validator.registerFilter({
	name: "math",
	filter: () => {},
	autoPipe: true,
});
```

Named filter parameters:

```javascript
const schema = {
	name: 'name(as="Last Name")',
};
```

Some way to extend built-in filters:

```javascript
// Idea #1 (properties)
const makes = (value, body, params, field) => {
	if (!["Chevrolet", "Ford", "Toyota"].includes(value)) {
		throw new JValidTypeError(
			"makes",
			`${field} must be one of ['Chevrolet', 'Ford', 'Toyota'].`
		);
	}
};

makes.required = true;
makes.typeGuard = "string";
```

```javascript
// Idea #2 (parameters)
const makes = (value, body, params, field, schema, options, builtIns) => {
	builtIns.required();
	builtIns.string();

	if (!["Chevrolet", "Ford", "Toyota"].includes(value)) {
		throw new JValidTypeError(
			"makes",
			`${field} must be one of ['Chevrolet', 'Ford', 'Toyota'].`
		);
	}
};
```

```javascript
// Idea #3 (HOF)
const required = (cb) => (...args) => {
	if (!args[0]) {
		throw new JValidRequiredError("Whatever is required.");
	}

	cb(...args);
};

const makes = required(
	string((value, body, params, field, schema, options) => {
		if (!["Chevrolet", "Ford", "Toyota"].includes(value)) {
			throw new JValidTypeError(
				"makes",
				`${field} must be one of ['Chevrolet', 'Ford', 'Toyota'].`
			);
		}
	})
);
```

- Need a better way to format error messages from built-in filters, custom error messages.
- Could we 'precompile' schemas for better performance / bundle size?
- Would love to make a wrapper for different frameworks. Vue, for example.
- `failFast` option.
- Enhance the filter api - maybe object parameter rather than a long list?
- Make it async?
- Refactor.
- Would we want to pipe but not save the output?
- What else do we want to throw in the errors that might be helpful? A filter stack trace?
