export const Api = (res: any, data: any, code?: number) => {
    res.status(code || 201).json(data)
}