#!/bin/bash
# WizPulseAI 停止入口脚本
# 简化版：直接在根目录执行

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/scripts/stop-all.sh"
