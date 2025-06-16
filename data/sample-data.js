const sampleData = {
  degrees: [
    { id: 1, fullName: "Tiến sĩ", shortName: "TS", coefficient: 1.5 },
    { id: 2, fullName: "Thạc sĩ", shortName: "ThS", coefficient: 1.2 },
    { id: 3, fullName: "Cử nhân", shortName: "CN", coefficient: 1.0 },
    { id: 4, fullName: "Kỹ sư", shortName: "KS", coefficient: 1.1 },
  ],

  departments: [
    {
      id: 1,
      fullName: "Khoa Công nghệ thông tin",
      shortName: "CNTT",
      description:
        "Đào tạo các chuyên ngành về công nghệ thông tin và máy tính",
    },
    {
      id: 2,
      fullName: "Khoa Điện tử viễn thông",
      shortName: "ĐTVT",
      description: "Đào tạo các chuyên ngành về điện tử và viễn thông",
    },
    {
      id: 3,
      fullName: "Khoa Cơ khí",
      shortName: "CK",
      description: "Đào tạo các chuyên ngành về cơ khí và chế tạo máy",
    },
    {
      id: 4,
      fullName: "Khoa Kinh tế",
      shortName: "KT",
      description: "Đào tạo các chuyên ngành về kinh tế và quản trị kinh doanh",
    },
  ],

  teachers: [
    {
      id: 1,
      code: "GV001",
      fullName: "Nguyễn Văn An",
      birthDate: "1980-05-15",
      phone: "0901234567",
      email: "nvan@university.edu.vn",
      departmentId: 1,
      degreeId: 1,
    },
    {
      id: 2,
      code: "GV002",
      fullName: "Trần Thị Bình",
      birthDate: "1985-08-20",
      phone: "0912345678",
      email: "ttbinh@university.edu.vn",
      departmentId: 1,
      degreeId: 2,
    },
    {
      id: 3,
      code: "GV003",
      fullName: "Lê Minh Cường",
      birthDate: "1982-03-10",
      phone: "0923456789",
      email: "lmcuong@university.edu.vn",
      departmentId: 2,
      degreeId: 1,
    },
  ],

  subjects: [
    {
      id: 1,
      code: "IT101",
      name: "Lập trình cơ bản",
      credits: 3,
      coefficient: 1.0,
      periods: 45,
    },
    {
      id: 2,
      code: "IT201",
      name: "Cấu trúc dữ liệu và giải thuật",
      credits: 4,
      coefficient: 1.2,
      periods: 60,
    },
    {
      id: 3,
      code: "IT301",
      name: "Công nghệ phần mềm",
      credits: 3,
      coefficient: 1.1,
      periods: 45,
    },
  ],

  semesters: [
    {
      id: 1,
      name: "Học kỳ 1",
      academicYear: "2024-2025",
      startDate: "2024-09-01",
      endDate: "2024-12-31",
    },
    {
      id: 2,
      name: "Học kỳ 2",
      academicYear: "2024-2025",
      startDate: "2025-01-15",
      endDate: "2025-05-31",
    },
  ],

  classes: [
    {
      id: 1,
      semesterId: 1,
      subjectId: 1,
      classCode: "IT101_01",
      className: "Lập trình cơ bản - Lớp 1",
      studentCount: 45,
      coefficient: 1.0,
    },
    {
      id: 2,
      semesterId: 1,
      subjectId: 1,
      classCode: "IT101_02",
      className: "Lập trình cơ bản - Lớp 2",
      studentCount: 50,
      coefficient: 1.1,
    },
    {
      id: 3,
      semesterId: 1,
      subjectId: 2,
      classCode: "IT201_01",
      className: "CTDL&GT - Lớp 1",
      studentCount: 40,
      coefficient: 1.0,
    },
  ],

  assignments: [
    {
      id: 1,
      teacherId: 1,
      classId: 1,
      assignedDate: "2024-08-15",
    },
    {
      id: 2,
      teacherId: 2,
      classId: 2,
      assignedDate: "2024-08-15",
    },
    {
      id: 3,
      teacherId: 1,
      classId: 3,
      assignedDate: "2024-08-15",
    },
  ],

  rateSettings: [
    {
      id: 1,
      name: "Định mức cơ bản",
      baseRate: 50000,
      effectiveDate: "2024-01-01",
      description: "Mức lương cơ bản cho 1 tiết chuẩn",
    },
  ],

  classCoefficients: [
    {
      id: 1,
      studentRange: "1-30",
      coefficient: 1.0,
      description: "Lớp nhỏ",
    },
    {
      id: 2,
      studentRange: "31-50",
      coefficient: 1.1,
      description: "Lớp trung bình",
    },
    {
      id: 3,
      studentRange: "51-70",
      coefficient: 1.2,
      description: "Lớp lớn",
    },
    {
      id: 4,
      studentRange: "71+",
      coefficient: 1.3,
      description: "Lớp rất lớn",
    },
  ],
};

// Utility functions for data management
const DataManager = {
  getNextId: (collection) => {
    return Math.max(...collection.map((item) => item.id), 0) + 1;
  },

  generateCode: (prefix, collection) => {
    const maxNum = Math.max(
      ...collection
        .filter((item) => item.code && item.code.startsWith(prefix))
        .map((item) => parseInt(item.code.replace(prefix, "")) || 0),
      0
    );
    return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
  },

  saveToLocalStorage: () => {
    localStorage.setItem("teachingPaymentData", JSON.stringify(sampleData));
  },

  loadFromLocalStorage: () => {
    const stored = localStorage.getItem("teachingPaymentData");
    if (stored) {
      Object.assign(sampleData, JSON.parse(stored));
    }
  },
};

// Load data from localStorage if available
DataManager.loadFromLocalStorage();

export default sampleData;
