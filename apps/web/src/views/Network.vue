<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">网络管理</h1>

        <!-- 导航标签页 -->
        <ul class="nav nav-tabs mb-4" id="networkTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'bridges' }"
              @click="handleTabChange('bridges')"
              type="button"
              role="tab"
            >
              桥接网络
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'tap' }"
              @click="handleTabChange('tap')"
              type="button"
              role="tab"
            >
              TAP接口
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'port-forward' }"
              @click="handleTabChange('port-forward')"
              type="button"
              role="tab"
            >
              端口转发
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'traffic-control' }"
              @click="handleTabChange('traffic-control')"
              type="button"
              role="tab"
            >
              流量控制
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'stats' }"
              @click="handleTabChange('stats')"
              type="button"
              role="tab"
            >
              网络统计
            </button>
          </li>
        </ul>

        <div class="tab-content" id="networkTabContent">
          <!-- 桥接网络管理 -->
          <div
            class="tab-pane fade"
            :class="{ 'show active': activeTab === 'bridges' }"
            role="tabpanel"
          >
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">桥接网络管理</h5>
                <button class="btn btn-primary" @click="showCreateBridgeModal">
                  <i class="bi bi-plus-circle"></i> 创建桥接网络
                </button>
              </div>
              <div class="card-body">
                <!-- 网络接口列表 -->
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>状态</th>
                        <th>地址</th>
                        <th>MTU</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="interfaceItem in networkInterfaces" :key="interfaceItem.name">
                        <td>{{ interfaceItem.name }}</td>
                        <td>
                          <span class="badge" :class="getTypeClass(interfaceItem.type)">
                            {{ interfaceItem.type }}
                          </span>
                        </td>
                        <td>
                          <span
                            class="badge"
                            :class="interfaceItem.status === 'up' ? 'bg-success' : 'bg-danger'"
                          >
                            {{ interfaceItem.status }}
                          </span>
                        </td>
                        <td>
                          <div v-for="addr in interfaceItem.addresses" :key="addr.address">
                            {{ addr.address }}/{{ addr.scope }}
                          </div>
                        </td>
                        <td>{{ interfaceItem.mtu }}</td>
                        <td>
                          <button
                            v-if="interfaceItem.type === 'bridge'"
                            class="btn btn-sm btn-danger"
                            @click="deleteBridge(interfaceItem.name)"
                          >
                            <i class="bi bi-trash"></i> 删除
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- TAP接口管理 -->
          <div
            class="tab-pane fade"
            :class="{ 'show active': activeTab === 'tap' }"
            role="tabpanel"
          >
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">TAP接口管理</h5>
                <div>
                  <button
                    class="btn btn-outline-secondary me-2"
                    @click="loadTapInterfaces"
                    :disabled="loading"
                  >
                    <i class="bi bi-arrow-clockwise me-1" :class="{ spin: loading }"></i>
                    刷新
                  </button>
                  <button class="btn btn-primary" @click="showCreateTapModal">
                    <i class="bi bi-plus-circle"></i> 创建TAP接口
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div v-if="tapInterfaces.length === 0" class="text-center py-4">
                  <i class="bi bi-ethernet fs-1 text-muted"></i>
                  <p class="text-muted mt-2">暂无TAP接口</p>
                  <button class="btn btn-primary" @click="showCreateTapModal">
                    <i class="bi bi-plus-circle me-1"></i>创建第一个TAP接口
                  </button>
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>名称</th>
                        <th>类型</th>
                        <th>状态</th>
                        <th>连接桥接</th>
                        <th>MAC地址</th>
                        <th>MTU</th>
                        <th>创建时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="tap in tapInterfaces" :key="tap.name">
                        <td>
                          <span class="fw-semibold">{{ tap.name }}</span>
                        </td>
                        <td>
                          <span class="badge bg-info">{{ tap.type || 'TAP' }}</span>
                        </td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(tap.status)">
                            <i class="bi" :class="getStatusIcon(tap.status)"></i>
                            {{ getStatusText(tap.status) }}
                          </span>
                        </td>
                        <td>
                          <span v-if="tap.bridge" class="badge bg-primary">{{ tap.bridge }}</span>
                          <span v-else class="text-muted">无</span>
                        </td>
                        <td>
                          <code v-if="tap.mac" class="small">{{ tap.mac }}</code>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>{{ tap.mtu || '-' }}</td>
                        <td>
                          <small class="text-muted">{{ formatDate(tap.created) }}</small>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm" role="group">
                            <button
                              class="btn btn-outline-info"
                              @click="showTapDetails(tap)"
                              title="查看详情"
                            >
                              <i class="bi bi-eye"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              @click="deleteTap(tap.name)"
                              title="删除"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 端口转发管理 -->
          <div
            class="tab-pane fade"
            :class="{ 'show active': activeTab === 'port-forward' }"
            role="tabpanel"
          >
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">端口转发规则</h5>
                <button class="btn btn-primary" @click="showPortForwardModal">
                  <i class="bi bi-plus-circle"></i> 添加转发规则
                </button>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>主机端口</th>
                        <th>客户机IP</th>
                        <th>客户机端口</th>
                        <th>协议</th>
                        <th>创建时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="rule in portForwardRules"
                        :key="`${rule.hostPort}-${rule.protocol}`"
                      >
                        <td>{{ rule.hostPort }}</td>
                        <td>{{ rule.guestIP }}</td>
                        <td>{{ rule.guestPort }}</td>
                        <td>
                          <span class="badge bg-info">{{ rule.protocol.toUpperCase() }}</span>
                        </td>
                        <td>{{ formatDate(rule.created) }}</td>
                        <td>
                          <button class="btn btn-sm btn-danger" @click="deletePortForward(rule)">
                            <i class="bi bi-trash"></i> 删除
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 流量控制 -->
          <div
            class="tab-pane fade"
            :class="{ 'show active': activeTab === 'traffic-control' }"
            role="tabpanel"
          >
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">网络流量控制</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="setupTrafficControl">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">网络接口</label>
                        <select
                          class="form-select"
                          v-model="trafficControlForm.interfaceItem"
                          required
                        >
                          <option value="">选择网络接口</option>
                          <option
                            v-for="interfaceItem in networkInterfaces"
                            :key="interfaceItem.name"
                            :value="interfaceItem.name"
                          >
                            {{ interfaceItem.name }} ({{ interfaceItem.type }})
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">带宽限制</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="trafficControlForm.bandwidth"
                          placeholder="例如: 100mbit"
                          pattern="^\d+(kbit|mbit|gbit)$"
                        />
                        <div class="form-text">格式: 数字+单位(kbit/mbit/gbit)</div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">延迟时间</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="trafficControlForm.delay"
                          placeholder="例如: 10ms"
                          pattern="^\d+(ms|s)$"
                        />
                        <div class="form-text">格式: 数字+单位(ms/s)</div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">丢包率</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="trafficControlForm.loss"
                          placeholder="例如: 1%"
                          pattern="^\d+(\.\d+)?%$"
                        />
                        <div class="form-text">格式: 数字+%(例如: 1%)</div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary">应用流量控制</button>
                </form>
              </div>
            </div>
          </div>

          <!-- 网络统计 -->
          <div
            class="tab-pane fade"
            :class="{ 'show active': activeTab === 'stats' }"
            role="tabpanel"
          >
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">网络统计信息</h5>
                <div>
                  <select
                    class="form-select d-inline-block w-auto me-2"
                    v-model="selectedInterface"
                    @change="getNetworkStats"
                  >
                    <option value="">选择网络接口</option>
                    <option
                      v-for="interfaceItem in networkInterfaces"
                      :key="interfaceItem.name"
                      :value="interfaceItem.name"
                    >
                      {{ interfaceItem.name }}
                    </option>
                  </select>
                  <button class="btn btn-outline-primary" @click="toggleRealTimeStats">
                    {{ realtimeStats ? '停止' : '开始' }}实时监控
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div v-if="networkStats" class="row">
                  <div class="col-md-6">
                    <div class="card bg-light">
                      <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-download"></i> 接收统计</h6>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h4 text-success">
                                {{ formatBytes(networkStats.rx.bytes) }}
                              </div>
                              <small class="text-muted">总字节数</small>
                            </div>
                          </div>
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h4 text-info">
                                {{ networkStats.rx.packets.toLocaleString() }}
                              </div>
                              <small class="text-muted">总包数</small>
                            </div>
                          </div>
                        </div>
                        <div class="row mt-3">
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h6 text-danger">{{ networkStats.rx.errors }}</div>
                              <small class="text-muted">错误数</small>
                            </div>
                          </div>
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h6 text-warning">{{ networkStats.rx.dropped }}</div>
                              <small class="text-muted">丢弃数</small>
                            </div>
                          </div>
                        </div>
                        <div class="mt-3 text-center">
                          <div class="h5 text-primary">
                            {{ formatBytes(networkStats.rx.rate || 0) }}/s
                          </div>
                          <small class="text-muted">接收速率</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card bg-light">
                      <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-upload"></i> 发送统计</h6>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h4 text-success">
                                {{ formatBytes(networkStats.tx.bytes) }}
                              </div>
                              <small class="text-muted">总字节数</small>
                            </div>
                          </div>
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h4 text-info">
                                {{ networkStats.tx.packets.toLocaleString() }}
                              </div>
                              <small class="text-muted">总包数</small>
                            </div>
                          </div>
                        </div>
                        <div class="row mt-3">
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h6 text-danger">{{ networkStats.tx.errors }}</div>
                              <small class="text-muted">错误数</small>
                            </div>
                          </div>
                          <div class="col-6">
                            <div class="text-center">
                              <div class="h6 text-warning">{{ networkStats.tx.dropped }}</div>
                              <small class="text-muted">丢弃数</small>
                            </div>
                          </div>
                        </div>
                        <div class="mt-3 text-center">
                          <div class="h5 text-primary">
                            {{ formatBytes(networkStats.tx.rate || 0) }}/s
                          </div>
                          <small class="text-muted">发送速率</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center text-muted">
                  <i class="bi bi-graph-up fs-1"></i>
                  <p>请选择网络接口查看统计信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建桥接网络模态框 -->
    <div class="modal fade" id="createBridgeModal" tabindex="-1" ref="bridgeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">创建桥接网络</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="createBridge">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">桥接名称 *</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="bridgeForm.name"
                  required
                  placeholder="例如: br0"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">IP地址 *</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="bridgeForm.ip"
                  required
                  placeholder="例如: 192.168.100.1"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">子网掩码</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="bridgeForm.netmask"
                  placeholder="默认: 255.255.255.0"
                />
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="bridgeForm.dhcp"
                    id="enableDhcp"
                  />
                  <label class="form-check-label" for="enableDhcp"> 启用DHCP服务 </label>
                </div>
              </div>
              <div v-if="bridgeForm.dhcp" class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">DHCP起始地址</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="bridgeForm.dhcpStart"
                      placeholder="例如: 192.168.100.10"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">DHCP结束地址</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="bridgeForm.dhcpEnd"
                      placeholder="例如: 192.168.100.100"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-primary">创建</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 创建TAP接口模态框 -->
    <div class="modal fade" id="createTapModal" tabindex="-1" ref="tapModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">创建TAP接口</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="createTap">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">TAP接口名称 *</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="tapForm.name"
                  required
                  placeholder="例如: tap0"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">连接到桥接</label>
                <select class="form-select" v-model="tapForm.bridge">
                  <option value="">不连接到桥接</option>
                  <option
                    v-for="bridge in bridgeInterfaces"
                    :key="bridge.name"
                    :value="bridge.name"
                  >
                    {{ bridge.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-primary">创建</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- TAP接口详情模态框 -->
    <div class="modal fade" id="tapDetailsModal" tabindex="-1" ref="tapDetailsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-ethernet me-2"></i>
              TAP接口详情: {{ selectedTapDetails?.name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedTapDetails">
            <div class="row">
              <!-- 基本信息 -->
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-info-circle me-1"></i>基本信息</h6>
                  </div>
                  <div class="card-body">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="text-muted">接口名称:</td>
                        <td>
                          <strong>{{ selectedTapDetails.name }}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted">接口类型:</td>
                        <td>
                          <span class="badge bg-info">{{ selectedTapDetails.type }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted">状态:</td>
                        <td>
                          <span
                            class="badge"
                            :class="getStatusBadgeClass(selectedTapDetails.status)"
                          >
                            {{ getStatusText(selectedTapDetails.status) }}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted">连接桥接:</td>
                        <td>
                          <span v-if="selectedTapDetails.bridge" class="badge bg-primary">
                            {{ selectedTapDetails.bridge }}
                          </span>
                          <span v-else class="text-muted">无</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted">MAC地址:</td>
                        <td>
                          <code v-if="selectedTapDetails.mac">{{ selectedTapDetails.mac }}</code>
                          <span v-else class="text-muted">-</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-muted">MTU:</td>
                        <td>{{ selectedTapDetails.mtu || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted">创建时间:</td>
                        <td>
                          <small>{{ formatDate(selectedTapDetails.created) }}</small>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- 网络统计 -->
              <div class="col-md-6">
                <div class="card mb-3" v-if="selectedTapDetails.statistics">
                  <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-graph-up me-1"></i>网络统计</h6>
                  </div>
                  <div class="card-body">
                    <div class="row text-center">
                      <div class="col-6 mb-2">
                        <div class="text-success">
                          <strong>{{
                            formatBytes(selectedTapDetails.statistics.rx?.bytes || 0)
                          }}</strong>
                        </div>
                        <small class="text-muted">接收字节</small>
                      </div>
                      <div class="col-6 mb-2">
                        <div class="text-primary">
                          <strong>{{
                            formatBytes(selectedTapDetails.statistics.tx?.bytes || 0)
                          }}</strong>
                        </div>
                        <small class="text-muted">发送字节</small>
                      </div>
                      <div class="col-6">
                        <div class="text-info">
                          <strong>{{
                            (selectedTapDetails.statistics.rx?.packets || 0).toLocaleString()
                          }}</strong>
                        </div>
                        <small class="text-muted">接收包数</small>
                      </div>
                      <div class="col-6">
                        <div class="text-warning">
                          <strong>{{
                            (selectedTapDetails.statistics.tx?.packets || 0).toLocaleString()
                          }}</strong>
                        </div>
                        <small class="text-muted">发送包数</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteTapFromDetails"
              v-if="selectedTapDetails"
            >
              <i class="bi bi-trash me-1"></i>删除接口
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 端口转发模态框 -->
    <div class="modal fade" id="portForwardModal" tabindex="-1" ref="portForwardModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">添加端口转发规则</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="createPortForward">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">主机端口 *</label>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="portForwardForm.hostPort"
                      required
                      min="1"
                      max="65535"
                      placeholder="例如: 8080"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">协议</label>
                    <select class="form-select" v-model="portForwardForm.protocol">
                      <option value="tcp">TCP</option>
                      <option value="udp">UDP</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">客户机IP地址 *</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="portForwardForm.guestIP"
                  required
                  placeholder="例如: 192.168.100.10"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">客户机端口 *</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="portForwardForm.guestPort"
                  required
                  min="1"
                  max="65535"
                  placeholder="例如: 80"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-primary">添加</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="loading" class="position-fixed top-50 start-50 translate-middle">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
    </div>

    <!-- Toast 消息提示 -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show"
        role="alert"
        :class="{
          'text-bg-success': toast.type === 'success',
          'text-bg-danger': toast.type === 'error',
        }"
      >
        <div class="toast-header">
          <i
            class="bi"
            :class="
              toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
            "
          ></i>
          <strong class="me-auto ms-2">{{ toast.type === 'success' ? '成功' : '错误' }}</strong>
          <button type="button" class="btn-close" @click="removeToast(toast.id)"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
  import axios from 'axios'
  import { NetworkAPI } from '../api/network'
  import * as bootstrap from 'bootstrap'

  // 响应式数据
  const loading = ref(false)
  const activeTab = ref('bridges')
  const networkInterfaces = ref([])
  const tapInterfaces = ref([])
  const portForwardRules = ref([])
  const networkStats = ref(null)
  const selectedInterface = ref('')
  const realtimeStats = ref(false)
  const statsInterval = ref(null)
  const toasts = ref([])
  const selectedTapDetails = ref(null)

  // 模态框引用
  const bridgeModal = ref(null)
  const tapModal = ref(null)
  const portForwardModalRef = ref(null)

  // 表单数据
  const bridgeForm = reactive({
    name: '',
    ip: '',
    netmask: '255.255.255.0',
    dhcp: false,
    dhcpStart: '',
    dhcpEnd: '',
  })

  const tapForm = reactive({
    name: '',
    bridge: '',
  })

  const portForwardForm = reactive({
    hostPort: null,
    guestIP: '',
    guestPort: null,
    protocol: 'tcp',
  })

  const trafficControlForm = reactive({
    interfaceItem: '',
    bandwidth: '100mbit',
    delay: '0ms',
    loss: '0%',
  })

  // 监听标签页切换
  const handleTabChange = async newTab => {
    activeTab.value = newTab

    // 根据不同标签页加载相应数据
    switch (newTab) {
      case 'bridges':
        await loadNetworkInterfaces()
        break
      case 'tap':
        await loadTapInterfaces()
        break
      case 'port-forward':
        // 如果有端口转发列表加载方法，在这里调用
        break
      case 'traffic-control':
        // 确保网络接口列表是最新的
        await loadNetworkInterfaces()
        break
      case 'stats':
        await loadNetworkInterfaces()
        break
    }
  }

  // 计算属性
  const bridgeInterfaces = computed(() => {
    return networkInterfaces.value.filter(interfaceItem => interfaceItem.type === 'bridge')
  })

  // 加载网络接口
  const loadNetworkInterfaces = async () => {
    try {
      const result = await NetworkAPI.getNetworkInterfaces()
      if (result.success) {
        networkInterfaces.value = result.data || []
      }
    } catch (error) {
      console.error('获取网络接口失败:', error)
      const errorMessage = error.response?.data?.error || error.message || '获取网络接口失败'
      showToast(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }
  // 加载 TAP 接口列表
  const loadTapInterfaces = async () => {
    try {
      const result = await NetworkAPI.getTapInterfaces()
      if (result.success) {
        tapInterfaces.value = result.data || []
      }
    } catch (error) {
      console.error('获取TAP接口失败:', error)
      const errorMessage = error.response?.data?.error || error.message || '获取TAP接口失败'
      showToast(errorMessage, 'error')
    }
  }
  // 显示 TAP 接口详情
  const showTapDetails = async tap => {
    try {
      loading.value = true
      const result = await NetworkAPI.getTapInterfaceDetails(tap.name)
      if (result.success) {
        // 显示详情模态框
        selectedTapDetails.value = result.data
        showTapDetailsModal()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || '获取TAP接口详情失败'
      showToast(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }
  // TAP 状态相关工具方法
  const getStatusBadgeClass = status => {
    const statusClasses = {
      up: 'bg-success',
      down: 'bg-danger',
      active: 'bg-success',
      inactive: 'bg-danger',
    }
    return statusClasses[status] || 'bg-secondary'
  }

  const getStatusIcon = status => {
    const statusIcons = {
      up: 'bi-check-circle-fill',
      down: 'bi-x-circle-fill',
      active: 'bi-check-circle-fill',
      inactive: 'bi-x-circle-fill',
    }
    return statusIcons[status] || 'bi-question-circle-fill'
  }

  const getStatusText = status => {
    const statusTexts = {
      up: '运行中',
      down: '已停止',
      active: '运行中',
      inactive: '已停止',
    }
    return statusTexts[status] || status
  }

  // 创建桥接网络
  const createBridge = async () => {
    loading.value = true
    try {
      const result = await NetworkAPI.createBridge(bridgeForm)
      if (result.success) {
        showToast('桥接网络创建成功', 'success')
        hideBridgeModal()
        resetBridgeForm()
        await loadNetworkInterfaces()
      }
    } catch (error) {
      const message = error.response?.data?.error || '创建桥接网络失败'
      showToast(message, 'error')
    } finally {
      loading.value = false
    }
  }

  // 删除桥接网络
  const deleteBridge = async name => {
    if (!confirm(`确定要删除桥接网络 ${name} 吗？`)) {
      return
    }
    loading.value = true
    try {
      const result = await NetworkAPI.deleteBridge(name)
      if (result.success) {
        showToast('桥接网络删除成功', 'success')
        await loadNetworkInterfaces()
      }
    } catch (error) {
      const message = error.response?.data?.error || '删除桥接网络失败'
      showToast(message, 'error')
    } finally {
      loading.value = false
    }
  }

  // 创建TAP接口
  const createTap = async () => {
    loading.value = true
    try {
      const result = await NetworkAPI.createTap(tapForm)
      if (result.success) {
        showToast('TAP接口创建成功', 'success')
        hideTapModal()
        resetTapForm()

        // 刷新 TAP 接口列表
        await loadTapInterfaces()
        // 同时刷新网络接口列表
        await loadNetworkInterfaces()
      }
    } catch (error) {
      const message = error.response?.data?.error || '创建TAP接口失败'
      showToast(message, 'error')
    } finally {
      loading.value = false
    }
  }

  // 删除TAP接口
  const deleteTap = async name => {
    if (!confirm(`确定要删除TAP接口 ${name} 吗？`)) {
      return
    }

    loading.value = true
    try {
      await NetworkAPI.deleteTap(name)
      showToast('TAP接口删除成功', 'success')

      // 更新本地列表
      tapInterfaces.value = tapInterfaces.value.filter(tap => tap.name !== name)

      // 如果删除的是当前查看详情的接口，关闭详情模态框
      if (selectedTapDetails.value && selectedTapDetails.value.name === name) {
        selectedTapDetails.value = null
        hideTapDetailsModal()
      }

      // 刷新网络接口列表
      await loadNetworkInterfaces()
    } catch (error) {
      const message = error.response?.data?.error || '删除TAP接口失败'
      showToast(message, 'error')
    } finally {
      loading.value = false
    }
  }

  // 创建端口转发规则
  const createPortForward = async () => {
    loading.value = true
    try {
      const result = await NetworkAPI.createPortForward(portForwardForm)
      if (result.success) {
        showToast('端口转发规则创建成功', 'success')
        hidePortForwardModal()
        resetPortForwardForm()
        portForwardRules.value.push(result.data)
      }
    } catch (error) {
      const message = error.response?.data?.error || '创建端口转发规则失败'
      showToast(message, 'error')
    } finally {
      loading.value = false
    }
  }

  // 删除端口转发规则
  const deletePortForward = async rule => {
    if (
      !confirm(`确定要删除端口转发规则 ${rule.hostPort} -> ${rule.guestIP}:${rule.guestPort} 吗？`)
    ) {
      return
    }

    try {
      await NetworkAPI.deletePortForward({
        hostPort: rule.hostPort,
        protocol: rule.protocol,
      })
      showToast('端口转发规则删除成功', 'success')
      portForwardRules.value = portForwardRules.value.filter(
        r => !(r.hostPort === rule.hostPort && r.protocol === rule.protocol)
      )
    } catch (error) {
      const message = error.response?.data?.error || '删除端口转发规则失败'
      showToast(message, 'error')
    }
  }

  // 设置流量控制
  const setupTrafficControl = async () => {
    loading.value = true
    try {
      const result = await NetworkAPI.setupTrafficControl(trafficControlForm)
      if (result.success) {
        showToast('流量控制配置成功', 'success')
      }
    } catch (error) {
      const message = error.response?.data?.error || '配置流量控制失败'
      showToast(message, 'error')
    } finally {
      loading.value = false
    }
  }

  // 获取网络统计
  const getNetworkStats = async () => {
    if (!selectedInterface.value) {
      networkStats.value = null
      return
    }
    // 实时统计时不显示加载状态
    if (!realtimeStats.value) {
      loading.value = true
    }
    try {
      const result = await NetworkAPI.getNetworkStats(selectedInterface.value, realtimeStats.value)
      console.log('result.data', result.data)
      console.log('result.data[selectedInterface.value]', result.data[selectedInterface.value])

      networkStats.value = result.data[selectedInterface.value].statistics
    } catch (error) {
      const message = error.response?.data?.error || '获取网络统计失败'
      showToast(message, 'error')
    } finally {
      if (!realtimeStats.value) {
        loading.value = false
      }
    }
  }

  // 切换实时统计
  const toggleRealTimeStats = () => {
    realtimeStats.value = !realtimeStats.value

    if (realtimeStats.value && selectedInterface.value) {
      statsInterval.value = setInterval(() => {
        getNetworkStats()
      }, 2000) // 每2秒更新一次
      showToast('已开启实时监控', 'success')
    } else {
      if (statsInterval.value) {
        clearInterval(statsInterval.value)
        statsInterval.value = null
      }
      showToast('已停止实时监控', 'success')
    }
  }

  // 模态框控制方法
  const showCreateBridgeModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('createBridgeModal'))
    modal.show()
  }

  const hideBridgeModal = () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('createBridgeModal'))
    if (modal) modal.hide()
  }

  const showCreateTapModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('createTapModal'))
    modal.show()
  }

  const hideTapModal = () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('createTapModal'))
    if (modal) modal.hide()
  }

  const showPortForwardModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('portForwardModal'))
    modal.show()
  }

  const hidePortForwardModal = () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('portForwardModal'))
    if (modal) modal.hide()
  }
  // TAP 详情模态框控制
  const showTapDetailsModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('tapDetailsModal'))
    modal.show()
  }

  const hideTapDetailsModal = () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('tapDetailsModal'))
    if (modal) modal.hide()
  }

  // 从详情模态框中删除 TAP 接口
  const deleteTapFromDetails = async () => {
    if (!selectedTapDetails.value) return

    const tapName = selectedTapDetails.value.name
    if (confirm(`确定要删除TAP接口 ${tapName} 吗？`)) {
      hideTapDetailsModal()
      await deleteTap(tapName)
    }
  }

  // 表单重置方法
  const resetBridgeForm = () => {
    Object.assign(bridgeForm, {
      name: '',
      ip: '',
      netmask: '255.255.255.0',
      dhcp: false,
      dhcpStart: '',
      dhcpEnd: '',
    })
  }

  const resetTapForm = () => {
    Object.assign(tapForm, {
      name: '',
      bridge: '',
    })
  }

  const resetPortForwardForm = () => {
    Object.assign(portForwardForm, {
      hostPort: null,
      guestIP: '',
      guestPort: null,
      protocol: 'tcp',
    })
  }

  // 工具方法
  const getTypeClass = type => {
    const typeClasses = {
      bridge: 'bg-primary',
      tap: 'bg-info',
      ethernet: 'bg-success',
      loopback: 'bg-secondary',
      wireless: 'bg-warning',
    }
    return typeClasses[type] || 'bg-secondary'
  }

  const formatDate = dateString => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatBytes = bytes => {
    if (!bytes || bytes === 0) return '0 B'

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))

    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Toast 消息提示方法
  const showToast = (message, type = 'success') => {
    const toast = {
      id: Date.now(),
      message,
      type,
    }

    toasts.value.push(toast)

    // 3秒后自动移除
    setTimeout(() => {
      removeToast(toast.id)
    }, 3000)
  }

  const removeToast = id => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  // 生命周期钩子
  onMounted(async () => {
    // 初始加载桥接网络接口
    await loadNetworkInterfaces()

    // 如果默认显示 TAP 标签页，也加载 TAP 接口
    if (activeTab.value === 'tap') {
      await loadTapInterfaces()
    }
  })

  onUnmounted(() => {
    if (statsInterval.value) {
      clearInterval(statsInterval.value)
    }
  })
