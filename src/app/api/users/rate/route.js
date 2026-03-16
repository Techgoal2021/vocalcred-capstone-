import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // 0. Only Partners (CLIENT) and Admins can rate artisans
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'CLIENT')) {
      return NextResponse.json({ error: 'Unauthorized. Only partners can submit ratings.' }, { status: 401 });
    }

    const formData = await req.formData();
    const phone = formData.get("phone");
    const ratingStr = formData.get("rating");
    const audioBlob = formData.get("audio");

    if (!phone || !ratingStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newRating = parseInt(ratingStr);

    // 1. Fetch current artisan to recalculate averages
    const artisan = await prisma.user.findUnique({
      where: { phone },
    });

    if (!artisan) {
      return NextResponse.json({ error: "Artisan not found" }, { status: 404 });
    }

    // 2. Compute Reputation Analytics: Recalculate Average Rating and Reputation
    // Assuming jobs_completed roughly correlates to number of ratings for demo purposes
    const currentJobs = artisan.jobs_completed || 0;
    const currentAvg = artisan.avg_rating || 0;
    
    // (Current Avg * Current Total + New Rating) / (Current Total + 1)
    const newJobs = currentJobs + 1;
    const recalculatedAvg = ((currentAvg * currentJobs) + newRating) / newJobs;
    
    // Slight reputation bump per rating, weighted by star count
    const reputationBump = (newRating - 3) * 10; // 5 star = +20, 1 star = -20
    const newReputation = Math.min(850, Math.max(300, (artisan.reputation || 500) + reputationBump));

    // 3. Save the Audio File to the Next.js `public` directory
    if (audioBlob) {
      const buffer = Buffer.from(await audioBlob.arrayBuffer());
      const publicPath = path.join(process.cwd(), "public", `voice_${phone}.webm`);
      await writeFile(publicPath, buffer);
    }

    // 4. Update the Artisan in Database
    const updatedUser = await prisma.user.update({
      where: { phone },
      data: {
        avg_rating: recalculatedAvg,
        jobs_completed: newJobs,
        reputation: newReputation,
        has_voice: !!audioBlob || artisan.has_voice, // Keep true if they already had it
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing rating:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
