class Utils {
  // Format currency
  static formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  // Format date
  static formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  }

  // Format date time
  static formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  }

  // Calculate age
  static calculateAge(birthDate) {
    if (!birthDate) return "N/A";
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return "N/A";
    }
  }

  // Escape HTML to prevent XSS
  static escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Validate email
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Email không hợp lệ");
    }
    return email;
  }

  static validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      throw new Error("Số điện thoại không hợp lệ");
    }
    return phone;
  }

  // Format number with thousands separator
  static formatNumber(num) {
    return new Intl.NumberFormat("vi-VN").format(num);
  }

  // Create search input
  static createSearchInput(placeholder, onSearchFunction) {
    return `
      <div class="search-container">
        <div class="search-input-wrapper">
          <input type="text" id="searchInput" class="search-input" 
                 placeholder="${placeholder}" 
                 oninput="${onSearchFunction}(this.value)">
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
      
      <style>
        .search-container {
          margin-bottom: 1.5rem;
        }
        .search-input-wrapper {
          position: relative;
          max-width: 400px;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .search-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
        }
      </style>
    `;
  }

  // Create pagination
  static createPagination(currentPage, totalPages, onPageClickFunction) {
    if (totalPages <= 1) return "";

    let pagination = `
      <div class="pagination-container">
        <nav class="pagination">
    `;

    // Previous button
    pagination += `
      <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
              ${currentPage > 1 ? `onclick="${onPageClickFunction}(${currentPage - 1})"` : 'disabled'}>
        <i class="fas fa-chevron-left"></i> Trước
      </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pagination += `
        <button class="pagination-btn" onclick="${onPageClickFunction}(1)">1</button>
        ${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
      `;
    }

    for (let i = startPage; i <= endPage; i++) {
      pagination += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                onclick="${onPageClickFunction}(${i})">${i}</button>
      `;
    }

    if (endPage < totalPages) {
      pagination += `
        ${endPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
        <button class="pagination-btn" onclick="${onPageClickFunction}(${totalPages})">${totalPages}</button>
      `;
    }

    // Next button
    pagination += `
      <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
              ${currentPage < totalPages ? `onclick="${onPageClickFunction}(${currentPage + 1})"` : 'disabled'}>
        Sau <i class="fas fa-chevron-right"></i>
      </button>
    `;

    pagination += `
        </nav>
      </div>
      
      <style>
        .pagination-container {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .pagination-btn {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        .pagination-btn:hover:not(.disabled):not(.active) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .pagination-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .pagination-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pagination-ellipsis {
          padding: 0.5rem 0.25rem;
          color: #6b7280;
        }
      </style>
    `;

    return pagination;
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Show confirm dialog
  static showConfirmDialog(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
      <div class="confirm-overlay">
        <div class="confirm-dialog">
          <div class="confirm-header">
            <h3>Xác nhận</h3>
          </div>
          <div class="confirm-body">
            <p>${this.escapeHtml(message)}</p>
          </div>
          <div class="confirm-footer">
            <button class="btn btn-secondary" onclick="this.closest('.confirm-modal').remove(); ${onCancel ? onCancel.toString() + '()' : ''}">
              Hủy
            </button>
            <button class="btn btn-danger" onclick="this.closest('.confirm-modal').remove(); (${onConfirm.toString()})()">
              Xác nhận
            </button>
          </div>
        </div>
      </div>
      
      <style>
        .confirm-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
        }
        .confirm-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .confirm-dialog {
          background: white;
          border-radius: 0.5rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .confirm-header {
          padding: 1.5rem 1.5rem 0 1.5rem;
        }
        .confirm-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.125rem;
        }
        .confirm-body {
          padding: 1rem 1.5rem;
        }
        .confirm-body p {
          margin: 0;
          color: #6b7280;
        }
        .confirm-footer {
          padding: 0 1.5rem 1.5rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }
      </style>
    `;

    document.body.appendChild(modal);
  }

  // Get status badge
  static getStatusBadge(status) {
    const statusMap = {
      active: { text: "Hoạt động", class: "badge-success" },
      inactive: { text: "Không hoạt động", class: "badge-danger" },
      pending: { text: "Đang chờ", class: "badge-warning" },
      suspended: { text: "Tạm ngưng", class: "badge-secondary" },
    };

    const statusInfo = statusMap[status] || { text: "Không xác định", class: "badge-secondary" };
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
  }

  // Generate random color
  static getRandomColor() {
    const colors = [
      "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
      "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Truncate text
  static truncateText(text, maxLength = 50) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  // Download as file
  static downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Form Validator Class
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = {};
  }

  required(fieldName, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field || !field.value.trim()) {
      this.errors[fieldName] = message;
      this.showFieldError(field, message);
    } else {
      this.clearFieldError(field);
    }
    return this;
  }

  email(fieldName, message = "Email không hợp lệ") {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (field && field.value && !emailRegex.test(field.value)) {
      this.errors[fieldName] = message;
      this.showFieldError(field, message);
    } else if (field && field.value) {
      this.clearFieldError(field);
    }
    return this;
  }

  phone(fieldName, message = "Số điện thoại không hợp lệ") {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    const phoneRegex = /^[0-9]{10,11}$/;
    if (
      field &&
      field.value &&
      !phoneRegex.test(field.value.replace(/\s/g, ""))
    ) {
      this.errors[fieldName] = message;
      this.showFieldError(field, message);
    } else if (field && field.value) {
      this.clearFieldError(field);
    }
    return this;
  }

  min(fieldName, minValue, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (field && field.value && parseFloat(field.value) < minValue) {
      this.errors[fieldName] = message;
      this.showFieldError(field, message);
    } else if (field && field.value) {
      this.clearFieldError(field);
    }
    return this;
  }

  max(fieldName, maxValue, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (field && field.value && parseFloat(field.value) > maxValue) {
      this.errors[fieldName] = message;
      this.showFieldError(field, message);
    } else if (field && field.value) {
      this.clearFieldError(field);
    }
    return this;
  }

  showFieldError(field, message) {
    if (!field) return;
    
    this.clearFieldError(field);
    
    field.classList.add("error");
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    if (!field) return;
    
    field.classList.remove("error");
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }
  }

  clearAllErrors() {
    const errorFields = this.form.querySelectorAll(".error");
    errorFields.forEach(field => this.clearFieldError(field));
    this.errors = {};
  }

  validate() {
    const isValid = Object.keys(this.errors).length === 0;
    return { isValid, errors: this.errors };
  }
}
