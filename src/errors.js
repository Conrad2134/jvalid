export class JValidRequiredError extends Error {
	constructor(fieldName) {
		super(`${fieldName} is required.`);
	}
}

export class JValidTypeError extends Error {
	constructor(type, ...params) {
		super(...params);
		this.type = type;
	}
}

export class JValidFilterConflictError extends Error {
	constructor(name) {
		super(`Filter with name '${name}' is already registered.`);
	}
}
