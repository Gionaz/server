"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteS3BucketImage = exports.validateForm = exports.socketBroadCast = exports.onRun = exports.Api = void 0;
const products_1 = __importDefault(require("./Controllers/products"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config = new aws_sdk_1.default.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
aws_sdk_1.default.config = config;
const s3 = new aws_sdk_1.default.S3();
const Api = (res, data, code) => {
    res.status(code || 201).json(data);
}, onRun = () => {
    (0, products_1.default)({ data: { action: 'getSneakersData' } });
    setInterval(() => {
        (0, products_1.default)({ data: { action: 'getSneakersData' } });
    }, 1000 * 60 * 60 * 24);
}, socketBroadCast = (sockets, data) => {
    let clients = sockets.list;
    Object.keys(clients).forEach((key) => {
        let socket = clients[key];
        try {
            if (socket)
                socket.send(JSON.stringify(data));
        }
        catch (e) {
            console.log(e);
        }
    });
}, validateForm = (formData, formType) => {
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
    let error = { field: null, value: null };
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
            };
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
                };
        }
    }
    return error;
}, deleteS3BucketImage = (image) => {
    const bucketName = image.split(".s3")[0].split("//")[1];
    const splitImg = image.split(".com/")[1];
    console.log({ bucketName });
    const deleteParams = {
        Bucket: bucketName,
        Key: splitImg // Specify the key of the image to delete
    };
    s3.deleteObject(deleteParams, (err, data) => {
        if (err) {
            console.log(`Error deleting object ${err}`);
        }
        else {
            console.log("Successfully deleted the specified image.");
            console.log(data);
        }
    });
};
exports.Api = Api, exports.onRun = onRun, exports.socketBroadCast = socketBroadCast, exports.validateForm = validateForm, exports.deleteS3BucketImage = deleteS3BucketImage;
