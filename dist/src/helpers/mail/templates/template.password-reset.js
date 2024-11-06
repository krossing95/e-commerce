"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PasswordResetMailTemplate;
function PasswordResetMailTemplate(name, link) {
    const template = `
            <!DOCTYPE html>
            <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                <link href="http://fonts.cdnfonts.com/css/plance" rel="stylesheet" type="text/css">
            </head>
            <body style="padding: 0; margin: 0; box-sizing: border-box; background-color: #ffffff; -webkit-text-size-adjust: none;
                text-size-adjust: none; font-family: 'Plance', sans-serif !important; color: #000000;">
                <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 5px; padding: 20px;">
                    <div class="wrapper" style="max-width: 450px; margin: 0 auto; display: block;">
                        <img style="padding-bottom: 25px;" src="https://res.cloudinary.com/dvtrwpy0o/image/upload/v1730817654/dynamic-dummy-image-generator-1280x720_wxlvxh.webp" width="100"
                            alt="App logo" />
                        <h3 style="font-size: 25px; color: #0038A8;">Password Reset</h3>
                        <p style="line-height: 30px; padding-bottom: 10px; color: #000000; font-size: 18px;">Hi ${name},</p>
                        <p style="line-height: 30px; padding-bottom: 10px; color: #000000;">We received your request to update your password.</p>
                        <b style="line-height: 30px; padding-bottom: 10px; color: #000000;">Due to security reasons, the link is only usable within 1 hour. If you do not expect to receive this message, kindly ignore it or visit your account and change your password, as someone may have guessed it.</b>
                        <br><br><br>
                        <a style="padding: 20px; color: #ffffff; background-color: #0038A8; border-radius: 5px; text-decoration: none; text-transform: uppercase;" href='${link}'>go to password reset page</a>
                        <br><br><br>
                        <p style="line-height: 20px; padding-bottom: 10px; color: #000000;">Thank you</p>
                        <p style="line-height: 20px; padding-bottom: 10px; color: #000000;">Ecommerce Team</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    return template;
}
