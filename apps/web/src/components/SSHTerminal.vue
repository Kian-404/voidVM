<template>
  <div>
    <div class="terminal-container mb-3" ref="terminalContainer"></div>

    <div class="d-flex justify-content-between align-items-center">
      <div class="btn-group">
        <button class="btn btn-success btn-sm" @click="connectSSH" :disabled="isConnected">
          <i class="bi bi-plug me-1"></i>连接
        </button>
        <button class="btn btn-danger btn-sm" @click="disconnectSSH" :disabled="!isConnected">
          <i class="bi bi-x-circle me-1"></i>断开
        </button>
      </div>

      <div class="connection-status">
        <span v-if="isConnected" class="badge bg-success">
          <i class="bi bi-check-circle me-1"></i>已连接
        </span>
        <span v-else class="badge bg-secondary">
          <i class="bi bi-dash-circle me-1"></i>未连接
        </span>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import '@xterm/xterm/css/xterm.css';

const props = defineProps({
  vmName: {
    type: String,
    required: true
  },
  sshPort: {
    type: Number,
    required: true
  },
  sshUsername: {
    type: String,
    default: 'root'
  },
  sshPassword: {
    type: String,
    default: ''
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
});
const terminalContainer: any = ref(null);
const terminal = ref<Terminal | null>(null);
const fitAddon = ref<FitAddon | null>(null);
const socket = ref<WebSocket | null>(null);
const isConnected = ref(false);
// 添加一个输入缓冲区
const inputBuffer = ref('');

onMounted(() => {
  initTerminal();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  disconnectSSH();
  window.removeEventListener('resize', handleResize);
  terminal.value?.dispose();
});

watch(() => props.isFullscreen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      fitAddon.value?.fit();
    });
  }
});


const initTerminal = () => {
  terminal.value = new Terminal({
    cursorBlink: true,
    disableStdin: false, //是否应禁用输入。
    theme: {
      background: '#1e1e1e',
      foreground: '#f0f0f0'
    },
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    scrollback: 1000,
    convertEol: true
  });

  fitAddon.value = new FitAddon();
  terminal.value.loadAddon(fitAddon.value);
  terminal.value.loadAddon(new WebLinksAddon());
  terminal.value.loadAddon(new SearchAddon());

  if (terminalContainer.value) {
    terminal.value.open(terminalContainer.value);
    fitAddon.value.fit();
  }
  // 添加点击事件，确保终端获得焦点
  if (terminalContainer.value) {
    terminal.value.open(terminalContainer.value);
    fitAddon.value.fit();

    // 添加点击事件处理器，确保终端获得焦点
    terminalContainer.value.addEventListener('click', () => {
      terminal.value?.focus();
    });

    // 初始化时自动获得焦点
    terminal.value.focus();
    terminal.value.writeln('欢迎使用 SSH 终端');
    terminal.value.writeln('请点击连接开始...');
  }
};

const handleResize = () => {
  fitAddon.value?.fit();
};

