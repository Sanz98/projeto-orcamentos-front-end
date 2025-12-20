checkLogin();

// O arquivo API diz que a rota é GET /vendedores e POST /registrar/vendedor
// e DELETE /deletar/vendedores/:id

async function carregarEquipe() {
    const response = await fetchAuth('/vendedores');
    
    if(response.status === 403) {
        alert('Acesso negado: Apenas gerentes.');
        window.location.href = 'dashboard.html';
        return;
    }

    if(response.ok) {
        const usuarios = await response.json();
        const tbody = document.querySelector('#tabela-equipe tbody');
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td><span class="status-badge status-pendente">${u.perfil}</span></td>
                <td>
                    <button class="btn btn-danger" onclick="deletarUsuario('${u.idUsuario}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

document.getElementById('formVendedor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nome: document.getElementById('novoNome').value,
        email: document.getElementById('novoEmail').value,
        senha: document.getElementById('novaSenha').value
    };

    // Rota conforme PDF: POST /registrar/vendedor
    const response = await fetchAuth('/registrar/vendedor', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if(response.ok) {
        alert('Vendedor cadastrado!');
        document.getElementById('formVendedor').reset();
        carregarEquipe();
    } else {
        const erro = await response.json();
        alert('Erro: ' + erro.erro);
    }
});

window.deletarUsuario = async (id) => {
    if(confirm('Tem certeza?')) {
        // Rota conforme PDF: DELETE /deletar/vendedores/:id
        const response = await fetchAuth(`/deletar/vendedores/${id}`, {
            method: 'DELETE'
        });
        if(response.ok) {
            carregarEquipe();
        } else {
            alert('Erro ao deletar.');
        }
    }
}

carregarEquipe();