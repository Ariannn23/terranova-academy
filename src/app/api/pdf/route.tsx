import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { PaymentReceiptPDF } from "@/components/pdf/PaymentReceiptPDF";
import { EnrollmentCertificatePDF } from "@/components/pdf/EnrollmentCertificatePDF";
import { GradeReportPDF } from "@/components/pdf/GradeReportPDF";
import { AttendanceSheetPDF } from "@/components/pdf/AttendanceSheetPDF";
import { StudentInfoPDF } from "@/components/pdf/StudentInfoPDF";
import { StudentAttendancePDF } from "@/components/pdf/StudentAttendancePDF";
import { CommunicationPDF } from "@/components/pdf/CommunicationPDF";
import { getStudentGrades } from "@/lib/actions/grade.actions";
import { IncidentReportPDF } from "@/components/pdf/IncidentReportPDF";
import { StudentIncidentsPDF } from "@/components/pdf/StudentIncidentsPDF";
import { StudentDisabilitiesPDF } from "@/components/pdf/StudentDisabilitiesPDF";
import { ScheduleReportPDF } from "@/components/pdf/ScheduleReportPDF";

import { auth } from "@/lib/auth";
import { hasAllowedRole } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";
import { getReportPermissions } from "@/lib/report-permissions";

type PdfStream = Awaited<ReturnType<typeof renderToStream>>;
type PdfResponseBody = ConstructorParameters<typeof Response>[0];

type StudentGradeRecord = {
  courseId: string;
  course?: {
    name?: string | null;
  } | null;
  period: string;
  score: number | null;
};

type PivotedGrade = {
  courseName: string;
  p1: number | null;
  p2: number | null;
  p3: number | null;
  p4: number | null;
  final: number | null;
};

function toPdfResponseBody(stream: PdfStream): PdfResponseBody {
  return stream as unknown as PdfResponseBody;
}

