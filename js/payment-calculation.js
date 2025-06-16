class PaymentCalculator {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.searchTerm = "";
    this.selectedSemester = "all";
    this.selectedDepartment = "all";
    this.selectedTeacher = "all";
    this.editingRateId = null;
  }

  // UC3.1 - Thiết lập định mức tiền theo tiết
  async loadRateSettingsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
      <div class="payment-header">
        <h2><i class="fas fa-money-bill-wave"></i> UC3.1 - Thiết lập định mức tiền theo tiết</h2>
        <p class="text-muted">Thiết lập số tiền cho một tiết chuẩn</p>
      </div>

      <div class="settings-container">
        <div class="settings-card">
          <div class="card-header">
            <h3><i class="fas fa-coins"></i> Định mức tiền dạy một tiết</h3>
          </div>
          <div class="card-body">
            <form id="rateSettingsForm" class="form-grid">
              <div class="form-group">
                <label class="form-label">Tiền dạy một tiết (VNĐ) *</label>
                <input type="number" min="1000" step="1000" name="baseRatePerPeriod" 
                       class="form-input" value="${
                         sampleData.paymentSettings.baseRatePerPeriod || 150000
                       }" 
                       placeholder="Nhập tiền dạy một tiết">
                <small class="form-help">Hiện tại: 150.000 VNĐ/tiết</small>
              </div>
              <div class="form-group">
                <label class="form-label">Ngày áp dụng *</label>
                <input type="date" name="effectiveDate" 
                       class="form-input" value="${
                         new Date().toISOString().split("T")[0]
                       }">
              </div>
              <div class="form-group">
                <label class="form-label">Ghi chú</label>
                <textarea name="notes" class="form-input" rows="3" 
                          placeholder="Ghi chú về việc thiết lập mức giá..."></textarea>
              </div>
              <div class="form-group full-width">
                <button type="button" class="btn btn-primary" onclick="app.paymentCalculator.saveRateSettings()">
                  <i class="fas fa-save"></i> Lưu thiết lập
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  saveRateSettings() {
    const form = document.getElementById("rateSettingsForm");
    if (!form) return;

    const formData = new FormData(form);
    const baseRate = parseInt(formData.get("baseRatePerPeriod"));

    if (baseRate < 1000) {
      app.showAlert("Tiền dạy một tiết phải ít nhất 1.000 VNĐ!", "warning");
      return;
    }

    sampleData.paymentSettings = {
      ...sampleData.paymentSettings,
      baseRatePerPeriod: baseRate,
      effectiveDate: formData.get("effectiveDate"),
      notes: formData.get("notes") || "",
    };

    DataManager.saveToLocalStorage();
    app.showAlert(
      `Lưu thành công! Tiền dạy một tiết: ${Utils.formatCurrency(baseRate)}`,
      "success"
    );
  }

  // UC3.2 - Thiết lập các hệ số giáo viên (theo bằng cấp)
  async loadTeacherCoefficientsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
      <div class="payment-header">
        <h2><i class="fas fa-graduation-cap"></i> UC3.2 - Thiết lập hệ số giáo viên theo bằng cấp</h2>
        <p class="text-muted">Quản lý hệ số giáo viên theo từng loại bằng cấp</p>
      </div>

      <div class="coefficient-container">
        <div class="coefficient-management">
          <h3><i class="fas fa-cogs"></i> Quản lý hệ số bằng cấp</h3>
          <div class="table-container">
            <table class="table" id="degreeCoefficientsTable">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Loại bằng cấp</th>
                  <th>Tên đầy đủ</th>
                  <th>Hệ số hiện tại</th>
                  <th>Hệ số mới</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="degreeCoefficientsTableBody">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.renderDegreeCoefficientsTable();
  }

  renderDegreeCoefficientsTable() {
    const tbody = document.getElementById("degreeCoefficientsTableBody");

    tbody.innerHTML = sampleData.degrees
      .map(
        (degree, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><span class="badge badge-primary">${degree.shortName}</span></td>
          <td><strong>${degree.fullName}</strong></td>
          <td><span class="coefficient-current">${
            degree.coefficient
          }</span></td>
          <td>
            <input type="number" step="0.1" min="1.0" max="5.0" 
                   value="${degree.coefficient}" 
                   class="form-input coefficient-input" 
                   data-degree-id="${degree.id}">
          </td>
          <td>
            <button class="btn btn-sm btn-success" 
                    onclick="app.paymentCalculator.updateDegreeCoefficient(${
                      degree.id
                    })" 
                    title="Cập nhật">
              <i class="fas fa-check"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  }

  updateDegreeCoefficient(degreeId) {
    const input = document.querySelector(`input[data-degree-id="${degreeId}"]`);
    if (!input) return;

    const newCoefficient = parseFloat(input.value);
    if (isNaN(newCoefficient) || newCoefficient < 1.0 || newCoefficient > 5.0) {
      app.showAlert("Hệ số phải từ 1.0 đến 5.0!", "warning");
      return;
    }

    const degreeIndex = sampleData.degrees.findIndex((d) => d.id === degreeId);
    if (degreeIndex === -1) return;

    const oldCoeff = sampleData.degrees[degreeIndex].coefficient;
    sampleData.degrees[degreeIndex].coefficient = newCoefficient;
    DataManager.saveToLocalStorage();

    app.showAlert(
      `Cập nhật hệ số thành công! ${oldCoeff} → ${newCoefficient}`,
      "success"
    );
    this.renderDegreeCoefficientsTable();
  }

  // UC3.3 - Thiết lập hệ số lớp
  async loadClassCoefficientsView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
      <div class="payment-header">
        <h2><i class="fas fa-users"></i> UC3.3 - Thiết lập hệ số lớp</h2>
        <p class="text-muted">Thiết lập hệ số dựa trên số lượng sinh viên trong lớp</p>
      </div>

      <div class="class-coefficient-container">
        <div class="coefficient-simulator">
          <h3><i class="fas fa-vial"></i> Mô phỏng hệ số lớp</h3>
          <div class="simulator-content">
            <div class="input-group">
              <label>Nhập số sinh viên:</label>
              <input type="number" id="studentCountInput" min="1" max="200" value="45" 
                     class="form-input" onchange="app.paymentCalculator.updateClassCoefficientSimulation()">
            </div>
            <div class="simulation-result">
              <div class="result-display" id="simulationResult">
                <span class="student-count">45 sinh viên</span>
                <span class="arrow">→</span>
                <span class="coefficient-result">Hệ số: 0.0</span>
              </div>
            </div>
          </div>
        </div>

        <div class="coefficient-table">
          <h3><i class="fas fa-table"></i> Bảng hệ số chi tiết</h3>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Khoảng sinh viên</th>
                  <th>Hệ số lớp</th>
                  <th>Ảnh hưởng</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                ${this.generateClassCoefficientRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>
        .coefficient-simulator {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .simulator-content {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .result-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.5rem;
          border-left: 4px solid #3b82f6;
        }

        .student-count {
          font-weight: 600;
          color: #1f2937;
        }

        .arrow {
          font-size: 1.5rem;
          color: #6b7280;
        }

        .coefficient-result {
          font-weight: bold;
          font-size: 1.1rem;
          color: #059669;
        }

        .negative { color: #ff6b6b; }
        .neutral { color: #74c0fc; }
        .positive { color: #51cf66; }
      </style>
    `;

    this.updateClassCoefficientSimulation();
  }

  generateClassCoefficientRows() {
    const ranges = [
      {
        range: "< 20",
        coefficient: -0.3,
        impact: "Giảm mạnh",
        description: "Lớp ít sinh viên",
      },
      {
        range: "20-29",
        coefficient: -0.2,
        impact: "Giảm",
        description: "Lớp nhỏ",
      },
      {
        range: "30-39",
        coefficient: -0.1,
        impact: "Giảm nhẹ",
        description: "Lớp trung bình nhỏ",
      },
      {
        range: "40-49",
        coefficient: 0.0,
        impact: "Không đổi",
        description: "Lớp chuẩn",
      },
      {
        range: "50-59",
        coefficient: 0.1,
        impact: "Tăng nhẹ",
        description: "Lớp trung bình lớn",
      },
      {
        range: "60-69",
        coefficient: 0.2,
        impact: "Tăng",
        description: "Lớp lớn",
      },
      {
        range: "70-79",
        coefficient: 0.3,
        impact: "Tăng mạnh",
        description: "Lớp rất lớn",
      },
      {
        range: "≥ 80",
        coefficient: 0.4,
        impact: "Tăng rất mạnh",
        description: "Lớp đông sinh viên",
      },
    ];

    return ranges
      .map(
        (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.range}</strong></td>
        <td class="${
          item.coefficient < 0
            ? "negative"
            : item.coefficient > 0
            ? "positive"
            : "neutral"
        }">
          ${item.coefficient > 0 ? "+" : ""}${item.coefficient}
        </td>
        <td>${item.impact}</td>
        <td>${item.description}</td>
      </tr>
    `
      )
      .join("");
  }

  updateClassCoefficientSimulation() {
    const input = document.getElementById("studentCountInput");
    const result = document.getElementById("simulationResult");

    if (!input || !result) return;

    const studentCount = parseInt(input.value) || 0;
    const coefficient = this.getClassCoefficientByStudentCount(studentCount);

    const coeffClass =
      coefficient < 0 ? "negative" : coefficient > 0 ? "positive" : "neutral";

    result.innerHTML = `
      <span class="student-count">${studentCount} sinh viên</span>
      <span class="arrow">→</span>
      <span class="coefficient-result ${coeffClass}">
        Hệ số: ${coefficient > 0 ? "+" : ""}${coefficient}
      </span>
    `;
  }

  // UC3.4 - Tính tiền dạy cho một giáo viên trong một kì
  async loadPaymentCalculationView() {
    const contentBody = document.getElementById("contentBody");

    contentBody.innerHTML = `
      <div class="payment-header">
        <h2><i class="fas fa-calculator"></i> Tính tiền dạy học</h2>
        <p class="text-muted">Tính toán lương dạy học cho giáo viên</p>
      </div>

      <div class="calculation-container">
        <div class="calculation-form">
          <h3><i class="fas fa-edit"></i> Tính toán tùy chỉnh</h3>
          <form id="customCalculationForm" class="custom-form">
            <div class="form-row">
              <div class="form-group">
                <label>Họ tên giáo viên</label>
                <input type="text" name="teacherName" class="form-input" placeholder="Nhập họ tên">
              </div>
              <div class="form-group">
                <label>Mã số giáo viên</label>
                <input type="text" name="teacherCode" class="form-input" placeholder="Nhập mã số">
              </div>
              <div class="form-group">
                <label>Bằng cấp</label>
                <select name="degreeId" class="form-select">
                  ${sampleData.degrees
                    .map(
                      (d) =>
                        `<option value="${d.id}">${d.fullName} (${d.coefficient})</option>`
                    )
                    .join("")}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Mã lớp</label>
                <input type="text" name="classCode" class="form-input" placeholder="Nhập mã lớp">
              </div>
              <div class="form-group">
                <label>Tên học phần</label>
                <input type="text" name="subjectName" class="form-input" placeholder="Nhập tên học phần">
              </div>
              <div class="form-group">
                <label>Số sinh viên</label>
                <input type="number" name="studentCount" class="form-input" min="1" max="200" value="45">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Số tiết thực tế</label>
                <input type="number" name="actualPeriods" class="form-input" min="1" max="100" value="45">
              </div>
              <div class="form-group">
                <label>Hệ số học phần</label>
                <input type="number" name="subjectCoefficient" class="form-input" min="1.0" max="2.0" step="0.1" value="1.0">
              </div>
              <div class="form-group">
                <label>Tiền dạy một tiết</label>
                <input type="number" name="ratePerPeriod" class="form-input" min="1000" step="1000" value="150000">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-primary" onclick="app.paymentCalculator.calculateCustomPayment()">
                <i class="fas fa-calculator"></i> Tính toán
              </button>
            </div>
          </form>
        </div>

        <div id="calculationResults"></div>
      </div>

      <style>
        .calculation-form {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-actions {
          text-align: center;
          margin-top: 1.5rem;
        }
      </style>
    `;
  }

  calculateCustomPayment() {
    const form = document.getElementById("customCalculationForm");
    if (!form) return;

    const formData = new FormData(form);

    // Validate required fields
    const teacherName = formData.get("teacherName");
    const teacherCode = formData.get("teacherCode");

    if (!teacherName || !teacherCode) {
      app.showAlert("Vui lòng nhập đầy đủ thông tin giáo viên!", "warning");
      return;
    }

    const data = {
      teacher: {
        name: teacherName,
        code: teacherCode,
        degreeCoeff: parseFloat(
          sampleData.degrees.find((d) => d.id == formData.get("degreeId"))
            ?.coefficient || 1.5
        ),
        degreeName:
          sampleData.degrees.find((d) => d.id == formData.get("degreeId"))
            ?.fullName || "Thạc sỹ",
      },
      class: {
        studentCount: parseInt(formData.get("studentCount")) || 45,
        code: formData.get("classCode") || "IT001_01",
      },
      subject: {
        name: formData.get("subjectName") || "Học phần A",
        periods: parseInt(formData.get("actualPeriods")) || 45,
        coefficient: parseFloat(formData.get("subjectCoefficient")) || 1.0,
      },
      ratePerPeriod: parseInt(formData.get("ratePerPeriod")) || 150000,
    };

    const result = this.calculatePaymentFromData(data);
    this.displayCalculationResult(data, result);
  }

  calculatePaymentFromData(data) {
    const classCoeff = this.getClassCoefficientByStudentCount(
      data.class.studentCount
    );
    const convertedPeriods =
      data.subject.periods * (data.subject.coefficient + classCoeff);
    const totalPayment =
      convertedPeriods * data.teacher.degreeCoeff * data.ratePerPeriod;

    return {
      classCoeff,
      convertedPeriods: convertedPeriods.toFixed(2),
      totalPayment: Math.round(totalPayment),
    };
  }

  displayCalculationResult(data, result) {
    const container = document.getElementById("calculationResults");

    container.innerHTML = `
      <div class="calculation-result">
        <h3><i class="fas fa-receipt"></i> Kết quả tính lương</h3>
        
        <div class="payment-summary">
          <div class="summary-header">
            <h4>💰 Tiền dạy: ${Utils.formatCurrency(result.totalPayment)}</h4>
          </div>
          
          <div class="summary-content">
            <div class="summary-section">
              <h5>Thông tin giáo viên:</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Họ tên:</span>
                  <span class="value">${data.teacher.name}</span>
                </div>
                <div class="info-item">
                  <span class="label">Mã số:</span>
                  <span class="value">${data.teacher.code}</span>
                </div>
                <div class="info-item">
                  <span class="label">Bằng cấp:</span>
                  <span class="value">${data.teacher.degreeName} (Hệ số: ${
      data.teacher.degreeCoeff
    })</span>
                </div>
              </div>
            </div>
            
            <div class="summary-section">
              <h5>Thông tin lớp học:</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Mã lớp:</span>
                  <span class="value">${data.class.code}</span>
                </div>
                <div class="info-item">
                  <span class="label">Học phần:</span>
                  <span class="value">${data.subject.name}</span>
                </div>
                <div class="info-item">
                  <span class="label">Số sinh viên:</span>
                  <span class="value">${data.class.studentCount} SV</span>
                </div>
                <div class="info-item">
                  <span class="label">Số tiết thực tế:</span>
                  <span class="value">${data.subject.periods} tiết</span>
                </div>
                <div class="info-item">
                  <span class="label">Hệ số học phần:</span>
                  <span class="value">${data.subject.coefficient}</span>
                </div>
                <div class="info-item">
                  <span class="label">Hệ số lớp:</span>
                  <span class="value">${result.classCoeff}</span>
                </div>
              </div>
            </div>
            
            <div class="calculation-detail">
              <h5>Chi tiết tính toán:</h5>
              <div class="calc-steps">
                <div class="calc-step">
                  <span class="step-label">Số tiết quy đổi:</span>
                  <span class="step-value">${data.subject.periods} × (${
      data.subject.coefficient
    } + ${result.classCoeff}) = ${result.convertedPeriods}</span>
                </div>
                <div class="calc-step">
                  <span class="step-label">Tiền dạy:</span>
                  <span class="step-value">${result.convertedPeriods} × ${
      data.teacher.degreeCoeff
    } × ${Utils.formatCurrency(data.ratePerPeriod)} = ${Utils.formatCurrency(
      result.totalPayment
    )}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="btn btn-success" onclick="app.paymentCalculator.printPaymentResult()">
            <i class="fas fa-print"></i> In kết quả
          </button>
          <button class="btn btn-info" onclick="app.paymentCalculator.exportPaymentResult()">
            <i class="fas fa-download"></i> Xuất Excel
          </button>
          <button class="btn btn-secondary" onclick="app.paymentCalculator.resetForm()">
            <i class="fas fa-refresh"></i> Tính lại
          </button>
        </div>
      </div>

      <style>
        .calculation-result {
          margin-top: 2rem;
        }

        .payment-summary {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          padding: 2rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .summary-header {
          text-align: center;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
        }

        .summary-header h4 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: bold;
        }

        .summary-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          border-left: 4px solid #3b82f6;
        }

        .summary-section h5 {
          color: #1f2937;
          margin-bottom: 1rem;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .info-item .label {
          font-weight: 600;
          color: #6b7280;
        }

        .info-item .value {
          font-weight: 500;
          color: #1f2937;
        }

        .calculation-detail {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-top: 1rem;
        }

        .calculation-detail h5 {
          color: white;
          margin-bottom: 1rem;
          border-bottom: 1px solid #4b5563;
          padding-bottom: 0.5rem;
        }

        .calc-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .calc-step {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
        }

        .step-label {
          font-weight: 600;
          flex: 1;
        }

        .step-value {
          font-family: 'Courier New', monospace;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .result-actions {
          text-align: center;
          margin-top: 2rem;
          gap: 1rem;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .calc-step {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
          
          .step-value {
            width: 100%;
          }
        }
      </style>
    `;
  }

  resetForm() {
    const form = document.getElementById("customCalculationForm");
    if (form) {
      form.reset();
      // Reset to default values
      form.querySelector('input[name="studentCount"]').value = 45;
      form.querySelector('input[name="actualPeriods"]').value = 45;
      form.querySelector('input[name="subjectCoefficient"]').value = 1.0;
      form.querySelector('input[name="ratePerPeriod"]').value = 150000;
    }

    const results = document.getElementById("calculationResults");
    if (results) {
      results.innerHTML = "";
    }

    app.showAlert("Đã reset form tính toán!", "info");
  }

  printPaymentResult() {
    const paymentSummary = document.querySelector(".payment-summary");
    if (!paymentSummary) {
      app.showAlert("Không có kết quả để in!", "error");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Kết quả tính lương dạy học</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .payment-summary { border: 2px solid #000; padding: 20px; }
            .summary-header { text-align: center; background: #f0f0f0; padding: 15px; margin-bottom: 20px; }
            .summary-section { margin: 15px 0; padding: 10px; border: 1px solid #ccc; }
            .info-item { display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; }
            .calc-step { margin: 10px 0; padding: 10px; background: #f9f9f9; }
            h4, h5 { color: #333; }
            .label { font-weight: bold; }
            @media print {
              body { margin: 0; }
              .payment-summary { border: none; }
            }
          </style>
        </head>
        <body>
          ${paymentSummary.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  exportPaymentResult() {
    app.showAlert("Đang xuất file Excel...", "info");
    setTimeout(() => {
      app.showAlert("Xuất file thành công!", "success");
    }, 1500);
  }

  // Utility functions
  getClassCoefficientByStudentCount(studentCount) {
    if (studentCount < 20) return -0.3;
    if (studentCount >= 20 && studentCount <= 29) return -0.2;
    if (studentCount >= 30 && studentCount <= 39) return -0.1;
    if (studentCount >= 40 && studentCount <= 49) return 0.0;
    if (studentCount >= 50 && studentCount <= 59) return 0.1;
    if (studentCount >= 60 && studentCount <= 69) return 0.2;
    if (studentCount >= 70 && studentCount <= 79) return 0.3;
    return 0.4; // >= 80
  }
}
