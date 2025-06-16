class AuthManager {
  constructor() {
    this.currentUser = null;
    this.loadCurrentUser();
  }

  login(username, password) {
    const user = sampleData.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return { success: true, user };
    }

    return {
      success: false,
      message: "Tên đăng nhập hoặc mật khẩu không đúng",
    };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  }

  loadCurrentUser() {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasRole(roleName) {
    if (!this.currentUser) return false;
    const role = sampleData.roles.find((r) => r.id === this.currentUser.roleId);
    return role?.name === roleName;
  }

  canManageDepartment(departmentId) {
    if (!this.currentUser) return false;

    // Admin có thể quản lý tất cả
    if (this.hasRole("Admin")) return true;

    // Dean chỉ có thể quản lý khoa của mình
    if (this.hasRole("Dean")) {
      return this.currentUser.departmentId === departmentId;
    }

    return false;
  }

  canViewTeacherData(teacherId) {
    if (!this.currentUser) return false;

    // Admin xem được tất cả
    if (this.hasRole("Admin")) return true;

    // Dean xem được giáo viên trong khoa
    if (this.hasRole("Dean")) {
      const teacher = sampleData.teachers.find((t) => t.id === teacherId);
      return teacher?.departmentId === this.currentUser.departmentId;
    }

    // Teacher chỉ xem được thông tin của chính mình
    if (this.hasRole("Teacher")) {
      return this.currentUser.teacherId === teacherId;
    }

    return false;
  }
}
