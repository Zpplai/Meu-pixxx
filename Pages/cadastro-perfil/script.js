// Navegação do Passo 1 para o 2
window.validarP1 = function() {
    const nome = document.getElementById('setup-nome').value.trim();
    if(!nome) {
        document.getElementById('err-nome').style.display='block';
    } else {
        document.getElementById('err-nome').style.display='none';
        document.getElementById('s1').classList.remove('active');
        document.getElementById('s2').classList.add('active');
        document.getElementById('bar').style.width = '66%';
        document.getElementById('step-text').innerText = 'Passo 2/3';
    }
}

// Navegação do Passo 2 para o 3
window.validarP2 = function() {
    const idade = document.getElementById('setup-idade').value;
    if(idade < 18) {
        document.getElementById('err-idade').style.display='block';
    } else {
        document.getElementById('err-idade').style.display='none';
        document.getElementById('s2').classList.remove('active');
        document.getElementById('s3').classList.add('active');
        document.getElementById('bar').style.width = '100%';
        document.getElementById('step-text').innerText = 'Passo 3/3';
    }
}

// Limpa o input quando troca o tipo de chave
window.limparChave = function() {
    const input = document.getElementById('setup-pix-chave');
    const tipo = document.getElementById('setup-pix-tipo').value;
    input.value = "";
    input.placeholder = (tipo === "CPF") ? "000.000.000-00" : (tipo === "Telefone") ? "00-000000000" : "Digite sua chave";
}

// Máscara automática para CPF e Telefone
document.getElementById('setup-pix-chave').addEventListener('input', (e) => {
    const tipo = document.getElementById('setup-pix-tipo').value;
    if (tipo === "CPF" || tipo === "Telefone") {
        let v = e.target.value.replace(/\D/g, "");
        if (tipo === "CPF") {
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else {
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{2})(\d)/, "$1-$2");
        }
        e.target.value = v;
    }
});
