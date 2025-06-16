class TeacherManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.searchTerm = "";
    this.currentFilter = "all";
    this.departmentFilter = "all";
    this.degreeFilter = "all";
    this.editingDegreeId = null;
    this.editingDepartmentId = null;
    this.editingTeacherId = null;
  }

  // Degrees Management
  async loadDegreesView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                ${Utils.createSearchInput(
                  "Tìm kiếm bằng cấp...",
                  "app.teacherManager.searchDegrees"
                )}
                <button class="btn btn-primary" onclick="app.teacherManager.showAddDegreeModal()">
                    <i class="fas fa-plus"></i> Thêm bằng cấp
                </button>
            </div>
            
            <div class="table-container">
                <table class="table" id="degreesTable">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên đầy đủ</th>
                            <th>Tên viết tắt</th>
                            <th>Hệ số</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="degreesTableBody">
                    </tbody>
                </table>
            </div>
            
            <div id="degreesPagination"></div>
        `;

    this.renderDegreesTable();
    this.setupDegreesSearch();
  }

  renderDegreesTable() {
    const tbody = document.getElementById("degreesTableBody");
    const filteredDegrees = this.getFilteredDegrees();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedDegrees = filteredDegrees.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedDegrees
      .map(
        (degree, index) => `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td>${degree.fullName}</td>
                <td><span class="badge">${degree.shortName}</span></td>
                <td>${degree.coefficient}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="app.teacherManager.editDegree(${
                          degree.id
                        })" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.teacherManager.deleteDegree(${
                          degree.id
                        })" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");

    // Render pagination
    const totalPages = Math.ceil(filteredDegrees.length / this.itemsPerPage);
    document.getElementById("degreesPagination").innerHTML =
      Utils.createPagination(
        this.currentPage,
        totalPages,
        "app.teacherManager.goToDegreePage"
      );
  }

  getFilteredDegrees() {
    return sampleData.degrees.filter(
      (degree) =>
        degree.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        degree.shortName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  setupDegreesSearch() {
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Utils.debounce((e) => {
          this.searchTerm = e.target.value;
          this.currentPage = 1;
          this.renderDegreesTable();
        }, 300)
      );
    }
  }

  goToDegreePage(page) {
    this.currentPage = page;
    this.renderDegreesTable();
  }

  showAddDegreeModal() {
    this.editingDegreeId = null;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Thêm bằng cấp mới";
    modalBody.innerHTML = this.getDegreesModalContent();
    modal.classList.add("active");
  }

  getDegreesModalContent(degree = null) {
    return `
            <form id="degreeForm" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Tên đầy đủ *</label>
                    <input type="text" name="fullName" class="form-input" value="${
                      degree?.fullName || ""
                    }" placeholder="Nhập tên đầy đủ">
                </div>
                <div class="form-group">
                    <label class="form-label">Tên viết tắt *</label>
                    <input type="text" name="shortName" class="form-input" value="${
                      degree?.shortName || ""
                    }" placeholder="Nhập tên viết tắt">
                </div>
                <div class="form-group">
                    <label class="form-label">Hệ số *</label>
                    <input type="number" step="0.1" min="0" name="coefficient" class="form-input" value="${
                      degree?.coefficient || "1.0"
                    }" placeholder="Nhập hệ số">
                </div>
            </form>
        `;
  }

  saveDegree() {
    const form = document.getElementById("degreeForm");
    const validator = new FormValidator(form)
      .required("fullName", "Tên đầy đủ là bắt buộc")
      .required("shortName", "Tên viết tắt là bắt buộc")
      .required("coefficient", "Hệ số là bắt buộc");

    const { isValid, errors } = validator.validate();

    if (!isValid) return;

    const formData = new FormData(form);
    const degree = {
      id: this.editingDegreeId || DataManager.getNextId(sampleData.degrees),
      fullName: formData.get("fullName"),
      shortName: formData.get("shortName"),
      coefficient: parseFloat(formData.get("coefficient")),
    };

    if (this.editingDegreeId) {
      const index = sampleData.degrees.findIndex(
        (d) => d.id === this.editingDegreeId
      );
      sampleData.degrees[index] = degree;
    } else {
      sampleData.degrees.push(degree);
    }

    DataManager.saveToLocalStorage();
    app.closeModal();
    this.renderDegreesTable();
    app.showAlert(
      `${this.editingDegreeId ? "Cập nhật" : "Thêm"} bằng cấp thành công!`,
      "success"
    );
    this.editingDegreeId = null;
  }

  editDegree(id) {
    const degree = sampleData.degrees.find((d) => d.id === id);
    if (!degree) return;

    this.editingDegreeId = id;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Sửa bằng cấp";
    modalBody.innerHTML = this.getDegreesModalContent(degree);
    modal.classList.add("active");
  }

  deleteDegree(id) {
    const degree = sampleData.degrees.find((d) => d.id === id);
    if (!degree) return;

    // Check if degree is being used
    const isUsed = sampleData.teachers.some((t) => t.degreeId === id);
    if (isUsed) {
      app.showAlert("Không thể xóa bằng cấp đang được sử dụng!", "warning");
      return;
    }

    // Sử dụng confirm dialog đơn giản thay vì Utils.showConfirmDialog
    if (confirm(`Bạn có chắc chắn muốn xóa bằng cấp "${degree.fullName}"?`)) {
      sampleData.degrees = sampleData.degrees.filter((d) => d.id !== id);
      DataManager.saveToLocalStorage();
      this.renderDegreesTable();
      app.showAlert("Xóa bằng cấp thành công!", "success");
    }
  }

  // Departments Management
  async loadDepartmentsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                ${Utils.createSearchInput(
                  "Tìm kiếm khoa...",
                  "app.teacherManager.searchDepartments"
                )}
                <button class="btn btn-primary" onclick="app.teacherManager.showAddDepartmentModal()">
                    <i class="fas fa-plus"></i> Thêm khoa
                </button>
            </div>
            
            <div class="table-container">
                <table class="table" id="departmentsTable">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên đầy đủ</th>
                            <th>Tên viết tắt</th>
                            <th>Mô tả</th>
                            <th>Số GV</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="departmentsTableBody">
                    </tbody>
                </table>
            </div>
            
            <div id="departmentsPagination"></div>
        `;

    this.renderDepartmentsTable();
    this.setupDepartmentsSearch();
  }

  renderDepartmentsTable() {
    const tbody = document.getElementById("departmentsTableBody");
    const filteredDepartments = this.getFilteredDepartments();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedDepartments = filteredDepartments.slice(
      startIndex,
      endIndex
    );

    tbody.innerHTML = paginatedDepartments
      .map((dept, index) => {
        const teacherCount = sampleData.teachers.filter(
          (t) => t.departmentId === dept.id
        ).length;
        return `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${dept.fullName}</td>
                    <td><span class="badge">${dept.shortName}</span></td>
                    <td>${dept.description || "Chưa có mô tả"}</td>
                    <td>${teacherCount}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning" onclick="app.teacherManager.editDepartment(${
                              dept.id
                            })" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.teacherManager.deleteDepartment(${
                              dept.id
                            })" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");

    // Render pagination
    const totalPages = Math.ceil(
      filteredDepartments.length / this.itemsPerPage
    );
    document.getElementById("departmentsPagination").innerHTML =
      Utils.createPagination(
        this.currentPage,
        totalPages,
        "app.teacherManager.goToDepartmentPage"
      );
  }

  getFilteredDepartments() {
    return sampleData.departments.filter(
      (dept) =>
        dept.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dept.shortName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (dept.description &&
          dept.description
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()))
    );
  }

  setupDepartmentsSearch() {
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Utils.debounce((e) => {
          this.searchTerm = e.target.value;
          this.currentPage = 1;
          this.renderDepartmentsTable();
        }, 300)
      );
    }
  }

  goToDepartmentPage(page) {
    this.currentPage = page;
    this.renderDepartmentsTable();
  }

  showAddDepartmentModal() {
    this.editingDepartmentId = null;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Thêm khoa mới";
    modalBody.innerHTML = this.getDepartmentsModalContent();
    modal.classList.add("active");
  }

  getDepartmentsModalContent(department = null) {
    return `
            <form id="departmentForm" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Tên đầy đủ *</label>
                    <input type="text" name="fullName" class="form-input" value="${
                      department?.fullName || ""
                    }" placeholder="Nhập tên đầy đủ">
                </div>
                <div class="form-group">
                    <label class="form-label">Tên viết tắt *</label>
                    <input type="text" name="shortName" class="form-input" value="${
                      department?.shortName || ""
                    }" placeholder="Nhập tên viết tắt">
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label class="form-label">Mô tả nhiệm vụ</label>
                    <textarea name="description" class="form-textarea" rows="3" placeholder="Nhập mô tả nhiệm vụ của khoa">${
                      department?.description || ""
                    }</textarea>
                </div>
            </form>
        `;
  }

  saveDepartment() {
    const form = document.getElementById("departmentForm");
    const validator = new FormValidator(form)
      .required("fullName", "Tên đầy đủ là bắt buộc")
      .required("shortName", "Tên viết tắt là bắt buộc");

    const { isValid, errors } = validator.validate();

    if (!isValid) return;

    const formData = new FormData(form);
    const department = {
      id:
        this.editingDepartmentId ||
        DataManager.getNextId(sampleData.departments),
      fullName: formData.get("fullName"),
      shortName: formData.get("shortName"),
      description: formData.get("description") || "",
    };

    if (this.editingDepartmentId) {
      const index = sampleData.departments.findIndex(
        (d) => d.id === this.editingDepartmentId
      );
      sampleData.departments[index] = department;
    } else {
      sampleData.departments.push(department);
    }

    DataManager.saveToLocalStorage();
    app.closeModal();
    this.renderDepartmentsTable();
    app.showAlert(
      `${this.editingDepartmentId ? "Cập nhật" : "Thêm"} khoa thành công!`,
      "success"
    );
    this.editingDepartmentId = null;
  }

  editDepartment(id) {
    const department = sampleData.departments.find((d) => d.id === id);
    if (!department) return;

    this.editingDepartmentId = id;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Sửa khoa";
    modalBody.innerHTML = this.getDepartmentsModalContent(department);
    modal.classList.add("active");
  }

  deleteDepartment(id) {
    const department = sampleData.departments.find((d) => d.id === id);
    if (!department) return;

    // Check if department is being used
    const isUsed = sampleData.teachers.some((t) => t.departmentId === id);
    if (isUsed) {
      app.showAlert("Không thể xóa khoa đang có giáo viên!", "warning");
      return;
    }

    // Sử dụng confirm dialog đơn giản
    if (confirm(`Bạn có chắc chắn muốn xóa khoa "${department.fullName}"?`)) {
      sampleData.departments = sampleData.departments.filter(
        (d) => d.id !== id
      );
      DataManager.saveToLocalStorage();
      this.renderDepartmentsTable();
      app.showAlert("Xóa khoa thành công!", "success");
    }
  }

  // Teachers Management
  async loadTeachersView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                ${Utils.createSearchInput(
                  "Tìm kiếm giáo viên...",
                  "app.teacherManager.searchTeachers"
                )}
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <select class="form-select" id="departmentFilter" style="min-width: 150px;">
                        <option value="all">Tất cả khoa</option>
                        ${sampleData.departments
                          .map(
                            (dept) =>
                              `<option value="${dept.id}">${dept.shortName}</option>`
                          )
                          .join("")}
                    </select>
                    <select class="form-select" id="degreeFilter" style="min-width: 150px;">
                        <option value="all">Tất cả bằng cấp</option>
                        ${sampleData.degrees
                          .map(
                            (degree) =>
                              `<option value="${degree.id}">${degree.shortName}</option>`
                          )
                          .join("")}
                    </select>
                    <button class="btn btn-primary" onclick="app.teacherManager.showAddTeacherModal()">
                        <i class="fas fa-plus"></i> Thêm giáo viên
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table" id="teachersTable">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã số</th>
                            <th>Họ tên</th>
                            <th>Ngày sinh</th>
                            <th>Điện thoại</th>
                            <th>Email</th>
                            <th>Khoa</th>
                            <th>Bằng cấp</th>
                            <th>Hệ số</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="teachersTableBody">
                    </tbody>
                </table>
            </div>
            
            <div id="teachersPagination"></div>
        `;

    // Reset filters
    this.departmentFilter = "all";
    this.degreeFilter = "all";
    this.searchTerm = "";
    this.currentPage = 1;

    this.renderTeachersTable();
    this.setupTeachersSearch();
    this.setupTeachersFilters();
  }

  renderTeachersTable() {
    const tbody = document.getElementById("teachersTableBody");
    const filteredTeachers = this.getFilteredTeachers();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedTeachers
      .map((teacher, index) => {
        const department = sampleData.departments.find(
          (d) => d.id === teacher.departmentId
        );
        const degree = sampleData.degrees.find(
          (d) => d.id === teacher.degreeId
        );

        return `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td><strong>${teacher.code}</strong></td>
                    <td>${teacher.fullName}</td>
                    <td>${Utils.formatDate(teacher.birthDate)}</td>
                    <td>${teacher.phone}</td>
                    <td>${teacher.email}</td>
                    <td><span class="badge">${
                      department?.shortName || "N/A"
                    }</span></td>
                    <td><span class="badge">${
                      degree?.shortName || "N/A"
                    }</span></td>
                    <td>${
                      teacher.coefficient || degree?.coefficient || 1.0
                    }</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-info" onclick="app.teacherManager.viewTeacher(${
                              teacher.id
                            })" title="Xem">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="app.teacherManager.editTeacher(${
                              teacher.id
                            })" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.teacherManager.deleteTeacher(${
                              teacher.id
                            })" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
      })
      .join("");

    // Render pagination
    const totalPages = Math.ceil(filteredTeachers.length / this.itemsPerPage);
    document.getElementById("teachersPagination").innerHTML =
      Utils.createPagination(
        this.currentPage,
        totalPages,
        "app.teacherManager.goToTeacherPage"
      );
  }

  getFilteredTeachers() {
    return sampleData.teachers.filter((teacher) => {
      const matchesSearch =
        !this.searchTerm ||
        teacher.fullName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        teacher.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.phone.includes(this.searchTerm);

      const matchesDepartment =
        this.departmentFilter === "all" ||
        teacher.departmentId === parseInt(this.departmentFilter);

      const matchesDegree =
        this.degreeFilter === "all" ||
        teacher.degreeId === parseInt(this.degreeFilter);

      return matchesSearch && matchesDepartment && matchesDegree;
    });
  }

  setupTeachersSearch() {
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        Utils.debounce((e) => {
          this.searchTerm = e.target.value;
          this.currentPage = 1;
          this.renderTeachersTable();
        }, 300)
      );
    }
  }

  setupTeachersFilters() {
    const departmentFilter = document.getElementById("departmentFilter");
    const degreeFilter = document.getElementById("degreeFilter");

    if (departmentFilter) {
      departmentFilter.addEventListener("change", (e) => {
        this.departmentFilter = e.target.value;
        this.currentPage = 1;
        this.renderTeachersTable();
      });
    }

    if (degreeFilter) {
      degreeFilter.addEventListener("change", (e) => {
        this.degreeFilter = e.target.value;
        this.currentPage = 1;
        this.renderTeachersTable();
      });
    }
  }

  goToTeacherPage(page) {
    this.currentPage = page;
    this.renderTeachersTable();
  }

  showAddTeacherModal() {
    this.editingTeacherId = null;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Thêm giáo viên mới";
    modalBody.innerHTML = this.getTeachersModalContent();

    // Thêm sự kiện thay đổi bằng cấp để tự động cập nhật hệ số
    setTimeout(() => {
      this.setupDegreeChangeListener();
    }, 100);

    modal.classList.add("active");
  }

  getTeachersModalContent(teacher = null) {
    return `
            <form id="teacherForm" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Mã số ${
                      teacher ? "" : "*"
                    }</label>
                    <input type="text" name="code" class="form-input" value="${
                      teacher?.code || ""
                    }" 
                           placeholder="Để trống để tự sinh" ${
                             teacher ? "readonly" : ""
                           }>
                </div>
                <div class="form-group">
                    <label class="form-label">Họ tên *</label>
                    <input type="text" name="fullName" class="form-input" value="${
                      teacher?.fullName || ""
                    }" placeholder="Nhập họ tên">
                </div>
                <div class="form-group">
                    <label class="form-label">Ngày sinh *</label>
                    <input type="date" name="birthDate" class="form-input" value="${
                      teacher?.birthDate || ""
                    }">
                </div>
                <div class="form-group">
                    <label class="form-label">Điện thoại *</label>
                    <input type="tel" name="phone" class="form-input" value="${
                      teacher?.phone || ""
                    }" placeholder="Nhập số điện thoại">
                </div>
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" name="email" class="form-input" value="${
                      teacher?.email || ""
                    }" placeholder="Nhập email">
                </div>
                <div class="form-group">
                    <label class="form-label">Khoa *</label>
                    <select name="departmentId" class="form-select">
                        <option value="">Chọn khoa</option>
                        ${sampleData.departments
                          .map(
                            (dept) =>
                              `<option value="${dept.id}" ${
                                teacher?.departmentId === dept.id
                                  ? "selected"
                                  : ""
                              }>${dept.fullName}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Bằng cấp *</label>
                    <select name="degreeId" id="degreeSelect" class="form-select">
                        <option value="">Chọn bằng cấp</option>
                        ${sampleData.degrees
                          .map(
                            (degree) =>
                              `<option value="${degree.id}" data-coefficient="${
                                degree.coefficient
                              }" ${
                                teacher?.degreeId === degree.id
                                  ? "selected"
                                  : ""
                              }>${degree.fullName}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Hệ số cá nhân</label>
                    <input type="number" step="0.1" min="0" name="coefficient" id="coefficientInput" 
                           class="form-input" value="${
                             teacher?.coefficient || "1.0"
                           }" 
                           placeholder="Tự động theo bằng cấp" readonly>
                    <small class="form-help">Hệ số được tự động cập nhật theo bằng cấp</small>
                </div>
            </form>
        `;
  }

  setupDegreeChangeListener() {
    const degreeSelect = document.getElementById("degreeSelect");
    const coefficientInput = document.getElementById("coefficientInput");

    if (degreeSelect && coefficientInput) {
      // Set initial coefficient if degree is already selected
      const selectedOption = degreeSelect.querySelector("option:checked");
      if (selectedOption && selectedOption.dataset.coefficient) {
        coefficientInput.value = selectedOption.dataset.coefficient;
      }

      degreeSelect.addEventListener("change", (e) => {
        const selectedOption = e.target.selectedOptions[0];
        if (selectedOption && selectedOption.dataset.coefficient) {
          coefficientInput.value = selectedOption.dataset.coefficient;
        } else {
          coefficientInput.value = "1.0";
        }
      });
    }
  }

  saveTeacher() {
    const form = document.getElementById("teacherForm");
    const validator = new FormValidator(form)
      .required("fullName", "Họ tên là bắt buộc")
      .required("birthDate", "Ngày sinh là bắt buộc")
      .required("phone", "Điện thoại là bắt buộc")
      .phone("phone")
      .required("email", "Email là bắt buộc")
      .email("email")
      .required("departmentId", "Khoa là bắt buộc")
      .required("degreeId", "Bằng cấp là bắt buộc");

    const { isValid, errors } = validator.validate();

    if (!isValid) return;

    const formData = new FormData(form);

    // Generate code if not provided
    let code = formData.get("code");
    if (!code) {
      code = DataManager.generateCode("GV", sampleData.teachers);
    }

    // Check if code already exists (for new teachers)
    if (
      !this.editingTeacherId &&
      sampleData.teachers.some((t) => t.code === code)
    ) {
      app.showAlert("Mã số giáo viên đã tồn tại!", "warning");
      return;
    }

    const teacher = {
      id: this.editingTeacherId || DataManager.getNextId(sampleData.teachers),
      code: code,
      fullName: formData.get("fullName"),
      birthDate: formData.get("birthDate"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      departmentId: parseInt(formData.get("departmentId")),
      degreeId: parseInt(formData.get("degreeId")),
      coefficient: parseFloat(formData.get("coefficient")) || 1.0,
    };

    if (this.editingTeacherId) {
      const index = sampleData.teachers.findIndex(
        (t) => t.id === this.editingTeacherId
      );
      sampleData.teachers[index] = teacher;
    } else {
      sampleData.teachers.push(teacher);
    }

    DataManager.saveToLocalStorage();
    app.closeModal();
    this.renderTeachersTable();
    app.showAlert(
      `${this.editingTeacherId ? "Cập nhật" : "Thêm"} giáo viên thành công!`,
      "success"
    );
    this.editingTeacherId = null;
  }

  editTeacher(id) {
    const teacher = sampleData.teachers.find((t) => t.id === id);
    if (!teacher) return;

    this.editingTeacherId = id;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Sửa giáo viên";
    modalBody.innerHTML = this.getTeachersModalContent(teacher);

    // Thêm sự kiện thay đổi bằng cấp để tự động cập nhật hệ số
    setTimeout(() => {
      this.setupDegreeChangeListener();
    }, 100);

    modal.classList.add("active");
  }

  viewTeacher(id) {
    const teacher = sampleData.teachers.find((t) => t.id === id);
    if (!teacher) return;

    const department = sampleData.departments.find(
      (d) => d.id === teacher.departmentId
    );
    const degree = sampleData.degrees.find((d) => d.id === teacher.degreeId);

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Thông tin giáo viên";
    modalBody.innerHTML = `
            <div class="teacher-details">
                <div class="detail-row">
                    <strong>Mã số:</strong> ${teacher.code}
                </div>
                <div class="detail-row">
                    <strong>Họ tên:</strong> ${teacher.fullName}
                </div>
                <div class="detail-row">
                    <strong>Ngày sinh:</strong> ${Utils.formatDate(
                      teacher.birthDate
                    )}
                </div>
                <div class="detail-row">
                    <strong>Tuổi:</strong> ${Utils.calculateAge(
                      teacher.birthDate
                    )} tuổi
                </div>
                <div class="detail-row">
                    <strong>Điện thoại:</strong> ${teacher.phone}
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> ${teacher.email}
                </div>
                <div class="detail-row">
                    <strong>Khoa:</strong> ${department?.fullName || "N/A"}
                </div>
                <div class="detail-row">
                    <strong>Bằng cấp:</strong> ${degree?.fullName || "N/A"}
                </div>
                <div class="detail-row">
                    <strong>Hệ số cá nhân:</strong> ${
                      teacher.coefficient || degree?.coefficient || 1.0
                    }
                </div>
            </div>
        `;

    // Hide save button for view mode
    const saveButton = document.getElementById("modalSave");
    if (saveButton) {
      saveButton.style.display = "none";
    }
    modal.classList.add("active");

    // Reset save button when modal closes
    const resetSaveButton = () => {
      const saveButton = document.getElementById("modalSave");
      if (saveButton) {
        saveButton.style.display = "inline-flex";
      }
      modal.removeEventListener("transitionend", resetSaveButton);
    };
    modal.addEventListener("transitionend", resetSaveButton);
  }

  deleteTeacher(id) {
    const teacher = sampleData.teachers.find((t) => t.id === id);
    if (!teacher) return;

    // Check if teacher has assignments
    const hasAssignments =
      sampleData.assignments &&
      sampleData.assignments.some((a) => a.teacherId === id);
    if (hasAssignments) {
      app.showAlert(
        "Không thể xóa giáo viên đã được phân công dạy!",
        "warning"
      );
      return;
    }

    // Sử dụng confirm dialog đơn giản
    if (confirm(`Bạn có chắc chắn muốn xóa giáo viên "${teacher.fullName}"?`)) {
      sampleData.teachers = sampleData.teachers.filter((t) => t.id !== id);
      DataManager.saveToLocalStorage();
      this.renderTeachersTable();
      app.showAlert("Xóa giáo viên thành công!", "success");
    }
  }

  // Teacher Statistics
  async loadTeacherStatsView() {
    const contentBody = document.getElementById("contentBody");

    const stats = this.generateTeacherStats();

    contentBody.innerHTML = `
            <div class="stats-dashboard">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #3b82f6;">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalTeachers}</h3>
                            <p>Tổng số giáo viên</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #10b981;">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.totalDepartments}</h3>
                            <p>Số khoa</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #f59e0b;">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.doctorCount}</h3>
                            <p>Tiến sĩ</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: #ef4444;">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${stats.masterCount}</h3>
                            <p>Thạc sĩ</p>
                        </div>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-card">
                        <h3>Phân bố giáo viên theo khoa</h3>
                        <canvas id="departmentDistributionChart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="chart-card">
                        <h3>Phân bố theo bằng cấp</h3>
                        <canvas id="degreeDistributionChart" width="400" height="200"></canvas>
                    </div>
                </div>

                <div class="table-container mt-3">
                    <h3>Chi tiết theo khoa</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Khoa</th>
                                <th>Số giáo viên</th>
                                <th>Tiến sĩ</th>
                                <th>Thạc sĩ</th>
                                <th>Khác</th>
                                <th>Tỷ lệ TS (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.departmentDetails
                              .map(
                                (dept) => `
                                <tr>
                                    <td><strong>${dept.name}</strong></td>
                                    <td>${dept.total}</td>
                                    <td>${dept.doctors}</td>
                                    <td>${dept.masters}</td>
                                    <td>${dept.others}</td>
                                    <td>${dept.doctorRate}%</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    this.initializeStatsCharts(stats);
  }

  generateTeacherStats() {
    const totalTeachers = sampleData.teachers.length;
    const totalDepartments = sampleData.departments.length;

    // Count by degree
    const doctorDegree = sampleData.degrees.find((d) => d.shortName === "TS");
    const masterDegree = sampleData.degrees.find((d) => d.shortName === "ThS");

    const doctorCount = sampleData.teachers.filter(
      (t) => t.degreeId === doctorDegree?.id
    ).length;
    const masterCount = sampleData.teachers.filter(
      (t) => t.degreeId === masterDegree?.id
    ).length;

    // Department details
    const departmentDetails = sampleData.departments.map((dept) => {
      const deptTeachers = sampleData.teachers.filter(
        (t) => t.departmentId === dept.id
      );
      const doctors = deptTeachers.filter(
        (t) => t.degreeId === doctorDegree?.id
      ).length;
      const masters = deptTeachers.filter(
        (t) => t.degreeId === masterDegree?.id
      ).length;
      const others = deptTeachers.length - doctors - masters;
      const doctorRate =
        deptTeachers.length > 0
          ? Math.round((doctors / deptTeachers.length) * 100)
          : 0;

      return {
        name: dept.shortName,
        total: deptTeachers.length,
        doctors,
        masters,
        others,
        doctorRate,
      };
    });

    return {
      totalTeachers,
      totalDepartments,
      doctorCount,
      masterCount,
      departmentDetails,
    };
  }

  initializeStatsCharts(stats) {
    // Department distribution chart
    const deptCtx = document.getElementById("departmentDistributionChart");
    if (deptCtx) {
      new Chart(deptCtx, {
        type: "bar",
        data: {
          labels: stats.departmentDetails.map((d) => d.name),
          datasets: [
            {
              label: "Số giáo viên",
              data: stats.departmentDetails.map((d) => d.total),
              backgroundColor: "rgba(37, 99, 235, 0.8)",
              borderColor: "rgba(37, 99, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }

    // Degree distribution chart
    const degreeCtx = document.getElementById("degreeDistributionChart");
    if (degreeCtx) {
      const degreeData = sampleData.degrees.map((degree) => ({
        name: degree.shortName,
        count: sampleData.teachers.filter((t) => t.degreeId === degree.id)
          .length,
      }));

      new Chart(degreeCtx, {
        type: "pie",
        data: {
          labels: degreeData.map((d) => d.name),
          datasets: [
            {
              data: degreeData.map((d) => d.count),
              backgroundColor: [
                "#2563eb",
                "#059669",
                "#d97706",
                "#dc2626",
                "#7c3aed",
                "#0891b2",
              ],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    }
  }
}
