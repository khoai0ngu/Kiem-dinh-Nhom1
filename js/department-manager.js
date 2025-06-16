class DepartmentManager {
  constructor() {
    this.currentUser = null;
    this.editingAssignmentId = null;
  }

  getCurrentUser() {
    return app.authManager.getCurrentUser();
  }

  getDepartmentName() {
    const user = this.getCurrentUser();
    const dept = sampleData.departments.find((d) => d.id === user.departmentId);
    return dept?.fullName || "N/A";
  }

  getDegreeName(degreeId) {
    const degree = sampleData.degrees.find((d) => d.id === degreeId);
    return degree?.shortName || "N/A";
  }

  // Quản lý giáo viên khoa
  async loadDepartmentTeachersView() {
    const user = this.getCurrentUser();
    const departmentTeachers = sampleData.teachers.filter(
      (t) => t.departmentId === user.departmentId
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="department-teachers-container">
        <div class="section-header">
          <h3><i class="fas fa-users"></i> Giáo viên khoa ${this.getDepartmentName()}</h3>
          <p class="text-muted">Quản lý thông tin giáo viên trong khoa</p>
        </div>

        ${Utils.createSearchInput(
          "Tìm kiếm giáo viên...",
          "app.departmentManager.searchTeachers"
        )}
        
        <div class="table-container">
          <table class="table" id="departmentTeachersTable">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã số</th>
                <th>Họ tên</th>
                <th>Bằng cấp</th>
                <th>Chuyên môn</th>
                <th>Số lớp đang dạy</th>
                <th>Workload</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${departmentTeachers
                .map((teacher, index) => {
                  const assignmentCount = sampleData.assignments.filter(
                    (a) => a.teacherId === teacher.id
                  ).length;
                  const maxClasses = 8;
                  const workloadPercent = (assignmentCount / maxClasses) * 100;
                  const workloadColor = this.getWorkloadColor(workloadPercent);

                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${teacher.code}</strong></td>
                    <td>${teacher.fullName}</td>
                    <td>${this.getDegreeName(teacher.degreeId)}</td>
                    <td>${teacher.specialization || "N/A"}</td>
                    <td>${assignmentCount}</td>
                    <td>
                      <div class="workload-bar">
                        <div class="workload-fill" style="width: ${Math.min(
                          workloadPercent,
                          100
                        )}%; background-color: ${workloadColor}"></div>
                        <span class="workload-text">${workloadPercent.toFixed(
                          0
                        )}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${
                        assignmentCount > 0 ? "badge-success" : "badge-warning"
                      }">
                        ${assignmentCount > 0 ? "Đang dạy" : "Chưa phân công"}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="app.departmentManager.viewTeacher(${
                          teacher.id
                        })" title="Xem chi tiết">
                          <i class="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        .workload-bar {
          position: relative;
          width: 80px;
          height: 16px;
          background-color: #f3f4f6;
          border-radius: 8px;
          overflow: hidden;
        }
        .workload-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        .workload-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: bold;
          color: #374151;
        }
      </style>
    `;
  }

  getWorkloadColor(percent) {
    if (percent < 50) return "#10b981"; // Green
    if (percent < 80) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  }

  // Quản lý lớp học khoa
  async loadDepartmentClassesView() {
    const user = this.getCurrentUser();
    const departmentSubjects = sampleData.subjects.filter(
      (s) => s.departmentId === user.departmentId
    );
    const subjectIds = departmentSubjects.map((s) => s.id);
    const departmentClasses = sampleData.classes.filter((c) =>
      subjectIds.includes(c.subjectId)
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="department-classes-container">
        <div class="section-header">
          <h3><i class="fas fa-chalkboard"></i> Lớp học khoa ${this.getDepartmentName()}</h3>
          <p class="text-muted">Danh sách lớp học thuộc khoa</p>
        </div>

        <div class="filter-row">
          <select class="form-select" id="semesterFilter" onchange="app.departmentManager.filterClasses()">
            <option value="all">Tất cả kì học</option>
            ${sampleData.semesters
              .map(
                (sem) =>
                  `<option value="${sem.id}">${sem.name} - ${sem.academicYear}</option>`
              )
              .join("")}
          </select>
          <select class="form-select" id="statusFilter" onchange="app.departmentManager.filterClasses()">
            <option value="all">Tất cả trạng thái</option>
            <option value="assigned">Đã phân công</option>
            <option value="unassigned">Chưa phân công</option>
          </select>
        </div>
        
        <div class="table-container">
          <table class="table" id="departmentClassesTable">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã lớp</th>
                <th>Tên lớp</th>
                <th>Học phần</th>
                <th>Kì học</th>
                <th>Số SV</th>
                <th>Hệ số</th>
                <th>Giáo viên</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="departmentClassesTableBody">
              ${this.renderDepartmentClassesRows(departmentClasses)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderDepartmentClassesRows(classes) {
    const assignedClassIds = sampleData.assignments.map((a) => a.classId);

    return classes
      .map((cls, index) => {
        const subject = sampleData.subjects.find((s) => s.id === cls.subjectId);
        const semester = sampleData.semesters.find(
          (s) => s.id === cls.semesterId
        );
        const assignment = sampleData.assignments.find(
          (a) => a.classId === cls.id
        );
        const teacher = assignment
          ? sampleData.teachers.find((t) => t.id === assignment.teacherId)
          : null;
        const isAssigned = assignedClassIds.includes(cls.id);

        return `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${cls.classCode}</strong></td>
          <td>${cls.className}</td>
          <td>${subject?.name || "N/A"}</td>
          <td>${semester?.name} ${semester?.academicYear}</td>
          <td>${cls.studentCount}</td>
          <td>${cls.coefficient}</td>
          <td>${
            teacher?.fullName ||
            '<span class="text-muted">Chưa phân công</span>'
          }</td>
          <td>
            <span class="badge ${
              isAssigned ? "badge-success" : "badge-warning"
            }">
              ${isAssigned ? "Đã phân công" : "Chưa phân công"}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-info" onclick="app.departmentManager.viewClass(${
                cls.id
              })" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  }

  // Phân công giáo viên
  async loadDepartmentAssignmentsView() {
    const user = this.getCurrentUser();
    const departmentTeachers = sampleData.teachers.filter(
      (t) => t.departmentId === user.departmentId
    );
    const teacherIds = departmentTeachers.map((t) => t.id);
    const departmentAssignments = sampleData.assignments.filter((a) =>
      teacherIds.includes(a.teacherId)
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="department-assignments-container">
        <div class="section-header">
          <h3><i class="fas fa-user-tie"></i> Phân công giáo viên khoa ${this.getDepartmentName()}</h3>
          <p class="text-muted">Quản lý phân công giảng dạy trong khoa</p>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #3b82f6;">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h3>${departmentTeachers.length}</h3>
              <p>Giáo viên</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #10b981;">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-info">
              <h3>${
                new Set(departmentAssignments.map((a) => a.teacherId)).size
              }</h3>
              <p>GV có phân công</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #f59e0b;">
              <i class="fas fa-chalkboard"></i>
            </div>
            <div class="stat-info">
              <h3>${departmentAssignments.length}</h3>
              <p>Phân công</p>
            </div>
          </div>
        </div>
        
        <div class="table-container">
          <table class="table" id="departmentAssignmentsTable">
            <thead>
              <tr>
                <th>STT</th>
                <th>Giáo viên</th>
                <th>Lớp học</th>
                <th>Học phần</th>
                <th>Kì học</th>
                <th>Số SV</th>
                <th>Ngày phân công</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${departmentAssignments
                .map((assignment, index) => {
                  const teacher = sampleData.teachers.find(
                    (t) => t.id === assignment.teacherId
                  );
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
                    <td><strong>${teacher?.fullName || "N/A"}</strong></td>
                    <td>${cls?.className || "N/A"}</td>
                    <td>${subject?.name || "N/A"}</td>
                    <td>${semester?.name} ${semester?.academicYear}</td>
                    <td>${cls?.studentCount || 0}</td>
                    <td>${Utils.formatDate(assignment.assignedDate)}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="app.departmentManager.editAssignment(${
                          assignment.id
                        })" title="Sửa">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.departmentManager.deleteAssignment(${
                          assignment.id
                        })" title="Xóa">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
      </style>
    `;
  }

  // Báo cáo lương khoa
  async loadDepartmentSalaryReportsView() {
    const user = this.getCurrentUser();
    const departmentTeachers = sampleData.teachers.filter(
      (t) => t.departmentId === user.departmentId
    );

    let totalSalary = 0;
    let totalClasses = 0;

    const salaryDetails = departmentTeachers.map((teacher) => {
      const teacherAssignments = sampleData.assignments.filter(
        (a) => a.teacherId === teacher.id
      );
      let teacherSalary = 0;

      teacherAssignments.forEach((assignment) => {
        const cls = sampleData.classes.find((c) => c.id === assignment.classId);
        const subject = sampleData.subjects.find(
          (s) => s.id === cls?.subjectId
        );
        if (cls && subject) {
          const payment = app.reportsManager.calculateSimplePayment(
            teacher,
            cls,
            subject
          );
          teacherSalary += payment.totalSalary;
        }
      });

      totalSalary += teacherSalary;
      totalClasses += teacherAssignments.length;

      return {
        teacher,
        classCount: teacherAssignments.length,
        totalSalary: teacherSalary,
      };
    });

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="department-salary-reports-container">
        <div class="section-header">
          <h3><i class="fas fa-file-invoice-dollar"></i> Báo cáo lương khoa ${this.getDepartmentName()}</h3>
          <p class="text-muted">Tổng hợp lương giảng dạy của khoa</p>
        </div>

        <div class="report-summary">
          <div class="summary-cards">
            <div class="summary-card">
              <h3>${departmentTeachers.length}</h3>
              <p>Tổng giáo viên</p>
            </div>
            <div class="summary-card">
              <h3>${totalClasses}</h3>
              <p>Tổng lớp</p>
            </div>
            <div class="summary-card">
              <h3>${Utils.formatCurrency(totalSalary)}</h3>
              <p>Tổng lương</p>
            </div>
            <div class="summary-card">
              <h3>${Utils.formatCurrency(
                departmentTeachers.length > 0
                  ? totalSalary / departmentTeachers.length
                  : 0
              )}</h3>
              <p>Lương TB/GV</p>
            </div>
          </div>
        </div>
        
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Giáo viên</th>
                <th>Bằng cấp</th>
                <th>Số lớp</th>
                <th>Lương dự kiến</th>
              </tr>
            </thead>
            <tbody>
              ${salaryDetails
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${item.teacher.fullName}</strong></td>
                  <td>${this.getDegreeName(item.teacher.degreeId)}</td>
                  <td>${item.classCount}</td>
                  <td><strong>${Utils.formatCurrency(
                    item.totalSalary
                  )}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr class="table-total">
                <td colspan="3"><strong>Tổng cộng</strong></td>
                <td><strong>${totalClasses}</strong></td>
                <td><strong>${Utils.formatCurrency(totalSalary)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  // Báo cáo giáo viên khoa
  async loadDepartmentTeacherReportsView() {
    const user = this.getCurrentUser();
    const departmentTeachers = sampleData.teachers.filter(
      (t) => t.departmentId === user.departmentId
    );

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = `
      <div class="department-teacher-reports-container">
        <div class="section-header">
          <h3><i class="fas fa-file-user"></i> Báo cáo giáo viên khoa ${this.getDepartmentName()}</h3>
          <p class="text-muted">Thống kê chi tiết về giáo viên</p>
        </div>

        <div class="chart-container">
          <div class="chart-card">
            <h4>Phân bố theo bằng cấp</h4>
            <canvas id="degreeDistributionChart"></canvas>
          </div>
          <div class="chart-card">
            <h4>Phân bố workload</h4>
            <canvas id="workloadDistributionChart"></canvas>
          </div>
        </div>
        
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Giáo viên</th>
                <th>Bằng cấp</th>
                <th>Chuyên môn</th>
                <th>Số lớp</th>
                <th>Workload</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${departmentTeachers
                .map((teacher, index) => {
                  const assignmentCount = sampleData.assignments.filter(
                    (a) => a.teacherId === teacher.id
                  ).length;
                  const maxClasses = 8;
                  const workloadPercent = (assignmentCount / maxClasses) * 100;
                  const workloadColor = this.getWorkloadColor(workloadPercent);

                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${teacher.fullName}</strong></td>
                    <td>${this.getDegreeName(teacher.degreeId)}</td>
                    <td>${teacher.specialization || "N/A"}</td>
                    <td>${assignmentCount}</td>
                    <td>
                      <div class="workload-bar">
                        <div class="workload-fill" style="width: ${Math.min(
                          workloadPercent,
                          100
                        )}%; background-color: ${workloadColor}"></div>
                        <span class="workload-text">${workloadPercent.toFixed(
                          0
                        )}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${
                        assignmentCount > 0
                          ? "badge-success"
                          : "badge-secondary"
                      }">
                        ${assignmentCount > 0 ? "Hoạt động" : "Chưa phân công"}
                      </span>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.initializeDepartmentCharts(departmentTeachers);
  }

  initializeDepartmentCharts(teachers) {
    // Degree distribution chart
    setTimeout(() => {
      const degreeCtx = document.getElementById("degreeDistributionChart");
      if (degreeCtx) {
        const degreeData = this.groupTeachersByDegree(teachers);
        new Chart(degreeCtx, {
          type: "pie",
          data: {
            labels: degreeData.map((d) => d.degree),
            datasets: [
              {
                data: degreeData.map((d) => d.count),
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                borderWidth: 2,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" },
            },
          },
        });
      }

      // Workload distribution chart
      const workloadCtx = document.getElementById("workloadDistributionChart");
      if (workloadCtx) {
        const workloadData = this.groupTeachersByWorkload(teachers);
        new Chart(workloadCtx, {
          type: "bar",
          data: {
            labels: workloadData.map((w) => w.range),
            datasets: [
              {
                label: "Số giáo viên",
                data: workloadData.map((w) => w.count),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                borderColor: "rgba(59, 130, 246, 1)",
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
                ticks: { stepSize: 1 },
              },
            },
          },
        });
      }
    }, 100);
  }

  groupTeachersByDegree(teachers) {
    const degreeGroups = {};

    teachers.forEach((teacher) => {
      const degree = sampleData.degrees.find((d) => d.id === teacher.degreeId);
      const degreeName = degree?.shortName || "N/A";

      if (!degreeGroups[degreeName]) {
        degreeGroups[degreeName] = { degree: degreeName, count: 0 };
      }
      degreeGroups[degreeName].count++;
    });

    return Object.values(degreeGroups);
  }

  groupTeachersByWorkload(teachers) {
    const ranges = [
      { range: "0-25%", count: 0 },
      { range: "26-50%", count: 0 },
      { range: "51-75%", count: 0 },
      { range: ">75%", count: 0 },
    ];

    teachers.forEach((teacher) => {
      const assignmentCount = sampleData.assignments.filter(
        (a) => a.teacherId === teacher.id
      ).length;
      const workloadPercent = (assignmentCount / 8) * 100;

      if (workloadPercent <= 25) {
        ranges[0].count++;
      } else if (workloadPercent <= 50) {
        ranges[1].count++;
      } else if (workloadPercent <= 75) {
        ranges[2].count++;
      } else {
        ranges[3].count++;
      }
    });

    return ranges;
  }

  // Modal content for assignments
  getAssignmentsModalContent(assignment = null) {
    const user = this.getCurrentUser();
    const departmentTeachers = sampleData.teachers.filter(
      (t) => t.departmentId === user.departmentId
    );
    const departmentSubjects = sampleData.subjects.filter(
      (s) => s.departmentId === user.departmentId
    );
    const subjectIds = departmentSubjects.map((s) => s.id);
    const availableClasses = sampleData.classes.filter(
      (c) =>
        subjectIds.includes(c.subjectId) &&
        (!assignment ||
          !sampleData.assignments.some(
            (a) => a.classId === c.id && a.id !== assignment.id
          ))
    );

    return `
      <form id="departmentAssignmentForm">
        <div class="form-group">
          <label class="form-label">Giáo viên *</label>
          <select name="teacherId" class="form-select">
            <option value="">Chọn giáo viên</option>
            ${departmentTeachers
              .map(
                (teacher) =>
                  `<option value="${teacher.id}" ${
                    assignment?.teacherId === teacher.id ? "selected" : ""
                  }>
                ${teacher.fullName} (${teacher.code})
              </option>`
              )
              .join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Lớp học *</label>
          <select name="classId" class="form-select">
            <option value="">Chọn lớp học</option>
            ${availableClasses
              .map((cls) => {
                const subject = sampleData.subjects.find(
                  (s) => s.id === cls.subjectId
                );
                const semester = sampleData.semesters.find(
                  (s) => s.id === cls.semesterId
                );
                return `<option value="${cls.id}" ${
                  assignment?.classId === cls.id ? "selected" : ""
                }>
                ${cls.className} - ${subject?.name} (${semester?.name})
              </option>`;
              })
              .join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ngày phân công *</label>
          <input type="date" name="assignedDate" class="form-input" 
                 value="${
                   assignment?.assignedDate ||
                   new Date().toISOString().split("T")[0]
                 }">
        </div>
        <div class="form-group">
          <label class="form-label">Ghi chú</label>
          <textarea name="notes" class="form-input" rows="3" 
                    placeholder="Nhập ghi chú (tùy chọn)">${
                      assignment?.notes || ""
                    }</textarea>
        </div>
      </form>
    `;
  }

  // CRUD operations
  editAssignment(id) {
    const assignment = sampleData.assignments.find((a) => a.id === id);
    if (!assignment) return;

    this.editingAssignmentId = id;
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = "Sửa phân công";
    modalBody.innerHTML = this.getAssignmentsModalContent(assignment);
    modal.classList.add("active");
  }

  saveAssignment() {
    const form = document.getElementById("departmentAssignmentForm");
    if (!form) return;

    const validator = new FormValidator(form)
      .required("teacherId", "Giáo viên là bắt buộc")
      .required("classId", "Lớp học là bắt buộc")
      .required("assignedDate", "Ngày phân công là bắt buộc");

    const { isValid } = validator.validate();
    if (!isValid) return;

    const formData = new FormData(form);
    const teacherId = parseInt(formData.get("teacherId"));
    const classId = parseInt(formData.get("classId"));
    const user = this.getCurrentUser();

    // Check if assignment already exists (for new assignments)
    if (
      !this.editingAssignmentId &&
      sampleData.assignments.some((a) => a.classId === classId)
    ) {
      app.showAlert("Lớp học đã được phân công cho giáo viên khác!", "warning");
      return;
    }

    const assignment = {
      id:
        this.editingAssignmentId ||
        DataManager.getNextId(sampleData.assignments),
      teacherId: teacherId,
      classId: classId,
      assignedDate: formData.get("assignedDate"),
      assignedBy: user.id,
      status: "active",
      notes: formData.get("notes") || "",
    };

    if (this.editingAssignmentId) {
      const index = sampleData.assignments.findIndex(
        (a) => a.id === this.editingAssignmentId
      );
      sampleData.assignments[index] = assignment;
    } else {
      sampleData.assignments.push(assignment);
    }

    DataManager.saveToLocalStorage();
    app.closeModal();
    this.loadDepartmentAssignmentsView();
    app.showAlert(
      `${this.editingAssignmentId ? "Cập nhật" : "Thêm"} phân công thành công!`,
      "success"
    );
    this.editingAssignmentId = null;
  }

  deleteAssignment(id) {
    const assignment = sampleData.assignments.find((a) => a.id === id);
    if (!assignment) return;

    const teacher = sampleData.teachers.find(
      (t) => t.id === assignment.teacherId
    );
    const cls = sampleData.classes.find((c) => c.id === assignment.classId);

    Utils.showConfirmDialog(
      `Bạn có chắc chắn muốn xóa phân công "${teacher?.fullName}" dạy lớp "${cls?.className}"?`,
      () => {
        sampleData.assignments = sampleData.assignments.filter(
          (a) => a.id !== id
        );
        DataManager.saveToLocalStorage();
        this.loadDepartmentAssignmentsView();
        app.showAlert("Xóa phân công thành công!", "success");
      }
    );
  }

  // View details
  viewTeacher(id) {
    const teacher = sampleData.teachers.find((t) => t.id === id);
    if (!teacher) return;

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const degree = sampleData.degrees.find((d) => d.id === teacher.degreeId);
    const assignments = sampleData.assignments.filter(
      (a) => a.teacherId === id
    );

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
          <strong>Ngày sinh:</strong> ${Utils.formatDate(teacher.birthDate)}
        </div>
        <div class="detail-row">
          <strong>Tuổi:</strong> ${Utils.calculateAge(teacher.birthDate)} tuổi
        </div>
        <div class="detail-row">
          <strong>Điện thoại:</strong> ${teacher.phone}
        </div>
        <div class="detail-row">
          <strong>Email:</strong> ${teacher.email}
        </div>
        <div class="detail-row">
          <strong>Bằng cấp:</strong> ${degree?.fullName || "N/A"}
        </div>
        <div class="detail-row">
          <strong>Chuyên môn:</strong> ${teacher.specialization || "N/A"}
        </div>
        <div class="detail-row">
          <strong>Hệ số cá nhân:</strong> ${teacher.coefficient || 1.0}
        </div>
        <div class="detail-row">
          <strong>Số lớp đang dạy:</strong> ${assignments.length}
        </div>
      </div>
    `;

    // Hide save button for view mode
    document.getElementById("modalSave").style.display = "none";
    modal.classList.add("active");
  }

  viewClass(id) {
    const cls = sampleData.classes.find((c) => c.id === id);
    if (!cls) return;

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const subject = sampleData.subjects.find((s) => s.id === cls.subjectId);
    const semester = sampleData.semesters.find((s) => s.id === cls.semesterId);
    const assignment = sampleData.assignments.find((a) => a.classId === id);
    const teacher = assignment
      ? sampleData.teachers.find((t) => t.id === assignment.teacherId)
      : null;

    modalTitle.textContent = "Thông tin lớp học";
    modalBody.innerHTML = `
      <div class="class-details">
        <div class="detail-row">
          <strong>Mã lớp:</strong> ${cls.classCode}
        </div>
        <div class="detail-row">
          <strong>Tên lớp:</strong> ${cls.className}
        </div>
        <div class="detail-row">
          <strong>Kì học:</strong> ${
            semester ? `${semester.name} - ${semester.academicYear}` : "N/A"
          }
        </div>
        <div class="detail-row">
          <strong>Học phần:</strong> ${subject?.name || "N/A"}
        </div>
        <div class="detail-row">
          <strong>Số sinh viên:</strong> ${cls.studentCount}
        </div>
        <div class="detail-row">
          <strong>Hệ số lớp:</strong> ${cls.coefficient}
        </div>
        <div class="detail-row">
          <strong>Lịch học:</strong> ${cls.schedule || "N/A"}
        </div>
        <div class="detail-row">
          <strong>Phòng học:</strong> ${cls.room || "N/A"}
        </div>
        <div class="detail-row">
          <strong>Giáo viên phụ trách:</strong> ${
            teacher?.fullName || "Chưa phân công"
          }
        </div>
        ${
          assignment
            ? `
          <div class="detail-row">
            <strong>Ngày phân công:</strong> ${Utils.formatDate(
              assignment.assignedDate
            )}
          </div>
        `
            : ""
        }
      </div>
    `;

    // Hide save button for view mode
    document.getElementById("modalSave").style.display = "none";
    modal.classList.add("active");
  }

  // Filter and search functions
  filterClasses() {
    const semesterFilter = document.getElementById("semesterFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    const user = this.getCurrentUser();
    const departmentSubjects = sampleData.subjects.filter(
      (s) => s.departmentId === user.departmentId
    );
    const subjectIds = departmentSubjects.map((s) => s.id);
    let departmentClasses = sampleData.classes.filter((c) =>
      subjectIds.includes(c.subjectId)
    );

    // Apply filters
    if (semesterFilter !== "all") {
      departmentClasses = departmentClasses.filter(
        (c) => c.semesterId === parseInt(semesterFilter)
      );
    }

    if (statusFilter !== "all") {
      const assignedClassIds = sampleData.assignments.map((a) => a.classId);
      if (statusFilter === "assigned") {
        departmentClasses = departmentClasses.filter((c) =>
          assignedClassIds.includes(c.id)
        );
      } else if (statusFilter === "unassigned") {
        departmentClasses = departmentClasses.filter(
          (c) => !assignedClassIds.includes(c.id)
        );
      }
    }

    // Update table
    const tableBody = document.getElementById("departmentClassesTableBody");
    if (tableBody) {
      tableBody.innerHTML = this.renderDepartmentClassesRows(departmentClasses);
    }
  }

  searchTeachers(searchTerm) {
    // Implementation for teacher search
    console.log("Searching teachers:", searchTerm);
  }
}
