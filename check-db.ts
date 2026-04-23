import prisma from './src/config/db';

async function checkStaff() {
    const staff = await prisma.staff.findMany({
        select: {
            email: true,
            role: true,
            companyId: true
        }
    });
    console.log('--- STAFF IN DB ---');
    console.table(staff);
    process.exit(0);
}

checkStaff();
