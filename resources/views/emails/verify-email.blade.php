<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Verify Your Email – {{ $appName }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

    <!-- Wrapper -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f0f4f8;">
        <tr>
            <td style="padding:40px 16px;">

                <!-- Card -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

                    <!-- Header accent bar -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);height:5px;font-size:1px;line-height:1px;">&nbsp;</td>
                    </tr>

                    <!-- Logo / Brand -->
                    <tr>
                        <td style="padding:36px 40px 0 40px;text-align:center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                                <tr>
                                    <td style="background-color:#4f46e5;border-radius:12px;padding:10px 18px;">
                                        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">{{ $appName }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Envelope icon -->
                    <tr>
                        <td style="padding:28px 40px 0 40px;text-align:center;">
                            <div style="display:inline-block;background-color:#eef2ff;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:30px;">
                                &#128231;
                            </div>
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td style="padding:20px 40px 0 40px;text-align:center;">
                            <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;line-height:1.3;">
                                Verify your email address
                            </h1>
                        </td>
                    </tr>

                    <!-- Body text -->
                    <tr>
                        <td style="padding:16px 40px 0 40px;text-align:center;">
                            <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">
                                Hi <strong style="color:#111827;">{{ $user->name }}</strong>, thanks for signing up!<br />
                                Click the button below to confirm your email address and activate your account.
                            </p>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding:28px 40px 0 40px;text-align:center;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="{{ $verificationUrl }}" style="height:48px;v-text-anchor:middle;width:220px;"
                                arcsize="22%" strokecolor="#4f46e5" fillcolor="#4f46e5">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:700;">
                                    Verify Email Address
                                </center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a href="{{ $verificationUrl }}"
                               style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.2px;line-height:1;">
                                Verify Email Address
                            </a>
                            <!--<![endif]-->
                        </td>
                    </tr>

                    <!-- Expiry notice -->
                    <tr>
                        <td style="padding:20px 40px 0 40px;text-align:center;">
                            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                                This link will expire in
                                <strong style="color:#6b7280;">{{ $expiresInMinutes }} minutes</strong>.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:28px 40px 0 40px;">
                            <div style="border-top:1px solid #e5e7eb;"></div>
                        </td>
                    </tr>

                    <!-- Fallback link section -->
                    <tr>
                        <td style="padding:20px 40px 0 40px;text-align:center;">
                            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                                If the button doesn't work, copy and paste this URL into your browser:
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 40px 0 40px;text-align:center;">
                            <a href="{{ $verificationUrl }}"
                               style="font-size:12px;color:#4f46e5;word-break:break-all;text-decoration:underline;">
                                {{ $verificationUrl }}
                            </a>
                        </td>
                    </tr>

                    <!-- Security note -->
                    <tr>
                        <td style="padding:20px 40px 0 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                                   style="background-color:#fafafa;border:1px solid #e5e7eb;border-radius:8px;">
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                                            <strong style="color:#374151;">&#128274; Security tip:</strong>
                                            If you did not create an account with <strong>{{ $appName }}</strong>,
                                            please ignore this email. No account will be activated without clicking the link above.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:28px 40px 36px 40px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                                &copy; {{ date('Y') }} {{ $appName }}. All rights reserved.<br />
                                You're receiving this email because you registered at {{ config('app.url') }}.
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- /Card -->

            </td>
        </tr>
    </table>
    <!-- /Wrapper -->

</body>
</html>
