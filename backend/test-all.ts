// Script de Validacao Completa (End-to-End) do Backend
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startTests() {
  console.log("INICIANDO BATERIA DE TESTES DO BACKEND...\n");

  const BASE_URL = 'http://localhost:3000/api';
  let token = '';
  const emailExclusivo = `teste_${Date.now()}@test.com`; // Email aleatorio para nao dar conflito

  try {
    // ---------------------------------------------------------
    // 1. AUTHENTICATION
    // ---------------------------------------------------------
    console.log("Testando AUTH");

    // Registro
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Usuario Validador', email: emailExclusivo, password: 'senhaForte123' })
    });
    const regData = await regRes.json() as any;
    if (regRes.status !== 201) throw new Error(`Falha no Registro: ${JSON.stringify(regData)}`);
    console.log("   ✅ Registro de usuario OK");

    // Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailExclusivo, password: 'senhaForte123' })
    });
    const loginData = await loginRes.json() as any;
    if (!loginData.token) throw new Error("Token ausente no login");
    token = loginData.token;
    console.log("   ✅ Login e geracao de JWT OK");

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Minha Conta (ME)
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json() as any;
    if (!meData.email) throw new Error("Falha ao buscar perfil");
    console.log("   ✅ Leitura de perfil autenticado (/me) OK");


    // ---------------------------------------------------------
    // 2. CATEGORIES
    // ---------------------------------------------------------
    console.log("\nTestando CATEGORIAS");

    // Lista categorias padrao
    const catListRes = await fetch(`${BASE_URL}/categories`, { headers: authHeaders });
    const categorias = await catListRes.json() as any[];
    if (categorias.length < 10) throw new Error("Faltam categorias padrao no banco");
    console.log("   ✅ Listagem de Categorias OK");

    // Cria categoria personalizada
    const catCreateRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ name: 'Minha Categoria Unica' })
    });
    const catData = await catCreateRes.json() as any;
    if (!catData.id) throw new Error("Erro na criacao de categoria");
    console.log("   ✅ Criacao de Categorias OK");

    // Deleta categoria personalizada
    const catDelRes = await fetch(`${BASE_URL}/categories/${catData.id}`, { method: 'DELETE', headers: authHeaders });
    if (catDelRes.status !== 200) throw new Error("Erro ao deletar categoria");
    console.log("   ✅ Remocao de Categorias OK");


    // ---------------------------------------------------------
    // 3. TRANSACTIONS
    // ---------------------------------------------------------
    console.log("\nTestando TRANSACOES e CLASSIFICACAO AUTOMATICA");

    const trxCreateRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({
        type: 'EXPENSE',
        description: 'Gasolina para o carro', // Deve ir para 'Transporte' automaticamente
        amount: 150,
        date: new Date().toISOString()
      })
    });
    const trxData = await trxCreateRes.json() as any;
    if (!trxData.id) throw new Error(`Falha ao criar transacao: ${JSON.stringify(trxData)}`);
    if (trxData.category.name !== 'Transporte') throw new Error(`Classificacao automatica falhou. Esperava Transporte, veio: ${trxData.category?.name}`);
    console.log("   ✅ Criacao de Transacao OK");
    console.log("   ✅ Classificacao Automatica OK (Gasolina -> Transporte)");

    // Adicionando uma receita pra dar bom no Health Score
    await fetch(`${BASE_URL}/transactions`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ type: 'INCOME', description: 'Salario do mes', amount: 5000, date: new Date().toISOString() })
    });

    // Lista as transacoes
    const trxListRes = await fetch(`${BASE_URL}/transactions`, { headers: authHeaders });
    const transacoes = await trxListRes.json() as any[];
    if (transacoes.length !== 2) throw new Error("Erro na listagem de transacoes");
    console.log("   ✅ Listagem de Transacoes OK");


    // ---------------------------------------------------------
    // 4. GOALS
    // ---------------------------------------------------------
    console.log("\nTestando METAS (GOALS)");

    // Cria meta
    const goalRes = await fetch(`${BASE_URL}/goals`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ name: 'Viagem', targetAmount: 2000 })
    });
    const goalData = await goalRes.json() as any;
    if (!goalData.id) throw new Error("Erro na criacao de meta");
    console.log("   ✅ Criacao de Meta OK");

    // Edita meta
    const goalUpdRes = await fetch(`${BASE_URL}/goals/${goalData.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ savedAmount: 500 }) // Salvando 500 nela
    });
    const goalUpdData = await goalUpdRes.json() as any;
    if (Number(goalUpdData.savedAmount) !== 500) throw new Error("Erro na edicao de meta");
    console.log("   ✅ Edicao de Meta OK");


    // ---------------------------------------------------------
    // 5. ANALYTICS
    // ---------------------------------------------------------
    console.log("\nTestando ANALYTICS (Insights e Score)");

    const healthRes = await fetch(`${BASE_URL}/analytics/health-score`, { headers: authHeaders });
    const healthData = await healthRes.json() as any;
    if (healthData.score === undefined) throw new Error("Erro no calculo do Health Score");
    console.log(`   ✅ Health Score OK (Nota calculada: ${healthData.score} - ${healthData.nivel})`);

    const insRes = await fetch(`${BASE_URL}/analytics/insights`, { headers: authHeaders });
    const insData = await insRes.json() as any;
    if (!insData.categorias) throw new Error("Erro nos Insights");
    console.log(`   ✅ Insights OK (Maior gasto: ${insData.categorias[0]?.nome})`);


    // ---------------------------------------------------------
    // 6. GAMIFICATION (BADGES)
    // ---------------------------------------------------------
    console.log("\nTestando GAMIFICACAO");

    const badgesCheckRes = await fetch(`${BASE_URL}/badges/check`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ condition: 'first_transaction' })
    });
    const badgeData = await badgesCheckRes.json() as any;
    if (!badgeData.awarded) throw new Error("Deveria ter ganhado a medalha de primeira transacao");
    console.log(`   ✅ Medalhas Verificadas OK (Conquistou: ${badgeData.badge.name})`);

    const myBadgesRes = await fetch(`${BASE_URL}/badges/my-badges`, { headers: authHeaders });
    const myBadges = await myBadgesRes.json() as any[];
    if (myBadges.length === 0) throw new Error("Falha ao listar conquistas ganhas");
    console.log("   ✅ Listagem do quadro de trofeus OK");


    console.log("\n=======================================================");
    console.log("🏆 TODOS OS TESTES PASSARAM COM SUCESSO! 🏆");
    console.log("O Backend esta 100% validado e funcionando sem erros.");
    console.log("=======================================================\n");

  } catch (erro: any) {
    console.error("\n❌❌❌ ERRO GRAVE NO TESTE ENCONTRADO ❌❌❌");
    console.error(erro.message);
    process.exit(1);
  }
}

startTests();
