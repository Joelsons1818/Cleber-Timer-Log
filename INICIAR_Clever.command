#!/bin/bash
# Script para iniciar o Clever Dripper Timer (V2 - Com Log)
# Autor: Antigravity

# 1. Navegar para a pasta do script
cd "$(dirname "$0")"

# 2. Configurar a porta (vamos usar 5175 para não conflitar com o V60 ou Clever 1)
PORT=5175

# Limpar processo antigo nessa porta, se houver
PID=$(lsof -ti :$PORT)
if [ ! -z "$PID" ]; then
  echo "Encerrando processo antigo na porta $PORT..."
  kill -9 $PID
fi

# 3. Iniciar o servidor em background
# Usamos 'nohup' para o servidor continuar rodando mesmo se o terminal fechar
echo "Iniciando Clever Timer (Com Log)..."
nohup npm run dev -- --port $PORT > /dev/null 2>&1 &

# 4. Aguardar um pouco para o servidor subir
sleep 2

# 5. Abrir o navegador
echo "Abrindo navegador..."
open "http://localhost:$PORT"

# 6. Fechar a janela do terminal (Opcional, mas elegante)
osascript -e 'tell application "Terminal" to close first window' & exit
