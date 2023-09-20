import Products from "./Controllers/products";
export const Api = (res: any, data: any, code?: number) => {
    res.status(code || 201).json(data)
},
    onRun = () => {
        Products({ data: { action: 'getSneakersData' } })
        setInterval(() => {
            Products({ data: { action: 'getSneakersData' } })
        }, 1000 * 60 * 60 * 24);
    },
    socketBroadCast = (sockets: any, data: any) => {
        let clients = sockets.list;
        Object.keys(clients).forEach((key) => {
            let socket = clients[key]
            try {
                if (socket) socket.send(JSON.stringify(data));
            } catch (e) {
                console.log(e);
            }
        });
    },
    validateForm = (formData: any, formType: 'Sign In' | 'Sign Up' | 'Forgot Password' | 'Reset Password') => {
        const minPasswordLength = 8;
        const maxPasswordLength = 30;
        const passwordLengthMessage = `Password must contain ${minPasswordLength}-${maxPasswordLength} characters`;
        const minNameLength = 3;
        const maxNameLength = 100;
        const nameLengthMessage = `Name must contain ${minNameLength}-${maxNameLength} characters`;
        const minUsernameLength = 3;
        const maxUsernameLength = 30;
        const usernameLengthMessage = `Username must contain ${minNameLength}-${maxNameLength} characters`;
        const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    
        let error: { field: string | null, value: string | null } = { field: null, value: null };
    
        if (formType !== 'Reset Password' && !formData.email.trim()) {
            error.field = "email";
            error.value = "Email is required";
            return error;
        }
    
        if (!['Reset Password', 'Sign In'].includes(formType) && !emailRegex.test(formData.email)) {
            error.field = "email";
            error.value = "Invalid email address";
            return error;
        }
    
        if (['Login', 'Register', 'Reset Password'].includes(formType) && !formData.password.trim()) {
            error.field = "password";
            error.value = "Password is required";
            return error;
        }
    
    
        if (formType === 'Sign Up') {
            // for (let i = 0; i < initialInputs.length; i++) {
            //     const input = initialInputs[i];
            //     if (!formData[input.field]?.trim()) {
            //         error = error = {
            //             field: input.field,
            //             value: input.select ? "Please select a value for this field" : "Please enter " + (input.label.toLowerCase()),
            //         };
            //         break;
            //     }
            // }
            if (!error.field) {
                if (formData.password.length < minPasswordLength)
                    error = {
                        field: 'password',
                        value: passwordLengthMessage
                    };
                else if (formData.password !== formData.confirmPass)
                    error = {
                        field: 'confirmPass',
                        value: "Passwords do not match"
                    };
            }
        }
    
        if (formType === 'Reset Password') {
            if (formData.confirmPass !== formData.password) {
                error = {
                    field: 'confirmPass',
                    value: 'Passwords do not match'
                }
            }
            else if (formData.password.length < minPasswordLength || formData.password.length > maxPasswordLength) {
                error = {
                    field: 'password',
                    value: passwordLengthMessage,
                };
            }
        }
    
        if (formType === 'Sign In') {
            if (!error.field) {
                if (formData.password.length < minPasswordLength)
                    error = {
                        field: 'password',
                        value: passwordLengthMessage
                    }
            }
        }
    
        return error;
    }