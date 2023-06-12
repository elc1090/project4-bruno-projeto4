var buttonAddSugestao = document.getElementById("button-add-sugestao");
var buttonVoltar = document.getElementById("button-voltar");
var form = document.getElementById("form-sugestao");
var divDados = document.getElementById("div-dados-visita");

function toggleForm() {
    form.classList.toggle("hidden");
    divDados.classList.toggle("hidden");
}

async function carregaDadosVisita() {
    let idVisita = localStorage.getItem('idVisita');

    try {
        let response = await axiosApi.get(`visita/${idVisita}`);

        let dataVisita = new Date(response.data.data).toLocaleDateString('pt-BR');
        document.getElementById("fazenda-visita").innerHTML = response.data.nomefazenda;
        document.getElementById("data-visita").innerHTML = dataVisita;

        let htmlSugestoes = '';
        response.data.sugestoes.forEach((sugestao) => {
            htmlSugestoes += `<div class="w-100 border-b-2 pb-2 my-4">
            <span>
                ${sugestao.campo}
            </span>
            <button type"button" class="px-4 text-gray-500 underline rounded toggle-sugestao">Mostrar/esconder</button>
            <ul class="lista-sugestao hidden">
                <li class="ml-4 my-2">Area: ${sugestao.area ?? ''}</li>
                <li class="ml-4 my-2">Pastagem: ${sugestao.pastagem ?? ''}</li>
                <li class="ml-4 my-2">Altura: ${sugestao.altura ?? ''}</li>
                <li class="ml-4 my-2">Categoria: ${sugestao.categoria ?? ''}</li>
                <li class="ml-4 my-2">Cabecas: ${sugestao.cabecas ?? ''}</li>
                <li class="ml-4 my-2">Peso: ${sugestao.peso ?? ''}</li>
                <li class="ml-4 my-2">Carga: ${sugestao.carga ?? ''}</li>
                <li class="ml-4 my-2">CC: ${sugestao.cc ?? ''}</li>
                <li class="ml-4 my-2">Sanidade: ${sugestao.sanidade ?? ''}</li>
                <li class="ml-4 my-2">Sugestoes: ${sugestao.sugestoes ?? ''} </li>
            </ul>
        </div>`;
        });

        document.getElementById("div-sugestoes").innerHTML = htmlSugestoes;
    } catch(error) {
        console.log(error);
    }
}

divDados.addEventListener("click", (event) => {
    let parent = event.target.parentElement;
    
    if (event.target.type == 'submit') {
        let listaSugestao = parent.querySelector('.lista-sugestao');
        if (listaSugestao) {
            listaSugestao.classList.toggle("hidden");
        }
    }
});

buttonAddSugestao.addEventListener("click", () => {
    toggleForm();
});

buttonVoltar.addEventListener("click", () => {
    window.scrollTo(0,0);
    toggleForm();
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const campo = document.getElementById('campo').value;
    const area = document.getElementById('area').value;
    const pastagem = document.getElementById('pastagem').value;
    const altura = document.getElementById('altura').value;
    const categoria = document.getElementById('categoria').value;
    const cabecas = document.getElementById('cabeças').value;
    const peso = document.getElementById('peso').value;
    const carga = document.getElementById('carga').value;
    const cc = document.getElementById('cc').value;
    const sanidade = document.getElementById('sanidade').value;
    const sugestoes = document.getElementById('sugestoes').value;
    const visita_id = localStorage.getItem('idVisita');

    const data = {
        campo,
        area,
        pastagem,
        altura,
        categoria,
        cabecas,
        peso,
        carga,
        cc,
        sanidade,
        sugestoes,
        visita_id
    };

    axiosApi.post('sugestao_manejo', 
        data
    ).then((response) => {
        alert('Sugestão de manejo cadastrada com sucesso!');
        setTimeout(() => {
            window.location.href = 'visita.html';
        }, 1000);
    }).catch((error) => {
        console.log(error)
    });
});

var btn = document.querySelector("button.mobile-menu-button");
var menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

carregaDadosVisita();