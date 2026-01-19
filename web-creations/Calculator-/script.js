let display = '0';
let previousValue = null;
let operator = null;
let newNumber = true;

function updateDisplay() {
    document.getElementById('display').textContent = display;
}

function handleNumber(num) {
    if (newNumber) {
        display = num;
        newNumber = false;
    } else {
        display = display === '0' ? num : display + num;
    }
    updateDisplay();
}

function handleDecimal() {
    if (newNumber) {
        display = '0.';
        newNumber = false;
    } else if (!display.includes('.')) {
        display += '.';
    }
    updateDisplay();
}

function handleOperator(op) {
    const current = parseFloat(display);

    if (previousValue === null) {
        previousValue = current;
    } else if (operator && !newNumber) {
        const result = calculate(previousValue, current, operator);
        display = String(result);
        previousValue = result;
    }

    operator = op;
    newNumber = true;
    updateDisplay();
}

function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '×': return a * b;
        case '÷': return b !== 0 ? a / b : 0;
        default: return b;
    }
}

function handleEquals() {
    if (operator && previousValue !== null) {
        const current = parseFloat(display);
        const result = calculate(previousValue, current, operator);
        display = String(result);
        previousValue = null;
        operator = null;
        newNumber = true;
        updateDisplay();
    }
}

function handleClear() {
    display = '0';
    previousValue = null;
    operator = null;
    newNumber = true;
    updateDisplay();
}

function handlePlusMinus() {
    display = String(parseFloat(display) * -1);
    updateDisplay();
}

function handlePercent() {
    display = String(parseFloat(display) / 100);
    updateDisplay();
}
