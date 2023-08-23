import Tables from './models'
interface Props {
    table: string,
    qty?: string
    query?: any,
    project?: any,
    sort?: any
    limit?: number,
    update?: any,
    data?: any,
    array?: any[],
    projection?: any,
<<<<<<< HEAD
    options?: { returnOriginal?: boolean, upsert?: boolean, projection?: any }
}
interface RespProps {
    err: any,
    result: any,
=======
    skip?: number,
    options?: { returnOriginal?: boolean, upsert?: boolean, projection?: any }
}
interface RespProps {
    err?: any,
    result?: any,
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
    resolve: (resp: any) => void,
}
const response = (props: RespProps) => {
    const { err, result, resolve } = props;
    if (err)
        console.log(err);
    else if (resolve)
        resolve(result);
},
    save = (props: Props) => new Promise((resolve) => {
        const { table, data } = props
        const Table = new (Tables as any)[table](data);
<<<<<<< HEAD
        Table.save((err: any, result: any) => response({ err, result, resolve }))
=======
        Table.save().then(
            (result: any) => response({ result, resolve })
        ).catch((err: any) => response({ err, resolve }))
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
    }),
    count = (props: Props) => new Promise((resolve) => {
        const { table, query } = props
        if (table)
<<<<<<< HEAD
            (Tables as any)[table]['countDocuments'](query, (err: any, result: any) => response({ err, result, resolve }));
    }),
    find = (props: Props) => new Promise((resolve) => {
        const { table, qty, query, project, sort, limit } = props
        if (qty) {
            if (sort && !limit)
                (Tables as any)[table][qty](query, project, (err: any, result: any) => response({ err, result, resolve })).sort(sort);
            else if (limit && !sort)
                (Tables as any)[table][qty](query, project, (err: any, result: any) => response({ err, result, resolve })).limit(limit);
            else if (sort && limit)
                (Tables as any)[table][qty](query, project, (err: any, result: any) => response({ err, result, resolve })).sort(sort).limit(limit);
            else
                (Tables as any)[table][qty](query, project, (err: any, result: any) => response({ err, result, resolve }));
=======
            (Tables as any)[table]['countDocuments'](query).then(
                (result: any) => response({ result, resolve })
            ).catch((err: any) => response({ err, resolve }))
    }),
    find = (props: Props) => new Promise((resolve) => {
        const { table, qty, query, project, sort, limit, skip } = props
        if (qty) {
            if (sort && limit && skip)
                (Tables as any)[table][qty](query, project).sort(sort).skip(skip * limit).limit(limit).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve }))
            else if (sort && !limit)
                (Tables as any)[table][qty](query, project).sort(sort).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
            else if (limit && !sort)
                (Tables as any)[table][qty](query, project,).limit(limit).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
            else if (sort && limit)
                (Tables as any)[table][qty](query, project).sort(sort).limit(limit).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
            else
                (Tables as any)[table][qty](query, project).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
        }
    }),
    update = (props: Props) => new Promise((resolve) => {
        const { table, qty, query, update, options } = props
        if (qty) {
            if (qty === 'findOneAndUpdate')
<<<<<<< HEAD
                (Tables as any)[table][qty](query, update, options, (err: any, result: any) => response({ err, result, resolve }))
            else
                (Tables as any)[table][qty](query, update, options, (err: any, result: any) => response({ err, result, resolve }))
=======
                (Tables as any)[table][qty](query, update, options).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
            else
                (Tables as any)[table][qty](query, update, options).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
        }
    }),
    remove = (props: Props) => new Promise((resolve) => {
        const { table, qty, query, projection } = props
        if (qty) {
            if (qty === 'findOneAndDelete')
<<<<<<< HEAD
                (Tables as any)[table][qty](query, projection, (err: any, result: any) => response({ err, result, resolve }))
            else
                (Tables as any)[table][qty](query, (err: any, result: any) => response({ err, result, resolve }))
=======
                //db.col.findOneAndDelete({}, {})
                (Tables as any)[table][qty](query, projection).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
            else
                (Tables as any)[table][qty](query).then(
                    (result: any) => response({ result, resolve })
                ).catch((err: any) => response({ err, resolve })
                );
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
        }
    }),
    aggregate = (props: Props) => new Promise((resolve) => {
        const { table, array } = props
        if (table)
<<<<<<< HEAD
            (Tables as any)[table].aggregate(array).exec((err: any, result: any) => response({ err, result, resolve }))
=======
            (Tables as any)[table].aggregate(array).exec().then(
                (result: any) => response({ result, resolve })
            ).catch((err: any) => response({ err, resolve })
            );
>>>>>>> 7c0664af6d3393e9ff9f3ad87adf31514bf16915
    })
export {
    find,
    update,
    remove,
    aggregate,
    save,
    count
}

