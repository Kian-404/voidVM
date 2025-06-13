import { Toast } from "bootstrap";
export const useShowToast = () => {
  /**
   * 显示 Bootstrap Toast 通知
   * @param {string} message - 要显示的消息
   * @param {string} type - 通知类型 ('success', 'danger', 'warning', 'info')
   * @param {number} duration - 显示时间(毫秒)
   */
  const showToast = (message: string, type = "info", duration = 3000) => {
    // 获取 Toast 容器
    const toastContainer: HTMLElement = document.getElementById(
      "toastContainer"
    ) as HTMLElement;

    // 创建唯一 ID
    const toastId = "toast-" + Date.now();

    // 根据类型设置背景颜色类
    const bgClass = `bg-${type}`;
    const textClass = type === "warning" ? "text-dark" : "text-white";

    // 设置标题
    let title;
    switch (type) {
      case "success":
        title = "成功";
        break;
      case "danger":
        title = "错误";
        break;
      case "warning":
        title = "警告";
        break;
      case "info":
        title = "信息";
        break;
      default:
        title = "通知";
    }

    // 创建 Toast HTML
    const toastHtml = `
    <div id="${toastId}" class="toast ${bgClass} ${textClass}" role="showToast" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">${title}</strong>
        <small>刚刚</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

    // 添加 Toast 到容器
    toastContainer.insertAdjacentHTML("beforeend", toastHtml);

    // 获取新创建的 Toast 元素
    const toastElement = document.getElementById(toastId) as HTMLElement;

    // 创建 Bootstrap Toast 实例
    const toast = new Toast(toastElement, {
      autohide: true,
      delay: duration,
    });

    // 显示 Toast
    toast.show();

    // 在 Toast 隐藏后从 DOM 中移除
    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove();
    });
  };

  // 便捷函数
  const showSuccessToast = (message: string, duration = 3000) => {
    showToast(message, "success", duration);
  };

  const showErrorToast = (message: string, duration = 5000) => {
    showToast(message, "danger", duration);
  };

  const showWarningToast = (message: string, duration = 4000) => {
    showToast(message, "warning", duration);
  };

  const showInfoToast = (message: string, duration = 3000) => {
    showToast(message, "info", duration);
  };
  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };
};
