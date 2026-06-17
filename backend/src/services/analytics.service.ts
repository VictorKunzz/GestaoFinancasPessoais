import prisma from "../utils/prisma";

async function getHealthScore(userId: string) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // goalId: null exclui aportes de meta — eles contam como economia, nao despesa
  const transacoesMes = await prisma.transaction.findMany({
    where: {
      userId,
      goalId: null,
      date: {
        gte: inicioMes,
        lte: fimMes,
      },
    },
  });

  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalInvestimentos = 0;

  transacoesMes.forEach((t) => {
    const valor = Number(t.amount);
    if (t.type === "INCOME") {
      totalReceitas += valor;
    } else if (t.type === "INVESTMENT") {
      totalInvestimentos += valor;
    } else if (t.type === "EXPENSE") {
      totalDespesas += valor;
    }
  });

  if (totalReceitas === 0 && totalDespesas === 0 && totalInvestimentos === 0) {
    return {
      score: 50,
      nivel: "Neutro",
      totalReceitas: 0,
      totalDespesas: 0,
      totalInvestimentos: 0,
      saldo: 0,
      percentualGasto: 0,
      mensagem: "Sem transações neste mês. Comece registrando suas receitas e despesas!",
    };
  }

  // Investimentos reduzem o saldo disponivel (dinheiro alocado), mas nao penalizam o score de gastos
  const saldo = totalReceitas - totalDespesas - totalInvestimentos;
  const percentualGasto = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 100;

  let score = 0;

  if (percentualGasto <= 50) {
    score = 100;
  } else if (percentualGasto <= 70) {
    score = 80;
  } else if (percentualGasto <= 85) {
    score = 60;
  } else if (percentualGasto <= 100) {
    score = 40;
  } else {
    score = 20;
  }

  const metas = await prisma.goal.findMany({
    where: { userId },
  });

  if (metas.length > 0) {
    const metasComProgresso = metas.filter((m) => Number(m.savedAmount) > 0);
    if (metasComProgresso.length > 0) {
      score = Math.min(100, score + 5);
    }
  }

  let nivel = "";
  let mensagem = "";

  if (score >= 80) {
    nivel = "Excelente";
    mensagem = "Parabéns! Você está gastando bem menos do que ganha. Continue assim!";
  } else if (score >= 60) {
    nivel = "Bom";
    mensagem = "Você está no caminho certo, mas pode melhorar. Tente reduzir alguns gastos.";
  } else if (score >= 40) {
    nivel = "Regular";
    mensagem = "Cuidado! Seus gastos estão chegando perto da sua renda. Revise seus hábitos.";
  } else {
    nivel = "Crítico";
    mensagem = "Atenção! Você está gastando mais do que ganha. Reduza despesas urgentemente.";
  }

  return {
    score,
    nivel,
    totalReceitas,
    totalDespesas,
    totalInvestimentos,
    saldo,
    percentualGasto: Math.round(percentualGasto),
    mensagem,
  };
}