const connectSSH = () => {
  if (isConnected.value) return;
  terminal.value?.clearSelection();

  // 连接到后端 WebSocket 代理
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/api/ssh?vmName=${props.vmName}&port=${props.sshPort}&username=${props.sshUsername}&password=${props.sshPassword}`;

  socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => {
    isConnected.value = true;
    terminal.value?.writeln('SSH 连接已建立...');
  };

  socket.value.onmessage = (event) => {
    console.log('Received message type:', typeof event.data);

    // 处理二进制数据
    if (event.data instanceof ArrayBuffer) {
      // 将 ArrayBuffer 转换为 Uint8Array
      const uint8Array = new Uint8Array(event.data);
      // 将 Uint8Array 转换为字符串
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(uint8Array);
      terminal.value?.write(text);
    }
    // 处理 Blob 数据
    else if (event.data instanceof Blob) {
      // 读取 Blob 数据
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        terminal.value?.write(text);
      };
      reader.readAsText(event.data);
    }
    // 处理文本或 JSON 数据
    else {
      try {
        // 尝试解析为 JSON
        const data = JSON.parse(event.data);
        if (data.type === 'vmStatus') {
          // 处理状态消息
          return;
        }
        // 如果是 JSON 但不是状态消息，显示原始数据
        terminal.value?.write(event.data);
      } catch (e) {
        // 如果不是 JSON，直接显示文本
        terminal.value?.write(event.data);
      }
    }
  };


  socket.value.onclose = () => {
    isConnected.value = false;
    terminal.value?.writeln('\r\nSSH 连接已关闭');
  };

  socket.value.onerror = (error) => {
    console.error('WebSocket 错误:', error);
    terminal.value?.writeln('\r\nSSH 连接错误');
  };

  // // 将终端输入发送到 WebSocket
  // terminal.value?.onData((data) => {
  //   // 检查是否是回车键
  //   if (data === '\r' || data === '\n') {
  //     // 发送缓冲区内容加上回车
  //     if (socket.value && socket.value.readyState === WebSocket.OPEN) {
  //       // 发送缓冲区内容和回车符
  //       socket.value.send(inputBuffer.value + '\r');
  //       console.log('Sending to server:', inputBuffer.value);

  //       // 清空缓冲区
  //       inputBuffer.value = '';
  //     }
  //   }
  //   // 处理删除键 (ASCII 127 是 Delete, ASCII 8 是 Backspace)
  //   else if (data.length === 1 && (data.charCodeAt(0) === 127 || data.charCodeAt(0) === 8)) {
  //     if (inputBuffer.value.length > 0) {
  //       // 从缓冲区删除最后一个字符
  //       inputBuffer.value = inputBuffer.value.slice(0, -1);

  //       // 在终端上模拟删除效果
  //       // 注意：这通常不需要，因为大多数终端会自动处理删除键的显示
  //       // 但如果你禁用了终端的默认处理，可能需要手动处理
  //       terminal.value?.write('\b \b'); // 退格，空格覆盖，再退格
  //     }

  //     // 将删除键发送到服务器
  //     if (socket.value && socket.value.readyState === WebSocket.OPEN) {
  //       socket.value.send(data);
  //     }
  //   }
  //   // 处理其他输入
  //   else {
  //     // 将输入添加到缓冲区
  //     inputBuffer.value += data;

  //     // 在终端上显示用户输入（本地回显）
  //     // 注意：如果服务器已配置回显，可能会导致字符显示两次
  //     terminal.value?.write(data);

  //     // // 将输入发送到服务器
  //     // if (socket.value && socket.value.readyState === WebSocket.OPEN) {
  //     //   socket.value.send(data);
  //     // }
  //   }
  // });

  // 将终端输入发送到 WebSocket
  terminal.value?.onData((data) => {
    // 只发送数据到服务器，不在本地回显
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(data);
    }

    // 可以选择性地更新本地缓冲区，用于其他功能
    if (data === '\r' || data === '\n') {
      inputBuffer.value = '';
    } else if (data.length === 1 && (data.charCodeAt(0) === 127 || data.charCodeAt(0) === 8)) {
      if (inputBuffer.value.length > 0) {
        inputBuffer.value = inputBuffer.value.slice(0, -1);
      }
    } else {
      inputBuffer.value += data;
    }

    // 不进行本地回显，依赖服务器回显
  });

};

const disconnectSSH = () => {
  if (socket.value) {
    socket.value.close();
    socket.value = null;
    isConnected.value = false;
    if (terminal.value) {
      terminal.value.writeln('\r\nSSH 连接已断开');

    }
  }
};
</script>

<style scoped>
.terminal-container {
  width: 100%;
  height: var(--terminal-height, 400px);
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  background-color: #1e1e1e;
  padding: 4px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  transition: height 0.3s ease;
}

.connection-status {
  font-size: 0.9rem;
}

.btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
