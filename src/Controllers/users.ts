import { find, save } from "../database";
import { Api } from "../helper";

export default ({
    data,
    res
}: any) => {


    const { action } = data
    switch (action) {
        case 'Sign Up':
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
                if (!user) {
                    save({
                        table: 'Users',
                        data: {
                            ...data,
                        }
                    }).then((user: any) => {
                        res.status(201).json({
                            status: 'success',
                            message: 'User has been registered',
                            user
                        })
                    })
                }
                else
                    res.status(201).json({
                        status: 'error',
                        message: data.email === user.email ? 'The email is already registed.' : 'The username is not available.',
                        field: data.email === user.email ? 'email' : 'userName'
                    })
            })
            break;

        case 'Sign In':
            // Check if the username or email exists in the database
            console.log(data)
            find({
                table: 'Users',
                qty: 'findOne',
                query: {
                    $or: [
                        { userName: data.email },
                        { email: data.email }
                    ]
                }
            }).then((user: any) => {
                if (!user) {
                    Api(res, {
                        status: 'error',
                        message: 'Invalid credentials',
                        field: 'email'
                    });
                } else {
                    if (user.validPassword( data.password, user.password)) {
                        Api(res, {
                            status: 'success',
                            message: 'Login successful',
                            user
                        });
                    } else {
                        Api(res, {
                            status: 'error',
                            message: 'Invalid password',
                            field: 'password'
                        });
                    }
                }
            });
            break;


        default:
            break;
    }
}