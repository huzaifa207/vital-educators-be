export const feedbackRejected = (studentName: string, tutorName: string) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>Feedback Review Update</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
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
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
          }
          table,
          img {
            -ms-interpolation-mode: bicubic;
          }
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
          div[style*='margin: 16px 0;'] {
            margin: 0 !important;
          }
          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
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
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px"
              >
                <tr>
                  <td align="center" valign="top" style="padding: 36px 24px">
                    <a
                      href="https://vitaleducators.com"
                      target="_blank"
                      style="display: inline-block"
                    >
                      <img
                        src="https://www.vitaleducators.com/logo-black.png"
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
            </td>
          </tr>
          <!-- end logo -->
  
          <!-- start hero -->
          <tr>
            <td align="center" bgcolor="#e9ecef">
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px"
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
                        color: #ff6b6b;
                      "
                    >
                      Feedback Review Update
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
                    <p style="margin: 0; margin-bottom: 16px;">
                      Dear ${studentName},
                    </p>
                    <p style="margin: 0; margin-bottom: 16px;">
                      We hope this message finds you well. We're writing to inform you that your recent feedback for <strong>${tutorName}</strong> has been reviewed and unfortunately cannot be published on our platform.
                    </p>
                    <p style="margin: 0; margin-bottom: 16px;">
                      <strong>Reason for rejection:</strong>
                    </p>
                    <p style="margin: 0; margin-bottom: 16px; padding: 16px; background-color: #fff5f5; border-left: 4px solid #ff6b6b; color: #721c24;">
                      Your feedback appears to contain content that doesn't align with our community guidelines. This may include inappropriate language, personal attacks, content unrelated to the tutoring experience, or violation of our terms of service.
                    </p>
                    <p style="margin: 0; margin-bottom: 16px;">
                      We encourage constructive and respectful feedback that helps both tutors and fellow students. If you'd like to resubmit your feedback with appropriate content, please feel free to do so.
                    </p>
                    <p style="margin: 0; margin-bottom: 16px;">
                      <strong>Our Community Guidelines include:</strong>
                    </p>
                    <ul style="margin: 0; margin-bottom: 16px; padding-left: 20px;">
                      <li>Keep feedback professional and constructive</li>
                      <li>Focus on the tutoring experience and educational content</li>
                      <li>Avoid personal attacks or inappropriate language</li>
                      <li>Be honest but respectful in your assessment</li>
                    </ul>
                  </td>
                </tr>
                <!-- end copy -->
  
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
                    <p style="margin: 0; margin-bottom: 16px;">
                      If you have any questions about this decision or would like clarification on our guidelines, please don't hesitate to contact our support team.
                    </p>
                    <p style="margin: 0;">
                      Thank you for your understanding and for being part of the VitalEducators community.
                    </p>
                  </td>
                </tr>
                <!-- end copy -->
  
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
                      font-weight:600;
                      color:#444;
                    "
                  >
                    <p style="margin: 0;">
                      Best regards,<br>
                      Team VitalEducators
                    </p>
                  </td>
                </tr>
                <!-- end copy -->
              </table>
            </td>
          </tr>
          <!-- end copy block -->
  
          <!-- start footer -->
          <tr>
            <td align="center" bgcolor="#e9ecef" style="padding: 24px">
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
                      This is an automated message from VitalEducators. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
                <!-- end permission -->
              </table>
            </td>
          </tr>
          <!-- end footer -->
        </table>
        <!-- end body -->
      </body>
    </html>`;
};
