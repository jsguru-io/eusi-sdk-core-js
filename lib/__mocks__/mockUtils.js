export const mockPromiseBasedMethods = (names) => names.reduce((acc, name) => {
    acc[name] = jest.fn(() => Promise.resolve()).mockName('name');
    return acc;
}, {});

export default {};
