import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const credential = formData.get('credential');

    const url = req.nextUrl.clone();
    
    // 🔥 YAHAN CHANGE KARNA HAI: Isey apne exact login page ke path par set karo
    url.pathname = '/auth/login'; 

    if (credential) {
      url.searchParams.set('credential', credential.toString());
    }
    return NextResponse.redirect(url, 303);
  } catch (e) {
    // 🔥 Yahan bhi fallback path update kar do
    return NextResponse.redirect(new URL('/auth/login', req.url), 303);
  }
}