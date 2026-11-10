
/*
====================================================
 PROJETO: SIMULADOR DE CADEIA DE MARKOV
 ARQUIVO: app.js

 Responsável pela comunicação entre:
 HTML + ALGORITMO + GRÁFICOS
====================================================
*/


// ==================================================
// 1. ELEMENTOS DA INTERFACE
// ==================================================

const estadoInicialInput = document.getElementById("estadoInicial");

const quantidadeDiasInput = document.getElementById("quantidadeDias");

const btnSimular = document.getElementById("btnSimular");

const btnRestaurar = document.getElementById("btnRestaurar");

const mensagem = document.getElementById("mensagem");

const resultados = document.getElementById("resultados");

const corpoResultados = document.getElementById("corpoResultados");


// ==================================================
// 2. CONFIGURAÇÕES DO GRÁFICO
// ==================================================

let grafico = null;


// ==================================================
// 3. LEITURA DA MATRIZ DE TRANSIÇÃO
// ==================================================

function obterMatrizDaInterface() {

    const matriz = [];

    for (let i = 0; i < 3; i++) {

        const linha = [];

        for (let j = 0; j < 3; j++) {

            const campo = document.getElementById(`p${i}${j}`);

            const valor = campo.value.trim();

            if (valor === "") {
                throw new Error(
                    "Preencha todos os valores da matriz."
                );
            }

            const percentual = Number(valor);

            if (
                !Number.isFinite(percentual) ||
                percentual < 0 ||
                percentual > 100
            ) {
                throw new Error(
                    "Os valores da matriz devem estar entre 0 e 100."
                );
            }

            // Transforma percentual em probabilidade.
            linha.push(percentual / 100);

        }

        matriz.push(linha);

    }

    // Confere se cada linha soma 100%.

    validarMatriz(matriz);

    return matriz;
}


// ==================================================
// 4. FORMATAÇÃO DOS PERCENTUAIS
// ==================================================

function formatarPercentual(valor) {

    return (valor * 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "%";

}


// ==================================================
// 5. ATUALIZAÇÃO DOS RESULTADOS PRINCIPAIS
// ==================================================

function atualizarResumo(historico) {

    // Obtém o último dia calculado.

    const ultimoDia = historico[historico.length - 1];

    document.getElementById("resSol").textContent =
        formatarPercentual(ultimoDia[0]);

    document.getElementById("resNublado").textContent =
        formatarPercentual(ultimoDia[1]);

    document.getElementById("resChuva").textContent =
        formatarPercentual(ultimoDia[2]);

}


// ==================================================
// 6. CRIAÇÃO DA TABELA DE RESULTADOS
// ==================================================

function atualizarTabela(historico) {

    corpoResultados.innerHTML = "";

    historico.forEach((probabilidades, indice) => {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${indice === 0 ? "Hoje" : "Dia " + indice}</td>

            <td>${formatarPercentual(probabilidades[0])}</td>

            <td>${formatarPercentual(probabilidades[1])}</td>

            <td>${formatarPercentual(probabilidades[2])}</td>
        `;

        corpoResultados.appendChild(linha);

    });

}


// ==================================================
// 7. CONSTRUÇÃO DO GRÁFICO
// ==================================================

function atualizarGrafico(historico) {

    const canvas = document.getElementById("graficoMarkov");

    const labels = historico.map((_, indice) => {

        return indice === 0 ? "Hoje" : "Dia " + indice;

    });

    const dadosEnsolarado = historico.map(
        dia => dia[0] * 100
    );

    const dadosNublado = historico.map(
        dia => dia[1] * 100
    );

    const dadosChuvoso = historico.map(
        dia => dia[2] * 100
    );


    // Destrói o gráfico anterior antes de criar outro.

    if (grafico !== null) {

        grafico.destroy();

    }


    grafico = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [

                {
                    label: "Ensolarado",
                    data: dadosEnsolarado,
                    borderColor: "#eab308",
                    backgroundColor: "#eab308",
                    tension: 0.3,
                    borderWidth: 3
                },

                {
                    label: "Nublado",
                    data: dadosNublado,
                    borderColor: "#0ea5e9",
                    backgroundColor: "#0ea5e9",
                    tension: 0.3,
                    borderWidth: 3
                },

                {
                    label: "Chuvoso",
                    data: dadosChuvoso,
                    borderColor: "#6366f1",
                    backgroundColor: "#6366f1",
                    tension: 0.3,
                    borderWidth: 3
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    position: "bottom"
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return context.dataset.label + ": " +
                                context.parsed.y.toFixed(2) + "%";

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100,

                    title: {
                        display: true,
                        text: "Probabilidade (%)"
                    }

                },

                x: {

                    title: {
                        display: true,
                        text: "Evolução dos dias"
                    }

                }

            }

        }

    });

}


// ==================================================
// 8. MENSAGENS DO SISTEMA
// ==================================================

function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;

    mensagem.className = "message " + tipo;

}


// ==================================================
// 9. EXECUÇÃO DA SIMULAÇÃO
// ==================================================

function simular() {

    try {

        // Lê os dados informados pelo usuário.

        const estadoInicial = Number(estadoInicialInput.value);

        const quantidadeDias = Number(quantidadeDiasInput.value);

        const matriz = obterMatrizDaInterface();


        // Executa o algoritmo de Cadeia de Markov.

        const historico = executarCadeiaMarkov(
            estadoInicial,
            quantidadeDias,
            matriz
        );


        // Exibe os resultados.

        atualizarResumo(historico);

        atualizarTabela(historico);

        atualizarGrafico(historico);


        // Torna a área de resultados visível.

        resultados.classList.remove("hidden");


        mostrarMensagem(
            "Simulação executada com sucesso!",
            "success"
        );


        // Desloca a tela para os resultados.

        resultados.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (erro) {

        // Apresenta erros de preenchimento ou cálculo.

        resultados.classList.add("hidden");

        mostrarMensagem(
            erro.message,
            "error"
        );

    }

}


// ==================================================
// 10. RESTAURAR CONFIGURAÇÕES PADRÃO
// ==================================================

function restaurarValores() {

    const valoresPadrao = [
        [70, 20, 10],
        [30, 40, 30],
        [20, 30, 50]
    ];

    for (let i = 0; i < 3; i++) {

        for (let j = 0; j < 3; j++) {

            document.getElementById(`p${i}${j}`).value =
                valoresPadrao[i][j];

        }

    }

    estadoInicialInput.value = "0";

    quantidadeDiasInput.value = "7";

    resultados.classList.add("hidden");

    if (grafico !== null) {

        grafico.destroy();

        grafico = null;

    }

    mensagem.className = "message";

}


// ==================================================
// 11. EVENTOS DOS BOTÕES
// ==================================================

btnSimular.addEventListener("click", simular);

btnRestaurar.addEventListener("click", restaurarValores);


// ==================================================
// FIM DO SISTEMA
// ==================================================

