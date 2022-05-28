export const EmailReferee = (name: string, referee_name: string, url: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>Email Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          /**
      * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
      */
          @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");
          body{
                font-family:'Poppins', sans-serif;
            }
            p{
                font-family:'Poppins', sans-serif;
            }
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
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
        <!-- start preheader -->
        <div
          class="preheader"
          style="
            display: none;
            max-width: 0;
            max-height: 0;
            overflow: hidden;
            font-size: 1px;
            line-height: 1px;
            color: #fff;
            opacity: 0;
          "
        >
          // A preheader is the short summary text that follows the subject line when
          // an email is viewed in the inbox.
        </div>
        <!-- end preheader -->

        <!-- start body -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <!-- start logo -->
          <tr>
            <td align="center" bgcolor="#e9ecef">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px;background-color: #e9ecef"
              >
                <tr>
                  <td align="center" valign="top" style="padding: 36px 24px">
                    <a
                      href="https://vital-educators.vercel.app/tutor"
                      target="_blank"
                      style="display: inline-block"
                    >
                      <img
                        src="https://vital-educators.vercel.app/logo-black.png"
                        alt="Logo" border="0" width="30%" 
                        style="
                                display: block;
                                width: 30%;
                                max-width: 30%;
                                min-width: 50px;
                                "
                      />
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
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px;"
                     
              >
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="
                      padding: 36px 24px 0;
                      font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                      border-top: 3px solid #d4dadf;
                    "
                  >
                    <h1
                      style="
                        margin: 0;
                        font-size: 32px;
                        font-weight: 700;
                        letter-spacing: -1px;
                        line-height: 48px;
                        text-align: center;
                        margin-top:-20px;
                      "
                    >
                      First Tutor
                    </h1>
                  <hr />
                  </td>
                </tr>
              
              </table>
              
              <!--[if (gte mso 9)|(IE)]>
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
          <!-- end hero -->

          <!-- start copy block -->
          <tr>
            <td align="center" bgcolor="#e9ecef">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px"
              >
                <!-- start copy -->
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="
                      padding: 24px;
                      font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                      font-size: 16px;
                      line-height: 24px;
                    "
                  >
                    <p style="margin: 0;">
                      Dear ${referee_name},
                    </p>
                 
                    <p>You have been selected as a referee by ${name} as part of an ID checking system implemented by First Tutors. You are kindly requested to please complete a a short on-line form which will confirm ${name}'s identity and allow them to use First Tutors to offer their private tuition services. It is a short form and should take no longer than 2 minutes to complete. Please note: the completed reference form will be passed on to any clients who choose ${name} as their tutor, but your contact information will remain confidential. </p>
                    <p>The reference form can be accessed <a href=${url}>here.</a> </p>
                  </td>
                </tr>
                <!-- end copy -->

                 <!-- start button -->
                <tr>
                  <td align="left" bgcolor="#ffffff">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 12px">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td
                                align="center"
                                bgcolor="#2A2462"
                                style="border-radius: 6px"
                              >
                                <a
                                  href=${url}
                                  target="_blank"
                                  style="
                                    display: inline-block;
                                    padding: 16px 36px;
                                    font-family: 'Source Sans Pro', Helvetica, Arial,
                                      sans-serif;
                                    font-size: 16px;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 6px;
                                  "
                                  >Fill The Form</a
                                >
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- end button -->

                

                <!-- start copy -->
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="
                      padding: 24px;
                      font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                      font-size: 16px;
                      line-height: 24px;
                      border-bottom: 3px solid #d4dadf;
                    "
                  >
                      <p style="margin: 0">
                      This link will remain <strong>active for the next 30 days</strong> for you to complete at your convenience. If you do not wish to act as a referee you may use the same page to let us know.
                    </p>
                    <br/>
                     <p style="margin: 0">
                      On behalf of ${name} we thank you for your time. Kind Regards
                    </p>
                    <br/>
                    <p style="margin: 0">
                      Kind Regards
                    </p>
                   
                    <a href="#">
                      https://vital-educators.vercel.app
                    </a>
                    <br/><br/>
                    <p style="margin: 0">
                      VitalEducators Team
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
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px"
              >
                <!-- start permission -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#e9ecef"
                    style="
                      padding: 12px 24px;
                      font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
                      font-size: 14px;
                      line-height: 20px;
                      color: #666;
                    "
                  >
                    <p style="margin: 0">
                      You received this email because you request for a referee.
                      If you don't know this person then you can ignore this email. 
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
