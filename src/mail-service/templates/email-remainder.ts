export const emailRemainder = (name: string) => {
  return `

    <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>Profile Update Reminder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <style type="text/css">
            @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");
            
            /**
            * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
            */
            body{
                font-family:'Poppins', sans-serif;
            }
            p{
                font-family:'Poppins', sans-serif;
            }

            /**
            * Avoid browser level font resizing.
            * 1. Windows Mobile
            * 2. iOS / OSX
            */
            body,
            table,
            td,
            a {
            -ms-text-size-adjust: 100%;
            /* 1 */
            -webkit-text-size-adjust: 100%;
            /* 2 */
            }

            /**
            * Remove extra space added to tables and cells in Outlook.
            */
            table,
            /**
            * Better fluid images in Internet Explorer.
            */
            img {
            -ms-interpolation-mode: bicubic;
            }

            /**
            * Remove blue links for iOS devices.
            */
            a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
            }

            /**
            * Fix centering issues in Android 4.4.
            */
            div[style*='margin: 16px 0;'] {
            margin: 0 !important;
            }

            body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            }

            /**
            * Collapse table borders to avoid space between cells.
            */
            table {
            border-collapse: collapse !important;
            }

            a {
            color: #2A2462;
            }

            img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
            }
        </style>
        </head>

        <body style="background-color: #e9ecef">
        <!-- start body -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- start logo -->
            <tr>
            <td align="center" bgcolor="#e9ecef">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
                <tr>
                    <td align="center" valign="top" style="padding: 36px 24px">
                    <a href="https://sendgrid.com" target="_blank" style="display: inline-block">
                        <img src="https://vital-educators.vercel.app/logo-black.png" 
                        alt="Logo" border="0" width="30%" 
                        style="
                                display: block;
                                width: 30%;
                                max-width: 30%;
                                min-width: 50px;
                                " />
                    </a>
                    </td>
                </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
            </td>
            </tr>
            <!-- end logo -->

            <!-- start hero -->
            <tr>
            <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
                <tr>
                    <td align="left" bgcolor="#ffffff" style="
                            padding: 36px 24px 0;
                            
                            border-top: 3px solid #d4dadf;
                            ">
                    <h1 style="
                                margin: 0;
                                font-size: 32px;
                                font-weight: 700;
                                letter-spacing: -1px;
                                line-height: 48px;
                                text-align: center;
                            ">
                        Reminder
                    </h1>
                    </td>
                </tr>
                </table>

            </td>
            </tr>
            <!-- end hero -->

            <!-- start copy block -->
            <tr>
            <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                    <td align="center" valign="top" width="600">
                    <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
                <!-- start copy -->
                <tr>
                    <td align="left" bgcolor="#ffffff" style="
                            padding-left:24px;
                            padding-right:24px;
                            padding-top:24px;
                            
                            font-size: 16px;
                            line-height: 24px;
                            ">
                    <p style="margin: 0">
                        Hi ${name}, We know you’re super busy but we need more information to complete your profile. 
                        Please update your profile. Otherwise, your profile will not show to student.
                    </p>
                    </td>
                </tr>
                <!-- end copy -->

                <!-- start copy -->
                <tr>
                    <td align="left" bgcolor="#ffffff" style="
                            padding: 24px;
                            
                            font-size: 16px;
                            line-height: 24px;
                            border-bottom: 3px solid #d4dadf;
                            ">
                    <p style="margin: 0">
                    VitalEducators Team<br />
                    </p>
                    </td>
                </tr>
                <!-- end copy -->
                </table>
                <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
            </td>
            </tr>
            <!-- end copy block -->

            <!-- start footer -->
            <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 24px">

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
                <!-- start permission -->
                <tr>
                    <td align="center" bgcolor="#e9ecef" style="
                            padding: 12px 24px;
                            
                            font-size: 14px;
                            line-height: 20px;
                            color: #666;
                            ">
                    <p style="margin: 0">
                        You received this email because you haven't give enough information to show your profile in search.
                    </p>
                    </td>
                </tr>
                <!-- end permission -->

                <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
            </td>
            </tr>
            <!-- end footer -->
        </table>
        <!-- end body -->
        </body>

        </html>
    `;
};
