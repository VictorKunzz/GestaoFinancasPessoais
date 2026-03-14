import prisma from "../utils/prisma";

async function getHealthScore(userId: string) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const transacoesMes = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: inicioMes,
        lte: fimMes,
      },
    },
  });

  let totalReceitas = 0;
  let totalDespesas = 0;

  transacoesMes.forEach((t) => {
    const valor = Number(t.amount);
    if (t.type === "INCOME") {
      totalReceitas += valor;
    } else {
      totalDespesas += valor;
    }
  });

  if (totalReceitas === 0 && totalDespesas === 0) {
    return {
      score: 50,
      nivel: "Neutro",
      totalReceitas: 0,
      totalDespesas: 0,
      saldo: 0,
      percentualGasto: 0,
      mensagem: "Sem transacoes neste mes. Comece registrando suas receitas e despesas!",
    };
  }

  const saldo = totalReceitas - totalDespesas;
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
    mensagem = "Parabens! Voce esta gastando bem menos do que ganha. Continue assim!";
  } else if (score >= 60) {
    nivel = "Bom";
    mensagem = "Voce esta no caminho certo, mas pode melhorar. Tente reduzir alguns gastos.";
  } else if (score >= 40) {
    nivel = "Regular";
    mensagem = "Cuidado! Seus gastos estao chegando perto da sua renda. Revise seus habitos.";
  } else {
    nivel = "Critico";
    mensagem = "Atencao! Voce esta gastando mais do que ganha. Reduza despesas urgentemente.";
  }

  return {
    score,
    nivel,
    totalReceitas,
    totalDespesas,
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

  if (categoriasComPercentual.length > 0) {
    const maiorGasto = categoriasComPercentual[0];
    dicas.push(`Sua maior categoria de gasto e "${maiorGasto.nome}" com ${maiorGasto.percentual}% do total.`);
  }

  if (categoriasComPercentual.length >= 3) {
    dicas.push(`Voce tem gastos em ${categoriasComPercentual.length} categorias diferentes este mes.`);
  }

  if (totalGasto === 0) {
    dicas.push("Nenhuma despesa registrada neste mes.");
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
      previsaoSaldo: 0,
      mensagem: "Sem dados suficientes para fazer uma previsao. Continue registrando!",
    };
  }

  let totalReceitas = 0;
  let totalDespesas = 0;

  transacoes.forEach((t) => {
    const valor = Number(t.amount);
    if (t.type === "INCOME") {
      totalReceitas += valor;
    } else {
      totalDespesas += valor;
    }
  });

  const mesesComDados = 3;
  const mediaReceita = totalReceitas / mesesComDados;
  const mediaDespesa = totalDespesas / mesesComDados;
  const mediaSaldo = mediaReceita - mediaDespesa;

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
    previsaoSaldo: Math.round(mediaSaldo * 100) / 100,
    mensagem,
  };
}

export default { getHealthScore, getInsights, getBalanceForecast };
