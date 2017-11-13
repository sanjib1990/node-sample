import mailer from "nodemailer";
import Logger from "./Logger.js";

/**
 * Mailer class.
 */
export default class Mailer {
    /**
     * Constructon Mailer
     */
    constructor () {
        this.logger = new Logger();
        this.transporter = this.getTransporter()
    }

    /**
     * Send Email.
     *
     * @param subject
     * @param content
     * @param receivers
     */
    send (subject, content, receivers) {
        let mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: receivers,
            subject: subject,
            text: content
        };

        this.transporter.sendMail(mailOptions, (err) => {
            if (err) this.logger.log("ERROR WHILE SENDING EMAIL", err);
        });
    }

    /**
     * Get the transporter instance for mailing.
     * if the instance is already created return the already created instance
     * Singleton
     *
     * @param force
     * @returns {*}
     */
    getTransporter(force = false) {
        if (this.transporter && ! force) return this.transporter;

        return mailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }
}
