checkLogin();

document.getElementById('formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dados = {
        nomeCliente: document.getElementById('nomeCliente').value,
        telefoneCliente: document.getElementById('telefoneCliente').value
    };

    const response = await fetchAuth('/clientes', {
        method: 'POST',
        body: JSON.stringify(dados)
    });

    if(response.ok) {
        alert('Cliente cadastrado!');
        window.location.href = 'clientes.html';
    } else {
        const erro = await response.json();
        alert(erro.erro || 'Erro ao cadastrar');
    }
});