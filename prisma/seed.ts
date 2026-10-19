import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: 'hugo', password: 'Hugo@123', nombre: 'Hugo', nombreCompleto: 'Hugo Goncalvez', debeCambiarPassword: false },
    { username: 'ester', password: 'Est654', nombre: 'Ester', nombreCompleto: 'Ester Troche', debeCambiarPassword: false },
    { username: 'jose', password: 'Jose123', nombre: 'José', nombreCompleto: 'José Vieira', debeCambiarPassword: true },
    { username: 'raquel', password: 'Raquel123', nombre: 'Raquel', nombreCompleto: 'Raquel De Moraiz', debeCambiarPassword: true },
    { username: 'karina', password: 'Karina123', nombre: 'Karina', nombreCompleto: 'Karina Amarilla', debeCambiarPassword: true },
    { username: 'milagros', password: 'Milagros123', nombre: 'Milagros', nombreCompleto: 'Milagros Monllor', debeCambiarPassword: true },
    { username: 'edgar', password: 'Edgar123', nombre: 'Edgar', nombreCompleto: 'Edgar Maciel', debeCambiarPassword: true },
    { username: 'franco', password: 'Franco123', nombre: 'Franco', nombreCompleto: 'Franco Chavez', debeCambiarPassword: true },
    { username: 'dana', password: 'Dana123', nombre: 'Dana', nombreCompleto: 'Dana Rios', debeCambiarPassword: true },
    { username: 'lisandro', password: 'Lisandro123', nombre: 'Lisandro', nombreCompleto: 'Lisandro Ripoll', debeCambiarPassword: true },
    { username: 'maricel', password: 'Maricel123', nombre: 'Maricel', nombreCompleto: 'Maricel Rodriguez', debeCambiarPassword: true },
    { username: 'claudia', password: 'Claudia123', nombre: 'Claudia', nombreCompleto: 'Claudia Franke', debeCambiarPassword: true },
  ];

  for (const u of users) {
    const existing = await prisma.usuario.findUnique({ where: { username: u.username } });
    if (existing) {
      console.log('Usuario ya existe:', u.username);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.usuario.create({
      data: {
        username: u.username,
        password: passwordHash,
        nombre: u.nombre,
        nombreCompleto: u.nombreCompleto,
        debeCambiarPassword: u.debeCambiarPassword,
        rol: 'ADMIN',
      },
    });
    console.log('Usuario creado:', user.username);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
