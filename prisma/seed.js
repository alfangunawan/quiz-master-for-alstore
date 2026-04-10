const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@quizmaster.com" },
    update: {},
    create: {
      name: "Admin QuizMaster",
      email: "admin@quizmaster.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Sample User
  const userPassword = await bcrypt.hash("user1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@quizmaster.com" },
    update: {},
    create: {
      name: "Peserta Demo",
      email: "user@quizmaster.com",
      password: userPassword,
      role: "USER",
    },
  });
  console.log(`✅ User created: ${user.email}`);

  // Create Sample Quiz 1 - Sejarah Indonesia
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Quiz Sejarah Indonesia",
      description: "Uji pengetahuanmu tentang sejarah kemerdekaan Indonesia!",
      category: "Sejarah",
      code: "HIST01",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(),
      showLiveBoard: true,
      allowGuest: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            type: "MULTIPLE_CHOICE",
            text: "Kapan Indonesia menyatakan kemerdekaan?",
            options: [
              { id: "a", text: "17 Agustus 1945", isCorrect: true },
              { id: "b", text: "1 Juni 1945", isCorrect: false },
              { id: "c", text: "28 Oktober 1928", isCorrect: false },
              { id: "d", text: "10 November 1945", isCorrect: false },
            ],
            explanation: "Indonesia menyatakan kemerdekaan pada 17 Agustus 1945, diproklamasikan oleh Soekarno dan Hatta.",
            timeLimit: 30,
            points: 1000,
            order: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            text: "Siapakah presiden pertama Indonesia?",
            options: [
              { id: "a", text: "Ir. Soekarno", isCorrect: true },
              { id: "b", text: "Moh. Hatta", isCorrect: false },
              { id: "c", text: "Soeharto", isCorrect: false },
              { id: "d", text: "B.J. Habibie", isCorrect: false },
            ],
            explanation: "Ir. Soekarno adalah presiden pertama Republik Indonesia.",
            timeLimit: 20,
            points: 1000,
            order: 2,
          },
          {
            type: "TRUE_FALSE",
            text: "Sumpah Pemuda diikrarkan pada tahun 1928.",
            options: [
              { id: "a", text: "Benar", isCorrect: true },
              { id: "b", text: "Salah", isCorrect: false },
            ],
            explanation: "Sumpah Pemuda diikrarkan pada 28 Oktober 1928 oleh para pemuda dari berbagai suku bangsa.",
            timeLimit: 15,
            points: 1000,
            order: 3,
          },
          {
            type: "MULTIPLE_CHOICE",
            text: "Apa nama kerajaan Hindu terbesar di Nusantara?",
            options: [
              { id: "a", text: "Majapahit", isCorrect: true },
              { id: "b", text: "Sriwijaya", isCorrect: false },
              { id: "c", text: "Mataram", isCorrect: false },
              { id: "d", text: "Singhasari", isCorrect: false },
            ],
            explanation: "Majapahit adalah kerajaan Hindu terbesar di Nusantara yang mencapai puncak kejayaan di masa Hayam Wuruk.",
            timeLimit: 30,
            points: 1000,
            order: 4,
          },
          {
            type: "SHORT_ANSWER",
            text: "Di kota mana Proklamasi Kemerdekaan Indonesia dibacakan?",
            options: [
              { id: "a", text: "Jakarta", isCorrect: true },
            ],
            explanation: "Proklamasi dibacakan di Jl. Pegangsaan Timur No. 56, Jakarta.",
            timeLimit: 20,
            points: 1000,
            order: 5,
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz1.title} (code: ${quiz1.code})`);

  // Create Sample Quiz 2 - Matematika Dasar
  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Matematika Dasar",
      description: "Quiz matematika sederhana untuk mengasah otak!",
      category: "Matematika",
      code: "MATH01",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(),
      showLiveBoard: true,
      allowGuest: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            type: "MULTIPLE_CHOICE",
            text: "Berapakah hasil dari 15 × 8?",
            options: [
              { id: "a", text: "120", isCorrect: true },
              { id: "b", text: "100", isCorrect: false },
              { id: "c", text: "130", isCorrect: false },
              { id: "d", text: "115", isCorrect: false },
            ],
            timeLimit: 15,
            points: 1000,
            order: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            text: "Jika x + 5 = 12, berapakah nilai x?",
            options: [
              { id: "a", text: "7", isCorrect: true },
              { id: "b", text: "5", isCorrect: false },
              { id: "c", text: "8", isCorrect: false },
              { id: "d", text: "6", isCorrect: false },
            ],
            explanation: "x = 12 - 5 = 7",
            timeLimit: 20,
            points: 1000,
            order: 2,
          },
          {
            type: "TRUE_FALSE",
            text: "Luas lingkaran dengan jari-jari r adalah πr².",
            options: [
              { id: "a", text: "Benar", isCorrect: true },
              { id: "b", text: "Salah", isCorrect: false },
            ],
            timeLimit: 15,
            points: 1000,
            order: 3,
          },
          {
            type: "SHORT_ANSWER",
            text: "Berapakah akar kuadrat dari 144?",
            options: [
              { id: "a", text: "12", isCorrect: true },
            ],
            explanation: "√144 = 12, karena 12 × 12 = 144",
            timeLimit: 20,
            points: 1000,
            order: 4,
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz2.title} (code: ${quiz2.code})`);

  // Create Sample Quiz 3 - Teknologi
  const quiz3 = await prisma.quiz.create({
    data: {
      title: "Quiz Teknologi & Internet",
      description: "Seberapa tahukah kamu tentang dunia teknologi?",
      category: "Teknologi",
      code: "TECH01",
      visibility: "PUBLIC",
      status: "ACTIVE",
      publishedAt: new Date(),
      showLiveBoard: true,
      allowGuest: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            type: "MULTIPLE_CHOICE",
            text: "Siapa pendiri Facebook?",
            options: [
              { id: "a", text: "Mark Zuckerberg", isCorrect: true },
              { id: "b", text: "Elon Musk", isCorrect: false },
              { id: "c", text: "Bill Gates", isCorrect: false },
              { id: "d", text: "Jeff Bezos", isCorrect: false },
            ],
            timeLimit: 15,
            points: 1000,
            order: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            text: "Apa kepanjangan dari HTML?",
            options: [
              { id: "a", text: "HyperText Markup Language", isCorrect: true },
              { id: "b", text: "High Tech Modern Language", isCorrect: false },
              { id: "c", text: "Home Tool Markup Language", isCorrect: false },
              { id: "d", text: "HyperText Machine Language", isCorrect: false },
            ],
            timeLimit: 20,
            points: 1000,
            order: 2,
          },
          {
            type: "TRUE_FALSE",
            text: "JavaScript dan Java adalah bahasa pemrograman yang sama.",
            options: [
              { id: "a", text: "Benar", isCorrect: false },
              { id: "b", text: "Salah", isCorrect: true },
            ],
            explanation: "JavaScript dan Java adalah dua bahasa pemrograman yang berbeda.",
            timeLimit: 15,
            points: 1000,
            order: 3,
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz3.title} (code: ${quiz3.code})`);

  console.log("\n🎉 Seeding selesai!");
  console.log("\n📋 Akun Login:");
  console.log("   Admin: admin@quizmaster.com / admin123");
  console.log("   User:  user@quizmaster.com / user1234");
  console.log("\n🎯 Quiz Codes:");
  console.log("   HIST01 - Quiz Sejarah Indonesia");
  console.log("   MATH01 - Matematika Dasar");
  console.log("   TECH01 - Quiz Teknologi & Internet");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
