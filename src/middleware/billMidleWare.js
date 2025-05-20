// Import Joi for input validation
import Joi from 'joi'
// Import controller functions for different vending operations (electricity, VTU, data, TV)
// Defined a validation schema for the user input
const validationSchema = Joi.object({
    orderId: Joi.string(),
    meter: Joi.string(),
    disco: Joi.string(),
    phone: Joi.string(),
    vendType: Joi.string(),
    amount: Joi.number(),
    tariffClass: Joi.string(),
    vertical: Joi.string(),
    paymentType: Joi.string(),
    email: Joi.string(),
    name: Joi.string(),
    narration: Joi.string(),
});

async function valiVends(req, res, next) {

    try {

        // return res.status(401).json({ status: false, data: null, message: "Service not available at the moment, please try again later" });
        // Collect user input from the request body
        let requestData;
        const { vertical } = req.body;

        if (vertical.toLowerCase() == "electricity") {

            requestData = {
                orderId: req.body.orderId,
                vendType: req.body.vendType,
                amount: req.body.amount,
                phone: req.body.phone,
                meter: req.body.meter,
                disco: req.body.disco,
                vertical: req.body.vertical,
                email: req.body.email,
                name: req.body.name,
                narration: req.body.narration,
                paymentType: "B2B",
            };

        } else if (vertical.toLowerCase() == "vtu") {
            requestData = {
                amount: req.body.amount,
                phone: req.body.phone,
                meter: req.body.meter,
                disco: req.body.disco,
                vendType: "PREPAID",
                vertical: req.body.vertical,
                email: req.body.email,
                name: req.body.name,
                narration: req.body.narration,
                paymentType: "B2B",
            };
        } else if (vertical.toLowerCase() == "data") {
            requestData = {
                meter: req.body.meter,
                disco: req.body.disco,
                tariffClass: req.body.tariffClass,
                phone: req.body.phone,
                vendType: "PREPAID",
                paymentType: "B2B",
                vertical: req.body.vertical,
                narration: req.body.narration,
                amount: req.body.amount,
                email: req.body.email,
                name: req.body.name,
            };
        } else {
            requestData = {
                orderId: req.body.orderId,
                meter: req.body.meter,
                disco: req.body.disco,
                tariffClass: req.body.tariffClass,
                phone: req.body.phone,
                paymentType: "B2B",
                vendType: "PREPAID",
                vertical: req.body.vertical,
                narration: req.body.narration,
                amount: req.body.amount,
                email: req.body.email,
                name: req.body.name,
            };
        }

        const { error } = validationSchema.validate(requestData);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }
        next()
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

export default valiVends;