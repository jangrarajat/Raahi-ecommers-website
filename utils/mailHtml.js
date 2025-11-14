const otpEmailHtml = (otp, userName = "Friend") => `
 <!doctype html>
<html>

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Raahi — Your OTP</title>
    <style>
        /* Reset */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table {
            border-collapse: collapse !important;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            display: block;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        /* Container */
        .email-wrap {
            width: 100%;
            background: #f5f5f7;
            padding: 30px 12px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .email-body {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(17, 17, 17, 0.06);
        }

        /* Header */
        .brand {
            padding: 22px 28px;
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .logo {
            width: 56px;
            height: 56px;
            border-radius: 10px;
            background: #000;
            display: inline-block;
        }

        .brand-name {
            font-size: 20px;
            font-weight: 700;
            color: #111;
            letter-spacing: 0.2px;
        }

        /* Hero */
        .hero {
            padding: 18px 28px 8px 28px;
        }

        .hero h1 {
            margin: 0;
            font-size: 20px;
            color: #111;
        }

        .hero p {
            margin: 8px 0 0 0;
            color: #555;
            font-size: 14px;
            line-height: 1.45;
        }

        /* OTP box */
        .otp-wrap {
            padding: 18px 28px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            align-items: center;
            justify-content: space-between;
             
        }

        .otp-badge {
            background: linear-gradient(90deg, #111 0%, #222 100%);
            color: #fff;
            font-size: 28px;
            letter-spacing: 6px;
            padding: 14px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(17, 17, 17, 0.12);
            font-weight: 700;
            text-align: center;
            min-width: 170px;
        }

        .otp-info {
            flex: 1 1 220px;
            color: #444;
            font-size: 14px;
        }

        .otp-info p {
            margin: 0 0 8px 0;
        }

        /* CTA */
        .cta {
            padding: 0 28px 22px 28px;
        }

        .btn {
            display: inline-block;
            padding: 12px 18px;
            border-radius: 10px;
            background: #111;
            color: #fff;
            font-weight: 600;
            font-size: 14px;
        }

        /* Footer */
        .footer {
            padding: 18px 28px 28px 28px;
            color: #888;
            font-size: 13px;
        }

        .socials {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .small {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
        }

        /* Mobile adjustments */
        @media (max-width:420px) {
            .otp-badge {
                font-size: 24px;
                min-width: 140px;
                padding: 12px 14px;
                letter-spacing: 5px;
            }

            .brand-name {
                font-size: 18px;
            }

            .hero h1 {
                font-size: 18px;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrap">
        <div class="email-body">
            <!-- Header / Brand -->
            <div class="brand">
                <!-- Replace src with your logo URL -->
                <img class="logo"
                    src="https://res.cloudinary.com/dzasuffhr/image/upload/v1763108559/Gemini_Generated_Image_hkuf7rhkuf7rhkuf_zzfris.png"
                    alt="Raahi logo" width="56" height="56" style="object-fit:cover; border-radius:10px;" />
                <div>
                    <div class="brand-name">Raahi</div>
                    <div style="font-size:12px; color:#777; margin-top:2px;">Raahi E-Commers</div>
                </div>
            </div>

            <!-- Hero -->
            <div class="hero">
                <h1>Hi ${userName}, your Raahi verification code</h1>
                <p> Do not share this code with anyone.</p>
            </div>

            <!-- OTP -->
            <div class="otp-wrap">
                <div class="otp-badge">${otp}</div> 
                <div class="otp-info">
                    <p><strong>Expires in:</strong> 5 minutes</p>
                </div>
            </div>

            <!-- Support / Promo snippet -->


            <!-- Footer -->
            <div class="footer">
                <div style="display:flex; flex-direction: column; justify-content:space-between; align-items:center; gap:12px; ">
                    <div>
                        <div style="font-weight:700; color:#111;">Raahi</div>
                        <div style="margin-top:6px; color:#888;">Haryana • India</div>
                    </div>
                    
                     
                </div>

                <div class="small">
                    <p style="margin:10px 0 0 0;">This email was sent to you for login verification. </p>
                          
                </div>
            </div>
        </div>
    </div>

    <!-- Plain-text fallback (for email clients that ignore HTML) -->
    <div
        style="display:none; white-space:nowrap; font-size:1px; color:#ffffff; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
        Your Raahi verification code: ${otp} — expires in 5 minutes.
    </div>
</body>

</html>
`;


export {otpEmailHtml};