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

            case 'login':
                // Check if the username or email exists in the database
            find({
                table: 'Users',
                qty: 'findOne',
                query: {
                    $or: [
                        { userName: data.userNameOrEmail },
                        { email: data.userNameOrEmail }
                    ]
                },
                project: {
                    _id: 1,
                    userName: 1,
                    email: 1,
                    password: 1
                }
            }).then((user: any) => {
                if (!user) {
                    res.status(401).json({
                        status: 'error',
                        message: 'Invalid credentials'
                    });
                } else {
                    if (user.validPassword(data.password, data.pass0)) {
                        res.status(200).json({
                            status: 'success',
                            message: 'Login successful',
                            user: {
                                _id: user._id,
                                userName: user.userName,
                                email: user.email
                            }
                        });
                    } else {
                        res.status(401).json({
                            status: 'error',
                            message: 'Invalid credentials'
                        });
                    }
                }
            });
            break;


        default:
            break;
    }
}