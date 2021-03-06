const checkForArray = (operatorName, operatorValue) => {
    if (!Array.isArray(operatorValue)) {
        throw new Error(`value of ${operatorName} operator must be of Array type`);
    }
};

const parseOperatorName = (key, operatorName) => `${key}[${operatorName}]`;

const parseOperatorValue = (name, operatorName, operatorValue) => {
    switch (operatorName) {
        case '$between':
        case '$in': {
            checkForArray(operatorName, operatorValue);
            return {
                [`${name}[${operatorName}]`]: operatorValue.join(',')
            };
        }

        default: {
            return {
                [parseOperatorName(name, operatorName)]: operatorValue
            };
        }
    }
};

const getElementFilterFromQueryObject = (name, query) =>
    Object
        .keys(query)
        .reduce((acc, operatorName) => Object.assign(
            {},
            acc,
            parseOperatorValue(name, operatorName, query[operatorName])
        ),
        {});

const getFilter = name => value => (typeof value !== 'object' ? {
    [name]: value
} : getElementFilterFromQueryObject(name, value));

const singleFilterParser = {
    model: getFilter('sys.model'),
    // keeping alias until version 2.0.0
    type: getFilter('sys.model'),
    key: getFilter('sys.key'),
    title: getFilter('sys.title'),
    // keeping alias until version 2.0.0
    name: getFilter('sys.title'),
    taxonomyName: getFilter('sys.taxonomy.name'),
    taxonomyId: getFilter('sys.taxonomy'),
    taxonomyPath: getFilter('sys.taxonomy.path'),
    field(value = {}) {
        return Object
            .keys(value)
            .reduce((acc, elementName) => {
                const elementValue = value[elementName];
                const filterName = `elem.${elementName}`;

                const filter = getFilter(filterName)(elementValue);
                return Object.assign({}, acc, filter);
            }, {});
    },
};

export default (filter) => Object.keys(filter)
    .filter(filterName => !!filter[filterName])
    .reduce((acc, filterName) => {
        const filterValue = filter[filterName];
        const parser = singleFilterParser[filterName];
        return Object.assign({}, acc, parser(filterValue));
    }, {});

