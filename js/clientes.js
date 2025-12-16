const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

// 1. Carregar Lista de Clientes
async function carregarClientes() {
    try {
        const res = await fetch(`http://localhost:8081/clientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
            alert('Sessão expirada.');
            window.location.href = 'index.html';
            return;
        }

        const clientes = await res.json();
        preencherTabela(clientes);

    } catch (error) {
        console.error(error);
        document.getElementById('tabelaClientes').innerHTML = '<tr><td colspan="3">Erro ao carregar clientes.</td></tr>';
    }
}

// 2. Preencher HTML
function preencherTabela(clientes) {
    const tbody = document.getElementById('tabelaClientes');
    tbody.innerHTML = '';

    if (clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum cliente cadastrado.</td></tr>';
        return;
    }

    clientes.forEach(cli => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cli.nomeCliente}</td>
            <td>${cli.telefoneCliente}</td>
            <td style="text-align: center;">
                <button onclick="abrirModal('${cli.idCliente}', '${cli.nomeCliente}', '${cli.telefoneCliente}')" class="btn-primary" style="padding: 5px 10px; width: auto;" title="Editar">
                    <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">edit</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- LÓGICA DO MODAL ---

function abrirModal(id, nome, telefone) {
    // Preenche os campos do modal com os dados atuais
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editTelefone').value = telefone;
    
    // Mostra o modal
    document.getElementById('modalEditar').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalEditar').style.display = 'none';
}

// --- SALVAR EDIÇÃO (PUT) ---
document.getElementById('formEditar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const telefone = document.getElementById('editTelefone').value;

    const payload = {
        nomeCliente: nome,
        telefoneCliente: telefone
    };

    try {
        const res = await fetch(`http://localhost:8081/clientes/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Cliente atualizado com sucesso!');
            fecharModal();
            carregarClientes(); // Atualiza a lista
        } else {
            const erro = await res.json();
            alert('Erro: ' + (erro.erro || 'Falha ao atualizar'));
        }

    } catch (err) {
        console.error(err);
        alert('Erro de conexão.');
    }
});

// Inicia
carregarClientes();