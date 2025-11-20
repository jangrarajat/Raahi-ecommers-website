import twilio from 'twilio';


const otpSender = async ({num , msg}) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        // Client initialize karein
        const client = twilio(accountSid, authToken);

        console.log("⏳ SMS bhejne ki tayari ho rahi hai...");

        // 3. Await ka use karein taaki error pakad sakein
        const message = await client.messages.create({
            body: msg,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: num  // Yahan 'process.env.number' ki jagah 'number' variable aayega
        });

        console.log("✅ Badhai ho! Message chala gaya. SID:", message.sid);
    } catch (error) {
        console.log(error.message)
        throw error
    }
}

export { otpSender };