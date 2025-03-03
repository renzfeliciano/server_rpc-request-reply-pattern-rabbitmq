export const validateCalculationRequest = (req, res, next) => {
    const { operation, num1, num2 } = req.body;

    // Check if all required fields are present
    if (!operation || num1 === undefined || num2 === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate operation
    const validOperations = ["add", "subtract", "multiply", "divide"];
    if (!validOperations.includes(operation)) {
        return res
            .status(400)
            .json({
                error: "Invalid operation. Use add, subtract, multiply, or divide.",
            });
    }

    // Validate num1 and num2 are numbers
    if (typeof num1 !== "number" || typeof num2 !== "number") {
        return res.status(400).json({ error: "num1 and num2 must be numbers" });
    }

    // Validate division by zero
    if (operation === "divide" && num2 === 0) {
        return res.status(400).json({ error: "Cannot divide by zero" });
    }

    next(); // Proceed to the route handler
};
