/**
 * Formata um valor numérico para uma string de moeda em Reais (BRL).
 * Garante que o input seja tratado como um número.
 * @param {number | string} value - O valor a ser formatado.
 * @returns {string} O valor formatado como, por exemplo, "R$ 1.234,56".
 */
const formatCurrency = (value) => {
    const numericValue = parseFloat(value) || 0;
    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

// Exportamos a função para que outros arquivos possam importá-la e usá-la.
export { formatCurrency };