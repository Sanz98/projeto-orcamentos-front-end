checkLogin();

async function carregarOrcamentos() {
    const response = await fetchAuth('/orcamentos');
    if (response.ok) {
        const orcamentos = await response.json();
        const tbody = document.querySelector('#tabela-orcamentos tbody');
        tbody.innerHTML = '';

        orcamentos.forEach(orc => {
            const tr = document.createElement('tr');
            
            // Formatando Status com cores
            let statusClass = 'status-pendente';
            if(orc.status === 'Aprovado') statusClass = 'status-aprovado';
            if(orc.status === 'Rejeitado') statusClass = 'status-rejeitado';

            tr.innerHTML = `
                <td>${orc.nomeCliente}</td>
                <td><span class="status-badge ${statusClass}">${orc.status}</span></td>
                <td>R$ ${parseFloat(orc.valorTotal).toFixed(2)}</td>
                <td>${new Date(orc.dataCriacao).toLocaleDateString()}</td>
                <td>
                    <a href="detalhes.html?id=${orc.idOrcamento}" class="btn btn-sm btn-primary">Ver</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function logout() {
    localStorage.removeItem('usuario');
    // Idealmente chamar endpoint de logout do back se existir
    window.location.href = 'index.html';
}

carregarOrcamentos();