export function performOperation(operation, num1, num2) {
    let answer = 0
    let operator = ""

    switch (operation) {
        case "add":
            operator = "+"
            answer = num1 + num2
            break
        case "subtract":
            operator = "-"
            answer = num1 - num2
            break
        case "multiply":
            operator = "×"
            answer = num1 * num2
            break
        case "divide":
            operator = "÷"
            answer = num2 !== 0 ? num1 / num2 : "Error (division by zero)"
            break
        default:
            operator = "?"
            answer = "Invalid operation"
            break
    }

    return { answer, operator }
}