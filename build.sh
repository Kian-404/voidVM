#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置变量
BASE_IMAGE_NAME="viod-vm-base"
BASE_IMAGE_TAG="latest"
APP_IMAGE_NAME="void-vm-app"
APP_IMAGE_TAG="latest"
CONTAINER_NAME="void-vm-container"

# 函数：打印彩色信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查命令是否成功
check_command() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$2"
        exit 1
    fi
}

# 清理函数
cleanup() {
    print_info "Cleaning up old containers and images..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# 主要构建函数
build_base_image() {
    print_info "Building base image: ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}"
    print_info "This may take a while (especially QEMU compilation)..."

    docker build -f Dockerfile.base -t ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG} .
    check_command "Base image built successfully!" "Failed to build base image!"

    # 显示基础镜像信息
    print_info "Base image information:"
    docker images ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}
}

build_app_image() {
    print_info "Building application image: ${APP_IMAGE_NAME}:${APP_IMAGE_TAG}"

    docker build -f Dockerfile -t ${APP_IMAGE_NAME}:${APP_IMAGE_TAG} .
    check_command "Application image built successfully!" "Failed to build application image!"

    # 显示应用镜像信息
    print_info "Application image information:"
    docker images ${APP_IMAGE_NAME}:${APP_IMAGE_TAG}
}

run_container() {
    print_info "Starting container: ${CONTAINER_NAME}"

    docker run -d \
        -p 3000:3000 \
        -p 6080:6080 \
        --privileged \
        --name ${CONTAINER_NAME} \
        ${APP_IMAGE_NAME}:${APP_IMAGE_TAG}

    check_command "Container started successfully!" "Failed to start container!"

    # 等待几秒让容器完全启动
    sleep 3

    # 检查容器状态
    if docker ps | grep -q ${CONTAINER_NAME}; then
        print_success "Container is running!"
        print_info "Container logs:"
        docker logs ${CONTAINER_NAME}
        print_info "Access your application at:"
        echo "  - Main app: http://localhost:3000"
        echo "  - NoVNC: http://localhost:6080"
    else
        print_error "Container failed to start properly!"
        print_info "Container logs:"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --base-only     只构建基础镜像"
    echo "  --app-only      只构建应用镜像（需要基础镜像已存在）"
    echo "  --no-run        构建镜像但不运行容器"
    echo "  --cleanup       清理旧的容器和镜像"
    echo "  --help          显示此帮助信息"
    echo ""
    echo "Examples:"
    echo "  $0                    # 完整构建和运行"
    echo "  $0 --base-only       # 只构建基础镜像"
    echo "  $0 --app-only        # 只构建应用镜像"
    echo "  $0 --no-run          # 构建但不运行"
}

# 解析命令行参数
BASE_ONLY=false
APP_ONLY=false
NO_RUN=false
CLEANUP_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --base-only)
            BASE_ONLY=true
            shift
            ;;
        --app-only)
            APP_ONLY=true
            shift
            ;;
        --no-run)
            NO_RUN=true
            shift
            ;;
        --cleanup)
            CLEANUP_ONLY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# 主执行逻辑
print_info "Starting Docker build process..."
print_info "Timestamp: $(date)"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running or not accessible!"
    exit 1
fi

# 只清理
if [ "$CLEANUP_ONLY" = true ]; then
    cleanup
    print_success "Cleanup completed!"
    exit 0
fi

# 清理旧容器
cleanup

# 检查必需文件
if [ ! -f "Dockerfile.base" ]; then
    print_error "Dockerfile.base not found!"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found!"
    exit 1
fi

# 执行构建
if [ "$BASE_ONLY" = true ]; then
    build_base_image
elif [ "$APP_ONLY" = true ]; then
    # 检查基础镜像是否存在
    if ! docker images | grep -q "${BASE_IMAGE_NAME}.*${BASE_IMAGE_TAG}"; then
        print_error "Base image ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG} not found!"
        print_info "Please run: $0 --base-only first"
        exit 1
    fi
    build_app_image
else
    # 完整构建流程
    build_base_image
    print_info "Waiting 2 seconds before building application image..."
    sleep 2
    build_app_image
fi

# 运行容器（除非指定不运行）
if [ "$NO_RUN" = false ] && [ "$BASE_ONLY" = false ]; then
    run_container
fi

print_success "Build process completed successfully!"
print_info "Summary:"
echo "  - Base image: ${BASE_IMAGE_NAME}:${BASE_IMAGE_TAG}"
if [ "$BASE_ONLY" = false ]; then
    echo "  - App image: ${APP_IMAGE_NAME}:${APP_IMAGE_TAG}"
fi
if [ "$NO_RUN" = false ] && [ "$BASE_ONLY" = false ]; then
    echo "  - Container: ${CONTAINER_NAME}"
fi
