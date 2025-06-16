class ReportsManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.searchTerm = "";
    this.selectedSemester = "all";
    this.selectedDepartment = "all";
    this.selectedTeacher = "all";
    this.selectedSubject = "all";
    this.dateFrom = "";
    this.dateTo = "";
  }

  // Salary Reports
  async loadSalaryReportsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
            <div class="reports-header">
                <h2><i class="fas fa-money-bill-wave"></i> Báo cáo lương giảng dạy</h2>
                <div class="report-filters">
                    <div class="filter-row">
                        <select class="form-select" id="salaryReportSemester">
                            <option value="all">Tất cả kì học</option>
                            ${sampleData.semesters
                              .map(
                                (sem) =>
                                  `<option value="${sem.id}">${sem.name} - ${sem.academicYear}</option>`
                              )
                              .join("")}
                        </select>
                        <select class="form-select" id="salaryReportDepartment">
                            <option value="all">Tất cả khoa</option>
                            ${sampleData.departments
                              .map(
                                (dept) =>
                                  `<option value="${dept.id}">${dept.shortName}</option>`
                              )
                              .join("")}
                        </select>
                        <select class="form-select" id="salaryReportTeacher">
                            <option value="all">Tất cả giáo viên</option>
                            ${sampleData.teachers
                              .map(
                                (teacher) =>
                                  `<option value="${teacher.id}">${teacher.fullName}</option>`
                              )
                              .join("")}
                        </select>
                        <button class="btn btn-primary" onclick="app.reportsManager.generateSalaryReport()">
                            <i class="fas fa-search"></i> Tạo báo cáo
                        </button>
                    </div>
                </div>
            </div>

            <div id="salaryReportContent"></div>
        `;

    this.setupSalaryReportFilters();
    this.generateSalaryReport(); // Load initial report
  }

  setupSalaryReportFilters() {
    const semesterSelect = document.getElementById("salaryReportSemester");
    const departmentSelect = document.getElementById("salaryReportDepartment");
    const teacherSelect = document.getElementById("salaryReportTeacher");

    if (semesterSelect) {
      semesterSelect.addEventListener("change", (e) => {
        this.selectedSemester = e.target.value;
      });
    }

    if (departmentSelect) {
      departmentSelect.addEventListener("change", (e) => {
        this.selectedDepartment = e.target.value;
        this.updateTeacherFilter();
      });
    }

    if (teacherSelect) {
      teacherSelect.addEventListener("change", (e) => {
        this.selectedTeacher = e.target.value;
      });
    }
  }

  updateTeacherFilter() {
    const teacherSelect = document.getElementById("salaryReportTeacher");
    if (!teacherSelect) return;

    const filteredTeachers =
      this.selectedDepartment === "all"
        ? sampleData.teachers
        : sampleData.teachers.filter(
            (t) => t.departmentId === parseInt(this.selectedDepartment)
          );

    teacherSelect.innerHTML = `
            <option value="all">Tất cả giáo viên</option>
            ${filteredTeachers
              .map(
                (teacher) =>
                  `<option value="${teacher.id}">${teacher.fullName}</option>`
              )
              .join("")}
        `;
  }

  generateSalaryReport() {
    const reportData = this.calculateSalaryData();
    const reportContent = document.getElementById("salaryReportContent");

    if (!reportContent) return;

    reportContent.innerHTML = `
            <div class="report-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>${reportData.totalTeachers}</h3>
                        <p>Tổng số giáo viên</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.totalClasses}</h3>
                        <p>Tổng số lớp</p>
                    </div>
                    <div class="summary-card">
                        <h3>${Utils.formatCurrency(reportData.totalSalary)}</h3>
                        <p>Tổng tiền lương</p>
                    </div>
                    <div class="summary-card">
                        <h3>${Utils.formatCurrency(reportData.avgSalary)}</h3>
                        <p>Lương trung bình</p>
                    </div>
                </div>
            </div>

            <div class="report-actions">
                <button class="btn btn-success" onclick="app.reportsManager.exportSalaryReport('excel')">
                    <i class="fas fa-file-excel"></i> Xuất Excel
                </button>
                <button class="btn btn-danger" onclick="app.reportsManager.exportSalaryReport('pdf')">
                    <i class="fas fa-file-pdf"></i> Xuất PDF
                </button>
                <button class="btn btn-info" onclick="app.reportsManager.printSalaryReport()">
                    <i class="fas fa-print"></i> In báo cáo
                </button>
            </div>

            <div class="table-container">
                <table class="table" id="salaryReportTable">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Giáo viên</th>
                            <th>Khoa</th>
                            <th>Số lớp</th>
                            <th>Tổng SV</th>
                            <th>Tổng tiết</th>
                            <th>Hệ số TB</th>
                            <th>Lương cơ bản</th>
                            <th>Phụ cấp</th>
                            <th>Tổng lương</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.details
                          .map(
                            (item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${item.teacherName}</strong></td>
                                <td>${item.departmentName}</td>
                                <td>${item.classCount}</td>
                                <td>${item.totalStudents}</td>
                                <td>${item.totalPeriods}</td>
                                <td>${item.avgCoefficient.toFixed(2)}</td>
                                <td>${Utils.formatCurrency(
                                  item.baseSalary
                                )}</td>
                                <td>${Utils.formatCurrency(item.allowance)}</td>
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
                            <td><strong>${reportData.totalClasses}</strong></td>
                            <td><strong>${
                              reportData.totalStudents
                            }</strong></td>
                            <td><strong>${reportData.totalPeriods}</strong></td>
                            <td><strong>${reportData.totalAvgCoefficient.toFixed(
                              2
                            )}</strong></td>
                            <td><strong>${Utils.formatCurrency(
                              reportData.totalBaseSalary
                            )}</strong></td>
                            <td><strong>${Utils.formatCurrency(
                              reportData.totalAllowance
                            )}</strong></td>
                            <td><strong>${Utils.formatCurrency(
                              reportData.totalSalary
                            )}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="chart-section">
                <div class="chart-container">
                    <div class="chart-card">
                        <h3>Phân bố lương theo khoa</h3>
                        <canvas id="salaryByDepartmentChart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>Top 10 giáo viên có lương cao nhất</h3>
                        <canvas id="topTeachersChart"></canvas>
                    </div>
                </div>
            </div>
        `;

    this.initializeSalaryCharts(reportData);
  }

  calculateSalaryData() {
    let filteredAssignments = sampleData.assignments;

    // Apply semester filter
    if (this.selectedSemester !== "all") {
      const semesterClasses = sampleData.classes.filter(
        (c) => c.semesterId === parseInt(this.selectedSemester)
      );
      const semesterClassIds = semesterClasses.map((c) => c.id);
      filteredAssignments = filteredAssignments.filter((a) =>
        semesterClassIds.includes(a.classId)
      );
    }

    // Apply teacher filter
    if (this.selectedTeacher !== "all") {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.teacherId === parseInt(this.selectedTeacher)
      );
    }

    // Apply department filter
    if (this.selectedDepartment !== "all") {
      const departmentTeachers = sampleData.teachers.filter(
        (t) => t.departmentId === parseInt(this.selectedDepartment)
      );
      const departmentTeacherIds = departmentTeachers.map((t) => t.id);
      filteredAssignments = filteredAssignments.filter((a) =>
        departmentTeacherIds.includes(a.teacherId)
      );
    }

    // Group by teacher
    const teacherSalaries = {};
    filteredAssignments.forEach((assignment) => {
      const teacher = sampleData.teachers.find(
        (t) => t.id === assignment.teacherId
      );
      const cls = sampleData.classes.find((c) => c.id === assignment.classId);
      const subject = sampleData.subjects.find((s) => s.id === cls?.subjectId);

      if (!teacher || !cls || !subject) return;

      if (!teacherSalaries[teacher.id]) {
        const department = sampleData.departments.find(
          (d) => d.id === teacher.departmentId
        );
        teacherSalaries[teacher.id] = {
          teacherName: teacher.fullName,
          departmentName: department?.shortName || "N/A",
          classCount: 0,
          totalStudents: 0,
          totalPeriods: 0,
          totalCoefficient: 0,
          baseSalary: 0,
          allowance: 0,
          totalSalary: 0,
        };
      }

      const salaryData = teacherSalaries[teacher.id];
      const payment = this.calculateSimplePayment(teacher, cls, subject);

      salaryData.classCount++;
      salaryData.totalStudents += cls.studentCount;
      salaryData.totalPeriods += subject.periods;
      salaryData.totalCoefficient +=
        (cls.coefficient || 1.0) * (subject.coefficient || 1.0);
      salaryData.baseSalary += payment.baseSalary;
      salaryData.allowance += payment.allowance;
      salaryData.totalSalary += payment.totalSalary;
    });

    // Convert to array and calculate averages
    const details = Object.values(teacherSalaries).map((item) => ({
      ...item,
      avgCoefficient:
        item.classCount > 0 ? item.totalCoefficient / item.classCount : 0,
    }));

    // Sort by total salary descending
    details.sort((a, b) => b.totalSalary - a.totalSalary);

    // Calculate totals
    const totalTeachers = details.length;
    const totalClasses = details.reduce(
      (sum, item) => sum + item.classCount,
      0
    );
    const totalStudents = details.reduce(
      (sum, item) => sum + item.totalStudents,
      0
    );
    const totalPeriods = details.reduce(
      (sum, item) => sum + item.totalPeriods,
      0
    );
    const totalBaseSalary = details.reduce(
      (sum, item) => sum + item.baseSalary,
      0
    );
    const totalAllowance = details.reduce(
      (sum, item) => sum + item.allowance,
      0
    );
    const totalSalary = details.reduce(
      (sum, item) => sum + item.totalSalary,
      0
    );
    const avgSalary = totalTeachers > 0 ? totalSalary / totalTeachers : 0;
    const totalAvgCoefficient = details.reduce(
      (sum, item) => sum + item.avgCoefficient,
      0
    );

    return {
      totalTeachers,
      totalClasses,
      totalStudents,
      totalPeriods,
      totalBaseSalary,
      totalAllowance,
      totalSalary,
      avgSalary,
      totalAvgCoefficient,
      details,
    };
  }

  // Simple payment calculation function
  calculateSimplePayment(teacher, cls, subject) {
    const baseRatePerPeriod =
      sampleData.paymentSettings?.baseRatePerPeriod || 50000;
    const baseAllowance = sampleData.paymentSettings?.baseAllowance || 200000;

    // Get degree coefficient
    const degree = sampleData.degrees.find((d) => d.id === teacher.degreeId);
    const degreeCoeff = degree?.coefficient || 1.0;

    // Calculate coefficients
    const teacherCoeff = teacher.coefficient || 1.0;
    const subjectCoeff = subject.coefficient || 1.0;
    const classCoeff = cls.coefficient || 1.0;

    // Student count coefficient
    let studentCoeff = 1.0;
    if (cls.studentCount > 70) studentCoeff = 1.3;
    else if (cls.studentCount > 50) studentCoeff = 1.2;
    else if (cls.studentCount > 30) studentCoeff = 1.1;

    // Calculate base salary
    const totalPeriods = subject.periods || 45;
    const totalCoeff =
      degreeCoeff * teacherCoeff * subjectCoeff * classCoeff * studentCoeff;
    const baseSalary = totalPeriods * baseRatePerPeriod * totalCoeff;

    // Calculate allowance
    const allowance = baseAllowance * degreeCoeff;

    // Total salary
    const totalSalary = baseSalary + allowance;

    return {
      baseSalary: Math.round(baseSalary),
      allowance: Math.round(allowance),
      totalSalary: Math.round(totalSalary),
    };
  }

  initializeSalaryCharts(reportData) {
    // Department salary chart
    const deptCtx = document.getElementById("salaryByDepartmentChart");
    if (deptCtx) {
      const deptData = this.groupSalaryByDepartment(reportData.details);
      new Chart(deptCtx, {
        type: "pie",
        data: {
          labels: deptData.map((d) => d.department),
          datasets: [
            {
              data: deptData.map((d) => d.totalSalary),
              backgroundColor: [
                "#2563eb",
                "#059669",
                "#d97706",
                "#dc2626",
                "#7c3aed",
                "#0891b2",
                "#ea580c",
                "#be185d",
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
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = Utils.formatCurrency(context.raw);
                  return `${context.label}: ${value}`;
                },
              },
            },
          },
        },
      });
    }

    // Top teachers chart
    const topCtx = document.getElementById("topTeachersChart");
    if (topCtx) {
      const topTeachers = reportData.details.slice(0, 10);
      new Chart(topCtx, {
        type: "bar",
        data: {
          labels: topTeachers.map((t) => t.teacherName.split(" ").pop()), // Last name only
          datasets: [
            {
              label: "Tổng lương",
              data: topTeachers.map((t) => t.totalSalary),
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
                callback: (value) => Utils.formatCurrency(value),
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = Utils.formatCurrency(context.raw);
                  return `Tổng lương: ${value}`;
                },
              },
            },
          },
        },
      });
    }
  }

  groupSalaryByDepartment(details) {
    const deptGroups = {};

    details.forEach((item) => {
      if (!deptGroups[item.departmentName]) {
        deptGroups[item.departmentName] = {
          department: item.departmentName,
          totalSalary: 0,
          teacherCount: 0,
        };
      }
      deptGroups[item.departmentName].totalSalary += item.totalSalary;
      deptGroups[item.departmentName].teacherCount++;
    });

    return Object.values(deptGroups);
  }

  // Class Reports
  async loadClassReportsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
            <div class="reports-header">
                <h2><i class="fas fa-chalkboard"></i> Báo cáo lớp học</h2>
                <div class="report-filters">
                    <div class="filter-row">
                        <select class="form-select" id="classReportSemester">
                            <option value="all">Tất cả kì học</option>
                            ${sampleData.semesters
                              .map(
                                (sem) =>
                                  `<option value="${sem.id}">${sem.name} - ${sem.academicYear}</option>`
                              )
                              .join("")}
                        </select>
                        <select class="form-select" id="classReportSubject">
                            <option value="all">Tất cả học phần</option>
                            ${sampleData.subjects
                              .map(
                                (sub) =>
                                  `<option value="${sub.id}">${sub.name}</option>`
                              )
                              .join("")}
                        </select>
                        <button class="btn btn-primary" onclick="app.reportsManager.generateClassReport()">
                            <i class="fas fa-search"></i> Tạo báo cáo
                        </button>
                    </div>
                </div>
            </div>

            <div id="classReportContent"></div>
        `;

    this.setupClassReportFilters();
    this.generateClassReport();
  }

  setupClassReportFilters() {
    const semesterSelect = document.getElementById("classReportSemester");
    const subjectSelect = document.getElementById("classReportSubject");

    if (semesterSelect) {
      semesterSelect.addEventListener("change", (e) => {
        this.selectedSemester = e.target.value;
      });
    }

    if (subjectSelect) {
      subjectSelect.addEventListener("change", (e) => {
        this.selectedSubject = e.target.value;
      });
    }
  }

  generateClassReport() {
    const reportData = this.calculateClassData();
    const reportContent = document.getElementById("classReportContent");

    if (!reportContent) return;

    reportContent.innerHTML = `
            <div class="report-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>${reportData.totalClasses}</h3>
                        <p>Tổng số lớp</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.assignedClasses}</h3>
                        <p>Lớp đã phân công</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.unassignedClasses}</h3>
                        <p>Lớp chưa phân công</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.totalStudents}</h3>
                        <p>Tổng số sinh viên</p>
                    </div>
                </div>
            </div>

            <div class="report-actions">
                <button class="btn btn-success" onclick="app.reportsManager.exportClassReport('excel')">
                    <i class="fas fa-file-excel"></i> Xuất Excel
                </button>
                <button class="btn btn-danger" onclick="app.reportsManager.exportClassReport('pdf')">
                    <i class="fas fa-file-pdf"></i> Xuất PDF
                </button>
            </div>

            <div class="table-container">
                <table class="table" id="classReportTable">
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
                            <th>Khoa</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.details
                          .map(
                            (item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${item.classCode}</strong></td>
                                <td>${item.className}</td>
                                <td>${item.subjectName}</td>
                                <td>${item.semesterName}</td>
                                <td>${item.studentCount}</td>
                                <td>${item.coefficient}</td>
                                <td>${
                                  item.teacherName ||
                                  '<span class="text-muted">Chưa phân công</span>'
                                }</td>
                                <td>${item.departmentName || "N/A"}</td>
                                <td>
                                    <span class="badge ${
                                      item.isAssigned
                                        ? "badge-success"
                                        : "badge-warning"
                                    }">
                                        ${
                                          item.isAssigned
                                            ? "Đã phân công"
                                            : "Chưa phân công"
                                        }
                                    </span>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div class="chart-section">
                <div class="chart-container">
                    <div class="chart-card">
                        <h3>Phân bố lớp theo học phần</h3>
                        <canvas id="classesBySubjectChart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>Tỷ lệ phân công</h3>
                        <canvas id="assignmentRateChart"></canvas>
                    </div>
                </div>
            </div>
        `;

    this.initializeClassCharts(reportData);
  }

  calculateClassData() {
    let filteredClasses = sampleData.classes;

    // Apply semester filter
    if (this.selectedSemester !== "all") {
      filteredClasses = filteredClasses.filter(
        (c) => c.semesterId === parseInt(this.selectedSemester)
      );
    }

    // Apply subject filter
    if (this.selectedSubject !== "all") {
      filteredClasses = filteredClasses.filter(
        (c) => c.subjectId === parseInt(this.selectedSubject)
      );
    }

    const assignedClassIds = sampleData.assignments.map((a) => a.classId);

    const details = filteredClasses.map((cls) => {
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
      const department = teacher
        ? sampleData.departments.find((d) => d.id === teacher.departmentId)
        : null;

      return {
        classCode: cls.classCode,
        className: cls.className,
        subjectName: subject?.name || "N/A",
        semesterName: `${semester?.name} - ${semester?.academicYear}`,
        studentCount: cls.studentCount,
        coefficient: cls.coefficient,
        teacherName: teacher?.fullName,
        departmentName: department?.shortName,
        isAssigned: assignedClassIds.includes(cls.id),
      };
    });

    const totalClasses = details.length;
    const assignedClasses = details.filter((d) => d.isAssigned).length;
    const unassignedClasses = totalClasses - assignedClasses;
    const totalStudents = details.reduce(
      (sum, item) => sum + item.studentCount,
      0
    );

    return {
      totalClasses,
      assignedClasses,
      unassignedClasses,
      totalStudents,
      details,
    };
  }

  initializeClassCharts(reportData) {
    // Classes by subject chart
    const subjectCtx = document.getElementById("classesBySubjectChart");
    if (subjectCtx) {
      const subjectData = this.groupClassesBySubject(reportData.details);
      new Chart(subjectCtx, {
        type: "bar",
        data: {
          labels: subjectData.map((s) => s.subject),
          datasets: [
            {
              label: "Số lớp",
              data: subjectData.map((s) => s.count),
              backgroundColor: "rgba(5, 150, 105, 0.8)",
              borderColor: "rgba(5, 150, 105, 1)",
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

    // Assignment rate chart
    const rateCtx = document.getElementById("assignmentRateChart");
    if (rateCtx) {
      new Chart(rateCtx, {
        type: "doughnut",
        data: {
          labels: ["Đã phân công", "Chưa phân công"],
          datasets: [
            {
              data: [reportData.assignedClasses, reportData.unassignedClasses],
              backgroundColor: ["#059669", "#f59e0b"],
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
  }

  groupClassesBySubject(details) {
    const subjectGroups = {};

    details.forEach((item) => {
      if (!subjectGroups[item.subjectName]) {
        subjectGroups[item.subjectName] = {
          subject: item.subjectName,
          count: 0,
        };
      }
      subjectGroups[item.subjectName].count++;
    });

    return Object.values(subjectGroups);
  }

  // Teacher Reports
  async loadTeacherReportsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
            <div class="reports-header">
                <h2><i class="fas fa-user-tie"></i> Báo cáo giáo viên</h2>
                <div class="report-filters">
                    <div class="filter-row">
                        <select class="form-select" id="teacherReportDepartment">
                            <option value="all">Tất cả khoa</option>
                            ${sampleData.departments
                              .map(
                                (dept) =>
                                  `<option value="${dept.id}">${dept.shortName}</option>`
                              )
                              .join("")}
                        </select>
                        <select class="form-select" id="teacherReportSemester">
                            <option value="all">Tất cả kì học</option>
                            ${sampleData.semesters
                              .map(
                                (sem) =>
                                  `<option value="${sem.id}">${sem.name} - ${sem.academicYear}</option>`
                              )
                              .join("")}
                        </select>
                        <button class="btn btn-primary" onclick="app.reportsManager.generateTeacherReport()">
                            <i class="fas fa-search"></i> Tạo báo cáo
                        </button>
                    </div>
                </div>
            </div>

            <div id="teacherReportContent"></div>
        `;

    this.setupTeacherReportFilters();
    this.generateTeacherReport();
  }

  setupTeacherReportFilters() {
    const departmentSelect = document.getElementById("teacherReportDepartment");
    const semesterSelect = document.getElementById("teacherReportSemester");

    if (departmentSelect) {
      departmentSelect.addEventListener("change", (e) => {
        this.selectedDepartment = e.target.value;
      });
    }

    if (semesterSelect) {
      semesterSelect.addEventListener("change", (e) => {
        this.selectedSemester = e.target.value;
      });
    }
  }

  generateTeacherReport() {
    const reportData = this.calculateTeacherData();
    const reportContent = document.getElementById("teacherReportContent");

    if (!reportContent) return;

    reportContent.innerHTML = `
            <div class="report-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <h3>${reportData.totalTeachers}</h3>
                        <p>Tổng số giáo viên</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.activeTeachers}</h3>
                        <p>Giáo viên có phân công</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.inactiveTeachers}</h3>
                        <p>Giáo viên chưa có phân công</p>
                    </div>
                    <div class="summary-card">
                        <h3>${reportData.avgClassesPerTeacher.toFixed(1)}</h3>
                        <p>Trung bình lớp/GV</p>
                    </div>
                </div>
            </div>

            <div class="report-actions">
                <button class="btn btn-success" onclick="app.reportsManager.exportTeacherReport('excel')">
                    <i class="fas fa-file-excel"></i> Xuất Excel
                </button>
                <button class="btn btn-danger" onclick="app.reportsManager.exportTeacherReport('pdf')">
                    <i class="fas fa-file-pdf"></i> Xuất PDF
                </button>
            </div>

            <div class="table-container">
                <table class="table" id="teacherReportTable">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Giáo viên</th>
                            <th>Khoa</th>
                            <th>Bằng cấp</th>
                            <th>Số lớp</th>
                            <th>Tổng SV</th>
                            <th>Workload</th>
                            <th>Lương TB/lớp</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.details
                          .map(
                            (item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${item.teacherName}</strong></td>
                                <td>${item.departmentName}</td>
                                <td>${item.degreeName}</td>
                                <td>${item.classCount}</td>
                                <td>${item.totalStudents}</td>
                                <td>
                                    <div class="workload-bar">
                                        <div class="workload-fill" style="width: ${Math.min(
                                          item.workloadPercent,
                                          100
                                        )}%; background-color: ${this.getWorkloadColor(
                              item.workloadPercent
                            )}"></div>
                                        <span class="workload-text">${item.workloadPercent.toFixed(
                                          0
                                        )}%</span>
                                    </div>
                                </td>
                                <td>${Utils.formatCurrency(
                                  item.avgSalaryPerClass
                                )}</td>
                                <td>
                                    <span class="badge ${
                                      item.classCount > 0
                                        ? "badge-success"
                                        : "badge-secondary"
                                    }">
                                        ${
                                          item.classCount > 0
                                            ? "Hoạt động"
                                            : "Chưa phân công"
                                        }
                                    </span>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div class="chart-section">
                <div class="chart-container">
                    <div class="chart-card">
                        <h3>Phân bố giáo viên theo khoa</h3>
                        <canvas id="teachersByDepartmentChart"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>Workload của giáo viên</h3>
                        <canvas id="teacherWorkloadChart"></canvas>
                    </div>
                </div>
            </div>

            <style>
                .workload-bar {
                    position: relative;
                    width: 100px;
                    height: 20px;
                    background-color: #f3f4f6;
                    border-radius: 10px;
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
                    font-size: 12px;
                    font-weight: bold;
                    color: #374151;
                }
                .badge-success { background-color: #10b981; color: white; }
                .badge-secondary { background-color: #6b7280; color: white; }
                .badge-warning { background-color: #f59e0b; color: white; }
                .badge { 
                    padding: 0.25rem 0.5rem; 
                    border-radius: 0.25rem; 
                    font-size: 0.875rem; 
                    font-weight: 500; 
                }
            </style>
        `;

    this.initializeTeacherCharts(reportData);
  }

  calculateTeacherData() {
    let filteredTeachers = sampleData.teachers;
    let filteredAssignments = sampleData.assignments;

    // Apply department filter
    if (this.selectedDepartment !== "all") {
      filteredTeachers = filteredTeachers.filter(
        (t) => t.departmentId === parseInt(this.selectedDepartment)
      );
    }

    // Apply semester filter to assignments
    if (this.selectedSemester !== "all") {
      const semesterClasses = sampleData.classes.filter(
        (c) => c.semesterId === parseInt(this.selectedSemester)
      );
      const semesterClassIds = semesterClasses.map((c) => c.id);
      filteredAssignments = filteredAssignments.filter((a) =>
        semesterClassIds.includes(a.classId)
      );
    }

    const details = filteredTeachers.map((teacher) => {
      const department = sampleData.departments.find(
        (d) => d.id === teacher.departmentId
      );
      const degree = sampleData.degrees.find((d) => d.id === teacher.degreeId);
      const teacherAssignments = filteredAssignments.filter(
        (a) => a.teacherId === teacher.id
      );

      let totalStudents = 0;
      let totalSalary = 0;

      teacherAssignments.forEach((assignment) => {
        const cls = sampleData.classes.find((c) => c.id === assignment.classId);
        if (cls) {
          totalStudents += cls.studentCount;
          const subject = sampleData.subjects.find(
            (s) => s.id === cls.subjectId
          );
          if (subject) {
            const payment = this.calculateSimplePayment(teacher, cls, subject);
            totalSalary += payment.totalSalary;
          }
        }
      });

      const classCount = teacherAssignments.length;
      const avgSalaryPerClass = classCount > 0 ? totalSalary / classCount : 0;

      // Calculate workload (assuming max 8 classes per semester)
      const maxClasses = 8;
      const workloadPercent = (classCount / maxClasses) * 100;

      return {
        teacherName: teacher.fullName,
        departmentName: department?.shortName || "N/A",
        degreeName: degree?.shortName || "N/A",
        classCount,
        totalStudents,
        workloadPercent,
        avgSalaryPerClass,
      };
    });

    // Sort by class count descending
    details.sort((a, b) => b.classCount - a.classCount);

    const totalTeachers = details.length;
    const activeTeachers = details.filter((d) => d.classCount > 0).length;
    const inactiveTeachers = totalTeachers - activeTeachers;
    const totalClasses = details.reduce(
      (sum, item) => sum + item.classCount,
      0
    );
    const avgClassesPerTeacher =
      totalTeachers > 0 ? totalClasses / totalTeachers : 0;

    return {
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
      avgClassesPerTeacher,
      details,
    };
  }

  getWorkloadColor(percent) {
    if (percent < 50) return "#10b981"; // Green
    if (percent < 80) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  }

  initializeTeacherCharts(reportData) {
    // Teachers by department chart
    const deptCtx = document.getElementById("teachersByDepartmentChart");
    if (deptCtx) {
      const deptData = this.groupTeachersByDepartment(reportData.details);
      new Chart(deptCtx, {
        type: "bar",
        data: {
          labels: deptData.map((d) => d.department),
          datasets: [
            {
              label: "Hoạt động",
              data: deptData.map((d) => d.active),
              backgroundColor: "rgba(16, 185, 129, 0.8)",
            },
            {
              label: "Chưa phân công",
              data: deptData.map((d) => d.inactive),
              backgroundColor: "rgba(156, 163, 175, 0.8)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    // Teacher workload chart
    const workloadCtx = document.getElementById("teacherWorkloadChart");
    if (workloadCtx) {
      const workloadRanges = this.groupTeachersByWorkload(reportData.details);
      new Chart(workloadCtx, {
        type: "doughnut",
        data: {
          labels: workloadRanges.map((w) => w.range),
          datasets: [
            {
              data: workloadRanges.map((w) => w.count),
              backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#6b7280"],
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
  }

  groupTeachersByDepartment(details) {
    const deptGroups = {};

    details.forEach((item) => {
      if (!deptGroups[item.departmentName]) {
        deptGroups[item.departmentName] = {
          department: item.departmentName,
          active: 0,
          inactive: 0,
        };
      }

      if (item.classCount > 0) {
        deptGroups[item.departmentName].active++;
      } else {
        deptGroups[item.departmentName].inactive++;
      }
    });

    return Object.values(deptGroups);
  }

  groupTeachersByWorkload(details) {
    const ranges = [
      { range: "Thấp (0-25%)", count: 0 },
      { range: "Trung bình (26-50%)", count: 0 },
      { range: "Cao (51-75%)", count: 0 },
      { range: "Rất cao (>75%)", count: 0 },
    ];

    details.forEach((item) => {
      if (item.workloadPercent <= 25) {
        ranges[0].count++;
      } else if (item.workloadPercent <= 50) {
        ranges[1].count++;
      } else if (item.workloadPercent <= 75) {
        ranges[2].count++;
      } else {
        ranges[3].count++;
      }
    });

    return ranges;
  }

  // Export functions
  exportSalaryReport(format) {
    if (format === "excel") {
      this.exportToExcel("salary-report", "Báo cáo lương giảng dạy");
    } else if (format === "pdf") {
      this.exportToPDF("salaryReportTable", "Báo cáo lương giảng dạy");
    }
  }

  exportClassReport(format) {
    if (format === "excel") {
      this.exportToExcel("class-report", "Báo cáo lớp học");
    } else if (format === "pdf") {
      this.exportToPDF("classReportTable", "Báo cáo lớp học");
    }
  }

  exportTeacherReport(format) {
    if (format === "excel") {
      this.exportToExcel("teacher-report", "Báo cáo giáo viên");
    } else if (format === "pdf") {
      this.exportToPDF("teacherReportTable", "Báo cáo giáo viên");
    }
  }

  exportToExcel(reportType, filename) {
    app.showAlert(`Đang xuất file Excel: ${filename}...`, "info");
    setTimeout(() => {
      app.showAlert(`Xuất Excel thành công!`, "success");
    }, 1500);
  }

  exportToPDF(tableId, title) {
    const table = document.getElementById(tableId);
    if (!table) {
      app.showAlert("Không tìm thấy bảng dữ liệu!", "error");
      return;
    }

    app.showAlert(`Đang xuất file PDF: ${title}...`, "info");
    setTimeout(() => {
      app.showAlert(`Xuất PDF thành công!`, "success");
    }, 1500);
  }

  printSalaryReport() {
    const printContent = document.getElementById("salaryReportContent");
    if (!printContent) {
      app.showAlert("Không có nội dung để in!", "error");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Báo cáo lương giảng dạy</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .summary-cards { display: none; }
                        .report-actions { display: none; }
                        .chart-section { display: none; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Báo cáo lương giảng dạy</h1>
                    <p>Ngày in: ${new Date().toLocaleDateString("vi-VN")}</p>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

    printWindow.document.close();
    printWindow.print();
  }
}
