import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'VoidVM',
    description: '现代化的虚拟机管理平台',
    lang: 'zh-CN',
    base: '/',
    ignoreDeadLinks: true,
    head: [
      ['link', { rel: 'icon', href: '/logo.svg' }],
      ['meta', { name: 'theme-color', content: '#646cff' }],
      ['meta', { name: 'keywords', content: 'virtual machine, qemu, vm management, vue, node' }],
    ],

    themeConfig: {
      logo: '/logo.svg',

      nav: [
        { text: '首页', link: '/' },
        { text: '指南', link: '/guide/' },
        { text: 'API', link: '/api/' },
        { text: '开发', link: '/development/' },
        {
          text: '链接',
          items: [
            { text: 'GitHub', link: 'https://github.com/Kian-404/voidVM' },
            { text: '演示站点', link: '#' },
          ],
        },
      ],

      sidebar: {
        '/guide/': [
          {
            text: '用户指南',
            items: [
              { text: '介绍', link: '/guide/' },
              { text: '快速开始', link: '/guide/getting-started' },
              { text: '安装部署', link: '/guide/installation' },
              // { text: '配置说明', link: '/guide/configuration' },
              { text: '虚拟机管理', link: '/guide/vm-management' },
            ],
          },
        ],
        '/api/': [
          {
            text: 'API 文档',
            items: [
              { text: '概览', link: '/api/' },
              { text: '虚拟机 API', link: '/api/vm-api' },
              { text: '系统 API', link: '/api/system-api' },
              { text: 'WebSocket API', link: '/api/websocket-api' },
            ],
          },
        ],
        '/development/': [
          {
            text: '开发文档',
            items: [
              { text: '开发指南', link: '/development/' },
              { text: '架构设计', link: '/development/architecture' },
              { text: '贡献指南', link: '/development/contributing' },
              { text: '部署指南', link: '/development/deployment' },
            ],
          },
        ],
        '/examples/': [
          {
            text: '示例',
            items: [
              { text: '示例概览', link: '/examples/' },
              { text: '基础用法', link: '/examples/basic-usage' },
              { text: '高级配置', link: '/examples/advanced-config' },
            ],
          },
        ],
      },

      socialLinks: [{ icon: 'github', link: 'https://github.com/Kian-404/voidVM' }],

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2024 VoidVM Team',
      },

      editLink: {
        pattern: 'https://github.com/Kian-404/voidVM/edit/main/apps/docs/:path',
        text: '在 GitHub 上编辑此页',
      },

      lastUpdated: {
        text: '最后更新于',
        formatOptions: {
          dateStyle: 'short',
          timeStyle: 'medium',
        },
      },

      docFooter: {
        prev: '上一页',
        next: '下一页',
      },

      outline: {
        label: '页面导航',
      },

      search: {
        provider: 'local',
        options: {
          locales: {
            zh: {
              translations: {
                button: {
                  buttonText: '搜索文档',
                  buttonAriaLabel: '搜索文档',
                },
                modal: {
                  noResultsText: '无法找到相关结果',
                  resetButtonTitle: '清除查询条件',
                  footer: {
                    selectText: '选择',
                    navigateText: '切换',
                  },
                },
              },
            },
          },
        },
      },
    },

    markdown: {
      // theme: 'material-theme-palenight',
      lineNumbers: true,
      config: md => {
        // 你可以在这里添加 markdown-it 插件
      },
    },
    // Mermaid 配置
    mermaid: {
      // 参考 https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
      theme: 'default',
      themeVariables: {
        primaryColor: '#646cff',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#646cff',
        lineColor: '#646cff',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#f8fafc',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        secondBkg: '#f1f5f9',
      },
      startOnLoad: true,
      securityLevel: 'loose',
    },
  })
)
