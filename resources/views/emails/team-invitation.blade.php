<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>You've been invited – {{ $appName }}</title>
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

                    <!-- Icon -->
                    <tr>
                        <td style="padding:28px 40px 0 40px;text-align:center;">
                            <div style="display:inline-block;background-color:#eef2ff;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:30px;">
                                &#127881;
                            </div>
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td style="padding:20px 40px 0 40px;text-align:center;">
                            <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;line-height:1.3;">
                                You're invited!
                            </h1>
                        </td>
                    </tr>

                    <!-- Body text -->
                    <tr>
                        <td style="padding:16px 40px 0 40px;text-align:center;">
                            <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">
                                <strong style="color:#111827;">{{ $inviterName }}</strong> has added you to
                                <strong style="color:#111827;">{{ $shop->name }}</strong> as a
                                <strong style="color:#111827;">{{ ucfirst($role) }}</strong>.
                            </p>
                        </td>
                    </tr>

                    @if ($isNewUser)
                    <!-- New user notice -->
                    <tr>
                        <td style="padding:16px 40px 0 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                                   style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.6;">
                                            &#128274;&nbsp; An account has been created for
                                            <strong>{{ $user->email }}</strong>.
                                            Click the button below to set your password and get started.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    @endif

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding:28px 40px 0 40px;text-align:center;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="{{ $actionUrl }}" style="height:48px;v-text-anchor:middle;width:240px;"
                                arcsize="22%" strokecolor="#4f46e5" fillcolor="#4f46e5">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:700;">
                                    {{ $isNewUser ? 'Set Password & Get Started' : 'Go to Dashboard' }}
                                </center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a href="{{ $actionUrl }}"
                               style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.2px;line-height:1;">
                                {{ $isNewUser ? 'Set Password &amp; Get Started' : 'Go to Dashboard' }}
                            </a>
                            <!--<![endif]-->
                        </td>
                    </tr>

                    @if ($isNewUser)
                    <!-- Link expires note -->
                    <tr>
                        <td style="padding:16px 40px 0 40px;text-align:center;">
                            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                                This password setup link expires in
                                <strong style="color:#6b7280;">60 minutes</strong>.
                            </p>
                        </td>
                    </tr>
                    @endif

                    <!-- What is this shop section -->
                    <tr>
                        <td style="padding:24px 40px 0 40px;">
                            <div style="border-top:1px solid #e5e7eb;"></div>
                        </td>
                    </tr>

                    <!-- Role badge + shop info -->
                    <tr>
                        <td style="padding:24px 40px 0 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                                   style="background-color:#fafafa;border:1px solid #e5e7eb;border-radius:8px;">
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <p style="margin:0 0 10px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">
                                            Your Access
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom:8px;">
                                                    <span style="font-size:13px;color:#374151;">&#127978;&nbsp; Shop</span>
                                                    <span style="float:right;font-size:13px;font-weight:600;color:#111827;">{{ $shop->name }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span style="font-size:13px;color:#374151;">&#127737;&nbsp; Role</span>
                                                    <span style="float:right;">
                                                        @php
                                                            $roleColors = [
                                                                'owner'   => 'background-color:#f3e8ff;color:#7e22ce;',
                                                                'manager' => 'background-color:#dbeafe;color:#1d4ed8;',
                                                                'cashier' => 'background-color:#f3f4f6;color:#374151;',
                                                            ];
                                                            $roleStyle = $roleColors[$role] ?? $roleColors['cashier'];
                                                        @endphp
                                                        <span style="font-size:12px;font-weight:600;padding:2px 10px;border-radius:999px;{{ $roleStyle }}">
                                                            {{ ucfirst($role) }}
                                                        </span>
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Fallback link -->
                    <tr>
                        <td style="padding:20px 40px 0 40px;text-align:center;">
                            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                                Button not working? Copy and paste this URL:
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:6px 40px 0 40px;text-align:center;">
                            <a href="{{ $actionUrl }}"
                               style="font-size:12px;color:#4f46e5;word-break:break-all;text-decoration:underline;">
                                {{ $actionUrl }}
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
                                            <strong style="color:#374151;">&#128274; Not expecting this?</strong>
                                            If you don't know <strong>{{ $inviterName }}</strong> or weren't expecting
                                            an invitation, you can safely ignore this email.
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
                                This invitation was sent by {{ $inviterName }} via {{ config('app.url') }}.
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
