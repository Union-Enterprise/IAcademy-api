exports.validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let primeiroDigitoVerificador = 11 - (soma % 11);
    if (primeiroDigitoVerificador >= 10) primeiroDigitoVerificador = 0;
    if (primeiroDigitoVerificador != parseInt(cpf.charAt(9))) {
        return false;
    }
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let segundoDigitoVerificador = 11 - (soma % 11);
    if (segundoDigitoVerificador >= 10) segundoDigitoVerificador = 0;
    if (segundoDigitoVerificador != parseInt(cpf.charAt(10))) {
        return false;
    }
    return true;
}