async function getInsights(userId: string) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const despesasMes = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      goalId: null,
      date: {
        gte: inicioMes,
        lte: fimMes,
      },
    },
    include: { category: true },
  });

  const gastosPorCategoria: Record<string, { nome: string; total: number; quantidade: number }> = {};

  despesasMes.forEach((t) => {
    const catId = t.categoryId;
    const valor = Number(t.amount);

    if (!gastosPorCategoria[catId]) {
      gastosPorCategoria[catId] = {
        nome: t.category.name,
        total: 0,
        quantidade: 0,
      };
    }

    gastosPorCategoria[catId].total += valor;
    gastosPorCategoria[catId].quantidade += 1;
  });

  const categorias = Object.values(gastosPorCategoria)
    .sort((a, b) => b.total - a.total);

  const totalGasto = categorias.reduce((sum, c) => sum + c.total, 0);

  const categoriasComPercentual = categorias.map((c) => ({
    ...c,
    total: Math.round(c.total * 100) / 100,
    percentual: totalGasto > 0 ? Math.round((c.total / totalGasto) * 100) : 0,
  }));

  const dicas: string[] = [];

  const maiorGasto = categoriasComPercentual[0];
  if (maiorGasto) {
    dicas.push(`Sua maior categoria de gasto é "${maiorGasto.nome}" com ${maiorGasto.percentual}% do total.`);
  }

  if (categoriasComPercentual.length >= 3) {
    dicas.push(`Você tem gastos em ${categoriasComPercentual.length} categorias diferentes este mês.`);
  }

  if (totalGasto === 0) {
    dicas.push("Nenhuma despesa registrada neste mês.");
  }

  return {
    mes: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`,
    totalGasto: Math.round(totalGasto * 100) / 100,
    categorias: categoriasComPercentual,
    dicas,
  };
}

async function getBalanceForecast(userId: string) {
  const hoje = new Date();

  const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);

  const transacoes = await prisma.transaction.findMany({
    where: {
      userId,
      goalId: null,
      date: {
        gte: tresMesesAtras,
        lte: hoje,
      },
    },
  });

  if (transacoes.length === 0) {
    return {
      previsaoReceita: 0,
      previsaoDespesa: 0,
      previsaoInvestimento: 0,
      previsaoSaldo: 0,
      mensagem: "Sem dados suficientes para fazer uma previsão. Continue registrando!",
    };
  }

  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalInvestimentos = 0;

  transacoes.forEach((t) => {
    const valor = Number(t.amount);
    if (t.type === "INCOME") {
      totalReceitas += valor;
    } else if (t.type === "INVESTMENT") {
      totalInvestimentos += valor;
    } else if (t.type === "EXPENSE") {
      totalDespesas += valor;
    }
  });

  const mesesComDados = 3;
  const mediaReceita = totalReceitas / mesesComDados;
  const mediaDespesa = totalDespesas / mesesComDados;
  const mediaInvestimento = totalInvestimentos / mesesComDados;
  // Investimentos sao deduzidos do saldo previsto (dinheiro que sai do disponivel)
  const mediaSaldo = mediaReceita - mediaDespesa - mediaInvestimento;

  let mensagem = "";

  if (mediaSaldo > 0) {
    mensagem = `Na media, voce economiza R$ ${mediaSaldo.toFixed(2)} por mes. Continue assim!`;
  } else if (mediaSaldo === 0) {
    mensagem = "Na media, voce gasta exatamente o que ganha. Tente economizar um pouco.";
  } else {
    mensagem = `Cuidado! Na media, voce gasta R$ ${Math.abs(mediaSaldo).toFixed(2)} a mais do que ganha por mes.`;
  }

  return {
    previsaoReceita: Math.round(mediaReceita * 100) / 100,
    previsaoDespesa: Math.round(mediaDespesa * 100) / 100,
    previsaoInvestimento: Math.round(mediaInvestimento * 100) / 100,
    previsaoSaldo: Math.round(mediaSaldo * 100) / 100,
    mensagem,
  };
}

const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Serie mensal (ultimos N meses) de receitas, despesas e saldo — alimenta o grafico de fluxo de caixa.
async function getCashflow(userId: string, meses = 6) {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const transacoes = await prisma.transaction.findMany({
    where: { userId, goalId: null, date: { gte: inicio, lte: fim } },
    select: { type: true, amount: true, date: true },
  });

  const buckets: Record<string, { receitas: number; despesas: number; investimentos: number }> = {};
  for (let i = 0; i < meses; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1) + i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[chave] = { receitas: 0, despesas: 0, investimentos: 0 };
  }

  transacoes.forEach((t) => {
    const d = new Date(t.date);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets[chave];
    if (!bucket) return;
    const valor = Number(t.amount);
    if (t.type === "INCOME") {
      bucket.receitas += valor;
    } else if (t.type === "INVESTMENT") {
      bucket.investimentos += valor;
    } else if (t.type === "EXPENSE") {
      bucket.despesas += valor;
    }
  });

  const serie = Object.entries(buckets).map(([chave, v]) => {
    const mesIndex = Number(chave.split("-")[1]) - 1;
    return {
      mes: chave,
      label: MESES_CURTOS[mesIndex] ?? chave,
      receitas: Math.round(v.receitas * 100) / 100,
      despesas: Math.round(v.despesas * 100) / 100,
      investimentos: Math.round(v.investimentos * 100) / 100,
      saldo: Math.round((v.receitas - v.despesas - v.investimentos) * 100) / 100,
    };
  });

  return { meses: serie };
}

// Comparativo do mes atual vs. media dos 3 meses anteriores (RF08).
async function getMonthlyComparison(userId: string) {
  const hoje = new Date();
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
  const inicioAnteriores = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
  const fimAnteriores = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59);

  const [despesasMes, despesasAnteriores] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: "EXPENSE", goalId: null, date: { gte: inicioMesAtual, lte: fimMesAtual } },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: "EXPENSE", goalId: null, date: { gte: inicioAnteriores, lte: fimAnteriores } },
    }),
  ]);

  const gastoMesAtual = Number(despesasMes._sum.amount ?? 0);
  const mediaAnterior = Number(despesasAnteriores._sum.amount ?? 0) / 3;

  let variacaoPercentual = 0;
  if (mediaAnterior > 0) {
    variacaoPercentual = Math.round(((gastoMesAtual - mediaAnterior) / mediaAnterior) * 100);
  }

  let tendencia: "alta" | "baixa" | "estavel" = "estavel";
  let mensagem = "";

  if (mediaAnterior === 0) {
    mensagem = "Ainda nao ha historico suficiente para comparar seus gastos.";
  } else if (variacaoPercentual > 5) {
    tendencia = "alta";
    mensagem = `Voce gastou ${variacaoPercentual}% a mais que a sua media dos ultimos 3 meses.`;
  } else if (variacaoPercentual < -5) {
    tendencia = "baixa";
    mensagem = `Parabens! Voce gastou ${Math.abs(variacaoPercentual)}% a menos que a sua media dos ultimos 3 meses.`;
  } else {
    mensagem = "Seus gastos estao em linha com a media dos ultimos 3 meses.";
  }

  return {
    gastoMesAtual: Math.round(gastoMesAtual * 100) / 100,
    mediaAnterior: Math.round(mediaAnterior * 100) / 100,
    variacaoPercentual,
    tendencia,
    mensagem,
  };
}

export default { getHealthScore, getInsights, getBalanceForecast, getCashflow, getMonthlyComparison };
