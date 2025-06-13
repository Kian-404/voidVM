module.exports = {
  // 继承常规提交规范
  extends: ['@commitlint/config-conventional'],

  // 自定义规则
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // Bug 修复
        'docs', // 文档更新
        'style', // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'ci', // CI/CD 配置文件和脚本的变动
        'build', // 影响构建系统或外部依赖项的更改
        'revert', // 回滚之前的提交
        'wip', // 开发中（临时提交）
        'workflow', // 工作流程改进
        'types', // 类型定义文件更改
      ],
    ],

    // 范围枚举（可选，但建议使用）
    'scope-enum': [
      2,
      'always',
      [
        // 前端相关
        'web',
        'ui',
        'components',
        'views',
        'stores',
        'router',
        'styles',

        // 后端相关
        'server',
        'api',
        'controllers',
        'services',
        'models',
        'middlewares',
        'routes',
        'auth',
        'database',
        'websocket',

        // 虚拟机相关
        'vm',
        'qemu',
        'kvm',
        'console',
        'vnc',
        'snapshots',
        'storage',
        'network',

        // 系统相关
        'config',
        'docker',
        'k8s',
        'nginx',
        'monitoring',
        'logging',
        'security',

        // 开发工具
        'deps',
        'devtools',
        'lint',
        'prettier',
        'vite',
        'webpack',

        // 文档和测试
        'docs',
        'tests',
        'e2e',
        'unit',
        'integration',

        // 发布相关
        'release',
        'deploy',
        'ci',
        'cd',

        // 其他
        'core',
        'shared',
        'types',
        'utils',
        'scripts',
      ],
    ],

    // 主题必须存在
    'subject-empty': [2, 'never'],

    // 主题最大长度
    'subject-max-length': [2, 'always', 72],

    // 主题最小长度
    'subject-min-length': [2, 'always', 10],

    // 主题格式（禁用大小写限制，支持中英文）
    'subject-case': [0],

    // 主题不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],

    // 类型必须小写
    'type-case': [2, 'always', 'lower-case'],

    // 类型不能为空
    'type-empty': [2, 'never'],

    // 范围必须小写
    'scope-case': [2, 'always', 'lower-case'],

    // Header 最大长度
    'header-max-length': [2, 'always', 100],

    // Body 行最大长度
    'body-max-line-length': [2, 'always', 100],

    // Footer 行最大长度
    'footer-max-line-length': [2, 'always', 100],

    // Body 和 Footer 前必须有空行
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },

  // 自定义提示信息
  prompt: {
    questions: {
      type: {
        description: '选择你要提交的类型',
        enum: {
          feat: {
            description: '新功能',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'Bug 修复',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: '文档更新',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: '代码格式（不影响功能，例如空格、分号等格式修正）',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: '代码重构（既不增加feature，也不修复bug）',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: '性能优化',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: '增加测试',
            title: 'Tests',
            emoji: '🚨',
          },
          chore: {
            description: '构建过程或辅助工具的变动',
            title: 'Chores',
            emoji: '♻️',
          },
          ci: {
            description: 'CI/CD 配置',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          build: {
            description: '构建系统或外部依赖项的更改',
            title: 'Builds',
            emoji: '🛠️',
          },
          revert: {
            description: '回滚之前的提交',
            title: 'Reverts',
            emoji: '🗑️',
          },
        },
      },
      scope: {
        description: '选择一个范围（可选）',
      },
      subject: {
        description: '填写简短精炼的变更描述',
      },
      body: {
        description: '填写更加详细的变更描述（可选）。使用 "|" 换行',
      },
      isBreaking: {
        description: '是否是破坏性变更？',
      },
      breakingBody: {
        description: '破坏性变更的详细描述',
      },
      breaking: {
        description: '描述破坏性变更',
      },
      isIssueAffected: {
        description: '此变更是否影响某个issue？',
      },
      issuesBody: {
        description: '如果问题已"关闭"，则提交需要正文。请输入较长的描述',
      },
      issues: {
        description: '添加问题引用（例如："fix #123", "re #123"）',
      },
    },
  },

  // 忽略某些提交
  ignores: [
    // 忽略合并提交
    commit => commit.includes('Merge'),
    // 忽略 revert 提交
    commit => commit.includes('Revert'),
    // 忽略版本发布提交
    commit => commit.includes('chore(release)'),
    // 忽略依赖更新的自动提交
    commit => commit.includes('chore(deps)'),
  ],

  // 默认忽略 merge commits
  defaultIgnores: true,

  // 帮助链接
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
}
