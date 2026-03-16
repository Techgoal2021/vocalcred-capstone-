import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma, normalizePhone } from "@/lib/db"



export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // We don't need the server config anymore because we override the send function
      sendVerificationRequest: async ({ identifier, url, provider, theme }) => {
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "VocalCred <onboarding@resend.dev>",
              to: [identifier],
              subject: "Sign in to VocalCred",
              html: `<body style="font-family: sans-serif; padding: 20px;"><h2>VocalCred Access</h2><a href="${url}" style="padding: 10px 20px; background: #3b82f6; color: white; border-radius: 5px; text-decoration: none;">Sign in securely</a></body>`
            })
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Resend delivery failed: ${errorText}`);
          }
        } else {
           console.log(`\n\n=========================================================`);
           console.log(`📬 MAGIC LINK GENERATED FOR: ${identifier}`);
           console.log(`You do not have SMTP configured. Click the link below to verify:`);
           console.log(`👉 ${url} 👈`);
           console.log(`=========================================================\n\n`);
        }
      }
    }),
    CredentialsProvider({
      id: "admin-login",
      name: 'Admin Login',
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple hardcoded password for MVP admin access
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          // PrismaAdapter sometimes silently drops JWTs that lack an email structure
          return { id: "admin", name: "System Admin", email: "admin@vocalcred.ai", role: "admin" }
        }
        return null
      }
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: 'Phone OTP',
      credentials: {
        phone: { label: "Phone Number", type: "text" },
        code: { label: "Verification Code", type: "text" },
        role: { label: "Role", type: "text" },
        businessName: { label: "Business Name", type: "text" },
        businessType: { label: "Business Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const cleanPhone = normalizePhone(credentials.phone);
        const cleanCode = credentials.code.trim();

        console.log(`[AUTH] Verifying OTP: ${cleanCode} for ${cleanPhone}`);

        // Find the most recent OTP for this number
        const otpRecord = await prisma.otpCode.findFirst({
          where: {
            phone: cleanPhone,
            code: cleanCode
          },
          orderBy: { createdAt: 'desc' }
        });

        const now = new Date();
        if (!otpRecord || otpRecord.expires < now) {
            console.error(`[AUTH FAILED] OTP Mismatch or Expired for ${cleanPhone}.`);
            if (otpRecord) {
              console.error(`- Found code: ${otpRecord.code} (Expires: ${otpRecord.expires instanceof Date ? otpRecord.expires.toISOString() : otpRecord.expires})`);
            }
            console.error(`- Got: ${cleanCode}`);
            console.error(`- Current Server Time: ${now.toISOString()}`);
            
            throw new Error("Invalid or expired verification code");
        }

        // Find or create the user via phone number
        let user = await prisma.user.findUnique({
          where: { phone: cleanPhone }
        });

        if (!user) {
          // If no role is provided, this is a login attempt for an unknown user
          if (!credentials.role) {
            console.error(`Unregistered access attempt for ${cleanPhone}`);
            throw new Error("unregistered_number");
          }

          // Registration Flow: Create user if role is provided
          const role = credentials.role === "CLIENT" ? "CLIENT" : "ARTISAN";
          const prefix = role === "CLIENT" ? "VP" : "VC";
          
          try {
            // Generate a more unique ID using date + random to avoid collisions
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const vocalcred_id = `${prefix}-${randomSuffix}`;
            
            user = await prisma.user.create({
              data: { 
                phone: cleanPhone,
                email: `${cleanPhone.replace('+', '')}@vocalcred.local`,
                vocalcred_id: vocalcred_id,
                role: role,
                name: credentials.businessName || (role === "CLIENT" ? `Partner (${cleanPhone.slice(-4)})` : `Artisan (${cleanPhone.slice(-4)})`),
                businessName: role === "CLIENT" ? (credentials.businessName || "Business") : null,
                businessType: role === "CLIENT" ? (credentials.businessType || "General") : null
              }
            });
            console.log(`[AUTH] Created new ${role}: ${user.vocalcred_id}`);
          } catch (createErr) {
            console.error("[AUTH FAILED] User creation error:", createErr);
            throw new Error("Registration failed. Please try again.");
          }
        }

        // SUCCESS: OTP is valid AND User is found/created. 
        // Now we can safeley delete the OTP.
        await prisma.otpCode.deleteMany({
          where: { phone: cleanPhone }
        });

        return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      }
    })
  ],
  session: {
    strategy: "jwt", // Required to use CredentialsProvider with an Adapter
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verifyRequest=1', // Custom redirect after magic link sent
  },
  debug: true, // Turn on raw console logs
  callbacks: {
    async session({ session, token }) {
      if (token?.role) {
         session.user.role = token.role;
      }
      if (token?.phone) {
         session.user.phone = token.phone;
      }
      if (token?.sub) {
         session.user.id = token.sub;
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || "ARTISAN"; // Default to ARTISAN if email sign in
        token.phone = user.phone;
      }
      return token
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