export async function GET(request: NextRequest) {
  // Guard: requiere sesión activa
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }


  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const userRole = (session.user as { role?: string }).role;

    if (!type || !id) {
      return NextResponse.json(
        { error: "Faltan parámetros type o id" },
        { status: 400 },
      );
    }

    const allowedRoles = getReportPermissions(type);

    if (!allowedRoles) {
      return NextResponse.json(
        { error: "Tipo de PDF no soportado" },
        { status: 400 },
      );
    }

    if (!hasAllowedRole(userRole, allowedRoles)) {
      return new Response("Forbidden", { status: 403 });
    }

    let pdfStream;
    const auditPdf = () =>
      createAuditLog({
        action: AuditAction.GENERATE_PDF,
        entity: AuditEntity.PDF,
        entityId: id,
        newValue: {
          type,
          id,
        },
        metadata: {
          module: "pdf",
          query: Object.fromEntries(searchParams.entries()),
        },
        userId: session.user?.id ?? null,
        userEmail: session.user?.email ?? null,
        userRole: userRole ?? null,
        userAgent: request.headers.get("user-agent"),
        ip:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip"),
      });

    switch (type) {
      case "attendance": {
        // id = sectionId
        const mStr = searchParams.get("month");
        const yStr = searchParams.get("year");
        if (!mStr || !yStr)
          return NextResponse.json(
            { error: "Faltan mes y año" },
            { status: 400 },
          );

        const month = parseInt(mStr);
        const year = parseInt(yStr);

        const section = await prisma.section.findUnique({
          where: { id },
          include: { gradeLevel: true },
        });

        if (!section)
          return NextResponse.json(
            { error: "Sección no encontrada" },
            { status: 404 },
          );

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const enrollments = await prisma.enrollment.findMany({
          where: {
            sectionId: id,
            active: true,
          },
          include: {
            student: true,
            attendances: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: { date: "asc" },
            },
          },
          orderBy: { student: { lastName: "asc" } },
        });

        const students = enrollments.map((e) => ({
          ...e.student,
          attendances: e.attendances,
        }));
        const monthName = new Date(year, month - 1, 1).toLocaleString("es", {
          month: "long",
        });

        pdfStream = await renderToStream(
          <AttendanceSheetPDF
            section={section}
            year={year}
            month={month}
            monthName={monthName}
            students={students}
          />,
        );
        break;
      }

      case "receipt": {
        const payment = await prisma.payment.findUnique({
          where: { id },
          include: {
            concept: true,
            enrollment: {
              include: {
                student: true,
                section: { include: { gradeLevel: true } },
              },
            },
          },
        });
        if (!payment)
          return NextResponse.json(
            { error: "Pago no encontrado" },
            { status: 404 },
          );

        pdfStream = await renderToStream(
          <PaymentReceiptPDF payment={payment} />,
        );
        break;
      }

      case "enrollment": {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id },
          include: {
            student: true,
            academicYear: true,
            section: { include: { gradeLevel: true } },
          },
        });
        if (!enrollment)
          return NextResponse.json(
            { error: "Matrícula no encontrada" },
            { status: 404 },
          );

        pdfStream = await renderToStream(
          <EnrollmentCertificatePDF enrollment={enrollment} />,
        );
        break;
      }

      case "grades": {
        // id = enrollmentId
        const enrollment = await prisma.enrollment.findUnique({
          where: { id },
          include: {
            student: true,
            academicYear: true,
            section: { include: { gradeLevel: true } },
          },
        });
        if (!enrollment)
          return NextResponse.json(
            { error: "Matrícula no encontrada" },
            { status: 404 },
          );

        // Obtener historial de notas agrupado por curso
        const gradesRes = await getStudentGrades(id);
        const rawGrades =
          gradesRes.success && gradesRes.data ? gradesRes.data : [];

        // Pivotar la data para que cada curso tenga P1, P2, P3, P4 y Final
        const courseMap = new Map<string, PivotedGrade>();
        rawGrades.forEach((g: StudentGradeRecord) => {
          if (!courseMap.has(g.courseId)) {
            courseMap.set(g.courseId, {
              courseName: g.course?.name || "Desconocido",
              p1: null,
              p2: null,
              p3: null,
              p4: null,
              final: null,
            });
          }
          const c = courseMap.get(g.courseId);
          if (!c) return;
          if (g.period === "P1") c.p1 = g.score;
          if (g.period === "P2") c.p2 = g.score;
          if (g.period === "P3") c.p3 = g.score;
          if (g.period === "P4") c.p4 = g.score;
          if (g.period === "FINAL") c.final = g.score;
        });

        const pivotedGrades = Array.from(courseMap.values());

        pdfStream = await renderToStream(
          <GradeReportPDF
            student={enrollment.student}
            section={enrollment.section}
            academicYear={enrollment.academicYear}
            grades={pivotedGrades}
          />,
        );
        break;
      }

      case "student": {
        const student = await prisma.student.findUnique({
          where: { id },
          include: {
            guardians: true,
            enrollments: {
              where: { active: true },
              include: {
                section: { include: { gradeLevel: true } },
                academicYear: true,
              },
            },
          },
        });
        if (!student)
          return NextResponse.json(
            { error: "Estudiante no encontrado" },
            { status: 404 },
          );

        pdfStream = await renderToStream(<StudentInfoPDF student={student} />);
        break;
      }

      case "student-attendance": {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id },
          include: {
            student: true,
            academicYear: true,
            section: { include: { gradeLevel: true } },
            attendances: {
              orderBy: { date: "desc" },
            },
          },
        });
        if (!enrollment)
          return NextResponse.json(
            { error: "Matrícula no encontrada" },
            { status: 404 },
          );

        pdfStream = await renderToStream(
          <StudentAttendancePDF
            student={enrollment.student}
            enrollment={enrollment}
            attendances={enrollment.attendances}
          />,
        );
        break;
      }

      case "communication": {
        const announcement = await prisma.announcement.findUnique({
          where: { id },
        });
        if (!announcement)
          return NextResponse.json(
            { error: "Comunicado no encontrado" },
            { status: 404 },
          );

        pdfStream = await renderToStream(
          <CommunicationPDF announcement={announcement} />,
        );
        break;
      }
      case "incident": {
        const incident = await prisma.incident.findUnique({
          where: { id },
          include: {
            enrollment: {
              include: {
                student: true,
                section: { include: { gradeLevel: true } },
              },
            },
          },
        });

        if (!incident)
          return NextResponse.json(
            { error: "Incidencia no encontrada" },
            { status: 404 },
          );

        pdfStream = await renderToStream(
          <IncidentReportPDF incident={incident} />,
        );
        break;
      }
      case "student-incidents": {
        const enrollmentId = searchParams.get("id");
        if (!enrollmentId) return new Response("Missing id", { status: 400 });

        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            student: true,
            section: {
              include: {
                gradeLevel: true,
                academicYear: true,
              },
            },
            incidents: {
              orderBy: { date: "asc" },
              where: {
                enrollmentId: enrollmentId,
              },
            },
          },
        });

        if (!enrollment)
          return NextResponse.json(
            { error: "Matrícula no encontrada" },
            { status: 404 },
          );

        const stream = await renderToStream(
          <StudentIncidentsPDF enrollment={enrollment} />,
        );

        await auditPdf();
        return new Response(toPdfResponseBody(stream), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename=incidencias-${enrollment?.student?.lastName}.pdf`,
          },
        });
      }
      case "student-disabilities": {
        const enrollmentId = searchParams.get("id");
        if (!enrollmentId) return new Response("Missing id", { status: 400 });

        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            student: true,
            section: {
              include: {
                gradeLevel: true,
                academicYear: true,
              },
            },
            disabilities: {
              orderBy: { startDate: "asc" },
              where: {
                enrollmentId: enrollmentId,
              },
            },
          },
        });

        if (!enrollment)
          return NextResponse.json(
            { error: "Matrícula no encontrada" },
            { status: 404 },
          );

        const stream = await renderToStream(
          <StudentDisabilitiesPDF enrollment={enrollment} />,
        );

        await auditPdf();
        return new Response(toPdfResponseBody(stream), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename=inhabilitaciones-${enrollment?.student?.lastName}.pdf`,
          },
        });
      }

      case "student-schedule": {
        const enrollmentId = searchParams.get("id");
        if (!enrollmentId) return new Response("Missing id", { status: 400 });

        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            student: true,
            section: {
              include: {
                gradeLevel: true,
                academicYear: true,
              },
            },
          },
        });

        if (!enrollment)
          return NextResponse.json(
            { error: "Matrícula no encontrada" },
            { status: 404 },
          );

        const schedules = await prisma.schedule.findMany({
          where: { sectionId: enrollment.sectionId },
          include: {
            course: true,
            teacher: true,
          },
        });

        const stream = await renderToStream(
          <ScheduleReportPDF enrollment={enrollment} schedules={schedules} />,
        );

        await auditPdf();
        return new Response(toPdfResponseBody(stream), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename=horario-${enrollment.student.lastName}.pdf`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Tipo de PDF no soportado" },
          { status: 400 },
        );
    }

    await auditPdf();
    return new Response(toPdfResponseBody(pdfStream), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${type}-${id}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error interno al generar PDF" },
      { status: 500 },
    );
  }
}
