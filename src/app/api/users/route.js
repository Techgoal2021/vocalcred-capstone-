import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Protect API Route: Allow admin, CLIENT (Partners), and ARTISAN roles to reach the API
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'CLIENT' && session.user.role !== 'ARTISAN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let usersDb;
    
    if (session.user.role === 'ARTISAN') {
      // Artisans can ONLY see themselves (Privacy)
      usersDb = await prisma.user.findMany({
        where: { phone: session.user.phone },
        include: {
          portfolio: true,
          achievements: true,
        }
      });
    } else {
      // Admins and Clients (Partners) see the community network (Artisans only)
      usersDb = await prisma.user.findMany({
        where: { 
          role: 'ARTISAN',
          vocalcred_id: { not: null }
        },
        include: {
          portfolio: true,
          achievements: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    return NextResponse.json(usersDb);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
