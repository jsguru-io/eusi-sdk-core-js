import filterParser from '../filterParser';

const mockedNonObjectValue = 'mocked string';

test('basic filtering', () => {
    expect(filterParser({
        type: mockedNonObjectValue
    })).toEqual({
        'sys.type': mockedNonObjectValue
    });

    const basicTestCases = [
        {
            input: 'key',
            output: 'sys.key'
        }, {
            input: 'name',
            output: 'sys.name'
        }, {
            input: 'taxonomyName',
            output: 'sys.taxonomy.name'
        }, {
            input: 'taxonomyId',
            output: 'sys.taxonomy'
        }
    ];

    basicTestCases.forEach(testCase => {
        expect(filterParser({
            [testCase.input]: mockedNonObjectValue
        })).toEqual({
            [testCase.output]: mockedNonObjectValue
        });
    });
});

describe('advanced filtering', () => {
    test('filtering based on content fields', () => {
        const mockedAddress = 'Vidovdanska 9';
        const mocked$LikeOperatorValue = '%someSubstringToMatch%';
        expect(filterParser({
            field: {
                address: mockedAddress,
                blogText: {
                    $like: mocked$LikeOperatorValue
                }
            }
        })).toEqual({
            'elem.address': mockedAddress,
            'elem.blogText[$like]': mocked$LikeOperatorValue
        });

        expect(filterParser({
            field: {
                salary: {
                    $in: [100, 200],
                    $ne: 150
                },
                startDate: {
                    $between: ['2018-01-22T16:03:45Z', '2018-01-27T16:03:50Z']
                }
            }
        })).toEqual({
            'elem.salary[$in]': '100,200',
            'elem.salary[$ne]': 150,
            'elem.startDate[$between]': '2018-01-22T16:03:45Z,2018-01-27T16:03:50Z'
        });
    });

    test('filtering based on system properties', () => {
        expect(filterParser({
            name: {
                $like: '%Obilic%',
            },
            taxonomyPath: {
                $like: 'news.tennis%'
            }
        })).toEqual({
            'sys.name[$like]': '%Obilic%',
            'sys.taxonomy.path[$like]': 'news.tennis%'
        });
    });

    test('filtering based on both system properties and content fields', () => {
        const mockedExpirationDate = new Date().valueOf();
        const parsedFilter = filterParser({
            name: 'My first content',
            type: 'blog',
            taxonomyName: {
                $in: ['tennis', 'karate']
            },
            field: {
                salary: {
                    $gte: 5000
                },
                expirationDate: mockedExpirationDate
            }
        });
        expect(parsedFilter).toEqual({
            'sys.type': 'blog',
            'sys.name': 'My first content',
            'sys.taxonomy.name[$in]': 'tennis,karate',
            'elem.salary[$gte]': 5000,
            'elem.expirationDate': mockedExpirationDate
        });
    });
});

describe('when filter operator is $in', () => {
    test('in case value is not an Array it should throw an error', () => {
        const someNonArrayValue = {};
        expect(() => {
            filterParser({
                name: {
                    $in: someNonArrayValue
                }
            });
        }).toThrow();
    });
});
