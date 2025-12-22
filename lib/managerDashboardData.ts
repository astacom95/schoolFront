export type ManagerModule = {
  title: string;
  description: string;
  actions: string[];
  accent: string;
};

export type StudentRow = {
  name: string;
  studentId: string;
  email: string;
  className: string;
  gender: string;
};

export const managerModules: ManagerModule[] = [
  {
    title: "إدارة المعلمين",
    description: "متابعة التعيين والمراجعة وتوزيع الجداول.",
    actions: ["إضافة معلم", "تعديل البيانات", "حذف", "عرض القائمة"],
    accent: "#8CA9FF"
  },
  {
    title: "إدارة الطلاب",
    description: "قبول الطلاب الجدد وتتبع ملفاتهم.",
    actions: ["إضافة طالب", "تعديل", "حذف", "عرض القائمة"],
    accent: "#AAC4F5"
  },
  {
    title: "المواد والمستويات",
    description: "إنشاء المواد وربطها بالمستويات والفصول.",
    actions: ["إضافة مادة", "تعديل مادة", "إدارة المستويات", "إدارة الفصول"],
    accent: "#FFF2C6"
  },
  {
    title: "الجداول الزمنية",
    description: "ضبط جدول المعلمين والفصول وتتبع الالتزام.",
    actions: ["إضافة جدول", "تعديل", "حذف", "عرض"],
    accent: "#FED7AA"
  },
  {
    title: "الرسوم والمدفوعات",
    description: "تحديد رسوم كل فصل وتتبع المدفوعات مع الفلاتر.",
    actions: ["إعداد الرسوم", "عرض المدفوعات", "تصفية حسب الصف", "تصفية حسب الوسيلة"],
    accent: "#FDE68A"
  },
  {
    title: "متابعة المعلمين والنتائج",
    description: "تتبع حضور المعلمين ومراجعة نتائج الطلبة.",
    actions: ["تسجيل الحضور", "عرض السجلات", "مراجعة الدرجات"],
    accent: "#C4B5FD"
  }
];

export const studentSnapshot: StudentRow[] = [
  { name: "مها الرفاعي", studentId: "703703", email: "maha.rafay@example.com", className: "ث۳", gender: "أنثى" },
  { name: "سارة الجهني", studentId: "870326", email: "sarah.juhani@example.com", className: "ث۲", gender: "أنثى" },
  { name: "خالد إبراهيم", studentId: "547030", email: "k.ibrahim@example.com", className: "ث۳", gender: "ذكر" },
  { name: "ليان الحربي", studentId: "370357", email: "lian.harbi@example.com", className: "ث۱", gender: "أنثى" },
  { name: "راكان العتيبي", studentId: "270374", email: "rakan.otaibi@example.com", className: "م۳", gender: "ذكر" },
  { name: "نوف الشهري", studentId: "970322", email: "nouf.shahri@example.com", className: "م۲", gender: "أنثى" },
  { name: "عبدالله الزهراني", studentId: "570336", email: "abdullah.z@example.com", className: "ث۱", gender: "ذكر" },
  { name: "جنى القحطاني", studentId: "157034", email: "jana.qahtani@example.com", className: "م۱", gender: "أنثى" }
];
