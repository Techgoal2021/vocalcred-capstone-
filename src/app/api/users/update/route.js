import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Authenticate the user
    if (!session || !session.user?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, skill, businessName, businessType, language, bio, instagram, twitter, website } = await req.json();

    // 2. Update the user record
    // We update by phone because that's our unique identifier in the session
    const updatedUser = await prisma.user.update({
      where: { phone: session.user.phone },
      data: {
        name: name || undefined,
        skill: skill || undefined,
        businessName: businessName || undefined,
        businessType: businessType || undefined,
        language: language || undefined,
        bio: bio !== undefined ? bio : undefined,
        instagram: instagram !== undefined ? instagram : undefined,
        twitter: twitter !== undefined ? twitter : undefined,
        website: website !== undefined ? website : undefined,
      },
    });

    console.log(`[API] Profile updated for ${session.user.phone}: ${updatedUser.name}`);

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('API Error (Update User):', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
