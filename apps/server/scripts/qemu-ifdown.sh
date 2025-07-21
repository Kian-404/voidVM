#!/bin/bash
# scripts/qemu-ifdown.sh

# TAP 接口关闭脚本
INTERFACE=$1

# 从桥接中移除接口
ip link set $INTERFACE nomaster
ip link set $INTERFACE down

echo "TAP 接口 $INTERFACE 已断开"
