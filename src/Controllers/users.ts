import { find, save } from "../database";

export default ({
    data,
    res
}: any) => {


    const { action } = data
    switch (action) {
        case 'register':
            //check if in the database (email, or the username)
            find({
                table: 'Users',
                qty: 'findOne',
                query: {
                    $or: [
                        { userName: data.userName },
                        { email: data.email }
                    ]
                },
                project: {
                    email: 1,
                    userName: 1
                }
            }).then((user: any) => {
                // console.log({ user })
                if (!user){
                    save({
                        table: 'Users',
                        data: {
                            ...data,
                        }
                    }).then((user: any) => {
                        res.status(201).json({ 
                            status:'success', 
                            message:  'User has been registered',
                            user
                         })  
                    })
                }
                else
                    res.status(201).json({ 
                status:'error', 
                message: data.email === user.email ? 'The email is already registed.':'The username is not available.'
                    })
            })
            break;

        default:
            break;
    }
}