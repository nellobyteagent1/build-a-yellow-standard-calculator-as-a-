(() => {
  const display = document.getElementById('result');
  const expr = document.getElementById('expression');

  let current = '0';
  let previous = '';
  let operator = null;
  let shouldReset = false;

  function formatNumber(n) {
    if (n === 'Error') return 'Error';
    const num = parseFloat(n);
    if (isNaN(num)) return '0';
    if (n.includes('.') && !n.includes('e')) {
      const parts = n.split('.');
      return Number(parts[0]).toLocaleString('en-US') + '.' + parts[1];
    }
    if (Math.abs(num) > 999999999999) return num.toExponential(4);
    return num.toLocaleString('en-US', { maximumFractionDigits: 12 });
  }

  function updateDisplay() {
    display.textContent = formatNumber(current);
  }

  function getOperatorSymbol(op) {
    const symbols = { add: '+', subtract: '\u2212', multiply: '\u00d7', divide: '\u00f7' };
    return symbols[op] || '';
  }

  function inputDigit(d) {
    if (shouldReset) {
      current = d;
      shouldReset = false;
    } else {
      if (current.replace('-', '').replace('.', '').length >= 15) return;
      current = current === '0' ? d : current + d;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldReset) {
      current = '0.';
      shouldReset = false;
      updateDisplay();
      return;
    }
    if (!current.includes('.')) {
      current += '.';
    }
    updateDisplay();
  }

  function calculate(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (isNaN(x) || isNaN(y)) return 'Error';
    switch (op) {
      case 'add': return x + y;
      case 'subtract': return x - y;
      case 'multiply': return x * y;
      case 'divide': return y === 0 ? 'Error' : x / y;
      default: return y;
    }
  }

  function handleOperator(op) {
    const val = current;
    if (operator && !shouldReset) {
      const result = calculate(previous, val, operator);
      if (result === 'Error') {
        current = 'Error';
        previous = '';
        operator = null;
        expr.textContent = '';
        updateDisplay();
        shouldReset = true;
        return;
      }
      current = String(result);
      previous = current;
    } else {
      previous = val;
    }
    operator = op;
    shouldReset = true;
    expr.textContent = formatNumber(previous) + ' ' + getOperatorSymbol(op);
    updateDisplay();
    highlightOperator(op);
  }

  function handleEquals() {
    if (!operator) return;
    const result = calculate(previous, current, operator);
    expr.textContent = formatNumber(previous) + ' ' + getOperatorSymbol(operator) + ' ' + formatNumber(current) + ' =';
    current = result === 'Error' ? 'Error' : String(result);
    previous = '';
    operator = null;
    shouldReset = true;
    updateDisplay();
    clearOperatorHighlight();
  }

  function handlePercent() {
    const val = parseFloat(current);
    if (isNaN(val)) return;
    if (operator && (operator === 'add' || operator === 'subtract')) {
      current = String(parseFloat(previous) * val / 100);
    } else {
      current = String(val / 100);
    }
    updateDisplay();
  }

  function handleClear() {
    current = '0';
    previous = '';
    operator = null;
    shouldReset = false;
    expr.textContent = '';
    updateDisplay();
    clearOperatorHighlight();
  }

  function handleBackspace() {
    if (shouldReset || current === 'Error') {
      handleClear();
      return;
    }
    current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay();
  }

  function highlightOperator(op) {
    clearOperatorHighlight();
    const btn = document.querySelector(`[data-action="${op}"]`);
    if (btn) btn.classList.add('active');
  }

  function clearOperatorHighlight() {
    document.querySelectorAll('.btn.operator').forEach(b => b.classList.remove('active'));
  }

  // Mouse/touch
  document.querySelector('.buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    if (current === 'Error' && !['clear'].includes(btn.dataset.action)) {
      handleClear();
    }
    if (btn.dataset.value) {
      inputDigit(btn.dataset.value);
      clearOperatorHighlight();
    } else {
      switch (btn.dataset.action) {
        case 'clear': handleClear(); break;
        case 'backspace': handleBackspace(); break;
        case 'percent': handlePercent(); break;
        case 'decimal': inputDecimal(); clearOperatorHighlight(); break;
        case 'equals': handleEquals(); break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          handleOperator(btn.dataset.action);
          break;
      }
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
      clearOperatorHighlight();
    } else if (e.key === '.') {
      inputDecimal();
      clearOperatorHighlight();
    } else if (e.key === '+') handleOperator('add');
    else if (e.key === '-') handleOperator('subtract');
    else if (e.key === '*') handleOperator('multiply');
    else if (e.key === '/') { e.preventDefault(); handleOperator('divide'); }
    else if (e.key === '%') handlePercent();
    else if (e.key === 'Enter' || e.key === '=') handleEquals();
    else if (e.key === 'Backspace') handleBackspace();
    else if (e.key === 'Escape' || e.key === 'Delete') handleClear();
  });

  updateDisplay();
})();
