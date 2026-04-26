export const apiRoutes = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    registerStudent: "/auth/register/student"
  },
  users: "/users",
  lessons: "/lessons",
  startLive: (lessonId: number | string) => `/lessons/${lessonId}/start-live`,
  monthlyTests: "/monthly-tests",
  attendance: "/attendance",
  payments: "/payments",
  teacherTimeTable: "/teacher-time-table"
};

type Card = {
  title: string;
  description: string;
};

export const cards: Record<"manager" | "teacher" | "student", Card[]> = {
  manager: [
    { title: "إدارة المعلمين والطلاب", description: "إضافة الحسابات وتحديث الأدوار والملفات الشخصية." },
    { title: "الهيكل الأكاديمي", description: "إدارة المستويات والفصول والمواد والجداول الزمنية." },
    { title: "الرسوم والمدفوعات", description: "تهيئة رسوم الفصول وتتبع الدفعات والوصول للفواتير." },
    { title: "الإرشاد", description: "إدارة محتوى الإرشاد والتوجيه المدرسي." },
    { title: "النتائج", description: "مراجعة تقارير الأداء والنتائج للطلاب." }
  ],
  teacher: [
    { title: "الدروس", description: "إنشاء الدروس وإرفاق الوسائط والملخصات وروابط الاختبارات." },
    { title: "جلسات Meet", description: "إدارة روابط جلسات Google Meet للدروس." },
    { title: "الحضور", description: "تسجيل حضور الطلبة ومتابعة السجلات والتقارير." },
    { title: "الدرجات", description: "إدخال درجات المواد وتحديثها بحسب الصف." },
    { title: "الاختبارات الشهرية", description: "إدارة نماذج الاختبارات وربطها بالمستندات الخارجية." }
  ],
  student: [
    { title: "الجدول الدراسي", description: "متابعة الجدول اليومي والأسبوعي بسهولة." },
    { title: "مشغل الدروس", description: "الوصول إلى روابط Google Meet والتدريبات." },
    { title: "الأوراق والواجبات", description: "تحميل الملخصات والأوراق بحسب الصف والمادة." },
    { title: "الاختبارات", description: "الدخول إلى الاختبارات الشهرية ومراجعة النتائج." },
    { title: "الأنشطة والإرشاد", description: "عرض الأنشطة الصفية ومحتوى الإرشاد المدرسي." }
  ]
};
