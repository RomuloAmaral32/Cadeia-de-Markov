
/*
====================================================
 PROJETO: SIMULADOR DE CADEIA DE MARKOV
 ARQUIVO: markov.js

 Este arquivo contém a implementação matemática
 da Cadeia de Markov.
====================================================
*/


// ==================================================
// 1. ESTADOS DO SISTEMA
// ==================================================

const ESTADOS = [
    "Ensolarado",
    "Nublado",
    "Chuvoso"
];


// ==================================================
// 2. MATRIZ DE TRANSIÇÃO PADRÃO
// ==================================================

const MATRIZ_PADRAO = [
    [0.70, 0.20, 0.10],
    [0.30, 0.40, 0.30],
    [0.20, 0.30, 0.50]
];


// ==================================================
// 3. VALIDAÇÃO DA MATRIZ
// ==================================================

function validarMatriz(matriz) {

    if (!Array.isArray(matriz) || matriz.length !== 3) {
        throw new Error("A matriz precisa ter 3 linhas.");
    }

    for (let i = 0; i < 3; i++) {

        if (!Array.isArray(matriz[i]) || matriz[i].length !== 3) {
            throw new Error("Cada linha precisa ter 3 colunas.");
        }

        let soma = 0;

        for (let j = 0; j < 3; j++) {

            const valor = matriz[i][j];

            if (
                typeof valor !== "number" ||
                !Number.isFinite(valor) ||
                valor < 0 ||
                valor > 1
            ) {
                throw new Error(
                    "As probabilidades devem estar entre 0 e 1."
                );
            }

            soma += valor;
        }

        if (Math.abs(soma - 1) > 0.000001) {

            throw new Error(
                "Cada linha da matriz deve somar 1 (100%)."
            );

        }
    }

    return true;
}


// ==================================================
// 4. MULTIPLICAÇÃO DO VETOR PELA MATRIZ
// ==================================================

function calcularProximoEstado(vetorAtual, matriz) {

    const quantidadeEstados = matriz.length;

    const proximoVetor = new Array(quantidadeEstados).fill(0);

    /*
       Fórmula:

       V(n+1)[j] = soma de V(n)[i] * P[i][j]

       Cada elemento do novo vetor é calculado
       considerando todas as possibilidades de
       transição para aquele estado.
    */

    for (let j = 0; j < quantidadeEstados; j++) {

        for (let i = 0; i < quantidadeEstados; i++) {

            proximoVetor[j] +=
                vetorAtual[i] * matriz[i][j];

        }

    }

    return proximoVetor;
}


// ==================================================
// 5. EXECUÇÃO DA CADEIA DE MARKOV
// ==================================================

function executarCadeiaMarkov(
    estadoInicial,
    quantidadeDias,
    matriz
) {

    validarMatriz(matriz);

    if (
        !Number.isInteger(estadoInicial) ||
        estadoInicial < 0 ||
        estadoInicial >= ESTADOS.length
    ) {
        throw new Error("Estado inicial inválido.");
    }

    if (
        !Number.isInteger(quantidadeDias) ||
        quantidadeDias < 1 ||
        quantidadeDias > 365
    ) {
        throw new Error("Escolha entre 1 e 365 dias.");
    }

    /*
       O vetor inicial possui probabilidade 1
       no estado escolhido pelo usuário.

       Exemplo:
       Ensolarado = [1, 0, 0]
       Nublado    = [0, 1, 0]
       Chuvoso    = [0, 0, 1]
    */

    let vetorAtual = new Array(ESTADOS.length).fill(0);

    vetorAtual[estadoInicial] = 1;


    // Guarda os resultados de todos os dias.

    const historico = [];

    // Registra a condição inicial (dia 0).

    historico.push([...vetorAtual]);


    // Executa as transições de cada dia.

    for (let dia = 1; dia <= quantidadeDias; dia++) {

        vetorAtual = calcularProximoEstado(
            vetorAtual,
            matriz
        );

        historico.push([...vetorAtual]);

    }

    return historico;
}
