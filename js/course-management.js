class CourseManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.searchTerm = "";
    this.currentFilter = "all";
    this.currentType = null;
    this.editingIds = {
      subjects: null,
      semesters: null,
      classes: null,
      assignments: null,
    };
  }

  // ============== QUẢN LÝ HỌC PHẦN ==============
  async loadSubjectsView() {
    try {
      this.currentType = "subjects";
      const subjectsData =
        window.sampleData?.subjects || sampleData?.subjects || [];

      this.renderView("subjects", {
        title: "Quản lý học phần",
        description: "Quản lý danh sách các học phần trong hệ thống",
        icon: "fas fa-book",
        data: subjectsData,
        columns: [
          { key: "code", label: "Mã học phần", type: "text" },
          { key: "name", label: "Tên học phần", type: "text" },
          { key: "credits", label: "Số tín chỉ", type: "number" },
          { key: "coefficient", label: "Hệ số", type: "badge" },
          { key: "periods", label: "Số tiết", type: "number" },
          { key: "departmentId", label: "Khoa", type: "department" },
        ],
      });

      this.setupSearch("subjects");
    } catch (error) {
      console.error("Error loading subjects view:", error);
    }
  }

  async loadSemestersView() {
    this.currentType = "semesters";
    const semestersData =
      window.sampleData?.semesters || sampleData?.semesters || [];

    this.renderView("semesters", {
      title: "Quản lý kì học",
      description: "Quản lý các kì học trong năm học",
      icon: "fas fa-calendar-alt",
      data: semestersData,
      columns: [
        { key: "name", label: "Tên kì học", type: "text" },
        { key: "academicYear", label: "Năm học", type: "text" },
        { key: "startDate", label: "Ngày bắt đầu", type: "date" },
        { key: "endDate", label: "Ngày kết thúc", type: "date" },
        { key: "isActive", label: "Trạng thái", type: "status" },
      ],
    });
    this.setupSearch("semesters");
  }

  async loadClassesView() {
    this.currentType = "classes";
    const classesData = window.sampleData?.classes || sampleData?.classes || [];

    this.renderView("classes", {
      title: "Quản lý lớp học",
      description: "Quản lý các lớp học trong hệ thống",
      icon: "fas fa-chalkboard",
      data: classesData,
      columns: [
        { key: "classCode", label: "Mã lớp", type: "text" },
        { key: "className", label: "Tên lớp", type: "text" },
        { key: "subjectId", label: "Học phần", type: "subject" },
        { key: "semesterId", label: "Kì học", type: "semester" },
        { key: "studentCount", label: "Sĩ số", type: "number" },
        { key: "coefficient", label: "Hệ số", type: "badge" },
      ],
    });
    this.setupSearch("classes");
  }

  async loadAssignmentsView() {
    this.currentType = "assignments";
    const assignmentsData =
      window.sampleData?.assignments || sampleData?.assignments || [];

    this.renderView("assignments", {
      title: "Phân công giảng viên",
      description: "Quản lý phân công giảng dạy",
      icon: "fas fa-user-plus",
      data: assignmentsData,
      columns: [
        { key: "teacherId", label: "Giảng viên", type: "teacher" },
        { key: "classId", label: "Lớp học", type: "class" },
        { key: "assignedDate", label: "Ngày phân công", type: "date" },
        { key: "status", label: "Trạng thái", type: "status" },
      ],
    });
    this.setupSearch("assignments");
  }

  renderView(type, config) {
    const contentBody = document.getElementById("contentBody");
    if (!contentBody) {
      console.error("contentBody element not found!");
      return;
    }

    const stats = this.calculateStats(type, config.data);

    contentBody.innerHTML = `
      <div class="${type}-container">
        <div class="section-header">
          <h3><i class="${config.icon}"></i> ${config.title}</h3>
          <p class="text-muted">${config.description}</p>
        </div>

        <div class="toolbar">
          <div class="search-container">
            <input type="text" class="search-input" placeholder="Tìm kiếm ${this.getTypeName(
              type
            )}..." 
                   onkeyup="app.courseManager.handleSearch(event, '${type}')">
            <i class="fas fa-search search-icon"></i>
          </div>
          <button class="btn btn-primary" onclick="app.courseManager.showAddModal('${type}')">
            <i class="fas fa-plus"></i> Thêm ${this.getTypeName(type)}
          </button>
        </div>

        ${this.renderStats(stats)}
        ${this.renderTable(type, config)}
      </div>
    `;
  }

  renderTable(type, config) {
    const data = this.getFilteredData(type);

    if (data.length === 0) {
      return this.renderEmptyState(type);
    }

    const headers = config.columns
      .map((col) => {
        const sortIcon = '<i class="fas fa-sort text-muted ml-1"></i>';
        return `<th class="sortable" onclick="app.courseManager.sortBy('${col.key}')">${col.label}${sortIcon}</th>`;
      })
      .join("");

    const rows = this.getPaginatedData(data)
      .map((item, index) =>
        this.renderTableRow(item, index, config.columns, type)
      )
      .join("");

    return `
      <div class="table-responsive">
        <div class="table-container">
          <table class="table table-striped table-hover">
            <thead class="table-header-fixed">
              <tr>
                <th style="width: 60px;">STT</th>
                ${headers}
                <th style="width: 120px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>${
              rows ||
              '<tr><td colspan="100%" class="text-center">Không có dữ liệu</td></tr>'
            }</tbody>
          </table>
        </div>
      </div>
      <div id="${type}Pagination" class="pagination-container">${this.renderPagination(
      data.length
    )}</div>
    `;
  }

  renderTableRow(item, index, columns, type) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const cells = columns.map((col) => this.renderCell(item, col)).join("");

    return `
      <tr>
        <td>${startIndex + index + 1}</td>
        ${cells}
        <td>${this.renderActions(item.id, type)}</td>
      </tr>
    `;
  }

  renderCell(item, column) {
    const value = this.getCellValue(item, column);

    switch (column.type) {
      case "badge":
        const displayValue =
          column.key === "coefficient" ? parseFloat(value).toFixed(1) : value;
        return `<td><span class="coefficient-badge">${displayValue}</span></td>`;

      case "status":
        if (column.key === "isActive") {
          const statusClass = value ? "success" : "secondary";
          const statusText = value ? "Đang hoạt động" : "Không hoạt động";
          return `<td><span class="badge badge-${statusClass}">${statusText}</span></td>`;
        } else {
          const statusClass =
            value === "active"
              ? "success"
              : value === "completed"
              ? "info"
              : value === "pending"
              ? "warning"
              : "secondary";
          const statusText =
            value === "active"
              ? "Đang hoạt động"
              : value === "completed"
              ? "Hoàn thành"
              : value === "pending"
              ? "Chờ xử lý"
              : "Không xác định";
          return `<td><span class="badge badge-${statusClass}">${statusText}</span></td>`;
        }

      case "department":
        const departments =
          window.sampleData?.departments || sampleData?.departments || [];
        const dept = departments.find((d) => d.id === value);
        return `<td><span class="badge badge-info">${
          dept?.shortName || "N/A"
        }</span></td>`;

      case "subject":
        const subjects =
          window.sampleData?.subjects || sampleData?.subjects || [];
        const subject = subjects.find((s) => s.id === value);
        return `<td><span class="text-truncate" title="${
          subject?.name || "N/A"
        }">${subject?.name || "N/A"}</span></td>`;

      case "semester":
        const semesters =
          window.sampleData?.semesters || sampleData?.semesters || [];
        const semester = semesters.find((s) => s.id === value);
        return `<td><span class="text-truncate" title="${
          semester?.name || "N/A"
        }">${semester?.name || "N/A"}</span></td>`;

      case "teacher":
        const teachers =
          window.sampleData?.teachers || sampleData?.teachers || [];
        const teacher = teachers.find((t) => t.id === value);
        return `<td><span class="text-truncate" title="${
          teacher?.fullName || "N/A"
        }">${teacher?.fullName || "N/A"}</span></td>`;

      case "class":
        const classes = window.sampleData?.classes || sampleData?.classes || [];
        const cls = classes.find((c) => c.id === value);
        return `<td><span class="text-truncate" title="${
          cls?.className || "N/A"
        }">${cls?.className || "N/A"}</span></td>`;

      case "date":
        if (!value || value === "N/A") {
          return `<td>N/A</td>`;
        }
        try {
          const date = new Date(value);
          const formattedDate = date.toLocaleDateString("vi-VN");
          return `<td>${formattedDate}</td>`;
        } catch (error) {
          return `<td>N/A</td>`;
        }

      case "number":
        const numValue = parseInt(value) || 0;
        return `<td class="text-right">${numValue.toLocaleString(
          "vi-VN"
        )}</td>`;

      case "text":
      default:
        const displayText =
          value && value !== "N/A" ? this.escapeHtml(String(value)) : "N/A";
        if (column.key === "code" || column.key === "classCode") {
          return `<td><strong>${displayText}</strong></td>`;
        }
        return `<td>${displayText}</td>`;
    }
  }

  getCellValue(item, column) {
    let value = item[column.key];

    // Xử lý các trường hợp đặc biệt
    if (value === undefined || value === null) {
      if (column.type === "number") {
        return 0;
      }
      return "N/A";
    }

    // Xử lý chuỗi rỗng
    if (typeof value === "string" && value.trim() === "") {
      return column.type === "number" ? 0 : "N/A";
    }

    return value;
  }

  renderActions(id, type) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-info" onclick="app.courseManager.view('${type}', ${id})" title="Xem">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="app.courseManager.edit('${type}', ${id})" title="Sửa">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.courseManager.delete('${type}', ${id})" title="Xóa">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  // ============== MODAL MANAGEMENT ==============
  showAddModal(type) {
    this.editingIds[type] = null;
    this.showModal(type, null, "add");
  }

  showModal(type, item = null, mode = "add") {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalSave = document.getElementById("modalSave");

    modalTitle.textContent = `${
      mode === "add" ? "Thêm" : mode === "edit" ? "Sửa" : "Xem"
    } ${this.getTypeName(type)}`;
    modalBody.innerHTML = this.getModalContent(type, item);

    if (mode === "view") {
      modalSave.style.display = "none";
      modalBody.querySelectorAll("input, select, textarea").forEach((el) => {
        el.disabled = true;
      });
    } else {
      modalSave.style.display = "block";
      modalSave.onclick = () => this.save(type);
    }

    modal.classList.add("active");
  }

  getModalContent(type, item = null) {
    const formConfigs = {
      subjects: {
        fields: [
          {
            name: "code",
            label: "Mã học phần",
            type: "text",
            required: true,
            readonly: !!item,
          },
          { name: "name", label: "Tên học phần", type: "text", required: true },
          {
            name: "credits",
            label: "Số tín chỉ",
            type: "number",
            required: true,
            min: 1,
            max: 10,
          },
          {
            name: "coefficient",
            label: "Hệ số học phần",
            type: "number",
            required: true,
            min: 1.0,
            max: 2.0,
            step: 0.1,
          },
          {
            name: "periods",
            label: "Số tiết",
            type: "number",
            required: true,
            min: 15,
            max: 90,
          },
          {
            name: "departmentId",
            label: "Khoa",
            type: "select",
            required: true,
            options:
              window.sampleData?.departments || sampleData?.departments || [],
          },
        ],
      },
      semesters: {
        fields: [
          { name: "name", label: "Tên kì học", type: "text", required: true },
          {
            name: "academicYear",
            label: "Năm học",
            type: "text",
            required: true,
          },
          {
            name: "startDate",
            label: "Ngày bắt đầu",
            type: "date",
            required: true,
          },
          {
            name: "endDate",
            label: "Ngày kết thúc",
            type: "date",
            required: true,
          },
          {
            name: "isActive",
            label: "Trạng thái",
            type: "select",
            required: true,
            options: [
              { id: true, name: "Đang hoạt động" },
              { id: false, name: "Không hoạt động" },
            ],
          },
        ],
      },
      classes: {
        fields: [
          {
            name: "classCode",
            label: "Mã lớp",
            type: "text",
            required: true,
            readonly: !!item,
          },
          { name: "className", label: "Tên lớp", type: "text", required: true },
          {
            name: "subjectId",
            label: "Học phần",
            type: "select",
            required: true,
            options: window.sampleData?.subjects || sampleData?.subjects || [],
          },
          {
            name: "semesterId",
            label: "Kì học",
            type: "select",
            required: true,
            options:
              window.sampleData?.semesters || sampleData?.semesters || [],
          },
          {
            name: "studentCount",
            label: "Sĩ số",
            type: "number",
            required: true,
            min: 1,
            max: 200,
          },
          {
            name: "coefficient",
            label: "Hệ số lớp",
            type: "number",
            required: true,
            min: 0.5,
            max: 2.0,
            step: 0.1,
          },
          { name: "room", label: "Phòng học", type: "text" },
          { name: "schedule", label: "Lịch học", type: "text" },
        ],
      },
      assignments: {
        fields: [
          {
            name: "teacherId",
            label: "Giảng viên",
            type: "select",
            required: true,
            options: window.sampleData?.teachers || sampleData?.teachers || [],
          },
          {
            name: "classId",
            label: "Lớp học",
            type: "select",
            required: true,
            options: window.sampleData?.classes || sampleData?.classes || [],
          },
          {
            name: "assignedDate",
            label: "Ngày phân công",
            type: "date",
            required: true,
          },
          {
            name: "status",
            label: "Trạng thái",
            type: "select",
            required: true,
            options: [
              { id: "pending", name: "Chờ xác nhận" },
              { id: "active", name: "Đang thực hiện" },
              { id: "completed", name: "Hoàn thành" },
            ],
          },
          { name: "notes", label: "Ghi chú", type: "textarea" },
        ],
      },
    };

    return this.generateForm(formConfigs[type], item);
  }

  generateForm(config, item) {
    if (!config) return "";

    const fields = config.fields
      .map((field) => this.generateField(field, item))
      .join("");
    return `<form id="modalForm" class="form-grid">${fields}</form>`;
  }

  generateField(field, item) {
    const value = item ? item[field.name] || "" : "";
    const attributes = this.getFieldAttributes(field);

    switch (field.type) {
      case "select":
        return this.generateSelectField(field, value);
      case "textarea":
        return this.generateTextareaField(field, value);
      default:
        return `
          <div class="form-group ${field.name === "notes" ? "full-width" : ""}">
            <label class="form-label">${field.label}${
          field.required ? " *" : ""
        }</label>
            <input type="${field.type}" name="${field.name}" class="form-input" 
                   value="${this.escapeHtml(value)}" ${attributes}>
          </div>
        `;
    }
  }

  generateSelectField(field, value) {
    let options = "";

    if (field.name === "departmentId") {
      options =
        field.options
          ?.map(
            (option) =>
              `<option value="${option.id}" ${
                option.id == value ? "selected" : ""
              }>${option.shortName} - ${option.fullName}</option>`
          )
          .join("") || "";
    } else if (field.name === "subjectId") {
      options =
        field.options
          ?.map(
            (option) =>
              `<option value="${option.id}" ${
                option.id == value ? "selected" : ""
              }>${option.code} - ${option.name}</option>`
          )
          .join("") || "";
    } else if (field.name === "teacherId") {
      options =
        field.options
          ?.map(
            (option) =>
              `<option value="${option.id}" ${
                option.id == value ? "selected" : ""
              }>${option.code} - ${option.fullName}</option>`
          )
          .join("") || "";
    } else if (field.name === "classId") {
      options =
        field.options
          ?.map(
            (option) =>
              `<option value="${option.id}" ${
                option.id == value ? "selected" : ""
              }>${option.classCode} - ${option.className}</option>`
          )
          .join("") || "";
    } else {
      options =
        field.options
          ?.map(
            (option) =>
              `<option value="${option.id}" ${
                option.id == value ? "selected" : ""
              }>${option.name || option.shortName}</option>`
          )
          .join("") || "";
    }

    return `
      <div class="form-group">
        <label class="form-label">${field.label}${
      field.required ? " *" : ""
    }</label>
        <select name="${field.name}" class="form-input" ${
      field.required ? "required" : ""
    }>
          <option value="">-- Chọn ${field.label.toLowerCase()} --</option>
          ${options}
        </select>
      </div>
    `;
  }

  generateTextareaField(field, value) {
    return `
      <div class="form-group full-width">
        <label class="form-label">${field.label}${
      field.required ? " *" : ""
    }</label>
        <textarea name="${field.name}" class="form-input" rows="3" 
                  ${field.required ? "required" : ""}>${this.escapeHtml(
      value
    )}</textarea>
      </div>
    `;
  }

  getFieldAttributes(field) {
    const attrs = [];
    if (field.required) attrs.push("required");
    if (field.readonly) attrs.push("readonly");
    if (field.min !== undefined) attrs.push(`min="${field.min}"`);
    if (field.max !== undefined) attrs.push(`max="${field.max}"`);
    if (field.step !== undefined) attrs.push(`step="${field.step}"`);
    return attrs.join(" ");
  }

  // ============== CRUD OPERATIONS ==============
  save(type) {
    try {
      const form = document.getElementById("modalForm");
      if (!form) return;

      const formData = new FormData(form);
      if (!this.validateForm(type, formData)) return;

      const item = this.buildItem(type, formData);

      if (this.editingIds[type]) {
        this.updateItem(type, item);
        app.showAlert("Cập nhật thành công!", "success");
      } else {
        this.addItem(type, item);
        app.showAlert("Thêm mới thành công!", "success");
      }

      this.saveAndRefresh(type);
    } catch (error) {
      app.showAlert("Có lỗi xảy ra: " + error.message, "error");
    }
  }

  validateForm(type, formData) {
    const requiredFields = this.getRequiredFields(type);

    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || value.trim() === "") {
        app.showAlert(
          `Vui lòng nhập ${this.getFieldLabel(type, field)}`,
          "warning"
        );
        return false;
      }
    }
    return true;
  }

  buildItem(type, formData) {
    const item = { id: this.editingIds[type] || Date.now() };

    for (const [key, value] of formData.entries()) {
      if (
        key.includes("Id") ||
        key === "credits" ||
        key === "periods" ||
        key === "studentCount"
      ) {
        item[key] = parseInt(value) || 0;
      } else if (key === "coefficient") {
        item[key] = parseFloat(value) || 1.0;
      } else if (key === "isActive") {
        item[key] = value === "true";
      } else {
        item[key] = value.trim();
      }
    }

    if (!this.editingIds[type]) {
      item.createdAt = new Date().toISOString();
    }
    item.updatedAt = new Date().toISOString();
    return item;
  }

  addItem(type, item) {
    const data = window.sampleData || sampleData;
    if (!data || !data[type]) return;
    data[type].push(item);
  }

  updateItem(type, item) {
    const data = window.sampleData || sampleData;
    if (!data || !data[type]) return;
    const index = data[type].findIndex((i) => i.id === this.editingIds[type]);
    if (index !== -1) {
      data[type][index] = { ...data[type][index], ...item };
    }
  }

  removeItem(type, id) {
    const data = window.sampleData || sampleData;
    if (!data || !data[type]) return;
    const index = data[type].findIndex((i) => i.id === id);
    if (index !== -1) {
      data[type].splice(index, 1);
    }
  }

  edit(type, id) {
    const item = this.findItem(type, id);
    if (!item) {
      app.showAlert("Không tìm thấy dữ liệu!", "error");
      return;
    }
    this.editingIds[type] = id;
    this.showModal(type, item, "edit");
  }

  view(type, id) {
    const item = this.findItem(type, id);
    if (!item) return;
    this.showModal(type, item, "view");
  }

  delete(type, id) {
    const item = this.findItem(type, id);
    if (!item) return;

    if (this.hasRelatedData(type, id)) {
      app.showAlert("Không thể xóa do còn dữ liệu liên quan!", "warning");
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa?`)) {
      this.removeItem(type, id);
      this.saveAndRefresh(type);
      app.showAlert("Xóa thành công!", "success");
    }
  }

  // ============== HELPER METHODS ==============
  getTypeName(type) {
    const names = {
      subjects: "học phần",
      semesters: "kì học",
      classes: "lớp học",
      assignments: "phân công",
    };
    return names[type] || type;
  }

  findItem(type, id) {
    const data = window.sampleData || sampleData;
    return data?.[type]?.find((item) => item.id === id);
  }

  getFilteredData(type) {
    const data = window.sampleData?.[type] || sampleData?.[type] || [];

    if (!this.searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  hasRelatedData(type, id) {
    const data = window.sampleData || sampleData;
    if (!data) return false;

    if (type === "subjects") {
      return data.classes?.some((c) => c.subjectId === id);
    }
    if (type === "semesters") {
      return data.classes?.some((c) => c.semesterId === id);
    }
    if (type === "classes") {
      return data.assignments?.some((a) => a.classId === id);
    }
    return false;
  }

  getRequiredFields(type) {
    const configs = {
      subjects: [
        "code",
        "name",
        "credits",
        "coefficient",
        "periods",
        "departmentId",
      ],
      semesters: ["name", "academicYear", "startDate", "endDate", "isActive"],
      classes: [
        "classCode",
        "className",
        "subjectId",
        "semesterId",
        "studentCount",
        "coefficient",
      ],
      assignments: ["teacherId", "classId", "assignedDate", "status"],
    };
    return configs[type] || [];
  }

  getFieldLabel(type, field) {
    const labels = {
      subjects: {
        code: "mã học phần",
        name: "tên học phần",
        credits: "số tín chỉ",
      },
      semesters: { name: "tên kì học", academicYear: "năm học" },
      classes: {
        classCode: "mã lớp",
        className: "tên lớp",
        studentCount: "sĩ số",
      },
      assignments: {
        teacherId: "giảng viên",
        classId: "lớp học",
      },
    };
    return labels[type]?.[field] || field;
  }

  saveAndRefresh(type) {
    app.closeModal();
    this.refreshCurrentView();
  }

  // ============== DISPLAY METHODS ==============
  calculateStats(type, data) {
    const total = data.length;

    if (type === "semesters") {
      const active = data.filter((item) => item.isActive === true).length;
      const inactive = data.filter((item) => item.isActive === false).length;
      return { total, active, pending: 0, completed: inactive };
    } else {
      const active = data.filter((item) => item.status === "active").length;
      const pending = data.filter((item) => item.status === "pending").length;
      const completed = data.filter(
        (item) => item.status === "completed"
      ).length;
      return { total, active, pending, completed };
    }
  }

  renderStats(stats) {
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">Tổng số</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.active}</div>
          <div class="stat-label">Đang hoạt động</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.pending}</div>
          <div class="stat-label">Chờ xử lý</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.completed}</div>
          <div class="stat-label">Hoàn thành</div>
        </div>
      </div>
    `;
  }

  renderEmptyState(type) {
    return `
      <div class="empty-state">
        <i class="fas fa-inbox fa-3x"></i>
        <h4>Không có dữ liệu</h4>
        <p>Chưa có ${this.getTypeName(type)} nào được tạo.</p>
        <button class="btn btn-primary" onclick="app.courseManager.showAddModal('${type}')">
          <i class="fas fa-plus"></i> Thêm ${this.getTypeName(type)} đầu tiên
        </button>
      </div>
    `;
  }

  getPaginatedData(data) {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return data.slice(start, end);
  }

  renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    if (totalPages <= 1) return "";

    let pagination = '<div class="pagination">';

    if (this.currentPage > 1) {
      pagination += `<button class="btn btn-sm" onclick="app.courseManager.goToPage(${
        this.currentPage - 1
      })">‹</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === this.currentPage ? "btn-primary" : "";
      pagination += `<button class="btn btn-sm ${activeClass}" onclick="app.courseManager.goToPage(${i})">${i}</button>`;
    }

    if (this.currentPage < totalPages) {
      pagination += `<button class="btn btn-sm" onclick="app.courseManager.goToPage(${
        this.currentPage + 1
      })">›</button>`;
    }

    pagination += "</div>";
    return pagination;
  }

  // ============== UTILITIES ==============
  handleSearch(event, type) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.refreshTable(type);
  }

  search(type, term) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.refreshTable(type);
  }

  setupSearch(type) {
    // Search is handled by handleSearch method
  }

  refreshTable(type) {
    if (this.currentType === type) {
      this.refreshCurrentView();
    }
  }

  refreshCurrentView() {
    if (this.currentType) {
      const methodMap = {
        subjects: "loadSubjectsView",
        semesters: "loadSemestersView",
        classes: "loadClassesView",
        assignments: "loadAssignmentsView",
      };

      const method = methodMap[this.currentType];
      if (method && this[method]) {
        this[method]();
      }
    }
  }

  goToPage(page) {
    this.currentPage = page;
    this.refreshCurrentView();
  }

  escapeHtml(text) {
    if (typeof text !== "string") return text;
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
