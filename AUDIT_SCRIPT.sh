#!/bin/bash

# AKUA Droplet Audit Script
# Run this on 143.198.43.229 to assess readiness

echo "=========================================="
echo "AKUA Droplet Environment Audit"
echo "Date: $(date)"
echo "=========================================="
echo ""

echo "=== OS Information ==="
uname -a
echo ""
lsb_release -a 2>/dev/null || cat /etc/os-release
echo ""

echo "=== System Resources ==="
echo "Memory:"
free -h
echo ""
echo "Disk Space:"
df -h
echo ""
echo "CPU Info:"
lscpu | grep -E "Model name|CPU\(s\):|Thread"
echo ""

echo "=== Docker Installation ==="
if command -v docker &> /dev/null; then
    echo "✓ Docker installed"
    docker --version
    echo ""
    echo "Docker status:"
    sudo systemctl status docker --no-pager | head -n 5
else
    echo "✗ Docker NOT installed"
fi
echo ""

echo "=== Docker Compose ==="
if docker compose version &> /dev/null; then
    echo "✓ Docker Compose (plugin) installed"
    docker compose version
elif command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose (standalone) installed"
    docker-compose --version
else
    echo "✗ Docker Compose NOT installed"
fi
echo ""

echo "=== Network Ports in Use ==="
echo "Checking ports 22, 5672, 8080, 8081, 15672..."
sudo ss -tulpn | grep -E ":(22|5672|8080|8081|15672) " || echo "None of the target ports are in use"
echo ""

echo "=== All Listening Ports ==="
sudo ss -tulpn | head -n 30
echo ""

echo "=== Firewall Status ==="
if command -v ufw &> /dev/null; then
    sudo ufw status
else
    echo "ufw not installed"
fi
echo ""

echo "=== Current Docker Containers ==="
if command -v docker &> /dev/null; then
    docker ps -a
else
    echo "Docker not available"
fi
echo ""

echo "=== Docker Images ==="
if command -v docker &> /dev/null; then
    docker images
else
    echo "Docker not available"
fi
echo ""

echo "=== Directory Check ==="
echo "Checking for /opt/akua-stack..."
if [ -d "/opt/akua-stack" ]; then
    echo "✓ /opt/akua-stack exists"
    ls -la /opt/akua-stack
else
    echo "✗ /opt/akua-stack does NOT exist"
fi
echo ""

echo "=== System Updates ==="
echo "Checking for pending updates..."
if command -v apt &> /dev/null; then
    apt list --upgradable 2>/dev/null | head -n 10
fi
echo ""

echo "=== Restart Required? ==="
if [ -f /var/run/reboot-required ]; then
    echo "⚠ System restart IS required"
    cat /var/run/reboot-required.pkgs 2>/dev/null || true
else
    echo "✓ No restart required"
fi
echo ""

echo "=========================================="
echo "Audit Complete"
echo "=========================================="
