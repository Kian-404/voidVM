// controllers/snapshotController.js
import snapshotService from '../services/snapshotService.js'

class SnapshotController {
  constructor() {
    this.snapshotService = new snapshotService()
  }

  /**
   * 创建快照
   */
  async createSnapshot(req, res) {
    try {
      const { vmName, snapshotName, description } = req.body

      // 参数验证
      if (!vmName || !snapshotName) {
        return res.status(400).json({
          success: false,
          error: '虚拟机名称和快照名称不能为空',
        })
      }

      // 快照名称格式验证
      if (!/^[a-zA-Z0-9_-]+$/.test(snapshotName)) {
        return res.status(400).json({
          success: false,
          error: '快照名称只能包含字母、数字、下划线和连字符',
        })
      }

      const result = await this.snapshotService.createSnapshot({
        vmName,
        snapshotName,
        description: description || '',
      })

      res.json({
        success: true,
        message: '快照创建成功',
        data: result,
      })
    } catch (error) {
      console.error('创建快照失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '创建快照失败',
      })
    }
  }

  /**
   * 加载快照
   */
  async loadSnapshot(req, res) {
    try {
      const { vmName, snapshotName } = req.body

      if (!vmName || !snapshotName) {
        return res.status(400).json({
          success: false,
          error: '虚拟机名称和快照名称不能为空',
        })
      }

      const result = await this.snapshotService.loadSnapshot({
        vmName,
        snapshotName,
      })

      res.json({
        success: true,
        message: `快照 "${snapshotName}" 加载成功`,
        data: result,
      })
    } catch (error) {
      console.error('加载快照失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '加载快照失败',
      })
    }
  }

  /**
   * 获取虚拟机快照列表
   */
  async getSnapshots(req, res) {
    try {
      const { vmName } = req.params
      const { page = 1, limit = 20, sortBy = 'createTime', order = 'desc' } = req.query

      if (!vmName) {
        return res.status(400).json({
          success: false,
          error: '虚拟机名称不能为空',
        })
      }

      const result = await this.snapshotService.getSnapshots({
        vmName,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        order,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('获取快照列表失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '获取快照列表失败',
      })
    }
  }

  /**
   * 删除快照
   */
  async deleteSnapshot(req, res) {
    try {
      const { vmName, snapshotName } = req.params

      if (!vmName || !snapshotName) {
        return res.status(400).json({
          success: false,
          error: '虚拟机名称和快照名称不能为空',
        })
      }

      const result = await this.snapshotService.deleteSnapshot({
        vmName,
        snapshotName,
      })

      res.json({
        success: true,
        message: `快照 "${snapshotName}" 删除成功`,
        data: result,
      })
    } catch (error) {
      console.error('删除快照失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '删除快照失败',
      })
    }
  }

  /**
   * 获取快照详情
   */
  async getSnapshotDetail(req, res) {
    try {
      const { vmName, snapshotName } = req.params

      if (!vmName || !snapshotName) {
        return res.status(400).json({
          success: false,
          error: '虚拟机名称和快照名称不能为空',
        })
      }

      const result = await this.snapshotService.getSnapshotDetail({
        vmName,
        snapshotName,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('获取快照详情失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '获取快照详情失败',
      })
    }
  }

  /**
   * 重命名快照
   */
  async renameSnapshot(req, res) {
    try {
      const { vmName, snapshotName } = req.params
      const { newName, description } = req.body

      if (!vmName || !snapshotName || !newName) {
        return res.status(400).json({
          success: false,
          error: '参数不完整',
        })
      }

      // 新名称格式验证
      if (!/^[a-zA-Z0-9_-]+$/.test(newName)) {
        return res.status(400).json({
          success: false,
          error: '快照名称只能包含字母、数字、下划线和连字符',
        })
      }

      const result = await this.snapshotService.renameSnapshot({
        vmName,
        oldName: snapshotName,
        newName,
        description,
      })

      res.json({
        success: true,
        message: '快照重命名成功',
        data: result,
      })
    } catch (error) {
      console.error('重命名快照失败:', error)
      res.status(500).json({
        success: false,
        error: error.message || '重命名快照失败',
      })
    }
  }
}

// 创建 SnapshotController 实例并导出
const snapshotController = new SnapshotController()

export { snapshotController }
