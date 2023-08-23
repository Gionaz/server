declare module '*.json' {
    const jsonObject: {
        [key: string]: string | number | object | any[];
    };
    export default jsonObject;
}
