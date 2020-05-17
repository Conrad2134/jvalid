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
