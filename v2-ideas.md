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

- Need a better way to format error messages from built-in filters, custom error messages.
- Could we 'precompile' schemas for better performance / bundle size?
- Would love to make a wrapper for different frameworks. Vue, for example.
- Node 12+ only right now. Once we figure out how to package it, we can do browsers.
- `failFast` option.
- Enhance the filter api - maybe object parameter rather than a long list?
- Make it async?
- Refactor.
- Would we want to pipe but not save the output?
- What else do we want to throw in the errors that might be helpful? A filter stack trace?
