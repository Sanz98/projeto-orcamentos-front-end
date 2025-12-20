checkLogin();

async function listarClientes() {
    const response = await fetchAuth('/clientes');
    if(response.ok) {
        const clientes = await response.json();
        const tbody = document.querySelector('#tabela-clientes tbody');
        
        clientes.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.nomeCliente}</td>
                <td>${c.telefoneCliente || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary">Editar</button> 
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}
listarClientes();