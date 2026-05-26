export const enrollmentInput = {
  studentId: "student_1",
  sectionId: "section_1",
  academicYearId: "year_2026",
  notes: "Matricula de prueba",
  active: true,
};

export const academicYearFixture = {
  id: "year_2026",
  year: 2026,
  name: "2026",
  active: true,
};

export const monthlyConceptFixture = {
  id: "concept_monthly",
  name: "Mensualidad",
  type: "MENSUALIDAD",
  amount: 300,
  active: true,
};

export const enrollmentConceptFixture = {
  id: "concept_enrollment",
  name: "Matricula",
  type: "MATRICULA",
  amount: 500,
  active: true,
};

export function createPaymentFixture(balance = 300) {
  return {
    id: "payment_1",
    enrollmentId: "enrollment_1",
    conceptId: "concept_monthly",
    amount: 300,
    balance,
    status: "PENDIENTE",
    paidAt: null,
    method: null,
    reference: null,
    notes: null,
    concept: monthlyConceptFixture,
    enrollment: {
      id: "enrollment_1",
      active: true,
      student: {
        id: "student_1",
        firstName: "Ana",
        lastName: "Torres",
        dni: "12345678",
      },
      section: {
        id: "section_1",
        name: "A",
        gradeLevel: { id: "grade_1", name: "Primero", level: "PRIMARIA" },
      },
    },
  };
}
