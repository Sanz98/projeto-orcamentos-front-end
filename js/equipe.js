const token = localStorage.getItem('token');
const perfil = localStorage.getItem('perfil');

// Segurança no Front: Se não for gerente, chuta para fora
if (!token || (perfil && perfil.toLowerCase() !== 'gerente')) {
    alert('Acesso restrito apenas a gerentes.');
    window.location.href = 'dashboard.html';
}

// 1. Carregar Lista de Vendedores
async function carregarEquipe() {
    try {
        const res = await fetch(`${API_URL}/vendedores`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(!res.ok) throw new Error('Falha ao buscar equipe');

        const usuarios = await res.json();
        
        const tbody = document.getElementById('tabelaVendedores');
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            
            let botoesAcao = '';

            // Lógica dos botões:
            // Gerente não pode se excluir/editar por aqui para evitar "suicídio" da conta admin principal
            // Mas pode editar/excluir outros gerentes se houver, ou vendedores.
            
            // Vamos simplificar: Permite editar qualquer um (menos a si mesmo se quiser travar no back)
            // Permite excluir apenas se não for perfil 'gerente' (ou regra que preferir)
            
            const btnEditar = `
                <button onclick="abrirModal('${u.idUsuario}', '${u.nome}', '${u.email}')" class="btn-primary" style="padding: 5px 10px; width: auto; margin-right: 5px;" title="Editar">
                    <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">edit</span>
                </button>
            `;

            const btnExcluir = `
                <button onclick="deletarVendedor('${u.idUsuario}')" class="btn-danger" style="padding: 5px 10px; width: auto;" title="Excluir">
                    <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">delete</span>
                </button>
            `;

            if (u.perfil === 'gerente') {
                botoesAcao = '<span style="color: #666; font-size: 0.8rem;">(Gerente)</span>'; 
                // Se quiser permitir editar gerente, descomente a linha abaixo:
                // botoesAcao = btnEditar; 
            } else {
                botoesAcao = btnEditar + btnExcluir;
            }

            tr.innerHTML = `
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td><span class="status-badge" style="background: #e2e6ea; color: #333;">${u.perfil}</span></td>
                <td style="text-align: center; white-space: nowrap;">${botoesAcao}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { 
        console.error(err); 
        document.getElementById('tabelaVendedores').innerHTML = '<tr><td colspan="4" style="text-align: center;">Erro ao carregar lista.</td></tr>';
    }
}

// 2. Criar Novo Vendedor
document.getElementById('formVendedor').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const novoVendedor = {
        nome: document.getElementById('nomeVend').value,
        email: document.getElementById('emailVend').value,
        senha: document.getElementById('senhaVend').value,
        perfil: 'vendedor' 
    };

    try {
        const res = await fetch(`${API_URL}/registrar/vendedor`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(novoVendedor)
        });

        if(res.ok) {
            alert('Vendedor cadastrado com sucesso!');
            document.getElementById('formVendedor').reset(); 
            carregarEquipe(); 
        } else {
            const erro = await res.json();
            alert('Erro: ' + (erro.erro || 'Falha ao criar'));
        }
    } catch(err) { alert('Erro de conexão com servidor.'); }
});

// 3. Deletar Vendedor
async function deletarVendedor(id) {
    if(confirm('Tem certeza que deseja remover este vendedor?')) {
        try {
            const res = await fetch(`${API_URL}/deletar/vendedores/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(res.ok) {
                alert('Vendedor removido.');
                carregarEquipe();
            } else {
                const erro = await res.json();
                alert('Erro: ' + (erro.erro || 'Não foi possível remover.'));
            }
        } catch(err) { alert('Erro ao tentar deletar.'); }
    }
}

// --- MODAL DE EDIÇÃO ---

function abrirModal(id, nome, email) {
    document.getElementById('editId').value = id;
    document.getElementById('editNome').value = nome;
    document.getElementById('editEmail').value = email;
    document.getElementById('modalEditar').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalEditar').style.display = 'none';
}

// 4. Salvar Edição (PUT)
document.getElementById('formEditar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const email = document.getElementById('editEmail').value;

    const payload = { nome, email };

    try {
        const res = await fetch(`${API_URL}/atualizar/vendedores/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Vendedor atualizado com sucesso!');
            fecharModal();
            carregarEquipe(); // Atualiza a tabela
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
carregarEquipe();