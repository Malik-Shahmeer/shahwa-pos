#!/bin/bash
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  🍗 SHAHWA POS SOLUTION - STARTING...           ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Installing dependencies...                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
npm install
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ STARTING POS SYSTEM...                      ║"
echo "║                                                  ║"
echo "║  Browser kholega automatically!                  ║"
echo "║  Ya manually kholega: http://localhost:3000      ║"
echo "║                                                  ║"
echo "║  Band karne ke liye: CTRL+C dabao               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null &
node server.js