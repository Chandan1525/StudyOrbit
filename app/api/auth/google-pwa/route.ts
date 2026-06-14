// app/api/auth/google-pwa/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const credential = formData.get('credential');

    // 303 Redirect Google ke POST request ko GET mein convert kar deta hai taaki PWA load ho sake
    const url = req.nextUrl.clone();
    
    url.pathname = '/'; // 👈 Agar tumhara login page kisi aur route pe hai (jaise /auth/login), toh isko usse replace kar dena

    if (credential) {
      url.searchParams.set('credential', credential.toString());
    }
    return NextResponse.redirect(url, 303);
  } catch (e) {
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
}