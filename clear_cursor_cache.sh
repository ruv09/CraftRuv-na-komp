#!/bin/bash

echo "🧹 Очистка кэша Cursor..."
echo "================================"

# Остановка Cursor
echo "1. Останавливаем Cursor..."
pkill -f cursor 2>/dev/null
sleep 2

# Основные папки для очистки
CURSOR_DATA="$HOME/.vm-daemon/vm-daemon-cursor-data"
CURSOR_CONFIG="$HOME/.config/Cursor*"

echo "2. Очищаем основные папки кэша..."

# Очистка кэша
if [ -d "$CURSOR_DATA/Cache" ]; then
    echo "   - Очищаем Cache..."
    rm -rf "$CURSOR_DATA/Cache"/*
fi

# Очистка локального хранилища
if [ -d "$CURSOR_DATA/Local Storage" ]; then
    echo "   - Очищаем Local Storage..."
    rm -rf "$CURSOR_DATA/Local Storage"/*
fi

# Очистка кэшированных данных
if [ -d "$CURSOR_DATA/CachedData" ]; then
    echo "   - Очищаем CachedData..."
    rm -rf "$CURSOR_DATA/CachedData"/*
fi

# Очистка кэша профилей
if [ -d "$CURSOR_DATA/CachedProfilesData" ]; then
    echo "   - Очищаем CachedProfilesData..."
    rm -rf "$CURSOR_DATA/CachedProfilesData"/*
fi

# Очистка кэша кода
if [ -d "$CURSOR_DATA/Code Cache" ]; then
    echo "   - Очищаем Code Cache..."
    rm -rf "$CURSOR_DATA/Code Cache"/*
fi

# Очистка GPU кэша
if [ -d "$CURSOR_DATA/GPUCache" ]; then
    echo "   - Очищаем GPUCache..."
    rm -rf "$CURSOR_DATA/GPUCache"/*
fi

# Очистка глобального хранилища
if [ -d "$CURSOR_DATA/User/globalStorage" ]; then
    echo "   - Очищаем globalStorage..."
    rm -rf "$CURSOR_DATA/User/globalStorage"/*
fi

# Очистка workspace storage
if [ -d "$CURSOR_DATA/User/workspaceStorage" ]; then
    echo "   - Очищаем workspaceStorage..."
    rm -rf "$CURSOR_DATA/User/workspaceStorage"/*
fi

# Очистка логов
if [ -d "$CURSOR_DATA/logs" ]; then
    echo "   - Очищаем логи..."
    rm -rf "$CURSOR_DATA/logs"/*
fi

# Очистка конфигурации
if [ -d "$HOME/.config/Cursor Nightly" ]; then
    echo "   - Очищаем конфигурацию..."
    rm -rf "$HOME/.config/Cursor Nightly"/*
fi

# Изменение machine ID
if [ -f "$CURSOR_DATA/machineid" ]; then
    echo "   - Генерируем новый machine ID..."
    echo "$(cat /proc/sys/kernel/random/uuid)" > "$CURSOR_DATA/machineid"
fi

echo "3. Создаем пустые папки..."
mkdir -p "$CURSOR_DATA/Cache"
mkdir -p "$CURSOR_DATA/Local Storage"
mkdir -p "$CURSOR_DATA/CachedData"
mkdir -p "$CURSOR_DATA/CachedProfilesData"
mkdir -p "$CURSOR_DATA/Code Cache"
mkdir -p "$CURSOR_DATA/GPUCache"
mkdir -p "$CURSOR_DATA/User/globalStorage"
mkdir -p "$CURSOR_DATA/User/workspaceStorage"
mkdir -p "$CURSOR_DATA/logs"

echo "✅ Очистка кэша завершена!"
echo "Теперь можете запустить Cursor заново."