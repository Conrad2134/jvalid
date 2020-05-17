module.exports.JValidRequiredError = class JValidRequiredError extends Error {
	constructor(fieldName) {
		super(`${fieldName} is required.`);
	}
};

module.exports.JValidTypeError = class JValidTypeError extends Error {
	constructor(type, ...params) {
		super(...params);
		this.type = type;
	}
};

module.exports.JValidFilterConflictError = class JValidFilterConflictError extends Error {
	constructor(name) {
		super(`Filter with name '${name}' is already registered.`);
	}
};
