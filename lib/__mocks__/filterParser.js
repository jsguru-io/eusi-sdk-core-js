const MOCKED_PARSED_FILTER = {
    thisIs: 'mockedParsedResult'
};

const filterParser = jest.fn(() => MOCKED_PARSED_FILTER);

filterParser.mockedResult = MOCKED_PARSED_FILTER;

export default filterParser;
