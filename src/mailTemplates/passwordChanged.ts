import { assets_url } from "./conts"

export default ( ) => {
    return `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Anthology | Password Rese tSuccess</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" href="${assets_url}/images/logo.png" sizes="32x32">
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
            <!-- font family start -->
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&display=swap" rel="stylesheet">
            <!-- font family end -->
            <!-- Bootstrap -->
            <link rel="stylesheet" type="text/css" href="${assets_url}/css/bootstrap.min.css" />
            <link rel="stylesheet" type="text/css" href="${assets_url}/scss/style.css" />
        </head>
        <body>
            <!-- table start -->
            <table height="100%" cellpadding="0" cellspacing="0" style="width: 100%; height: 100vh; border: 0; margin: 0 auto; background-color: #171a1d; font-family: 'Roboto'; border-spacing: 0;">
            <tr>
                <td>
                <table cellpadding="0" cellspacing="0" width="500" style="margin: 0 auto; border: 0; background: #2c2f33; border-collapse: collapse; border-spacing: 0;">
                    <tr>
                    <td>
                        <table style="border-spacing: 0;">
                        <tr>
                            <td style="background: #171a1d; padding-top: 50px; padding-bottom: 30px; text-align: center;">
                            <a href="#"><img src="${assets_url}/images/anthology-logo.png" width="195" height="40" alt="logo"/></a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0;">
                            <img src="${assets_url}/images/emailer-bg.png" alt="emailer" width="100%" height="80px" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px 47px 30px 30px; background: #2c2f33;">
                            <ul style="list-style-type: none; padding: 0; margin-top: 0;">
                                <h1 style="font-family: 'Barlow', sans-serif; font-weight: bold; font-size: 20px; color: #ffffff; line-height: normal; text-align: left; padding: 0; margin-bottom: 30px;">PASSWORD CHANGED</h1><br/>
                                <li style="font-family: 'Barlow', sans-serif; font-weight: normal; font-size: 15px; color: #b5b5b7; line-height: 1.33; margin-bottom: 20px;">Your password has been successfully changed. Please Sign In to your account.</li>
                            </ul>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: #2c2f33;">
                            <ul style="list-style-type: none; padding: 0;">
                            <li style="margin: 0; padding: 0; list-style-type: none;"><p style="border-top: 1px solid #ffffff; opacity: 0.05; margin: 0;"></p></li>
                            <li style="font-family: 'Barlow', sans-serif; font-weight: normal; font-size: 15px; padding: 30px; color: #b5b5b7; line-height: 1.25; list-style-type: none;">Best regards,<br>Anthology Support Team</li>
                            </ul>
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>
            </table>
            <!-- table end -->

        <!-- script start -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
        <script src="${assets_url}/js/bootstrap.min.js" language="javascript"></script>
        </body>
    </html>
`
}