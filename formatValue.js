const formatValue = (value) => {
    const amountIndicators = ['', 'K', 'M', 'B', 'T']
    let thousandsCounter = 0;

    while (value > 1000) {
        value = Math.round(value / 10) / 100;
        thousandsCounter++;
    }
    value = Math.round(value * 100) / 100;

    return value.toString() + amountIndicators[thousandsCounter];
}

module.exports = formatValue;