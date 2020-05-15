# Ideas


```javascript
const gtAge = (age, body, params, schema) => {
    // If `retirementAge` isn't passed, we don't call this filter.
    if (toAge(body.dob) >= age) {
        throw new Error('Retirement age must be greater than current age.');
    }
};

const onlyIf = (value, body, params, schema) => {
    // params: ['address.line1']
    if (!getDeep(body, params[0])) {
        throw new Error('Address line 1 must also be filled out.');
    }
};

const addressLine1Error = 'Address line 1 is required please.';

// Valid types are [any, string, int, dec, date].
// Any type can be used as an array (any[], string[]).
// `Pipes` (dob: 'date|toAge|>max:60') will transform the value and pass it down the chain.
// `Type` filters (string, string[], int, date, etc.) are special and will transform and pass it down automatically (with `typeCoercion: true` in options, otherwise it will fail right away if the type doesn't match).
// Filters get called in order (left -> right).
const nameRules = 'required|string|max:30';

// TODO: Named parameters to filters? required:(message='hello',strict=true)

const schema = {
    firstName: nameRules,
    lastName: nameRules,
    dob: 'required|date',
    retirementAge: 'int|gtAge',
    address: {
        line1: `required:${addressLine1Error}|string|max:60`,
        line2: 'onlyIf:address.line1|string|max:60',
    },
},

const request = {
    firstName: 'Bobby',
    lastName: 'Newport',
    dob: '03/01/1990',
    retirementAge: '18', // Will work with `typeCoercion: true` in options b/c Number('18') === 18.
    address: {
        line1: null,
        line2: 'Apt. 206',
    },
};

const options = {
    additionalProperties: false,
    typeCoercion: true,
};

const validation = jvalid.isValid(schema, request, options); // (see result below)
const validation = {
    valid: false,
    errors: [
        { field: 'retirementAge', filter: 'gtAge', message: 'Retirement age must be greater than current age.' },
        { field: 'address.line1', filter: 'required', message: 'Address line 1 is required please.' },
        { field: 'address.line2', filter: 'onlyIf:address.line1', message: 'Address line 1 must also be filled out.' }
    ],
    output: {
        firstName: 'Bobby',
        lastName: 'Newport',
        dob: '[Object date]', // Notice the coercion that happened here.
        retirementAge: 18, // Notice the coercion that happed here.
        address: {
            line1: null,
            line2: 'Apt. 206',
        },
    },
};