</script>

<style scoped>
  /* 整体容器 - 与其他页面保持一致 */
  .container-fluid {
    /* background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); */
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  /* 页面标题 - 统一样式 */
  h1 {
    /* background: linear-gradient(135deg, #2c3e50, #3498db); */
    /* -webkit-background-clip: text; */
    /* -webkit-text-fill-color: transparent; */
    background-clip: text;
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 2rem !important;
    position: relative;
  }

  h1::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }

  /* 标签页导航优化 */
  .nav-tabs {
    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
    margin-bottom: 2rem;
  }

  .nav-tabs .nav-link {
    border: none;
    border-radius: 25px 25px 0 0;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    color: #6c757d;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    margin-right: 0.5rem;
  }

  .nav-tabs .nav-link:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  .nav-tabs .nav-link.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  /* 标签页内容区域 */
  .tab-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* 卡片统一样式 */
  .card {
    border: none !important;
    border-radius: 16px !important;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  }

  /* 卡片头部 */
  .card-header {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
    border-radius: 16px 16px 0 0 !important;
    padding: 1.5rem 2rem !important;
  }

  .card-header h5 {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 0;
  }

  .card-header h6 {
    color: #495057;
    font-weight: 600;
    margin-bottom: 0;
  }

  /* 卡片内容 */
  .card-body {
    padding: 2rem !important;
  }

  /* 按钮统一样式 */
  .btn {
    border-radius: 25px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .btn-outline-primary {
    border: 2px solid #667eea;
    color: #667eea;
  }

  .btn-outline-primary:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    transform: translateY(-2px);
  }

  .btn-outline-secondary {
    border: 2px solid #6c757d;
    color: #6c757d;
  }

  .btn-outline-secondary:hover {
    background: #6c757d;
    color: white;
    transform: translateY(-2px);
  }

  .btn-outline-info:hover,
  .btn-outline-danger:hover {
    transform: translateY(-2px);
  }

  .btn-sm {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
  }

  .btn-danger {
    background: #dc3545;
    border-color: #dc3545;
  }

  .btn-danger:hover {
    background: #c82333;
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: #6c757d;
    border-color: #6c757d;
  }

  .btn-secondary:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }

  /* 表格优化 */
  .table {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 0 !important;
  }

  .table th {
    font-weight: 700 !important;
    color: #2c3e50;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-top: none !important;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2) !important;
    padding: 1rem !important;
  }

  .table td {
    padding: 0.75rem 1rem !important;
    vertical-align: middle;
    border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
  }

  .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .table tbody tr:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.02));
    transition: all 0.2s ease;
  }

  /* 徽章简洁设计 */
  .badge {
    padding: 0.5em 0.75em !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    font-size: 0.75rem;
  }

  .badge.bg-primary {
    background: linear-gradient(135deg, #007bff, #0056b3) !important;
  }

  .badge.bg-success {
    background: linear-gradient(135deg, #28a745, #20c997) !important;
  }

  .badge.bg-danger {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
  }

  .badge.bg-info {
    background: linear-gradient(135deg, #17a2b8, #20c997) !important;
  }

  .badge.bg-secondary {
    background: #6c757d !important;
  }

  /* 模态框统一样式 */
  .modal-content {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 2rem 2rem 1rem;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 20px 20px 0 0;
  }

  .modal-title {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem 2rem;
  }

  /* 表单控件简洁优化 */
  .form-control,
  .form-select {
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
  }

  .form-control:focus,
  .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
  }

  .form-label {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .form-text {
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .form-check-input {
    border-radius: 4px;
    border: 2px solid #667eea;
  }

  .form-check-input:checked {
    background: #667eea;
    border-color: #667eea;
  }

  /* 空状态简洁设计 */
  .text-center.py-4 {
    padding: 3rem 2rem !important;
  }

  .text-center .bi {
    color: #6c757d;
    opacity: 0.7;
  }

  /* 通知系统简洁优化 */
  .toast-container {
    z-index: 1100 !important;
  }

  .toast {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
    backdrop-filter: blur(10px);
    margin-bottom: 1rem;
  }

  .toast.text-bg-success {
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.9), rgba(32, 201, 151, 0.8)) !important;
  }

  .toast.text-bg-danger {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(255, 0, 0, 0.8)) !important;
  }

  .toast-header {
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .toast-body {
    font-weight: 500;
  }

  /* 加载状态简化 */
  .spinner-border {
    z-index: 1060;
    border-width: 3px;
  }

  /* 按钮组简洁设计 */
  .btn-group-sm .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 16px;
  }

  .btn-group .btn:not(:last-child) {
    margin-right: 0.25rem;
  }

  /* 统计卡片特殊样式 */
  .card.bg-light {
    background: rgba(248, 249, 250, 0.8) !important;
  }

  .card.bg-light .card-header {
    background: rgba(233, 236, 239, 0.8) !important;
  }

  /* 代码样式简化 */
  code {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  /* 响应式优化 */
  @media (max-width: 768px) {
    .container-fluid {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
    }

    .nav-tabs .nav-link {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      margin-right: 0.25rem;
    }

    .tab-content {
      padding: 1rem;
    }

    .card-header {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem !important;
    }

    .card-body {
      padding: 1rem !important;
    }

    .modal-dialog {
      margin: 1rem;
    }

    .table-responsive {
      font-size: 0.875rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .container-fluid {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .tab-content,
    .card {
      background: rgba(33, 37, 41, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-header {
      background: linear-gradient(135deg, #2d2d2d, #3d3d3d) !important;
    }

    .modal-content {
      background: rgba(33, 37, 41, 0.95);
    }

    .table {
      background: rgba(33, 37, 41, 0.8);
    }

    .table th {
      background: linear-gradient(135deg, #2d2d2d, #3d3d3d);
      color: #f8f9fa;
    }

    .table td {
      color: #f8f9fa;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .form-control,
    .form-select {
      background: rgba(33, 37, 41, 0.8);
      border-color: rgba(255, 255, 255, 0.2);
      color: #f8f9fa;
    }

    .form-label {
      color: #f8f9fa;
    }

    .card-header h5,
    .card-header h6 {
      color: #f8f9fa;
    }
  }

  /* 简单的进入动画 */
  .container-fluid {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* 标签页切换动画 */
  .tab-pane {
    transition: opacity 0.3s ease;
  }

  .tab-pane:not(.active) {
    opacity: 0;
  }

  .tab-pane.active {
    opacity: 1;
  }

  /* 按钮悬停简化 */
  .btn:hover {
    transform: translateY(-2px);
  }

  .btn:active {
    transform: translateY(0);
  }

  /* 表格行简洁交互 */
  .table tbody tr {
    transition: background-color 0.2s ease;
  }

  /* 模态框关闭按钮 */
  .btn-close {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .btn-close:hover {
    opacity: 1;
  }

  /* 加载动画简化 */
  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 焦点状态简化 */
  .btn:focus,
  .form-control:focus,
  .form-select:focus {
    outline: 2px solid rgba(102, 126, 234, 0.25);
    outline-offset: 2px;
  }

  /* 小文本优化 */
  .small,
  .text-muted {
    color: #6c757d !important;
  }

  /* 强调文本 */
  .fw-semibold {
    font-weight: 600 !important;
  }

  /* 分隔线简化 */
  .border-bottom {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
  }

  /* 间距调整 */
  .mb-3:last-child {
    margin-bottom: 0 !important;
  }

  /* 按钮禁用状态 */
  .btn:disabled {
    opacity: 0.6;
    transform: none !important;
    cursor: not-allowed;
  }

  /* 表格滚动条简洁设计 */
  .table-responsive::-webkit-scrollbar {
    height: 6px;
  }

  .table-responsive::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .table-responsive::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  /* 统计数字强调 */
  .h4,
  .h5,
  .h6 {
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  /* 网络状态图标 */
  .bi-check-circle-fill {
    color: #28a745;
  }

  .bi-x-circle-fill {
    color: #dc3545;
  }

  .bi-question-circle-fill {
    color: #6c757d;
  }

  /* 减少动画模式适配 */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* 打印样式 */
  @media print {
    .container-fluid {
      background: white !important;
    }

    .btn,
    .modal,
    .toast-container {
      display: none !important;
    }

    .card {
      box-shadow: none !important;
      border: 1px solid #dee2e6 !important;
    }

    .nav-tabs {
      display: none;
    }

    .tab-content {
      border: none;
      box-shadow: none;
    }
  }
</style>
