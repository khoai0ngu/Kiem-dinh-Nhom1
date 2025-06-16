class App {
  constructor() {
    this.currentUser = null;
    this.currentView = "dashboard";

    // Initialize authentication first
    this.authManager = new AuthManager();

    // Initialize managers
    this.teacherManager = new TeacherManager();
    this.courseManager = new CourseManager();
    this.reportsManager = new ReportsManager();
    this.paymentCalculator = new PaymentCalculator();
    this.departmentManager = new DepartmentManager();

    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupApp();
      });
    } else {
      this.setupApp();
    }
  }

  setupApp() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    const currentUser = this.authManager.getCurrentUser();
    if (!currentUser) {
      this.showLoginForm();
      return;
    }

    this.currentUser = currentUser;
    this.initializeMainApp();
  }

  initializeMainApp() {
    this.updateUIByRole();
    this.setupEventListeners();
    this.loadDashboard();
  }

  showLoginForm() {
    document.body.innerHTML = `
      <div class="login-container">
        <div class="login-wrapper">
          <div class="login-header">
            <div class="login-logo">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <h1>TeachPay System</h1>
            <p>Hệ thống quản lý thanh toán giảng dạy</p>
          </div>

          <form id="loginForm" class="login-form">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user"></i>
                Tên đăng nhập
              </label>
              <input type="text" id="username" class="form-input" required placeholder="Nhập tên đăng nhập">
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-lock"></i>
                Mật khẩu
              </label>
              <input type="password" id="password" class="form-input" required placeholder="Nhập mật khẩu">
            </div>

            <button type="submit" class="btn btn-primary btn-login">
              <i class="fas fa-sign-in-alt"></i>
              Đăng nhập
            </button>

            <div class="login-demo">
              <p>Tài khoản demo:</p>
              <div class="demo-accounts">
                <div class="demo-item" onclick="app.quickLogin('admin', 'admin123')">
                  <strong>Admin:</strong> admin / admin123
                </div>
                <div class="demo-item" onclick="app.quickLogin('dean_cntt', 'dean123')">
                  <strong>Trưởng khoa CNTT:</strong> dean_cntt / dean123
                </div>
                <div class="demo-item" onclick="app.quickLogin('gv001', 'teacher123')">
                  <strong>Giáo viên:</strong> gv001 / teacher123
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-wrapper {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .login-logo {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .login-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .login-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .login-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-login {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .login-demo {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
          text-align: center;
        }

        .login-demo p {
          margin: 0 0 1rem 0;
          font-weight: 500;
          color: #6b7280;
        }

        .demo-accounts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .demo-item {
          padding: 0.5rem 1rem;
          background: #f9fafb;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-size: 0.875rem;
        }

        .demo-item:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
        }

        .demo-item strong {
          color: #3b82f6;
        }

        .alert {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          color: white;
          font-weight: 500;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 300px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .alert-error {
          background: #ef4444;
        }

        .alert-success {
          background: #10b981;
        }

        .alert-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0;
          margin-left: auto;
        }
      </style>
    `;

    // Setup login form event
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      this.attemptLogin(username, password);
    });
  }

  quickLogin(username, password) {
    document.getElementById("username").value = username;
    document.getElementById("password").value = password;
    this.attemptLogin(username, password);
  }

  attemptLogin(username, password) {
    const result = this.authManager.login(username, password);
    if (result.success) {
      this.currentUser = result.user;
      // Reload the page to initialize main app
      location.reload();
    } else {
      this.showAlert(result.message || "Đăng nhập thất bại!", "error");
    }
  }

  updateUIByRole() {
    const user = this.authManager.getCurrentUser();
    const role = sampleData.roles.find((r) => r.id === user.roleId);

    // Update sidebar based on role
    this.updateSidebarByRole(role.name);

    // Update header user info
    const userNameSpan = document.getElementById("userName");
    if (userNameSpan) {
      const teacher = user.teacherId
        ? sampleData.teachers.find((t) => t.id === user.teacherId)
        : null;
      const displayName = teacher ? teacher.fullName : user.username;
      userNameSpan.innerHTML = `
        <div class="user-info">
          <span class="user-name">${displayName}</span>
          <span class="user-role">${role.displayName}</span>
        </div>
      `;
    }

    // Add user role info to header
    const header = document.querySelector(".header");
    if (header && !document.querySelector(".role-indicator")) {
      const roleIndicator = document.createElement("div");
      roleIndicator.className = "role-indicator";
      roleIndicator.innerHTML = `
        <span class="role-badge role-${role.name.toLowerCase()}">${
        role.displayName
      }</span>
      `;
      header.appendChild(roleIndicator);
    }
  }

  updateSidebarByRole(roleName) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    let sidebarContent = "";

    if (roleName === "Admin") {
      // Admin sees everything
      sidebarContent = `
        <div class="nav-section">
          <h3>TỔNG QUAN</h3>
          <div class="nav-item active" data-view="dashboard">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </div>
        </div>

        <div class="nav-section">
          <h3>QUẢN LÝ GIÁO VIÊN</h3>
          <div class="nav-item" data-view="degrees">
            <i class="fas fa-graduation-cap"></i> Bằng cấp
          </div>
          <div class="nav-item" data-view="departments">
            <i class="fas fa-building"></i> Khoa
          </div>
          <div class="nav-item" data-view="teachers">
            <i class="fas fa-users"></i> Giáo viên
          </div>
          <div class="nav-item" data-view="teacher-stats">
            <i class="fas fa-chart-bar"></i> Thống kê GV
          </div>
        </div>

        <div class="nav-section">
          <h3>LÓP HỌC PHẦN</h3>
          <div class="nav-item" data-view="subjects">
            <i class="fas fa-book"></i> Học phần
          </div>
          <div class="nav-item" data-view="semesters">
            <i class="fas fa-calendar"></i> Kì học
          </div>
          <div class="nav-item" data-view="classes">
            <i class="fas fa-chalkboard"></i> Lớp học
          </div>
          <div class="nav-item" data-view="assignments">
            <i class="fas fa-user-tie"></i> Phân công GV
          </div>
          <div class="nav-item" data-view="class-stats">
            <i class="fas fa-chart-line"></i> Thống kê lớp
          </div>
        </div>

        <div class="nav-section">
          <h3>TÍNH TIỀN DẠY HỌC</h3>
          <div class="nav-item" data-view="rate-settings">
            <i class="fas fa-cog"></i> Định mức
          </div>
          <div class="nav-item" data-view="teacher-coefficients">
            <i class="fas fa-percentage"></i> Hệ số GV
          </div>
          <div class="nav-item" data-view="class-coefficients">
            <i class="fas fa-calculator"></i> Hệ số lớp
          </div>
          <div class="nav-item" data-view="payment-calculation">
            <i class="fas fa-money-bill-wave"></i> Tính lương
          </div>
        </div>

        <div class="nav-section">
          <h3>BÁO CÁO</h3>
          <div class="nav-item" data-view="salary-reports">
            <i class="fas fa-file-invoice-dollar"></i> Báo cáo lương
          </div>
          <div class="nav-item" data-view="class-reports">
            <i class="fas fa-file-alt"></i> Báo cáo lớp
          </div>
          <div class="nav-item" data-view="teacher-reports">
            <i class="fas fa-file-user"></i> Báo cáo GV
          </div>
        </div>
      `;
    } else if (roleName === "Dean") {
      // Dean manages their department
      sidebarContent = `
        <div class="nav-section">
          <h3>TỔNG QUAN</h3>
          <div class="nav-item active" data-view="dashboard">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </div>
        </div>

        <div class="nav-section">
          <h3>QUẢN LÝ KHOA</h3>
          <div class="nav-item" data-view="department-teachers">
            <i class="fas fa-users"></i> Giáo viên khoa
          </div>
          <div class="nav-item" data-view="department-classes">
            <i class="fas fa-chalkboard"></i> Lớp học khoa
          </div>
          <div class="nav-item" data-view="department-assignments">
            <i class="fas fa-user-tie"></i> Phân công GV
          </div>
        </div>

        <div class="nav-section">
          <h3>BÁO CÁO KHOA</h3>
          <div class="nav-item" data-view="department-salary-reports">
            <i class="fas fa-file-invoice-dollar"></i> Báo cáo lương
          </div>
          <div class="nav-item" data-view="department-teacher-reports">
            <i class="fas fa-file-user"></i> Báo cáo GV
          </div>
        </div>
      `;
    } else if (roleName === "Teacher") {
      // Teacher sees only personal info
      sidebarContent = `
        <div class="nav-section">
          <h3>THÔNG TIN CÁ NHÂN</h3>
          <div class="nav-item active" data-view="my-profile">
            <i class="fas fa-user"></i> Hồ sơ của tôi
          </div>
          <div class="nav-item" data-view="my-schedule">
            <i class="fas fa-calendar-alt"></i> Lịch dạy
          </div>
          <div class="nav-item" data-view="my-classes">
            <i class="fas fa-chalkboard"></i> Lớp của tôi
          </div>
          <div class="nav-item" data-view="my-salary">
            <i class="fas fa-money-bill-wave"></i> Lương của tôi
          </div>
        </div>
      `;
    }

    sidebar.innerHTML = sidebarContent;
  }

  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        if (view) {
          this.navigateTo(view);
        }
      });
    });

    // Modal controls
    const modal = document.getElementById("modal");
    const modalClose = document.getElementById("modalClose");
    const modalCancel = document.getElementById("modalCancel");
    const modalSave = document.getElementById("modalSave");

    if (modalClose) {
      modalClose.addEventListener("click", () => this.closeModal());
    }

    if (modalCancel) {
      modalCancel.addEventListener("click", () => this.closeModal());
    }

    if (modalSave) {
      modalSave.addEventListener("click", () => this.handleModalSave());
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // Add new button
    const addNewBtn = document.getElementById("addNewBtn");
    if (addNewBtn) {
      addNewBtn.addEventListener("click", () => this.handleAddNew());
    }
  }

  async navigateTo(view) {
    // Check permissions before navigation
    if (!this.hasPermissionForView(view)) {
      this.showAlert("Bạn không có quyền truy cập chức năng này!", "error");
      return;
    }

    // Update active navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    const activeNavItem = document.querySelector(`[data-view="${view}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add("active");
    }

    this.currentView = view;

    // Show/hide add button based on view and permissions
    const addNewBtn = document.getElementById("addNewBtn");
    const canAdd = this.canAddInView(view);

    if (addNewBtn) {
      addNewBtn.style.display = canAdd ? "inline-flex" : "none";
    }

    // Update page title
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = this.getViewTitle(view);
    }

    // Route to appropriate view
    try {
      await this.loadViewContent(view);
    } catch (error) {
      console.error("Error loading view:", view, error);
      this.showAlert("Có lỗi xảy ra khi tải trang!", "error");
    }
  }

  hasPermissionForView(view) {
    const user = this.authManager.getCurrentUser();
    if (!user) return false;

    const role = sampleData.roles.find((r) => r.id === user.roleId);
    if (!role) return false;

    // Admin has all permissions
    if (role.name === "Admin") return true;

    // Define view permissions
    const viewPermissions = {
      dashboard: ["*"],
      "department-teachers": ["view_department_teachers"],
      "department-classes": ["manage_department_classes"],
      "department-assignments": ["assign_teachers"],
      "department-salary-reports": ["view_department_salary"],
      "department-teacher-reports": ["view_department_reports"],
      "my-profile": ["view_own_schedule"],
      "my-schedule": ["view_own_schedule"],
      "my-classes": ["view_own_classes"],
      "my-salary": ["view_own_salary"],
    };

    const requiredPermissions = viewPermissions[view] || [];
    return requiredPermissions.some(
      (permission) =>
        permission === "*" || role.permissions.includes(permission)
    );
  }

  canAddInView(view) {
    const user = this.authManager.getCurrentUser();
    const role = sampleData.roles.find((r) => r.id === user.roleId);

    if (role.name === "Admin") {
      return [
        "degrees",
        "departments",
        "teachers",
        "subjects",
        "semesters",
        "classes",
        "assignments",
      ].includes(view);
    }

    if (role.name === "Dean") {
      return ["department-assignments"].includes(view);
    }

    return false;
  }

  getViewTitle(view) {
    const titles = {
      dashboard: "Dashboard",
      degrees: "Quản lý bằng cấp",
      departments: "Quản lý khoa",
      teachers: "Quản lý giáo viên",
      "teacher-stats": "Thống kê giáo viên",
      subjects: "Quản lý học phần",
      semesters: "Quản lý kì học",
      classes: "Quản lý lớp học",
      assignments: "Phân công giảng viên",
      "class-stats": "Thống kê lớp học",
      "rate-settings": "Thiết lập định mức",
      "teacher-coefficients": "Hệ số giáo viên",
      "class-coefficients": "Hệ số lớp học",
      "payment-calculation": "Tính tiền dạy học",
      "salary-reports": "Báo cáo lương",
      "class-reports": "Báo cáo lớp học",
      "teacher-reports": "Báo cáo giáo viên",
      "department-teachers": "Giáo viên khoa",
      "department-classes": "Lớp học khoa",
      "department-assignments": "Phân công giáo viên",
      "department-salary-reports": "Báo cáo lương khoa",
      "department-teacher-reports": "Báo cáo giáo viên khoa",
      "my-profile": "Hồ sơ của tôi",
      "my-schedule": "Lịch dạy của tôi",
      "my-classes": "Lớp của tôi",
      "my-salary": "Lương của tôi",
      "new-payment-calculation": "Công thức tính lương mới",
    };
    return titles[view] || "Dashboard";
  }

  async loadViewContent(view) {
    switch (view) {
      case "dashboard":
        await this.loadDashboard();
        break;

      // Admin views
      case "degrees":
        await this.teacherManager.loadDegreesView();
        break;
      case "departments":
        await this.teacherManager.loadDepartmentsView();
        break;
      case "teachers":
        await this.teacherManager.loadTeachersView();
        break;
      case "teacher-stats":
        await this.teacherManager.loadTeacherStatsView();
        break;
      case "subjects":
        await this.courseManager.loadSubjectsView();
        break;
      case "semesters":
        await this.courseManager.loadSemestersView();
        break;
      case "classes":
        await this.courseManager.loadClassesView();
        break;
      case "assignments":
        await this.courseManager.loadAssignmentsView();
        break;
      case "class-stats":
        await this.courseManager.loadClassStatsView();
        break;
      case "rate-settings":
        await this.paymentCalculator.loadRateSettingsView();
        break;
      case "teacher-coefficients":
        await this.paymentCalculator.loadTeacherCoefficientsView();
        break;
      case "class-coefficients":
        await this.paymentCalculator.loadClassCoefficientsView();
        break;
      case "payment-calculation":
        await this.paymentCalculator.loadPaymentCalculationView();
        break;
      case "salary-reports":
        await this.reportsManager.loadSalaryReportsView();
        break;
      case "class-reports":
        await this.reportsManager.loadClassReportsView();
        break;
      case "teacher-reports":
        await this.reportsManager.loadTeacherReportsView();
        break;

      // Dean views
      case "department-teachers":
        await this.departmentManager.loadDepartmentTeachersView();
        break;
      case "department-classes":
        await this.departmentManager.loadDepartmentClassesView();
        break;
      case "department-assignments":
        await this.departmentManager.loadDepartmentAssignmentsView();
        break;
      case "department-salary-reports":
        await this.departmentManager.loadDepartmentSalaryReportsView();
        break;
      case "department-teacher-reports":
        await this.departmentManager.loadDepartmentTeacherReportsView();
        break;

      // Teacher views
      case "my-profile":
        await this.loadMyProfileView();
        break;
      case "my-schedule":
        await this.loadMyScheduleView();
        break;
      case "my-classes":
        await this.loadMyClassesView();
        break;
      case "my-salary":
        await this.loadMySalaryView();
        break;
      case "new-payment-calculation":
        await this.paymentCalculator.loadNewPaymentCalculationView();
        break;

      default:
        await this.loadDashboard();
    }
  }

  // Teacher personal views
  async loadMyProfileView() {
    const user = this.authManager.getCurrentUser();
    const teacher = sampleData.teachers.find((t) => t.id === user.teacherId);
    const department = sampleData.departments.find(
      (d) => d.id === teacher?.departmentId
    );
    const degree = sampleData.degrees.find((d) => d.id === teacher?.degreeId);

    if (!teacher) {
      this.showAlert("Không tìm thấy thông tin giáo viên!", "error");
      return;
    }

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-info">
            <h2>${teacher.fullName}</h2>
            <p class="profile-role">${degree?.fullName || "N/A"} - ${
      department?.fullName || "N/A"
    }</p>
            <p class="profile-code">Mã số: ${teacher.code}</p>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-section">
            <h3>Thông tin cá nhân</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Họ tên:</label>
                <span>${teacher.fullName}</span>
              </div>
              <div class="detail-item">
                <label>Ngày sinh:</label>
                <span>${Utils.formatDate(teacher.birthDate)}</span>
              </div>
              <div class="detail-item">
                <label>Điện thoại:</label>
                <span>${teacher.phone}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>${teacher.email}</span>
              </div>
              <div class="detail-item">
                <label>Khoa:</label>
                <span>${department?.fullName || "N/A"}</span>
              </div>
              <div class="detail-item">
                <label>Bằng cấp:</label>
                <span>${degree?.fullName || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadMyScheduleView() {
    const user = this.authManager.getCurrentUser();
    const teacherAssignments = sampleData.assignments.filter(
      (a) => a.teacherId === user.teacherId
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="schedule-container">
        <h3>Lịch dạy của tôi</h3>
        <div class="schedule-list">
          ${teacherAssignments
            .map((assignment) => {
              const cls = sampleData.classes.find(
                (c) => c.id === assignment.classId
              );
              const subject = sampleData.subjects.find(
                (s) => s.id === cls?.subjectId
              );
              const semester = sampleData.semesters.find(
                (s) => s.id === cls?.semesterId
              );

              return `
              <div class="schedule-item">
                <div class="schedule-header">
                  <h4>${cls?.className || "N/A"}</h4>
                  <span class="schedule-semester">${semester?.name} ${
                semester?.academicYear
              }</span>
                </div>
                <div class="schedule-details">
                  <div class="schedule-info">
                    <i class="fas fa-book"></i>
                    <span>${subject?.name || "N/A"}</span>
                  </div>
                  <div class="schedule-info">
                    <i class="fas fa-users"></i>
                    <span>${cls?.studentCount || 0} sinh viên</span>
                  </div>
                  <div class="schedule-info">
                    <i class="fas fa-clock"></i>
                    <span>${cls?.schedule || "N/A"}</span>
                  </div>
                  <div class="schedule-info">
                    <i class="fas fa-door-open"></i>
                    <span>Phòng ${cls?.room || "N/A"}</span>
                  </div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  async loadMyClassesView() {
    const user = this.authManager.getCurrentUser();
    const teacherAssignments = sampleData.assignments.filter(
      (a) => a.teacherId === user.teacherId
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="my-classes-container">
        <h3>Lớp học của tôi</h3>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã lớp</th>
                <th>Tên lớp</th>
                <th>Học phần</th>
                <th>Kì học</th>
                <th>Số SV</th>
                <th>Lịch học</th>
                <th>Phòng</th>
              </tr>
            </thead>
            <tbody>
              ${teacherAssignments
                .map((assignment, index) => {
                  const cls = sampleData.classes.find(
                    (c) => c.id === assignment.classId
                  );
                  const subject = sampleData.subjects.find(
                    (s) => s.id === cls?.subjectId
                  );
                  const semester = sampleData.semesters.find(
                    (s) => s.id === cls?.semesterId
                  );

                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${cls?.classCode || "N/A"}</strong></td>
                    <td>${cls?.className || "N/A"}</td>
                    <td>${subject?.name || "N/A"}</td>
                    <td>${semester?.name} ${semester?.academicYear}</td>
                    <td>${cls?.studentCount || 0}</td>
                    <td>${cls?.schedule || "N/A"}</td>
                    <td>${cls?.room || "N/A"}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async loadMySalaryView() {
    const user = this.authManager.getCurrentUser();
    const teacher = sampleData.teachers.find((t) => t.id === user.teacherId);
    const teacherAssignments = sampleData.assignments.filter(
      (a) => a.teacherId === user.teacherId
    );

    let totalSalary = 0;
    const salaryDetails = teacherAssignments.map((assignment) => {
      const cls = sampleData.classes.find((c) => c.id === assignment.classId);
      const subject = sampleData.subjects.find((s) => s.id === cls?.subjectId);
      const payment = this.reportsManager.calculateSimplePayment(
        teacher,
        cls,
        subject
      );
      totalSalary += payment.totalSalary;
      return { assignment, cls, subject, payment };
    });

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="my-salary-container">
        <div class="salary-summary">
          <h3>Tổng lương dự kiến: ${Utils.formatCurrency(totalSalary)}</h3>
        </div>
        
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Lớp học</th>
                <th>Học phần</th>
                <th>Số tiết</th>
                <th>Số SV</th>
                <th>Hệ số</th>
                <th>Lương cơ bản</th>
                <th>Phụ cấp</th>
                <th>Tổng cộng</th>
              </tr>
            </thead>
            <tbody>
              ${salaryDetails
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.cls?.className || "N/A"}</td>
                  <td>${item.subject?.name || "N/A"}</td>
                  <td>${item.subject?.periods || 0}</td>
                  <td>${item.cls?.studentCount || 0}</td>
                  <td>${item.cls?.coefficient || 1.0}</td>
                  <td>${Utils.formatCurrency(item.payment.baseSalary)}</td>
                  <td>${Utils.formatCurrency(item.payment.allowance)}</td>
                  <td><strong>${Utils.formatCurrency(
                    item.payment.totalSalary
                  )}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr class="table-total">
                <td colspan="8"><strong>Tổng cộng</strong></td>
                <td><strong>${Utils.formatCurrency(totalSalary)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  async loadDashboard() {
    const user = this.authManager.getCurrentUser();
    const role = sampleData.roles.find((r) => r.id === user.roleId);

    // Load different dashboard based on role
    if (role.name === "Teacher") {
      await this.loadTeacherDashboard();
    } else if (role.name === "Dean") {
      await this.loadDeanDashboard();
    } else {
      await this.loadAdminDashboard();
    }
  }

  async loadTeacherDashboard() {
    const user = this.authManager.getCurrentUser();
    const teacherAssignments = sampleData.assignments.filter(
      (a) => a.teacherId === user.teacherId
    );
    const teacher = sampleData.teachers.find((t) => t.id === user.teacherId);

    let totalSalary = 0;
    teacherAssignments.forEach((assignment) => {
      const cls = sampleData.classes.find((c) => c.id === assignment.classId);
      const subject = sampleData.subjects.find((s) => s.id === cls?.subjectId);
      const payment = this.reportsManager.calculateSimplePayment(
        teacher,
        cls,
        subject
      );
      totalSalary += payment.totalSalary;
    });

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="teacher-dashboard">
        <div class="welcome-section">
          <h2><i class="fas fa-user-tie"></i> Chào mừng, ${
            teacher?.fullName
          }!</h2>
          <p class="text-muted">Thông tin giảng dạy của bạn</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
              <i class="fas fa-chalkboard"></i>
            </div>
            <div class="stat-info">
              <h3>${teacherAssignments.length}</h3>
              <p>Lớp đang dạy</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981;">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="stat-info">
              <h3>${Utils.formatCurrency(totalSalary)}</h3>
              <p>Lương dự kiến</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadDeanDashboard() {
    const user = this.authManager.getCurrentUser();
    const departmentTeachers = sampleData.teachers.filter(
      (t) => t.departmentId === user.departmentId
    );
    const department = sampleData.departments.find(
      (d) => d.id === user.departmentId
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="dean-dashboard">
        <div class="welcome-section">
          <h2><i class="fas fa-building"></i> Dashboard Trưởng khoa</h2>
          <p class="text-muted">Quản lý ${department?.fullName}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h3>${departmentTeachers.length}</h3>
              <p>Giáo viên khoa</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadAdminDashboard() {
    // Keep the existing dashboard for admin
    const contentBody = document.getElementById("contentBody");
    if (!contentBody) return;

    // Calculate statistics
    const stats = {
      totalTeachers: sampleData.teachers.length,
      totalClasses: sampleData.classes.length,
      totalAssignments: sampleData.assignments.length,
      totalDepartments: sampleData.departments.length,
      totalSubjects: sampleData.subjects.length,
      totalSemesters: sampleData.semesters.length,
    };

    const assignmentRate =
      stats.totalClasses > 0
        ? ((stats.totalAssignments / stats.totalClasses) * 100).toFixed(1)
        : 0;

    contentBody.innerHTML = `
            <div class="dashboard">
                <div class="dashboard-header">
                    <h2><i class="fas fa-tachometer-alt"></i> Tổng quan hệ thống</h2>
                    <p class="text-muted">Chào mừng bạn đến với hệ thống quản lý thanh toán giảng dạy</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #3b82f6;">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalTeachers}</h3>
                            <p>Giáo viên</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #10b981;">
                            <i class="fas fa-chalkboard"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalClasses}</h3>
                            <p>Lớp học</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #f59e0b;">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalAssignments}</h3>
                            <p>Phân công</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #ef4444;">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalDepartments}</h3>
                            <p>Khoa</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #8b5cf6;">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalSubjects}</h3>
                            <p>Học phần</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #06b6d4;">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalSemesters}</h3>
                            <p>Kì học</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-content">
                    <div class="dashboard-row">
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3><i class="fas fa-chart-pie"></i> Tỷ lệ phân công</h3>
                            </div>
                            <div class="card-body">
                                <div class="progress-circle">
                                    <div class="circle-progress" style="background: conic-gradient(#3b82f6 0deg ${
                                      assignmentRate * 3.6
                                    }deg, #e5e7eb ${
      assignmentRate * 3.6
    }deg 360deg);">
                                        <div class="circle-inner">
                                            <span class="percentage">${assignmentRate}%</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="progress-detail text-center mt-2">
                                    ${stats.totalAssignments}/${
      stats.totalClasses
    } lớp đã được phân công
                                </p>
                            </div>
                        </div>

                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3><i class="fas fa-list-ul"></i> Thống kê nhanh</h3>
                            </div>
                            <div class="card-body">
                                <div class="quick-stats">
                                    <div class="quick-stat-item">
                                        <div class="stat-icon-small">
                                            <i class="fas fa-user-check"></i>
                                        </div>
                                        <div>
                                            <span class="stat-label">Giáo viên có phân công</span>
                                            <span class="stat-value">${
                                              new Set(
                                                sampleData.assignments.map(
                                                  (a) => a.teacherId
                                                )
                                              ).size
                                            } người</span>
                                        </div>
                                    </div>
                                    <div class="quick-stat-item">
                                        <div class="stat-icon-small">
                                            <i class="fas fa-exclamation-triangle"></i>
                                        </div>
                                        <div>
                                            <span class="stat-label">Lớp chưa phân công</span>
                                            <span class="stat-value">${
                                              stats.totalClasses -
                                              stats.totalAssignments
                                            } lớp</span>
                                        </div>
                                    </div>
                                    <div class="quick-stat-item">
                                        <div class="stat-icon-small">
                                            <i class="fas fa-graduation-cap"></i>
                                        </div>
                                        <div>
                                            <span class="stat-label">Học phần đang mở</span>
                                            <span class="stat-value">${
                                              stats.totalSubjects
                                            } môn</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Hoạt động gần đây</h3>
                        </div>
                        <div class="card-body">
                            <div class="activity-list">
                                <div class="activity-item">
                                    <div class="activity-icon success">
                                        <i class="fas fa-check"></i>
                                    </div>
                                    <div class="activity-content">
                                        <span>Hệ thống được khởi tạo thành công</span>
                                        <small>${new Date().toLocaleString(
                                          "vi-VN"
                                        )}</small>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-icon info">
                                        <i class="fas fa-database"></i>
                                    </div>
                                    <div class="activity-content">
                                        <span>Dữ liệu mẫu đã được tải (${
                                          stats.totalTeachers
                                        } giáo viên, ${
      stats.totalClasses
    } lớp)</span>
                                        <small>${new Date().toLocaleString(
                                          "vi-VN"
                                        )}</small>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-icon warning">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="activity-content">
                                        <span>Có ${
                                          stats.totalClasses -
                                          stats.totalAssignments
                                        } lớp học chưa được phân công giáo viên</span>
                                        <small>${new Date().toLocaleString(
                                          "vi-VN"
                                        )}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .dashboard-header {
                    margin-bottom: 2rem;
                }
                
                .dashboard-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                
                .dashboard-card {
                    background: var(--bg-primary);
                    border-radius: 0.5rem;
                    box-shadow: var(--shadow);
                    overflow: hidden;
                }
                
                .progress-circle {
                    display: flex;
                    justify-content: center;
                    margin: 1rem 0;
                }
                
                .circle-progress {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .circle-inner {
                    width: 80px;
                    height: 80px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1.25rem;
                    color: var(--primary-color);
                }
                
                .quick-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .quick-stat-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-secondary);
                    border-radius: 0.375rem;
                }
                
                .stat-icon-small {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 0.375rem;
                    background: var(--primary-color);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                }
                
                .quick-stat-item > div:last-child {
                    flex: 1;
                }
                
                .stat-label {
                    display: block;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }
                
                .stat-value {
                    display: block;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 1rem;
                }
                
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 0.375rem;
                }
                
                .activity-icon {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    flex-shrink: 0;
                }
                
                .activity-icon.success {
                    background: var(--success-color);
                    color: white;
                }
                
                .activity-icon.info {
                    background: var(--primary-color);
                    color: white;
                }
                
                .activity-icon.warning {
                    background: var(--warning-color);
                    color: white;
                }
                
                .activity-content {
                    flex: 1;
                }
                
                .activity-content span {
                    display: block;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }
                
                .activity-content small {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                }

                /* Role styles */
                .role-indicator {
                    display: flex;
                    align-items: center;
                    margin-left: auto;
                }

                .role-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .role-admin {
                    background: #dc2626;
                    color: white;
                }

                .role-dean {
                    background: #059669;
                    color: white;
                }

                .role-teacher {
                    background: #3b82f6;
                    color: white;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .user-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .user-role {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }
                
                @media (max-width: 768px) {
                    .dashboard-row {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

    // Hide add button on dashboard
    const addNewBtn = document.getElementById("addNewBtn");
    if (addNewBtn) {
      addNewBtn.style.display = "none";
    }
  }

  handleAddNew() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    if (!modal || !modalTitle || !modalBody) return;

    switch (this.currentView) {
      case "degrees":
        modalTitle.textContent = "Thêm bằng cấp mới";
        modalBody.innerHTML = this.teacherManager.getDegreesModalContent();
        break;
      case "departments":
        modalTitle.textContent = "Thêm khoa mới";
        modalBody.innerHTML = this.teacherManager.getDepartmentsModalContent();
        break;
      case "teachers":
        modalTitle.textContent = "Thêm giáo viên mới";
        modalBody.innerHTML = this.teacherManager.getTeachersModalContent();
        break;
      case "subjects":
        modalTitle.textContent = "Thêm học phần mới";
        modalBody.innerHTML = this.courseManager.getSubjectsModalContent();
        break;
      case "semesters":
        modalTitle.textContent = "Thêm kì học mới";
        modalBody.innerHTML = this.courseManager.getSemestersModalContent();
        break;
      case "classes":
        modalTitle.textContent = "Thêm lớp học mới";
        modalBody.innerHTML = this.courseManager.getClassesModalContent();
        break;
      case "assignments":
        modalTitle.textContent = "Thêm phân công mới";
        modalBody.innerHTML = this.courseManager.getAssignmentsModalContent();
        break;
      case "department-assignments":
        modalTitle.textContent = "Phân công giáo viên";
        modalBody.innerHTML =
          this.departmentManager.getAssignmentsModalContent();
        break;
      default:
        return;
    }

    modal.classList.add("active");
  }

  handleModalSave() {
    try {
      switch (this.currentView) {
        case "degrees":
          this.teacherManager.saveDegree();
          break;
        case "departments":
          this.teacherManager.saveDepartment();
          break;
        case "teachers":
          this.teacherManager.saveTeacher();
          break;
        case "subjects":
          this.courseManager.saveSubject();
          break;
        case "semesters":
          this.courseManager.saveSemester();
          break;
        case "classes":
          this.courseManager.saveClass();
          break;
        case "assignments":
          this.courseManager.saveAssignment();
          break;
        case "department-assignments":
          this.departmentManager.saveAssignment();
          break;
        case "rate-settings":
          this.paymentCalculator.saveRateSettings();
          break;
      }
    } catch (error) {
      console.error("Error saving:", error);
      this.showAlert("Có lỗi xảy ra khi lưu dữ liệu!", "error");
    }
  }

  closeModal() {
    const modal = document.getElementById("modal");
    if (modal) {
      modal.classList.remove("active");
    }

    // Reset any editing states
    if (this.teacherManager) {
      this.teacherManager.editingDegreeId = null;
      this.teacherManager.editingDepartmentId = null;
      this.teacherManager.editingTeacherId = null;
    }

    if (this.courseManager) {
      this.courseManager.editingSubjectId = null;
      this.courseManager.editingSemesterId = null;
      this.courseManager.editingClassId = null;
      this.courseManager.editingAssignmentId = null;
    }

    if (this.departmentManager) {
      this.departmentManager.editingAssignmentId = null;
    }
  }

  logout() {
    this.authManager.logout();
    location.reload();
  }

  showAlert(message, type = "info") {
    // Remove existing alerts
    const existingAlert = document.querySelector(".alert");
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
      }
    }, 5000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if all required data and classes are available
  if (typeof sampleData === "undefined") {
    console.error("sampleData is not defined. Make sure data.js is loaded.");
    return;
  }

  if (typeof TeacherManager === "undefined") {
    console.error(
      "TeacherManager is not defined. Make sure teacher-management.js is loaded."
    );
    return;
  }

  // Initialize the app
  window.app = new App();
  console.log("TeachPay System initialized successfully!");
});
