#!/bin/bash
# scripts/qemu-ifup.sh

# TAP 接口启动脚本
INTERFACE=$1
BRIDGE=${2:-br0}

# 检查桥接是否存在
if ! ip link show $BRIDGE &>/dev/null; then
    echo "创建桥接 $BRIDGE"
    ip link add name $BRIDGE type bridge
    ip link set $BRIDGE up
fi

# 启动 TAP 接口
ip link set $INTERFACE up

# 将 TAP 接口添加到桥接
ip link set $INTERFACE master $BRIDGE

echo "TAP 接口 $INTERFACE 已连接到桥接 $BRIDGE"
