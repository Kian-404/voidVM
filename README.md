# voidVM

A powerful virtual machine management solution based on Vue + Node.js + QEMU

> [中文文档](README_ZH.md) | English

## 📖 Project Overview

voidVM is a modern virtual machine management platform that provides an intuitive web interface for creating, configuring, and managing virtual machines. By integrating QEMU virtualization technology and Supabase cloud database, it offers users a convenient and efficient virtual machine management experience.

## ✨ Features

- 🖥️ **Intuitive Web Interface** - Modern user interface built with Vue
- 🚀 **Powerful Virtualization** - Integrated QEMU provides complete virtual machine functionality
- ☁️ **Cloud Data Management** - Uses Supabase for data persistence and user authentication
- 📱 **Responsive Design** - Supports desktop and mobile device access
- 🔧 **Online Management** - Create, start, stop, and delete virtual machines
- 📊 **Real-time Monitoring** - Virtual machine status and performance monitoring

## 💡 Features to be Implemented

- [x] Frontend page optimization (Bootstrap -> TailwindCSS) To be determined
- [x] Associate users with virtual machines (Supabase Auth and Virtual Machines)
- [x] Virtual machine status monitoring (QMP)
- [x] Virtual machine creation process optimization (Image management)
- [✅] Virtual machine image management (Image upload, delete, view)
- [✅] Virtual machine network management (Virtual network configuration)
- [x] Virtual machine document management (VM document upload, delete, view)
- [x] Virtual machine storage management (VM storage configuration)
- [✅] Virtual machine snapshot management (VM snapshot creation, deletion, viewing)
- [x] Backend JavaScript upgrade to TypeScript then upgrade to Bun
- [x] Project testing addition (Using Vitest)
- [✅] Project deployment optimization (Using Docker)
- [✅] Project documentation optimization (Using VitePress)
- [x] Project code optimization (Using ESLint and Prettier)
- [x] Project CI/CD optimization (Using GitHub Actions)
- [x] Project performance optimization (Using Bun and Vitest)

## 🛠️ Tech Stack

- **Frontend**: Vue + Composition API
- **Backend**: Node.js + Express
- **Virtualization**: QEMU/KVM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 🚀 Quick Start

### Requirements

- Node.js >= 18.0.0
- npm >= 8.0.0
- QEMU installed and configured
- Supabase account

### Installation Steps

1. **Clone the Project**

```bash
git clone https://github.com/Kian-404/voidVM.git
cd voidVM
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Environment Configuration**

```bash
# Copy environment variable template
cp .env.example .env

# Edit .env file and fill in Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. **Start Services**

```bash
pnpm dev
```

### QEMU Configuration

Ensure QEMU is installed on your system:

```bash
# Ubuntu/Debian
sudo apt-get install qemu-kvm qemu-utils

# CentOS/RHEL
sudo yum install qemu-kvm qemu-img

# macOS
brew install qemu
```

## 📱 Usage Instructions

1. **User Registration/Login**

   - Visit `http://localhost:3000`
   - Use Supabase Auth for user authentication

2. **Create Virtual Machine**

   - Click the "Create Virtual Machine" button
   - Configure CPU, memory, storage, and other parameters
   - Select operating system image

3. **Manage Virtual Machines**
   - Start/stop virtual machines
   - View virtual machine status and performance
   - Modify virtual machine configuration
   - Delete unnecessary virtual machines

## 📁 Project Structure

```
voidVM/
├── web/                 # Vue3 frontend application
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/         # Page views
│   │   ├── stores/        # Pinia state management
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend service
│   ├── routes/            # API routes
│   ├── controllers/       # Controllers
│   ├── middleware/        # Middleware
│   ├── services/          # Business logic
│   └── package.json
├── docs/                  # Project documentation
├── scripts/               # Script files
└── README.md
```

## 🔧 API Endpoints

### Virtual Machine Management

- `GET /api/vms` - Get virtual machine list
- `POST /api/vms` - Create virtual machine
- `GET /api/vms/:id` - Get virtual machine details
- `PUT /api/vms/:id` - Update virtual machine configuration
- `DELETE /api/vms/:id` - Delete virtual machine
- `POST /api/vms/:id/start` - Start virtual machine
- `POST /api/vms/:id/stop` - Stop virtual machine

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [QEMU](https://www.qemu.org/) - Open source virtualization software
- [Supabase](https://supabase.com/) - Open source Firebase alternative

## 📞 Contact

For questions or suggestions, please contact us through:

- Submit an [Issue](https://github.com/Kian-404/voidVM/issues)
