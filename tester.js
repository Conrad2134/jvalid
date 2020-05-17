const { JValid, JValidRequiredError, JValidTypeError } = require('./src/index');
const getValue = require('get-value');

const nameFilter = (value, body, params, field, schema, options) => {
	if (!value) {
		throw new JValidRequiredError(field);
	}

	if (typeof value !== 'string') {
		throw new JValidTypeError('string', `${field} must be a string.`);
	}

	if (value.length > 30) {
		throw new Error(`${field} cannot be greater than 30 characters.`);
	}
};

const onlyIf = (value, body, params, field, schema, options) => {
	if (value && !getValue(body, params[0])) {
		throw new Error('Address line 1 must also be filled out.');
	}
};

const math = (value, body, params, field, schema, options) => {
	const [operator, ...args] = params;
	let final = value;

	args.map(Number).forEach((arg) => {
		if (operator === '*') {
			final *= arg;
		} else if (operator === '/') {
			final /= arg;
		} else if (operator === '+') {
			final += arg;
		} else if (operator === '-') {
			final -= arg;
		} else {
			throw new Error(`Operator '${operator}' is not supported.`);
		}
	});

	return final;
};

const schema = {
	firstName: 'string|required|max:30',
	lastName: 'name',
	age: 'number|required',
	quadrupled: 'number|math:*,2,2|>max:50',
	address: {
		line1: 'string|required|max:60',
		line2: 'string|onlyIf:address.line1|max:60',
	},
	awards: {
		// Array of numbers, none can be over 2020, max length of 3.
		recentDundieYears: 'number[]|max[]:2020|max:3',
	},
};

const badRequest = {
	firstName: 'Bobbyreallylongnamewhichisover30characters',
	lastName: 'Newport',
	age: '33',
	quadrupled: 20,
	additionalProp: 'fake',
	address: {
		line2: 'where is line 1?',
	},
	awards: {
		// Output doesn't show coerced '2018' b/c validation fails on the length later.
		recentDundieYears: [1999, 2011, '2018', 2019],
	},
};

const goodRequest = {
	firstName: 'Bobby',
	lastName: 'Newport',
	age: '33',
	quadrupled: 10,
	address: {
		line1: 'Right here',
		line2: 'where is line 1?',
	},
	awards: {
		recentDundieYears: [1999, 2011, '2018'],
	},
};

const options = {
	typeCoercion: true,
};

const validator = new JValid(schema, options);

validator.registerFilter('name', nameFilter);
validator.registerFilter('onlyIf', onlyIf);
validator.registerFilter('math', math);

// const result = validator.validate(badRequest);
const result = validator.validate(goodRequest);

console.log(JSON.stringify(result, null, 2));
