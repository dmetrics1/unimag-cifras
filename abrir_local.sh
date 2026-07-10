#!/usr/bin/env bash
# Servidor local para el tablero Unimagdalena en Cifras
cd "$(dirname "$0")"
echo "Abriendo http://localhost:8000 ..."
(sleep 1; (command -v xdg-open >/dev/null && xdg-open http://localhost:8000) || (command -v open >/dev/null && open http://localhost:8000)) &
python3 -m http.server 8000
