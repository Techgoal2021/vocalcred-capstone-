import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get('image');
    const caption = formData.get('caption');
    const type = formData.get('type') || 'PRODUCT';

    if (!image) {
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const fileName = `${Date.now()}_${image.name.replace(/\s/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    // Find the user to get their ID
    const user = await prisma.user.findUnique({
      where: { phone: session.user.phone }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the portfolio item
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        userId: user.id,
        imageUrl,
        caption: caption || undefined,
        type: type.toString(),
      }
    });

    return NextResponse.json({ success: true, item: portfolioItem });

  } catch (error) {
    console.error("Portfolio Upload Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
